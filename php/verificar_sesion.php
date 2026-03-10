<?php
if (session_status() === PHP_SESSION_NONE) {
  session_start();
}

// Si la página maestra (ej. ad.php) ya definió quién puede entrar, lo respetamos.
// Si no, por defecto permitimos a los tres roles básicos.
if (!isset($roles_permitidos)) {
  $roles_permitidos = ["superusuario", "gerencia", "ventas"];
}
$tiempo_inactividad = 600; // 10 minutos

// LA FUNCIÓN MAESTRA DE EXPULSIÓN
function expulsar_usuario($motivo = "")
{
  // 1. Borramos la cookie de sesión por seguridad
  if (ini_get("session.use_cookies")) {
    $params = session_get_cookie_params();
    setcookie(session_name(), '', time() - 125, $params["path"], $params["domain"], $params["secure"], $params["httponly"]);
  }
  // 2. Destruimos la sesión en el servidor
  session_unset();
  session_destroy();

  // 3. EL TRUCO DEL ESCAPE DE AJAX:
  // Script normal por si recargan la página directamente (F5)
  echo '<script>window.top.location.href="../index.php?' . $motivo . '";</script>';

  // Imagen rota para forzar la redirección cuando se inyecta vía fetch (innerHTML)
  echo '<img src="x" onerror="window.top.location.href=\'../index.php?' . $motivo . '\';" style="display:none;">';
  exit;
}


// 1. Verificar si hay sesión activa
if (!isset($_SESSION['loggedin']) || $_SESSION['loggedin'] !== true || !isset($_SESSION['idusuario']) || !isset($_SESSION['session_token'])) {
  expulsar_usuario("error=acceso_denegado");
}

// 2. Verificar inactividad
if (isset($_SESSION['ultimo_acceso']) && (time() - $_SESSION['ultimo_acceso']) > $tiempo_inactividad) {
  expulsar_usuario("session_expired=1");
}

// 3. Verificar el token de sesión (Para evitar sesiones dobles/robadas)
try {
  include_once "conexion.php";
  $stmt = $dbh->prepare("SELECT session_token FROM usuarios WHERE id_usuario = :id");
  $stmt->bindParam(':id', $_SESSION['idusuario']);
  $stmt->execute();
  $result = $stmt->fetch(PDO::FETCH_ASSOC);

  if (!$result || $result['session_token'] !== $_SESSION['session_token']) {
    expulsar_usuario("error=sesion_duplicada");
  }
} catch (PDOException $e) {
  expulsar_usuario("error=acceso_denegado");
}

// Actualizamos el tiempo en la sesión local
$_SESSION['ultimo_acceso'] = time();

// Actualizamos el "latido" en la base de datos para avisar que seguimos aquí
try {
  $stmtAlive = $dbh->prepare("UPDATE usuarios SET ultimo_acceso_token = NOW() WHERE id_usuario = :id");
  $stmtAlive->bindParam(':id', $_SESSION['idusuario']);
  $stmtAlive->execute();
} catch (PDOException $e) {
  // Ignorar errores de latido
}

// Verificar si el rol del usuario está permitido en esta pantalla
if (!isset($_SESSION['rol']) || !in_array($_SESSION['rol'], $roles_permitidos)) {
  expulsar_usuario("error=acceso_denegado");
}
