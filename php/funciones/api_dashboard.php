<?php
header('Content-Type: application/json');
require '../conexion.php';

try {
  // 1. CONTADORES DE LAS TARJETAS OPERATIVAS
  $productos = $dbh->query("SELECT COUNT(*) as total FROM productos WHERE estatus = 0")->fetch(PDO::FETCH_ASSOC)['total'];
  $clientes = $dbh->query("SELECT COUNT(*) as total FROM clientes WHERE estatus = 0")->fetch(PDO::FETCH_ASSOC)['total'];
  $proveedores = $dbh->query("SELECT COUNT(*) as total FROM proveedores WHERE estatus = 0")->fetch(PDO::FETCH_ASSOC)['total'];

  $opendientes = $dbh->query("SELECT COUNT(*) as total FROM ordenesservicio WHERE id_estado_servicio IN (1,3,4)")->fetch(PDO::FETCH_ASSOC)['total'];
  $olistas = $dbh->query("SELECT COUNT(*) as total FROM ordenesservicio WHERE id_estado_servicio = 6")->fetch(PDO::FETCH_ASSOC)['total'];

  // 2. EL CEREBRO FINANCIERO (Separando Efectivo, Tarjeta y Transferencia)
  $id_usuario_dashboard = $_SESSION['id_usuario'] ?? $_SESSION['idusuario'] ?? 1;

  $sqlFinanzas = "
      SELECT 
          LOWER(metodo_pago) as metodo, 
          SUM(CASE WHEN tipo_movimiento LIKE '%Venta%' 
                     OR tipo_movimiento LIKE '%Abono%' 
                     OR tipo_movimiento LIKE '%Anticipo%' 
                     OR tipo_movimiento LIKE '%Ingreso%' 
                     OR tipo_movimiento LIKE '%Liquidacion%' THEN total ELSE 0 END) as ingresos,
                     
          SUM(CASE WHEN tipo_movimiento LIKE '%Retiro%' 
                     OR tipo_movimiento LIKE '%Corte%' 
                     OR tipo_movimiento LIKE '%Salida%' THEN total ELSE 0 END) as egresos
      FROM ventas 
      WHERE id_corte IS NULL AND id_usuario = ?
      GROUP BY LOWER(metodo_pago)
  ";

  $stmtFinanzas = $dbh->prepare($sqlFinanzas);
  $stmtFinanzas->execute([$id_usuario_dashboard]);
  $finanzas = $stmtFinanzas->fetchAll(PDO::FETCH_ASSOC);

  $ventas_totales = 0;
  $efectivo_caja = 0;
  $ingresos_banco = 0;

  foreach ($finanzas as $row) {
    $metodo = trim($row['metodo']);
    $in = floatval($row['ingresos']);
    $out = floatval($row['egresos']);

    // Todo lo que entra es "Venta Total del Día"
    $ventas_totales += $in;

    // Filtramos por métodos de pago
    if ($metodo === 'efectivo' || $metodo === '1' || $metodo === '') {
      $efectivo_caja += ($in - $out); // Al efectivo sí le restamos los gastos/retiros físicos
    } elseif ($metodo === 'tarjeta' || $metodo === '2') {
      $ingresos_banco += $in;
    } elseif ($metodo === 'transferencia' || $metodo === '3') {
      $ingresos_banco += $in;
    }
  }

  // 3. DATOS PARA LA GRÁFICA Y TABLA
  $stmtGrafica = $dbh->query("SELECT e.estado_servicio as estado, COUNT(o.id_orden) as total 
                              FROM ordenesservicio o 
                              JOIN estadosservicios e ON o.id_estado_servicio = e.id_estado_servicio 
                              GROUP BY e.estado_servicio");
  $datosGrafica = $stmtGrafica->fetchAll(PDO::FETCH_ASSOC);

  $stmtTabla = $dbh->query("SELECT o.id_orden, c.nombre_cliente as cliente, e.estado_servicio as estado 
                            FROM ordenesservicio o 
                            JOIN clientes c ON o.id_cliente = c.id_cliente 
                            JOIN estadosservicios e ON o.id_estado_servicio = e.id_estado_servicio 
                            ORDER BY o.id_orden DESC LIMIT 5");
  $ultimasOrdenes = $stmtTabla->fetchAll(PDO::FETCH_ASSOC);

  // Enviamos TODO en un solo paquete JSON
  echo json_encode([
    'productos' => $productos,
    'clientes' => $clientes,
    'proveedores' => $proveedores,
    'ventas_totales' => $ventas_totales,
    'efectivo_caja' => $efectivo_caja,
    'ingresos_banco' => $ingresos_banco,
    'opendientes' => $opendientes,
    'olistas' => $olistas,
    'grafica' => $datosGrafica,
    'ultimas_ordenes' => $ultimasOrdenes
  ]);
} catch (PDOException $e) {
  echo json_encode(['error' => 'Error en BD: ' . $e->getMessage()]);
}
