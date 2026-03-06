<?php
include "../conexion.php";

$response = ["success" => false, "message" => ""];

// Verificar que el método sea POST y que se proporcione un ID válido
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_GET['id']) && ctype_digit($_GET['id'])) {
  $id = (int) $_GET['id']; // Convertir el ID a entero para mayor seguridad

  try {
    // EL BLINDAJE: Verificar si el proveedor tiene historial en 'productos'
    $query_check = "SELECT COUNT(*) as total FROM productos WHERE id_prov = :id";
    $stmt_check = $dbh->prepare($query_check);
    $stmt_check->bindParam(':id', $id, PDO::PARAM_INT);
    $stmt_check->execute();

    $resultado = $stmt_check->fetch(PDO::FETCH_ASSOC);

    // Si el total es mayor a 0, significa que sí tiene historial y detenemos la eliminación
    if ($resultado['total'] > 0) {
      $response["success"] = false;
      $response["message"] = "No se puede eliminar. Este proveedor tiene productos asociados. Por favor, cambie su estatus a Inactivo.";
    } else {
      // LA ELIMINACIÓN: Solo se llega aquí si no tiene productos (total = 0)
      $stmt = $dbh->prepare("DELETE FROM proveedores WHERE id_prov = :id");
      $stmt->bindParam(':id', $id, PDO::PARAM_INT);

      if ($stmt->execute()) {
        $response["success"] = true;
        $response["message"] = "Registro eliminado correctamente.";
      } else {
        $response["message"] = "Error al eliminar el registro.";
      }
    }
  } catch (PDOException $e) {
    // Si la base de datos detecta un error de integridad (Foreign Keys estrictas)
    // Atrapamos el error aquí para que envíe la alerta roja en lugar de romper el sistema.
    $response["success"] = false;
    $response["message"] = "Error de integridad: El proveedor está vinculado a otros registros del sistema y no puede ser borrado.";
  }
} else {
  $response["message"] = "Método no permitido o ID no válido.";
}

// Enviar la respuesta en formato JSON
header('Content-Type: application/json');
echo json_encode($response);
