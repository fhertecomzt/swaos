<?php

//Includes
include "../conexion.php";

$response = ["success" => false, "message" => ""];

try {
  // Insertar en la base de datos
  $stmt = $dbh->prepare("
        INSERT INTO clientes (
            nombre_cliente, papellido_cliente, sapellido_cliente, rfc_cliente, calle_cliente, noext_cliente, noint_cliente, id_edo_c, id_munici_c, id_col_c, id_cp_c, tel_cliente, email_cliente, estatus) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ");

  $stmt->execute([
    $_POST['cliente'],
    $_POST['papellido'],
    $_POST['sapellido'],
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
  $response["message"] = "El registro fue creado exitosamente.";
  $response["cliente"] = [
    "id" => $lastId,
    "cliente" => $_POST['cliente'],
    "rfc" => $_POST['rfc'],
    "calle" => $_POST['calle'],
    "noexterior" => $_POST['noexterior'],
    "nointerior" => $_POST['nointerior'] ?? '',
    "estado" => $_POST['estado'],
    "ciudad" => $_POST['municipio'],
    "colonia" => $_POST['colonia'],
    "cpostal" => $_POST['codigo_postal'],
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
