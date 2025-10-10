<?php

//Includes
include "../conexion.php";

$response = ["success" => false, "message" => ""];

try {
  // Insertar en la base de datos
  $stmt = $dbh->prepare("
        INSERT INTO clientes (
            nom_cliente, rfc_cliente, dom_cliente, noext_cliente, noint_cliente, cp_cliente,
            col_cliente, cd_cliente, edo_cliente, tel_cliente, email_cliente, limitecred_cliente, diacred_cliente
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?)
    ");

  $stmt->execute([
    $_POST['cliente'],
    $_POST['rfc'],
    $_POST['calle'],
    $_POST['noexterior'],
    $_POST['nointerior'] ?? '',    
    $_POST['cpostal'],
    $_POST['colonia'],
    $_POST['ciudad'],
    $_POST['estado'],
    $_POST['telefono'],
    $_POST['email'],
    $_POST['limitecred'],
    $_POST['diacred'],
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
    "cpostal" => $_POST['cpostal'],
    "colonia" => $_POST['colonia'],
    "ciudad" => $_POST['ciudad'],
    "estado" => $_POST['estado'],
    "telefono" => $_POST['telefono'],
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
