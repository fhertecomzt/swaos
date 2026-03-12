<?php
session_start();
require '../conexion.php'; 
header('Content-Type: application/json');

// Tomamos el taller de la sesión para ver solo nuestro inventario (por defecto 1)
$id_taller = $_SESSION['taller_id'] ?? 1;

try {
  // Buscamos productos activos que tengan stock mayor a 0 en esta sucursal
  $sql = "SELECT p.id_prod, p.codebar_prod, p.nombre_prod, p.precio AS p_venta, i.stock 
            FROM productos p
            JOIN inventario_sucursal i ON p.id_prod = i.id_prod
            WHERE p.estatus = 0 AND i.idtaller = ? AND i.stock > 0
            ORDER BY p.nombre_prod ASC";

  $stmt = $dbh->prepare($sql);
  $stmt->execute([$id_taller]);
  $productos = $stmt->fetchAll(PDO::FETCH_ASSOC);

  echo json_encode($productos);
} catch (Exception $e) {
  echo json_encode(['error' => 'Error BD: ' . $e->getMessage()]);
}
