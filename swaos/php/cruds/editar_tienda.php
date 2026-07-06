<?php
//Includes
include "../conexion.php";

// Inicializamos la respuesta
$response = ["success" => false, "message" => ""];


// Verificar que el método sea POST
if ($_SERVER["REQUEST_METHOD"] === "POST") {
  $id = $_POST["editar-id"] ?? null;
  $nombre = $_POST["nombre"] ?? null;
  $razonsocial = $_POST["razonsocial"] ?? null;
  $rfc = $_POST["rfc"] ?? null;
  $calle = $_POST["calle"] ?? null;
  $noexterior = $_POST["noexterior"] ?? null;
  $nointerior = $_POST["nointerior"] ?? null;
  $estado = $_POST["estado"] ?? null;
  $municipio = $_POST["municipio"] ?? null;
  $colonia = $_POST["colonia"] ?? null;
  $cpostal = $_POST["codigo_postal"] ?? null;
  $telefono = $_POST["telefono"] ?? null;
  $email = $_POST["email"] ?? null;
  $estatus = $_POST["estatus"] ?? null;

  try {

    // Preparar la consulta SQL
    $stmt = $dbh->prepare(
      "UPDATE talleres 
            SET nombre_t = :nombre, 
                razonsocial_t = :razonsocial, 
                rfc_t = :rfc, 
                calle_t = :calle, 
                numext_t = :noexterior, 
                numint_t = :nointerior, 
                id_edo_t = :estado, 
                id_munici_t = :municipio, 
                id_col_t = :colonia, 
                id_cp_t = :cpostal, 
                tel_t = :telefono, 
                email_t = :email, 
                estatus_t = :estatus
            WHERE id_taller = :id"
    );

    // Ejecutar la consulta con los parámetros
    $stmt->execute([
      ":nombre" => $nombre,
      ":razonsocial" => $razonsocial,
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
      $response["message"] = "Taller se ha actualizado correctamente.";
    } else {
      $response["message"] = "No se realizaron cambios en el taller.";
    }
  } catch (PDOException $e) {
    // Evitar exponer detalles técnicos en el mensaje de error
    //$response["message"] = "Error al actualizar el taller. Intente más tarde.";
    $response["message"] = "SQL ERROR: " . $e->getMessage();
  }
} else {
  $response["message"] = "Método no permitido.";
}

// Enviar la respuesta JSON
header("Content-Type: application/json");
echo json_encode($response);
