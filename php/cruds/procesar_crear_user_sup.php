<?php

header("Content-Type: application/json");
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . "/error_log.txt");

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
  $rol = $_POST['rol'] ?? '';
  $password1 = trim($_POST['password1'] ?? '');
  $tienda = $_POST['tienda'] ?? '';
  $comision = trim($_POST['comision'] ?? 0);
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

  if (!verificarExistencia($dbh, 'roles', 'idrol', $rol)) {
    throw new Exception("El Rol seleccionado no es válido.");
  }

  if (!verificarExistencia($dbh, 'tiendas', 'idtienda', $tienda)) {
    throw new Exception("La tienda seleccionada no es válida.");
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
            usuario, nombre, appaterno, apmaterno, idrol, password1, sucursales_id, imagen, comision, estatus
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ");

  $stmt->execute([
    $usuario,
    $nombre,
    $papellido,
    $sapellido,
    $rol,
    $passwordHash, // Contraseña cifrada
    $tienda,
    $rutaImagen,
    $comision,
    $estatus
  ]);

  $lastId = $dbh->lastInsertId();

  // **NUEVA CONSULTA PARA OBTENER EL NOMBRE DEL ROL**
  $stmtRol = $dbh->prepare("SELECT nomrol FROM roles WHERE idrol = ?");
  $stmtRol->execute([$rol]);
  $rolData = $stmtRol->fetch(PDO::FETCH_ASSOC);
  $nombreRol = $rolData ? $rolData['nomrol'] : '';

  // **NUEVA CONSULTA PARA OBTENER EL NOMBRE DE LA TIENDA**
  $stmtTienda = $dbh->prepare("SELECT nombre FROM tiendas WHERE idtienda = ?");
  $stmtTienda->execute([$tienda]);
  $tiendaData = $stmtTienda->fetch(PDO::FETCH_ASSOC);
  $nombreTienda = $tiendaData ? $tiendaData['nombre'] : '';


  $response["success"] = true;
  $response["message"] = "El usuario fue registrado exitosamente.";
  $response["usuario"] = [
    "id" => $lastId,
    "usuario" => $usuario,
    "nombre" => $nombre,
    "appaterno" => $papellido,
    "sapellido" => $sapellido,
    "nomrol" => $nombreRol,
    "nomtienda" => $nombreTienda,
    "comision" => $comision,
    "imagen" => $rutaImagen,
    "estatus" => $estatus
  ];
} catch (Exception $e) {
  $response["success"] = false;
  $response["message"] = "Error: " . $e->getMessage();
} finally {
  echo json_encode($response);
  die();
}
