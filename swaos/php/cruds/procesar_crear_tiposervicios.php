<?php
// procesar_crear.php
include "../conexion.php";

$response = ["success" => false, "message" => ""];

// Validar campos obligatorios
if (
  !empty($_POST['tiposervicios']) && !empty($_POST['desc_tiposervicios'])
) {
  // Sanitización básica
  $tiposervicios = htmlspecialchars($_POST['tiposervicios']);
  $desc_tiposervicios = htmlspecialchars($_POST['desc_tiposervicios']);
  $estatus = htmlspecialchars($_POST['estatus']);

  // Ejecutar la inserción
  try {
    $stmt = $dbh->prepare("INSERT INTO tiposervicios (nom_servicio, desc_servicio, estatus) 
                               VALUES (?, ?, ?)");
    $stmt->execute([$tiposervicios, $desc_tiposervicios, $estatus]);

    $lastId = $dbh->lastInsertId();

    $response["success"] = true;
    $response["message"] = "Tipo de servicio fue creado exitosamente.";
    $response["tiposervicios"] = [
      "id" => $lastId,
      "nombre" => $tiposervicios,
      "descripcion" => $desc_tiposervicios,
      "estatus" => $estatus
    ];
  } catch (PDOException $e) {
    // Respuesta genérica en caso de error
    $response["message"] = "Hubo un error al procesar la solicitud. Intente más tarde.";
  }
} else {
  $response["message"] = "Todos los campos son obligatorios.";
}

echo json_encode($response);
