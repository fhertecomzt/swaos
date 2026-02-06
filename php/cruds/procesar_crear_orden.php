<?php
// Solo se mostrarán errores graves en el log del servidor, no en la pantalla
ini_set('display_errors', 0);
ini_set('display_startup_errors', 0);
error_reporting(E_ALL);

require "../conexion.php";

header('Content-Type: application/json; charset=utf-8');
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

  // ==========================================
  // 1. VALIDAR USUARIO (TÉCNICO)
  // ==========================================

  $id_usuario = 1; // Valor por defecto de seguridad (Admin)

  if (isset($_POST['id_usuario_sesion']) && !empty($_POST['id_usuario_sesion'])) {
    $id_usuario = $_POST['id_usuario_sesion'];
  }

  // ==========================================
  // 2. VALIDAR CLIENTE
  // ==========================================
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

  // ==========================================
  // 3. INSERTAR ORDEN
  // ==========================================
  $token_hash = generarToken();
  $fecha_entrega = !empty($_POST['fecha_entrega_estimada']) ? $_POST['fecha_entrega_estimada'] : date('Y-m-d H:i:s', strtotime('+3 days'));

  $costo = !empty($_POST['costo']) ? floatval($_POST['costo']) : 0;
  $anticipo = !empty($_POST['anticipo']) ? floatval($_POST['anticipo']) : 0;
  $saldo = $costo - $anticipo;

  $sqlOrden = "INSERT INTO ordenesservicio (
        id_cliente, id_equipo, modelo, id_marca, numero_serie,
        falla, id_tiposervicio, diagnostico, observaciones,
        accesorios_recibidos, contrasena_dispositivo, 
        costo_servicio, anticipo_servicio, saldo_servicio,
        id_usuario, id_estado_servicio, fecha_entrega_estimada, token_hash
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

  $stmtOrden = $dbh->prepare($sqlOrden);

  // Usamos el operador ?? '' en TODO para evitar "Undefined array key"
  $stmtOrden->execute([
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

  $id_orden = $dbh->lastInsertId();

  // ==========================================
  // 4. SUBIR FOTOS
  // ==========================================
  if (!empty($_FILES['evidencias']['name'][0])) {
    $dir = "../../imgs/ordenes/";
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

  $dbh->commit();

  // ==========================================
  // 5. RESPUESTA
  // ==========================================
  $link = "https://localhost/swaos/track.php?t=" . $token_hash;
  $msg = "Hola *" . $datosCliente['nombre_cliente'] . "*,\nRecibimos tu equipo (Orden #$id_orden).\nVer estado: $link";
  if ($es_cuenta_nueva) $msg .= "\n\nTu clave de acceso: $pass_generada_texto";

  $response["success"] = true;
  $response["message"] = "Orden #$id_orden creada correctamente.";
  $response["token_qr"] = $link;
  $response["datos_whatsapp"] = ["telefono" => $datosCliente['tel_cliente'], "mensaje" => $msg];
} catch (Exception $e) {
  if ($dbh->inTransaction()) $dbh->rollBack();
  $response["message"] = "Error: " . $e->getMessage();
}

echo json_encode($response);
