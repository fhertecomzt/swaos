<?php
session_start();
require '../conexion.php';
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
  $id_destino = intval($_POST['taller_destino'] ?? 0);
  $productos_id = $_POST['prod_id'] ?? [];
  $cantidades = $_POST['prod_cant'] ?? [];

  $id_usuario = $_SESSION['id_usuario'] ?? $_SESSION['idusuario'] ?? 1;
  $id_origen = $_SESSION['taller_id'] ?? 1; // De donde sale (tu taller)

  if (empty($productos_id) || $id_destino === 0) {
    echo json_encode(['success' => false, 'message' => 'Faltan datos o el carrito está vacío.']);
    exit;
  }

  try {
    $dbh->beginTransaction();

    // Nombres de los talleres para el Kardex
    $stmtNomTaller = $dbh->prepare("SELECT nombre_t FROM talleres WHERE id_taller = ?");
    $stmtNomTaller->execute([$id_origen]);
    $nom_origen = $stmtNomTaller->fetchColumn();

    $stmtNomTaller->execute([$id_destino]);
    $nom_destino = $stmtNomTaller->fetchColumn();

    $motivo_salida = "Traspaso enviado a: " . $nom_destino;
    $motivo_entrada = "Traspaso recibido de: " . $nom_origen;

    $stmtStock = $dbh->prepare("SELECT stock FROM inventario_sucursal WHERE id_prod = ? AND idtaller = ? FOR UPDATE");
    $stmtUpdate = $dbh->prepare("UPDATE inventario_sucursal SET stock = ? WHERE id_prod = ? AND idtaller = ?");
    $stmtInsert = $dbh->prepare("INSERT INTO inventario_sucursal (id_prod, idtaller, stock) VALUES (?, ?, ?)");
    $stmtKardex = $dbh->prepare("INSERT INTO kardex_inventario (id_prod, id_taller, id_usuario, tipo_movimiento, cantidad, stock_anterior, stock_nuevo, motivo) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");

    for ($i = 0; $i < count($productos_id); $i++) {
      $id_p = $productos_id[$i];
      $cant = floatval($cantidades[$i]);

      // 1. GESTIÓN DEL TALLER ORIGEN (SALIDA)
      $stmtStock->execute([$id_p, $id_origen]);
      $rowOrigen = $stmtStock->fetch(PDO::FETCH_ASSOC);

      if (!$rowOrigen || $rowOrigen['stock'] < $cant) {
        throw new Exception("Stock insuficiente en origen para completar el traspaso.");
      }

      $stock_ant_orig = floatval($rowOrigen['stock']);
      $stock_nuev_orig = $stock_ant_orig - $cant;

      $stmtUpdate->execute([$stock_nuev_orig, $id_p, $id_origen]);
      $stmtKardex->execute([$id_p, $id_origen, $id_usuario, 'Salida', $cant, $stock_ant_orig, $stock_nuev_orig, $motivo_salida]);

      // 2. GESTIÓN DEL TALLER DESTINO (ENTRADA)
      $stmtStock->execute([$id_p, $id_destino]);
      $rowDestino = $stmtStock->fetch(PDO::FETCH_ASSOC);

      if ($rowDestino) {
        $stock_ant_dest = floatval($rowDestino['stock']);
        $stock_nuev_dest = $stock_ant_dest + $cant;
        $stmtUpdate->execute([$stock_nuev_dest, $id_p, $id_destino]);
      } else {
        $stock_ant_dest = 0;
        $stock_nuev_dest = $cant;
        $stmtInsert->execute([$id_p, $id_destino, $stock_nuev_dest]);
      }

      $stmtKardex->execute([$id_p, $id_destino, $id_usuario, 'Entrada', $cant, $stock_ant_dest, $stock_nuev_dest, $motivo_entrada]);
    }

    $dbh->commit();
    echo json_encode(['success' => true]);
  } catch (Exception $e) {
    $dbh->rollBack();
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
  }
}
