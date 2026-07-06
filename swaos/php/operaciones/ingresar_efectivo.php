<?php
session_start();
require '../conexion.php';
header('Content-Type: application/json');

$monto = $_POST['monto'] ?? 0;
$concepto = $_POST['concepto'] ?? 'Fondo de caja';
$id_usuario = $_SESSION['id_usuario'] ?? $_SESSION['idusuario'] ?? 1;

if ($monto <= 0) {
    echo json_encode(['success' => false, 'mensaje' => 'El monto debe ser mayor a 0.']);
    exit;
}

try {
    // Registramos el ingreso usamos la palabra clave "Ingreso"
    $sql = "INSERT INTO ventas (id_usuario, total, metodo_pago, tipo_movimiento, estatus) 
            VALUES (:user, :monto, 'Efectivo', :concepto, 'Completada')";
    $stmt = $dbh->prepare($sql);
    $stmt->execute([
        ':user' => $id_usuario,
        ':monto' => $monto,
        ':concepto' => 'Ingreso: ' . $concepto
    ]);

    echo json_encode(['success' => true, 'mensaje' => 'Ingreso registrado correctamente.']);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'mensaje' => 'Error: ' . $e->getMessage()]);
}
