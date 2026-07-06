<?php
session_start();
require '../conexion.php';
header("Content-Type: application/json");

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require '../PHPMailer/src/Exception.php';
require '../PHPMailer/src/PHPMailer.php';
require '../PHPMailer/src/SMTP.php';
require '../config_correo.php';

$datos = json_decode(file_get_contents('php://input'), true);

$email = $datos['email'] ?? '';
$nombre = $datos['nombre'] ?? 'Cliente';
$folio = $datos['folio'] ?? '';
$link = $datos['link'] ?? '';

if (empty($email) || empty($folio)) {
  echo json_encode(['success' => false, 'message' => 'Faltan datos para enviar el correo.']);
  exit;
}

// BUSCAMOS LOS DATOS DEL TALLER ACTIVO
$nombreTallerActivo = "Sistema SWAOS"; // Nombre por defecto
$correoTallerActivo = ""; // Correo del taller por si el cliente responde

if (isset($_SESSION['taller_id'])) {
  try {
    $stmtTaller = $dbh->prepare("SELECT nombre_t, email_t FROM talleres WHERE id_taller = ?");
    $stmtTaller->execute([$_SESSION['taller_id']]);
    $tallerDB = $stmtTaller->fetch(PDO::FETCH_ASSOC);

    if ($tallerDB) {
      $nombreTallerActivo = $tallerDB['nombre_t'];
      $correoTallerActivo = $tallerDB['email_t'] ?? '';
    }
  } catch (Exception $e) {
    // Si hay error, seguimos con el nombre por defecto
  }
}

// CONFIGURACIÓN Y ENVÍO CON PHPMAILER Instancia de PHPMailer
$mail = new PHPMailer(true);

// --- Codificación para acentos ---
$mail->CharSet = 'UTF-8';

try {
  // Ajustes del Servidor SMTP
  // Le pasamos las constantes (PHPMailer no sabe de dónde vienen)
  $mail->isSMTP();
  $mail->Host       = MAIL_HOST;
  $mail->SMTPAuth   = true;
  $mail->Username   = MAIL_USER; // Llama a la bóveda
  $mail->Password   = MAIL_PASS; // Llama a la bóveda
  $mail->Port       = MAIL_PORT;
  $mail->SMTPAutoTLS = MAIL_AUTO_TLS;
  $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;

  // Solo aplicamos seguridad si la bóveda nos dio una (ej. 'tls')
  if (MAIL_SECURE !== '') {
    $mail->SMTPSecure = MAIL_SECURE;
  }

  // El correo real de salida SIEMPRE es el del sistema, pero el nombre es dinámico
  $mail->setFrom(MAIL_USER, $nombreTallerActivo . ' - Notificaciones');

  // Si el Taller tiene su propio correo, hacemos que las respuestas le lleguen a él
  if (!empty($correoTallerActivo)) {
    $mail->addReplyTo($correoTallerActivo, $nombreTallerActivo);
  } else {
    // Si no tienen correo, usamos un "No Responder"
    $mail->addReplyTo('no-reply@swaos.com.mx', 'No Responder');
  }

  $mail->addAddress($email, $nombre);

  $mail->isHTML(true);
  $mail->Subject = 'Comprobante de Operación - Folio #' . $folio;
  $mail->CharSet = 'UTF-8';

  $mail->Body = "
    <html>
    <body style='font-family: Arial, sans-serif; color: #333;'>
      <h2 style='color: #0056b3;'>¡Hola, $nombre!</h2>
      <p>Has realizado una operación en <strong>$nombreTallerActivo</strong>. Adjunto encontrarás el enlace para descargar tu comprobante digital.</p>
      
      <div style='background-color: #f8f9fa; padding: 15px; border-left: 4px solid #0056b3; margin: 20px 0;'>
          <strong>Folio de Operación:</strong> #$folio<br>
      </div>

      <a href='$link' style='background-color: #28a745; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;'> Descargar Ticket</a>
      
      <p style='margin-top: 30px; font-size: 12px; color: #777;'>
        Este es un correo automático generado por el <strong>Sistema SWAOS</strong>.<br>
      </p>
    </body>
    </html>
    ";

  $mail->send();
  echo json_encode(['success' => true, 'message' => '¡Correo enviado con éxito!']);
} catch (Exception $e) {
  echo json_encode(['success' => false, 'message' => "Error de servidor: {$mail->ErrorInfo}"]);
}
