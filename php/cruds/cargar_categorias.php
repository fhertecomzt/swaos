<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

require '../conexion.php';

$estatus = isset($_GET['estatus']) ? $_GET['estatus'] : '';
$limit = isset($_GET['limit']) ? intval($_GET['limit']) : 10;
$offset = isset($_GET['offset']) ? intval($_GET['offset']) : 0;

$params = [];
$sql = "SELECT * FROM categorias";

if ($estatus === 'activo') {
  $sql .= " WHERE estatus = 0";
} elseif ($estatus === 'inactivo') {
  $sql .= " WHERE estatus = 1";
}

// Imprimir la consulta SQL para depuración
//file_put_contents('debug_sql.log', $sql . PHP_EOL, FILE_APPEND);

// SI NO hay filtro, aplicar paginación
if ($estatus === '') {
  $sql .= " LIMIT $limit OFFSET $offset";
}

// Imprimir consulta final antes de ejecutar
//file_put_contents('debug_sql.log', $sql . PHP_EOL, FILE_APPEND);

$stmt = $dbh->prepare($sql);
$stmt->execute();
$roles = $stmt->fetchAll(PDO::FETCH_ASSOC);


// Verificar qué roles se están enviando al cliente
//file_put_contents('debug_sql.log', json_encode($roles, JSON_PRETTY_PRINT) . PHP_EOL, FILE_APPEND);

// Enviar respuesta en JSON
header('Content-Type: application/json');
echo json_encode($roles, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
