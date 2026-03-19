<?php
session_start();
require '../conexion.php';
header('Content-Type: application/json');

date_default_timezone_set('America/Mazatlan');

try {
  $id_usuario = $_SESSION['id_usuario'] ?? $_SESSION['idusuario'] ?? 1;

  $sqlIngresos = "SELECT LOWER(metodo_pago) as metodo, SUM(total) as suma 
                    FROM ventas 
                    WHERE id_corte IS NULL AND id_usuario = ? 
                    AND (
                        tipo_movimiento LIKE '%Venta%' 
                        OR tipo_movimiento LIKE '%Abono%' 
                        OR tipo_movimiento LIKE '%Anticipo%' 
                        OR tipo_movimiento LIKE '%Ingreso%'
                        OR tipo_movimiento LIKE '%Liquidacion%'
                    )
                    GROUP BY LOWER(metodo_pago)";
  $stmt = $dbh->prepare($sqlIngresos);
  $stmt->execute([$id_usuario]);
  $ingresos = $stmt->fetchAll(PDO::FETCH_ASSOC);

  $total_efectivo_in = 0;
  $total_tarjeta_in = 0;
  $total_transferencia_in = 0;

  foreach ($ingresos as $row) {
    $metodo = trim($row['metodo']);
    // IFNULL programático usando floatval para evitar errores matemáticos
    if ($metodo === 'efectivo' || $metodo === '1' || $metodo === '') $total_efectivo_in += floatval($row['suma']);
    if ($metodo === 'tarjeta' || $metodo === '2') $total_tarjeta_in += floatval($row['suma']);
    if ($metodo === 'transferencia' || $metodo === '3') $total_transferencia_in += floatval($row['suma']);
  }

  // SALIDAS: Todo lo que resta dinero (Devoluciones, Retiros, Cortes)
  $sqlRetiros = "SELECT LOWER(metodo_pago) as metodo, SUM(total) as suma_retiros 
                   FROM ventas 
                   WHERE id_corte IS NULL AND id_usuario = ? 
                   AND (tipo_movimiento LIKE '%Retiro%' OR tipo_movimiento LIKE '%Corte%' OR tipo_movimiento LIKE '%Salida%')
                   GROUP BY LOWER(metodo_pago)";
  $stmtRetiros = $dbh->prepare($sqlRetiros);
  $stmtRetiros->execute([$id_usuario]);
  $retiros = $stmtRetiros->fetchAll(PDO::FETCH_ASSOC);

  $total_efectivo_out = 0;
  $total_tarjeta_out = 0;
  $total_transferencia_out = 0;
  $total_retiros_global = 0;

  foreach ($retiros as $row) {
    $metodo = trim($row['metodo']);
    $monto = floatval($row['suma_retiros']);
    $total_retiros_global += $monto;

    if ($metodo === 'efectivo' || $metodo === '1' || $metodo === '') $total_efectivo_out += $monto;
    if ($metodo === 'tarjeta' || $metodo === '2') $total_tarjeta_out += $monto;
    if ($metodo === 'transferencia' || $metodo === '3') $total_transferencia_out += $monto;
  }

  //  MATEMÁTICA PURA (NETO)
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
