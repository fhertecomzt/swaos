<?php

require "../conexion.php";
require "../funciones/funciones.php";
require "../funciones/activoinactivo.php"; // Para el array $options si decides usarlo aquí

header('Content-Type: application/json'); // Importante: indica que la respuesta es JSON

if (isset($_GET['tabla'])) {
  $tabla = $_GET['tabla'];
  $data = [];
  $error = '';

  switch ($tabla) {
    case 'categorias':
      //error_log("Valor de \$dbh antes de obtenerRegistros (categorias): " . print_r($dbh, true));
      $data = obtenerRegistros($dbh, "categorias", "id_categoria, nombre_cat", "ASC", "id_cat");
      //error_log("Valor de \$data después de obtenerRegistros (categorias): " . print_r($data, true));
      //array_unshift($data, array("value" => "1", "text" => "Ninguna"));
      break;
    case 'marcas':
      $data = obtenerRegistros($dbh, "marcas", "idmarca, nommarca", "ASC", "idmarca");
      //array_unshift($data, array("value" => "1", "text" => "Ninguna"));
      break;
    case 'generos':
      $data = obtenerRegistros($dbh, "generos", "idgenero, nomgenero", "ASC", "idgenero");
      //array_unshift($data, array("value" => "1", "text" => "Ninguno"));
      break;
    case 'tallas':
      $data = obtenerRegistros($dbh, "tallas", "idtalla, nomtalla", "ASC", "idtalla");
     // array_unshift($data, array("value" => "1", "text" => "Ninguna"));
      break;
    case 'estilos':
      $data = obtenerRegistros($dbh, "estilos", "idestilo, nomestilo", "ASC", "idestilo");
     // array_unshift($data, array("value" => "1", "text" => "Ninguno"));
      break;
    case 'colores':
      $data = obtenerRegistros($dbh, "colores", "idcolor, nomcolor", "ASC", "idcolor");
      array_unshift($data, array("value" => "1", "text" => "Ninguno"));
      break;
    case 'impuestos':
      $data = obtenerRegistros($dbh, "impuestos", "idimpuesto, nomimpuesto, tasa", "ASC", "idimpuesto");
      //array_unshift($data, array("value" => "1", "text" => "Ninguno"));
      break;
    case 'umedidas':
     // error_log("Valor de \$dbh antes de obtenerRegistros (umedidas): " . print_r($dbh, true));
      $data = obtenerRegistros($dbh, "umedidas", "idumedida, nomumedida", "ASC", "idumedida");
     // error_log("Valor de \$dbh antes de obtenerRegistros (umedidas): " . print_r($dbh, true));
     // array_unshift($data, array("value" => "16", "text" => "Ninguna"));
      break;
    case 'proveedores':
      $data = obtenerRegistros($dbh, "proveedores", "idproveedor, nomproveedor", "ASC", "idproveedor");
     // array_unshift($data, array("value" => "1", "text" => "Ninguno"));
      break;
    case 'estatus':
      $data = [
        ['value' => 0, 'text' => 'Activo'],
        ['value' => 1, 'text' => 'Inactivo'],
      ];
      echo json_encode($data);
      exit();
  }

  if ($error) {
    http_response_code(400); // Bad Request
    echo json_encode(['error' => $error]);
  } else {
    echo json_encode($data);
  }
} else {
  http_response_code(400); // Bad Request
  echo json_encode(['error' => 'Parámetro "tabla" no proporcionado']);
}

$dbh = null; // Cierra la conexión PDO
