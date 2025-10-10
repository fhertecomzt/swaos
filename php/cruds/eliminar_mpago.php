<?php
include "../conexion.php"; // Asegúrate de que la conexión a la base de datos esté incluida

// Inicializamos la respuesta
$response = ["success" => false, "message" => ""];

// Verificamos que el método sea POST y que se haya enviado un ID
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_GET['id'])) {
  // Sanitizar el ID recibido por GET
  $id = filter_var($_GET['id'], FILTER_SANITIZE_NUMBER_INT);

  // Validar que el ID sea un número válido
  if (!$id || !filter_var($id, FILTER_VALIDATE_INT)) {
    $response["message"] = "El ID proporcionado no es válido.";
    echo json_encode($response);
    exit;
  }

  try {
    // Preparar la consulta para eliminar el registro
    $stmt = $dbh->prepare("DELETE FROM mpagos WHERE idmpago = :id");
    $stmt->bindParam(':id', $id, PDO::PARAM_INT);

    // Ejecutar la consulta
    if ($stmt->execute()) {
      // Verificar si se eliminó un registro
      if ($stmt->rowCount() > 0) {
        $response["success"] = true;
        $response["message"] = "Registro eliminado correctamente.";
      } else {
        $response["message"] = "No se encontró un registro con ese ID.";
      }
    } else {
      $response["message"] = "Error al intentar eliminar el registro.";
    }
  } catch (PDOException $e) {
    // Evitar mostrar errores técnicos directamente al usuario
    $response["message"] = "Error en la base de datos. Intente nuevamente más tarde.";
  }
} else {
  $response["message"] = "Método no permitido o falta de un ID válido.";
}

// Enviar la respuesta como JSON
header("Content-Type: application/json");
echo json_encode($response);
