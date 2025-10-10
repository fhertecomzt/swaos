<?php

//Includes
include "../conexion.php";

$response = ["success" => false, "message" => ""];

try {
  // Insertar en la base de datos
  $stmt = $dbh->prepare("
        INSERT INTO proveedores (
            nomproveedor, contacproveedor, rfcproveedor, telproveedor, celproveedor, emailproveedor, limitecredproveedor, dicredproveedor
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ");

  $stmt->execute([
    $_POST['proveedor'],
    $_POST['contacto'],
    $_POST['rfc'],
    $_POST['telefono'],
    $_POST['celular'],
    $_POST['email'],
    $_POST['limitecred'],
    $_POST['diacred']
  ]);

  $lastId = $dbh->lastInsertId();

  // Respuesta exitosa
  $response["success"] = true;
  $response["message"] = "El registro fue creado exitosamente.";
  $response["proveedor"] = [
    "id" => $lastId,
    "proveedor" => $_POST['proveedor'],
    "contacto" => $_POST['contacto'],
    "rfc" => $_POST['rfc'],
    "telefono" => $_POST['telefono'],
    "celular" => $_POST['celular'],
    "email" => $_POST['email'],
    "limitecred" => $_POST['limitecred'],
    "diacred" => $_POST['diacred']
  ];
} catch (PDOException $e) {
  $response["message"] = "Error en la base de datos: " . $e->getMessage();
} catch (Exception $e) {
  $response["message"] = $e->getMessage();
}

echo json_encode($response);
