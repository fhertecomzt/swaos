<?php
session_start();
require '../conexion.php';
header('Content-Type: application/json');

$id_usuario = $_SESSION['id_usuario'] ?? $_SESSION['idusuario'] ?? 1;

try {
  // Buscamos cuántas ventas hay de días anteriores (menor a hoy) que NO tengan asignado un corte.
  // OJO: Sustituye "id_corte" por el nombre real de tu columna si se llama diferente (ej. corte_caja_id)
  $stmt = $dbh->prepare("
        SELECT COUNT(*) as pendientes 
        FROM ventas 
        WHERE DATE(fecha_venta) < CURDATE() 
        AND (id_corte IS NULL OR id_corte = 0) 
        AND id_usuario = ?
    ");
  $stmt->execute([$id_usuario]);
  $data = $stmt->fetch(PDO::FETCH_ASSOC);

  if ($data['pendientes'] > 0) {
    echo json_encode(['bloquear' => true, 'mensaje' => 'Tienes ventas de días anteriores sin cortar.']);
  } else {
    echo json_encode(['bloquear' => false]);
  }
} catch (Exception $e) {
  // Si hay error, no bloqueamos por si acaso, pero avisamos en consola
  echo json_encode(['bloquear' => false, 'error' => $e->getMessage()]);
}
