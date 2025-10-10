<?php

//Includes
include "../conexion.php";

// Inicializamos la respuesta
$response = ["success" => false, "message" => ""];

// Verificamos que el método sea POST
if ($_SERVER["REQUEST_METHOD"] === "POST") {
  $idtiposervicio = $_POST["editar-idtiposervicio"] ?? null;
  $tiposervicio = $_POST["tiposervicio"] ?? null;
  $descripcion = $_POST["desc_servicio"] ?? null;
  $estatus = $_POST["estatus"] ?? null;

  try {
    // Preparar la consulta SQL
    $stmt = $dbh->prepare(
      "UPDATE tiposervicios 
         SET nom_servicio = :tiposervicio, 
             desc_servicio = :descripcion,
             estatus = :estatus
       WHERE id_servicio = :id"
    );

    // Ejecutar la consulta con los parámetros
    $stmt->execute([
      ":tiposervicio" => $tiposervicio,
      ":descripcion" => $descripcion,
      ":id" => $idtiposervicio,
      ":estatus" => $estatus,
    ]);

    // Verificamos si hubo una actualización
    if ($stmt->rowCount() > 0) {
      $response["success"] = true;
      $response["message"] = "Tipo de servicio actualizado correctamente.";
    } else {
      $response["message"] = "No se realizaron cambios en el Tipo de servicio.";
    }
  } catch (PDOException $e) {
    // Mensaje genérico para evitar exponer detalles técnicos
    $response["message"] = "Error al actualizar el Tipo de servicio. Intente nuevamente más tarde.";
  }
} else {
  $response["message"] = "Método no permitido.";
}

// Enviar la respuesta como JSON
header("Content-Type: application/json");
echo json_encode($response);
