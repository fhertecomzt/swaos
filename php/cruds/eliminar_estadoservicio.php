<?php
include "../conexion.php";

$response = ["success" => false, "message" => ""];

// Verificamos que el método sea POST y que se haya enviado un ID
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_GET['id'])) {
  $id = filter_var($_GET['id'], FILTER_SANITIZE_NUMBER_INT);

  if (!$id || !filter_var($id, FILTER_VALIDATE_INT)) {
    $response["message"] = "El ID proporcionado no es válido.";
    echo json_encode($response);
    exit;
  }

  try {
    // BLINDAJE 1: PROTEGER ESTADOS CRÍTICOS DEL SISTEMA
    $stmtCheckEdo = $dbh->prepare("SELECT estado_servicio FROM estadosservicios WHERE id_estado_servicio = :id");
    $stmtCheckEdo->bindParam(':id', $id, PDO::PARAM_INT);
    $stmtCheckEdo->execute();
    $edoData = $stmtCheckEdo->fetch(PDO::FETCH_ASSOC);

    if ($edoData) {
      // Ponemos todas las opciones en MINÚSCULAS para que la comparación no falle
      $edoIntocables = ['recibido', 'entregado', 'revisión', 'diagnósticado', 'cancelado', 'terminado'];

      // Usamos mb_strtolower con UTF-8 para que respete los acentos al convertir a minúsculas
      $estadoDB = mb_strtolower(trim($edoData['estado_servicio']), 'UTF-8');

      if (in_array($estadoDB, $edoIntocables)) {
        $response["message"] = "Bloqueo de Seguridad: El estado '" . $edoData['estado_servicio'] . "' es estructural para el sistema y NO puede ser eliminado.";
        echo json_encode($response);
        exit;
      }
    } else {
      $response["message"] = "No se encontró el estado especificado.";
      echo json_encode($response);
      exit;
    }

    // BLINDAJE 2: VERIFICAR SI HAY ÓRDENES USANDO ESTE ESTADO
    // Buscamos en la columna id_estado_servicio, no en id_orden
    $stmtCheckOrdenes = $dbh->prepare("SELECT COUNT(*) as total FROM ordenesservicio WHERE id_estado_servicio = :id");
    $stmtCheckOrdenes->bindParam(':id', $id, PDO::PARAM_INT);
    $stmtCheckOrdenes->execute();
    $ordenesData = $stmtCheckOrdenes->fetch(PDO::FETCH_ASSOC);

    if ($ordenesData['total'] > 0) {
      $response["message"] = "No se puede eliminar. Hay " . $ordenesData['total'] . " orden(es) utilizando este estado actualmente. Por favor, cambie su estatus a Inactivo.";
      echo json_encode($response);
      exit;
    }

    // 3. ELIMINACIÓN SEGURA (Solo llega aquí si pasó los dos blindajes)
    $stmt = $dbh->prepare("DELETE FROM estadosservicios WHERE id_estado_servicio = :id");
    $stmt->bindParam(':id', $id, PDO::PARAM_INT);

    if ($stmt->execute()) {
      if ($stmt->rowCount() > 0) {
        $response["success"] = true;
        $response["message"] = "Estado de servicio eliminado correctamente.";
      } else {
        $response["message"] = "No se encontró un registro con ese ID.";
      }
    } else {
      $response["message"] = "Error al intentar eliminar el registro.";
    }
  } catch (PDOException $e) {
    // Protección final por si la base de datos detecta otra llave foránea
    $response["message"] = "Error de integridad: El estado de servicio está vinculado a otros registros y no puede ser borrado.";
  }
} else {
  $response["message"] = "Método no permitido o falta de un ID válido.";
}

header("Content-Type: application/json");
echo json_encode($response);
