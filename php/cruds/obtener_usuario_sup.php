<?php
include "../conexion.php";

$response = ["success" => false, "message" => ""];

// Validar si el ID es proporcionado y es un número
if (!empty($_GET['id']) && ctype_digit($_GET['id'])) {
  $idusuario = $_GET['id'];

  try {
    // Consulta segura con consulta preparada
    $stmt = $dbh->prepare("SELECT u.idusuario, u.usuario, u.nombre, u.appaterno, u.apmaterno, u.imagen, u.comision, u.estatus, r.nomrol, t.nomtienda
        FROM usuarios u
        JOIN roles r ON u.idrol = r.idrol
        JOIN tiendas t ON u.sucursales_id = t.idtienda
        WHERE nomrol NOT IN ('VENTAS', 'GERENCIA') AND u.idusuario = ?");


    $stmt->execute([$idusuario]);
    $users = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($users) {
      // Sanitizar datos antes de enviarlos en la respuesta (Llenar campos)
      $response["success"] = true;
      $response["users"] = [
        "idusuario" => htmlspecialchars($users["idusuario"]),
        "usuario" => htmlspecialchars($users["usuario"]),
        "nombre" => htmlspecialchars($users["nombre"]),
        "papellido" => htmlspecialchars($users["appaterno"]),
        "sapellido" => htmlspecialchars($users["apmaterno"]),
        "rol" => htmlspecialchars($users["nomrol"]),
        "tienda" => htmlspecialchars($users["nomtienda"]),
        "imagen" => htmlspecialchars($users["imagen"]),
        "comision" => htmlspecialchars($users["comision"]),
        "estatus" => htmlspecialchars($users["estatus"]),
      ];
    } else {
      $response["message"] = "No sé a encontrado el usuario.";
    }
  } catch (PDOException $e) {
    // Respuesta genérica en caso de error
    $response["message"] = "Hubo un error al procesar la solicitud. Intente más tarde.";
  }
} else {
  $response["message"] = "ID no proporcionado o inválido.";
}
// Enviar respuesta en formato JSON
echo json_encode($response);
