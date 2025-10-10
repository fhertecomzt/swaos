<?php
require '../conexion.php';

$estatus = isset($_GET['estatus']) ? $_GET['estatus'] : '';
$limit = isset($_GET['limit']) ? intval($_GET['limit']) : 10;
$offset = isset($_GET['offset']) ? intval($_GET['offset']) : 0;

$params = [];
$sql = "SELECT u.idusuario, u.usuario, u.nombre, u.appaterno, u.apmaterno, u.imagen, u.comision, u.estatus, r.nomrol, t.nomtienda
        FROM usuarios u
        JOIN roles r ON u.idrol = r.idrol
        JOIN tiendas t ON u.sucursales_id = t.idtienda";

// Filtro por estatus
if ($estatus === 'activo') {
  $sql .= " WHERE u.estatus = 0 AND r.nomrol = 'SISTEMAS'";
} elseif ($estatus === 'inactivo') {
  $sql .= " WHERE u.estatus = 1 AND r.nomrol = 'SISTEMAS'";
} else {
  // Si es "todos", también omitir lOS rolES "SISTEMAS Y VENTAS"
  $sql .= " WHERE r.nomrol != 'GERENCIA' AND r.nomrol != 'VENTAS'";
}

// Paginación
$sql .= " LIMIT $limit OFFSET $offset";

$stmt = $dbh->prepare($sql);
$stmt->execute();
$usuarios = $stmt->fetchAll(PDO::FETCH_ASSOC);

// Enviar respuesta en JSON
header('Content-Type: application/json');
echo json_encode($usuarios, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
