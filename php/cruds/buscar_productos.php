<?php
require_once "../conexion.php";

// Obtenemos los valores de 'q' (búsqueda) y 'estatus' de la URL, si existen
$q = isset($_GET['q']) ? trim($_GET['q']) : '';
$estatus = isset($_GET['estatus']) ? trim($_GET['estatus']) : '';

// Iniciamos la sesión para obtener el ID de la tienda
if (session_status() === PHP_SESSION_NONE) {
  session_start();
}
$idTienda = $_SESSION['idtienda'];

// Construimos la consulta SQL
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
            inventario_sucursal invsuc ON p.idproducto = invsuc.idproducto AND invsuc.idtienda = :idtienda
        WHERE 1=1 "; // Condición siempre verdadera

// Si hay un término de búsqueda, añadir la condición de búsqueda
if (!empty($q)) {
  $sql .= " AND (UPPER(p.nom_prod) LIKE :q OR UPPER(p.codbar_prod) LIKE :q) ";
}

// Si se pasa un estatus, agregar el filtro de estatus a la consulta
if ($estatus !== '') {
  $sql .= " AND p.estatus = :estatus ";
}

try {
  // Preparamos la consulta
  $stmt = $dbh->prepare($sql);

  // Creamos el array de parámetros
  $params = [':idtienda' => $idTienda];

  // Añadimos el parámetro de búsqueda si es necesario
  if (!empty($q)) {
    $params[':q'] = "%" . $q . "%";
  }

  // Añadimos el parámetro de estatus si es necesario
  if ($estatus !== '') {
    $params[':estatus'] = $estatus;
  }

  error_log("Consulta preparada: " . $sql . " | Parámetros: " . json_encode($params)); // Log con parámetros
  $stmt->execute($params);
  $productos = $stmt->fetchAll(PDO::FETCH_ASSOC);
  error_log("Consulta ejecutada. Resultados: " . count($productos));
  echo json_encode($productos);
} catch (PDOException $e) {
  error_log("Error PDO: " . $e->getMessage() . ". SQL: " . $sql); // Incluir la SQL en el error
  echo "Error PDO: " . $e->getMessage();
  exit();
}
