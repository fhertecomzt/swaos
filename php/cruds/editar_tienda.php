<?php

//Includes
include "../conexion.php";

// Inicializamos la respuesta
$response = ["success" => false, "message" => ""];


// Verificar que el método sea POST
if ($_SERVER["REQUEST_METHOD"] === "POST") {
  $id = $_POST["editar-id"] ?? null;
  $nombre = $_POST["nombre"] ?? null;
  $representante = $_POST["representante"] ?? null;
  $rfc = $_POST["rfc"] ?? null;
  $calle = $_POST["domicilio"] ?? null;
  $noexterior = $_POST["noexterior"] ?? null;
  $nointerior = $_POST["nointerior"] ?? null;
  $pais = $_POST["pais"] ?? null;
  $estado = $_POST["estado"] ?? null;
  $municipio = $_POST["ciudad"] ?? null;
  $colonia = $_POST["colonia"] ?? null;
  $cpostal = $_POST["cpostal"] ?? null;
  $telefono = $_POST["telefono"] ?? null;
  $email = $_POST["email"] ?? null;
  $estatus = $_POST["estatus"] ?? null;

  try {

    // Preparar la consulta SQL
    $stmt = $dbh->prepare(
      "UPDATE talleres 
            SET nomtienda = :nombre, 
                reptienda = :representante, 
                rfctienda = :rfc, 
                domtienda = :domicilio, 
                noexttienda = :noexterior, 
                nointtienda = :nointerior, 
                coltienda = :colonia, 
                cdtienda = :ciudad, 
                edotienda = :estado, 
                cptienda = :cpostal, 
                emailtienda = :email, 
                teltienda = :telefono, 
                estatus = :estatus
            WHERE idtienda = :id"
    );

    // Ejecutar la consulta con los parámetros
    $stmt->execute([
      ":nombre" => $nombre,
      ":representante" => $representante,
      ":rfc" => $rfc,
      ":domicilio" => $domicilio,
      ":noexterior" => $noexterior,
      ":nointerior" => $nointerior,
      ":colonia" => $colonia,
      ":ciudad" => $ciudad,
      ":estado" => $estado,
      ":cpostal" => $cpostal,
      ":email" => $email,
      ":telefono" => $telefono,
      ":estatus" => $estatus,
      ":id" => $id
    ]);

    // Verificar si se actualizó alguna fila
    if ($stmt->rowCount() > 0) {
      $response["success"] = true;
      $response["message"] = "Taller actualizado correctamente.";
    } else {
      $response["message"] = "No se realizaron cambios en la tienda.";
    }
  } catch (PDOException $e) {
    // Evitar exponer detalles técnicos en el mensaje de error
    $response["message"] = "Error al actualizar el taller. Intente más tarde.";
  }
} else {
  $response["message"] = "Método no permitido.";
}

// Enviar la respuesta JSON
header("Content-Type: application/json");
echo json_encode($response);
