<?php
session_start();
// Iniciamos sesión para saber en qué taller estamos
$id_taller_sesion = $_SESSION['taller_id'] ?? 1;

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

    $folio_respuesta = 0; // Guardaremos el folio para mandarlo al JS

    if ($idCotizacion > 0) {
        // ======================================================================
        // 🛡️ GUARDIA DE SEGURIDAD (EDICIÓN)
        // ======================================================================
        $stmtCheck = $dbh->prepare("SELECT folio_sucursal FROM cotizaciones WHERE id_cotizacion = ? AND id_taller = ?");
        $stmtCheck->execute([$idCotizacion, $idTaller]);
        $cot_existente = $stmtCheck->fetch(PDO::FETCH_ASSOC);

        if (!$cot_existente) {
            echo json_encode(['success' => false, 'message' => '⛔ Acceso denegado: Esta cotización es de otra sucursal.']);
            exit;
        }

        $folio_respuesta = $cot_existente['folio_sucursal'];

        // ES UNA EDICIÓN (UPDATE) BLINDADA
        $stmtCot = $dbh->prepare("UPDATE cotizaciones SET id_cliente = ?, total = ? WHERE id_cotizacion = ? AND id_taller = ?");
        $stmtCot->execute([$idCliente, $total, $idCotizacion, $idTaller]);

        // Borramos los detalles viejos y metemos los nuevos limpios
        $stmtDel = $dbh->prepare("DELETE FROM detalle_cotizaciones WHERE id_cotizacion = ?");
        $stmtDel->execute([$idCotizacion]);

        $idFinal = $idCotizacion;
    } else {
        // ======================================================================
        // 🌟 GENERADOR DE FOLIOS INDEPENDIENTES (NUEVA)
        // ======================================================================
        $stmtFolioCot = $dbh->prepare("SELECT MAX(folio_sucursal) FROM cotizaciones WHERE id_taller = ?");
        $stmtFolioCot->execute([$idTaller]);
        $ultimo_folio_cot = $stmtFolioCot->fetchColumn();
        $nuevo_folio_cot = ($ultimo_folio_cot) ? $ultimo_folio_cot + 1 : 1;

        $folio_respuesta = $nuevo_folio_cot;

        // ES UNA NUEVA (INSERT) CON SU FOLIO INDEPENDIENTE
        $stmtCot = $dbh->prepare("INSERT INTO cotizaciones (id_taller, folio_sucursal, id_usuario, id_cliente, total, observaciones) VALUES (?, ?, ?, ?, ?, ?)");
        $stmtCot->execute([$idTaller, $nuevo_folio_cot, $idUsuario, $idCliente, $total, $observaciones]);
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
    echo json_encode(['success' => true, 'id_cotizacion' => $idFinal, 'folio_sucursal' => $folio_respuesta]);
} catch (Exception $e) {
    $dbh->rollBack();
    echo json_encode(['success' => false, 'message' => 'Error en BD: ' . $e->getMessage()]);
}
