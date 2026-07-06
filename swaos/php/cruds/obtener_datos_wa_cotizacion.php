<?php
session_start();
header("Content-Type: application/json");
require '../conexion.php';

$id_cotizacion = $_GET['id'] ?? 0;

if (empty($id_cotizacion)) {
  echo json_encode(['success' => false, 'message' => 'Folio inválido.']);
  exit;
}

try {
  $stmt = $dbh->prepare("
        SELECT c.id_cotizacion, c.total, 
               cl.nombre_cliente, cl.papellido_cliente, cl.tel_cliente 
        FROM cotizaciones c
        LEFT JOIN clientes cl ON c.id_cliente = cl.id_cliente
        WHERE c.id_cotizacion = ?
    ");
  $stmt->execute([$id_cotizacion]);
  $data = $stmt->fetch(PDO::FETCH_ASSOC);

  if ($data) {
    $nombre = trim($data['nombre_cliente'] . ' ' . $data['papellido_cliente']);
    if (empty($nombre)) $nombre = "Cliente";

    // FABRICAMOS LA FIRMA PARA EL WHATSAPP
    $llave_secreta = "SWAOS_S3CR3T_2026_!#";
    $token = hash('sha256', $id_cotizacion . $llave_secreta);

    echo json_encode([
      'success' => true,
      'telefono' => $data['tel_cliente'] ?? '',
      'nombre' => $nombre,
      'total' => $data['total'],
      'token' => $token // <-- Mandamos el token de seguridad al JavaScript
    ]);
  } else {
    echo json_encode(['success' => false, 'message' => 'No se encontró la cotización.']);
  }
} catch (Exception $e) {
  echo json_encode(['success' => false, 'message' => 'Error en BD: ' . $e->getMessage()]);
}
