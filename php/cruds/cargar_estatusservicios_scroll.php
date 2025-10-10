<?php
require '../conexion.php';

$page = isset($_GET['page']) ? intval($_GET['page']) : 1;
$limit = 3; // Cantidad de roles que se mostraran 
$offset = ($page - 1) * $limit;

$sql = "SELECT * FROM estadosservicios WHERE estatus = :estatus LIMIT :limit OFFSET :offset";

$stmt = $dbh->prepare($sql);
$stmt->bindValue(':estatus', 0, PDO::PARAM_INT); //Solo trae activos
$stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
$stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
$stmt->execute();
$estadosservicios = $stmt->fetchAll(PDO::FETCH_ASSOC);

header('Content-Type: application/json');
echo json_encode($estadosservicios, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
