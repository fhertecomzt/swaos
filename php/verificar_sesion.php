<?php
if (session_status() === PHP_SESSION_NONE) {
  session_start();
}

// Definir los roles permitidos para la página
$roles_permitidos = ["superusuario", "gerencia", "ventas"];

// Establecer un tiempo máximo de inactividad (en segundos)
$tiempo_inactividad = 3600; // 2 minutos 120 1200 20 min

// Verificar si el usuario ha iniciado sesión
if (!isset($_SESSION['loggedin']) || $_SESSION['loggedin'] !== true || !isset($_SESSION['idusuario']) || !isset($_SESSION['session_token'])) {
  header("Location: ../index.php");
  exit;
}

// Verificar inactividad
if (isset($_SESSION['ultimo_acceso']) && (time() - $_SESSION['ultimo_acceso']) > $tiempo_inactividad) {
  // **RECOMENDACIÓN: Eliminar la cookie de sesión**
  if (ini_get("session.use_cookies")) {
    $params = session_get_cookie_params();
    setcookie(
      session_name(),
      '',
      time() - 125,
      $params["path"],
      $params["domain"],
      $params["secure"],
      $params["httponly"]
    );
  }
  // La sesión ha expirado por inactividad
  session_unset();
  session_destroy();


  header("Location: ../php/logout.php?session_expired=1");
  exit;
}

// Verificar el token de sesión contra la base de datos
try {
  include_once "conexion.php";

  $stmt = $dbh->prepare("SELECT session_token FROM usuarios WHERE id_usuario = :id");
  $stmt->bindParam(':id', $_SESSION['idusuario']);
  $stmt->execute();
  $result = $stmt->fetch(PDO::FETCH_ASSOC);

  if (!$result || $result['session_token'] !== $_SESSION['session_token']) {
    // **RECOMENDACIÓN: Eliminar la cookie de sesión también en este caso (por seguridad)**
    if (ini_get("session.use_cookies")) {
      $params = session_get_cookie_params();
      setcookie(
        session_name(),
        '',
        time() - 125,
        $params["path"],
        $params["domain"],
        $params["secure"],
        $params["httponly"]
      );
    }
    // Desajuste del token de sesión, probablemente se haya iniciado sesión en otro lugar o se haya producido un secuestro de sesión
    session_unset();
    session_destroy();


    header("Location: ../php/logout.php?error=acceso_denegado"); // O un error específico para un problema de sesión única
    exit;
  }
} catch (PDOException $e) {
  // **RECOMENDACIÓN: Eliminar la cookie de sesión también en caso de error de BD (por seguridad)**
  if (ini_get("session.use_cookies")) {
    $params = session_get_cookie_params();
    setcookie(
      session_name(),
      '',
      time() - 125,
      $params["path"],
      $params["domain"],
      $params["secure"],
      $params["httponly"]
    );
  }
  // Log error
  session_unset();
  session_destroy();


  header("Location: ../php/logout.php?error=acceso_denegado"); // Manejar los errores de la base de datos apropiadamente
  exit;
}

$_SESSION['ultimo_acceso'] = time();

// Verificar si el rol del usuario está permitido
if (!isset($_SESSION['rol']) || !in_array($_SESSION['rol'], $roles_permitidos)) {
  header("Location: logout.php");
  exit;
}
