<?php

session_start();
// Iniciamos sesión para saber en qué taller estamos
$id_taller_sesion = $_SESSION['taller_id'] ?? 1;

header('Content-Type: application/json; charset=utf-8');
require "../conexion.php";

$response = ["success" => false, "message" => "Error desconocido"];

// Funciones
function generarPassword($longitud = 8)
{
  return substr(str_shuffle("23456789abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ"), 0, $longitud);
}
function generarToken()
{
  return bin2hex(random_bytes(16));
}

try {
  if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    throw new Exception("Método inválido");
  }

  $dbh->beginTransaction();

  // VALIDAR USUARIO (TÉCNICO)

  $id_usuario = 1; // Valor por defecto de seguridad (Admin)

  if (isset($_POST['id_usuario_sesion']) && !empty($_POST['id_usuario_sesion'])) {
    $id_usuario = $_POST['id_usuario_sesion'];
  }

  // AQUÍ RECIBIMOS EL ID DE LA CITA 
  $id_cita_origen = $_POST['id_cita_origen'] ?? 0;

  //  VALIDAR CLIENTE
  $id_cliente = $_POST['id_cliente'] ?? null;

  if (empty($id_cliente)) {
    throw new Exception("Debes seleccionar un cliente.");
  }

  // Verificar datos del cliente
  $stmtCli = $dbh->prepare("SELECT password, nombre_cliente, tel_cliente FROM clientes WHERE id_cliente = ?");
  $stmtCli->execute([$id_cliente]);
  $datosCliente = $stmtCli->fetch(PDO::FETCH_ASSOC);

  if (!$datosCliente) {
    throw new Exception("El cliente no existe.");
  }

  // Generar pass si es nuevo
  $pass_generada_texto = null;
  $es_cuenta_nueva = false;
  if (empty($datosCliente['password'])) {
    $pass_generada_texto = generarPassword();
    $pass_hash = password_hash($pass_generada_texto, PASSWORD_BCRYPT);
    $dbh->prepare("UPDATE clientes SET password = ? WHERE id_cliente = ?")->execute([$pass_hash, $id_cliente]);
    $es_cuenta_nueva = true;
  }

  // INSERTAR ORDEN
  $token_hash = generarToken();
  $fecha_entrega = !empty($_POST['fecha_entrega_estimada']) ? $_POST['fecha_entrega_estimada'] : date('Y-m-d H:i:s', strtotime('+3 days'));

  $costo = !empty($_POST['costo']) ? floatval($_POST['costo']) : 0;
  $anticipo = !empty($_POST['anticipo']) ? floatval($_POST['anticipo']) : 0;
  $saldo = $costo - $anticipo;

  // GENERADOR DE FOLIOS INDEPENDIENTES PARA ÓRDENES
  $stmtFolioOrd = $dbh->prepare("SELECT MAX(folio_sucursal) FROM ordenesservicio WHERE id_taller = ?");
  $stmtFolioOrd->execute([$id_taller_sesion]);
  $ultimo_folio_ord = $stmtFolioOrd->fetchColumn();
  $nuevo_folio_orden = ($ultimo_folio_ord) ? $ultimo_folio_ord + 1 : 1;
  // ======================================================================

  $sqlOrden = "INSERT INTO ordenesservicio (
        id_taller, folio_sucursal, id_cliente, id_equipo, modelo, id_marca, numero_serie,
        falla, id_tiposervicio, diagnostico, observaciones,
        accesorios_recibidos, contrasena_dispositivo, 
        costo_servicio, anticipo_servicio, saldo_servicio,
        id_usuario, id_estado_servicio, fecha_entrega_estimada, token_hash
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

  $stmtOrden = $dbh->prepare($sqlOrden);

  $stmtOrden->execute([
    $id_taller_sesion,
    $nuevo_folio_orden,  // <-- Inyectamos el nuevo folio visual aquí
    $id_cliente,
    $_POST['tipo_equipo'] ?? 1,
    trim($_POST['modelo'] ?? ''),
    $_POST['marca'] ?? 1,
    trim($_POST['numero_serie'] ?? '') ?: 'S/N',
    trim($_POST['falla'] ?? ''),
    $_POST['tipo_servicio'] ?? 1,
    trim($_POST['diagnostico'] ?? ''),
    trim($_POST['observaciones'] ?? ''),
    trim($_POST['accesorios'] ?? '') ?: 'Sin accesorios',
    trim($_POST['contrasena_dispositivo'] ?? '') ?: 'Sin clave',
    $costo,
    $anticipo,
    $saldo,
    $id_usuario,
    1,
    $fecha_entrega,
    $token_hash
  ]);

  $id_orden = $dbh->lastInsertId(); // La Llave Primaria (robot) sigue existiendo

  // REGISTRAR EL ANTICIPO 
  if ($anticipo > 0) {
    $id_metodo_pago = $_POST['id_metodo_pago'] ?? 1;

    $metodo_texto = 'Efectivo';
    if ($id_metodo_pago == 2) $metodo_texto = 'Tarjeta';
    if ($id_metodo_pago == 3) $metodo_texto = 'Transferencia';

    // GENERADOR DE FOLIOS INDEPENDIENTES PARA VENTAS (TICKETS)
    $stmtFolioVen = $dbh->prepare("SELECT MAX(folio_sucursal) FROM ventas WHERE id_taller = ?");
    $stmtFolioVen->execute([$id_taller_sesion]);
    $ultimo_folio_ven = $stmtFolioVen->fetchColumn();
    $nuevo_folio_venta = ($ultimo_folio_ven) ? $ultimo_folio_ven + 1 : 1;

    // Insertamos la Venta con su Folio Sucursal
    $stmtVenta = $dbh->prepare("INSERT INTO ventas (id_taller, folio_sucursal, id_cliente, id_usuario, id_orden, total, metodo_pago, tipo_movimiento) VALUES (?, ?, ?, ?, ?, ?, ?, 'Anticipo Orden')");
    $stmtVenta->execute([$id_taller_sesion, $nuevo_folio_venta, $id_cliente, $id_usuario, $id_orden, $anticipo, $metodo_texto]);
    $id_venta = $dbh->lastInsertId();

    // Especificamos el concepto en detalle_ventas
    $concepto = "Anticipo de Reparación Orden #" . $nuevo_folio_orden; // <-- Ahora muestra el folio bonito
    $stmtDetalle = $dbh->prepare("INSERT INTO detalle_ventas (id_venta, concepto, cantidad, precio_unitario, subtotal) VALUES (?, ?, 1, ?, ?)");
    $stmtDetalle->execute([$id_venta, $concepto, $anticipo, $anticipo]);
  }

  // SUBIR FOTOS
  if (!empty($_FILES['evidencias']['name'][0])) {
    $dir = "/../../imgs/ordenes/";
    if (!is_dir($dir)) mkdir($dir, 0777, true);

    $stmtImg = $dbh->prepare("INSERT INTO ordenes_imagenes (id_orden, ruta_imagen, tipo_evidencia, descripcion) VALUES (?, ?, 'recepcion', ?)");

    $count = count($_FILES['evidencias']['name']);
    for ($i = 0; $i < $count; $i++) {
      if ($_FILES['evidencias']['error'][$i] === UPLOAD_ERR_OK) {
        $ext = pathinfo($_FILES['evidencias']['name'][$i], PATHINFO_EXTENSION);
        $name = "orden_{$id_orden}_" . time() . "_{$i}." . $ext;
        if (move_uploaded_file($_FILES['evidencias']['tmp_name'][$i], $dir . $name)) {
          $stmtImg->execute([$id_orden, "imgs/ordenes/" . $name, "Evidencia inicial"]);
        }
      }
    }
  }

  // LÓGICA DE CIERRE DE CITA
  // Si esta orden viene de una conversión de cita, la marcamos como Atendida
  if ($id_cita_origen > 0) {
    $stmtCita = $dbh->prepare("UPDATE citas SET estatus = 'Atendida', color_evento = '#28a745' WHERE id_cita = ?");
    $stmtCita->execute([$id_cita_origen]);
  }

  // Confirmamos la transacción guardando todo permanentemente
  $dbh->commit();

  // RESPUESTA
  // OJO: Cambiar "localhost/swaos" por "swaos.rf.gd" cuando lo subas a tu servidor
  $link_track = "https://swaos.com.mx/track.php?t=" . $token_hash;
  $link_portal = "https://swaos.com.mx/portal_cliente.php";

  $msg = "Hola *" . $datosCliente['nombre_cliente'] . "*,\n";
  // Cambiamos $id_orden por $nuevo_folio_orden en el WhatsApp
  $msg .= "Recibimos tu equipo en taller. Tu número de Orden es la *#" . str_pad($nuevo_folio_orden, 6, "0", STR_PAD_LEFT) . "*.\n\n";
  $msg .= "Sigue el estado en tiempo real de tu equipo aquí:\n$link_track";

  if ($es_cuenta_nueva) {
    $msg .= "\n\n *¡BIENVENIDO(A) A TU PORTAL DE CLIENTE!* \n";
    $msg .= "Hemos creado un espacio exclusivo para ti donde podrás ver el historial de tus reparaciones y descargar tus notas.\n\n";
    $msg .= " *Ingresa aquí:* $link_portal\n";
    $msg .= " *Usuario:* " . $datosCliente['tel_cliente'] . "\n";
    $msg .= " *Clave provisional:* " . $pass_generada_texto . "\n\n";
    $msg .= "_(Recuerda guardar este mensaje o anotar tu clave)_";
  }

  $response["success"] = true;
  //  Cambiamos $id_orden por $nuevo_folio_orden en el mensaje de éxito de la pantalla
  $response["message"] = "Orden #$nuevo_folio_orden creada correctamente.";
  $response["token_qr"] = $token_hash;

  // Le mandamos ambos IDs al JavaScript por si los necesita para imprimir el ticket
  $response["id_orden_db"] = $id_orden;
  $response["folio_sucursal"] = $nuevo_folio_orden;

  $response["datos_whatsapp"] = ["telefono" => $datosCliente['tel_cliente'], "mensaje" => $msg];
} catch (Exception $e) {
  if ($dbh->inTransaction()) $dbh->rollBack();
  $response["message"] = "Error: " . $e->getMessage();
}

echo json_encode($response);
