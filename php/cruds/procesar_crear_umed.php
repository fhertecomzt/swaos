<?php
// procesar_crear.php
include "../conexion.php";

$response = ["success" => false, "message" => ""];

// Validar campos obligatorios
if (
  !empty($_POST['umed']) && !empty($_POST['desc_umed'])
) {
  // Sanitización básica
  $umed = htmlspecialchars($_POST['umed']);
  $desc_umed = htmlspecialchars($_POST['desc_umed']);

  // Ejecutar la inserción
  try {
    $stmt = $dbh->prepare("INSERT INTO umedidas (nomumedida, descumedida) 
                               VALUES (?, ?)");
    $stmt->execute([$umed, $desc_umed]);

    $lastId = $dbh->lastInsertId();

    $response["success"] = true;
    $response["message"] = "U. medida fue creada exitosamente.";
    $response["umed"] = [
      "id" => $lastId,
      "nombre" => $umed,
      "descripcion" => $desc_umed
    ];
  } catch (PDOException $e) {
    // Respuesta genérica en caso de error
    $response["message"] = "Hubo un error al procesar la solicitud. Intente más tarde.";
  }
} else {
  $response["message"] = "Todos los campos son obligatorios.";
}

echo json_encode($response);
