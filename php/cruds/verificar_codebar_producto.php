<?php
include "../conexion.php";

header('Content-Type: application/json');

$response = ['existe' => false];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  $data = json_decode(file_get_contents("php://input"), true);
  $codebar = $data['codebar'] ?? '';
  $id = $data['id'] ?? 0;

  if (!empty($codebar)) {
    $stmt = $dbh->prepare("SELECT COUNT(*) FROM productos WHERE codbar_prod = :codebar AND idproducto != :id");
    $stmt->bindParam(':codebar', $codebar, PDO::PARAM_STR);
    $stmt->bindParam(':id', $id, PDO::PARAM_INT);
    $stmt->execute();

    if ($stmt->fetchColumn() > 0) {
      $response['existe'] = true;
    }
  }
}

echo json_encode($response);
