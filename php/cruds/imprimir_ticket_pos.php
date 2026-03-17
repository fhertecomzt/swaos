<?php
session_start();
require '../conexion.php';

if (!isset($_GET['id'])) {
  die("Error: No se proporcionó el folio de la venta.");
}

$id_venta = filter_var($_GET['id'], FILTER_SANITIZE_NUMBER_INT);
$id_taller = $_SESSION['taller_id'] ?? 1; // Tomamos el taller activo de la sesión

try {
  // Traemos la información del Taller Activo 
  // Usamos id_taller como llave principal
  $stmtTaller = $dbh->prepare("SELECT nombre_t, rfc_t, calle_t, numext_t, numint_t, id_cp_t, tel_t FROM talleres WHERE id_taller = ?");
  $stmtTaller->execute([$id_taller]);
  $taller = $stmtTaller->fetch(PDO::FETCH_ASSOC);

  // Verificamos si trajo datos
  if ($taller) {
    $nombre_taller = $taller['nombre_t'];
    $rfc_taller = $taller['rfc_t'];
    $telefono_taller = $taller['tel_t'];

    // ARMAMOS LA DIRECCIÓN
    $calle = $taller['calle_t'];
    $numExt = $taller['numext_t'];
    // Solo mostramos el número interior si existe y no es "0"
    $numInt = (!empty($taller['numint_t']) && $taller['numint_t'] !== '0') ? ' Int. ' . $taller['numint_t'] : '';
    $cp = $taller['id_cp_t'];

    // Concatenamos todo en un solo texto limpio
    $direccion_taller = "$calle #$numExt$numInt C.P. $cp";
  } else {
    // Datos de rescate por si el id_taller no existe
    $nombre_taller = 'MI TALLER';
    $rfc_taller = 'XAXX010101000';
    $direccion_taller = 'Dirección no configurada';
    $telefono_taller = '0000000000';
  }

  // Traemos la Venta y el Cliente
  $sqlVenta = "SELECT v.*, c.nombre_cliente AS nombre_cliente, c.rfc_cliente AS rfc_cliente 
                 FROM ventas v 
                 LEFT JOIN clientes c ON v.id_cliente = c.id_cliente 
                 WHERE v.id_venta = ?";
  $stmtVenta = $dbh->prepare($sqlVenta);
  $stmtVenta->execute([$id_venta]);
  $venta = $stmtVenta->fetch(PDO::FETCH_ASSOC);

  if (!$venta) {
    die("Venta no encontrada.");
  }

  $nombreImprimir = $venta['nombre_cliente'] ? $venta['nombre_cliente'] : 'Público en General';
  $rfcImprimir = $venta['rfc_cliente'] ? $venta['rfc_cliente'] : 'XAXX010101000';

  // Traemos el Detalle y contamos los artículos
  $stmtDetalle = $dbh->prepare("SELECT concepto, cantidad, precio_unitario, subtotal FROM detalle_ventas WHERE id_venta = ?");
  $stmtDetalle->execute([$id_venta]);
  $detalles = $stmtDetalle->fetchAll(PDO::FETCH_ASSOC);

  $totalArticulos = 0;
  foreach ($detalles as $item) {
    $totalArticulos += $item['cantidad'];
  }

  // OBTENEMOS LA TASA DE IVA DINÁMICA DESDE TU TABLA
  $tasaIva = 16.00;
  $stmtIva = $dbh->query("SELECT tasa FROM impuestos WHERE idimpuesto = 1 AND estatus = 0");
  if ($row = $stmtIva->fetch(PDO::FETCH_ASSOC)) {
    $tasaIva = floatval($row['tasa']);
  }
  $factorIva = 1 + ($tasaIva / 100);

  // Matemáticas Fiscales Dinámicas
  $total = $venta['total'];
  $subtotal = $total / $factorIva;
  $iva = $total - $subtotal;

  // Función de Números a Letras
  function numeroALetras($numero)
  {
    $formatter = new NumberFormatter("es", NumberFormatter::SPELLOUT);
    $entero = floor($numero);
    $decimales = round(($numero - $entero) * 100);
    $letras = strtoupper($formatter->format($entero));
    $centavos = str_pad($decimales, 2, "0", STR_PAD_LEFT);
    return $letras . " PESOS " . $centavos . "/100 M.N.";
  }

  $totalConLetra = numeroALetras($total);
} catch (Exception $e) {
  die("Error de BD: " . $e->getMessage());
}
?>
<!DOCTYPE html>
<html lang="es">

