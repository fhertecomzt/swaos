<?php
// procesar_crear.php
include "../conexion.php";

$response = ["success" => false, "message" => ""];

// Validar campos obligatorios
if (
  !empty($_POST['mpago']) && !empty($_POST['desc_mpago'])
) {
  // Sanitización básica
  $mpago = htmlspecialchars($_POST['mpago']);
  $desc_mpago = htmlspecialchars($_POST['desc_mpago']);

  // Ejecutar la inserción
  try {
    $stmt = $dbh->prepare("INSERT INTO mpagos (nommpago, descmpago) 
                               VALUES (?, ?)");
    $stmt->execute([$mpago, $desc_mpago]);

    $lastId = $dbh->lastInsertId();

    $response["success"] = true;
    $response["message"] = "Registro creado exitosamente.";
    $response["mpago"] = [
      "id" => $lastId,
      "nombre" => $mpago,
      "descripcion" => $desc_mpago
    ];
  } catch (PDOException $e) {
    // Respuesta genérica en caso de error
    $response["message"] = "Hubo un error al procesar la solicitud. Intente más tarde.";
  }
} else {
  $response["message"] = "Todos los campos son obligatorios.";
}

echo json_encode($response);
