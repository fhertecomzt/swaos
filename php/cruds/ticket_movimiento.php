<?php
session_start();
require '../conexion.php'; 

if (!isset($_GET['id'])) {
  die("ID de movimiento no proporcionado.");
}

$id_movimiento = intval($_GET['id']);

try {
  // 1. Obtenemos el movimiento original
  $sql = "SELECT k.*, p.nombre_prod, p.codebar_prod, u.nombre AS nombre_usuario, u.p_appellido, t.nombre_t
            FROM kardex_inventario k
            INNER JOIN productos p ON k.id_prod = p.id_prod
            INNER JOIN usuarios u ON k.id_usuario = u.id_usuario
            LEFT JOIN talleres t ON k.id_taller = t.id_taller
            WHERE k.id_movimiento = ?";
  $stmt = $dbh->prepare($sql);
  $stmt->execute([$id_movimiento]);
  $mov = $stmt->fetch(PDO::FETCH_ASSOC);

  if (!$mov) die("No se encontró el movimiento.");

  $nombre_taller = htmlspecialchars($mov['nombre_t'] ?? 'Mas Computación');
  $usuario_resp = htmlspecialchars($mov['nombre_usuario'] . ' ' . $mov['p_appellido']);
  $color_tipo = ($mov['tipo_movimiento'] === 'Entrada') ? '#28a745' : '#dc3545';
  $signo = ($mov['tipo_movimiento'] === 'Entrada') ? '+' : '-';

  // 1: ¿Es una compra múltiple con factura?
  $es_compra = (strpos($mov['motivo'], 'Compra Factura #') === 0);
  $compra_maestra = null;
  $detalles_compra = [];

  //  ¿Es un grupo de Salidas o Traspasos?
  $movimientos_grupo = [];

  if ($es_compra) {
    $folio = trim(str_replace('Compra Factura #', '', $mov['motivo']));
    $stmtCompra = $dbh->prepare("SELECT c.*, p.contacto_prov, p.rfc_prov FROM compras_maestra c INNER JOIN proveedores p ON c.id_prov = p.id_prov WHERE c.folio_factura = ? LIMIT 1");
    $stmtCompra->execute([$folio]);
    $compra_maestra = $stmtCompra->fetch(PDO::FETCH_ASSOC);

    if ($compra_maestra) {
      $stmtDetalles = $dbh->prepare("SELECT d.*, pr.nombre_prod, pr.codebar_prod FROM detalle_compras d INNER JOIN productos pr ON d.id_prod = pr.id_prod WHERE d.id_compra = ?");
      $stmtDetalles->execute([$compra_maestra['id_compra']]);
      $detalles_compra = $stmtDetalles->fetchAll(PDO::FETCH_ASSOC);
    }
  } else {
    // Si no es compra, buscamos a sus "hermanos" (mismo motivo, misma fecha exacta, mismo usuario)
    $stmtGrupo = $dbh->prepare("SELECT k.*, p.nombre_prod, p.codebar_prod
                                  FROM kardex_inventario k
                                  INNER JOIN productos p ON k.id_prod = p.id_prod
                                  WHERE k.motivo = ? AND k.fecha_movimiento = ? AND k.id_usuario = ? AND k.id_taller = ? AND k.tipo_movimiento = ?");
    $stmtGrupo->execute([$mov['motivo'], $mov['fecha_movimiento'], $mov['id_usuario'], $mov['id_taller'], $mov['tipo_movimiento']]);
    $movimientos_grupo = $stmtGrupo->fetchAll(PDO::FETCH_ASSOC);
  }
} catch (Exception $e) {
  die("Error: " . $e->getMessage());
}
?>
<!DOCTYPE html>
<html lang="es">

<head>
  <meta charset="UTF-8">
  <title>Comprobante #<?php echo $id_movimiento; ?></title>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #f4f6f9;
      margin: 0;
      padding: 20px;
    }

    .hoja-carta {
      max-width: 800px;
      margin: 0 auto;
      background: #fff;
      padding: 40px;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    }

    .btn-imprimir {
      display: block;
      width: 250px;
      margin: 0 auto 20px auto;
      background: #28a745;
      color: white;
      text-align: center;
      padding: 10px;
      border-radius: 5px;
      text-decoration: none;
      font-weight: bold;
      cursor: pointer;
      border: none;
      font-size: 16px;
    }

    .header {
      display: flex;
      justify-content: space-between;
      border-bottom: 2px solid #eee;
      padding-bottom: 20px;
      margin-bottom: 20px;
    }

    .header-izq h1 {
      color: #007bff;
      margin: 0 0 5px 0;
      font-size: 28px;
    }

    .header-der {
      text-align: right;
    }

    .box-info {
      background: #f8f9fa;
      padding: 15px;
      border-radius: 5px;
      margin-bottom: 20px;
      font-size: 14px;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
    }

    th {
      background-color: #007bff;
      color: white;
      padding: 10px;
      text-align: left;
      font-size: 14px;
    }

    td {
      padding: 10px;
      border-bottom: 1px solid #ddd;
      font-size: 14px;
    }

    .totales {
      width: 300px;
      float: right;
      background: #f8f9fa;
      padding: 15px;
      border-radius: 5px;
    }

    @media print {
      body {
        background: white;
        padding: 0;
      }

      .hoja-carta {
        box-shadow: none;
        padding: 0;
      }

      .no-print {
        display: none !important;
      }
    }
  </style>
</head>

