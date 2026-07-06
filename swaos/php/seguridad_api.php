<?php

/**
 * SWAOS - Escudo de Seguridad para APIs
 * Centraliza la validación de sesión y peticiones AJAX.
 */

if (session_status() === PHP_SESSION_NONE) {
  session_start();
}

// 1. Candado de Sesión: ¿Existe un usuario identificado?
if (!isset($_SESSION['id_usuario'])) {
  header('HTTP/1.1 401 Unauthorized');
  header('Content-Type: application/json');
  echo json_encode([
    'success' => false,
    'message' => 'Acceso denegado. Tu sesión ha expirado o no has iniciado sesión.'
  ]);
  exit; // Detenemos todo aquí
}

// 2. Candado AJAX: ¿La petición es legítima desde el sistema?
if (!isset($_SERVER['HTTP_X_REQUESTED_WITH']) || strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) != 'xmlhttprequest') {
  header('HTTP/1.1 403 Forbidden');
  header('Content-Type: application/json');
  echo json_encode([
    'success' => false,
    'message' => 'Acceso prohibido. No se permiten peticiones directas al servidor.'
  ]);
  exit;
}
