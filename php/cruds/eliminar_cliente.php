<?php
include "../conexion.php";

$response = ["success" => false, "message" => ""];

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_GET['id']) && ctype_digit($_GET['id'])) {
  $id = (int) $_GET['id'];

  try {
    // EL BLINDAJE: Verificar si el cliente tiene historial de órdenes
    // NOTA: Reemplaza la palabra "ordenes" por el nombre de tu tabla de ventas
    // y "id_cliente" por el nombre de tu columna foránea si se llaman distinto.
    $query_check = "SELECT COUNT(*) as total FROM ordenesservicio WHERE id_cliente = :id";
    $stmt_check = $dbh->prepare($query_check);
    $stmt_check->bindParam(':id', $id, PDO::PARAM_INT);
    $stmt_check->execute();

    $resultado = $stmt_check->fetch(PDO::FETCH_ASSOC);

    if ($resultado['total'] > 0) {
      $response["success"] = false;
      $response["message"] = "No se puede eliminar. Este cliente tiene órdenes o reparaciones asociadas. Por favor, cambie su estatus a Inactivo.";
    } else {
      // LA ELIMINACIÓN
      $stmt = $dbh->prepare("DELETE FROM clientes WHERE id_cliente = :id");
      $stmt->bindParam(':id', $id, PDO::PARAM_INT);

      if ($stmt->execute()) {
        $response["success"] = true;
        $response["message"] = "Registro eliminado correctamente.";
      } else {
        $response["message"] = "Error al eliminar el registro.";
      }
    }
  } catch (PDOException $e) {
    $response["success"] = false;
    $response["message"] = "Error de integridad: El cliente está vinculado a otros registros del sistema y no puede ser borrado.";
  }
} else {
  $response["message"] = "Método no permitido o ID no válido.";
}

header('Content-Type: application/json');
echo json_encode($response);
