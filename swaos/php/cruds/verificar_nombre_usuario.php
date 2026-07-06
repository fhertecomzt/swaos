<?php
include "../conexion.php";

// Configurar la cabecera para JSON
header("Content-Type: application/json");

// Inicializar la respuesta por defecto
$response = ["existe" => false, "error" => ""];

try {
  // Configurar el manejo de errores de PDO
  $dbh->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

  // Leer el cuerpo de la solicitud y decodificar JSON
  $data = json_decode(file_get_contents("php://input"), true);

  // Verificar que al menos uno de los parámetros esté presente
  if (!empty($data['usuario'])) {
    $usuario = isset($data['usuario']) ? trim($data['usuario']) : null;
    $id = isset($data['id']) ? intval($data['id']) : 0; // ID (opcional)

    // Si se proporciona un ID (edición), excluir ese registro de la validación
    if ($id > 0) {
      $query = "SELECT COUNT(*) FROM usuarios WHERE usuario = ? AND id_usuario != ?";
      $stmt = $dbh->prepare($query);
      $stmt->execute([$usuario, $id]);
    } else {
      // Si no hay ID, es un registro nuevo
      $query = "SELECT COUNT(*) FROM usuarios WHERE usuario = ?";
      $stmt = $dbh->prepare($query);
      $stmt->execute([$usuario]);
    }

    // Actualizar la respuesta en función del resultado
    $response["existe"] = $stmt->fetchColumn() > 0;
  } else {
    $response["error"] = "Falta el parámetro 'usuario'.";
  }
} catch (Exception $e) {
  // Capturar errores y devolverlos en la respuesta
  $response["error"] = "Error al verificar el usuario: " . $e->getMessage();
}

// Devolver la respuesta en formato JSON
echo json_encode($response);
