<?php

//Includes
include "../conexion.php";

// Inicializamos la respuesta
$response = ["success" => false, "message" => ""];

// Verificar que el método sea POST
if ($_SERVER["REQUEST_METHOD"] === "POST") {
  $id = $_POST["editar-idcliente"] ?? null;
  $cliente = $_POST["cliente"] ?? null;
  $rfc = $_POST["rfc"] ?? null;
  $calle = $_POST["calle"] ?? null;
  $noexterior = $_POST["noexterior"] ?? null;
  $nointerior = $_POST["nointerior"] ?? null;
  $cpostal = $_POST["cpostal"] ?? null;
  $colonia = $_POST["colonia"] ?? null;
  $ciudad = $_POST["ciudad"] ?? null;
  $estado = $_POST["estado"] ?? null;
  $telefono = $_POST["telefono"] ?? null;
  $email = $_POST["email"] ?? null;
  $limitecred = $_POST["limitecred"] ?? null;
  $diacred = $_POST["diacred"] ?? null;

  try {

    // Preparar la consulta SQL
    $stmt = $dbh->prepare(
      "UPDATE clientes 
            SET nom_cliente = :cliente, 
                rfc_cliente = :rfc,                 
                dom_cliente = :calle, 
                noext_cliente = :noexterior, 
                noint_cliente = :nointerior, 
                col_cliente = :colonia, 
                cd_cliente = :ciudad, 
                edo_cliente = :estado, 
                tel_cliente = :telefono, 
                cp_cliente = :cpostal, 
                email_cliente = :email, 
               limitecred_cliente = :limitecred,
               diacred_cliente = :diacred 
            WHERE idcliente = :id"
    );

    // Ejecutar la consulta con los parámetros
    $stmt->execute([
      ":cliente" => $cliente,
      ":rfc" => $rfc,
      ":calle" => $calle,
      ":noexterior" => $noexterior,
      ":nointerior" => $nointerior,
      ":colonia" => $colonia,
      ":ciudad" => $ciudad,
      ":estado" => $estado,
      ":telefono" => $telefono,
      ":cpostal" => $cpostal,
      ":email" => $email,
      ":limitecred" => $limitecred,
      ":diacred" => $diacred,
      ":id" => $id
    ]);

    // Verificar si se actualizó alguna fila
    if ($stmt->rowCount() > 0) {
      $response["success"] = true;
      $response["message"] = "Registro actualizado correctamente.";
    } else {
      $response["message"] = "No se realizaron cambios en el registro.";
    }
  } catch (PDOException $e) {
    // Evitar exponer detalles técnicos en el mensaje de error
    $response["message"] = "Error al actualizar el registro. Intente más tarde.";
  }
} else {
  $response["message"] = "Método no permitido.";
}

// Enviar la respuesta JSON
header("Content-Type: application/json");
echo json_encode($response);