<head>
  <meta charset="UTF-8">
  <title>Ticket POS #<?= $id_venta ?></title>
  <style>
    /* Diseño Especial para Impresora Térmica 58mm */
    body {
      font-family: 'Courier New', Courier, monospace;
      font-size: 11px;
      margin: 0;
      padding: 0;
      background-color: #f0f0f0;
    }

    /* El ancho exacto es 58mm, reducimos el padding para aprovechar el papel */
    .ticket {
      width: 58mm;
      max-width: 58mm;
      padding: 2mm;
      margin: 10px auto;
      background-color: #fff;
      box-shadow: 0 0 5px rgba(0, 0, 0, 0.2);
    }

    .centrado {
      text-align: center;
      align-content: center;
    }

    .logo {
      max-width: 60%;
      margin-bottom: 5px;
    }

    /* Textos un poco más pequeños para que quepan bien */
    .titulo {
      font-size: 14px;
      font-weight: bold;
      margin: 5px 0;
    }

    .datos-taller {
      font-size: 10px;
      margin-bottom: 8px;
      line-height: 1.2;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 5px;
      font-size: 10px;
    }

    th {
      border-bottom: 1px dashed #000;
      padding-bottom: 3px;
      text-align: left;
    }

    td {
      padding: 2px 0;
      vertical-align: top;
    }

    /* Ajustamos los porcentajes de la tabla para 58mm */
    .td-cant {
      text-align: center;
      width: 12%;
    }

    .td-producto {
      width: 58%;
      padding-right: 2px;
    }

    .td-precio {
      text-align: right;
      width: 30%;
    }

    .totales-container {
      margin-top: 8px;
      border-top: 1px dashed #000;
      padding-top: 5px;
    }

    .fila-total {
      display: flex;
      justify-content: space-between;
      font-size: 11px;
      margin-bottom: 2px;
    }

    .gran-total {
      font-weight: bold;
      font-size: 13px;
      margin-top: 3px;
    }

    /* Letras más pequeñas para que el texto de los pesos no ocupe 5 renglones */
    .letras {
      font-size: 9px;
      margin-top: 8px;
      text-align: center;
      border-bottom: 1px dashed #000;
      padding-bottom: 8px;
      line-height: 1.2;
    }

    .footer {
      text-align: center;
      font-size: 9px;
      margin-top: 8px;
    }

    /* Ocultar sombras y márgenes al imprimir de verdad */
    @media print {
      body {
        background-color: #fff;
      }

      .ticket {
        margin: 0;
        box-shadow: none;
        width: 100%;
        padding: 0;
      }
    }
  </style>

</head>

<body>

  <div class="ticket">
    <div class="centrado">
      <h1 class="titulo"><?= strtoupper($nombre_taller) ?></h1>
      <div class="datos-taller">
        RFC: <?= strtoupper($rfc_taller) ?><br>
        <?= $direccion_taller ?><br>
        Tel: <?= $telefono_taller ?>
      </div>

      <div style="border-top: 1px solid #000; border-bottom: 1px solid #000; padding: 3px 0; margin-bottom: 5px;">
        <strong>TICKET DE VENTA: #<?= $id_venta ?></strong><br>
        Fecha: <?= date('d/m/Y H:i', strtotime($venta['fecha_venta'])) ?>
      </div>

      <div style="text-align: left; margin-bottom: 10px; font-size: 10px; border-bottom: 1px dashed #000; padding-bottom: 5px;">
        <strong>Cliente:</strong> <?= strtoupper($nombreImprimir) ?><br>
        <strong>RFC:</strong> <?= strtoupper($rfcImprimir) ?>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th class="td-cant">Cant</th>
          <th class="td-producto">Descripción</th>
          <th class="td-precio">Importe</th>
        </tr>
      </thead>

      <tbody>
        <?php foreach ($detalles as $item):
          // Limpiamos el precio del artículo para que el ticket cuadre visualmente
          $subtotalItemNeto = $item['subtotal'] / $factorIva;
        ?>
          <tr>
            <td class="td-cant"><?= $item['cantidad'] ?></td>
            <td class="td-producto"><?= $item['concepto'] ?></td>
            <td class="td-precio">$<?= number_format($subtotalItemNeto, 2) ?></td>
          </tr>
        <?php endforeach; ?>
      </tbody>
    </table>

    <div class="totales-container">
      <div class="fila-total">
        <span>SUBTOTAL:</span>
        <span>$<?= number_format($subtotal, 2) ?></span>
      </div>
      <div class="fila-total">
        <span>IVA (<?= $tasaIva ?>%):</span>
        <span>$<?= number_format($iva, 2) ?></span>
      </div>
      <div class="fila-total gran-total">
        <span>TOTAL:</span>
        <span>$<?= number_format($total, 2) ?></span>
      </div>
    </div>

    <div style="text-align: right; font-size: 10px; margin-top: 5px; border-bottom: 1px dashed #000; padding-bottom: 5px;">
      <strong>Total de artículos: <?= $totalArticulos ?></strong>
    </div>

    <div class="letras">
      *** <?= $totalConLetra ?> ***<br>
      Pago en: <?= $venta['metodo_pago'] ?>
    </div>

    <?php if ($venta['metodo_pago'] === 'Efectivo' && $venta['pago_cliente'] > 0): ?>
      <div style="font-size: 11px; text-align: right; margin-top: 8px; border-bottom: 1px dashed #000; padding-bottom: 5px;">
        Su Pago: <strong>$<?= number_format($venta['pago_cliente'], 2) ?></strong><br>
        Su Cambio: <strong>$<?= number_format($venta['cambio_cliente'], 2) ?></strong>
      </div>
    <?php endif; ?>

    <div class="footer">
      ¡Gracias por su preferencia!<br>
      Conserve este ticket para cualquier aclaración o garantía.
    </div>
  </div>

  <script>
    // Abre el cuadro de diálogo de impresión automáticamente
    window.onload = function() {
      window.print();
    }
  </script>

</body>

</html>