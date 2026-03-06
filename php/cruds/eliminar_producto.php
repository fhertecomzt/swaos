<?php
include "../conexion.php";

$response = ["success" => false, "message" => ""];

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_GET['id']) && ctype_digit($_GET['id'])) {
  $id = (int) $_GET['id'];

  try {

    $query_check = "SELECT COUNT(*) as total FROM inventario_sucursal WHERE id_prod = :id";
    $stmt_check = $dbh->prepare($query_check);
    $stmt_check->bindParam(':id', $id, PDO::PARAM_INT);
    $stmt_check->execute();

    $resultado = $stmt_check->fetch(PDO::FETCH_ASSOC);

    if ($resultado['total'] > 0) {
      $response["success"] = false;
      $response["message"] = "No se puede eliminar. Este producto tiene stock en sucursales o historial de movimientos. Por favor, cambie su estatus a Inactivo.";
    } else {
      // LA ELIMINACIÓN
      $stmt = $dbh->prepare("DELETE FROM productos WHERE id_prod = :id");
      $stmt->bindParam(':id', $id, PDO::PARAM_INT);

      if ($stmt->execute()) {
        $response["success"] = true;
        $response["message"] = "Producto eliminado correctamente.";
      } else {
        $response["message"] = "Error al intentar eliminar el producto de la base de datos.";
      }
    }
  } catch (PDOException $e) {
    // Protección final por si se nos olvida checar alguna tabla foránea
    $response["success"] = false;
    $response["message"] = "Error de integridad: El producto está vinculado a otros registros del sistema y no puede ser borrado.";
  }
} else {
  $response["message"] = "Método no permitido o ID no válido.";
}

header('Content-Type: application/json');
echo json_encode($response);
