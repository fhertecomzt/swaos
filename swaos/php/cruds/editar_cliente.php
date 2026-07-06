<?php

//Includes
include "../conexion.php";

// Inicializamos la respuesta
$response = ["success" => false, "message" => ""];

// Verificar que el método sea POST
if ($_SERVER["REQUEST_METHOD"] === "POST") {
  $id = $_POST["editar-idcliente"] ?? null;
  $cliente = $_POST["cliente"] ?? null;
  $papellido = $_POST["papellido"] ?? null;
  $sapellido = $_POST["sapellido"] ?? null;
  $rfc = $_POST["rfc"] ?? null;
  $calle = $_POST["calle"] ?? null;
  $noexterior = $_POST["noexterior"] ?? null;
  $nointerior = $_POST["nointerior"] ?? null;
  $estado = $_POST["estado"] ?? null;
  $municipio = $_POST["municipio"] ?? null;
  $colonia = $_POST["colonia"] ?? null;
  $cpostal = $_POST["codigo_postal"] ?? null;
  $email = $_POST["email"] ?? null;
  $telefono = $_POST["telefono"] ?? null;
  $estatus = $_POST["estatus"] ?? null;

  try {

    // Preparar la consulta SQL
    $stmt = $dbh->prepare(
      "UPDATE clientes 
            SET nombre_cliente = :cliente,
                papellido_cliente = :papellido, 
                sapellido_cliente = :sapellido, 
                rfc_cliente = :rfc,                 
                calle_cliente = :calle, 
                noext_cliente = :noexterior, 
                noint_cliente = :nointerior, 
                id_edo_c = :estado, 
                id_munici_c = :municipio, 
                id_col_c = :colonia, 
                id_cp_c = :cpostal, 
                tel_cliente = :telefono, 
                email_cliente = :email,
                estatus = :estatus
            WHERE id_cliente = :id"
    );

    // Ejecutar la consulta con los parámetros
    $stmt->execute([
      ":cliente" => $cliente,
      ":papellido" => $papellido,
      ":sapellido" => $sapellido,
      ":rfc" => $rfc,
      ":calle" => $calle,
      ":noexterior" => $noexterior,
      ":nointerior" => $nointerior,
      ":estado" => $estado,
      ":municipio" => $municipio,
      ":colonia" => $colonia,
      ":cpostal" => $cpostal,
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
