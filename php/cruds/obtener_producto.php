<?php
include "../conexion.php";

$response = ["success" => false, "message" => ""];

// Validar si el ID es proporcionado y es un número
if (!empty($_GET['id']) && ctype_digit($_GET['id'])) {
  $idproducto = $_GET['id'];

  try {
    // Consulta segura con consulta preparada
    $stmt = $dbh->prepare("SELECT * FROM productos WHERE idproducto = ?");
    $stmt->execute([$idproducto]);
    $producto = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($producto) {
      // Sanitizar datos antes de enviarlos en la respuesta (Llenar campos)
      $response["success"] = true;
      $response["producto"] = [
        "idproducto" => htmlspecialchars($producto["idproducto"]),
        "codebar" => htmlspecialchars($producto["codbar_prod"]),
        "producto" => htmlspecialchars($producto["nom_prod"]),
        "descprod" => htmlspecialchars($producto["desc_prod"]),
        "categoria" => htmlspecialchars($producto["idcategoria"]),
        "marca" => htmlspecialchars($producto["idmarca"]),
        "genero" => htmlspecialchars($producto["idgenero"]),
        "talla" => htmlspecialchars($producto["idtalla"]),
        "estilo" => htmlspecialchars($producto["idestilo"]),
        "color" => htmlspecialchars($producto["idcolor"]),
        "costo_compra" => htmlspecialchars($producto["costo_compra_prod"]),
        "ganancia" => htmlspecialchars($producto["ganancia_prod"]),
        "precio1" => htmlspecialchars($producto["precio1_venta_prod"]),
        "impuesto" => htmlspecialchars($producto["idimpuesto"]),
        "umedida" => htmlspecialchars($producto["idumedida"]),
        "proveedor" => htmlspecialchars($producto["idproveedor"]),
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
