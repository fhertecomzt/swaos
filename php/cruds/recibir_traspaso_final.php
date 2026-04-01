<?php
session_start();
require '../conexion.php';
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
  $id_traspaso = intval($_POST['id_traspaso'] ?? 0);
  $id_taller_destino = $_SESSION['taller_id'] ?? 1;
  $id_usuario_recibe = $_SESSION['id_usuario'] ?? $_SESSION['idusuario'] ?? 1;

  try {
    $dbh->beginTransaction();

    // 1. Verificamos que el traspaso exista y siga "En camino" (Blindaje anti doble-clic)
    $stmtGet = $dbh->prepare("SELECT tp.*, t.nombre_t AS taller_origen FROM traspasos_pendientes tp INNER JOIN talleres t ON tp.id_taller_origen = t.id_taller WHERE tp.id_traspaso = ? AND tp.estatus = 0 FOR UPDATE");
    $stmtGet->execute([$id_traspaso]);
    $traspaso = $stmtGet->fetch(PDO::FETCH_ASSOC);

    if (!$traspaso) throw new Exception("Este paquete ya fue recibido anteriormente.");

    $id_p = $traspaso['id_prod'];
    $cant = floatval($traspaso['cantidad']);
    $motivo_entrada = "Recepción de traspaso desde: " . $traspaso['taller_origen'];

    // 2. Lo marcamos como "Recibido"
    $stmtUpdateTp = $dbh->prepare("UPDATE traspasos_pendientes SET estatus = 1, fecha_recepcion = NOW() WHERE id_traspaso = ?");
    $stmtUpdateTp->execute([$id_traspaso]);

    // 3. Ahora SÍ le sumamos el stock a TU sucursal
    $stmtStock = $dbh->prepare("SELECT stock FROM inventario_sucursal WHERE id_prod = ? AND idtaller = ? FOR UPDATE");
    $stmtStock->execute([$id_p, $id_taller_destino]);
    $rowDestino = $stmtStock->fetch(PDO::FETCH_ASSOC);

    if ($rowDestino) {
      $stock_ant = floatval($rowDestino['stock']);
      $stock_nuevo = $stock_ant + $cant;
      $stmtUpdateInv = $dbh->prepare("UPDATE inventario_sucursal SET stock = ? WHERE id_prod = ? AND idtaller = ?");
      $stmtUpdateInv->execute([$stock_nuevo, $id_p, $id_taller_destino]);
    } else {
      $stock_ant = 0;
      $stock_nuevo = $cant;
      $stmtInsertInv = $dbh->prepare("INSERT INTO inventario_sucursal (id_prod, idtaller, stock) VALUES (?, ?, ?)");
      $stmtInsertInv->execute([$id_p, $id_taller_destino, $stock_nuevo]);
    }

    // 4. Imprimimos tu recibo de Entrada en tu historial del Kardex
    $stmtKardex = $dbh->prepare("INSERT INTO kardex_inventario (id_prod, id_taller, id_usuario, tipo_movimiento, cantidad, stock_anterior, stock_nuevo, motivo) VALUES (?, ?, ?, 'Entrada', ?, ?, ?, ?)");
    $stmtKardex->execute([$id_p, $id_taller_destino, $id_usuario_recibe, $cant, $stock_ant, $stock_nuevo, $motivo_entrada]);

    // 5. EL TOQUE MAESTRO: Actualizar el Kardex del Taller que lo envió
    // A. Primero necesitamos saber el nombre de TU taller (el destino)
    $stmtNomDestino = $dbh->prepare("SELECT nombre_t FROM talleres WHERE id_taller = ?");
    $stmtNomDestino->execute([$id_taller_destino]);
    $nom_destino = $stmtNomDestino->fetchColumn();

    // B. Armamos las frases exacta para buscar y reemplazar
    $motivo_viejo = "Traspaso EN TRÁNSITO hacia: " . $nom_destino;
    $motivo_nuevo = "Traspaso ENTREGADO a: " . $nom_destino;

    // C. Buscamos la salida original en el Taller Origen y le cambiamos el texto
    $stmtUpdateKardexOrigen = $dbh->prepare("
            UPDATE kardex_inventario 
            SET motivo = ? 
            WHERE id_taller = ? 
            AND id_prod = ? 
            AND cantidad = ? 
            AND tipo_movimiento = 'Salida' 
            AND motivo = ?
            ORDER BY id_movimiento DESC 
            LIMIT 1
        ");
    $stmtUpdateKardexOrigen->execute([
      $motivo_nuevo,
      $traspaso['id_taller_origen'],
      $id_p,
      $cant,
      $motivo_viejo
    ]);

    $dbh->commit();
    echo json_encode(['success' => true]);
  } catch (Exception $e) {
    $dbh->rollBack();
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
  }
}
