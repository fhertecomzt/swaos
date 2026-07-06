<?php
session_start();
require '../conexion.php';
header('Content-Type: application/json');

// SEGURIDAD BÁSICA
if (!isset($_GET['id']) || empty($_GET['id'])) {
  echo json_encode(['success' => false, 'message' => 'No se proporcionó el ID del cliente.']);
  exit;
}

$id_cliente = filter_var($_GET['id'], FILTER_SANITIZE_NUMBER_INT);

try {
  // EXTRAER EL PERFIL DEL CLIENTE
  $stmtCliente = $dbh->prepare("SELECT * FROM clientes WHERE id_cliente = ?");
  $stmtCliente->execute([$id_cliente]);
  $cliente = $stmtCliente->fetch(PDO::FETCH_ASSOC);

  if (!$cliente) {
    echo json_encode(['success' => false, 'message' => 'Cliente no encontrado en la base de datos.']);
    exit;
  }

  // Armamos su nombre completo y dirección limpia
  $nombre_completo = trim($cliente['nombre_cliente'] . ' ' . $cliente['papellido_cliente'] . ' ' . $cliente['sapellido_cliente']);

  $direccion = trim($cliente['calle_cliente'] . ' ' . $cliente['noext_cliente']);
  if (!empty($cliente['noint_cliente'])) {
    $direccion .= ' Int. ' . $cliente['noint_cliente'];
  }
  if (empty(trim($direccion))) $direccion = 'Dirección no registrada';

  // EXTRAER EL HISTORIAL DE ÓRDENES Y EQUIPOS (El corazón del LTV)
  // Hacemos JOIN con equipos, marcas y estados para traer toda la historia clínica
  $sqlOrdenes = "SELECT o.*, 
                          IFNULL(e.nombre_equipo, 'Equipo Genérico') as nombre_equipo, 
                          IFNULL(m.nom_marca, '') as nom_marca, 
                          IFNULL(es.estado_servicio, 'Desconocido') as estado
                   FROM ordenesservicio o
                   LEFT JOIN equipos e ON o.id_equipo = e.id_equipo
                   LEFT JOIN marcas m ON o.id_marca = m.id_marca
                   LEFT JOIN estadosservicios es ON o.id_estado_servicio = es.id_estado_servicio
                   WHERE o.id_cliente = ?
                   ORDER BY o.id_orden DESC";

  $stmtOrdenes = $dbh->prepare($sqlOrdenes);
  $stmtOrdenes->execute([$id_cliente]);
  $ordenes_db = $stmtOrdenes->fetchAll(PDO::FETCH_ASSOC);

  // MATEMÁTICAS FINANCIERAS Calcular el LTV 
  $total_gastado = 0;
  $total_ordenes = count($ordenes_db);
  $total_canceladas = 0;
  $lista_ordenes = [];

  foreach ($ordenes_db as $ord) {
    $estado = strtolower($ord['estado']);
    $costo = floatval($ord['costo_servicio'] ?? 0);

    // Si la orden se canceló, no sumamos el dinero a su perfil
    if (strpos($estado, 'cancelado') !== false) {
      $total_canceladas++;
    } else {
      $total_gastado += $costo;
    }

    // Detectar automáticamente cómo se llama la columna de Fecha
    $fecha_raw = $ord['fecha_recepcion'] ?? $ord['fecha_orden'] ?? $ord['fecha'] ?? $ord['creado_servicio'] ?? null;
    $fecha = $fecha_raw ? date('d/m/Y', strtotime($fecha_raw)) : 'N/A';

    // Detectar cómo se llama la columna de Falla/Diagnóstico
    $falla = $ord['falla_reportada'] ?? $ord['falla'] ?? $ord['diagnostico'] ?? 'Revisión General';

    // Llenamos el arreglo limpio para el JavaScript
    $lista_ordenes[] = [
      'folio' => $ord['id_orden'],
      'fecha' => $fecha,
      'equipo' => trim($ord['nombre_equipo'] . ' ' . $ord['nom_marca']),
      'falla' => htmlspecialchars($falla),
      'estado' => strtoupper($ord['estado']),
      'costo' => $costo
    ];
  }

  // ENVIAR PAQUETE DE DATOS AL FRONTEND
  $respuesta = [
    'success' => true,
    'cliente' => [
      'nombre' => htmlspecialchars($nombre_completo),
      'telefono' => $cliente['tel_cliente'] ?: 'N/A',
      'email' => $cliente['email_cliente'] ?: 'N/A',
      'direccion' => htmlspecialchars($direccion)
    ],
    'estadisticas' => [
      'total_gastado' => $total_gastado,
      'total_ordenes' => $total_ordenes,
      'total_canceladas' => $total_canceladas
    ],
    'ordenes' => $lista_ordenes
  ];

  echo json_encode($respuesta);
} catch (Exception $e) {
  echo json_encode(['success' => false, 'message' => 'Error de Base de Datos: ' . $e->getMessage()]);
}
