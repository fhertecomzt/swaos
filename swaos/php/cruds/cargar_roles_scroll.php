<?php
require '../conexion.php';

$page = isset($_GET['page']) ? intval($_GET['page']) : 1;
$limit = 3; // Cantidad de roles que se mostraran 
$offset = ($page - 1) * $limit;

$sql = "SELECT * FROM roles WHERE estatus_rol = :estatus LIMIT :limit OFFSET :offset";

$stmt = $dbh->prepare($sql);
$stmt->bindValue(':estatus', 0, PDO::PARAM_INT); //Solo trae activos
$stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
$stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
$stmt->execute();
$roles = $stmt->fetchAll(PDO::FETCH_ASSOC);

header('Content-Type: application/json');
echo json_encode($roles, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
