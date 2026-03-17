<?php
session_start();
header("Content-Type: application/json");
require '../conexion.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Método no permitido.']);
    exit;
}

$id_cotizacion = $_POST['id_cotizacion'] ?? 0;

if (empty($id_cotizacion)) {
    echo json_encode(['success' => false, 'message' => 'Folio de cotización no válido.']);
    exit;
}

try {
    // Hacemos el UPDATE para cambiar el estatus
    $stmt = $dbh->prepare("UPDATE cotizaciones SET estatus = 'Cancelada' WHERE id_cotizacion = ?");
    $stmt->execute([$id_cotizacion]);

    // Verificamos si realmente se modificó alguna fila
    if ($stmt->rowCount() > 0) {
        echo json_encode(['success' => true, 'message' => 'La cotización ha sido cancelada exitosamente.']);
    } else {
        echo json_encode(['success' => false, 'message' => 'No se encontró la cotización o ya estaba cancelada.']);
    }
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Error en BD: ' . $e->getMessage()]);
}
