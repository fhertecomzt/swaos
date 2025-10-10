<?php

//Includes
include "../conexion.php";

$response = ["success" => false, "message" => ""];

try {
  // Insertar en la base de datos
  $stmt = $dbh->prepare("
        INSERT INTO tiendas (
            nomtienda, reptienda, rfctienda, domtienda, noexttienda, nointtienda,
            coltienda, cdtienda, edotienda, cptienda, emailtienda, teltienda, estatus
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ");

  $stmt->execute([
    $_POST['nombre'],
    $_POST['representante'],
    $_POST['rfc'],
    $_POST['domicilio'],
    $_POST['noexterior'],
    $_POST['nointerior'] ?? '',
    $_POST['colonia'],
    $_POST['ciudad'],
    $_POST['estado'],
    $_POST['cpostal'],
    $_POST['email'],
    $_POST['telefono'],
    $_POST['estatus'],

  ]);

  $lastId = $dbh->lastInsertId();

  // Respuesta exitosa
  $response["success"] = true;
  $response["message"] = "La tienda fue creada exitosamente.";
  $response["tienda"] = [
    "id" => $lastId,
    "nombre" => $_POST['nombre'],
    "representante" => $_POST['representante'],
    "rfc" => $_POST['rfc'],
    "domicilio" => $_POST['domicilio'],
    "noexterior" => $_POST['noexterior'],
    "nointerior" => $_POST['nointerior'] ?? '',
    "colonia" => $_POST['colonia'],
    "ciudad" => $_POST['ciudad'],
    "estado" => $_POST['estado'],
    "cpostal" => $_POST['cpostal'],
    "email" => $_POST['email'],
    "telefono" => $_POST['telefono'],
    "estatus" => $_POST['estatus']
  ];
} catch (PDOException $e) {
  $response["message"] = "Error en la base de datos: " . $e->getMessage();
} catch (Exception $e) {
  $response["message"] = $e->getMessage();
}

echo json_encode($response);
