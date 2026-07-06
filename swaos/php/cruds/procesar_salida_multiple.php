<?php
session_start();
require '../conexion.php';
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
  // 1. Recibimos los datos
  $motivo = trim($_POST['motivo'] ?? 'Salida / Ajuste de Inventario');
  $productos_id = $_POST['prod_id'] ?? [];
  $cantidades = $_POST['prod_cant'] ?? [];

  $id_usuario = $_SESSION['id_usuario'] ?? $_SESSION['idusuario'] ?? 1;
  $id_taller = $_SESSION['taller_id'] ?? 1;

  if (empty($productos_id)) {
    echo json_encode(['success' => false, 'message' => 'El carrito está vacío.']);
    exit;
  }

  try {
    $dbh->beginTransaction();

    // Herramientas SQL
    $stmtStockAnt = $dbh->prepare("SELECT stock FROM inventario_sucursal WHERE id_prod = ? AND idtaller = ? FOR UPDATE");
    $stmtUpdateInv = $dbh->prepare("UPDATE inventario_sucursal SET stock = ? WHERE id_prod = ? AND idtaller = ?");
    $stmtKardex = $dbh->prepare("INSERT INTO kardex_inventario (id_prod, id_taller, id_usuario, tipo_movimiento, cantidad, stock_anterior, stock_nuevo, motivo) VALUES (?, ?, ?, 'Salida', ?, ?, ?, ?)");

    // Recorremos la lista
    for ($i = 0; $i < count($productos_id); $i++) {
      $id_p = $productos_id[$i];
      $cant_sacar = floatval($cantidades[$i]);

      // Bloqueamos fila y revisamos stock
      $stmtStockAnt->execute([$id_p, $id_taller]);
      $rowStock = $stmtStockAnt->fetch(PDO::FETCH_ASSOC);

      if ($rowStock) {
        $stock_anterior = floatval($rowStock['stock']);

        // Doble blindaje: Si el servidor detecta que no hay piezas, aborta todo
        if ($stock_anterior < $cant_sacar) {
          throw new Exception("El stock es insuficiente para despachar uno de los productos.");
        }

        $stock_nuevo = $stock_anterior - $cant_sacar;

        // Descontamos del estante físico
        $stmtUpdateInv->execute([$stock_nuevo, $id_p, $id_taller]);

        // Dejamos la huella en el Kardex
        $stmtKardex->execute([$id_p, $id_taller, $id_usuario, $cant_sacar, $stock_anterior, $stock_nuevo, $motivo]);
      } else {
        throw new Exception("Un producto solicitado no existe en esta sucursal.");
      }
    }

    $dbh->commit();
    echo json_encode(['success' => true]);
  } catch (Exception $e) {
    $dbh->rollBack();
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
  }
}
