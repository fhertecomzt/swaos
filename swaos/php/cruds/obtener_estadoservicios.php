<?php
include "../conexion.php";

$response = ["success" => false, "message" => ""];

// Validar si el ID es proporcionado y es un número
if (!empty($_GET['id']) && ctype_digit($_GET['id'])) {
  $idestadoservicio = $_GET['id'];

  try {
    // Consulta segura con consulta preparada
    $stmt = $dbh->prepare("SELECT * FROM estadosservicios WHERE id_estado_servicio = ?");
    $stmt->execute([$idestadoservicio]);
    $estadoservicio = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($estadoservicio) {
      // Sanitizar datos antes de enviarlos en la respuesta (Llenar campos)
      $response["success"] = true;
      $response["estadoservicios"] = [
        "idestadoservicio" => htmlspecialchars($estadoservicio["id_estado_servicio"]),
        "estadoservicio" => htmlspecialchars($estadoservicio["estado_servicio"]),
        "desc_servicio" => htmlspecialchars($estadoservicio["desc_estado_servicio"]),
        "estatus" => htmlspecialchars($estadoservicio["estatus"])
      ];
    } else {
      $response["message"] = "Estado de servicio no encontrado.";
    }
  } catch (PDOException $e) {
    // Respuesta genérica en caso de error
    $response["message"] = "Hubo un error al procesar la solicitud. Intente más tarde.";
  }
} else {
  $response["message"] = "ID de Estado de servicio no proporcionado o inválido.";
}
// Enviar respuesta en formato JSON
echo json_encode($response);
