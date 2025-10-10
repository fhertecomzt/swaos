<?php

//Includes
include "../conexion.php";

// Inicializamos la respuesta
$response = ["success" => false, "message" => ""];

// Verificar que el método sea POST
if ($_SERVER["REQUEST_METHOD"] === "POST") {
  $id = $_POST["editar-idproveedor"] ?? null;
  $proveedor = $_POST["proveedor"] ?? null;
  $contacto = $_POST["contacto"] ?? null;
  $rfc = $_POST["rfc"] ?? null;
  $telefono = $_POST["telefono"] ?? null;
  $celular = $_POST["celular"] ?? null;
  $email = $_POST["email"] ?? null;
  $limitecred = $_POST["limitecred"] ?? null;
  $diacred = $_POST["diacred"] ?? null;

  try {

    // Preparar la consulta SQL
    $stmt = $dbh->prepare(
      "UPDATE proveedores 
            SET nomproveedor = :proveedor, 
                contacproveedor = :contacto, 
                rfcproveedor = :rfc, 
                telproveedor = :telefono, 
                celproveedor = :celular, 
                emailproveedor = :email, 
                limitecredproveedor = :limitecred, 
                dicredproveedor = :diacred
            WHERE idproveedor = :id"
    );

    // Ejecutar la consulta con los parámetros
    $stmt->execute([
      ":proveedor" => $proveedor,
      ":contacto" => $contacto,
      ":rfc" => $rfc,
      ":telefono" => $telefono,
      ":celular" => $celular,
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
