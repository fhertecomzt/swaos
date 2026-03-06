<?php
header('Content-Type: application/json');
require '../conexion.php';

try {
  // Contamos catálogos activos
  $productos = $dbh->query("SELECT COUNT(*) as total FROM productos WHERE estatus = 0")->fetch(PDO::FETCH_ASSOC)['total'];
  $clientes = $dbh->query("SELECT COUNT(*) as total FROM clientes WHERE estatus = 0")->fetch(PDO::FETCH_ASSOC)['total'];
  $proveedores = $dbh->query("SELECT COUNT(*) as total FROM proveedores WHERE estatus = 0")->fetch(PDO::FETCH_ASSOC)['total'];

  // VENTAS: Puesto en 0 por ahora para que no rompa el sistema, ya que la tabla aún no existe
  $ventas = 0;

  // ÓRDENES: Usamos la tabla ordenesservicio. Verificar los Ids en la base datos 
  // Órdenes Pendientes: Sumamos los que están en Recibido (1), Revisión (3) o Diagnosticado (4)
  $opendientes = $dbh->query("SELECT COUNT(*) as total FROM ordenesservicio WHERE id_estado_servicio IN (1,3,4)")->fetch(PDO::FETCH_ASSOC)['total'];

  // Órdenes Listas: Solo los que están en Terminado (asumiendo que es el ID 6)
  $olistas = $dbh->query("SELECT COUNT(*) as total FROM ordenesservicio WHERE id_estado_servicio = 6")->fetch(PDO::FETCH_ASSOC)['total'];

  echo json_encode([
    'productos' => $productos,
    'clientes' => $clientes,
    'proveedores' => $proveedores,
    'ventas' => $ventas,
    'opendientes' => $opendientes,
    'olistas' => $olistas
  ]);
} catch (PDOException $e) {
  // Solo devolvemos UN error JSON válido para que el JS no se vuelva loco
  echo json_encode(['error' => 'Error en BD: ' . $e->getMessage()]);
}
