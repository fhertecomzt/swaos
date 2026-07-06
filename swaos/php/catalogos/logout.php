<?php
session_start();

if (isset($_SESSION['idusuario'])) {
  // Includes
  include "conexion.php";

  try {
    $stmt = $dbh->prepare("UPDATE usuarios SET session_token = NULL WHERE idusuario = :id");
    $stmt->bindParam(':id', $_SESSION['idusuario']);
    $stmt->execute();

    // Opcionalmente, verifique si la actualización fue exitosa
    if ($stmt->rowCount() > 0) {
      // Token eliminado con éxito
    } else {
      // Manejar posibles errores al actualizar el token
      error_log("Error updating session_token for user " . $_SESSION['idusuario']);
    }
  } catch (PDOException $e) {
    error_log("Database error in logout.php: " . $e->getMessage());
  }
}

// Desactivar todas las variables de sesión
$_SESSION = [];

// Si desea cerrar la sesión, elimine también la cookie de sesión.
// Nota: Esto destruirá la sesión, no solo sus datos.
if (ini_get("session.use_cookies")) {
  $params = session_get_cookie_params();
  setcookie(
    session_name(),
    '',
    time() - 42000,
    $params["path"],
    $params["domain"],
    $params["secure"],
    $params["httponly"]
  );
}

//Finalmente, destruye la sesión.
session_destroy();
header("Location: ../../index.php");
exit;
