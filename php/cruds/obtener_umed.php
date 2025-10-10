<?php
include "../conexion.php";

$response = ["success" => false, "message" => ""];

// Validar si el ID es proporcionado y es un número
if (!empty($_GET['id']) && ctype_digit($_GET['id'])) {
  $idumed = $_GET['id'];

  try {
    // Consulta segura con consulta preparada
    $stmt = $dbh->prepare("SELECT * FROM umedidas WHERE idumedida = ?");
    $stmt->execute([$idumed]);
    $umed = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($umed) {
      // Sanitizar datos antes de enviarlos en la respuesta (Llenar campos)
      $response["success"] = true;
      $response["umed"] = [
        "idumed" => htmlspecialchars($umed["idumedida"]),
        "umed" => htmlspecialchars($umed["nomumedida"]),
        "desc_umed" => htmlspecialchars($umed["descumedida"])
      ];
    } else {
      $response["message"] = "U. medida no encontrado.";
    }
  } catch (PDOException $e) {
    // Respuesta genérica en caso de error
    $response["message"] = "Hubo un error al procesar la solicitud. Intente más tarde.";
  }
} else {
  $response["message"] = "ID de tienda no proporcionado o inválido.";
}
// Enviar respuesta en formato JSON
echo json_encode($response);
