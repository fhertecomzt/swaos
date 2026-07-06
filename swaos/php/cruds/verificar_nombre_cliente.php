<?php
include "../conexion.php";

// Configurar la cabecera para JSON
header("Content-Type: application/json");

// Inicializar la respuesta por defecto
$response = ["existe" => false, "error" => ""];

try {
  $dbh->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
  $data = json_decode(file_get_contents("php://input"), true);

  // 1. Verificamos que se reciban los tres componentes del nombre
  if (!empty($data['cliente']) && !empty($data['papellido']) && !empty($data['sapellido'])) {

    $nombre = trim($data['cliente']);
    $papellido = trim($data['papellido']);
    $sapellido = trim($data['sapellido']);
    $id = isset($data['id']) ? intval($data['id']) : 0;

    if ($id > 0) {
      // CASO EDICIÓN: 
      // Buscamos si existe otro cliente con el mismo nombre completo pero con ID diferente
      $query = "SELECT COUNT(*) FROM clientes 
                WHERE nombre_cliente = ? 
                AND papellido_cliente = ? 
                AND sapellido_cliente = ? 
                AND id_cliente != ?";
      $stmt = $dbh->prepare($query);
      $stmt->execute([$nombre, $papellido, $sapellido, $id]);
    } else {
      // CASO CREACIÓN: 
      // Buscamos si ya existe alguien con la combinación exacta de nombre y apellidos
      $query = "SELECT COUNT(*) FROM clientes 
                WHERE nombre_cliente = ? 
                AND papellido_cliente = ? 
                AND sapellido_cliente = ?";
      $stmt = $dbh->prepare($query);
      $stmt->execute([$nombre, $papellido, $sapellido]);
    }

    $response["existe"] = $stmt->fetchColumn() > 0;
  } else {
    $response["error"] = "Faltan parámetros para la validación del nombre completo.";
  }
} catch (Exception $e) {
  $response["error"] = "Error al verificar el nombre: " . $e->getMessage();
}

echo json_encode($response);
