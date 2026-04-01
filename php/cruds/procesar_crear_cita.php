<?php
session_start();
require '../conexion.php';
header('Content-Type: application/json');

try {
    // 1. Recibimos las variables 
    $id_cliente = $_POST['id_cliente'] ?? 0;
    $id_tecnico = $_POST['id_tecnico'] ?? 0;
    $fecha_inicio = $_POST['fecha_inicio'] ?? '';
    $fecha_fin = $_POST['fecha_fin'] ?? '';
    $tipo_cita = $_POST['tipo_cita'] ?? '';
    $direccion = $_POST['direccion_visita'] ?? '';
    $motivo = trim($_POST['motivo'] ?? '');

    // CAPTURAMOS EL TALLER ACTUAL
    $id_taller_sesion = $_SESSION['taller_id'] ?? 1;

    // 2. Validación de seguridad (Solo 1 vez al principio)
    if (empty($id_cliente) || empty($id_tecnico) || empty($fecha_inicio) || empty($fecha_fin) || empty($tipo_cita) || empty($motivo)) {
        echo json_encode(['success' => false, 'message' => 'Faltan datos obligatorios para agendar la cita.']);
        exit;
    }

    //  3. EL ESCUDO MULTI-TÉCNICO
    $stmt_check = $dbh->prepare("SELECT COUNT(*) FROM citas 
                                 WHERE estatus != 'Cancelada' 
                                 AND id_tecnico = ? 
                                 AND ((fecha_inicio < ?) AND (fecha_fin > ?))");

    $stmt_check->execute([$id_tecnico, $fecha_fin, $fecha_inicio]);
    $empalmes = $stmt_check->fetchColumn();

    if ($empalmes > 0) {
        echo json_encode([
            'success' => false,
            'message' => '¡Choque de Horarios! Este técnico ya tiene una cita asignada en ese bloque de tiempo. Asígnala a otro técnico o cambia la hora.'
        ]);
        exit;
    }

    //  4. COLORES CORPORATIVOS
    $color = '#0d6efd'; // Azul por defecto (Recepción en Taller)
    if ($tipo_cita == 'Domicilio') {
        $color = '#fd7e14'; // Naranja alerta (El técnico debe salir)
    } else if ($tipo_cita == 'Remoto') {
        $color = '#6f42c1'; // Morado (Soporte Online)
    }

    // GUARDADO DEFINITIVO BLINDADO POR SUCURSAL
    $stmt = $dbh->prepare("INSERT INTO citas (id_taller, id_cliente, id_tecnico, fecha_inicio, fecha_fin, tipo_cita, motivo, direccion_visita, color_evento, estatus) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Agendada')");

    // Agregamos $id_taller_sesion como primer parámetro en el arreglo
    $stmt->execute([$id_taller_sesion, $id_cliente, $id_tecnico, $fecha_inicio, $fecha_fin, $tipo_cita, $motivo, $direccion, $color]);

    $id_nueva_cita = $dbh->lastInsertId();

    echo json_encode([
        'success' => true,
        'message' => 'La cita ha sido registrada exitosamente con el Folio #' . $id_nueva_cita,
        'id_cita' => $id_nueva_cita
    ]);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Error BD: ' . $e->getMessage()]);
}
