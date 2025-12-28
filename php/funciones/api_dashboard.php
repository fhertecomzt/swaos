<?php
header('Content-Type: application/json');
require '../conexion.php';

// Consulta para contar los registros en las tablas relevantes
try {
  
  $productos = $dbh->query("SELECT COUNT(*) as total FROM productos WHERE estatus = 0")->fetch(PDO::FETCH_ASSOC)['total'];
  $clientes = $dbh->query("SELECT COUNT(*) as total FROM clientes")->fetch(PDO::FETCH_ASSOC)['total'];
  $proveedores = $dbh->query("SELECT COUNT(*) as total FROM proveedores")->fetch(PDO::FETCH_ASSOC)['total'];
  $ventas = $dbh->query("SELECT COUNT(*) as total FROM ventas")->fetch(PDO::FETCH_ASSOC)['total'];

  echo json_encode([
    'productos' => $productos,
    'clientes' => $clientes,
    'proveedores' => $proveedores,
    'ventas' => $ventas
  ]);
} catch (PDOException $e) {
  echo json_encode(['error' => 'Error en la conexión a la base de datos']);
  echo json_encode(['error' => $e->getMessage()]);
}
