<?php

//Includes
include "../conexion.php";

// Inicializamos la respuesta
$response = ["success" => false, "message" => ""];

// Verificamos que el método sea POST
if ($_SERVER["REQUEST_METHOD"] === "POST") {
  $idtipoequipo = $_POST["editar-idtipoequipo"] ?? null;
  $tipoequipo = $_POST["tipoequipo"] ?? null;
  $descripcion = $_POST["desc_equipo"] ?? null;
  $estatus = $_POST["estatus"] ?? null;

  try {
    // Preparar la consulta SQL
    $stmt = $dbh->prepare(
      "UPDATE equipos 
         SET nombre_equipo = :tipoequipo, 
             desc_equipo = :descripcion,
             estatus = :estatus
       WHERE id_equipo = :id"
    );

    // Ejecutar la consulta con los parámetros
    $stmt->execute([
      ":tipoequipo" => $tipoequipo,
      ":descripcion" => $descripcion,
      ":id" => $idtipoequipo,
      ":estatus" => $estatus,
    ]);

    // Verificamos si hubo una actualización
    if ($stmt->rowCount() > 0) {
      $response["success"] = true;
      $response["message"] = "Tipo de equipo actualizado correctamente.";
    } else {
      $response["message"] = "No se realizaron cambios en el tipo de equipo.";
    }
  } catch (PDOException $e) {
    // Mensaje genérico para evitar exponer detalles técnicos
    $response["message"] = "Error al actualizar el Tipo de equipo. Intente nuevamente más tarde.";
  }
} else {
  $response["message"] = "Método no permitido.";
}

// Enviar la respuesta como JSON
header("Content-Type: application/json");
echo json_encode($response);
