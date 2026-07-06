<?php
// procesar_crear.php
include "../conexion.php";

$response = ["success" => false, "message" => ""];

// Validar campos obligatorios
if (
  !empty($_POST['impuesto']) && !empty($_POST['tasa'])
) {
  // Sanitización básica
  $impuesto = htmlspecialchars($_POST['impuesto']);
  $tasa = htmlspecialchars($_POST['tasa']);
  $estatus = htmlspecialchars($_POST['estatus']);

  // Ejecutar la inserción
  try {
    $stmt = $dbh->prepare("INSERT INTO impuestos (nomimpuesto, tasa, estatus) 
                               VALUES (?, ?, ?)");
    $stmt->execute([$impuesto, $tasa, $estatus]);

    $lastId = $dbh->lastInsertId();

    $response["success"] = true;
    $response["message"] = "Registro fue creado exitosamente.";
    $response["impuesto"] = [
      "id" => $lastId,
      "nombre" => $impuesto,
      "tasa" => $tasa,
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
