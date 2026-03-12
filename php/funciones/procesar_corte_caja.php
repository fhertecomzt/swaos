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

  // Recibimos los datos del cajero
  $datos = json_decode(file_get_contents('php://input'), true);
  $id_usuario = $_SESSION['id_usuario'] ?? $_SESSION['idusuario'] ?? 1;

  $esperado = floatval($datos['esperado']);
  $fisico = floatval($datos['fisico']);
  $diferencia = floatval($datos['diferencia']);
  $tarjeta = floatval($datos['tarjeta']);
  $transferencia = floatval($datos['transferencia']);
  $retiros = floatval($datos['retiros']);

  // PREPARAMOS EL INSERT (Faltaba esta instrucción)
  $sql = "INSERT INTO cortes_caja (id_usuario, efectivo_esperado, efectivo_fisico, diferencia, total_tarjeta, total_transferencia, total_retiros)
            VALUES (?, ?, ?, ?, ?, ?, ?)";
  $stmt = $dbh->prepare($sql);

  // EJECUTAMOS Y GUARDAMOS EL CORTE
  if ($stmt->execute([$id_usuario, $esperado, $fisico, $diferencia, $tarjeta, $transferencia, $retiros])) {

    $id_nuevo_corte = $dbh->lastInsertId(); // Obtenemos el folio del nuevo corte

    // Actualizamos todas las ventas abiertas de este usuario y les estampamos el folio del corte
    $sqlLock = "UPDATE ventas SET id_corte = ? WHERE id_corte IS NULL AND id_usuario = ?";
    $stmtLock = $dbh->prepare($sqlLock);
    $stmtLock->execute([$id_nuevo_corte, $id_usuario]);

    // Respondemos el éxito y mandamos el ID para imprimir
    echo json_encode(['success' => true, 'id_corte' => $id_nuevo_corte]);
  } else {
    echo json_encode(['success' => false, 'message' => 'No se pudo guardar el corte.']);
  }
} catch (Exception $e) {
  echo json_encode(['success' => false, 'message' => 'Error de BD: ' . $e->getMessage()]);
}
