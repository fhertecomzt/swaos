<?php
session_start();
require '../conexion.php'; 
header('Content-Type: application/json');

date_default_timezone_set('America/Mazatlan'); 

try {
  // Identificamos quién es el cajero que está pidiendo el corte
  $id_usuario = $_SESSION['id_usuario'] ?? $_SESSION['idusuario'] ?? 1;

  // Sumamos todas las ENTRADAS (Que tengan el candado abierto y sean de ESTE cajero)
  $sqlIngresos = "SELECT metodo_pago, SUM(total) as suma 
                    FROM ventas 
                    WHERE id_corte IS NULL AND id_usuario = ? 
                    AND tipo_movimiento NOT LIKE 'Retiro:%'
                    GROUP BY metodo_pago";
  $stmt = $dbh->prepare($sqlIngresos);
  $stmt->execute([$id_usuario]);
  $ingresos = $stmt->fetchAll(PDO::FETCH_ASSOC);

  $total_efectivo = 0;
  $total_tarjeta = 0;
  $total_transferencia = 0;

  foreach ($ingresos as $row) {
    if ($row['metodo_pago'] === 'Efectivo') $total_efectivo += $row['suma'];
    if ($row['metodo_pago'] === 'Tarjeta') $total_tarjeta += $row['suma'];
    if ($row['metodo_pago'] === 'Transferencia') $total_transferencia += $row['suma'];
  }

  // Sumamos las SALIDAS (Retiros de ESTE cajero con candado abierto)
  $sqlRetiros = "SELECT SUM(total) as suma_retiros 
                   FROM ventas 
                   WHERE id_corte IS NULL AND id_usuario = ? 
                   AND tipo_movimiento LIKE 'Retiro:%'";
  $stmtRetiros = $dbh->prepare($sqlRetiros);
  $stmtRetiros->execute([$id_usuario]);
  $retiros = $stmtRetiros->fetch(PDO::FETCH_ASSOC);

  $total_retiros = $retiros['suma_retiros'] ? floatval($retiros['suma_retiros']) : 0;

  // Efectivo Neto
  $efectivo_caja = $total_efectivo - $total_retiros;

  echo json_encode([
    'success' => true,
    'efectivo' => $efectivo_caja,
    'tarjeta' => $total_tarjeta,
    'transferencia' => $total_transferencia,
    'retiros' => $total_retiros,
    'fecha' => date('d/m/Y H:i')
  ]);
} catch (Exception $e) {
  echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}