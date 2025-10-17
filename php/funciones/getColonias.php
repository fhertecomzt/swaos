<?php
include "../conexion.php";

if (isset($_POST['municipio']) && is_numeric($_POST['municipio'])) {
  $idMunicipio = $_POST['municipio'];

  // ✅ CORRECCIÓN: Seleccionar de la tabla 'colonias'
  // Nota: Si tu campo en la tabla 'colonias' se llama 'id_municipio' o diferente, ajústalo aquí.
  $sql = "SELECT id, nombre FROM colonias WHERE municipio = :municipio ORDER BY nombre ASC";
  $stmt = $dbh->prepare($sql);
  $stmt->bindParam(':municipio', $idMunicipio, PDO::PARAM_INT);
  $stmt->execute();

  // Es buena práctica renombrar la variable para mayor claridad
  $colonias = $stmt->fetchAll(PDO::FETCH_ASSOC);

  // Asegúrate de que estás enviando el JSON
  header('Content-Type: application/json');
  echo json_encode($colonias, JSON_UNESCAPED_UNICODE);
} else {
  echo json_encode([/*...*/]);
}