<?php
include "../conexion.php"; 

$response = ["success" => false, "message" => ""];

// Verificar que el método sea POST y que se haya enviado un ID
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_GET['id'])) {
  $id = filter_var($_GET['id'], FILTER_SANITIZE_NUMBER_INT);

  // Validar que el ID sea un número válido
  if (!$id || !filter_var($id, FILTER_VALIDATE_INT)) {
    echo json_encode(["success" => false, "message" => "El ID proporcionado no es válido."]);
    exit;
  }

  try {
    // Verificar si el usuario tiene órdenes o historial
    // OJO AQUÍ: Estoy asumiendo que tu tabla de órdenes tiene una columna llamada 'id_usuario'. 
    // Si en tu base de datos se llama 'id_tecnico' o de otra forma, cámbialo en la consulta de abajo.

    $query_check = "SELECT COUNT(*) as total FROM ordenesservicio WHERE id_usuario = :id";
    $stmt_check = $dbh->prepare($query_check);
    $stmt_check->bindParam(':id', $id, PDO::PARAM_INT);
    $stmt_check->execute();

    $resultado = $stmt_check->fetch(PDO::FETCH_ASSOC);

    // Si el usuario tiene órdenes asignadas, bloqueamos la eliminación
    if ($resultado['total'] > 0) {
      $response["success"] = false;
      $response["message"] = "No se puede eliminar. Este usuario tiene órdenes de servicio o historial asociado. Por favor, cambie su estatus a Inactivo.";
    } else {
      // LA ELIMINACIÓN: Solo llega aquí si es un usuario nuevo o sin historial
      $stmt = $dbh->prepare("DELETE FROM usuarios WHERE id_usuario = :id");
      $stmt->bindParam(':id', $id, PDO::PARAM_INT);

      if ($stmt->execute()) {
        if ($stmt->rowCount() > 0) {
          $response["success"] = true;
          $response["message"] = "Usuario eliminado correctamente.";
        } else {
          $response["message"] = "No se encontró un usuario con ese ID.";
        }
      } else {
        $response["message"] = "Error al intentar eliminar el registro.";
      }
    }
  } catch (PDOException $e) {
    // Atrapamos errores de llaves foráneas por si está ligado a otras tablas (ej. ventas)
    $response["success"] = false;
    $response["message"] = "Error de integridad: El usuario está vinculado a otros registros del sistema y no puede ser borrado.";
  }
} else {
  $response["message"] = "Método no permitido o falta de un ID válido.";
}

// Enviar la respuesta como JSON
header("Content-Type: application/json");
echo json_encode($response);
