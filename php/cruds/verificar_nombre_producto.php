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
  if (!empty($data['producto']) || !empty($data['codebar'])) {
    $nombre = isset($data['producto']) ? trim($data['producto']) : null;
    $codebar = isset($data['codebar']) ? trim($data['codebar']) : null;
    $id = isset($data['id']) ? intval($data['id']) : 0; // ID (opcional)

    // Construcción de la consulta dinámica
    $query = "SELECT COUNT(*) FROM productos WHERE ";
    $params = [];

    if ($nombre) {
      $query .= "nom_prod = ? ";
      $params[] = $nombre;
    }

    if ($codebar) {
      if (!empty($params)) $query .= " OR "; // Agregar OR si ya hay una condición
      $query .= "codbar_prod = ? ";
      $params[] = $codebar;
    }

    if ($id > 0) {
      $query .= "AND idproducto != ?";
      $params[] = $id;
    }

    // Preparar y ejecutar la consulta
    $stmt = $dbh->prepare($query);
    $stmt->execute($params);

    // Actualizar la respuesta en función del resultado
    $response["existe"] = $stmt->fetchColumn() > 0;
  } else {
    $response["error"] = "Falta al menos un parámetro ('producto' o 'codebar').";
  }
} catch (Exception $e) {
  // Capturar errores y devolverlos en la respuesta
  $response["error"] = "Error al verificar: " . $e->getMessage();
}

// Devolver la respuesta en formato JSON
echo json_encode($response);
