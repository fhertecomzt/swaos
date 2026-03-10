<?php
include "../conexion.php";

$response = ["success" => false, "message" => "", "orden" => null, "abonos" => []];

if (isset($_GET['id'])) {
    $id = filter_var($_GET['id'], FILTER_SANITIZE_NUMBER_INT);

    try {
        // 1. Traemos la información principal de la orden
        $stmt = $dbh->prepare("SELECT * FROM ordenesservicio WHERE id_orden = :id");
        $stmt->execute([':id' => $id]);
        $orden = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($orden) {
            $response["success"] = true;
            $response["orden"] = $orden;

            // 2. Traemos el historial de pagos haciendo JOIN con los métodos de pago
            $sqlAbonos = "SELECT a.monto_abono, a.fecha_abono, IFNULL(m.nombre_metpago, 'Efectivo') as metodo 
                          FROM abonos_ordenes a 
                          LEFT JOIN metodosdepago m ON a.id_metpago = m.id_metpago 
                          WHERE a.id_orden = :id 
                          ORDER BY a.fecha_abono ASC";
            $stmtAbonos = $dbh->prepare($sqlAbonos);
            $stmtAbonos->execute([':id' => $id]);

            // Metemos los abonos encontrados dentro de la respuesta JSON
            $response["abonos"] = $stmtAbonos->fetchAll(PDO::FETCH_ASSOC);
        } else {
            $response["message"] = "No se encontró la orden especificada.";
        }
    } catch (PDOException $e) {
        $response["message"] = "Error de BD: " . $e->getMessage();
    }
} else {
    $response["message"] = "ID de orden no proporcionado.";
}

header('Content-Type: application/json');
echo json_encode($response);
