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
  $estatus = htmlspecialchars($_POST['estatus']);

  // Ejecutar la inserción
  try {
    $stmt = $dbh->prepare("INSERT INTO metodosdepago (nombre_metpago, desc_metpago, estatus) VALUES (?, ?, ?)");
    $stmt->execute([$mpago, $desc_mpago, $estatus]);

    $lastId = $dbh->lastInsertId();

    $response["success"] = true;
    $response["message"] = "Registro creado exitosamente.";
    $response["mpago"] = [
      "id" => $lastId,
      "nombre" => $mpago,
      "descripcion" => $desc_mpago,
      "estatus" => $estatus
    ];
  } catch (PDOException $e) {
    // Respuesta genérica en caso de error
    $response["message"] = "Hubo un error al procesar la solicitud. Intente más tarde.";
  }
} else {
  $response["message"] = "Todos los campos son obligatorios.";
}

echo json_encode($response);
