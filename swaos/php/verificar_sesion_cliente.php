<?php
if (session_status() === PHP_SESSION_NONE) {
  session_start();
}

$tiempo_inactividad_cliente = 300; // 300 segundos = 5 minutos

function expulsar_cliente($motivo = "")
{
  // Destruimos la sesión del cliente
  unset($_SESSION['id_cliente_portal']);
  unset($_SESSION['nombre_cliente_portal']);
  unset($_SESSION['papellido_cliente_portal']);
  unset($_SESSION['rol_portal']);
  unset($_SESSION['ultimo_acceso_portal']);

  // Redirigimos al login con el motivo
  header("Location: portal_cliente.php?expulsado=" . $motivo);
  exit;
}

// Verificar si NO hay sesión de cliente activa
if (!isset($_SESSION['rol_portal']) || $_SESSION['rol_portal'] !== 'cliente_externo') {
  expulsar_cliente("denegado");
}

// Verificar inactividad
if (isset($_SESSION['ultimo_acceso_portal'])) {
  $tiempo_transcurrido = time() - $_SESSION['ultimo_acceso_portal'];
  if ($tiempo_transcurrido > $tiempo_inactividad_cliente) {
    expulsar_cliente("inactividad"); // Lo sacamos por exceder el tiempo
  }
}

// Actualizar el "latido" (Si hizo un movimiento, su reloj vuelve a cero)
$_SESSION['ultimo_acceso_portal'] = time();
