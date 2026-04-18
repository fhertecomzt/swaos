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

// Recibimos los datos en JSON (Igual que en Ventas)
$datos = json_decode(file_get_contents('php://input'), true);

$id_cotizacion = $datos['id_cotizacion'] ?? 0;
$email = $datos['email'] ?? '';
$nombre = $datos['nombre'] ?? 'Cliente';
$total = $datos['total'] ?? 0;
$url_base = $datos['url_base'] ?? '';

if (empty($email) || empty($id_cotizacion)) {
  echo json_encode(['success' => false, 'message' => 'Faltan datos para enviar el correo.']);
  exit;
}

// MULTIEMPRESA (Traemos el nombre del Taller)
$nombreTallerActivo = "Sistema SWAOS";
$correoTallerActivo = "";

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
  }
}

// GENERAMOS LA FIRMA DE SEGURIDAD (IDOR)
$llave_secreta = "SWAOS_S3CR3T_2026_!#";
$token = hash('sha256', $id_cotizacion . $llave_secreta);
// Como el url_base ya trae "/php/", solo le pegamos "/cruds/..."
$link_pdf = $url_base . "cruds/imprimir_cotizacion.php?id=" . $id_cotizacion . "&token=" . $token;

// CONFIGURAMOS PHPMAILER (Tus credenciales exactas)
$mail = new PHPMailer(true);

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

  $mail->setFrom(MAIL_USER, $nombreTallerActivo . ' - Cotizaciones');

  if (!empty($correoTallerActivo)) {
    $mail->addReplyTo($correoTallerActivo, $nombreTallerActivo);
  } else {
    $mail->addReplyTo('no-reply@swaos.com.mx', 'No Responder');
  }

  $mail->addAddress($email, $nombre);
  $mail->isHTML(true);
  $mail->Subject = 'Cotizacion #' . str_pad($id_cotizacion, 6, "0", STR_PAD_LEFT) . ' - ' . $nombreTallerActivo;
  $mail->CharSet = 'UTF-8';

  // DISEÑO ELEGANTE DE LA COTIZACIÓN
  $mail->Body = "
    <html>
    <body style='font-family: Arial, sans-serif; color: #333;'>
      <h2 style='color: #6f42c1;'>¡Hola, $nombre!</h2>
      <p>Te compartimos el presupuesto solicitado en <strong>$nombreTallerActivo</strong> por un total de <strong>$" . number_format($total, 2) . "</strong>.</p>
      
      <div style='background-color: #f8f9fa; padding: 15px; border-left: 4px solid #6f42c1; margin: 20px 0;'>
          <strong>Folio de Cotización:</strong> #" . str_pad($id_cotizacion, 6, "0", STR_PAD_LEFT) . "<br>
      </div>

      <a href='$link_pdf' style='background-color: #6f42c1; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;'>📄 Descargar PDF</a>
      
      <p style='margin-top: 30px; font-size: 12px; color: #777;'>
        Este es un documento informativo. Los precios están sujetos a cambios sin previo aviso.<br>
        Enviado por <strong>Sistema SWAOS</strong>.
      </p>
    </body>
    </html>
    ";

  $mail->send();
  echo json_encode(['success' => true, 'message' => '¡Correo enviado con éxito!']);
} catch (Exception $e) {
  echo json_encode(['success' => false, 'message' => "Error de servidor: {$mail->ErrorInfo}"]);
}
