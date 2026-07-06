<?php
// procesar_crear.php
include "../conexion.php";

$response = ["success" => false, "message" => ""];

// Validar campos obligatorios
if (
  !empty($_POST['rol']) && !empty($_POST['desc_rol'] ) 
) {
  // Sanitización básica
  $rol = htmlspecialchars($_POST['rol']);
  $desc_rol = htmlspecialchars($_POST['desc_rol']);
  $estatus = htmlspecialchars($_POST['estatus']);

  // Ejecutar la inserción
  try {
    $stmt = $dbh->prepare("INSERT INTO roles (nom_rol, desc_rol, estatus_rol) 
                               VALUES (?, ?, ?)");
    $stmt->execute([$rol, $desc_rol, $estatus]);

    $lastId = $dbh->lastInsertId();

    $response["success"] = true;
    $response["message"] = "Rol fue creado exitosamente.";
    $response["rol"] = [
      "id" => $lastId,
      "nombre" => $rol,
      "descripcion" => $desc_rol,
      "estatus" => $estatus

    ];
  } catch (PDOException $e) {
    // Respuesta genérica en caso de error
    $response["message"] = "Hubo un error al procesar la solicitud. Intente más tarde.";
  }
} else {
  $response["message"] = "Todos los campos son obligatorios.";
}

echo json_encode($response);
