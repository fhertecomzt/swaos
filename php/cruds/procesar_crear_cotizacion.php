<?php
session_start();
header("Content-Type: application/json");
require '../conexion.php';

$datos = json_decode(file_get_contents('php://input'), true);

if (!$datos || empty($datos['carrito'])) {
    echo json_encode(['success' => false, 'message' => 'No hay productos a cotizar.']);
    exit;
}

$idCotizacion = $datos['id_cotizacion'] ?? 0; // <--- ¿Es nueva o edición?
$idCliente = $datos['id_cliente'] ?? 0;
$total = $datos['total'] ?? 0;
$observaciones = '';
$idTaller = $_SESSION['taller_id'] ?? 1;
$idUsuario = $_SESSION['idusuario'] ?? 1;

try {
    $dbh->beginTransaction();

    if ($idCotizacion > 0) {
        // ES UNA EDICIÓN (UPDATE)
        $stmtCot = $dbh->prepare("UPDATE cotizaciones SET id_cliente = ?, total = ? WHERE id_cotizacion = ?");
        $stmtCot->execute([$idCliente, $total, $idCotizacion]);

        // Borramos los detalles viejos y metemos los nuevos limpios
        $stmtDel = $dbh->prepare("DELETE FROM detalle_cotizaciones WHERE id_cotizacion = ?");
        $stmtDel->execute([$idCotizacion]);

        $idFinal = $idCotizacion;
    } else {
        // ES UNA NUEVA (INSERT)
        $stmtCot = $dbh->prepare("INSERT INTO cotizaciones (id_taller, id_usuario, id_cliente, total, observaciones) VALUES (?, ?, ?, ?, ?)");
        $stmtCot->execute([$idTaller, $idUsuario, $idCliente, $total, $observaciones]);
        $idFinal = $dbh->lastInsertId();
    }

    // Insertar Detalles (Aplica para ambas acciones)
    $stmtDetalle = $dbh->prepare("INSERT INTO detalle_cotizaciones (id_cotizacion, id_producto, concepto, cantidad, precio_unitario, subtotal) VALUES (?, ?, ?, ?, ?, ?)");

    foreach ($datos['carrito'] as $item) {
        $idProd = $item['id_prod_real'] ?? null;
        $concepto = $item['nombre'];
        $cantidad = $item['cantidad'];
        $precio = $item['precio'];
        $subtotal = $cantidad * $precio;

        $stmtDetalle->execute([$idFinal, $idProd, $concepto, $cantidad, $precio, $subtotal]);
    }

    $dbh->commit();
    echo json_encode(['success' => true, 'id_cotizacion' => $idFinal]);
} catch (Exception $e) {
    $dbh->rollBack();
    echo json_encode(['success' => false, 'message' => 'Error en BD: ' . $e->getMessage()]);
}
