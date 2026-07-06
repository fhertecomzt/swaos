<?php
session_start();
require '../conexion.php';
header('Content-Type: application/json');

$datos = json_decode(file_get_contents('php://input'), true);

if (!$datos || empty($datos['motivo']) || empty($datos['monto'])) {
  echo json_encode(['success' => false, 'message' => 'Datos incompletos.']);
  exit;
}

$id_usuario = $_SESSION['id_usuario'] ?? $_SESSION['idusuario'] ?? 1;
$monto = floatval($datos['monto']);
$motivo = filter_var($datos['motivo'], FILTER_SANITIZE_STRING);

// Construimos la etiqueta para que el Corte de Caja la reconozca
$tipo_movimiento = "Retiro: " . $motivo;

try {
  // Insertamos el retiro en la tabla ventas. 
  // Siempre sale en Efectivo (porque es dinero del cajón).
  $sql = "INSERT INTO ventas (id_usuario, total, metodo_pago, tipo_movimiento) VALUES (?, ?, 'Efectivo', ?)";
  $stmt = $dbh->prepare($sql);
  $stmt->execute([$id_usuario, $monto, $tipo_movimiento]);

  echo json_encode(['success' => true, 'message' => 'Retiro registrado correctamente.']);
} catch (Exception $e) {
  echo json_encode(['success' => false, 'message' => 'Error de BD: ' . $e->getMessage()]);
}
