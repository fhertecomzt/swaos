<?php

require '../conexion.php';

$estatus = isset($_GET['estatus']) ? $_GET['estatus'] : '';
$limit = isset($_GET['limit']) ? intval($_GET['limit']) : 10;
$offset = isset($_GET['offset']) ? intval($_GET['offset']) : 0;

$params = [];
$sql = "SELECT * FROM clientes";

if ($estatus === 'activo') {
  $sql .= " WHERE estatus = 0";
} elseif ($estatus === 'inactivo') {
  $sql .= " WHERE estatus = 1";
}

// SI NO hay filtro, aplicar paginación
if ($estatus === '') {
  $sql .= " LIMIT $limit OFFSET $offset";
}

$stmt = $dbh->prepare($sql);
$stmt->execute();
$tiendas = $stmt->fetchAll(PDO::FETCH_ASSOC);

// Enviar respuesta en JSON
header('Content-Type: application/json');
echo json_encode($tiendas, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
