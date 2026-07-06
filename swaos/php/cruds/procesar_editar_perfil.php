<?php
// Asegurarse de que la sesión esté iniciada
if (session_status() === PHP_SESSION_NONE) {
  session_start();
}

header('Content-Type: application/json');
require_once "../conexion.php"; // Incluir la conexión a la BD

$response = ["success" => false, "message" => ""];

// 1. VERIFICACIÓN DE SEGURIDAD (Sesión)
if (!isset($_SESSION['idusuario']) || empty($_SESSION['idusuario'])) {
  $response["message"] = "Error de autenticación. Inicie sesión nuevamente.";
  echo json_encode($response);
  exit;
}

$id_usuario_sesion = $_SESSION['idusuario'];

// 2. RECIBIR DATOS DEL FORMULARIO
$password_actual = trim($_POST['password_actual'] ?? ''); 
$password_nueva = trim($_POST['password1'] ?? '');
$password_confirm = trim($_POST['password2'] ?? '');

try {
  // 3. VALIDACIÓN DEL LADO DEL SERVIDOR
  if (empty($password_actual) || empty($password_nueva) || empty($password_confirm)) {
    throw new Exception("Todos los campos de contraseña son obligatorios.");
  }
  if ($password_nueva !== $password_confirm) {
    throw new Exception("Las nuevas contraseñas no coinciden.");
  }

  // 4. VERIFICAR LA CONTRASEÑA ACTUAL (EL PASO CLAVE)
  $stmt_check = $dbh->prepare("SELECT password FROM usuarios WHERE id_usuario = ?");
  $stmt_check->execute([$id_usuario_sesion]);
  $usuario = $stmt_check->fetch(PDO::FETCH_ASSOC);

  if (!$usuario || !password_verify($password_actual, $usuario['password'])) {
    // Si el hash no coincide O el usuario no se encontró
    $response["success"] = false;
    $response["message"] = "La contraseña actual es incorrecta. Verifique sus datos.";
    echo json_encode($response);
    exit;
  }
  // -----------------------------------------------------

  // 5. HASHEAR LA NUEVA CONTRASEÑA (Si la actual fue correcta)
  $passwordHash = password_hash($password_nueva, PASSWORD_BCRYPT);

  // 6. EJECUTAR EL UPDATE
  $stmt_update = $dbh->prepare(
    "UPDATE usuarios 
         SET password = :password 
         WHERE id_usuario = :id_usuario"
  );

  $stmt_update->execute([
    ':password' => $passwordHash,
    ':id_usuario' => $id_usuario_sesion
  ]);

  // 7. ENVIAR RESPUESTA DE ÉXITO
  if ($stmt_update->rowCount() > 0) {
    $response["success"] = true;
    $response["message"] = "Contraseña actualizada exitosamente.";
  } else {
    $response["message"] = "No se realizaron cambios.";
  }
} catch (Exception $e) {
  error_log("Error al actualizar perfil: " . $e->getMessage());
  $response["message"] = $e->getMessage();
}

echo json_encode($response);
