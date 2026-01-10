<?php
include "../conexion.php";

$response = ["success" => false, "message" => ""];

// Validar si el ID es proporcionado y es un número
if (!empty($_GET['id']) && ctype_digit($_GET['id'])) {
  $id = $_GET['id'];

  try {
    // Consulta segura con consulta preparada
    $stmt = $dbh->prepare("SELECT * FROM clientes WHERE id_cliente = ?");
    $stmt->execute([$id]);
    $cliente = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($cliente) {
      // Sanitizar los datos antes de enviarlos en la respuesta
      $response["success"] = true;
      $response["cliente"] = [
        "idcliente" => htmlspecialchars($cliente["id_cliente"]),
        "cliente" => htmlspecialchars($cliente["nombre_cliente"]),
        "papellido" => htmlspecialchars($cliente["papellido_cliente"]),
        "sapellido" => htmlspecialchars($cliente["sapellido_cliente"]),
        "rfc" => htmlspecialchars($cliente["rfc_cliente"]),
        "calle" => htmlspecialchars($cliente["calle_cliente"]),
        "noexterior" => htmlspecialchars($cliente["noext_cliente"]),
        "nointerior" => htmlspecialchars($cliente["noint_cliente"]),
        "estado" => htmlspecialchars($cliente["id_edo_c"]),
        "municipio" => htmlspecialchars($cliente["id_munici_c"]),
        "colonia" => htmlspecialchars($cliente["id_col_c"]),
        "codigo_postal" => htmlspecialchars($cliente["id_cp_c"]),
        "telefono" => htmlspecialchars($cliente["tel_cliente"]),
        "email" => htmlspecialchars($cliente["email_cliente"]),
        "estatus" => htmlspecialchars($cliente["estatus"])
      ];
    } else {
      $response["message"] = "Cliente no encontrado.";
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
