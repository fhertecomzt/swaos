<?php
session_start();
unset($_SESSION['id_cliente_portal']);
unset($_SESSION['nombre_cliente_portal']);
unset($_SESSION['rol_portal']);

// Destruimos el reloj fantasma
unset($_SESSION['ultimo_acceso_portal']);

// Revisamos si viene un motivo de expulsión
$motivo = isset($_GET['motivo']) ? '?expulsado=' . $_GET['motivo'] : '';

header("Location: portal_cliente.php" . $motivo);
exit;
