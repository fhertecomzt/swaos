<?php
// cruds/buscar_clientes_select.php
require "../conexion.php";

$q = $_GET['q'] ?? '';

header('Content-Type: application/json');

if (strlen($q) < 2) {
  echo json_encode([]); // No buscar si escriben menos de 2 letras
  exit;
}

try {
  // Buscamos por nombre, apellido o teléfono
  $sql = "SELECT id_cliente, nombre_cliente, papellido_cliente, tel_cliente 
            FROM clientes 
            WHERE estatus = 0 
            AND (nombre_cliente LIKE :q OR papellido_cliente LIKE :q OR tel_cliente LIKE :q)
            LIMIT 10"; // Solo traemos 10 para no saturar

  $stmt = $dbh->prepare($sql);
  $param = "%$q%";
  $stmt->bindParam(':q', $param, PDO::PARAM_STR);
  $stmt->execute();

  $resultados = $stmt->fetchAll(PDO::FETCH_ASSOC);
  echo json_encode($resultados);
} catch (Exception $e) {
  echo json_encode([]);
}
