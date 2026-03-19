<?php
require '../conexion.php';
header('Content-Type: application/json');

$id_cita = $_POST['id_cita'] ?? 0;

if (empty($id_cita)) {
  echo json_encode(['success' => false, 'message' => 'Falta el ID de la cita.']);
  exit;
}

try {
  $stmt = $dbh->prepare("UPDATE citas SET estatus = 'Cancelada' WHERE id_cita = ?");
  $stmt->execute([$id_cita]);

  echo json_encode(['success' => true, 'message' => 'La cita ha sido cancelada y removida de la agenda.']);
} catch (Exception $e) {
  echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
}
