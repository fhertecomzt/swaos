<?php
session_start();
require "../conexion.php";

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $id_orden = $_POST['id_orden'] ?? 0;
    $id_estado_servicio = $_POST['id_estado_servicio'] ?? '';
    $diagnostico = $_POST['diagnostico'] ?? '';
    $costo_servicio = $_POST['costo_servicio'] ?? 0;
    $anticipo_servicio = $_POST['anticipo_servicio'] ?? 0;

    $nuevo_abono = floatval($_POST['nuevo_abono'] ?? 0);
    $anticipo_actual = floatval($_POST['anticipo_servicio'] ?? 0);

    // Sumamos la historia más el dinero nuevo
    $anticipo_total = $anticipo_actual + $nuevo_abono;
    $saldo_servicio = floatval($costo_servicio) - $anticipo_total;

    // --- REGLA DE NEGOCIO DEL SALDO (Ajustar tu ID de entregado aquí) ---
    $id_estado_entregado = 6;
    if ($id_estado_servicio == $id_estado_entregado && $saldo_servicio > 0) {
        echo json_encode(['success' => false, 'message' => 'Seguridad: No se puede entregar si hay un saldo pendiente de $' . number_format($saldo_servicio, 2)]);
        exit;
    }

    // Iniciamos la Transacción SQL
    $dbh->beginTransaction();

    try {
        // 1. Actualizamos la orden
        $sql = "UPDATE ordenesservicio 
                SET id_estado_servicio = ?, diagnostico = ?, costo_servicio = ?, anticipo_servicio = ?, saldo_servicio = ?
                WHERE id_orden = ?";
        $stmt = $dbh->prepare($sql);
        $stmt->execute([$id_estado_servicio, $diagnostico, $costo_servicio, $anticipo_total, $saldo_servicio, $id_orden]);

        // 2. Si hay dinero de por medio, registramos el abono para el corte de caja
        if ($nuevo_abono > 0) {
            // Asumimos que tienes el ID del usuario en la sesión
            $id_usuario = $_SESSION['id_usuario'] ?? 1;

            $sqlAbono = "INSERT INTO abonos_ordenes (id_orden, monto_abono, id_usuario) VALUES (?, ?, ?)";
            $stmtAbono = $dbh->prepare($sqlAbono);
            $stmtAbono->execute([$id_orden, $nuevo_abono, $id_usuario]);
        }

        // Si todo salió bien, guardamos permanentemente en la base de datos
        $dbh->commit();

        echo json_encode(['success' => true, 'message' => 'Orden actualizada y abonos guardados correctamente.']);
    } catch (Exception $e) {
        // Si ALGO falló, deshacemos todo para evitar información incompleta
        $dbh->rollBack();
        echo json_encode(['success' => false, 'message' => 'Error al actualizar: ' . $e->getMessage()]);
    }
}