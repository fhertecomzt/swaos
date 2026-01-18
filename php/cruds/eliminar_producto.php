<?php
include "../conexion.php";

$response = ["success" => false, "message" => ""];

// Verificar que el método sea POST y que se proporcione un ID válido
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_GET['id']) && ctype_digit($_GET['id'])) {
  $id = (int) $_GET['id']; // Convertir el ID a entero para mayor seguridad

  try {
    // Preparar y ejecutar la consulta para eliminar
    $stmt = $dbh->prepare("DELETE FROM productos WHERE id_prod = :id");
    $stmt->bindParam(':id', $id, PDO::PARAM_INT);

    if ($stmt->execute()) {
      $response["success"] = true;
      $response["message"] = "Registro eliminado correctamente.";
    } else {
      $response["message"] = "Error al eliminar el registro.";
    }
  } catch (PDOException $e) {
    // Mensaje genérico para evitar exposición de detalles de errores
    $response["message"] = "Hubo un error al procesar la solicitud. Intente más tarde.";
  }
} else {
  $response["message"] = "Método no permitido o ID no válido.";
}

// Enviar la respuesta en formato JSON
header('Content-Type: application/json');
echo json_encode($response);
