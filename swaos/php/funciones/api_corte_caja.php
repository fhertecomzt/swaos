<?php
session_start();
require '../conexion.php';
header('Content-Type: application/json');

date_default_timezone_set('America/Mazatlan');

try {
  $id_usuario = $_SESSION['id_usuario'] ?? $_SESSION['idusuario'] ?? 1;

  // EL CEREBRO FINANCIERO UNIFICADO (Idéntico al del Dashboard)
  $sqlFinanzas = "
      SELECT 
          LOWER(metodo_pago) as metodo, 
          
          -- ENTRADAS: Todo lo que no sea explícitamente una salida
          SUM(CASE WHEN tipo_movimiento NOT LIKE '%Retiro%' 
                    AND tipo_movimiento NOT LIKE '%Corte%' 
                    AND tipo_movimiento NOT LIKE '%Salida%' THEN total ELSE 0 END) as ingresos,
                    
          -- SALIDAS: Retiros, Cortes, Devoluciones físicas
          SUM(CASE WHEN tipo_movimiento LIKE '%Retiro%' 
                     OR tipo_movimiento LIKE '%Corte%' 
                     OR tipo_movimiento LIKE '%Salida%' THEN total ELSE 0 END) as egresos
                     
      FROM ventas 
      WHERE id_corte IS NULL AND id_usuario = ?
      GROUP BY LOWER(metodo_pago)
  ";

  $stmt = $dbh->prepare($sqlFinanzas);
  $stmt->execute([$id_usuario]);
  $finanzas = $stmt->fetchAll(PDO::FETCH_ASSOC);

  $total_efectivo_in = 0;
  $total_tarjeta_in = 0;
  $total_transferencia_in = 0;

  $total_efectivo_out = 0;
  $total_tarjeta_out = 0;
  $total_transferencia_out = 0;
  $total_retiros_global = 0;

  foreach ($finanzas as $row) {
    $metodo = trim($row['metodo']);
    $in = floatval($row['ingresos']);
    $out = floatval($row['egresos']);

    $total_retiros_global += $out;

    // Distribuimos el dinero según el método de pago
    if ($metodo === 'efectivo' || $metodo === '1' || $metodo === '') {
      $total_efectivo_in += $in;
      $total_efectivo_out += $out;
    } elseif ($metodo === 'tarjeta' || $metodo === '2') {
      $total_tarjeta_in += $in;
      $total_tarjeta_out += $out;
    } elseif ($metodo === 'transferencia' || $metodo === '3') {
      $total_transferencia_in += $in;
      $total_transferencia_out += $out;
    }
  }

  //  MATEMÁTICA PURA (NETO PARA EL CAJÓN)
  $efectivo_neto = $total_efectivo_in - $total_efectivo_out;
  $tarjeta_neto = $total_tarjeta_in - $total_tarjeta_out;
  $transferencia_neto = $total_transferencia_in - $total_transferencia_out;

  echo json_encode([
    'success' => true,
    'efectivo' => $efectivo_neto,
    'tarjeta' => $tarjeta_neto,
    'transferencia' => $transferencia_neto,
    'retiros' => $total_retiros_global,
    'fecha' => date('d/m/Y H:i')
  ]);
} catch (Exception $e) {
  echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
