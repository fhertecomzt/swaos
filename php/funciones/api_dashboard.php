<?php
header('Content-Type: application/json');
require '../conexion.php';

try {
  // 1. CONTADORES DE LAS TARJETAS (Lo que ya tenías)
  $productos = $dbh->query("SELECT COUNT(*) as total FROM productos WHERE estatus = 0")->fetch(PDO::FETCH_ASSOC)['total'];
  $clientes = $dbh->query("SELECT COUNT(*) as total FROM clientes WHERE estatus = 0")->fetch(PDO::FETCH_ASSOC)['total'];
  $proveedores = $dbh->query("SELECT COUNT(*) as total FROM proveedores WHERE estatus = 0")->fetch(PDO::FETCH_ASSOC)['total'];
  $ventas = 0; // Pendiente para cuando exista el módulo de ventas

  $opendientes = $dbh->query("SELECT COUNT(*) as total FROM ordenesservicio WHERE id_estado_servicio IN (1,3,4)")->fetch(PDO::FETCH_ASSOC)['total'];
  $olistas = $dbh->query("SELECT COUNT(*) as total FROM ordenesservicio WHERE id_estado_servicio = 6")->fetch(PDO::FETCH_ASSOC)['total'];

  // 2. NUEVO: DATOS PARA LA GRÁFICA DE DONA (Equipos por estado)
  // Ajusta 'estadosservicios' y 'estado_servicio' según tu base de datos
  $stmtGrafica = $dbh->query("SELECT e.estado_servicio as estado, COUNT(o.id_orden) as total 
                              FROM ordenesservicio o 
                              JOIN estadosservicios e ON o.id_estado_servicio = e.id_estado_servicio 
                              GROUP BY e.estado_servicio");
  $datosGrafica = $stmtGrafica->fetchAll(PDO::FETCH_ASSOC);

  // 3. NUEVO: ÚLTIMAS 5 ÓRDENES PARA LA TABLA
  $stmtTabla = $dbh->query("SELECT o.id_orden, c.nombre_cliente as cliente, e.estado_servicio as estado 
                            FROM ordenesservicio o 
                            JOIN clientes c ON o.id_cliente = c.id_cliente 
                            JOIN estadosservicios e ON o.id_estado_servicio = e.id_estado_servicio 
                            ORDER BY o.id_orden DESC LIMIT 5");
  $ultimasOrdenes = $stmtTabla->fetchAll(PDO::FETCH_ASSOC);

  // Enviamos TODO en un solo paquete JSON
  echo json_encode([
    'productos' => $productos,
    'clientes' => $clientes,
    'proveedores' => $proveedores,
    'ventas' => $ventas,
    'opendientes' => $opendientes,
    'olistas' => $olistas,
    'grafica' => $datosGrafica,
    'ultimas_ordenes' => $ultimasOrdenes
  ]);
} catch (PDOException $e) {
  echo json_encode(['error' => 'Error en BD: ' . $e->getMessage()]);
}
?>