<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

include "../conexion.php";

// Inicializamos la respuesta
$response = ["success" => false, "message" => ""];

// Verificamos que el método sea POST
if ($_SERVER["REQUEST_METHOD"] === "POST") {
  $idproducto = $_POST["editar-idproducto"] ?? null;
  $codebar = $_POST["codebar"] ?? null;
  $producto = $_POST["producto"] ?? null;
  $descprod = $_POST["descprod"] ?? null;
  $categoria = $_POST["categoria"] ?? null;
  $marca = $_POST["marca"] ?? null;
  $genero = $_POST["genero"] ?? null;
  $talla = $_POST["talla"] ?? null;
  $estilo = $_POST["estilo"] ?? null;
  $color = $_POST["color"] ?? null;
  $costo_compra = $_POST["costo_compra"] ?? null;
  $ganancia = $_POST["ganancia"] ?? null;
  $precio1 = $_POST["precio1"] ?? null;
  $impuesto = $_POST["idimpuesto"] ?? null;
  $umedida = $_POST["umedida"] ?? null;
  $proveedor = $_POST["proveedor"] ?? null;
  $stock_minimo = $_POST["stock_minimo"] ?? null;
  // Imagen
  $imagen = $_FILES["imagen"]["name"] ?? null;
  $imagenTmp = $_FILES["imagen"]["tmp_name"] ?? null;
  $estatus = $_POST["estatus"] ?? null;
  

  // Sanitización y validación de datos
  $idproducto = filter_var($idproducto, FILTER_SANITIZE_NUMBER_INT);
  if (!$idproducto || !filter_var($idproducto, FILTER_VALIDATE_INT)) {
    $response["message"] = "El ID del producto es inválido.";
    echo json_encode($response);
    exit;
  }

  // Verificar si $categoria es un ID o un nombre
  if (!is_numeric($categoria)) {
    // Buscar el ID del categoria por nombre
    $consulta_categoria = $dbh->prepare("SELECT idcategoria FROM categorias WHERE nomcategoria = ?");
    $consulta_categoria->execute([$categoria]);
    $categoria_data = $consulta_categoria->fetch(PDO::FETCH_ASSOC);

    if ($categoria_data) {
      $categoria = $categoria_data['idcategoria'];
    } else {
      // Manejar el error si no se encuentra el categoria
      echo json_encode(['success' => false, 'message' => 'categoria no encontrada.']);
      exit;
    }
  }

  // Verificar si $marca es un ID o un nombre
  if (!is_numeric($marca)) {
    // Buscar el ID del marca por nombre
    $consulta_marca = $dbh->prepare("SELECT idmarca FROM marcas WHERE nommarca = ?");
    $consulta_marca->execute([$marca]);
    $marca_data = $consulta_marca->fetch(PDO::FETCH_ASSOC);

    if ($marca_data) {
      $marca = $marca_data['idmarca'];
    } else {
      // Manejar el error si no se encuentra el marca
      echo json_encode(['success' => false, 'message' => 'marca no encontrado.']);
      exit;
    }
  }

  try {
    // Obtener el producto actual para verificar la imagen
    $stmt = $dbh->prepare("SELECT imagen FROM productos WHERE idproducto = :idproducto");
    $stmt->execute([":idproducto" => $idproducto]);
    $productoActual = $stmt->fetch(PDO::FETCH_ASSOC);

    // Manejo de la imagen
    $rutaImagen = "";
    if (!empty($_FILES['imagen']['name'])) {
      $directorioImagen = __DIR__ . "../../../imgs/productos/";
      $rutaDestino = $directorioImagen . basename($_FILES['imagen']['name']);

      if (!is_writable($directorioImagen)) {
        throw new Exception("No se puede escribir en la carpeta imgs/productos/");
      }

      // Validación del tipo de archivo
      $tiposPermitidos = ['image/jpeg', 'image/png', 'image/gif'];
      if (!in_array($_FILES['imagen']['type'], $tiposPermitidos)) {
        throw new Exception("Tipo de archivo no permitido. Solo se permiten JPEG, PNG y GIF.");
      }

      // Validación del tamaño del archivo (en bytes)
      $tamanoMaximo = 2 * 1024 * 1024; // 2 MB
      if ($_FILES['imagen']['size'] > $tamanoMaximo) {
        throw new Exception("El tamaño del archivo excede el límite permitido (2 MB).");
      }

      $nombreImagen = uniqid() . '-' . basename($_FILES['imagen']['name']);
      $rutaCompleta = $directorioImagen . $nombreImagen;
      $rutaImagen = "../imgs/productos/" . $nombreImagen;

      // Mover el archivo subido
      if (!move_uploaded_file($_FILES['imagen']['tmp_name'], $rutaCompleta)) {
        throw new Exception("Error al subir la imagen.");
      }
    } else {
      $rutaImagen = $productoActual["imagen"];
    }

    // Preparar la consulta SQL
    $stmt = $dbh->prepare(
      "UPDATE productos 
             SET codbar_prod = :codbar_prod,
                 nom_prod = :nom_prod,
                 desc_prod = :desc_prod,
                 idcategoria = :idcategoria,
                 idmarca = :idmarca,
                 idgenero = :idgenero,
                 idtalla = :idtalla,
                 idestilo = :idestilo,
                 idcolor = :idcolor,
                 costo_compra_prod = :costo_compra_prod,
                 ganancia_prod = :ganancia_prod,
                 precio1_venta_prod = :precio1_venta_prod,
                 idimpuesto = :idimpuesto,
                 idumedida = :idumedida,
                 idproveedor = :idproveedor,
                 stock_minimo = :stock_minimo,
                 imagen = :imagen,
                 estatus = :estatus
            WHERE idproducto = :idproducto"
    );

    // Ejecutar la consulta con los parámetros
    $stmt->execute([
      ":codbar_prod" => $codebar,
      ":nom_prod" => $producto,
      ":desc_prod" => $descprod,
      ":idcategoria" => $categoria,
      ":idmarca" => $marca,
      ":idgenero" => $genero,
      ":idtalla" => $talla,
      ":idestilo" => $estilo,
      ":idcolor" => $color,
      ":costo_compra_prod" => $costo_compra,
      ":precio1_venta_prod" => $precio1,
      ":ganancia_prod" => $ganancia,
      ":idimpuesto" => $impuesto,
      ":idumedida" => $umedida,
      ":idproveedor" => $proveedor,
      ":stock_minimo" => $stock_minimo,
      ":imagen" => $rutaImagen,
      ":estatus" => $estatus,
      ":idproducto" => $idproducto
    ]);

    // Verificamos si hubo una actualización
    if ($stmt->rowCount() > 0) {
      $response["success"] = true;
      $response["message"] = "Producto actualizado correctamente.";
    } else {
      $response["message"] = "No se realizaron cambios en el Producto.";
    }
  } catch (PDOException $e) {
    $response["message"] = "Error de base de datos: " . $e->getMessage();
    error_log("Error de base de datos en editar_user.php: " . $e->getMessage());
  } catch (Exception $e) {
    $response["message"] = "Error: " . $e->getMessage();
    error_log("Error en editar_user.php: " . $e->getMessage());
  }
} else {
  $response["message"] = "Método no permitido.";
}

header("Content-Type: application/json");
echo json_encode($response);
