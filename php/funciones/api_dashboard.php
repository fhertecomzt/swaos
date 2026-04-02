<?php
session_start();
header('Content-Type: application/json');
require '../conexion.php';

try {
  // GUARDIA DE SEGURIDAD (Taller actual)
  $id_taller = $_SESSION['taller_id'] ?? 1;

  // 1. CATÁLOGOS GLOBALES (Estos se quedan igual, compartidos entre sucursales)
  $productos = $dbh->query("SELECT COUNT(*) as total FROM productos WHERE estatus = 0")->fetch(PDO::FETCH_ASSOC)['total'];
  $clientes = $dbh->query("SELECT COUNT(*) as total FROM clientes WHERE estatus = 0")->fetch(PDO::FETCH_ASSOC)['total'];
  $proveedores = $dbh->query("SELECT COUNT(*) as total FROM proveedores WHERE estatus = 0")->fetch(PDO::FETCH_ASSOC)['total'];

  // 2. CONTADORES OPERATIVOS (Blindados por Taller)
  $stmtPendientes = $dbh->prepare("SELECT COUNT(*) as total FROM ordenesservicio WHERE id_estado_servicio IN (1,3,4) AND id_taller = ?");
  $stmtPendientes->execute([$id_taller]);
  $opendientes = $stmtPendientes->fetch(PDO::FETCH_ASSOC)['total'];

  $stmtListas = $dbh->prepare("SELECT COUNT(*) as total FROM ordenesservicio WHERE id_estado_servicio = 6 AND id_taller = ?");
  $stmtListas->execute([$id_taller]);
  $olistas = $stmtListas->fetch(PDO::FETCH_ASSOC)['total'];

  // 3. EL CEREBRO FINANCIERO (Viendo el dinero de la Sucursal, no de todos)
  $sqlFinanzas = "
      SELECT 
          LOWER(metodo_pago) as metodo, 
          SUM(CASE WHEN tipo_movimiento NOT LIKE '%Retiro%' AND tipo_movimiento NOT LIKE '%Corte%' AND tipo_movimiento NOT LIKE '%Salida%' THEN total ELSE 0 END) as ingresos_brutos,
          SUM(CASE WHEN tipo_movimiento NOT LIKE '%Retiro%' AND tipo_movimiento NOT LIKE '%Corte%' AND tipo_movimiento NOT LIKE '%Salida%' AND (estatus IS NULL OR estatus != 'Cancelada') THEN total ELSE 0 END) as ventas_netas,
          SUM(CASE WHEN tipo_movimiento LIKE '%Retiro%' OR tipo_movimiento LIKE '%Corte%' OR tipo_movimiento LIKE '%Salida%' THEN total ELSE 0 END) as egresos
      FROM ventas 
      WHERE id_corte IS NULL AND id_taller = ? 
      GROUP BY LOWER(metodo_pago)
  ";
  // Nota: Cambiamos "id_usuario = ?" por "id_taller = ?" para que el gerente vea todo lo de su sucursal.

  $stmtFinanzas = $dbh->prepare($sqlFinanzas);
  $stmtFinanzas->execute([$id_taller]);
  $finanzas = $stmtFinanzas->fetchAll(PDO::FETCH_ASSOC);

  $ventas_totales = 0;
  $efectivo_caja = 0;
  $ingresos_banco = 0;

  foreach ($finanzas as $row) {
    $metodo = trim($row['metodo']);
    $in_bruto = floatval($row['ingresos_brutos']);
    $ventas_netas = floatval($row['ventas_netas']);
    $out = floatval($row['egresos']);

    $ventas_totales += $ventas_netas;

    if ($metodo === 'efectivo' || $metodo === '1' || $metodo === '') {
      $efectivo_caja += ($in_bruto - $out);
    } elseif ($metodo === 'tarjeta' || $metodo === '2' || $metodo === 'transferencia' || $metodo === '3') {
      $ingresos_banco += ($in_bruto - $out);
    }
  }

  // 4. DATOS PARA LA GRÁFICA Y TABLA (Blindados por Taller)
  $stmtGrafica = $dbh->prepare("SELECT e.estado_servicio as estado, COUNT(o.id_orden) as total 
                              FROM ordenesservicio o 
                              JOIN estadosservicios e ON o.id_estado_servicio = e.id_estado_servicio 
                              WHERE o.id_taller = ?
                              GROUP BY e.estado_servicio");
  $stmtGrafica->execute([$id_taller]);
  $datosGrafica = $stmtGrafica->fetchAll(PDO::FETCH_ASSOC);

  //  Agregamos "folio_sucursal" al SQL para que el Humano lo vea
  $stmtTabla = $dbh->prepare("SELECT o.id_orden, o.folio_sucursal, c.nombre_cliente as cliente, e.estado_servicio as estado 
                            FROM ordenesservicio o 
                            JOIN clientes c ON o.id_cliente = c.id_cliente 
                            JOIN estadosservicios e ON o.id_estado_servicio = e.id_estado_servicio 
                            WHERE o.id_taller = ?
                            ORDER BY o.id_orden DESC LIMIT 5");
  $stmtTabla->execute([$id_taller]);
  $ultimasOrdenes = $stmtTabla->fetchAll(PDO::FETCH_ASSOC);

  // Enviamos TODO
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
