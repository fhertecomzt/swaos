<?php
// Rastreo público de órdenes
require "php/conexion.php"; 

$token = $_GET['t'] ?? '';

// Si no hay token, adiós
if (empty($token)) {
  die("<h1>Enlace no válido</h1><p>Por favor verifica la URL.</p>");
}

// Buscar la orden por el Token (Seguridad: No usamos ID, usamos el hash)
$sql = "SELECT o.*, c.nombre_cliente, c.papellido_cliente, e.nombre_equipo, m.nom_marca, es.estado_servicio
        FROM ordenesservicio o
        JOIN clientes c ON o.id_cliente = c.id_cliente
        JOIN equipos e ON o.id_equipo = e.id_equipo
        JOIN marcas m ON o.id_marca = m.id_marca
        JOIN estadosservicios es ON o.id_estado_servicio = es.id_estado_servicio
        WHERE o.token_hash = ?";

$stmt = $dbh->prepare($sql);
$stmt->execute([$token]);
$orden = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$orden) {
  die("<h1>Orden no encontrada</h1><p>El enlace ha caducado o es incorrecto.</p>");
}

// Buscar Evidencias (Fotos)
$stmtImg = $dbh->prepare("SELECT ruta_imagen FROM ordenes_imagenes WHERE id_orden = ?");
$stmtImg->execute([$orden['id_orden']]);
$imagenes = $stmtImg->fetchAll(PDO::FETCH_ASSOC);

// Configuración visual del estado (Progreso)
$estado_actual = strtolower($orden['estado_servicio']); 
$progreso = 10;
if (strpos($estado_actual, 'reparación') !== false) $progreso = 50;
if (strpos($estado_actual, 'listo') !== false || strpos($estado_actual, 'entregado') !== false) $progreso = 100;
?>

<!DOCTYPE html>
<html lang="es">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Estado de Orden #<?php echo $orden['id_orden']; ?></title>
  <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600&display=swap" rel="stylesheet">

  <style>
    body {
      font-family: 'Poppins', sans-serif;
      background: #f4f7f6;
      margin: 0;
      padding: 0;
      color: #333;
    }

    .header {
      background: #007bff;
      color: white;
      padding: 20px;
      text-align: center;
      border-radius: 0 0 20px 20px;
    }

    .container {
      max-width: 600px;
      margin: -30px auto 20px;
      padding: 0 15px;
    }

    .card {
      background: white;
      border-radius: 15px;
      box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
      padding: 20px;
      margin-bottom: 20px;
    }

    /* Línea de Tiempo Visual */
    .status-bar {
      display: flex;
      justify-content: space-between;
      margin-bottom: 20px;
      position: relative;
    }

    .status-bar::before {
      content: '';
      position: absolute;
      top: 15px;
      left: 0;
      right: 0;
      height: 4px;
      background: #eee;
      z-index: 0;
    }

    .status-step {
      position: relative;
      z-index: 1;
      text-align: center;
      background: white;
      padding: 0 5px;
    }

    .circle {
      width: 30px;
      height: 30px;
      background: #eee;
      border-radius: 50%;
      margin: 0 auto 5px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #999;
      font-weight: bold;
      transition: all 0.3s;
    }

    .step-text {
      font-size: 12px;
      color: #999;
    }

    /* Estados Activos */
    .active .circle {
      background: #007bff;
      color: white;
      transform: scale(1.1);
      box-shadow: 0 0 10px rgba(0, 123, 255, 0.4);
    }

    .active .step-text {
      color: #007bff;
      font-weight: bold;
    }

    .completed .circle {
      background: #28a745;
      color: white;
    }

    .info-row {
      display: flex;
      justify-content: space-between;
      border-bottom: 1px solid #eee;
      padding: 10px 0;
    }

    .info-row:last-child {
      border-bottom: none;
    }

    .label {
      color: #666;
      font-size: 14px;
    }

    .value {
      font-weight: 600;
      text-align: right;
    }

    /* Galería */
    .gallery {
      display: flex;
      gap: 10px;
      overflow-x: auto;
      padding-bottom: 10px;
    }

    .gallery img {
      width: 80px;
      height: 80px;
      object-fit: cover;
      border-radius: 8px;
      border: 1px solid #ddd;
      cursor: pointer;
    }

    .badge {
      padding: 5px 10px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: bold;
      text-transform: uppercase;
    }

    .bg-pending {
      background: #ffc107;
      color: #333;
    }

    .bg-success {
      background: #28a745;
      color: white;
    }

    .footer {
      text-align: center;
      font-size: 12px;
      color: #aaa;
      margin-top: 30px;
    }
  </style>
