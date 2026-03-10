<?php
session_start();
require "../conexion.php";

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $id_orden = $_POST['id_orden'] ?? 0;
    $id_estado_servicio = $_POST['id_estado_servicio'] ?? '';
    $diagnostico = $_POST['diagnostico'] ?? '';
    $costo_servicio = $_POST['costo_servicio'] ?? 0;
    $anticipo_servicio = $_POST['anticipo_servicio'] ?? 0;

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
    $dbh->beginTransaction();

    try {
        // 1. Actualizamos la orden
        $sql = "UPDATE ordenesservicio 
                SET id_estado_servicio = ?, diagnostico = ?, costo_servicio = ?, anticipo_servicio = ?, saldo_servicio = ?
                WHERE id_orden = ?";
        $stmt = $dbh->prepare($sql);
        $stmt->execute([$id_estado_servicio, $diagnostico, $costo_servicio, $anticipo_total, $saldo_servicio, $id_orden]);

        //ACTUALIZAR REFACCIONES Y STOCK
        $id_taller = $_SESSION['id_taller'] ?? 1;

        // 1. Devolver al inventario las piezas que tenía antes esta orden (para evitar descuadres)
        $stmtViejas = $dbh->prepare("SELECT id_prod, cantidad FROM orden_refacciones WHERE id_orden = :id_orden");
        $stmtViejas->execute([':id_orden' => $id_orden]);
        $piezasViejas = $stmtViejas->fetchAll(PDO::FETCH_ASSOC);

        foreach ($piezasViejas as $pieza) {
            $stmtReturn = $dbh->prepare("UPDATE inventario_sucursal SET stock = stock + :cant WHERE id_prod = :id_prod AND idtaller = :idtaller");
            $stmtReturn->execute([
                ':cant' => $pieza['cantidad'],
                ':id_prod' => $pieza['id_prod'],
                ':idtaller' => $id_taller
            ]);
        }

        // 2. Limpiar la tabla intermedia de esta orden para reconstruirla
        $dbh->prepare("DELETE FROM orden_refacciones WHERE id_orden = :id_orden")->execute([':id_orden' => $id_orden]);

        // 3. Insertar las nuevas piezas y descontar el stock actualizado
        if (isset($_POST['refacciones_id']) && is_array($_POST['refacciones_id'])) {
            for ($i = 0; $i < count($_POST['refacciones_id']); $i++) {
                $id_p = $_POST['refacciones_id'][$i];
                $cant = $_POST['refacciones_cant'][$i];
                $precio = $_POST['refacciones_precio'][$i];
                $subtotal = $cant * $precio;

                // Insertar en orden_refacciones
                $stmtInsertRef = $dbh->prepare("INSERT INTO orden_refacciones (id_orden, id_prod, cantidad, precio_unitario, subtotal) VALUES (:id_orden, :id_prod, :cantidad, :precio, :subtotal)");
                $stmtInsertRef->execute([
                    ':id_orden' => $id_orden,
                    ':id_prod' => $id_p,
                    ':cantidad' => $cant,
                    ':precio' => $precio,
                    ':subtotal' => $subtotal
                ]);

                // Descontar del inventario real de la sucursal
                $stmtDeduct = $dbh->prepare("UPDATE inventario_sucursal SET stock = stock - :cant WHERE id_prod = :id_prod AND idtaller = :idtaller");
                $stmtDeduct->execute([
                    ':cant' => $cant,
                    ':id_prod' => $id_p,
                    ':idtaller' => $id_taller
                ]);
            }
        }

        // REGISTRO DE PAGO (NUEVO ABONO)
        if (isset($_POST['nuevo_abono']) && $_POST['nuevo_abono'] > 0) {
            $nuevo_abono = floatval($_POST['nuevo_abono']);
            $metodo_pago = $_POST['id_metodo_pago'] ?? 1; // Efectivo por defecto

        $stmtPago = $dbh->prepare("INSERT INTO historial_pagos (id_orden, monto, id_metodo_pago, id_usuario, fecha) VALUES (?, ?, ?, ?, NOW())");
        $stmtPago->execute([$id_orden, $nuevo_abono, $metodo_pago, $_SESSION['id_usuario']]);
        }

        // 2. Si hay dinero de por medio, registramos el abono para el corte de caja
        // REGISTRO DE PAGO (NUEVO ABONO)
        if ($nuevo_abono > 0) {
            $id_usuario = $_SESSION['id_usuario'] ?? 1;
            $metodo_pago = $_POST['id_metodo_pago'] ?? 1;

            $sqlAbono = "INSERT INTO abonos_ordenes (id_orden, monto_abono, id_usuario, id_metpago, fecha_abono) VALUES (?, ?, ?, ?, NOW())";
            $stmtAbono = $dbh->prepare($sqlAbono);
            $stmtAbono->execute([$id_orden, $nuevo_abono, $id_usuario, $metodo_pago]);
        }

        $dbh->commit();

        echo json_encode(['success' => true, 'message' => 'Orden actualizada y abonos guardados correctamente.']);
    } catch (Exception $e) {
        $dbh->rollBack();
        echo json_encode(['success' => false, 'message' => 'Error al actualizar: ' . $e->getMessage()]);
    }
}