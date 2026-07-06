<?php
include "../conexion.php";

$response = ["success" => false, "message" => ""];

// Validar si el ID es proporcionado y es un número
if (!empty($_GET['id']) && ctype_digit($_GET['id'])) {
  $idcat = $_GET['id'];

  try {
    // Consulta segura con consulta preparada
    $stmt = $dbh->prepare("SELECT * FROM categorias WHERE id_categoria = ?");
    $stmt->execute([$idcat]);
    $cat = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($cat) {
      // Sanitizar datos antes de enviarlos en la respuesta (Llenar campos)
      $response["success"] = true;
      $response["cat"] = [
        "idcat" => htmlspecialchars($cat["id_categoria"]),
        "cat" => htmlspecialchars($cat["nombre_cat"]),
        "desc_cat" => htmlspecialchars($cat["desc_cat"]),
        "estatus" => htmlspecialchars($cat["estatus"])
      ];
    } else {
      $response["message"] = "Categoría no encontrada.";
    }
  } catch (PDOException $e) {
    // Respuesta genérica en caso de error
    $response["message"] = "Hubo un error al procesar la solicitud. Intente más tarde.";
  }
} else {
  $response["message"] = "ID de categoría no proporcionado o inválido.";
}
// Enviar respuesta en formato JSON
echo json_encode($response);
