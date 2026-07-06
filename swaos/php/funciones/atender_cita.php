<?php
require '../conexion.php';
header('Content-Type: application/json');

$id_cita = $_POST['id_cita'] ?? 0;

if (empty($id_cita)) {
  echo json_encode(['success' => false, 'message' => 'Falta el ID de la cita.']);
  exit;
}

try {
  // Cambiamos el estatus a Atendida y el color a Verde 
  $stmt = $dbh->prepare("UPDATE citas SET estatus = 'Atendida', color_evento = '#28a745' WHERE id_cita = ?");
  $stmt->execute([$id_cita]);

  echo json_encode(['success' => true]);
} catch (Exception $e) {
  echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
}
