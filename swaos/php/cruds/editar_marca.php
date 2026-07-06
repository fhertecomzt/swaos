<?php

//Includes
include "../conexion.php";

// Inicializamos la respuesta
$response = ["success" => false, "message" => ""];

// Verificamos que el método sea POST
if ($_SERVER["REQUEST_METHOD"] === "POST") {
  $idmarca = $_POST["editar-idmarca"] ?? null;
  $marca = $_POST["marca"] ?? null;
  $descripcion = $_POST["desc_marca"] ?? null;
  $estatus = $_POST["estatus"] ?? null;

  try {
    // Preparar la consulta SQL
    $stmt = $dbh->prepare(
      "UPDATE marcas 
         SET nom_marca = :marca, 
             desc_marca = :descripcion,
             estatus = :estatus
       WHERE id_marca = :id"
    );

    // Ejecutar la consulta con los parámetros
    $stmt->execute([
      ":marca" => $marca,
      ":descripcion" => $descripcion,
      ":id" => $idmarca,
      ":estatus" => $estatus
    ]);

    // Verificamos si hubo una actualización
    if ($stmt->rowCount() > 0) {
      $response["success"] = true;
      $response["message"] = "Marca actualizada correctamente.";
    } else {
      $response["message"] = "No se realizaron cambios en el marca.";
    }
  } catch (PDOException $e) {
    // Mensaje genérico para evitar exponer detalles técnicos
    $response["message"] = "Error al actualizar el marca. Intente nuevamente más tarde.";
  }
} else {
  $response["message"] = "Método no permitido.";
}

// Enviar la respuesta como JSON
header("Content-Type: application/json");
echo json_encode($response);
