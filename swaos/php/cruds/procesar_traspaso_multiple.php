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

    $motivo_salida = "Traspaso EN TRÁNSITO hacia: " . $nom_destino;

    $stmtStock = $dbh->prepare("SELECT stock FROM inventario_sucursal WHERE id_prod = ? AND idtaller = ? FOR UPDATE");
    $stmtUpdate = $dbh->prepare("UPDATE inventario_sucursal SET stock = ? WHERE id_prod = ? AND idtaller = ?");
    $stmtKardex = $dbh->prepare("INSERT INTO kardex_inventario (id_prod, id_taller, id_usuario, tipo_movimiento, cantidad, stock_anterior, stock_nuevo, motivo) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");

    // 🌟 LA NUEVA MAGIA: El Limbo
    $stmtLimbo = $dbh->prepare("INSERT INTO traspasos_pendientes (id_taller_origen, id_taller_destino, id_usuario_envia, id_prod, cantidad) VALUES (?, ?, ?, ?, ?)");

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

      // Registramos que salió de tu taller, pero aclaramos que va "En Tránsito"
      $stmtKardex->execute([$id_p, $id_origen, $id_usuario, 'Salida', $cant, $stock_ant_orig, $stock_nuev_orig, $motivo_salida]);

      // 2. ENVIAR AL "LIMBO" (En vez de sumar al destino)
      $stmtLimbo->execute([$id_origen, $id_destino, $id_usuario, $id_p, $cant]);
    }

    $dbh->commit();
    echo json_encode(['success' => true]);
  } catch (Exception $e) {
    $dbh->rollBack();
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
  }
}
