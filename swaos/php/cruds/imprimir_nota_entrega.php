<?php
session_start();
require '../conexion.php';

//  Verificar sesión
if (!isset($_SESSION['usuario'])) {
  die(" Acceso denegado. Debes iniciar sesión.");
}

if (!isset($_GET['id']) || empty($_GET['id'])) {
  die("Error: No se proporcionó el folio de la orden.");
}

$id_orden = filter_var($_GET['id'], FILTER_SANITIZE_NUMBER_INT);
$nombre_taller = $_SESSION['nombre_t'] ?? 'Taller de Soporte';

try {
  // Traer todos los datos de la orden, cliente y equipo
  $sql = "SELECT o.*, c.nombre_cliente, c.tel_cliente, e.nombre_equipo, m.nom_marca 
            FROM ordenesservicio o
            LEFT JOIN clientes c ON o.id_cliente = c.id_cliente
            LEFT JOIN equipos e ON o.id_equipo = e.id_equipo
            LEFT JOIN marcas m ON o.id_marca = m.id_marca
            WHERE o.id_orden = ?";
  $stmt = $dbh->prepare($sql);
  $stmt->execute([$id_orden]);
  $orden = $stmt->fetch(PDO::FETCH_ASSOC);

  if (!$orden) die("Orden no encontrada.");

  // Traer el total de piezas/refacciones para desglosarlas en el costo
  $sqlRef = "SELECT SUM(subtotal) as total_refacciones FROM orden_refacciones WHERE id_orden = ?";
  $stmtRef = $dbh->prepare($sqlRef);
  $stmtRef->execute([$id_orden]);
  $refacciones = $stmtRef->fetch(PDO::FETCH_ASSOC);
  $total_refacciones = $refacciones['total_refacciones'] ? floatval($refacciones['total_refacciones']) : 0;

  // Matemáticas financieras del ticket
  $costo_total = floatval($orden['costo_servicio']);
  $mano_obra = $costo_total - $total_refacciones;
  $anticipo = floatval($orden['anticipo_servicio']);
  $saldo = floatval($orden['saldo_servicio']);
} catch (Exception $e) {
  die("Error: " . $e->getMessage());
}
?>
<!DOCTYPE html>
<html lang="es">

<head>
  <meta charset="UTF-8">
  <title>Nota de Entrega #<?= $id_orden ?></title>
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
      <h1 class="titulo"><?= htmlspecialchars($nombre_taller) ?></h1>
      <div style="font-weight: bold; font-size: 12px; margin-top: 5px;">NOTA DE ENTREGA</div>
      <div style="font-size: 10px;">Folio: #<?= $id_orden ?></div>
      <div style="font-size: 10px;">Fecha: <?= date('d/m/Y H:i') ?></div>
    </div>

    <div class="divisor"></div>

    <div style="font-weight: bold; margin-bottom: 3px;">CLIENTE:</div>
    <div style="font-size: 10px; margin-bottom: 5px;"><?= htmlspecialchars($orden['nombre_cliente']) ?></div>

    <div style="font-weight: bold; margin-bottom: 3px;">EQUIPO:</div>
    <div style="font-size: 10px;"><?= htmlspecialchars($orden['nombre_equipo'] . ' ' . $orden['nom_marca']) ?></div>
    <div style="font-size: 10px;">Mod: <?= htmlspecialchars($orden['modelo']) ?></div>
    <div style="font-size: 10px; margin-bottom: 5px;">S/N: <?= htmlspecialchars($orden['numero_serie']) ?></div>

    <div class="divisor"></div>

    <div style="font-weight: bold; margin-bottom: 3px;">TRABAJO REALIZADO:</div>
    <div style="font-size: 10px; text-align: justify; margin-bottom: 5px;">
      <?= htmlspecialchars($orden['diagnostico'] ?: 'Mantenimiento/Reparación completada.') ?>
    </div>

    <div class="divisor"></div>

    <div class="centrado" style="font-weight: bold; margin-bottom: 5px;">DESGLOSE DEL SERVICIO</div>

    <div class="fila"><span>Mano de Obra:</span> <span>$<?= number_format($mano_obra, 2) ?></span></div>
    <?php if ($total_refacciones > 0): ?>
      <div class="fila"><span>Refacciones:</span> <span>$<?= number_format($total_refacciones, 2) ?></span></div>
    <?php endif; ?>

    <div class="divisor" style="margin: 2px 0;"></div>
    <div class="fila resaltado"><span>COSTO TOTAL:</span> <span>$<?= number_format($costo_total, 2) ?></span></div>

    <div class="fila" style="color: #555;"><span>Pagado/Abonos:</span> <span>-$<?= number_format($anticipo, 2) ?></span></div>

    <div class="divisor" style="margin: 2px 0;"></div>

    <?php if ($saldo > 0): ?>
      <div class="fila resaltado" style="color: red;"><span>SALDO PENDIENTE:</span> <span>$<?= number_format($saldo, 2) ?></span></div>
    <?php else: ?>
      <div class="fila resaltado" style="text-align: center; justify-content: center; margin-top: 5px;">
        LIQUIDADO ($0.00)
      </div>
    <?php endif; ?>

    <div class="divisor"></div>
    <br><br>

    <div class="centrado" style="border-top: 1px solid #000; width: 80%; margin: 0 auto; font-size: 10px; padding-top: 3px;">
      Firma de Conformidad
    </div>

    <div class="centrado" style="font-size: 9px; margin-top: 15px; color: #555; text-align: justify;">
      * El cliente acepta recibir su equipo funcionando acorde al diagnóstico.
      Equipos abandonados por más de 30 días generarán costo de almacenaje.
    </div>

    <div class="centrado" style="font-size: 10px; margin-top: 10px; font-weight: bold;">
      ¡GRACIAS POR SU PREFERENCIA!
    </div>
  </div>

  <script>
    window.onload = function() {
       window.print(); // Descomenta en producción para impresión automática
    }
  </script>

</body>

</html>