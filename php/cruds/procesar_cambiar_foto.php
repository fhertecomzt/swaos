<?php
if (session_status() === PHP_SESSION_NONE) {
  session_start();
}

header('Content-Type: application/json');
require_once "../conexion.php"; // Ajusta la ruta a tu conexión

$response = ["success" => false, "message" => "", "nuevaImagenUrl" => ""];

// 1. Verificar sesión
if (!isset($_SESSION['idusuario']) || empty($_SESSION['idusuario'])) {
  $response["message"] = "Error de autenticación.";
  echo json_encode($response);
  exit;
}

$id_usuario_sesion = $_SESSION['idusuario'];
$id_usuario_form = filter_var($_POST['id_usuario_foto'] ?? 0, FILTER_VALIDATE_INT);

// 2. Doble chequeo de seguridad
if ((int)$id_usuario_sesion !== (int)$id_usuario_form) {
  $response["message"] = "Conflicto de ID de usuario.";
  echo json_encode($response);
  exit;
}

try {
  // 3. Verificar que se subió un archivo
  if (!isset($_FILES['imagen_perfil']) || $_FILES['imagen_perfil']['error'] !== UPLOAD_ERR_OK) {
    throw new Exception("No se recibió ninguna imagen.");
  }

  // 4. Obtener la ruta de la imagen ANTIGUA (para borrarla después)
  $stmt_old = $dbh->prepare("SELECT imagen FROM usuarios WHERE id_usuario = ?");
  $stmt_old->execute([$id_usuario_sesion]);
  $usuario_actual = $stmt_old->fetch(PDO::FETCH_ASSOC);
  $rutaImagenAntigua = $usuario_actual['imagen'] ?? null;

  // 5. Lógica de subida (REUTILIZADA de procesar_crear_user.php)
  $directorioImagen = __DIR__ . "/../../imgs/users/"; // Ruta física en el servidor

  if (!is_writable($directorioImagen)) {
    throw new Exception("Error de permisos en el servidor (carpeta imgs/users).");
  }

  $nombreImagen = uniqid() . '-' . basename($_FILES['imagen_perfil']['name']);
  $rutaCompletaFisica = $directorioImagen . $nombreImagen;
  $rutaImagenBD = "../imgs/users/" . $nombreImagen; // Ruta relativa para la BD

  if (!move_uploaded_file($_FILES['imagen_perfil']['tmp_name'], $rutaCompletaFisica)) {
    throw new Exception("Error al mover la imagen subida.");
  }

  // 6. Actualizar la base de datos
  $stmt_update = $dbh->prepare("UPDATE usuarios SET imagen = ? WHERE id_usuario = ?");
  $stmt_update->execute([$rutaImagenBD, $id_usuario_sesion]);

  // 7. Borrar la imagen ANTIGUA (si existía y es diferente de la default)
  if ($rutaImagenAntigua && $rutaImagenAntigua !== $rutaImagenBD) {
    $rutaFisicaAntigua = __DIR__ . "/../" . ltrim($rutaImagenAntigua, './');
    if (file_exists($rutaFisicaAntigua) && strpos($rutaImagenAntigua, 'default.png') === false) {
      unlink($rutaFisicaAntigua); // Borrar archivo antiguo
    }
  }

  // 8. Actualizar la variable de SESIÓN (¡MUY IMPORTANTE!)
  $_SESSION['imagen'] = $rutaImagenBD;

  // 9. Enviar respuesta de éxito
  $response["success"] = true;
  $response["message"] = "Foto de perfil actualizada.";
  $response["nuevaImagenUrl"] = $rutaImagenBD;
} catch (Exception $e) {
  error_log("Error al cambiar foto: " . $e->getMessage());
  $response["message"] = $e->getMessage();
}

echo json_encode($response);
