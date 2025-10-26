<?php
header("Content-Type: application/json");


require_once "../conexion.php";

$response = ["success" => false, "message" => ""];

try {
  // Validar conexión
  if (!isset($dbh)) {
    throw new Exception("Error en la conexión a la base de datos.");
  }

  // Obtener datos del formulario
  $usuario = trim($_POST['usuario'] ?? '');
  $nombre = trim($_POST['nombre'] ?? '');
  $papellido = trim($_POST['papellido'] ?? '');
  $sapellido = trim($_POST['sapellido'] ?? '');
  $email = trim($_POST['email'] ?? '');
  $rol = $_POST['rol'] ?? '';
  $password1 = trim($_POST['password1'] ?? '');
  $tienda = $_POST['tienda'] ?? '';
  $estatus = trim($_POST['estatus'] ?? '');

  // Validación de campos obligatorios
  if (empty($usuario) || empty($nombre) || empty($papellido) || empty($sapellido) || empty($password1)) {
    throw new Exception("Todos los campos son obligatorios.");
  }

  // Verificar si el rol y la tienda existen en la base de datos
  function verificarExistencia($dbh, $tabla, $columna, $valor)
  {
    $stmt = $dbh->prepare("SELECT COUNT(*) FROM $tabla WHERE $columna = ?");
    $stmt->execute([$valor]);
    return $stmt->fetchColumn() > 0;
  }

  if (!verificarExistencia($dbh, 'roles', 'id_rol', $rol)) {
    throw new Exception("El Rol seleccionado no es válido.");
  }

  if (!verificarExistencia($dbh, 'talleres', 'id_taller', $tienda)) {
    throw new Exception("El taller seleccionado no es válido.");
  }

  // Procesar la contraseña
  $passwordHash = password_hash($password1, PASSWORD_DEFAULT);

  // Procesar imagen
  $rutaImagen = "";
  if (!empty($_FILES['imagen']['name'])) {
    $directorioImagen = __DIR__ . "../../../imgs/users/";

    if (!is_writable($directorioImagen)) {
      throw new Exception("No se puede escribir en la carpeta imgs/users/");
    }

    $nombreImagen = uniqid() . '-' . basename($_FILES['imagen']['name']);
    $rutaCompleta = $directorioImagen . $nombreImagen;
    $rutaImagen = "../imgs/users/" . $nombreImagen;

    if (!move_uploaded_file($_FILES['imagen']['tmp_name'], $rutaCompleta)) {
      throw new Exception("Error al subir la imagen.");
    }
  }

  // Insertar en la base de datos
  $stmt = $dbh->prepare("
        INSERT INTO usuarios (
            usuario, nombre, p_appellido, s_appellido, email, id_rol, password, taller_id, imagen, estatus) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ");

  $stmt->execute([
    $usuario,
    $nombre,
    $papellido,
    $sapellido,
    $email,
    $rol,
    $passwordHash, // Contraseña cifrada
    $tienda,
    $rutaImagen,
    $estatus
  ]);

  $lastId = $dbh->lastInsertId();

  // *** CÓDIGO: para Obtener nombres de Rol y Taller ***
  $nombreRol = '';
  $nombreTaller = '';

  // Obtener nombre del Rol
  if (!empty($rol)) {
    $stmtRol = $dbh->prepare("SELECT nom_rol FROM roles WHERE id_rol = ?");
    $stmtRol->execute([$rol]);
    $resultRol = $stmtRol->fetch(PDO::FETCH_ASSOC);
    if ($resultRol) {
      $nombreRol = $resultRol['nom_rol'];
    }
  }

  // Obtener nombre del Taller/Tienda
  if (!empty($tienda)) {
    $stmtTaller = $dbh->prepare("SELECT nombre_t FROM talleres WHERE id_taller = ?");
    $stmtTaller->execute([$tienda]);
    $resultTaller = $stmtTaller->fetch(PDO::FETCH_ASSOC);
    if ($resultTaller) {
      $nombreTaller = $resultTaller['nombre_t'];
    }
  }

  $response["success"] = true;
  $response["message"] = "El usuario fue registrado exitosamente.";
  $response["usuario"] = [
    "id" => $lastId,
    "usuario" => $usuario,
    "nombre" => $nombre,
    "appaterno" => $papellido, 
    "sapellido" => $sapellido,
    "email" => $email, 
    "rol_id" => $rol,          
    "nom_rol" => $nombreRol,
    "tienda_id" => $tienda,    
    "nombre_t" => $nombreTaller,
    "imagen" => $rutaImagen,   
    "estatus" => $estatus
  ];
} catch (Exception $e) { // Cambiado a Exception general
  error_log("Error en procesar_crear_user.php: " . $e->getMessage()); // Loguear error
  $response["message"] = "Error interno del servidor. Intente más tarde.";
   //$response["error_detail"] = $e->getMessage(); // Opcional: solo para debug
}finally {
  echo json_encode($response);
  die();
}
