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
    // BLINDAJE 1: PROTEGER ROLES CRÍTICOS DEL SISTEMA
    $stmtCheckRol = $dbh->prepare("SELECT nom_rol FROM roles WHERE id_rol = :id");
    $stmtCheckRol->bindParam(':id', $id, PDO::PARAM_INT);
    $stmtCheckRol->execute();
    $rolData = $stmtCheckRol->fetch(PDO::FETCH_ASSOC);

    if ($rolData) {
      // Pon aquí los nombres exactos de los roles que NO se pueden borrar
      $rolesIntocables = ['superusuario', 'gerencia', 'ventas'];

      // Convertimos a minúsculas para comparar sin errores de mayúsculas
      if (in_array(strtolower(trim($rolData['nom_rol'])), $rolesIntocables)) {
        $response["message"] = "Bloqueo de Seguridad: El rol '" . $rolData['nom_rol'] . "' es estructural para el sistema y NO puede ser eliminado.";
        echo json_encode($response);
        exit;
      }
    } else {
      $response["message"] = "No se encontró el rol especificado.";
      echo json_encode($response);
      exit;
    }

    // BLINDAJE 2: VERIFICAR SI HAY USUARIOS USANDO ESTE ROL
    // La tabla 'usuarios' la columna que guarda el rol se llama 'id_rol'
    $stmtCheckUsers = $dbh->prepare("SELECT COUNT(*) as total FROM usuarios WHERE id_rol = :id");
    $stmtCheckUsers->bindParam(':id', $id, PDO::PARAM_INT);
    $stmtCheckUsers->execute();
    $usersData = $stmtCheckUsers->fetch(PDO::FETCH_ASSOC);

    if ($usersData['total'] > 0) {
      $response["message"] = "No se puede eliminar. Hay " . $usersData['total'] . " usuario(s) utilizando este rol actualmente. Por favor reasígnalos primero o cambia el estatus del rol a Inactivo.";
      echo json_encode($response);
      exit;
    }

    // 3. ELIMINACIÓN SEGURA (Solo llega aquí si pasó los dos blindajes)
    $stmt = $dbh->prepare("DELETE FROM roles WHERE id_rol = :id");
    $stmt->bindParam(':id', $id, PDO::PARAM_INT);

    if ($stmt->execute()) {
      if ($stmt->rowCount() > 0) {
        $response["success"] = true;
        $response["message"] = "Rol eliminado correctamente.";
      } else {
        $response["message"] = "No se encontró un registro con ese ID.";
      }
    } else {
      $response["message"] = "Error al intentar eliminar el registro.";
    }
  } catch (PDOException $e) {
    // Protección final por si la base de datos detecta otra llave foránea
    $response["message"] = "Error de integridad: El rol está vinculado a otros registros y no puede ser borrado.";
  }
} else {
  $response["message"] = "Método no permitido o falta de un ID válido.";
}

header("Content-Type: application/json");
echo json_encode($response);
