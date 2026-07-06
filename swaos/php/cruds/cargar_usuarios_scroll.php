<?php
require '../conexion.php';

$page = isset($_GET['page']) ? intval($_GET['page']) : 1;
$limit = 5; // Cantidad de usuarios que se mostraran 
$offset = ($page - 1) * $limit;

$sql = "SELECT u.id_usuario, u.usuario, u.nombre, u.p_appellido, u.s_appellido, u.imagen, u.estatus, r.nom_rol, t.nombre_t
        FROM usuarios u
        JOIN roles r ON u.id_rol = r.id_rol
        JOIN talleres t ON u.taller_id = t.id_taller WHERE u.estatus = :estatus ORDER BY u.id_usuario ASC LIMIT :limit OFFSET :offset";

$stmt = $dbh->prepare($sql);
$stmt->bindValue(':estatus', 0, PDO::PARAM_INT); //Solo trae activos
$stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
$stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
$stmt->execute();
$usuarios = $stmt->fetchAll(PDO::FETCH_ASSOC);

header('Content-Type: application/json');
echo json_encode($usuarios, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT); //************ */