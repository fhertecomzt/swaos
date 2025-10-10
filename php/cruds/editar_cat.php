<?php
//Includes
include "../conexion.php";

// Inicializamos la respuesta
$response = ["success" => false, "message" => ""];

// Verificamos que el método sea POST
if ($_SERVER["REQUEST_METHOD"] === "POST") {
  $idcat = $_POST["editar-idcat"] ?? null;
  $cat = $_POST["cat"] ?? null;
  $descripcion = $_POST["desc_cat"] ?? null;
  $estatus = $_POST["estatus"] ?? null;

  try {
    // Preparar la consulta SQL
    $stmt = $dbh->prepare(
      "UPDATE categorias 
         SET nombre_cat = :cat, 
             desc_cat = :descripcion,
             estatus = :estatus
       WHERE id_categoria = :id"
    );

    // Ejecutar la consulta con los parámetros
    $stmt->execute([
      ":cat" => $cat,
      ":descripcion" => $descripcion,
      ":id" => $idcat,
      ":estatus" => $estatus
    ]);

    // Verificamos si hubo una actualización
    if ($stmt->rowCount() > 0) {
      $response["success"] = true;
      $response["message"] = "Categoría actualizada correctamente.";
    } else {
      $response["message"] = "No se realizaron cambios en la Categoría.";
    }
  } catch (PDOException $e) {
    // Mensaje genérico para evitar exponer detalles técnicos
    $response["message"] = "Error al actualizar la Categoría. Intente nuevamente más tarde.";
  }
} else {
  $response["message"] = "Método no permitido.";
}

// Enviar la respuesta como JSON
header("Content-Type: application/json");
echo json_encode($response);
