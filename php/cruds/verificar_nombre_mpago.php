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

  // Verificar que se recibió el nombre
  if (!empty($data['mpago'])) {
    $mpago = trim($data['mpago']); // Limpiar el nombre
    $id = isset($data['id']) ? intval($data['id']) : 0; // ID (opcional)

    // Si se proporciona un ID (edición), excluir ese registro de la validación
    if ($id > 0) {
      $query = "SELECT COUNT(*) FROM mpagos WHERE nommpago = ? AND idmpago != ?";
      $stmt = $dbh->prepare($query);
      $stmt->execute([$mpago, $id]);
    } else {
      // Si no hay ID, es un registro nuevo
      $query = "SELECT COUNT(*) FROM mpagos WHERE nommpago = ?";
      $stmt = $dbh->prepare($query);
      $stmt->execute([$mpago]);
    }

    // Actualizar la respuesta en función del resultado
    $response["existe"] = $stmt->fetchColumn() > 0;
  } else {
    $response["error"] = "Falta el parámetro 'mpago'.";
  }
} catch (Exception $e) {
  // Capturar errores y devolverlos en la respuesta
  $response["error"] = "Error al verificar el nombre: " . $e->getMessage();
}

// Devolver la respuesta en formato JSON
echo json_encode($response);
