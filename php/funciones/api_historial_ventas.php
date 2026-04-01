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
  // GUARDIA DE SEGURIDAD (Taller actual)
  $id_taller_sesion = $_SESSION['taller_id'] ?? 1;

  // Agregamos tipo_movimiento y el candado de Sucursal
  $sql = "SELECT v.id_venta, folio_sucursal, DATE_FORMAT(v.fecha_venta, '%d/%m/%Y %H:%i') AS fecha_venta, v.total, v.estatus, 
                   IFNULL(c.nombre_cliente, 'Público en General') AS nombre_cliente, c.papellido_cliente,
                   v.tipo_movimiento
            FROM ventas v
            LEFT JOIN clientes c ON v.id_cliente = c.id_cliente
            WHERE DATE(v.fecha_venta) BETWEEN :inicio AND :fin
            AND v.id_taller = :id_taller 
            AND v.tipo_movimiento NOT LIKE 'Retiro%'"; // Filtro por Taller y escondemos retiros

  $parametros = [
    ':inicio' => $fecha_inicio,
    ':fin' => $fecha_fin,
    ':id_taller' => $id_taller_sesion // Pasamos el parámetro de seguridad
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
  echo json_encode(['error' => 'Error SQL: ' . $e->getMessage()]);
}
