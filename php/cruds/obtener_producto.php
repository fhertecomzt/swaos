<?php
include "../conexion.php";

$response = ["success" => false, "message" => ""];

// Validar si el ID es proporcionado y es un número
if (!empty($_GET['id']) && ctype_digit($_GET['id'])) {
  $idproducto = $_GET['id'];

  try {
    // Consulta segura con consulta preparada
    $stmt = $dbh->prepare("SELECT * FROM productos WHERE id_prod = ?");
    $stmt->execute([$idproducto]);
    $producto = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($producto) {
      // Sanitizar datos antes de enviarlos en la respuesta (Llenar campos)
      $response["success"] = true;
      $response["producto"] = [
        "idproducto" => htmlspecialchars($producto["id_prod"]),
        "codebar" => htmlspecialchars($producto["codebar_prod"]),
        "producto" => htmlspecialchars($producto["nombre_prod"]),
        "descprod" => htmlspecialchars($producto["desc_prod"]),
        "categoria" => htmlspecialchars($producto["id_cat"]),
        "marca" => htmlspecialchars($producto["id_marca"]),
        "proveedor" => htmlspecialchars($producto["id_prov"]),
        "umedida" => htmlspecialchars($producto["id_unidad"]),
        "impuesto" => htmlspecialchars($producto["id_impuesto"]),
        "costo_compra" => htmlspecialchars($producto["costo_prod"]),
        "ganancia" => htmlspecialchars($producto["ganancia_prod"]),
        "precio1" => htmlspecialchars($producto["precio"]),
        "stock_minimo" => htmlspecialchars($producto["stock_minimo"]),
        "imagen" => htmlspecialchars($producto["imagen"]),
        "estatus" => htmlspecialchars($producto["estatus"]),

      ];
    } else {
      $response["message"] = "No sé a encontrado el producto.";
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
