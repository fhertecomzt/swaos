<?php
session_start();
require '../conexion.php';
header('Content-Type: application/json');
//Zona horaria
date_default_timezone_set('America/Mazatlan');

// VALIDACIÓN ESTRICTA (Si viene vacío, forzamos la fecha de hoy)
$fecha_inicio = !empty($_GET['inicio']) ? $_GET['inicio'] : date('Y-m-d');
$fecha_fin = !empty($_GET['fin']) ? $_GET['fin'] : date('Y-m-d');
$buscar = !empty($_GET['buscar']) ? $_GET['buscar'] : '';

try {
  // LA CONSULTA (Ahora ignora Retiros y Abonos para no ensuciar tu pantalla)
  $sql = "SELECT v.id_venta, DATE_FORMAT(v.fecha_venta, '%d/%m/%Y %H:%i') AS fecha_venta, v.total, v.estatus, 
                   IFNULL(c.nombre_cliente, 'Público en General') AS nombre_cliente
            FROM ventas v
            LEFT JOIN clientes c ON v.id_cliente = c.id_cliente
            WHERE DATE(v.fecha_venta) BETWEEN :inicio AND :fin
            AND v.tipo_movimiento NOT LIKE 'Retiro%' 
            AND v.tipo_movimiento NOT LIKE 'Anticipo%' 
            AND v.tipo_movimiento NOT LIKE 'Abono%'";

  $parametros = [
    ':inicio' => $fecha_inicio,
    ':fin' => $fecha_fin
  ];

  if (!empty($buscar)) {
    // Aseguramos buscar por la columna real c.nombre_cliente
    $sql .= " AND (v.id_venta = :folio OR c.nombre_cliente LIKE :texto)";
    $parametros[':folio'] = is_numeric($buscar) ? $buscar : 0;
    $parametros[':texto'] = "%" . $buscar . "%";
  }

  $sql .= " ORDER BY v.id_venta DESC";

  $stmt = $dbh->prepare($sql);
  $stmt->execute($parametros);
  $historial = $stmt->fetchAll(PDO::FETCH_ASSOC);

  // ENVIAMOS LOS DATOS
  echo json_encode($historial);
} catch (PDOException $e) {
  // EL CHIVATO: Si hay error, ahora sí nos lo va a decir en lugar de mandar []
  echo json_encode(['error' => 'Error SQL: ' . $e->getMessage()]);
}
