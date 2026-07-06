<?php
include "../conexion.php";

$response = ["success" => false, "message" => ""];

// Validar si el ID es proporcionado y es un número
if (!empty($_GET['id']) && ctype_digit($_GET['id'])) {
  $idequipo = $_GET['id'];

  try {
    // Consulta segura con consulta preparada
    $stmt = $dbh->prepare("SELECT * FROM equipos WHERE id_equipo = ?");
    $stmt->execute([$idequipo]);
    $tipoequipos = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($tipoequipos) {
      // Sanitizar datos antes de enviarlos en la respuesta (Llenar campos)
      $response["success"] = true;
      $response["tipoequipos"] = [
        "idtipoequipo" => htmlspecialchars($tipoequipos["id_equipo"]),
        "tipoequipo" => htmlspecialchars($tipoequipos["nombre_equipo"]),
        "desc_equipo" => htmlspecialchars($tipoequipos["desc_equipo"]),
        "estatus" => htmlspecialchars($tipoequipos["estatus"])
      ];
    } else {
      $response["message"] = "Tipo de equipo no encontrado.";
    }
  } catch (PDOException $e) {
    // Respuesta genérica en caso de error
    $response["message"] = "Hubo un error al procesar la solicitud. Intente más tarde.";
  }
} else {
  $response["message"] = "ID de Tipo de equipo no proporcionado o inválido.";
}
// Enviar respuesta en formato JSON
echo json_encode($response);
