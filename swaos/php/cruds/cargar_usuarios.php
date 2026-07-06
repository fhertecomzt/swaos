<?php
require '../conexion.php';

$estatus = isset($_GET['estatus']) ? $_GET['estatus'] : '';
$limit = isset($_GET['limit']) ? intval($_GET['limit']) : 10;
$offset = isset($_GET['offset']) ? intval($_GET['offset']) : 0;

$params = [];
$sql = "SELECT u.id_usuario, u.usuario, u.nombre, u.p_appellido, u.s_appellido, u.email, u.imagen, u.estatus, r.nom_rol, t.nombre_t
        FROM usuarios u
        JOIN roles r ON u.id_rol = r.id_rol
        JOIN talleres t ON u.taller_id = t.id_taller";

// Filtro por estatus
if ($estatus === 'activo') {
  $sql .= " WHERE u.estatus = 0 AND r.nom_rol != 'superusuario' ORDER BY u.id_usuario ASC";
} elseif ($estatus === 'inactivo') {
  $sql .= " WHERE u.estatus = 1 AND r.nom_rol != 'superusuario' ORDER BY u.id_usuario ASC";
} else {
  // Si es "todos", también omitir el rol "SISTEMAS"
  $sql .= " WHERE r.nom_rol != 'superusuario' ORDER BY u.id_usuario ASC" ;
}

// Paginación
$sql .= " LIMIT $limit OFFSET $offset";

$stmt = $dbh->prepare($sql);
$stmt->execute();
$usuarios = $stmt->fetchAll(PDO::FETCH_ASSOC);

// Enviar respuesta en JSON
header('Content-Type: application/json');
echo json_encode($usuarios, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
