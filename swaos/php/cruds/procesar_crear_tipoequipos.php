<?php
// procesar_crear.php
include "../conexion.php";

$response = ["success" => false, "message" => ""];

// Validar campos obligatorios
if (
  !empty($_POST['tipoequipos']) && !empty($_POST['desc_tipoequipos'])
) {
  // Sanitización básica
  $tipoequipos = htmlspecialchars($_POST['tipoequipos']);
  $desc_tipoequipos = htmlspecialchars($_POST['desc_tipoequipos']);
  $estatus = htmlspecialchars($_POST['estatus']);

  // Ejecutar la inserción
  try {
    $stmt = $dbh->prepare("INSERT INTO equipos (nombre_equipo, desc_equipo, estatus) 
                               VALUES (?, ?, ?)");
    $stmt->execute([$tipoequipos, $desc_tipoequipos, $estatus]);

    $lastId = $dbh->lastInsertId();

    $response["success"] = true;
    $response["message"] = "Tipo de servicio fue creado exitosamente.";
    $response["tipoe$tipoequipos"] = [
      "id" => $lastId,
      "nombre" => $tipoequipos,
      "descripcion" => $desc_tipoequipos,
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
