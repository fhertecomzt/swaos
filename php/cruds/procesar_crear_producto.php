<?php

header("Content-Type: application/json");
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . "/error_log.txt"); // Guardar errores en un archivo

require_once "../conexion.php"; // Usamos require_once para evitar múltiples inclusiones.

$response = ["success" => false, "message" => ""];

try {
  // Validar conexión
  if (!isset($dbh)) {
    throw new Exception("Error en la conexión a la base de datos.");
  }

  // Obtener datos del formulario
  $codebar = trim($_POST['codebar'] ?? '');
  $nombre = trim($_POST['producto'] ?? '');
  $descprod = trim($_POST['descprod'] ?? '');
  $categoria = $_POST['categoria'] ?? '';
  $marca = $_POST['marca'] ?? '';
  $genero = $_POST['genero'] ?? '';
  $talla = $_POST['talla'] ?? '';
  $estilo = $_POST['estilo'] ?? '';
  $color = $_POST['color'] ?? '';
  $costo_compra = $_POST['costo_compra'] ?? 0;
  $ganancia = $_POST['ganancia'] ?? 0;
  $precio1 = $_POST['precio1'] ?? 0;
  $impuesto = $_POST['idimpuesto'] ?? '';
  $umedida = $_POST['umedida'] ?? '';
  $proveedor = $_POST['proveedor'] ?? '';
  $stock_minimo = $_POST['stock_minimo'] ?? '';
  $rutaImagen = $_POST['imagen'] ?? '';
  $estatus = trim($_POST['estatus'] ?? '');
  // Debug error_log($_POST['idimpuesto']);

  // Validación de campos obligatorios
  if (empty($codebar) || empty($nombre) || empty($descprod) || empty($categoria)) {
    throw new Exception("Los campos Codigo de Barras, Nombre, Descripcion y categoria son obligatorios.");
  }

  // Función para verificar existencia en la base de datos
  function verificarExistencia($dbh, $tabla, $columna, $valor)
  {
    $stmt = $dbh->prepare("SELECT COUNT(*) FROM $tabla WHERE $columna = ?");
    $stmt->execute([$valor]);
    return $stmt->fetchColumn() > 0;
  }
  if (!verificarExistencia($dbh, 'impuestos', 'idimpuesto', $impuesto)) {
    throw new Exception("La categoría seleccionada no es válida.");
  }

  if (!verificarExistencia($dbh, 'categorias', 'idcategoria', $categoria)) {
    throw new Exception("La categoría seleccionada no es válida.");
  }

  if (!verificarExistencia($dbh, 'umedidas', 'idumedida', $umedida)) {
    throw new Exception("La unidad de medida seleccionada no es válida.");
  }

  // Procesar imagen
  $rutaImagen = "";
  if (!empty($_FILES['imagen']['name'])) {
    $directorioImagen = __DIR__ . "../../../imgs/productos/";

    // Verificar permisos de la carpeta
    if (!is_writable($directorioImagen)) {
      throw new Exception("No se puede escribir en la carpeta imgs/productos/");
    }

    // Crear nombre único para la imagen
    $nombreImagen = uniqid() . '-' . basename($_FILES['imagen']['name']);
    $rutaCompleta = $directorioImagen . $nombreImagen;
    $rutaImagen = "../imgs/productos/" . $nombreImagen;

    // Mover la imagen
    if (!move_uploaded_file($_FILES['imagen']['tmp_name'], $rutaCompleta)) {
      throw new Exception("Error al subir la imagen.");
    }
  }

  // Insertar en la base de datos
  $stmt = $dbh->prepare("
        INSERT INTO productos (
            codbar_prod, nom_prod, desc_prod, idcategoria, idmarca, idgenero, idtalla, idestilo, idcolor, 
            costo_compra_prod, ganancia_prod, precio1_venta_prod,
            idimpuesto, idumedida, idproveedor, stock_minimo, imagen, estatus
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ");

  $stmt->execute([
    $codebar,
    $nombre,
    $descprod,
    $categoria,
    $marca,
    $genero,
    $talla,
    $estilo,
    $color,
    $costo_compra,
    $ganancia,
    $precio1,
    $impuesto,
    $umedida,
    $proveedor,
    $stock_minimo,
    $rutaImagen,
    $estatus
  ]);

  $lastId = $dbh->lastInsertId();

  // Respuesta exitosa
  $response["success"] = true;
  $response["message"] = "El producto fue registrado exitosamente.";
  $response["producto"] = [
    "id" => $lastId,
    "codebar" => $codebar,
    "producto" => $nombre,
    "descprod" => $descprod,
    "categoria" => $categoria,
    "marca" => $marca,
    "genero" => $genero,
    "talla" => $talla,
    "estilo" => $estilo,
    "color" => $color,
    "costo_compra" => $costo_compra,
    "ganancia" => $ganancia,
    "precio1" => $precio1,
    "impuesto" => $impuesto,
    "umedida" => $umedida,
    "proveedor" => $proveedor,
    "stock_minimo" => $stock_minimo,
    "imagen" => $rutaImagen,
    "estatus" => $estatus
  ];
} catch (Exception $e) {
  $response["success"] = false;
  $response["message"] = "Error: " . $e->getMessage();
} finally {
  if (empty($response)) {
    $response = ["success" => false, "message" => "Error desconocido en el servidor."];
  }
  echo json_encode($response);
  die();
}