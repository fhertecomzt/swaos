<?php
session_start();
require "../conexion.php";

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $id_orden = $_POST['id_orden'] ?? 0;
    $id_estado_servicio = $_POST['id_estado_servicio'] ?? '';
    $diagnostico = $_POST['diagnostico'] ?? '';
    $costo_servicio = $_POST['costo_servicio'] ?? 0;
    $anticipo_servicio = $_POST['anticipo_servicio'] ?? 0;

    // Calculamos el saldo en el servidor por seguridad
    $saldo_servicio = floatval($costo_servicio) - floatval($anticipo_servicio);

    try {
        $sql = "UPDATE ordenesservicio 
                SET id_estado_servicio = ?, diagnostico = ?, costo_servicio = ?, anticipo_servicio = ?, saldo_servicio = ?
                WHERE id_orden = ?";
        $stmt = $dbh->prepare($sql);
        $stmt->execute([$id_estado_servicio, $diagnostico, $costo_servicio, $anticipo_servicio, $saldo_servicio, $id_orden]);

        echo json_encode(['success' => true, 'message' => 'Orden actualizada correctamente']);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => 'Error al actualizar: ' . $e->getMessage()]);
    }
}
