<?php
include "../conexion.php";

$response = ["success" => false, "message" => ""];

// Validar si el ID es proporcionado y es un número
if (!empty($_GET['id']) && ctype_digit($_GET['id'])) {
  $id = $_GET['id'];

  try {
    // Consulta segura con consulta preparada
    $stmt = $dbh->prepare("SELECT * FROM proveedores WHERE idproveedor = ?");
    $stmt->execute([$id]);
    $proveedor = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($proveedor) {
      // Sanitizar los datos antes de enviarlos en la respuesta
      $response["success"] = true;
      $response["proveedor"] = [
        "idproveedor" => htmlspecialchars($proveedor["idproveedor"]),
        "proveedor" => htmlspecialchars($proveedor["nomproveedor"]),
        "contacto" => htmlspecialchars($proveedor["contacproveedor"]),
        "rfc" => htmlspecialchars($proveedor["rfcproveedor"]),
        "telefono" => htmlspecialchars($proveedor["telproveedor"]),
        "celular" => htmlspecialchars($proveedor["celproveedor"]),
        "email" => htmlspecialchars($proveedor["emailproveedor"]),
        "limitecred" => htmlspecialchars($proveedor["limitecredproveedor"]),
        "diacred" => htmlspecialchars($proveedor["dicredproveedor"]),
      ];
    } else {
      $response["message"] = "No encontrado.";
    }
  } catch (PDOException $e) {
    // Respuesta genérica en caso de error
    $response["message"] = "Hubo un error al procesar la solicitud. Intente más tarde.";
  }
} else {
  $response["message"] = "ID de proveedor no proporcionado o inválido.";
}
// Enviar respuesta en formato JSON
echo json_encode($response);
