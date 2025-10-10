<?php
include "../conexion.php";

$response = ["success" => false, "message" => ""];

// Validar si el ID es proporcionado y es un número
if (!empty($_GET['id']) && ctype_digit($_GET['id'])) {
  $id = $_GET['id'];

  try {
    // Consulta segura con consulta preparada
    $stmt = $dbh->prepare("SELECT * FROM clientes WHERE idcliente = ?");
    $stmt->execute([$id]);
    $cliente = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($cliente) {
      // Sanitizar los datos antes de enviarlos en la respuesta
      $response["success"] = true;
      $response["cliente"] = [
        "idcliente" => htmlspecialchars($cliente["idcliente"]),
        "cliente" => htmlspecialchars($cliente["nom_cliente"]),
        "rfc" => htmlspecialchars($cliente["rfc_cliente"]),
        "calle" => htmlspecialchars($cliente["dom_cliente"]),
        "noexterior" => htmlspecialchars($cliente["noext_cliente"]),
        "nointerior" => htmlspecialchars($cliente["noint_cliente"]),
        "cpostal" => htmlspecialchars($cliente["cp_cliente"]),
        "colonia" => htmlspecialchars($cliente["col_cliente"]),
        "ciudad" => htmlspecialchars($cliente["cd_cliente"]),
        "estado" => htmlspecialchars($cliente["edo_cliente"]),
        "telefono" => htmlspecialchars($cliente["tel_cliente"]),
        "email" => htmlspecialchars($cliente["email_cliente"]),
        "limitecred" => htmlspecialchars($cliente["limitecred_cliente"]),
        "diacred" => htmlspecialchars($cliente["diacred_cliente"]),
      ];
    } else {
      $response["message"] = "No encontrada.";
    }
  } catch (PDOException $e) {
    // Respuesta genérica en caso de error
    $response["message"] = "Hubo un error al procesar la solicitud. Intente más tarde.";
  }
} else {
  $response["message"] = "ID de cliente no proporcionado o inválido.";
}
// Enviar respuesta en formato JSON
echo json_encode($response);
