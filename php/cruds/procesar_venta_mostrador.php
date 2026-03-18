<?php
session_start();
require '../conexion.php';
header('Content-Type: application/json');

// Recibimos el paquete de datos JSON que nos manda el Carrito de JS
$datos = json_decode(file_get_contents('php://input'), true);

if (!$datos || empty($datos['carrito'])) {
  echo json_encode(['success' => false, 'message' => 'El carrito está vacío.']);
  exit;
}

// Variables de sesión y de la venta
$id_usuario = $_SESSION['id_usuario'] ?? $_SESSION['idusuario'] ?? 1; // Ajustado por si usas otro nombre
$id_taller = $_SESSION['taller_id'] ?? 1;
$metodo_pago = $datos['metodo_pago'];
$total_venta = $datos['total'];
$carrito = $datos['carrito'];
$id_cliente = (isset($datos['id_cliente']) && $datos['id_cliente'] > 0) ? $datos['id_cliente'] : 0;
$pago_cliente = isset($datos['pago_cliente']) ? floatval($datos['pago_cliente']) : 0;
$cambio_cliente = isset($datos['cambio_cliente']) ? floatval($datos['cambio_cliente']) : 0;

$id_cotizacion_origen = $datos['id_cotizacion_origen'] ?? 0;

try {
  // Encendemos el motor de transacciones 
  $dbh->beginTransaction();

  //  Guardamos la Venta Maestra
  // Nota: id_cliente e id_orden van en blanco (NULL) porque es venta pública de mostrador
  // Insertamos la Venta Maestra (Ahora con soporte para id_cliente)
  // Insertamos con cuanto pago y cambio
  $sqlVenta = "INSERT INTO ventas (id_usuario, id_cliente, total, metodo_pago, tipo_movimiento, pago_cliente, cambio_cliente) VALUES (?, ?, ?, ?, 'Venta Mostrador', ?, ?)";
  $stmtVenta = $dbh->prepare($sqlVenta);
  $stmtVenta->execute([$id_usuario, $id_cliente, $total_venta, $metodo_pago, $pago_cliente, $cambio_cliente]);

  // Obtenemos el Folio del Ticket que se acaba de crear
  $id_venta = $dbh->lastInsertId();

  // Preparamos las herramientas para guardar el detalle y descontar el stock
  $sqlDetalle = "INSERT INTO detalle_ventas (id_venta, id_producto, concepto, cantidad, precio_unitario, subtotal) VALUES (?, ?, ?, ?, ?, ?)";
  $stmtDetalle = $dbh->prepare($sqlDetalle);

  $sqlInventario = "UPDATE inventario_sucursal SET stock = stock - ? WHERE id_prod = ? AND idtaller = ?";
  $stmtInventario = $dbh->prepare($sqlInventario);

  // Recorremos el carrito producto por producto
  foreach ($carrito as $item) {
    $subtotal = $item['cantidad'] * $item['precio'];

    // ARMADURA: Buscamos el ID con cualquier nombre que traiga el JS. Si es un concepto libre, le ponemos 0.
    $id_producto_final = $item['id_prod'] ?? $item['id_prod_real'] ?? $item['id_producto'] ?? 0;

    // Guardamos el detalle usando nuestra variable blindada
    $stmtDetalle->execute([$id_venta, $id_producto_final, $item['nombre'], $item['cantidad'], $item['precio'], $subtotal]);

    // Solo descontamos del inventario si es un producto real (ID mayor a 0)
    if ($id_producto_final > 0) {
      $stmtInventario->execute([$item['cantidad'], $id_producto_final, $id_taller]);
    }
  }

  // Si esta venta vino de una cotización, la marcamos como Aprobada
  if ($id_cotizacion_origen > 0) {
    $stmtCot = $dbh->prepare("UPDATE cotizaciones SET estatus = 'Aprobada' WHERE id_cotizacion = ?");
    $stmtCot->execute([$id_cotizacion_origen]);
  }
  // BUSCAMOS LOS DATOS DEL CLIENTE PARA EL TICKET
  $tel_cliente = "";
  $email_cliente = "";
  if ($id_cliente > 0) {
    $stmtCli = $dbh->prepare("SELECT tel_cliente, email_cliente FROM clientes WHERE id_cliente = ?");
    $stmtCli->execute([$id_cliente]);
    $cli = $stmtCli->fetch(PDO::FETCH_ASSOC);
    if ($cli) {
      $tel_cliente = $cli['tel_cliente'] ?? '';
      $email_cliente = $cli['email_cliente'] ?? '';
    }
  }

  // Si todo es correcto, guardamos los cambios y cerramos la bóveda
  $dbh->commit();

  // AHORA SÍ, MANDAMOS EL TELÉFONO Y EL EMAIL DE REGRESO A JAVASCRIPT
  echo json_encode([
    'success' => true,
    'message' => 'Venta registrada con éxito',
    'id_venta' => $id_venta,
    'telefono' => $tel_cliente,
    'email' => $email_cliente
  ]);
} catch (Exception $e) {
  // Si algo explotó, cancelamos todo para que no haya robos fantasma
  $dbh->rollBack();
  echo json_encode(['success' => false, 'message' => 'Error en la base de datos: ' . $e->getMessage()]);
}
