<?php
//Conexion para PC principal
$dsn = 'mysql:host=localhost;dbname=swaos;charset=utf8mb4'; // Usar utf8mb4 para mayor compatibilidad con caracteres especiales.
$username = 'root'; // Verifica si el usuario es realmente 'roots'.
$password = '';

try {
    $dbh = new PDO($dsn, $username, $password);
    $dbh->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION); // Habilita el modo de errores para capturar excepciones.
} catch (PDOException $e) {
    error_log('Error de conexión: ' . $e->getMessage()); // Registra el error en el log del servidor.
    die('No se pudo conectar a la base de datos.'); // Mensaje más seguro para evitar exponer detalles sensibles.
}
