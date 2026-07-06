<?php
require "../conexion.php";

if ($_SERVER["REQUEST_METHOD"] == "POST") {
  if (isset($_POST['codbar']) && is_array($_POST['codbar'])) {
    $codbar_array = $_POST['codbar'];
    $nom_prod_array = $_POST['nom_prod'];
    $desc_prod_array = $_POST['desc_prod'];
    $idcategoria_array = $_POST['idcategoria'];
    $idmarca_array = $_POST['idmarca'];
    $idgenero_array = $_POST['idgenero'];
    $idtalla_array = $_POST['idtalla'];
    $idestilo_array = $_POST['idestilo'];
    $idcolor_array = $_POST['idcolor'];
    $costo_prod_array = $_POST['costo_prod'];
    $ganancia_prod_array = $_POST['ganancia_prod'];
    $precio1_array = $_POST['precio1'];
    $idimpuesto_array = $_POST['idimpuesto'];
    $idumedida_array = $_POST['idumedida'];
    $idproveedor_array = $_POST['idproveedor'];
    $idestatus_array = $_POST['idestatus'];

    $num_productos = count($codbar_array);
    $inserciones_exitosas = 0;
    $errores = [];

    // Define la carpeta donde se guardarán las imágenes (asegúrate de que exista y tenga permisos de escritura)
    $carpeta_imagenes = "../../imgs/productos/";

    for ($i = 0; $i < $num_productos; $i++) {
      $codbar = $codbar_array[$i];
      $nom_prod = $nom_prod_array[$i];
      $desc_prod = $desc_prod_array[$i];
      $idcategoria = intval($idcategoria_array[$i]);
      $idmarca = isset($idmarca_array[$i]) && $idmarca_array[$i] !== '' ? intval($idmarca_array[$i]) : null;
      $idgenero = isset($idgenero_array[$i]) && $idgenero_array[$i] !== '' ? intval($idgenero_array[$i]) : null;
      $idtalla = isset($idtalla_array[$i]) && $idtalla_array[$i] !== '' ? intval($idtalla_array[$i]) : null;
      $idestilo = isset($idestilo_array[$i]) && $idestilo_array[$i] !== '' ? intval($idestilo_array[$i]) : null;
      $idcolor = isset($idcolor_array[$i]) && $idcolor_array[$i] !== '' ? intval($idcolor_array[$i]) : null;
      $costo_prod = floatval($costo_prod_array[$i]);
      $ganancia_prod = floatval($ganancia_prod_array[$i]);
      $precio1 = floatval($precio1_array[$i]);
      $idimpuesto = intval($idimpuesto_array[$i]);
      $idumedida = intval($idumedida_array[$i]);
      $idproveedor = intval($idproveedor_array[$i]);
      $idestatus = intval($idestatus_array[$i]);

      $nombre_imagen = ''; // Inicializa el nombre de la imagen para este producto

      // Procesa la carga de la imagen si se proporcionó un archivo
      if (isset($_FILES['imagen_prod']['error'][$i]) && $_FILES['imagen_prod']['error'][$i] == 0) {
        $archivo_temporal = $_FILES['imagen_prod']['tmp_name'][$i];
        $nombre_archivo_original = $_FILES['imagen_prod']['name'][$i];
        $tipo_archivo = $_FILES['imagen_prod']['type'][$i];
        $tamano_archivo = $_FILES['imagen_prod']['size'][$i];

        // Validar tipo de archivo (solo imágenes)
        $tipos_permitidos = ['image/jpeg', 'image/png', 'image/gif'];
        if (in_array($tipo_archivo, $tipos_permitidos)) {
          // Generar un nombre de archivo único
          $extension = pathinfo($nombre_archivo_original, PATHINFO_EXTENSION);
          $nombre_unico = uniqid('prod_') . '.' . $extension;
          $ruta_destino_archivo = $carpeta_imagenes . $nombre_unico;

          // Mover el archivo temporal a la ubicación de destino
          if (!move_uploaded_file($archivo_temporal, $ruta_destino_archivo)) {
            $errores[] = "Error al guardar la imagen para el producto " . ($i + 1) . ".";
            $nombre_imagen = ''; // En caso de error, no guardar nombre en la BD
          } else {
            // Guardar la ruta completa (o la ruta relativa que deseas) en la variable
            $nombre_imagen = '../imgs/productos/' . $nombre_unico;
          }
        } else {
          $errores[] = "El archivo para el producto " . ($i + 1) . " no es un tipo de imagen permitido (JPEG, PNG, GIF).";
        }
      } elseif (isset($_FILES['imagen_prod']['error'][$i]) && $_FILES['imagen_prod']['error'][$i] != 4) {
        // Error al cargar el archivo (diferente de "no se seleccionó archivo")
        $errores[] = "Error al cargar la imagen para el producto " . ($i + 1) . ": Código de error " . $_FILES['imagen_prod']['error'][$i];
      }

      $sql = "INSERT INTO productos (codbar_prod, nom_prod, desc_prod, idcategoria, idmarca, idgenero, idtalla, idestilo, idcolor, costo_compra_prod, ganancia_prod, precio1_venta_prod, idimpuesto, idumedida, idproveedor, estatus, imagen)
                    VALUES (:codbar_prod, :nom_prod, :desc_prod, :idcategoria, :idmarca, :idgenero, :idtalla, :idestilo, :idcolor, :costo_compra_prod, :ganancia_prod, :precio1_venta_prod, :idimpuesto, :idumedida, :idproveedor, :idestatus, :imagen)";

      $stmt = $dbh->prepare($sql);
      $stmt->bindParam(':codbar_prod', $codbar);
      $stmt->bindParam(':nom_prod', $nom_prod);
      $stmt->bindParam(':desc_prod', $desc_prod);
      $stmt->bindParam(':idcategoria', $idcategoria);
      $stmt->bindParam(':idmarca', $idmarca);
      $stmt->bindParam(':idgenero', $idgenero);
      $stmt->bindParam(':idtalla', $idtalla);
      $stmt->bindParam(':idestilo', $idestilo);
      $stmt->bindParam(':idcolor', $idcolor);
      $stmt->bindParam(':costo_compra_prod', $costo_prod);
      $stmt->bindParam(':ganancia_prod', $ganancia_prod);
      $stmt->bindParam(':precio1_venta_prod', $precio1);
      $stmt->bindParam(':idimpuesto', $idimpuesto);
      $stmt->bindParam(':idumedida', $idumedida);
      $stmt->bindParam(':idproveedor', $idproveedor);
      $stmt->bindParam(':idestatus', $idestatus);
      $stmt->bindParam(':imagen', $nombre_imagen); // Bind del nombre de la imagen

      try {
        $stmt->execute();
        $inserciones_exitosas++;
      } catch (PDOException $e) {
        if ($e->getCode() == '23000' && strpos($e->getMessage(), 'Duplicate entry') !== false && strpos($e->getMessage(), 'for key \'codbar_prod\'') !== false) {
          $errores[] = "El código de barras \"" . htmlspecialchars($codbar) . "\" ya existe.";
        } elseif ($e->getCode() == '23000' && strpos($e->getMessage(), 'Duplicate entry') !== false && strpos($e->getMessage(), 'for key') !== false && strpos($e->getMessage(), 'nom_prod') !== false) {
          $errores[] = "El nombre del producto \"" . htmlspecialchars($nom_prod) . "\" ya existe.";
        } else {
          $errores[] = "Error al insertar el producto " . ($i + 1) . ": " . print_r($stmt->errorInfo(), true);
        }
      }
    }

    if (empty($errores)) {
      $response = array('success' => true, 'message' => "Se insertaron " . $inserciones_exitosas . " productos correctamente.");
    } else {
      $response = array('success' => false, 'message' => "Hubo errores al insertar algunos productos:<br>" . implode("<br>", $errores));
    }
    // Aqui va el exit!
    header('Content-Type: application/json');
    echo json_encode($response);
    exit();
  } else {
    $response = array('success' => false, 'message' => "No se recibieron datos del formulario.");
    header('Content-Type: application/json');
    echo json_encode($response);
    exit();
  }
} else {
  $response = array('success' => false, 'message' => "Acceso no permitido.");
  header('Content-Type: application/json');
  echo json_encode($response);
  exit();
}
