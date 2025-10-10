<?php
if (session_status() === PHP_SESSION_NONE) {
  session_start();
}
error_reporting(E_ALL);
ini_set('display_errors', 1);

require '../conexion.php';

$estatus = isset($_GET['estatus']) ? $_GET['estatus'] : '';
$limit = isset($_GET['limit']) ? intval($_GET['limit']) : 10;
$offset = isset($_GET['offset']) ? intval($_GET['offset']) : 0;

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

// Siempre aplicar la paginación, independientemente del filtro
$sql .= " LIMIT :limit OFFSET :offset";

// Imprimir consulta final antes de ejecutar (para depuración)
// file_put_contents('debug_sql.log', $sql . PHP_EOL, FILE_APPEND);

$stmt = $dbh->prepare($sql);

// Bind de los parámetros
$stmt->bindParam(':idtienda', $idTienda, PDO::PARAM_INT);
$stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
$stmt->bindParam(':offset', $offset, PDO::PARAM_INT);

$stmt->execute();
$productos = $stmt->fetchAll(PDO::FETCH_ASSOC);

// Verificar qué productos se están enviando al cliente (para depuración)
// file_put_contents('debug_sql.log', json_encode($productos, JSON_PRETTY_PRINT) . PHP_EOL, FILE_APPEND);

// Enviar respuesta en JSON
header('Content-Type: application/json');
echo json_encode($productos, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
