<?php
include "../conexion.php";

$response = ["success" => false, "message" => ""];

// Validar si el ID es proporcionado y es un número
if (!empty($_GET['id']) && ctype_digit($_GET['id'])) {
  $idumed = $_GET['id'];

  try {
    // Consulta segura con consulta preparada
    $stmt = $dbh->prepare("SELECT * FROM unidades_med WHERE id_unidad = ?");
    $stmt->execute([$idumed]);
    $umed = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($umed) {
      // Sanitizar datos antes de enviarlos en la respuesta (Llenar campos)
      $response["success"] = true;
      $response["umed"] = [
        "idumed" => htmlspecialchars($umed["id_unidad"]),
        "umed" => htmlspecialchars($umed["nom_unidad"]),
        "desc_umed" => htmlspecialchars($umed["desc_unidad"]),
        "estatus" => htmlspecialchars($umed["estatus"])
      ];
    } else {
      $response["message"] = "Unidad de medida no encontrado.";
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
