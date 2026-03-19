<?php
require '../conexion.php';
header('Content-Type: application/json');

// Configuramos la zona horaria (Ajusta si estás en otra distinta a la del sistema general)
date_default_timezone_set('America/Mazatlan');

$id_cita = $_POST['id_cita'] ?? 0;
$fecha_inicio = $_POST['fecha_inicio'] ?? '';
$fecha_fin = $_POST['fecha_fin'] ?? '';

if (empty($id_cita) || empty($fecha_inicio) || empty($fecha_fin)) {
  echo json_encode(['success' => false, 'message' => 'Faltan datos de reprogramación.']);
  exit;
}

// VALIDACIÓN DE VIAJES EN EL TIEMPO
$fecha_inicio_obj = new DateTime($fecha_inicio);
$ahora = new DateTime();

// Le restamos 5 minutos de tolerancia al "ahora" igual que en el frontend
$ahora->modify('-5 minutes');

if ($fecha_inicio_obj < $ahora) {
  echo json_encode([
    'success' => false,
    'message' => 'No puedes reprogramar una cita hacia el pasado. Selecciona una fecha válida.'
  ]);
  exit;
}

try {
  // Si pasa la prueba del tiempo, actualizamos la base de datos
  $stmt = $dbh->prepare("UPDATE citas SET fecha_inicio = ?, fecha_fin = ? WHERE id_cita = ?");
  $stmt->execute([$fecha_inicio, $fecha_fin, $id_cita]);

  echo json_encode(['success' => true, 'message' => 'Cita reprogramada con éxito.']);
} catch (Exception $e) {
  echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
}
