<?php

include "../conexion.php";

// Inicializamos la respuesta
$response = ["success" => false, "message" => ""];

// Verificamos que el método sea POST
if ($_SERVER["REQUEST_METHOD"] === "POST") {
  $idusuario = $_POST["editar-idusuario"] ?? null;
  $usuario = $_POST["usuario"] ?? null;
  $nombre = $_POST["nombre"] ?? null;
  $papellido = $_POST["papellido"] ?? null;
  $sapellido = $_POST["sapellido"] ?? null;
  $email = $_POST["email"] ?? null;
  $rol = $_POST["rol"] ?? null;
  $password1 = $_POST["password1"] ?? null;
  $tienda = $_POST["tienda"] ?? null;
  // Imagen
  $imagen = $_FILES["imagen"]["name"] ?? null;
  $imagenTmp = $_FILES["imagen"]["tmp_name"] ?? null;
  $estatus = $_POST["estatus"] ?? null;

  // Sanitización y validación de datos
  $idusuario = filter_var($idusuario, FILTER_SANITIZE_NUMBER_INT);
  if (!$idusuario || !filter_var($idusuario, FILTER_VALIDATE_INT)) {
    $response["message"] = "El ID del usuario es inválido.";
    echo json_encode($response);
    exit;
  }

  // Verificar si $rol es un ID o un nombre
  if (!is_numeric($rol)) {
    // Buscar el ID del rol por nombre
    $consulta_rol = $dbh->prepare("SELECT id_rol FROM roles WHERE nom_rol = ?");
    $consulta_rol->execute([$rol]);
    $rol_data = $consulta_rol->fetch(PDO::FETCH_ASSOC);

    if ($rol_data) {
      $rol = $rol_data['id_rol'];
    } else {
      // Manejar el error si no se encuentra el rol
      echo json_encode(['success' => false, 'message' => 'Rol no encontrado.']);
      exit;
    }
  }

  // Verificar si $tienda es un ID o un nombre
  if (!is_numeric($tienda)) {
    // Buscar el ID del tienda por nombre
    $consulta_tienda = $dbh->prepare("SELECT id_taller FROM talleres WHERE nombre_t = ?");
    $consulta_tienda->execute([$tienda]);
    $tienda_data = $consulta_tienda->fetch(PDO::FETCH_ASSOC);

    if ($tienda_data) {
      $tienda = $tienda_data['id_taller'];
    } else {
      // Manejar el error si no se encuentra el tienda
      echo json_encode(['success' => false, 'message' => 'taller no encontrado.']);
      exit;
    }
  }

  try {
    // Obtener el usuario actual para verificar la contraseña y la imagen
    $stmt = $dbh->prepare("SELECT password, imagen FROM usuarios WHERE id_usuario = :idusuario");
    $stmt->execute([":idusuario" => $idusuario]);
    $usuarioActual = $stmt->fetch(PDO::FETCH_ASSOC);

    // Verificar si hay una nueva contraseña
    if (!empty($password1)) {
      // Encriptar la contraseña
      $passwordHash = password_hash($password1, PASSWORD_BCRYPT);
    } else {
      // Mantener la contraseña actual
      $passwordHash = $usuarioActual["password"];
    }

    // Manejo de la imagen
    $rutaImagen = "";
    if (!empty($_FILES['imagen']['name'])) {
      $directorioImagen = __DIR__ . "../../../imgs/users/";
      $rutaDestino = $directorioImagen . basename($_FILES['imagen']['name']);

      if (!is_writable($directorioImagen)) {
        throw new Exception("No se puede escribir en la carpeta imgs/users/");
      }

      // Validación del tipo de archivo
      $tiposPermitidos = ['image/jpeg', 'image/png', 'image/gif'];
      if (!in_array($_FILES['imagen']['type'], $tiposPermitidos)) {
        throw new Exception("Tipo de archivo no permitido. Solo se permiten JPEG, PNG y GIF.");
      }

      // Validación del tamaño del archivo (en bytes)
      $tamanoMaximo = 2 * 1024 * 1024; // 2 MB
      if ($_FILES['imagen']['size'] > $tamanoMaximo) {
        throw new Exception("El tamaño del archivo excede el límite permitido (2 MB).");
      }

      $nombreImagen = uniqid() . '-' . basename($_FILES['imagen']['name']);
      $rutaCompleta = $directorioImagen . $nombreImagen;
      $rutaImagen = "../imgs/users/" . $nombreImagen;

      // Mover el archivo subido
      if (!move_uploaded_file($_FILES['imagen']['tmp_name'], $rutaCompleta)) {
        throw new Exception("Error al subir la imagen.");
      }
    } else {
      $rutaImagen = $usuarioActual["imagen"];
    }

    // Preparar la consulta SQL
    $stmt = $dbh->prepare(
      "UPDATE usuarios 
             SET usuario = :usuario,
                 nombre = :nombre,
                 p_appellido = :appaterno,
                 s_appellido = :apmaterno,
                 id_rol = :idrol,
                 password = :password1,
                 taller_id = :sucursales_id,
                 imagen = :imagen,
                 estatus = :estatus
            WHERE id_usuario = :idusuario"
    );

    // Ejecutar la consulta con los parámetros
    $stmt->execute([
      ":usuario" => $usuario,
      ":nombre" => $nombre,
      ":appaterno" => $papellido,
      ":apmaterno" => $sapellido,
      ":idrol" => $rol,
      ":password1" => $passwordHash,
      ":sucursales_id" => $tienda,
      ":imagen" => $rutaImagen,
      ":estatus" => $estatus,
      ":idusuario" => $idusuario
    ]);

    // Verificamos si hubo una actualización
    if ($stmt->rowCount() > 0) {
      $response["success"] = true;
      $response["message"] = "SuperUsuario actualizado correctamente.";
    } else {
      $response["message"] = "No se realizaron cambios en el SuperUsuario.";
    }
  } catch (PDOException $e) {
    $response["message"] = "Error de base de datos: " . $e->getMessage();
    error_log("Error de base de datos en editar_user_sup.php: " . $e->getMessage());
  } catch (Exception $e) {
    $response["message"] = "Error: " . $e->getMessage();
    error_log("Error en editar_user.php: " . $e->getMessage());
  }
} else {
  $response["message"] = "Método no permitido.";
}

header("Content-Type: application/json");
echo json_encode($response);
