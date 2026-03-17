<?php
session_start();
header("Content-Type: application/json");
require '../conexion.php';

$id_cotizacion = $_GET['id'] ?? 0;

try {
  // Buscamos la cabecera (Cliente y Total)
  $stmt = $dbh->prepare("
        SELECT c.*, cl.nombre_cliente, cl.papellido_cliente, cl.sapellido_cliente 
        FROM cotizaciones c 
        LEFT JOIN clientes cl ON c.id_cliente = cl.id_cliente 
        WHERE c.id_cotizacion = ?
    ");
  $stmt->execute([$id_cotizacion]);
  $cotizacion = $stmt->fetch(PDO::FETCH_ASSOC);

  if ($cotizacion) {
    // Armamos el nombre para la pantalla
    $nombre_completo = "Público en General";
    if ($cotizacion['id_cliente'] != 0) {
      $nombre_completo = trim($cotizacion['nombre_cliente'] . ' ' . $cotizacion['papellido_cliente'] . ' ' . $cotizacion['sapellido_cliente']);
    }
    $cotizacion['nombre_cliente_completo'] = $nombre_completo;

    // Buscamos los productos/servicios del carrito
    $stmtDet = $dbh->prepare("SELECT * FROM detalle_cotizaciones WHERE id_cotizacion = ?");
    $stmtDet->execute([$id_cotizacion]);
    $detalles = $stmtDet->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(['success' => true, 'cotizacion' => $cotizacion, 'detalles' => $detalles]);
  } else {
    echo json_encode(['success' => false, 'message' => 'Cotización no encontrada.']);
  }
} catch (Exception $e) {
  echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
}
