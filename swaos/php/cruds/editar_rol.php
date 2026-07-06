<?php

//Includes
include "../conexion.php";

// Inicializamos la respuesta
$response = ["success" => false, "message" => ""];

// Verificamos que el método sea POST
if ($_SERVER["REQUEST_METHOD"] === "POST") {
  $idrol = $_POST["editar-idrol"] ?? null;
  $rol = $_POST["rol"] ?? null;
  $descripcion = $_POST["desc_rol"] ?? null;
  $estatus = $_POST["estatus"] ?? null;

  try {
    // Preparar la consulta SQL
    $stmt = $dbh->prepare(
      "UPDATE roles 
         SET nom_rol = :rol, 
             desc_rol = :descripcion,
             estatus_rol = :estatus
       WHERE id_rol = :id"
    );

    // Ejecutar la consulta con los parámetros
    $stmt->execute([
      ":rol" => $rol,
      ":descripcion" => $descripcion,
      ":id" => $idrol,
      ":estatus" => $estatus,
    ]);

    // Verificamos si hubo una actualización
    if ($stmt->rowCount() > 0) {
      $response["success"] = true;
      $response["message"] = "Rol actualizado correctamente.";
    } else {
      $response["message"] = "No se realizaron cambios en el rol.";
    }
  } catch (PDOException $e) {
    // Mensaje genérico para evitar exponer detalles técnicos
    $response["message"] = "Error al actualizar el rol. Intente nuevamente más tarde.";
  }
} else {
  $response["message"] = "Método no permitido.";
}

// Enviar la respuesta como JSON
header("Content-Type: application/json");
echo json_encode($response);
