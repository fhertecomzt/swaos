<?php
session_start();
require '../conexion.php';

$id_cotizacion = $_GET['id'] ?? 0;
$token_recibido = $_GET['token'] ?? '';

// llave secreta que solo tu servidor conoce
$llave_secreta = "SWAOS_S3CR3T_2026_!#";

// Generamos matemáticamente la firma exacta que debería tener este folio
$token_correcto = hash('sha256', $id_cotizacion . $llave_secreta);

// Si NO es un empleado logueado en el sistema, le exigimos la firma
if (!isset($_SESSION['id_usuario']) && !isset($_SESSION['idusuario'])) {
  if ($token_recibido !== $token_correcto) {
    die("<h2 style='color:red; text-align:center; font-family: Arial; margin-top:50px;'> Acceso Denegado: El enlace es inválido, ha sido alterado o está incompleto.</h2>");
  }
}

if (!$id_cotizacion) {
  die("Error: No se especificó el folio de la cotización.");
}

try {
  // Buscamos los datos principales de la cotización, del cliente Y DEL TALLER
  $stmtCot = $dbh->prepare("
        SELECT c.*, cl.nombre_cliente, cl.papellido_cliente, cl.sapellido_cliente, cl.tel_cliente,
               t.nombre_t, razonsocial_t, t.tel_t, t.email_t 
        FROM cotizaciones c
        LEFT JOIN clientes cl ON c.id_cliente = cl.id_cliente
        LEFT JOIN talleres t ON c.id_taller = t.id_taller
        WHERE c.id_cotizacion = ?
    ");
  $stmtCot->execute([$id_cotizacion]);
  $cotizacion = $stmtCot->fetch(PDO::FETCH_ASSOC);

  if (!$cotizacion) {
    die("Error: La cotización no existe.");
  }

  // OBTENEMOS LA TASA DE IVA DINÁMICA DESDE TU TABLA
  $tasaIva = 16.00;
  $stmtIva = $dbh->query("SELECT tasa FROM impuestos WHERE idimpuesto = 1 AND estatus = 0");
  if ($row = $stmtIva->fetch(PDO::FETCH_ASSOC)) {
    $tasaIva = floatval($row['tasa']);
  }
  $factorIva = 1 + ($tasaIva / 100);

  // Buscamos el detalle de los artículos/servicios
  $stmtDetalle = $dbh->prepare("SELECT * FROM detalle_cotizaciones WHERE id_cotizacion = ?");
  $stmtDetalle->execute([$id_cotizacion]);
  $detalles = $stmtDetalle->fetchAll(PDO::FETCH_ASSOC);

  // Armamos el nombre completo del cliente
  $nombreCliente = "Público en General";
  if ($cotizacion['id_cliente'] != 0) {
    $nombreCliente = trim($cotizacion['nombre_cliente'] . ' ' . $cotizacion['papellido_cliente'] . ' ' . $cotizacion['sapellido_cliente']);
  }
} catch (Exception $e) {
  die("Error de Base de Datos: " . $e->getMessage());
}
?>
<!DOCTYPE html>
<html lang="es">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Cotización #<?php echo $id_cotizacion; ?></title>
  <style>
    /* Diseño elegante para pantalla */
    body {
      font-family: 'Arial', sans-serif;
      background-color: #f4f6f9;
      color: #333;
      margin: 0;
      padding: 20px;
    }

    .hoja {
      background: #fff;
      max-width: 800px;
      margin: 0 auto;
      padding: 40px;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
      border-top: 5px solid #007bff;
      /* Color institucional SWAOS */
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 2px solid #eee;
      padding-bottom: 20px;
      margin-bottom: 20px;
    }

    .empresa-info h1 {
      margin: 0;
      color: #007bff;
      font-size: 28px;
    }

    .empresa-info p {
      margin: 5px 0;
      color: #555;
      font-size: 14px;
    }

    .folio-info {
      text-align: right;
    }

    .folio-info h2 {
      margin: 0;
      color: #dc3545;
      font-size: 24px;
    }

    .folio-info p {
      margin: 5px 0;
      font-size: 14px;
      font-weight: bold;
    }

    .cliente-info {
      background: #f8f9fa;
      padding: 15px;
      border-radius: 5px;
      margin-bottom: 30px;
    }

    .cliente-info p {
      margin: 5px 0;
      font-size: 14px;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 30px;
    }

    th {
      background-color: #007bff;
      color: white;
      padding: 10px;
      text-align: left;
    }

    td {
      padding: 10px;
      border-bottom: 1px solid #ddd;
    }

    .text-right {
      text-align: right;
    }

    .text-center {
      text-align: center;
    }

    .totales {
      width: 300px;
      margin-left: auto;
      background: #f8f9fa;
      padding: 15px;
      border-radius: 5px;
    }

    .totales h3 {
      margin: 0;
      font-size: 22px;
      color: #28a745;
      text-align: right;
    }

    .terminos {
      margin-top: 40px;
      font-size: 11px;
      color: #777;
      text-align: center;
      border-top: 1px solid #eee;
      padding-top: 15px;
    }

    /* MAGIA: Esto solo se activa al mandar a Imprimir o Guardar como PDF */
    @media print {
      body {
        background: white;
        padding: 0;
      }

      .hoja {
        box-shadow: none;
        border-top: none;
        padding: 0;
      }

      /* Ocultamos botones que no deben salir en el papel */
      .no-print {
        display: none !important;
      }
    }
  </style>
</head>

<body>

  <div class="no-print" style="text-align: center; margin-bottom: 20px;">
    <button onclick="window.print()" style="background: #28a745; color: white; border: none; padding: 10px 20px; font-size: 16px; border-radius: 5px; cursor: pointer; font-weight: bold;">
      Imprimir / Guardar como PDF
    </button>
  </div>

  <div class="hoja">
    <div class="header">
      <div class="empresa-info">
        <h1><?php echo htmlspecialchars($cotizacion['nombre_t'] ?? 'Sistema SWAOS'); ?></h1>
        <p><?php if (!empty($cotizacion['razonsocial_t'])): ?>
            <?php echo htmlspecialchars($cotizacion['razonsocial_t']); ?>
          <?php endif; ?></p>
        <p>
          <?php if (!empty($cotizacion['tel_t'])): ?>
            Tel: <?php echo htmlspecialchars($cotizacion['tel_t']); ?> |
          <?php endif; ?>
          <?php if (!empty($cotizacion['email_t'])): ?>
            Email: <?php echo htmlspecialchars($cotizacion['email_t']); ?>
          <?php endif; ?>
        </p>
      </div>
      <div class="folio-info">
        <h2>COTIZACIÓN</h2>
        <p>Folio: #<?php echo str_pad($id_cotizacion, 6, "0", STR_PAD_LEFT); ?></p>
        <p>Fecha: <?php echo date('d/m/Y', strtotime($cotizacion['fecha_creacion'])); ?></p>
      </div>
    </div>

    <div class="cliente-info">
      <strong>Atención a:</strong>
      <p> <?php echo $nombreCliente; ?></p>
      <?php if (!empty($cotizacion['tel_cliente'])): ?>
        <p> WhatsApp: <?php echo $cotizacion['tel_cliente']; ?></p>
      <?php endif; ?>
    </div>

    <table>
      <thead>
        <tr>
          <th>Concepto</th>
          <th class="text-center">Cant.</th>
          <th class="text-right">Precio Unitario</th>
          <th class="text-right">Subtotal</th>
        </tr>
      </thead>

      <tbody>
        <?php foreach ($detalles as $item):
          // Limpiamos el IVA para mostrar en la lista de artículos
          $precioNeto = $item['precio_unitario'] / $factorIva;
          $subtotalNeto = $item['subtotal'] / $factorIva;
        ?>
          <tr>
            <td><?php echo htmlspecialchars($item['concepto']); ?></td>
            <td class="text-center"><?php echo $item['cantidad']; ?></td>
            <td class="text-right">$<?php echo number_format($precioNeto, 2); ?></td>
            <td class="text-right"><strong>$<?php echo number_format($subtotalNeto, 2); ?></strong></td>
          </tr>
        <?php endforeach; ?>
      </tbody>
    </table>

    <div class="totales">
      <?php
      // Calculamos los totales limpios
      $subtotalBase = $cotizacion['total'] / $factorIva;
      $ivaCalculado = $cotizacion['total'] - $subtotalBase;
      ?>
      <p class="text-right" style="margin:0 0 5px 0;">Subtotal Base: $<?php echo number_format($subtotalBase, 2); ?></p>
      <p class="text-right" style="margin:0 0 10px 0;">IVA (<?php echo $tasaIva; ?>%): $<?php echo number_format($ivaCalculado, 2); ?></p>
      <h3>TOTAL: $<?php echo number_format($cotizacion['total'], 2); ?></h3>
    </div>

    <div class="terminos">
      <strong> NOTA IMPORTANTE:</strong><br>
      Este documento es un presupuesto y no representa un comprobante fiscal ni de pago.<br>
      Los precios aquí estipulados tienen una <strong>vigencia máxima de <?php echo $cotizacion['vigencia_dias']; ?> días</strong> a partir de su fecha de emisión.<br>
      Precios sujetos a cambio sin previo aviso por fluctuaciones de mercado o disponibilidad de inventario.
    </div>
  </div>

  <script>
    window.onload = function() {
      // Descomenta la siguiente línea si quieres que la ventana de impresión se abra sola al instante
      // window.print();
    };
  </script>
</body>

</html>