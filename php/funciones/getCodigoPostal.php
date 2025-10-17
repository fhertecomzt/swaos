<?php
include "../conexion.php";

if (isset($_POST['colonia']) && is_numeric($_POST['colonia'])) {
  $idColonia = $_POST['colonia'];

  $sql = "SELECT DISTINCT codigo_postal AS id, codigo_postal AS nombre 
          FROM colonias 
          WHERE id = :colonia"; // Usamos 'id' para filtrar por la colonia seleccionada

  $stmt = $dbh->prepare($sql);
  $stmt->bindParam(':colonia', $idColonia, PDO::PARAM_INT);
  $stmt->execute();

  $codigos_postales = $stmt->fetchAll(PDO::FETCH_ASSOC);

  header('Content-Type: application/json');
  echo json_encode($codigos_postales, JSON_UNESCAPED_UNICODE);
} else {
  // Enviar una lista vacía para evitar errores
  echo json_encode([]);
}
