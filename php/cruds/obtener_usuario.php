<?php
include "../conexion.php";

$response = ["success" => false, "message" => ""];

// Validar si el ID es proporcionado y es un número
if (!empty($_GET['id']) && ctype_digit($_GET['id'])) {
  $idusuario = $_GET['id'];

  try {
    // Consulta segura con consulta preparada
    //$stmt = $dbh->prepare("SELECT * FROM usuarios WHERE idusuario = ?");
    $stmt = $dbh->prepare("SELECT u.id_usuario, u.usuario, u.nombre, u.p_appellido, u.s_appellido, u.email, u.imagen, u.estatus, r.nom_rol, t.nombre_t
        FROM usuarios u
        JOIN roles r ON u.id_rol = r.id_rol
        JOIN talleres t ON u.taller_id = t.id_taller
        WHERE u.id_usuario = ?");

    $stmt->execute([$idusuario]);
    $users = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($users) {
      // Sanitizar datos antes de enviarlos en la respuesta (Llenar campos)
      $response["success"] = true;
      $response["users"] = [
        "idusuario" => htmlspecialchars($users["id_usuario"]),
        "usuario" => htmlspecialchars($users["usuario"]),
        "nombre" => htmlspecialchars($users["nombre"]),
        "papellido" => htmlspecialchars($users["p_appellido"]),
        "sapellido" => htmlspecialchars($users["s_appellido"]),
        "email" => htmlspecialchars($users["email"]),
        "rol" => htmlspecialchars($users["nom_rol"]),
        "tienda" => htmlspecialchars($users["nombre_t"]),
        "imagen" => htmlspecialchars($users["imagen"]),
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
