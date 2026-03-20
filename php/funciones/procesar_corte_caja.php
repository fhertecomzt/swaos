<?php
session_start();
require '../conexion.php';
header('Content-Type: application/json');

date_default_timezone_set('America/Mazatlan');

try {
  // Creamos la tabla automáticamente si no existe en la BD
  $sqlTabla = "CREATE TABLE IF NOT EXISTS cortes_caja (
        id_corte INT AUTO_INCREMENT PRIMARY KEY,
        id_usuario INT,
        fecha_corte DATETIME DEFAULT CURRENT_TIMESTAMP,
        efectivo_esperado DECIMAL(10,2),
        efectivo_fisico DECIMAL(10,2),
        diferencia DECIMAL(10,2),
        total_tarjeta DECIMAL(10,2),
        total_transferencia DECIMAL(10,2),
        total_retiros DECIMAL(10,2)
    )";
  $dbh->exec($sqlTabla);

  // Recibimos SOLAMENTE el efectivo físico que contó el cajero (No confiamos en los demás números del JS)
  $datos = json_decode(file_get_contents('php://input'), true);
  $id_usuario = $_SESSION['id_usuario'] ?? $_SESSION['idusuario'] ?? 1;
  $fisico = isset($datos['fisico']) ? floatval($datos['fisico']) : 0;

  // =========================================================================
  // EL CEREBRO GUARDIÁN: Recalculamos todo desde cero para evitar desajustes
  // =========================================================================

  // 1. Calcular Ingresos (Ya con la vacuna de 'Liquidacion')
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
  $stmtIngresos = $dbh->prepare($sqlIngresos);
  $stmtIngresos->execute([$id_usuario]);

  $tarjeta = 0;
  $transferencia = 0;
  $efectivo_in = 0;

  foreach ($stmtIngresos->fetchAll(PDO::FETCH_ASSOC) as $row) {
    $metodo = trim($row['metodo']);
    if ($metodo === 'efectivo' || $metodo === '1' || $metodo === '') $efectivo_in += floatval($row['suma']);
    if ($metodo === 'tarjeta' || $metodo === '2') $tarjeta += floatval($row['suma']);
    if ($metodo === 'transferencia' || $metodo === '3') $transferencia += floatval($row['suma']);
  }

  // 2. Calcular Retiros/Salidas
  $sqlRetiros = "SELECT LOWER(metodo_pago) as metodo, SUM(total) as suma_retiros 
                 FROM ventas 
                 WHERE id_corte IS NULL AND id_usuario = ? 
                 AND (tipo_movimiento LIKE '%Retiro%' OR tipo_movimiento LIKE '%Corte%' OR tipo_movimiento LIKE '%Salida%')
                 GROUP BY LOWER(metodo_pago)";
  $stmtRetiros = $dbh->prepare($sqlRetiros);
  $stmtRetiros->execute([$id_usuario]);

  $retiros = 0;
  $efectivo_out = 0;

  foreach ($stmtRetiros->fetchAll(PDO::FETCH_ASSOC) as $row) {
    $metodo = trim($row['metodo']);
    $monto = floatval($row['suma_retiros']);
    $retiros += $monto;

    if ($metodo === 'efectivo' || $metodo === '1' || $metodo === '') $efectivo_out += $monto;
    if ($metodo === 'tarjeta' || $metodo === '2') $tarjeta -= $monto;
    if ($metodo === 'transferencia' || $metodo === '3') $transferencia -= $monto;
  }

  // 3. Matemática Final
  $esperado = $efectivo_in - $efectivo_out;
  $diferencia = $fisico - $esperado;

  // =========================================================================

  // PREPARAMOS EL INSERT CON LOS DATOS BLINDADOS
  $sql = "INSERT INTO cortes_caja (id_usuario, efectivo_esperado, efectivo_fisico, diferencia, total_tarjeta, total_transferencia, total_retiros)
          VALUES (?, ?, ?, ?, ?, ?, ?)";
  $stmt = $dbh->prepare($sql);

  // EJECUTAMOS Y GUARDAMOS EL CORTE
  if ($stmt->execute([$id_usuario, $esperado, $fisico, $diferencia, $tarjeta, $transferencia, $retiros])) {

    $id_nuevo_corte = $dbh->lastInsertId();

    // Actualizamos todas las ventas abiertas de este usuario y les estampamos el folio del corte
    $sqlLock = "UPDATE ventas SET id_corte = ? WHERE id_corte IS NULL AND id_usuario = ?";
    $stmtLock = $dbh->prepare($sqlLock);
    $stmtLock->execute([$id_nuevo_corte, $id_usuario]);

    echo json_encode(['success' => true, 'id_corte' => $id_nuevo_corte]);
  } else {
    echo json_encode(['success' => false, 'message' => 'No se pudo guardar el corte.']);
  }
} catch (Exception $e) {
  echo json_encode(['success' => false, 'message' => 'Error de BD: ' . $e->getMessage()]);
}
