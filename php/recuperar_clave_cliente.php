<?php
if (session_status() === PHP_SESSION_NONE) {
  session_start();
}
require 'conexion.php';
header("Content-Type: application/json");

// IMPORTAR PHPMAILER 
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

// Como están en la misma carpeta "php", entramos directo a PHPMailer
require __DIR__ . '/PHPMailer/src/Exception.php';
require __DIR__ . '/PHPMailer/src/PHPMailer.php';
require __DIR__ . '/PHPMailer/src/SMTP.php';
require __DIR__ . '/config_correo.php';


header('Content-Type: application/json');

$telefono = trim($_POST['telefono'] ?? '');

if (empty($telefono) || strlen($telefono) != 10) {
  echo json_encode(['success' => false, 'message' => 'Teléfono inválido.']);
  exit;
}

try {
  // Buscamos al cliente
  $stmt = $dbh->prepare("SELECT id_cliente, nombre_cliente, papellido_cliente, email_cliente FROM clientes WHERE tel_cliente = ? AND estatus = 0");
  $stmt->execute([$telefono]);
  $cliente = $stmt->fetch(PDO::FETCH_ASSOC);

  if (!$cliente) {
    echo json_encode(['success' => false, 'message' => 'No encontramos este número en el sistema.']);
    exit;
  }

  if (empty($cliente['email_cliente'])) {
    echo json_encode(['success' => false, 'message' => 'No tienes un correo registrado en tu expediente. Por favor contacta al taller.']);
    exit;
  }

  // Generar nueva clave y actualizar BD
  $nueva_clave = substr(str_shuffle("23456789abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ"), 0, 8);
  $hash = password_hash($nueva_clave, PASSWORD_BCRYPT);

  $stmtUpd = $dbh->prepare("UPDATE clientes SET password = ? WHERE id_cliente = ?");
  $stmtUpd->execute([$hash, $cliente['id_cliente']]);

  // CONFIGURACIÓN Y ENVÍO CON PHPMAILER
  $mail = new PHPMailer(true);

  try {
    // Ajustes del Servidor SMTP
  $mail->isSMTP();
  $mail->Host       = 'smtp.gmail.com';
  $mail->SMTPAuth   = true;
  $mail->Username   = MAIL_USER; // Llama a la bóveda
  $mail->Password   = MAIL_PASS; // Llama a la bóveda
  $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
  $mail->Port       = 465;
    $mail->CharSet    = 'UTF-8';

    // Remitente y Destinatario
    $mail->setFrom('swaos.mzt@gmail.com', 'SWAOS');
    $mail->addAddress($cliente['email_cliente'], $cliente['nombre_cliente']);

    // Contenido del Correo
    $mail->isHTML(true); // ¡Activamos HTML!
    $mail->Subject = 'Recuperación de Clave - Portal del Cliente';

    // Diseñamos un correo corporativo
    $cuerpoCorreo = "
        <div style='font-family: Arial, sans-serif; background-color: #f4f7f6; padding: 20px;'>
            <div style='max-width: 500px; margin: 0 auto; background: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 4px 10px rgba(0,0,0,0.1);'>
                <h2 style='color: #007bff; text-align: center;'>SWAOS</h2>
                <h3 style='color: #333;'>Hola {$cliente['nombre_cliente']} {$cliente['papellido_cliente']}</h3>
                <p style='color: #555; font-size: 15px;'>Hemos recibido una solicitud para restablecer la contraseña de tu Portal de Cliente.</p>
                <div style='background: #e9ecef; padding: 15px; text-align: center; border-radius: 8px; margin: 20px 0;'>
                    <span style='font-size: 14px; color: #666;'>Tu nueva clave de acceso es:</span><br>
                    <strong style='font-size: 24px; color: #333; letter-spacing: 2px;'>{$nueva_clave}</strong>
                </div>
                <p style='color: #555; font-size: 15px;'>Puedes iniciar sesión haciendo clic en el siguiente enlace:</p>
                <div style='text-align: center; margin-top: 25px;'>
                    <a href='https://swaos.rf.gd/portal_cliente.php' style='background: #007bff; color: #ffffff; text-decoration: none; padding: 12px 20px; border-radius: 5px; font-weight: bold;'>Ir a mi Portal</a>
                </div>
                <hr style='border: none; border-top: 1px solid #eee; margin: 30px 0 15px 0;'>
                <p style='color: #999; font-size: 12px; text-align: center;'>Si no solicitaste este cambio, por favor contacta a nuestro equipo de soporte.</p>
            </div>
        </div>";

    $mail->Body    = $cuerpoCorreo;
    $mail->AltBody = "Hola {$cliente['nombre_cliente']},\nTu nueva clave es: { $nueva_clave}\nInicia sesión en: https://swaos.rf.gd/portal_cliente.php"; // Texto plano de respaldo

    // Enviar
    $mail->send();

    // Respuesta exitosa al frontend
    $email_parts = explode("@", $cliente['email_cliente']);
    $hidden_email = substr($email_parts[0], 0, 2) . "***@" . $email_parts[1];
    echo json_encode(['success' => true, 'message' => '¡Éxito! Te hemos enviado una nueva clave al correo: ' . $hidden_email]);
  } catch (Exception $e) {
    // Error de envío de correo
    echo json_encode(['success' => false, 'message' => 'No se pudo enviar el correo. Error SMTP: ' . $mail->ErrorInfo]);
  }
} catch (Exception $e) {
  echo json_encode(['success' => false, 'message' => 'Error de conexión. Intente más tarde.']);
}
