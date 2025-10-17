<?php
include "../conexion.php";

if (isset($_POST['colonia']) && is_numeric($_POST['colonia'])) {
  $idColonia = $_POST['colonia'];

  // Seleccionamos el Código Postal (CP) de la colonia específica
  $sql = "SELECT codigo_postal 
          FROM colonias 
          WHERE id = :colonia 
          LIMIT 1"; // Solo necesitamos uno

  $stmt = $dbh->prepare($sql);
  $stmt->bindParam(':colonia', $idColonia, PDO::PARAM_INT);
  $stmt->execute();

  $colonia = $stmt->fetch(PDO::FETCH_ASSOC);

  // Devolvemos el array que contiene el código_postal
  header('Content-Type: application/json');
  echo json_encode($colonia ? $colonia : ["codigo_postal" => ""]); // Devuelve el CP o un string vacío si no encuentra
} else {
  // Enviar un objeto vacío para evitar errores
  echo json_encode(["codigo_postal" => ""]);
}
