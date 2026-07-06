<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

require '../conexion.php';

$estatus = isset($_GET['estatus']) ? $_GET['estatus'] : '';
$limit = isset($_GET['limit']) ? intval($_GET['limit']) : 10;
$offset = isset($_GET['offset']) ? intval($_GET['offset']) : 0;

$params = [];
$sql = "SELECT * FROM estadosservicios";

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
$estadosservicios = $stmt->fetchAll(PDO::FETCH_ASSOC);


// Verificar qué roles se están enviando al cliente
// Enviar respuesta en JSON
header('Content-Type: application/json');
echo json_encode($estadosservicios, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