</head>

<body>

  <div class="header">
    <h2><i class="fa-solid fa-wrench"></i> Tu Taller</h2>
    <p>Seguimiento de Reparación</p>
  </div>

  <div class="container">
    <div class="card">
      <h3 style="margin-top:0;">Orden #<?php echo $orden['id_orden']; ?></h3>
      <p style="color:#666;"><?php echo $orden['nombre_equipo'] . " " . $orden['modelo']; ?></p>

      <div class="status-bar">
        <div class="status-step completed">
          <div class="circle"><i class="fa-solid fa-check"></i></div>
          <div class="step-text">Recibido</div>
        </div>
        <div class="status-step <?php echo ($progreso >= 50) ? 'active' : ''; ?>">
          <div class="circle"><i class="fa-solid fa-microchip"></i></div>
          <div class="step-text">Reparando</div>
        </div>
        <div class="status-step <?php echo ($progreso >= 100) ? 'active' : ''; ?>">
          <div class="circle"><i class="fa-solid fa-box-open"></i></div>
          <div class="step-text">Listo</div>
        </div>
      </div>

      <div style="text-align: center; margin: 20px 0;">
        <span class="badge <?php echo ($progreso == 100) ? 'bg-success' : 'bg-pending'; ?>">
          Estado: <?php echo $orden['estado_servicio']; ?>
        </span>
      </div>
    </div>

    <div class="card">
      <h4>Detalles del Servicio</h4>
      <div class="info-row">
        <span class="label">Fecha Ingreso:</span>
        <span class="value"><?php echo date('d/m/Y', strtotime($orden['creado_servicio'])); ?></span>
      </div>
      <div class="info-row">
        <span class="label">Falla Reportada:</span>
        <span class="value"><?php echo $orden['falla']; ?></span>
      </div>
      <div class="info-row">
        <span class="label">Diagnóstico:</span>
        <span class="value"><?php echo $orden['diagnostico'] ?: 'En revisión...'; ?></span>
      </div>
      <div class="info-row">
        <span class="label">Fecha Estimada:</span>
        <span class="value"><?php echo date('d/m/Y h:i A', strtotime($orden['fecha_entrega_estimada'])); ?></span>
      </div>
    </div>

    <?php if (count($imagenes) > 0): ?>
      <div class="card">
        <h4>Evidencia / Fotos</h4>
        <div class="gallery">
          <?php foreach ($imagenes as $img): ?>
            <img src="<?php echo $img['ruta_imagen']; ?>" onclick="window.open(this.src, '_blank')">
          <?php endforeach; ?>
        </div>
      </div>
    <?php endif; ?>

    <div class="card">
      <h4>Resumen Financiero</h4>
      <div class="info-row">
        <span class="label">Costo Total:</span>
        <span class="value">$<?php echo number_format($orden['costo_servicio'], 2); ?></span>
      </div>
      <div class="info-row">
        <span class="label">Anticipo:</span>
        <span class="value" style="color: green;">-$<?php echo number_format($orden['anticipo_servicio'], 2); ?></span>
      </div>
      <div class="info-row" style="border-top: 2px solid #eee; margin-top: 10px; padding-top: 10px;">
        <span class="label" style="font-weight: bold; color: #333;">Saldo Pendiente:</span>
        <span class="value" style="color: <?php echo ($orden['saldo_servicio'] > 0) ? '#d33' : 'green'; ?>; font-size: 18px;">
          $<?php echo number_format($orden['saldo_servicio'], 2); ?>
        </span>
      </div>
    </div>

    <div class="footer">
      <p>Gracias por confiar en nosotros.</p>
    </div>
  </div>

</body>

</html>