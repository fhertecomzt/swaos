<?php
header("Content-Type: application/json");
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
  $proveedor = $_POST['proveedor'] ?? '';
  $umedida = $_POST['umedida'] ?? '';
  $impuesto = $_POST['idimpuesto'] ?? '';
  $costo_compra = $_POST['costo_compra'] ?? 0;
  $ganancia = $_POST['ganancia'] ?? 0;
  $precio1 = $_POST['precio1'] ?? 0;
  $stock_minimo = $_POST['stock_minimo'] ?? '';
  $rutaImagen = $_POST['imagen'] ?? '';
  $estatus = trim($_POST['estatus'] ?? '');

  // Validación de campos obligatorios
  if (empty($codebar) || empty($nombre) || empty($descprod) || empty($categoria)) {
    throw new Exception("Todos los campos son obligatorios.");
  }

  // Función para verificar existencia en la base de datos
  function verificarExistencia($dbh, $tabla, $columna, $valor)
  {
    $stmt = $dbh->prepare("SELECT COUNT(*) FROM $tabla WHERE $columna = ?");
    $stmt->execute([$valor]);
    return $stmt->fetchColumn() > 0;
  }
  if (!verificarExistencia($dbh, 'impuestos', 'idimpuesto', $impuesto)) {
    throw new Exception("El impuesto seleccionado no es válido.");
  }

  if (!verificarExistencia($dbh, 'categorias', 'id_categoria', $categoria)) {
    throw new Exception("La categoría seleccionada no es válida.");
  }

  if (!verificarExistencia($dbh, 'unidades_med', 'id_unidad', $umedida)) {
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
            codebar_prod, nombre_prod, desc_prod, id_cat, id_marca, id_prov, id_unidad, id_impuesto, costo_prod, ganancia_prod, precio, stock_minimo, imagen, estatus
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ");

  $stmt->execute([
    $codebar,
    $nombre,
    $descprod,
    $categoria,
    $marca,
    $proveedor,
    $umedida,
    $impuesto,
    $costo_compra,
    $ganancia,
    $precio1,
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
    "proveedor" => $proveedor,
    "umedida" => $umedida,
    "impuesto" => $impuesto,
    "costo_compra" => $costo_compra,
    "ganancia" => $ganancia,
    "precio1" => $precio1,
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