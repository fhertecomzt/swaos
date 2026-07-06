<?php
session_start();
require '../conexion.php';
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
  // 1. Recibimos los datos
  $id_prov = intval($_POST['proveedor'] ?? 0);
  $folio = trim($_POST['folio'] ?? '');

  // Arrays del carrito
  $productos_id = $_POST['prod_id'] ?? [];
  $cantidades = $_POST['prod_cant'] ?? [];
  $costos = $_POST['prod_costo'] ?? [];

  $id_usuario = $_SESSION['id_usuario'] ?? $_SESSION['idusuario'] ?? 1;
  $id_taller = $_SESSION['taller_id'] ?? 1;

  // Validación de seguridad
  if (empty($productos_id) || $id_prov === 0 || empty($folio)) {
    echo json_encode(['success' => false, 'message' => 'Faltan datos requeridos o el carrito está vacío.']);
    exit;
  }

  try {
    // Iniciamos el blindaje SQL (Transacción)
    $dbh->beginTransaction();

    // 2. Calculamos el total de forma segura en el servidor
    $total_compra = 0;
    for ($i = 0; $i < count($productos_id); $i++) {
      $total_compra += (floatval($cantidades[$i]) * floatval($costos[$i]));
    }

    // 3. Guardamos la "Cabecera" de la compra
    $sqlCompra = "INSERT INTO compras_maestra (id_prov, id_usuario, folio_factura, total_compra, fecha_compra) VALUES (?, ?, ?, ?, NOW())";
    $stmtCompra = $dbh->prepare($sqlCompra);
    $stmtCompra->execute([$id_prov, $id_usuario, $folio, $total_compra]);
    $id_compra = $dbh->lastInsertId();

    // Preparamos todas las herramientas para el bucle (Para que sea súper rápido)
    $stmtDetalle = $dbh->prepare("INSERT INTO detalle_compras (id_compra, id_prod, cantidad, costo_unitario, subtotal) VALUES (?, ?, ?, ?, ?)");

    // ¡SUPER FEATURE!: Actualizamos el costo en tu catálogo de productos automáticamente
    $stmtUpdateCosto = $dbh->prepare("UPDATE productos SET costo_prod = ? WHERE id_prod = ?");

    $stmtStockAnt = $dbh->prepare("SELECT stock FROM inventario_sucursal WHERE id_prod = ? AND idtaller = ? FOR UPDATE");
    $stmtUpdateInv = $dbh->prepare("UPDATE inventario_sucursal SET stock = ? WHERE id_prod = ? AND idtaller = ?");
    $stmtKardex = $dbh->prepare("INSERT INTO kardex_inventario (id_prod, id_taller, id_usuario, tipo_movimiento, cantidad, stock_anterior, stock_nuevo, motivo) VALUES (?, ?, ?, 'Entrada', ?, ?, ?, ?)");

    // 4. Recorremos el carrito producto por producto
    for ($i = 0; $i < count($productos_id); $i++) {
      $id_p = $productos_id[$i];
      $cant = floatval($cantidades[$i]);
      $costo = floatval($costos[$i]);
      $subtotal = $cant * $costo;

      // A) Guardamos el producto en la factura
      $stmtDetalle->execute([$id_compra, $id_p, $cant, $costo, $subtotal]);

      // B) SWAOS aprende el nuevo costo del proveedor
      $stmtUpdateCosto->execute([$costo, $id_p]);

      // C) Buscamos el stock actual en esa sucursal
      $stmtStockAnt->execute([$id_p, $id_taller]);
      $rowStock = $stmtStockAnt->fetch(PDO::FETCH_ASSOC);

      if ($rowStock) {
        // Si el producto ya existía en la sucursal, le sumamos
        $stock_anterior = floatval($rowStock['stock']);
        $stock_nuevo = $stock_anterior + $cant;
        $stmtUpdateInv->execute([$stock_nuevo, $id_p, $id_taller]);
      } else {
        // Si nunca habías tenido este producto en esta sucursal, lo creamos
        $stock_anterior = 0;
        $stock_nuevo = $cant;
        $stmtInsertInv = $dbh->prepare("INSERT INTO inventario_sucursal (id_prod, idtaller, stock) VALUES (?, ?, ?)");
        $stmtInsertInv->execute([$id_p, $id_taller, $stock_nuevo]);
      }

      // D) Imprimimos el comprobante inalterable en el Kardex
      $motivo = "Compra Factura #" . $folio;
      $stmtKardex->execute([$id_p, $id_taller, $id_usuario, $cant, $stock_anterior, $stock_nuevo, $motivo]);
    }

    // Si todo sale bien, cerramos la caja fuerte de SQL
    $dbh->commit();
    echo json_encode(['success' => true, 'message' => 'Compra registrada']);
  } catch (Exception $e) {
    $dbh->rollBack();
    echo json_encode(['success' => false, 'message' => 'Error de BD: ' . $e->getMessage()]);
  }
}
