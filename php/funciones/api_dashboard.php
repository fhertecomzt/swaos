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
          
          -- A. Entradas de dinero físicas
          SUM(CASE WHEN tipo_movimiento NOT LIKE '%Retiro%' 
                    AND tipo_movimiento NOT LIKE '%Corte%' 
                    AND tipo_movimiento NOT LIKE '%Salida%' THEN total ELSE 0 END) as ingresos_brutos,
                     
          -- B. Ventas netas (Ignoramos canceladas para el KPI de Ventas Totales)
          SUM(CASE WHEN tipo_movimiento NOT LIKE '%Retiro%' 
                    AND tipo_movimiento NOT LIKE '%Corte%' 
                    AND tipo_movimiento NOT LIKE '%Salida%' 
                    AND (estatus IS NULL OR estatus != 'Cancelada') THEN total ELSE 0 END) as ventas_netas,
                     
          -- C. Salidas de dinero físicas (Todo lo que diga Retiro, Salida o Corte)
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
    $in_bruto = floatval($row['ingresos_brutos']);
    $ventas_netas = floatval($row['ventas_netas']);
    $out = floatval($row['egresos']);

    // 🎯 Tarjeta Azul (Ventas Totales): Matemáticamente exacta
    $ventas_totales += $ventas_netas;

    // 🎯 Flujo de dinero real (Entradas físicas - Salidas físicas)
    if ($metodo === 'efectivo' || $metodo === '1' || $metodo === '') {
      $efectivo_caja += ($in_bruto - $out);
    } elseif ($metodo === 'tarjeta' || $metodo === '2') {
      $ingresos_banco += ($in_bruto - $out);
    } elseif ($metodo === 'transferencia' || $metodo === '3') {
      $ingresos_banco += ($in_bruto - $out);
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
