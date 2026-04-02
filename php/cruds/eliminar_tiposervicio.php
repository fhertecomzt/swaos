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
    $tabla_catalogo = "tiposervicios";           
    $columna_id = "id_servicio";           

    // Configura dónde vas a buscar si este registro está en uso
    $tabla_relacionada = "ordenesservicio";     
    $columna_foranea = "id_tiposervicio";  // La columna en la tabla relacionada que guarda este ID

    // 2. BLINDAJE MULTI-TABLA: VERIFICAR SI EL REGISTRO ESTÁ EN USO
    $total_usos = 0;

    // A) Revisamos si está en uso en las Órdenes de Servicio
    $stmtCheck1 = $dbh->prepare("SELECT COUNT(*) FROM ordenesservicio WHERE id_tiposervicio = :id");
    $stmtCheck1->bindParam(':id', $id, PDO::PARAM_INT);
    $stmtCheck1->execute();
    $total_usos += $stmtCheck1->fetchColumn();

    // B) Revisamos si está en uso en las Citas
    // Nota: en la tabla citas la columna se llama tipo_cita
    $stmtCheck2 = $dbh->prepare("SELECT COUNT(*) FROM citas WHERE tipo_cita = :id");
    $stmtCheck2->bindParam(':id', $id, PDO::PARAM_INT);
    $stmtCheck2->execute();
    $total_usos += $stmtCheck2->fetchColumn();

    // Si encontró al menos 1 uso sumando ambas tablas, bloqueamos la eliminación
    if ($total_usos > 0) {
      $response["message"] = "No se puede eliminar. Este servicio está siendo utilizado en $total_usos registro(s) (Órdenes o Citas). Para no afectar el historial, edítelo y cámbielo a estado Inactivo.";
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
