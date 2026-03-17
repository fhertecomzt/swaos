<?php
session_start();
header("Content-Type: application/json");
require '../conexion.php';

$id = $_GET['id'] ?? 0;

try {
  $stmt = $dbh->prepare("
        SELECT c.total, cl.nombre_cliente, cl.papellido_cliente, cl.email_cliente 
        FROM cotizaciones c
        LEFT JOIN clientes cl ON c.id_cliente = cl.id_cliente
        WHERE c.id_cotizacion = ?
    ");
  $stmt->execute([$id]);
  $data = $stmt->fetch(PDO::FETCH_ASSOC);

  if ($data) {
    $nombre = trim($data['nombre_cliente'] . ' ' . $data['papellido_cliente']);
    echo json_encode([
      'success' => true,
      'email' => $data['email_cliente'] ?? '',
      'nombre' => empty($nombre) ? 'Cliente' : $nombre,
      'total' => $data['total']
    ]);
  } else {
    echo json_encode(['success' => false]);
  }
} catch (Exception $e) {
  echo json_encode(['success' => false]);
}
