<?php
session_start();

require 'conexion.php';
require_once "config_keys.php";

header('Content-Type: application/json');

$telefono = trim($_POST['telefono'] ?? '');
$clave = trim($_POST['clave'] ?? '');

if (empty($telefono) || empty($clave)) {
  echo json_encode(['success' => false, 'message' => 'Por favor, ingresa tu teléfono y tu clave.']);
  exit;
}

// LÓGICA DE INTENTOS FALLIDOS Y reCAPTCHA CONDICIONAL
$intentos = $_SESSION['intentos_portal'] ?? 0;
$requiere_captcha = $intentos > 0; // Si tiene 1 o más errores, exige el captcha

if ($requiere_captcha) {
  $recaptcha_response = $_POST['g-recaptcha-response'] ?? '';

  if (empty($recaptcha_response)) {
    // Le avisamos al front que YA necesita mostrar el captcha
    echo json_encode(['success' => false, 'message' => 'Por favor, marca la casilla de "No soy un robot".', 'mostrar_captcha' => true]);
    exit;
  }

  $recaptchaSecret = RECAPTCHA_SECRET_KEY;
  $response = file_get_contents("https://www.google.com/recaptcha/api/siteverify?secret=$recaptchaSecret&response=" . $_POST['g-recaptcha-response']);
  $recaptchaResult = json_decode($response, true);

  if (!$recaptchaResult['success']) {
    echo json_encode(['success' => false, 'message' => 'La validación de seguridad falló. Intenta de nuevo.', 'mostrar_captcha' => true]);
    exit;
  }
}

try {
  $stmt = $dbh->prepare("SELECT id_cliente, nombre_cliente, papellido_cliente, `password` FROM clientes WHERE tel_cliente = ? AND estatus = 0");
  $stmt->execute([$telefono]);
  $cliente = $stmt->fetch(PDO::FETCH_ASSOC);

  if (!$cliente) {
    $_SESSION['intentos_portal'] = $intentos + 1; // Sumamos un error
    echo json_encode(['success' => false, 'message' => "Teléfono o clave de acceso incorrectos.", 'mostrar_captcha' => true]);
    exit;
  }

  // Verificamos la contraseña
  if (password_verify($clave, $cliente['password'])) {

    // Limpiamos el historial de errores
    unset($_SESSION['intentos_portal']);

    $_SESSION['id_cliente_portal'] = $cliente['id_cliente'];
    $_SESSION['nombre_cliente_portal'] = $cliente['nombre_cliente'];
    $_SESSION['papellido_cliente_portal'] = $cliente['papellido_cliente'];
    $_SESSION['rol_portal'] = 'cliente_externo';

    // Reiniciamos el reloj desde el segundo cero al iniciar sesión
    $_SESSION['ultimo_acceso_portal'] = time();

    echo json_encode(['success' => true, 'message' => '¡Bienvenido ' . $cliente['nombre_cliente'] . '!']);
  } else {
    // Falló la contraseña: Sumamos un error y activamos la bandera para mostrar el captcha
    $_SESSION['intentos_portal'] = $intentos + 1;
    echo json_encode([
      'success' => false,
      'message' => "Teléfono o clave de acceso incorrectos.",
      'mostrar_captcha' => true
    ]);
  }
} catch (PDOException $e) {
  echo json_encode(['success' => false, 'message' => 'Error de conexión. Intente más tarde.']);
}
