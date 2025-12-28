<?php

//Includes
include "../conexion.php";

// Inicializamos la respuesta
$response = ["success" => false, "message" => ""];

// Verificar que el método sea POST
if ($_SERVER["REQUEST_METHOD"] === "POST") {
  $id = $_POST["editar-idproveedor"] ?? null;
  $proveedor = $_POST["proveedor"] ?? null;
  $papellido = $_POST["papellido"] ?? null;
  $sapellido = $_POST["sapellido"] ?? null;
  $contacto = $_POST["contacto"] ?? null;
  $rfc = $_POST["rfc"] ?? null;
  $telefono = $_POST["telefono"] ?? null;
  $email = $_POST["email"] ?? null;
  $estatus = $_POST["estatus"] ?? null;
  try {

    // Preparar la consulta SQL
    $stmt = $dbh->prepare(
      "UPDATE proveedores 
            SET nombre_prov = :proveedor, 
                papellido_prov = :papellido,
                sapellido_prov = :sapellido,
                contacto_prov = :contacto, 
                rfc_prov = :rfc, 
                tel_prov = :telefono, 
                email_prov = :email, 
                estatus = :estatus
            WHERE id_prov = :id"
    );

    // Ejecutar la consulta con los parámetros
    $stmt->execute([
      ":proveedor" => $proveedor,
      ":papellido" => $papellido,
      ":sapellido" => $sapellido,
      ":contacto" => $contacto,
      ":rfc" => $rfc,
      ":telefono" => $telefono,
      ":email" => $email,
      ":estatus" => $estatus,
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
