<?php
session_start();
require '../conexion.php'; 
header('Content-Type: application/json');

try {
  // Traemos a todos los clientes activos, ordenados alfabéticamente
  // Ajusta los nombres de las columnas ('id_cliente', 'nombre', 'telefono') según tu base de datos
  $sql = "SELECT id_cliente, nombre_cliente AS nombre, papellido_cliente AS papellido, tel_cliente AS telefono FROM clientes WHERE estatus = 0 ORDER BY nombre_cliente ASC";
  $stmt = $dbh->prepare($sql);
  $stmt->execute();
  $clientes = $stmt->fetchAll(PDO::FETCH_ASSOC);

  echo json_encode($clientes);
} catch (Exception $e) {
  echo json_encode(['error' => $e->getMessage()]);
}
