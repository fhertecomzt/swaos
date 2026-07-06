<?php
include "../conexion.php";

$response = ["success" => false, "message" => ""];

// Verificar que el método sea POST y que se proporcione un ID válido
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_GET['id']) && ctype_digit($_GET['id'])) {
  $id = (int) $_GET['id']; // Convertir el ID a entero para mayor seguridad

  try {
    // EL BLINDAJE: Verificar si el taller tiene usuarios o historial
    // Revisamos si este taller ya tiene usuarios asignados.
    // (Opcional: también se puede sumar el inventario_sucursal)
    $query_check = "SELECT COUNT(*) as total FROM usuarios WHERE taller_id = :id";
    $stmt_check = $dbh->prepare($query_check);
    $stmt_check->bindParam(':id', $id, PDO::PARAM_INT);
    $stmt_check->execute();

    $resultado = $stmt_check->fetch(PDO::FETCH_ASSOC);

    if ($resultado['total'] > 0) {
      // Bloqueamos la eliminación
      $response["success"] = false;
      $response["message"] = "No se puede eliminar. Este taller tiene usuarios o inventario asignados. Por favor, cambie su estatus a Inactivo.";
    } else {
      // LA ELIMINACIÓN: Solo llega aquí si es un taller nuevo/vacío
      $stmt = $dbh->prepare("DELETE FROM talleres WHERE id_taller = :id");
      $stmt->bindParam(':id', $id, PDO::PARAM_INT);

      if ($stmt->execute()) {
        $response["success"] = true;
        $response["message"] = "Taller eliminado correctamente.";
      } else {
        $response["message"] = "Error al eliminar el taller en la base de datos.";
      }
    }
  } catch (PDOException $e) {
    // Se atrapan errores de llaves foráneas por si está ligado a otras tablas
    $response["success"] = false;
    $response["message"] = "Error de integridad: El taller está vinculado a otros registros del sistema y no puede ser borrado.";
  }
} else {
  $response["message"] = "Método no permitido o ID no válido.";
}

// Enviar la respuesta en formato JSON
header('Content-Type: application/json');
echo json_encode($response);
