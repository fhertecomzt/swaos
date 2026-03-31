<?php
session_start();
require '../conexion.php';
header('Content-Type: application/json; charset=utf-8');

$id_taller = $_SESSION['taller_id'] ?? 1;

try {
    // Unimos (JOIN) el Kardex con las tablas de Productos y Usuarios para traer nombres en lugar de puros IDs
    $sql = "SELECT 
                k.id_movimiento, 
                DATE_FORMAT(k.fecha_movimiento, '%d/%m/%Y %H:%i') as fecha,
                p.codebar_prod, 
                p.nombre_prod, 
                k.tipo_movimiento, 
                k.cantidad, 
                k.stock_anterior, 
                k.stock_nuevo, 
                k.motivo, 
                u.usuario
            FROM kardex_inventario k
            INNER JOIN productos p ON k.id_prod = p.id_prod
            INNER JOIN usuarios u ON k.id_usuario = u.id_usuario
            WHERE k.id_taller = ?
            ORDER BY k.id_movimiento DESC
            LIMIT 300"; // Traemos los últimos 300 movimientos para que cargue ultra rápido

    $stmt = $dbh->prepare($sql);
    $stmt->execute([$id_taller]);
    $resultados = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($resultados);
} catch (Exception $e) {
    echo json_encode(['error' => 'Error de BD: ' . $e->getMessage()]);
}
