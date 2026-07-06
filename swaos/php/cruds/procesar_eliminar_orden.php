<?php
session_start();
require "../conexion.php";

if ($_SERVER['REQUEST_METHOD'] == 'POST' && isset($_POST['id_orden'])) {
    $id_orden = intval($_POST['id_orden']);

    // Cambia este "5" por el ID que le corresponda al estado "Cancelado" 
    $id_estado_cancelado = 5;

    // Obtenemos el taller actual de la sesión para saber a qué sucursal devolverle las piezas
    $id_taller = $_SESSION['taller_id'] ?? 1;

    try {
        // Iniciamos la transacción: Si algo falla a la mitad, se deshace todo.
        $dbh->beginTransaction();

        // BUSCAR LAS PIEZAS QUE ESTABAN ASIGNADAS A ESTA ORDEN
        $stmtPiezas = $dbh->prepare("SELECT id_prod, cantidad FROM orden_refacciones WHERE id_orden = ?");
        $stmtPiezas->execute([$id_orden]);
        $piezas_a_devolver = $stmtPiezas->fetchAll(PDO::FETCH_ASSOC);

        // DEVOLVER CADA PIEZA AL INVENTARIO DE LA SUCURSAL
        if (count($piezas_a_devolver) > 0) {
            foreach ($piezas_a_devolver as $pieza) {
                $stmtReturn = $dbh->prepare("UPDATE inventario_sucursal SET stock = stock + ? WHERE id_prod = ? AND idtaller = ?");
                $stmtReturn->execute([$pieza['cantidad'], $pieza['id_prod'], $id_taller]);
            }
        }

        // LIMPIAR LAS REFACCIONES DE LA ORDEN (Para que ya no aparezcan vinculadas si revisas el historial)
        $stmtLimpiar = $dbh->prepare("DELETE FROM orden_refacciones WHERE id_orden = ?");
        $stmtLimpiar->execute([$id_orden]);

        // CANCELAR LA ORDEN Y BORRAR SUS COSTOS FINANCIEROS (Para que no afecte el Corte de Caja ni Reportes)
        $sql = "UPDATE ordenesservicio 
                SET id_estado_servicio = ?, costo_servicio = 0, saldo_servicio = 0 
                WHERE id_orden = ?";
        $stmt = $dbh->prepare($sql);
        $stmt->execute([$id_estado_cancelado, $id_orden]);

        // Guardamos todos los cambios de forma permanente
        $dbh->commit();

        echo json_encode(['success' => true, 'message' => 'Orden cancelada y stock devuelto exitosamente.']);
    } catch (Exception $e) {
        // Si hay un error, deshacemos cualquier cambio a medias en la base de datos
        $dbh->rollBack();
        echo json_encode(['success' => false, 'message' => 'Error al cancelar: ' . $e->getMessage()]);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Petición inválida']);
}
