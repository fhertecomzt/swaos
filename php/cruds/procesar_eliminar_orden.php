<?php
session_start();
require "../conexion.php";

if ($_SERVER['REQUEST_METHOD'] == 'POST' && isset($_POST['id_orden'])) {
    $id_orden = intval($_POST['id_orden']);

    // Cambia este "4" por el ID que le corresponda al estado "Cancelado" 
    // o "Inactivo" en tu tabla 'estadosservicios'
    $id_estado_cancelado = 5;

    try {
        // En lugar de hacer DELETE, hacemos un UPDATE (Borrado Lógico)
        $sql = "UPDATE ordenesservicio SET id_estado_servicio = ? WHERE id_orden = ?";
        $stmt = $dbh->prepare($sql);
        $stmt->execute([$id_estado_cancelado, $id_orden]);

        echo json_encode(['success' => true, 'message' => 'La orden ha sido marcada como cancelada.']);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => 'Error al cancelar: ' . $e->getMessage()]);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Petición inválida']);
}
