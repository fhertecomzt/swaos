<?php
include "../conexion.php";

if (isset($_POST['estado']) && is_numeric($_POST['estado'])) {
    $idEstado = $_POST['estado'];

    $sql = "SELECT id, nombre FROM municipios WHERE estado = :estado ORDER BY nombre ASC";
    $stmt = $dbh->prepare($sql);
    $stmt->bindParam(':estado', $idEstado, PDO::PARAM_INT);
    $stmt->execute();

    $municipios = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($municipios, JSON_UNESCAPED_UNICODE);
} else {
    echo json_encode(["error" => "Parámetro 'estado' no válido"], JSON_UNESCAPED_UNICODE);
}
