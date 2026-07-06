<?php
session_start();
require '../conexion.php'; // Ajusta la ruta a tu conexion.php si es necesario
header('Content-Type: application/json; charset=utf-8');

$response = ['success' => false, 'message' => ''];

try {
  if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    throw new Exception("Método no permitido.");
  }

  // Datos de sesión (Quién lo hace y dónde)
  $id_usuario = $_SESSION['id_usuario'] ?? $_SESSION['idusuario'] ?? 1;
  $id_taller = $_SESSION['taller_id'] ?? 1; // 🔐 Blindado por sucursal

  // Recibir variables del formulario
  $tipo_movimiento = trim($_POST['tipo_movimiento'] ?? '');
  $id_prod = intval($_POST['id_prod'] ?? 0);
  $cantidad = floatval($_POST['cantidad'] ?? 0);
  $motivo = trim($_POST['motivo'] ?? '');

  // Validaciones estrictas
  if ($id_prod <= 0 || $cantidad <= 0 || !in_array($tipo_movimiento, ['Entrada', 'Salida'])) {
    throw new Exception("Datos inválidos. Verifica el producto y la cantidad.");
  }

  if ($tipo_movimiento === 'Salida' && empty($motivo)) {
    throw new Exception("Debes especificar un motivo para registrar una salida o merma.");
  }

  // 🔒 INICIAMOS TRANSACCIÓN (Para que no haya descuadres)
  $dbh->beginTransaction();

  // 1. Obtener el stock actual EXACTO de este producto en este taller
  // El "FOR UPDATE" bloquea el registro milisegundos para que 2 empleados no lo editen al mismo tiempo
  $stmtStock = $dbh->prepare("SELECT stock FROM inventario_sucursal WHERE id_prod = ? AND idtaller = ? FOR UPDATE");
  $stmtStock->execute([$id_prod, $id_taller]);
  $rowStock = $stmtStock->fetch(PDO::FETCH_ASSOC);

  $stock_anterior = $rowStock ? floatval($rowStock['stock']) : 0;

  // 2. Calcular nuevo stock
  if ($tipo_movimiento === 'Entrada') {
    $stock_nuevo = $stock_anterior + $cantidad;
  } else {
    // Es Salida (Verificamos que no deje el stock en negativo)
    if ($stock_anterior < $cantidad) {
      throw new Exception("Stock insuficiente. El sistema dice que hay {$stock_anterior} piezas, y quieres sacar {$cantidad}.");
    }
    $stock_nuevo = $stock_anterior - $cantidad;
  }

  // 3. Actualizar la "Fotografía Actual" (inventario_sucursal)
  if ($rowStock) {
    $stmtUpdate = $dbh->prepare("UPDATE inventario_sucursal SET stock = ? WHERE id_prod = ? AND idtaller = ?");
    $stmtUpdate->execute([$stock_nuevo, $id_prod, $id_taller]);
  } else {
    // Si el producto nunca había existido en este taller, lo insertamos por primera vez
    $stmtInsertInv = $dbh->prepare("INSERT INTO inventario_sucursal (id_prod, idtaller, stock) VALUES (?, ?, ?)");
    $stmtInsertInv->execute([$id_prod, $id_taller, $stock_nuevo]);
  }

  // 4. Guardar el Comprobante Intocable (Kardex)
  $stmtKardex = $dbh->prepare("INSERT INTO kardex_inventario 
        (id_prod, id_taller, id_usuario, tipo_movimiento, cantidad, stock_anterior, stock_nuevo, motivo) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
  $stmtKardex->execute([
    $id_prod,
    $id_taller,
    $id_usuario,
    $tipo_movimiento,
    $cantidad,
    $stock_anterior,
    $stock_nuevo,
    $motivo
  ]);

  // 🔓 CONFIRMAMOS TODOS LOS CAMBIOS
  $dbh->commit();

  $response['success'] = true;
  $response['nuevo_stock'] = $stock_nuevo;
} catch (Exception $e) {
  if ($dbh->inTransaction()) {
    $dbh->rollBack(); // Si algo falla, deshacemos todo para evitar bases de datos rotas
  }
  $response['message'] = $e->getMessage();
}

echo json_encode($response);
