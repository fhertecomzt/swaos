<?php

//Includes
include "../conexion.php";

$response = ["success" => false, "message" => ""];

try {
  // Insertar en la base de datos
  $stmt = $dbh->prepare("
        INSERT INTO proveedores (
            nombre_prov, papellido_prov, sapellido_prov, contacto_prov, rfc_prov, tel_prov, email_prov, estatus) VALUES (?,?, ?, ?, ?, ?, ?, ?)
    ");

  $stmt->execute([
    $_POST['proveedor'],
    $_POST['papellido'],
    $_POST['sapellido'],
    $_POST['contacto'],
    $_POST['rfc'],
    $_POST['telefono'],
    $_POST['email'],
    $_POST['estatus']
  ]);

  $lastId = $dbh->lastInsertId();

  // Respuesta exitosa
  $response["success"] = true;
  $response["message"] = "El registro fue creado exitosamente.";
  $response["proveedor"] = [
    "id" => $lastId,
    "proveedor" => $_POST['proveedor'],
    "papellido" => $_POST['papellido'],
    "sapellido" => $_POST['sapellido'],
    "contacto" => $_POST['contacto'],
    "rfc" => $_POST['rfc'],
    "telefono" => $_POST['telefono'],
    "email" => $_POST['email'],
    "estatus" => $_POST['estatus']
  ];
} catch (PDOException $e) {
  $response["message"] = "Error en la base de datos: " . $e->getMessage();
} catch (Exception $e) {
  $response["message"] = $e->getMessage();
}

echo json_encode($response);
