<?php
include "../conexion.php"; 

$response = ["success" => false, "message" => ""];

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_GET['id'])) {
  $id = filter_var($_GET['id'], FILTER_SANITIZE_NUMBER_INT);

  if (!$id || !filter_var($id, FILTER_VALIDATE_INT)) {
    $response["message"] = "El ID proporcionado no es válido.";
    echo json_encode($response);
    exit;
  }

  try {
    // 1. CONFIGURAR ESTAS 4 VARIABLES 
    $tabla_catalogo = "categorias"; 
    $columna_id = "id_categoria";       
    
    // Configurar dónde vas a buscar si este registro está en uso
    $tabla_relacionada = "productos";       
    $columna_foranea = "id_cat";    

    // 2. BLINDAJE: VERIFICAR SI EL REGISTRO ESTÁ EN USO
    $queryCheck = "SELECT COUNT(*) as total FROM $tabla_relacionada WHERE $columna_foranea = :id";
    $stmtCheck = $dbh->prepare($queryCheck);
    $stmtCheck->bindParam(':id', $id, PDO::PARAM_INT);
    $stmtCheck->execute();
    $usoData = $stmtCheck->fetch(PDO::FETCH_ASSOC);

    if ($usoData['total'] > 0) {
        $response["message"] = "No se puede eliminar. Este registro está siendo utilizado por " . $usoData['total'] . " elemento(s) en el sistema (ej. Órdenes, Equipos o Productos). Cámbielo a estado Inactivo.";
        echo json_encode($response);
        exit;
    }

    // 3. ELIMINACIÓN SEGURA
    $stmt = $dbh->prepare("DELETE FROM $tabla_catalogo WHERE $columna_id = :id");
    $stmt->bindParam(':id', $id, PDO::PARAM_INT);

    if ($stmt->execute()) {
      if ($stmt->rowCount() > 0) {
        $response["success"] = true;
        $response["message"] = "Registro eliminado correctamente.";
      } else {
        $response["message"] = "No se encontró un registro con ese ID.";
      }
    } else {
      $response["message"] = "Error al intentar eliminar el registro.";
    }
  } catch (PDOException $e) {
    // Red de seguridad nativa de la Base de Datos
    $response["message"] = "Error de integridad: Este registro está vinculado a otras partes del sistema y no puede ser borrado.";
  }
} else {
  $response["message"] = "Método no permitido o falta de un ID válido.";
}

header("Content-Type: application/json");
echo json_encode($response);
?>