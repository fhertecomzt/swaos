<?php
include "../conexion.php";

$response = ["success" => false, "message" => ""];

// Validar si el ID es proporcionado y es un número
if (!empty($_GET['id']) && ctype_digit($_GET['id'])) {
  $idservicio = $_GET['id'];

  try {
    // Consulta segura con consulta preparada
    $stmt = $dbh->prepare("SELECT * FROM tiposervicios WHERE id_servicio = ?");
    $stmt->execute([$idservicio]);
    $tiposervicios = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($tiposervicios) {
      // Sanitizar datos antes de enviarlos en la respuesta (Llenar campos)
      $response["success"] = true;
      $response["tiposervicios"] = [
        "idtiposervicio" => htmlspecialchars($tiposervicios["id_servicio"]),
        "tiposervicio" => htmlspecialchars($tiposervicios["nom_servicio"]),
        "desc_servicio" => htmlspecialchars($tiposervicios["desc_servicio"]),
        "estatus" => htmlspecialchars($tiposervicios["estatus"])
      ];
    } else {
      $response["message"] = "Tipo de servicio no encontrado.";
    }
  } catch (PDOException $e) {
    // Respuesta genérica en caso de error
    $response["message"] = "Hubo un error al procesar la solicitud. Intente más tarde.";
  }
} else {
  $response["message"] = "ID de Tipo de servicio no proporcionado o inválido.";
}
// Enviar respuesta en formato JSON
echo json_encode($response);
