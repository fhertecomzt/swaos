<?php
// cruds/guardar_cliente_express.php
require "../conexion.php";

header('Content-Type: application/json');

if ($_SERVER["REQUEST_METHOD"] === "POST") {
  try {
    if (empty($_POST['nombre']) || empty($_POST['telefono'])) {
      echo json_encode(["success" => false, "message" => "Nombre y teléfono son obligatorios"]);
      exit;
    }

    // CORRECCIÓN: Ahora insertamos NULL en los campos de dirección
    // Nota como quitamos los ceros y 'Sin dirección'
    $sql = "INSERT INTO clientes (
                    nombre_cliente, papellido_cliente, tel_cliente, email_cliente, estatus, 
                    calle_cliente, noext_cliente, noint_cliente, 
                    id_edo_c, id_munici_c, id_col_c, id_cp_c, rfc_cliente
                ) VALUES (?, ?, ?, ?, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'XAXX010101000')";

    $stmt = $dbh->prepare($sql);
    $stmt->execute([
      $_POST['nombre'],
      $_POST['apellido'] ?? '',
      $_POST['telefono'],
      $_POST['email'] ?? 'sin@correo.com'
    ]);

    $id_nuevo = $dbh->lastInsertId();

    echo json_encode([
      "success" => true,
      "id" => $id_nuevo,
      "nombre_completo" => $_POST['nombre'] . ' ' . ($_POST['apellido'] ?? ''),
      "telefono" => $_POST['telefono']
    ]);
  } catch (PDOException $e) {
    // Tip: Si sigue fallando, esto nos dirá exactamente por qué
    echo json_encode(["success" => false, "message" => "Error BD: " . $e->getMessage()]);
  }
}
