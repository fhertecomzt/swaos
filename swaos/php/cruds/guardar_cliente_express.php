<?php
header("Content-Type: application/json");
require '../conexion.php'; 

$nombre = trim($_POST['nombre'] ?? '');
$papellido = trim($_POST['papellido'] ?? '');
$sapellido = trim($_POST['sapellido'] ?? '');
$telefono = trim($_POST['telefono'] ?? '');
$email = trim($_POST['email'] ?? '');

//Validación de seguridad en el servidor
if (strlen($nombre) < 3 || strlen($papellido) < 3 || strlen($telefono) !== 10) {
  echo json_encode(['success' => false, 'message' => 'Datos inválidos o incompletos rechazados por el servidor.']);
  exit;
}

try {
  // La tabla exige que ciertos campos NO sean nulos, les ponemos valores por defecto
  $rfc_default = 'XAXX010101000'; // RFC de Público en General obligatorio para tu tabla
  $estatus = 0; // 0 = Cliente Activo

  // INSERCIÓN EXACTA respetando las columnas de tu archivo SQL
  $stmt = $dbh->prepare("
        INSERT INTO clientes 
        (nombre_cliente, papellido_cliente, sapellido_cliente, rfc_cliente, tel_cliente, email_cliente, estatus) 
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ");

  $stmt->execute([
    $nombre,
    $papellido,
    $sapellido,
    $rfc_default,
    $telefono,
    $email,
    $estatus
  ]);

  // Obtenemos el ID del cliente recién creado
  $idNuevo = $dbh->lastInsertId();

  // Armamos el nombre completo para devolvérselo a la pantalla de cotizaciones/órdenes
  $nombreCompleto = trim($nombre . ' ' . $papellido . ' ' . $sapellido);

  echo json_encode([
    'success' => true,
    'id' => $idNuevo,
    'nombre_completo' => $nombreCompleto,
    'telefono' => $telefono
  ]);
} catch (Exception $e) {
  echo json_encode(['success' => false, 'message' => 'Error en la Base de Datos: ' . $e->getMessage()]);
}
