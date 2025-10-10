<?php
include "../conexion.php";

$response = ["success" => false, "message" => ""];

// Validar si el ID es proporcionado y es un número
if (!empty($_GET['id']) && ctype_digit($_GET['id'])) {
  $idimpuesto = $_GET['id'];

  try {
    // Consulta segura con consulta preparada
    $stmt = $dbh->prepare("SELECT * FROM impuestos WHERE idimpuesto = ?");
    $stmt->execute([$idimpuesto]);
    $impuesto = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($impuesto) {
      // Sanitizar datos antes de enviarlos en la respuesta (Llenar campos)
      $response["success"] = true;
      $response["impuesto"] = [
        "idimpuesto" => htmlspecialchars($impuesto["idimpuesto"]),
        "impuesto" => htmlspecialchars($impuesto["nomimpuesto"]),
        "tasa" => htmlspecialchars($impuesto["tasa"])
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
