<?php

//Includes
include "../conexion.php";

$response = ["success" => false, "message" => ""];

try {
  // Insertar en la base de datos
  $stmt = $dbh->prepare("
        INSERT INTO talleres (nombre_t, razonsocial_t, rfc_t, calle_t, numext_t, numint_t, id_edo_t, id_munici_t, id_col_t, id_cp_t, tel_t, email_t, estatus_t) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ");

  $stmt->execute([
    $_POST['nombre'],
    $_POST['razonsocial'],
    $_POST['rfc'],
    $_POST['calle'],
    $_POST['noexterior'],
    $_POST['nointerior'] ?? '',
    $_POST['estado'],
    $_POST['municipio'],
    $_POST['colonia'],
    $_POST['codigo_postal'],
    $_POST['telefono'],
    $_POST['email'],
    $_POST['estatus']
  ]);

  $lastId = $dbh->lastInsertId();

  // Respuesta exitosa
  $response["success"] = true;
  $response["message"] = "El taller fue creado exitosamente.";
  $response["tienda"] = [
    "id" => $lastId,
    "nombre" => $_POST['nombre'],
    "razonsocial" => $_POST['razonsocial'],
    "rfc" => $_POST['rfc'],
    "calle" => $_POST['calle'],
    "noexterior" => $_POST['noexterior'],
    "nointerior" => $_POST['nointerior'] ?? '',
    "estado" => $_POST['estado'],
    "municipio" => $_POST['municipio'],
    "colonia" => $_POST['colonia'],
    "codigo_postal" => $_POST['codigo_postal'],
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
