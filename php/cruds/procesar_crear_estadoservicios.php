<?php
// procesar_crear.php
include "../conexion.php";

$response = ["success" => false, "message" => ""];

// Validar campos obligatorios
if (
  !empty($_POST['estadoservicio']) && !empty($_POST['desc_estadoservicio'])
) {
  // Sanitización básica
  $estadoservicio = htmlspecialchars($_POST['estadoservicio']);
  $desc_estadoservicio = htmlspecialchars($_POST['desc_estadoservicio']);
  $estatus = htmlspecialchars($_POST['estatus']);

  // Ejecutar la inserción
  try {
    $stmt = $dbh->prepare("INSERT INTO estadosservicios (estado_servicio, desc_estado_servicio, estatus) 
                               VALUES (?, ?, ?)");
    $stmt->execute([$estadoservicio, $desc_estadoservicio, $estatus]);

    $lastId = $dbh->lastInsertId();

    $response["success"] = true;
    $response["message"] = "Tipo de servicio fue creado exitosamente.";
    $response["estadoservicio"] = [
      "id" => $lastId,
      "nombre" => $estadoservicio,
      "descripcion" => $desc_estadoservicio,
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
