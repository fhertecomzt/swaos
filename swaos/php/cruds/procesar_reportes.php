<?php
// Ocultar errores en pantalla para no romper el JSON
ini_set('display_errors', 0);
session_start(); //  1. VITAL: Iniciamos sesión para saber en qué sucursal estamos
header('Content-Type: application/json; charset=utf-8');

require '../conexion.php';

//  2. CAPTURAMOS LA SUCURSAL
$id_taller_sesion = $_SESSION['taller_id'] ?? 1;

// Recibir los datos del JavaScript (fetch)
$datos = json_decode(file_get_contents('php://input'), true);

$tipo_reporte = $datos['tipo_reporte'] ?? '';
$fecha_inicio = $datos['fecha_inicio'] ?? date('Y-m-01');
$fecha_fin = $datos['fecha_fin'] ?? date('Y-m-t');

// Validaciones básicas de seguridad
if (empty($tipo_reporte) || empty($fecha_inicio) || empty($fecha_fin)) {
  echo json_encode(['success' => false, 'message' => 'Faltan parámetros para el reporte.']);
  exit;
}

// Variables de respuesta
$response = ['success' => false, 'data' => [], 'total' => 0, 'registros' => 0];
$total_calculado = 0;

try {
  // ====================================================================
  // REPORTE DE ÓRDENES DE SERVICIO
  // ====================================================================
  if ($tipo_reporte === 'ordenes') {
    // 3. Agregamos o.folio_sucursal al SELECT y o.id_taller al WHERE
    $sql = "SELECT o.id_orden, o.folio_sucursal, o.costo_servicio, DATE(o.creado_servicio) as fecha,
                       IFNULL(c.nombre_cliente, 'Cliente Eliminado') as cliente,
                       IFNULL(e.nombre_equipo, 'Equipo') as equipo,
                       IFNULL(m.nom_marca, '') as marca,
                       IFNULL(es.estado_servicio, 'Desconocido') as estatus
                FROM ordenesservicio o
                LEFT JOIN clientes c ON o.id_cliente = c.id_cliente
                LEFT JOIN equipos e ON o.id_equipo = e.id_equipo
                LEFT JOIN marcas m ON o.id_marca = m.id_marca
                LEFT JOIN estadosservicios es ON o.id_estado_servicio = es.id_estado_servicio
                WHERE DATE(o.creado_servicio) >= ? AND DATE(o.creado_servicio) <= ?
                AND o.id_taller = ?
                ORDER BY o.id_orden DESC";

    $stmt = $dbh->prepare($sql);
    $stmt->execute([$fecha_inicio, $fecha_fin, $id_taller_sesion]); // Pasamos el candado
    $resultados = $stmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($resultados as $fila) {
      $nombre_completo_equipo = trim($fila['equipo'] . ' ' . $fila['marca']);

      $response['data'][] = [
        'folio' => '#' . str_pad($fila['folio_sucursal'], 5, "0", STR_PAD_LEFT), // Mostramos el folio bonito
        'fecha' => date("d/m/Y", strtotime($fila['fecha'])),
        'cliente' => $fila['cliente'],
        'equipo' => $nombre_completo_equipo,
        'estatus' => $fila['estatus'],
        'costo' => '$' . number_format($fila['costo_servicio'], 2)
      ];

      if (strtolower($fila['estatus']) !== 'cancelado') {
        $total_calculado += floatval($fila['costo_servicio']);
      }
    }
  }

  // REPORTE DE VENTAS GENERALES
  if ($tipo_reporte === 'ventas') {
    //  Agregamos folio_sucursal y filtramos por id_taller
    $sql = "SELECT v.id_venta, v.folio_sucursal, v.total, DATE(v.fecha_venta) as fecha, v.metodo_pago,
                       IFNULL(c.nombre_cliente, 'Público en General') as cliente
                FROM ventas v
                LEFT JOIN clientes c ON v.id_cliente = c.id_cliente
                WHERE DATE(v.fecha_venta) >= ? AND DATE(v.fecha_venta) <= ?
                AND v.id_taller = ?
                ORDER BY v.id_venta DESC";

    $stmt = $dbh->prepare($sql);
    $stmt->execute([$fecha_inicio, $fecha_fin, $id_taller_sesion]); // Candado
    $resultados = $stmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($resultados as $fila) {
      $response['data'][] = [
        'folio' => 'V-' . str_pad($fila['folio_sucursal'], 5, "0", STR_PAD_LEFT), // Folio bonito
        'fecha' => date("d/m/Y", strtotime($fila['fecha'])),
        'cliente' => $fila['cliente'],
        'metodo' => $fila['metodo_pago'] ?? 'Efectivo',
        'total' => '$' . number_format($fila['total'], 2)
      ];
      $total_calculado += floatval($fila['total']);
    }
  }

  // REPORTE DE INVENTARIO Y PRODUCTOS
  if ($tipo_reporte === 'inventario' || $tipo_reporte === 'conteo') {
    // Solo sumarizamos el stock de la sucursal activa en el JOIN
    $sql = "SELECT 
                    p.id_prod,
                    p.codebar_prod, 
                    p.nombre_prod, 
                    p.costo_prod, 
                    p.precio, 
                    IFNULL(SUM(i.stock), 0) as stock_total 
                FROM productos p
                LEFT JOIN inventario_sucursal i ON p.id_prod = i.id_prod AND i.idtaller = ?
                GROUP BY p.id_prod
                ORDER BY p.nombre_prod ASC";

    $stmt = $dbh->prepare($sql);
    $stmt->execute([$id_taller_sesion]); // Solo le pasamos el ID del taller
    $resultados = $stmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($resultados as $fila) {
      $response['data'][] = [
        'codigo' => !empty($fila['codebar_prod']) ? $fila['codebar_prod'] : 'S/C',
        'producto' => $fila['nombre_prod'],
        'costo' => '$' . number_format($fila['costo_prod'], 2),
        'venta' => '$' . number_format($fila['precio'], 2),
        'stock' => $fila['stock_total'] // Solo mostrará el stock de ESTE taller
      ];

      $total_calculado += (floatval($fila['costo_prod']) * intval($fila['stock_total']));
    }
  }

  // REPORTE DE CORTE DE CAJA (FINANZAS)
  if ($tipo_reporte === 'caja') {
    //  Filtramos las cajas solo para las ventas del taller activo
    $sql = "SELECT DATE(v.fecha_venta) as fecha,
                       IFNULL(u.usuario, 'Sistema/Admin') as cajero,
                       IFNULL(v.metodo_pago, 'Efectivo') as metodo_pago,
                       COUNT(v.id_venta) as num_transacciones,
                       SUM(v.total) as total_ingresos
                FROM ventas v
                LEFT JOIN usuarios u ON v.id_usuario = u.id_usuario
                WHERE DATE(v.fecha_venta) >= ? AND DATE(v.fecha_venta) <= ?
                AND v.id_taller = ?
                GROUP BY DATE(v.fecha_venta), u.id_usuario, v.metodo_pago
                ORDER BY DATE(v.fecha_venta) DESC";

    $stmt = $dbh->prepare($sql);
    $stmt->execute([$fecha_inicio, $fecha_fin, $id_taller_sesion]); // Candado
    $resultados = $stmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($resultados as $fila) {
      $response['data'][] = [
        'fecha' => date("d/m/Y", strtotime($fila['fecha'])),
        'cajero' => $fila['cajero'],
        'metodo' => $fila['metodo_pago'],
        'transacciones' => $fila['num_transacciones'],
        'total' => '$' . number_format($fila['total_ingresos'], 2)
      ];

      $total_calculado += floatval($fila['total_ingresos']);
    }
  }

  $response['success'] = true;
  $response['registros'] = count($response['data']);
  $response['total'] = '$' . number_format($total_calculado, 2);

  echo json_encode($response);
} catch (PDOException $e) {
  echo json_encode(['success' => false, 'message' => 'Error de Base de Datos: ' . $e->getMessage()]);
}