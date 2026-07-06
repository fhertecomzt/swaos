<?php
session_start();
require '../conexion.php';
header('Content-Type: application/json');

$id_taller = $_SESSION['taller_id'] ?? 1;

try {
  $sql = "SELECT tp.id_traspaso, tp.cantidad, DATE_FORMAT(tp.fecha_envio, '%d/%m/%Y %H:%i') as fecha, 
                   p.nombre_prod, p.codebar_prod, 
                   t.nombre_t AS taller_origen, u.usuario AS usuario_envia
            FROM traspasos_pendientes tp
            INNER JOIN productos p ON tp.id_prod = p.id_prod
            INNER JOIN talleres t ON tp.id_taller_origen = t.id_taller
            INNER JOIN usuarios u ON tp.id_usuario_envia = u.id_usuario
            WHERE tp.id_taller_destino = ? AND tp.estatus = 0
            ORDER BY tp.fecha_envio DESC";

  $stmt = $dbh->prepare($sql);
  $stmt->execute([$id_taller]);
  echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
} catch (Exception $e) {
  echo json_encode(['error' => $e->getMessage()]);
}
