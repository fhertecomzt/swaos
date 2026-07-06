<?php
session_start();
require '../conexion.php';
header('Content-Type: application/json');

$id_venta = $_POST['id_venta'] ?? null;
$id_usuario = $_SESSION['id_usuario'] ?? $_SESSION['idusuario'] ?? 1;
$id_taller = $_SESSION['taller_id'] ?? 1;

if (!$id_venta) {
    echo json_encode(['success' => false, 'mensaje' => 'No se recibió el folio.']);
    exit;
}

try {
    $dbh->beginTransaction();

    $sqlOrig = "SELECT total, metodo_pago FROM ventas WHERE id_venta = :id_venta";
    $stmtOrig = $dbh->prepare($sqlOrig);
    $stmtOrig->execute([':id_venta' => $id_venta]);
    $ticket = $stmtOrig->fetch(PDO::FETCH_ASSOC);

    // BLINDAJE: Analizar entradas y salidas EXACTAS del cajero en el TURNO ACTUAL (id_corte IS NULL)
    $metodo = strtolower(trim($ticket['metodo_pago']));
    if ($metodo === 'efectivo' || $metodo === '1' || $metodo === '') {

        // Sincronizado exactamente con el Corte de Caja
        $sqlCaja = "SELECT 
                    SUM(CASE WHEN tipo_movimiento LIKE '%Venta%' OR tipo_movimiento LIKE '%Abono%' OR tipo_movimiento LIKE '%Anticipo%' OR tipo_movimiento LIKE '%Ingreso%' THEN total ELSE 0 END) AS entradas,
                    SUM(CASE WHEN tipo_movimiento LIKE '%Retiro%' OR tipo_movimiento LIKE '%Corte%' OR tipo_movimiento LIKE '%Salida%' THEN total ELSE 0 END) AS salidas
                    FROM ventas 
                    WHERE id_usuario = :user AND id_corte IS NULL AND LOWER(metodo_pago) IN ('efectivo', '1', '')";

        $stmtCaja = $dbh->prepare($sqlCaja);
        $stmtCaja->execute([':user' => $id_usuario]);
        $flujo = $stmtCaja->fetch(PDO::FETCH_ASSOC);

        $entradas = $flujo['entradas'] ? floatval($flujo['entradas']) : 0;
        $salidas = $flujo['salidas'] ? floatval($flujo['salidas']) : 0;
        $efectivo_disponible = $entradas - $salidas;

        if ($efectivo_disponible < floatval($ticket['total'])) {
            throw new Exception("CAJA BLOQUEADA. Tienes en turno: $" . number_format($efectivo_disponible, 2) . " (Entró: $" . number_format($entradas, 2) . " - Salió: $" . number_format($salidas, 2) . ") | Ocupas $" . number_format($ticket['total'], 2));
        }
    }

    // REGISTRAR RETIRO CONTABLE
    $sqlVenta = "UPDATE ventas SET estatus = 'Cancelada' WHERE id_venta = :id_venta";
    $stmtVenta = $dbh->prepare($sqlVenta);
    $stmtVenta->execute([':id_venta' => $id_venta]);

    $concepto_retiro = "Retiro: Devolucion Ticket #" . $id_venta;
    $sqlRetiro = "INSERT INTO ventas (id_usuario, total, metodo_pago, tipo_movimiento, estatus) 
                  VALUES (:user, :total, :pago, :movimiento, 'Completada')";
    $stmtRetiro = $dbh->prepare($sqlRetiro);
    $stmtRetiro->execute([
        ':user' => $id_usuario,
        ':total' => $ticket['total'],
        ':pago' => $ticket['metodo_pago'],
        ':movimiento' => $concepto_retiro
    ]);

    // REGRESAR INVENTARIO
    $sqlDetalles = "SELECT id_producto, cantidad FROM detalle_ventas WHERE id_venta = :id_venta AND id_producto IS NOT NULL";
    $stmtDetalles = $dbh->prepare($sqlDetalles);
    $stmtDetalles->execute([':id_venta' => $id_venta]);
    $productos = $stmtDetalles->fetchAll(PDO::FETCH_ASSOC);

    if (count($productos) > 0) {
        $sqlStock = "UPDATE inventario_sucursal SET stock = stock + :cantidad WHERE id_prod = :id_producto AND idtaller = :idtaller";
        $stmtStock = $dbh->prepare($sqlStock);
        foreach ($productos as $prod) {
            $stmtStock->execute([
                ':cantidad' => $prod['cantidad'],
                ':id_producto' => $prod['id_producto'],
                ':idtaller' => $id_taller
            ]);
        }
    }

    $dbh->commit();
    echo json_encode(['success' => true, 'mensaje' => 'Venta anulada. Retiro generado por $' . number_format($ticket['total'], 2)]);
} catch (Exception $e) {
    $dbh->rollBack();
    echo json_encode(['success' => false, 'mensaje' => $e->getMessage()]);
}
