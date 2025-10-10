<?php

//Includes
include "../conexion.php";

// Inicializamos la respuesta
$response = ["success" => false, "message" => ""];

// Verificamos que el método sea POST
if ($_SERVER["REQUEST_METHOD"] === "POST") {
  $idumed = $_POST["editar-idumed"] ?? null;
  $umed = $_POST["umed"] ?? null;
  $descripcion = $_POST["desc_umed"] ?? null;

  try {
    // Preparar la consulta SQL
    $stmt = $dbh->prepare(
      "UPDATE umedidas 
         SET nomumedida = :umed, 
             descumedida = :descripcion 
       WHERE idumedida = :id"
    );

    // Ejecutar la consulta con los parámetros
    $stmt->execute([
      ":umed" => $umed,
      ":descripcion" => $descripcion,
      ":id" => $idumed
    ]);

    // Verificamos si hubo una actualización
    if ($stmt->rowCount() > 0) {
      $response["success"] = true;
      $response["message"] = "U. medida actualizada correctamente.";
    } else {
      $response["message"] = "No se realizaron cambios en la U. medida.";
    }
  } catch (PDOException $e) {
    // Mensaje genérico para evitar exponer detalles técnicos
    $response["message"] = "Error al actualizar U. medida . Intente nuevamente más tarde.";
  }
} else {
  $response["message"] = "Método no permitido.";
}

// Enviar la respuesta como JSON
header("Content-Type: application/json");
echo json_encode($response);
