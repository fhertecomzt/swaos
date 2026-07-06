<?php
if (session_status() === PHP_SESSION_NONE) {
  session_start();
}
require '../conexion.php';

$page = isset($_GET['page']) ? intval($_GET['page']) : 1;
$limit = 10;
$offset = ($page - 1) * $limit;

$estatus = isset($_GET['estatus']) ? $_GET['estatus'] : '';

$sql = "SELECT
            p.idproducto,
            p.codbar_prod,
            p.nom_prod,
            p.costo_compra_prod,
            p.precio1_venta_prod,
            p.imagen,
            p.stock_minimo,
            invsuc.stock,
            p.estatus
        FROM
            productos p
        LEFT JOIN
            inventario_sucursal invsuc ON p.idproducto = invsuc.idproducto AND invsuc.idtienda = :idtienda";

$idTienda = $_SESSION['idtienda'];
$params = [':idtienda' => $idTienda];

if ($estatus === 'activo') {
  $sql .= " WHERE p.estatus = 0";
} elseif ($estatus === 'inactivo') {
  $sql .= " WHERE p.estatus = 1";
}

// Siempre aplicar la paginación
$sql .= " LIMIT :limit OFFSET :offset";
$params[':limit'] = $limit;
$params[':offset'] = $offset;

$stmt = $dbh->prepare($sql);

// Bind de los parámetros
$stmt->bindParam(':idtienda', $idTienda, PDO::PARAM_INT);
$stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
$stmt->bindParam(':offset', $offset, PDO::PARAM_INT);

$stmt->execute();
$productos = $stmt->fetchAll(PDO::FETCH_ASSOC);

header('Content-Type: application/json');
echo json_encode($productos, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
