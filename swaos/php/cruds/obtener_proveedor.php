<?php
include "../conexion.php";

$response = ["success" => false, "message" => ""];

// Validar si el ID es proporcionado y es un número
if (!empty($_GET['id']) && ctype_digit($_GET['id'])) {
  $id = $_GET['id'];

  try {
    // Consulta segura con consulta preparada
    $stmt = $dbh->prepare("SELECT * FROM proveedores WHERE id_prov = ?");
    $stmt->execute([$id]);
    $proveedor = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($proveedor) {
      // Sanitizar los datos antes de enviarlos en la respuesta
      $response["success"] = true;
      $response["proveedor"] = [
        "idproveedor" => htmlspecialchars($proveedor["id_prov"]),
        "proveedor" => htmlspecialchars($proveedor["nombre_prov"]),
        "papellido" => htmlspecialchars($proveedor["papellido_prov"]),
        "sapellido" => htmlspecialchars($proveedor["sapellido_prov"]),
        "contacto" => htmlspecialchars($proveedor["contacto_prov"]),
        "rfc" => htmlspecialchars($proveedor["rfc_prov"]),
        "telefono" => htmlspecialchars($proveedor["tel_prov"]),
        "email" => htmlspecialchars($proveedor["email_prov"]),
        "estatus" => htmlspecialchars($proveedor["estatus"])
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
