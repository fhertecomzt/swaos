<?php
session_start();
require '../conexion.php';
header('Content-Type: application/json');

$datos = json_decode(file_get_contents('php://input'), true);
$id_venta = $datos['id_venta'] ?? null;
$devoluciones = $datos['devoluciones'] ?? [];
$id_usuario = $_SESSION['id_usuario'] ?? $_SESSION['idusuario'] ?? 1;
$id_taller = $_SESSION['taller_id'] ?? 1;

if (!$id_venta || empty($devoluciones)) {
  echo json_encode(['success' => false, 'mensaje' => 'No hay datos válidos.']);
  exit;
}

try {
  $dbh->beginTransaction();

  $sqlOrig = "SELECT total, metodo_pago FROM ventas WHERE id_venta = :id_venta";
  $stmtOrig = $dbh->prepare($sqlOrig);
  $stmtOrig->execute([':id_venta' => $id_venta]);
  $ticket = $stmtOrig->fetch(PDO::FETCH_ASSOC);

  $dinero_a_devolver = 0;
  foreach ($devoluciones as $item) {
    $dinero_a_devolver += ($item['cantidad_devolver'] * $item['precio']);
  }

  $metodo = strtolower(trim($ticket['metodo_pago']));
  if ($metodo === 'efectivo' || $metodo === '1' || $metodo === '') {

    // Sincronizado exactamente con el Corte de Caja
    $sqlCaja = "SELECT 
                    SUM(CASE WHEN tipo_movimiento LIKE '%Venta%' OR tipo_movimiento LIKE '%Abono%' OR tipo_movimiento LIKE '%Anticipo%' OR tipo_movimiento LIKE '%Ingreso%' THEN total ELSE 0 END) AS entradas,
                    SUM(CASE WHEN tipo_movimiento LIKE '%Retiro%' OR tipo_movimiento LIKE '%Corte%' OR tipo_movimiento LIKE '%Salida%' THEN total ELSE 0 END) AS salidas
                    FROM ventas 
                    WHERE id_usuario = :user AND id_corte IS NULL AND LOWER(metodo_pago) IN ('efectivo', '1', '')";

    $stmtCaja = $dbh->prepare($sqlCaja);
    $stmtCaja->execute([':user' => $id_usuario]);
    $flujo = $stmtCaja->fetch(PDO::FETCH_ASSOC);

    $entradas = $flujo['entradas'] ? floatval($flujo['entradas']) : 0;
    $salidas = $flujo['salidas'] ? floatval($flujo['salidas']) : 0;
    $efectivo_disponible = $entradas - $salidas;

    if ($efectivo_disponible < $dinero_a_devolver) {
      throw new Exception("CAJA BLOQUEADA. Tienes en turno: $" . number_format($efectivo_disponible, 2) . " (Entró: $" . number_format($entradas, 2) . " - Salió: $" . number_format($salidas, 2) . ") | Ocupas $" . number_format($dinero_a_devolver, 2));
    }
  }

  $concepto_retiro = "Retiro: Devolucion Parcial Ticket #" . $id_venta;
  $sqlRetiro = "INSERT INTO ventas (id_usuario, total, metodo_pago, tipo_movimiento, estatus) 
                  VALUES (:user, :total, :pago, :movimiento, 'Completada')";
  $stmtRetiro = $dbh->prepare($sqlRetiro);
  $stmtRetiro->execute([
    ':user' => $id_usuario,
    ':total' => $dinero_a_devolver,
    ':pago' => $ticket['metodo_pago'],
    ':movimiento' => $concepto_retiro
  ]);

  $sqlVenta = "UPDATE ventas SET estatus = 'Devolución Parcial' WHERE id_venta = :id_venta";
  $stmtVenta = $dbh->prepare($sqlVenta);
  $stmtVenta->execute([':id_venta' => $id_venta]);

  $sqlDetalle = "UPDATE detalle_ventas SET cantidad = cantidad - :cant, subtotal = subtotal - :subt WHERE id_detalle = :id_detalle";
  $stmtDetalle = $dbh->prepare($sqlDetalle);

  $sqlStock = "UPDATE inventario_sucursal SET stock = stock + :cant WHERE id_prod = :id_producto AND idtaller = :idtaller";
  $stmtStock = $dbh->prepare($sqlStock);

  foreach ($devoluciones as $item) {
    $cantidad = $item['cantidad_devolver'];
    $subtotal_devuelto = $cantidad * $item['precio'];

    $stmtDetalle->execute([
      ':cant' => $cantidad,
      ':subt' => $subtotal_devuelto,
      ':id_detalle' => $item['id_detalle']
    ]);

    $stmtStock->execute([
      ':cant' => $cantidad,
      ':id_producto' => $item['id_producto'],
      ':idtaller' => $id_taller
    ]);
  }

  $dbh->commit();
  echo json_encode(['success' => true, 'mensaje' => "Retiro parcial generado por $" . number_format($dinero_a_devolver, 2)]);
} catch (Exception $e) {
  $dbh->rollBack();
  echo json_encode(['success' => false, 'mensaje' => $e->getMessage()]);
}