<body>

  <button class="btn-imprimir no-print" onclick="window.print()">
    <i class="fa-solid fa-print"></i> Imprimir / PDF
  </button>

  <div class="hoja-carta">
    <div class="header">
      <div class="header-izq">
        <h1><?php echo $nombre_taller; ?></h1>
        <p>Generado por: SWAOS</p>
      </div>
      <div class="header-der">
        <h2 style="color: <?php echo $color_tipo; ?>; margin: 0;">
          <?php
          if ($es_compra) echo 'INGRESO POR COMPRA';
          else if (count($movimientos_grupo) > 1) echo strtoupper($mov['tipo_movimiento']) . ' MÚLTIPLE';
          else echo strtoupper($mov['tipo_movimiento']);
          ?>
        </h2>
        <p>Fecha: <?php echo date('d/m/Y H:i', strtotime($mov['fecha_movimiento'])); ?></p>

        <?php if ($es_compra && $compra_maestra): ?>
          <p style="color: red; font-weight: bold; font-size: 18px;">Factura: #<?php echo htmlspecialchars($compra_maestra['folio_factura']); ?></p>
        <?php else: ?>
          <p>Folio Ref: #<?php echo str_pad($mov['id_movimiento'], 6, "0", STR_PAD_LEFT); ?></p>
        <?php endif; ?>
      </div>
    </div>

    <?php if ($es_compra && $compra_maestra): ?>
      <div class="box-info" style="display: flex; justify-content: space-between;">
        <div>
          <strong>Proveedor:</strong> <?php echo htmlspecialchars($compra_maestra['contacto_prov']); ?><br>
          <strong>RFC:</strong> <?php echo htmlspecialchars($compra_maestra['rfc_prov']); ?>
        </div>
        <div style="text-align: right;">
          <strong>Recibió:</strong> <?php echo $usuario_resp; ?>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Código</th>
            <th>Producto</th>
            <th style="text-align: center;">Cant.</th>
            <th style="text-align: right;">Costo U.</th>
            <th style="text-align: right;">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          <?php foreach ($detalles_compra as $det): ?>
            <tr>
              <td><?php echo htmlspecialchars($det['codebar_prod']); ?></td>
              <td><?php echo htmlspecialchars($det['nombre_prod']); ?></td>
              <td style="text-align: center; font-weight: bold;">+<?php echo floatval($det['cantidad']); ?></td>
              <td style="text-align: right;">$<?php echo number_format($det['costo_unitario'], 2); ?></td>
              <td style="text-align: right; font-weight: bold;">$<?php echo number_format($det['subtotal'], 2); ?></td>
            </tr>
          <?php endforeach; ?>
        </tbody>
      </table>

      <div class="totales">
        <div style="display: flex; justify-content: space-between; font-size: 18px; font-weight: bold; color: #28a745;">
          <span>TOTAL PAGADO:</span>
          <span>$<?php echo number_format($compra_maestra['total_compra'], 2); ?></span>
        </div>
      </div>
      <div style="clear: both;"></div>

    <?php elseif (count($movimientos_grupo) > 1): ?>
      <div class="box-info">
        <strong>Detalles de la Operación Múltiple:</strong><br>
        Usuario Responsable: <?php echo $usuario_resp; ?><br>
        Motivo / Referencia: <b><?php echo htmlspecialchars($mov['motivo']); ?></b>
      </div>

      <table>
        <thead>
          <tr>
            <th>Código</th>
            <th>Descripción del Producto</th>
            <th style="text-align: center;">Stock Ant.</th>
            <th style="text-align: center;">Movimiento</th>
            <th style="text-align: center;">Stock Final</th>
          </tr>
        </thead>
        <tbody>
          <?php foreach ($movimientos_grupo as $mg): ?>
            <tr>
              <td><?php echo htmlspecialchars($mg['codebar_prod']); ?></td>
              <td><?php echo htmlspecialchars($mg['nombre_prod']); ?></td>
              <td style="text-align: center;"><?php echo $mg['stock_anterior']; ?></td>
              <td style="text-align: center; color: <?php echo $color_tipo; ?>; font-weight: bold;"><?php echo $signo . $mg['cantidad']; ?></td>
              <td style="text-align: center; font-weight: bold;"><?php echo $mg['stock_nuevo']; ?></td>
            </tr>
          <?php endforeach; ?>
        </tbody>
      </table>

    <?php else: ?>
      <div class="box-info">
        <strong>Detalles de la Operación:</strong><br>
        Usuario Responsable: <?php echo $usuario_resp; ?><br>
        Motivo / Referencia: <b><?php echo htmlspecialchars($mov['motivo']); ?></b>
      </div>

      <table>
        <thead>
          <tr>
            <th>Código</th>
            <th>Descripción del Producto</th>
            <th style="text-align: center;">Stock Ant.</th>
            <th style="text-align: center;">Movimiento</th>
            <th style="text-align: center;">Stock Final</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><?php echo htmlspecialchars($mov['codebar_prod']); ?></td>
            <td><?php echo htmlspecialchars($mov['nombre_prod']); ?></td>
            <td style="text-align: center;"><?php echo $mov['stock_anterior']; ?></td>
            <td style="text-align: center; color: <?php echo $color_tipo; ?>; font-weight: bold;"><?php echo $signo . $mov['cantidad']; ?></td>
            <td style="text-align: center; font-weight: bold;"><?php echo $mov['stock_nuevo']; ?></td>
          </tr>
        </tbody>
      </table>
    <?php endif; ?>

    <div style="text-align: center; font-size: 11px; color: #777; margin-top: 40px; border-top: 1px solid #eee; padding-top: 10px;">
      Este documento es un comprobante de control interno de inventarios.
    </div>
  </div>
</body>

</html>