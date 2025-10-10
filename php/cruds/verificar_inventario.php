<?php
require_once '../../php/conexion.php'; // Ajusta la ruta a tu archivo de conexión
require_once '../../php/funciones/funciones.php'; // Ajusta la ruta a tu archivo de funciones
session_start(); // Asegúrate de iniciar la sesión

if (isset($_GET['idproducto']) && isset($_SESSION['idtienda'])) {
  $id_producto = $_GET['idproducto'];
  $id_tienda = $_SESSION['idtienda'];

  try {
    $stmt = $dbh->prepare("SELECT COUNT(*) FROM inventario_sucursal WHERE idproducto = ? AND idtienda = ?");
    $stmt->execute([$id_producto, $id_tienda]);
    $count = $stmt->fetchColumn();
    echo json_encode(['existe' => $count > 0]);
  } catch (PDOException $e) {
    echo json_encode(['existe' => false, 'error' => $e->getMessage()]);
  }
} else {
  $error_message = '';
  if (!isset($_GET['idproducto'])) {
    $error_message .= 'Falta el parámetro idproducto. ';
  }
  if (!isset($_SESSION['idtienda'])) {
    $error_message .= 'La sesión de la tienda no está iniciada.';
  }
  echo json_encode(['existe' => false, 'error' => trim($error_message)]);
}
