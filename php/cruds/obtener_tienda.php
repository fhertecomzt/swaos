<?php
include "../conexion.php";

$response = ["success" => false, "message" => ""];

// Validar si el ID es proporcionado y es un número
if (!empty($_GET['id']) && ctype_digit($_GET['id'])) {
  $id = $_GET['id'];

  try {
    // Consulta segura con consulta preparada
    $stmt = $dbh->prepare("SELECT * FROM talleres WHERE id_taller = ?");
    $stmt->execute([$id]);
    $tienda = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($tienda) {
      // Sanitizar los datos antes de enviarlos en la respuesta
      $response["success"] = true;
      $response["tienda"] = [
        "id" => htmlspecialchars($tienda["id_taller"]),
        "nombre" => htmlspecialchars($tienda["nombre_t"]),
        "representante" => htmlspecialchars($tienda["representante_t"]),
        "rfc" => htmlspecialchars($tienda["rfc_t"]),
        "calle" => htmlspecialchars($tienda["calle_t"]),
        "noexterior" => htmlspecialchars($tienda["numext_t"]),
        "nointerior" => htmlspecialchars($tienda["numint_t"]),
        "pais" => htmlspecialchars($tienda["id_pais_t"]),
        "estado" => htmlspecialchars($tienda["id_edo_t"]),
        "municipio" => htmlspecialchars($tienda["id_munici_t"]),
        "colonia" => htmlspecialchars($tienda["id_col_t"]),
        "cpostal" => htmlspecialchars($tienda["id_cp_t"]),
        "telefono" => htmlspecialchars($tienda["tel_t"]),
        "email" => htmlspecialchars($tienda["email_t"]),
        "estatus" => htmlspecialchars($tienda["estatus_t"]),

      ];
    } else {
      $response["message"] = "Taller no encontrado.";
    }
  } catch (PDOException $e) {
    // Respuesta genérica en caso de error
    $response["message"] = "Hubo un error al procesar la solicitud. Intente más tarde.";
  }
} else {
  $response["message"] = "ID del taller no proporcionado o inválido.";
}
// Enviar respuesta en formato JSON
echo json_encode($response);
