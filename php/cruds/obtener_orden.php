<?php
session_start();
require "../conexion.php";

if (isset($_GET['id'])) {
    $id_orden = intval($_GET['id']);

    try {
        // Buscamos los datos exactos de la orden
        $sql = "SELECT id_orden, id_estado_servicio, falla, diagnostico, costo_servicio, anticipo_servicio 
                FROM ordenesservicio WHERE id_orden = ?";
        $stmt = $dbh->prepare($sql);
        $stmt->execute([$id_orden]);
        $orden = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($orden) {
            echo json_encode(['success' => true, 'orden' => $orden]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Orden no encontrada']);
        }
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => 'Error de BD: ' . $e->getMessage()]);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'No se recibió ID']);
}
