<?php
require '../conexion.php';

if (!isset($_GET['id'])) {
    die("Error: Faltan parámetros.");
}

$id_cita = filter_var($_GET['id'], FILTER_SANITIZE_NUMBER_INT);
$token_recibido = $_GET['token'] ?? '';

// La llave secreta
$llave_secreta = "SWAOS_S3CR3T_2026_!#";
$token_correcto = hash('sha256', $id_cita . $llave_secreta);

if ($token_recibido !== $token_correcto) {
    die("Acceso Denegado: El enlace de la cita es inválido o ha sido alterado.");
}

$stmt = $dbh->prepare("SELECT c.*, cli.nombre_cliente, cli.papellido_cliente 
                       FROM citas c 
                       LEFT JOIN clientes cli ON c.id_cliente = cli.id_cliente 
                       WHERE c.id_cita = ?");
$stmt->execute([$id_cita]);
$cita = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$cita) {
    die("Cita no encontrada.");
}

// Preparamos los textos
$nombre_cliente = trim($cita['nombre_cliente'] . ' ' . $cita['papellido_cliente']);
$resumen = "Cita SWAOS - " . $cita['tipo_cita'];
$descripcion = "Cliente: $nombre_cliente\\nMotivo / Falla: " . str_replace("\n", "\\n", $cita['motivo']);
$ubicacion = ($cita['tipo_cita'] == 'Domicilio') ? $cita['direccion_visita'] : "Taller SWAOS";

// Fechas en formato ICS (YYYYMMDDTHHMMSS). Se mandan como "Local Time" para que encaje perfecto en México.
$fecha_inicio = date('Ymd\THis', strtotime($cita['fecha_inicio']));
$fecha_fin = date('Ymd\THis', strtotime($cita['fecha_fin']));

//  Cabeceras para forzar la descarga de un Archivo de Calendario
header('Content-Type: text/calendar; charset=utf-8');
header('Content-Disposition: attachment; filename="Cita_SWAOS_' . $id_cita . '.ics"');

// Dibujamos el archivo iCalendar
echo "BEGIN:VCALENDAR\r\n";
echo "VERSION:2.0\r\n";
echo "PRODID:-//SWAOS ERP//MX\r\n";
echo "BEGIN:VEVENT\r\n";
echo "UID:cita_" . $id_cita . "_" . time() . "@swaos.com\r\n";
echo "DTSTAMP:" . gmdate('Ymd\THis\Z') . "\r\n"; // Sello de creación
echo "DTSTART:" . $fecha_inicio . "\r\n";
echo "DTEND:" . $fecha_fin . "\r\n";
echo "SUMMARY:" . $resumen . "\r\n";
echo "DESCRIPTION:" . $descripcion . "\r\n";
echo "LOCATION:" . $ubicacion . "\r\n";
echo "END:VEVENT\r\n";
echo "END:VCALENDAR\r\n";
