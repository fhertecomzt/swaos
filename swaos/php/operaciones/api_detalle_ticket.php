<?php
session_start();
require '../conexion.php';
header('Content-Type: application/json');

$id_venta = $_GET['id'] ?? 0;

try {
    // Buscamos solo los productos físicos (id_producto no es NULL) que tengan cantidad mayor a 0
    $sql = "SELECT id_detalle, id_producto, concepto, cantidad, precio_unitario 
            FROM detalle_ventas 
            WHERE id_venta = :id_venta AND id_producto IS NOT NULL AND cantidad > 0";

    $stmt = $dbh->prepare($sql);
    $stmt->execute([':id_venta' => $id_venta]);
    $detalles = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($detalles);
} catch (Exception $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
