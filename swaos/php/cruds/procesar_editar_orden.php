<?php
session_start();
require "../conexion.php";

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $id_orden = $_POST['id_orden'] ?? 0;
    $id_estado_servicio = $_POST['id_estado_servicio'] ?? '';
    $diagnostico = $_POST['diagnostico'] ?? '';
    $costo_servicio = $_POST['costo_servicio'] ?? 0;
    $anticipo_servicio = $_POST['anticipo_servicio'] ?? 0;

    // ---  RECALCULAR EL TOTAL REAL ---
    $mano_de_obra = floatval($costo_servicio);
    $total_refacciones = 0;

    // Sumar todas las piezas que vienen en el formulario
    if (isset($_POST['refacciones_id']) && is_array($_POST['refacciones_id'])) {
        for ($i = 0; $i < count($_POST['refacciones_id']); $i++) {
            $cant = floatval($_POST['refacciones_cant'][$i]);
            $precio = floatval($_POST['refacciones_precio'][$i]);
            $total_refacciones += ($cant * $precio);
        }
    }

    // El verdadero Costo Total que se va a guardar ($1050)
    $costo_total_real = $mano_de_obra + $total_refacciones;

    $nuevo_abono = floatval($_POST['nuevo_abono'] ?? 0);
    $anticipo_actual = floatval($_POST['anticipo_servicio'] ?? 0);

    // Sumamos la historia más el dinero nuevo
    $anticipo_total = $anticipo_actual + $nuevo_abono;
    $saldo_servicio = floatval($costo_servicio) - $anticipo_total;

    // --- REGLA DE NEGOCIO DEL SALDO (Ajustar tu ID de entregado aquí) ---
    $id_estado_entregado = 2;
    if ($id_estado_servicio == $id_estado_entregado && $saldo_servicio > 0) {
        echo json_encode(['success' => false, 'message' => 'Seguridad: No se puede entregar si hay un saldo pendiente de $' . number_format($saldo_servicio, 2)]);
        exit;
    }

    // Iniciamos la Transacción SQL
    // EL GUARDIA DE SEGURIDAD (Blindaje Multi-Sucursal)
    $id_taller_sesion = $_SESSION['taller_id'] ?? 1;

    $stmtCheck = $dbh->prepare("SELECT id_orden FROM ordenesservicio WHERE id_orden = ? AND id_taller = ?");
    $stmtCheck->execute([$id_orden, $id_taller_sesion]);
    if (!$stmtCheck->fetch()) {
        echo json_encode(['success' => false, 'message' => '⛔ Acceso denegado: Esta orden pertenece a otra sucursal.']);
        exit;
    }

    // Iniciamos la Transacción SQL
    $dbh->beginTransaction();

    // Usamos el Total Real para el Saldo
    $saldo_servicio = $costo_total_real - $anticipo_total;

    try {
        // 1. Actualizamos la orden
        $sql = "UPDATE ordenesservicio 
            SET id_estado_servicio = ?, diagnostico = ?, costo_servicio = ?, anticipo_servicio = ?, saldo_servicio = ?
            WHERE id_orden = ? AND id_taller = ?";
        $stmt = $dbh->prepare($sql);
        // ATENCIÓN AQUÍ: Pasamos $costo_total_real
        $stmt->execute([$id_estado_servicio, $diagnostico, $costo_total_real, $anticipo_total, $saldo_servicio, $id_orden, $id_taller_sesion]);

        // ACTUALIZAR REFACCIONES Y KARDEX (ALGORITMO INTELIGENTE)
        $id_taller = $_SESSION['taller_id'] ?? 1;
        $id_usuario = $_SESSION['id_usuario'] ?? $_SESSION['idusuario'] ?? 1;

        // 1. Obtener las piezas que ya estaban en la orden (FOTOGRAFÍA VIEJA)
        $stmtViejas = $dbh->prepare("SELECT id_prod, cantidad FROM orden_refacciones WHERE id_orden = :id_orden");
        $stmtViejas->execute([':id_orden' => $id_orden]);
        $piezasViejas = $stmtViejas->fetchAll(PDO::FETCH_ASSOC);

        $stock_viejo = [];
        foreach ($piezasViejas as $pieza) {
            $id_p = $pieza['id_prod'];
            $stock_viejo[$id_p] = isset($stock_viejo[$id_p]) ? $stock_viejo[$id_p] + $pieza['cantidad'] : $pieza['cantidad'];
        }

        // 2. Leer las piezas que vienen del formulario (FOTOGRAFÍA NUEVA)
        $stock_nuevo_req = [];
        if (isset($_POST['refacciones_id']) && is_array($_POST['refacciones_id'])) {
            for ($i = 0; $i < count($_POST['refacciones_id']); $i++) {
                $id_p = $_POST['refacciones_id'][$i];
                $cant = floatval($_POST['refacciones_cant'][$i]);
                if ($id_p > 0) {
                    $stock_nuevo_req[$id_p] = isset($stock_nuevo_req[$id_p]) ? $stock_nuevo_req[$id_p] + $cant : $cant;
                }
            }
        }

        // 3. Unir todos los IDs de productos involucrados para compararlos
        $todos_productos = array_unique(array_merge(array_keys($stock_viejo), array_keys($stock_nuevo_req)));

        // Preparamos las herramientas de la base de datos
        $stmtStockAnt = $dbh->prepare("SELECT stock FROM inventario_sucursal WHERE id_prod = ? AND idtaller = ? FOR UPDATE");
        $stmtUpdateInv = $dbh->prepare("UPDATE inventario_sucursal SET stock = ? WHERE id_prod = ? AND idtaller = ?");
        $stmtKardex = $dbh->prepare("INSERT INTO kardex_inventario (id_prod, id_taller, id_usuario, tipo_movimiento, cantidad, stock_anterior, stock_nuevo, motivo) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");

        // 4. Calcular DIFERENCIAS y afectar el Kardex
        foreach ($todos_productos as $id_p) {
            $cant_vieja = $stock_viejo[$id_p] ?? 0;
            $cant_nueva = $stock_nuevo_req[$id_p] ?? 0;

            // Ej: Había 1 pieza, ahora pides 2. Diferencia = +1 (Tenemos que sacar 1 pieza del inventario)
            // Ej: Había 2 piezas, ahora pides 0. Diferencia = -2 (Tenemos que regresar 2 piezas al inventario)
            $diferencia = $cant_nueva - $cant_vieja;

            if ($diferencia != 0) {
                // Hay un cambio real. Bloqueamos la fila y vemos el stock actual
                $stmtStockAnt->execute([$id_p, $id_taller]);
                $stock_actual_inv = floatval($stmtStockAnt->fetchColumn());

                // Calculamos cómo quedará el almacén real
                $stock_final_inv = $stock_actual_inv - $diferencia;

                // Actualizamos Inventario físico
                $stmtUpdateInv->execute([$stock_final_inv, $id_p, $id_taller]);

                // Guardamos el comprobante en el Kardex
                $tipo_mov = ($diferencia > 0) ? 'Salida' : 'Entrada';
                $cant_kardex = abs($diferencia);
                $motivo = ($diferencia > 0) ? "Uso de refacción en Orden #$id_orden" : "Devolución de pieza retirada en Orden #$id_orden";

                $stmtKardex->execute([$id_p, $id_taller, $id_usuario, $tipo_mov, $cant_kardex, $stock_actual_inv, $stock_final_inv, $motivo]);
            }
        }

        // 5. Reconstruir la tabla visual de la orden (orden_refacciones)
        $dbh->prepare("DELETE FROM orden_refacciones WHERE id_orden = :id_orden")->execute([':id_orden' => $id_orden]);

        if (isset($_POST['refacciones_id']) && is_array($_POST['refacciones_id'])) {
            $stmtInsertRef = $dbh->prepare("INSERT INTO orden_refacciones (id_orden, id_prod, cantidad, precio_unitario, subtotal) VALUES (:id_orden, :id_prod, :cantidad, :precio, :subtotal)");

            for ($i = 0; $i < count($_POST['refacciones_id']); $i++) {
                $id_p = $_POST['refacciones_id'][$i];
                $cant = floatval($_POST['refacciones_cant'][$i]);
                $precio = floatval($_POST['refacciones_precio'][$i]);
                $subtotal = $cant * $precio;

                if ($id_p > 0) {
                    $stmtInsertRef->execute([
                        ':id_orden' => $id_orden,
                        ':id_prod' => $id_p,
                        ':cantidad' => $cant,
                        ':precio' => $precio,
                        ':subtotal' => $subtotal
                    ]);
                }
            }
        }
        // REGISTRO DE PAGO (NUEVO ABONO)
        if ($nuevo_abono > 0) {
            $id_usuario = $_SESSION['idusuario'] ?? 1;
            $metodo_pago = $_POST['id_metodo_pago'] ?? 1;

            $sqlAbono = "INSERT INTO abonos_ordenes (id_orden, monto_abono, id_usuario, id_metpago, fecha_abono) VALUES (?, ?, ?, ?, NOW())";
            $stmtAbono = $dbh->prepare($sqlAbono);
            $stmtAbono->execute([$id_orden, $nuevo_abono, $id_usuario, $metodo_pago]);

            // REGISTRO EN LA CAJA GENERAL (ventas)
            $tipo_movimiento = ($saldo_servicio <= 0) ? 'Liquidacion Orden' : 'Abono Orden';
            $metodo_texto = ($metodo_pago == 1) ? 'Efectivo' : (($metodo_pago == 2) ? 'Tarjeta' : 'Transferencia');

            // GENERADOR DE FOLIOS PARA EL TICKET DE VENTA
            $stmtFolioVen = $dbh->prepare("SELECT MAX(folio_sucursal) FROM ventas WHERE id_taller = ?");
            $stmtFolioVen->execute([$id_taller_sesion]);
            $ultimo_folio_ven = $stmtFolioVen->fetchColumn();
            $nuevo_folio_venta = ($ultimo_folio_ven) ? $ultimo_folio_ven + 1 : 1;

            // Buscamos de quién es esta orden Y SU FOLIO VISUAL para el concepto
            $stmtBuscaCliente = $dbh->prepare("SELECT id_cliente, folio_sucursal FROM ordenesservicio WHERE id_orden = ?");
            $stmtBuscaCliente->execute([$id_orden]);
            $infoOrden = $stmtBuscaCliente->fetch(PDO::FETCH_ASSOC);
            $id_cliente_real = $infoOrden ? $infoOrden['id_cliente'] : null;
            $folio_orden_visual = $infoOrden ? $infoOrden['folio_sucursal'] : $id_orden;

            // Creamos el ticket inyectando el id_taller y su nuevo_folio_venta
            $stmtVenta = $dbh->prepare("INSERT INTO ventas (id_taller, folio_sucursal, id_cliente, id_usuario, id_orden, total, metodo_pago, tipo_movimiento) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
            $stmtVenta->execute([$id_taller_sesion, $nuevo_folio_venta, $id_cliente_real, $id_usuario, $id_orden, $nuevo_abono, $metodo_texto, $tipo_movimiento]);
            $id_venta = $dbh->lastInsertId();

            // Especificamos el concepto usando el folio bonito (Ej. Abono Orden #000001)
            $concepto = $tipo_movimiento . " #" . str_pad($folio_orden_visual, 6, "0", STR_PAD_LEFT);
            $stmtDetalle = $dbh->prepare("INSERT INTO detalle_ventas (id_venta, concepto, cantidad, precio_unitario, subtotal) VALUES (?, ?, 1, ?, ?)");
            $stmtDetalle->execute([$id_venta, $concepto, $nuevo_abono, $nuevo_abono]);
        }

        $dbh->commit();

        echo json_encode(['success' => true, 'message' => 'Orden actualizada y abonos guardados correctamente.']);
    } catch (Exception $e) {
        $dbh->rollBack();
        echo json_encode(['success' => false, 'message' => 'Error al actualizar: ' . $e->getMessage()]);
    }
}
