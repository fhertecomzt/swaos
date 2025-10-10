<?php
include "../conexion.php";

$response = ["success" => false, "message" => ""];

// Validar si el ID es proporcionado y es un número
if (!empty($_GET['id']) && ctype_digit($_GET['id'])) {
  $idmpago = $_GET['id'];

  try {
    // Consulta segura con consulta preparada
    $stmt = $dbh->prepare("SELECT * FROM mpagos WHERE idmpago = ?");
    $stmt->execute([$idmpago]);
    $mpago = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($mpago) {
      // Sanitizar datos antes de enviarlos en la respuesta (Llenar campos)
      $response["success"] = true;
      $response["mpago"] = [
        "idmpago" => htmlspecialchars($mpago["idmpago"]),
        "mpago" => htmlspecialchars($mpago["nommpago"]),
        "desc_mpago" => htmlspecialchars($mpago["descmpago"])
      ];
    } else {
      $response["message"] = "No sé a encontrado.";
    }
  } catch (PDOException $e) {
    // Respuesta genérica en caso de error
    $response["message"] = "Hubo un error al procesar la solicitud. Intente más tarde.";
  }
} else {
  $response["message"] = "ID no proporcionado o inválido.";
}
// Enviar respuesta en formato JSON
echo json_encode($response);
