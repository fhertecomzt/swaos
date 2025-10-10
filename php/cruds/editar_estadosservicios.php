<?php

//Includes
include "../conexion.php";

// Inicializamos la respuesta
$response = ["success" => false, "message" => ""];

// Verificamos que el método sea POST
if ($_SERVER["REQUEST_METHOD"] === "POST") {
  $idestadoservicio = $_POST["editar-idestadoservicio"] ?? null;
  $estadoservicio = $_POST["estado_servicio"] ?? null;
  $descripcion = $_POST["desc_servicio"] ?? null;
  $estatus = $_POST["estatus"] ?? null;

  try {
    // Preparar la consulta SQL
    $stmt = $dbh->prepare(
      "UPDATE estadosservicios 
         SET estado_servicio = :estadoservicio, 
             desc_estado_servicio = :descripcion,
             estatus = :estatus
       WHERE id_estado_servicio = :id"
    );

    // Ejecutar la consulta con los parámetros
    $stmt->execute([
      ":estado_servicio" => $estadoservicio,
      ":descripcion" => $descripcion,
      ":id" => $idestadoservicio,
      ":estatus" => $estatus
    ]);

    // Verificamos si hubo una actualización
    if ($stmt->rowCount() > 0) {
      $response["success"] = true;
      $response["message"] = "Estado de servicio actualizado correctamente.";
    } else {
      $response["message"] = "No se realizaron cambios en el Estado de servicio.";
    }
  } catch (PDOException $e) {
    // Mensaje genérico para evitar exponer detalles técnicos
    $response["message"] = "Error al actualizar el Estado de servicio. Intente nuevamente más tarde.";
  }
} else {
  $response["message"] = "Método no permitido.";
}

// Enviar la respuesta como JSON
header("Content-Type: application/json");
echo json_encode($response);
