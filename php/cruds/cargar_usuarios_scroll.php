<?php
require '../conexion.php';

$page = isset($_GET['page']) ? intval($_GET['page']) : 1;
$limit = 5; // Cantidad de usuarios que se mostraran 
$offset = ($page - 1) * $limit;

$sql = "SELECT u.idusuario, u.usuario, u.nombre, u.appaterno, u.apmaterno, u.imagen, u.comision, u.estatus, r.nomrol, t.nomtienda
        FROM usuarios u
        JOIN roles r ON u.idrol = r.idrol
        JOIN tiendas t ON u.sucursales_id = t.idtienda WHERE u.estatus = :estatus ORDER BY u.idusuario ASC LIMIT :limit OFFSET :offset";

$stmt = $dbh->prepare($sql);
$stmt->bindValue(':estatus', 0, PDO::PARAM_INT); //Solo trae activos
$stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
$stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
$stmt->execute();
$usuarios = $stmt->fetchAll(PDO::FETCH_ASSOC);

header('Content-Type: application/json');
echo json_encode($usuarios, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT); //************ */