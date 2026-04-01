<?php
session_start();
require '../conexion.php';
header('Content-Type: application/json');

// Iniciamos sesión para saber en qué taller estamos
$id_taller_sesion = $_SESSION['taller_id'] ?? 1;

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

  // Si no hay cliente, debe ser NULL para la base de datos, no 0
  $id_cliente_final = ($id_cliente > 0) ? $id_cliente : null;

  $sqlVenta = "INSERT INTO ventas (id_taller, id_usuario, id_cliente, total, metodo_pago, tipo_movimiento, pago_cliente, cambio_cliente) 
               VALUES (?, ?, ?, ?, ?, 'Venta Mostrador', ?, ?)";

  $stmtVenta = $dbh->prepare($sqlVenta);

  $stmtVenta->execute([
    $id_taller,          // 1. Para id_taller
    $id_usuario,         // 2. Para id_usuario
    $id_cliente_final,   // 3. Para id_cliente (NULL o ID real)
    $total_venta,        // 4. Para total
    $metodo_pago,        // 5. Para metodo_pago
    $pago_cliente,       // 6. Para pago_cliente
    $cambio_cliente      // 7. Para cambio_cliente
  ]);

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

    //  INYECCIÓN DEL KARDEX: Solo si es un producto físico (ID > 0)
    if ($id_producto_final > 0) {

      // 1. Tomamos la "Fotografía" del stock ANTES de descontar (FOR UPDATE bloquea la fila por milisegundos para evitar choques)
      $stmtStockAnt = $dbh->prepare("SELECT stock FROM inventario_sucursal WHERE id_prod = ? AND idtaller = ? FOR UPDATE");
      $stmtStockAnt->execute([$id_producto_final, $id_taller]);
      $stock_anterior = floatval($stmtStockAnt->fetchColumn());

      // 2. Descontamos el inventario (Tu lógica original)
      $cantidad_vendida = floatval($item['cantidad']);
      $stmtInventario->execute([$cantidad_vendida, $id_producto_final, $id_taller]);

      // 3. Calculamos matemáticamente cómo quedó para el Kardex
      $stock_nuevo = $stock_anterior - $cantidad_vendida;
      $motivo_kardex = "Venta en Mostrador (Ticket #" . $id_venta . ")";

      // 4. Guardamos el comprobante intocable en el Kardex
      $stmtKardex = $dbh->prepare("INSERT INTO kardex_inventario 
          (id_prod, id_taller, id_usuario, tipo_movimiento, cantidad, stock_anterior, stock_nuevo, motivo) 
          VALUES (?, ?, ?, 'Salida', ?, ?, ?, ?)");

      $stmtKardex->execute([
        $id_producto_final,
        $id_taller,
        $id_usuario,
        $cantidad_vendida,
        $stock_anterior,
        $stock_nuevo,
        $motivo_kardex
      ]);
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

  //  Generamos el Token Único para el enlace
  $llave_secreta = "SWAOS_S3CR3T_2026_!#";
  $token_venta = hash('sha256', $id_venta . $llave_secreta);

  // MANDAMOS EL TELÉFONO, EL EMAIL Y EL TOKEN DE REGRESO A JAVASCRIPT
  echo json_encode([
    'success' => true,
    'message' => 'Venta registrada con éxito',
    'id_venta' => $id_venta,
    'telefono' => $tel_cliente,
    'email' => $email_cliente,
    'token' => $token_venta
  ]);
} catch (Exception $e) {
  $dbh->rollBack();
  echo json_encode(['success' => false, 'message' => 'Error en la base de datos: ' . $e->getMessage()]);
}