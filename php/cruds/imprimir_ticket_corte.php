<?php
session_start();
require '../conexion.php';

if (!isset($_GET['id'])) die("Error: No se proporcionó el folio del corte.");

$id_corte = filter_var($_GET['id'], FILTER_SANITIZE_NUMBER_INT);

try {
  $stmt = $dbh->prepare("SELECT * FROM cortes_caja WHERE id_corte = ?");
  $stmt->execute([$id_corte]);
  $corte = $stmt->fetch(PDO::FETCH_ASSOC);

  if (!$corte) die("Corte no encontrado.");

  // Separamos el Efectivo de Ventas del Efectivo inyectado (Fondo de Caja)
  $stmtEfectivo = $dbh->prepare("
      SELECT 
          SUM(CASE WHEN tipo_movimiento LIKE '%Ingreso%' THEN total ELSE 0 END) as fondo_caja,
          SUM(CASE WHEN tipo_movimiento NOT LIKE '%Ingreso%' AND tipo_movimiento NOT LIKE 'Retiro:%' THEN total ELSE 0 END) as ventas_efectivo
      FROM ventas 
      WHERE id_corte = ? AND LOWER(metodo_pago) IN ('efectivo', '1', '')
  ");
  $stmtEfectivo->execute([$id_corte]);
  $desgloseEfectivo = $stmtEfectivo->fetch(PDO::FETCH_ASSOC);

  $efectivo_ventas = $desgloseEfectivo['ventas_efectivo'] ? floatval($desgloseEfectivo['ventas_efectivo']) : 0;
  $efectivo_fondo = $desgloseEfectivo['fondo_caja'] ? floatval($desgloseEfectivo['fondo_caja']) : 0;

  // Cálculo Total Ingresos SÓLO de lo que suma a la caja
  $totalIngresos = $efectivo_ventas + $efectivo_fondo + $corte['total_tarjeta'] + $corte['total_transferencia'];

  //  DESGLOSE POR ORIGEN CON CANDADO
  $stmtDesglose = $dbh->prepare("
        SELECT tipo_movimiento, SUM(total) as suma 
        FROM ventas 
        WHERE id_corte = ? 
        AND tipo_movimiento NOT LIKE 'Retiro:%' 
        GROUP BY tipo_movimiento
    ");
  $stmtDesglose->execute([$id_corte]);
  $desgloseOrigen = $stmtDesglose->fetchAll(PDO::FETCH_ASSOC);
} catch (Exception $e) {
  die("Error: " . $e->getMessage());
}
?>
<!DOCTYPE html>
<html lang="es">

<head>
  <meta charset="UTF-8">
  <title>Corte Z #<?= $id_corte ?></title>
  <style>
    body {
      font-family: 'Courier New', Courier, monospace;
      font-size: 11px;
      margin: 0;
      padding: 0;
      background-color: #f0f0f0;
    }

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

    .titulo {
      font-size: 14px;
      font-weight: bold;
      margin: 5px 0;
    }

    .fila {
      display: flex;
      justify-content: space-between;
      margin-bottom: 3px;
    }

    .divisor {
      border-top: 1px dashed #000;
      margin: 5px 0;
      padding-top: 5px;
    }

    .resaltado {
      font-weight: bold;
      font-size: 12px;
    }

    .cuadre-caja {
      background: #f9f9f9;
      padding: 3px;
      border: 1px solid #ddd;
      margin-top: 5px;
    }

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
      <h1 class="titulo">CORTE DE CAJA (Z)</h1>
      <div style="font-size: 10px;">Folio: #<?= $id_corte ?></div>
      <div style="font-size: 10px; margin-bottom: 5px;">Fecha: <?= date('d/m/Y H:i', strtotime($corte['fecha_corte'])) ?></div>
    </div>

    <div class="divisor"></div>
    <div class="centrado" style="font-weight: bold; margin-bottom: 5px;">INGRESOS DEL TURNO</div>

    <div class="fila"><span>Efectivo (Ventas):</span> <span>$<?= number_format($efectivo_ventas, 2) ?></span></div>
    <div class="fila"><span>Fondo de Caja:</span> <span>$<?= number_format($efectivo_fondo, 2) ?></span></div>
    <div class="fila"><span>Tarjetas (TDD/TDC):</span> <span>$<?= number_format($corte['total_tarjeta'], 2) ?></span></div>
    <div class="fila"><span>Transferencias:</span> <span>$<?= number_format($corte['total_transferencia'], 2) ?></span></div>

    <div class="divisor"></div>
    <div class="fila resaltado"><span>TOTAL INGRESOS:</span> <span>$<?= number_format($totalIngresos, 2) ?></span></div>

    <div class="divisor"></div>
    <div class="centrado" style="font-weight: bold; margin-bottom: 5px;">DESGLOSE POR ORIGEN</div>

    <?php foreach ($desgloseOrigen as $origen): ?>
      <div class="fila" style="font-size: 10px;">
        <span>(+) <?= strtoupper(htmlspecialchars($origen['tipo_movimiento'])) ?>:</span>
        <span>$<?= number_format($origen['suma'], 2) ?></span>
      </div>
    <?php endforeach; ?>

    <div class="divisor"></div>
    <div class="centrado" style="font-weight: bold; margin-bottom: 5px;">MOVIMIENTOS DE CAJA</div>

    <div class="fila" style="color: #666;"><span>(-) Retiros/Gastos:</span> <span>$<?= number_format($corte['total_retiros'], 2) ?></span></div>

    <div class="fila resaltado"><span>EFECTIVO ESPERADO:</span> <span>$<?= number_format($corte['efectivo_esperado'], 2) ?></span></div>

    <div class="cuadre-caja">
      <div class="fila"><span>Efectivo Físico:</span> <span>$<?= number_format($corte['efectivo_fisico'], 2) ?></span></div>
      <div class="divisor" style="margin: 2px 0;"></div>
      <?php if ($corte['diferencia'] == 0): ?>
        <div class="centrado" style="font-weight: bold;">CUADRE PERFECTO ($0.00)</div>
      <?php elseif ($corte['diferencia'] < 0): ?>
        <div class="fila" style="font-weight: bold;"><span>FALTANTE:</span> <span>$<?= number_format(abs($corte['diferencia']), 2) ?></span></div>
      <?php else: ?>
        <div class="fila" style="font-weight: bold;"><span>SOBRANTE:</span> <span>$<?= number_format($corte['diferencia'], 2) ?></span></div>
      <?php endif; ?>
    </div>

    <div class="divisor"></div>
    <br><br>
    <div class="centrado" style="border-top: 1px solid #000; width: 80%; margin: 0 auto; font-size: 10px; padding-top: 3px;">
      Firma del Cajero
    </div>
    <div class="centrado" style="font-size: 9px; margin-top: 10px;">
      *** Fin del Reporte Z ***
    </div>
  </div>

  <script>
    window.onload = function() {
      // window.print(); // Descomenta esta línea en producción para que imprima automático
    }
  </script>

</body>

</html>