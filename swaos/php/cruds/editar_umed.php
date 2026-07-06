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
      "UPDATE unidades_med 
         SET nom_unidad = :umed, 
             desc_unidad = :descripcion 
       WHERE id_unidad = :id"
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
      $response["message"] = "Registro actualizado correctamente.";
    } else {
      $response["message"] = "No se realizaron cambios en el registro";
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
