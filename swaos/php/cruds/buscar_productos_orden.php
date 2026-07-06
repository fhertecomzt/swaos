<?php
session_start();
include "../conexion.php"; // Ajusta la ruta si es necesario

// Verificamos que venga una consulta
if (!isset($_GET['q']) || empty(trim($_GET['q']))) {
  echo json_encode([]);
  exit;
}

$termino = "%" . trim($_GET['q']) . "%";

// Obtenemos el ID del taller de la sesión del usuario logueado
// Si por alguna razón tu variable de sesión se llama diferente, ajústala aquí (ej. $_SESSION['taller_id'])
$id_taller = $_SESSION['id_taller'] ?? 1;

try {
  // Esta consulta es una obra de arte: 
  // Busca en productos (activos) y hace un LEFT JOIN con el inventario de la SUCURSAL ACTUAL
  $sql = "SELECT 
                p.id_prod as id, 
                p.codebar_prod as codebar, 
                p.nombre_prod as nombre, 
                p.precio, 
                IFNULL(i.stock, 0) as stock
            FROM productos p
            LEFT JOIN inventario_sucursal i ON p.id_prod = i.id_prod AND i.idtaller = :idtaller
            WHERE (p.nombre_prod LIKE :termino OR p.codebar_prod LIKE :termino)
            AND p.estatus = 0
            LIMIT 10";

  $stmt = $dbh->prepare($sql);
  $stmt->bindParam(':termino', $termino, PDO::PARAM_STR);
  $stmt->bindParam(':idtaller', $id_taller, PDO::PARAM_INT);
  $stmt->execute();

  $resultados = $stmt->fetchAll(PDO::FETCH_ASSOC);

  // Devolvemos los resultados a JavaScript en formato JSON
  header('Content-Type: application/json');
  echo json_encode($resultados);
} catch (PDOException $e) {
  // Si hay error, devolvemos un arreglo vacío para no romper el JavaScript
  header('Content-Type: application/json');
  echo json_encode([]);
}
