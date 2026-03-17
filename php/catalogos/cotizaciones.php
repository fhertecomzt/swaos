<?php
if (session_status() === PHP_SESSION_NONE) {
  session_start();
}
include "../verificar_sesion.php";
require "../conexion.php";
include "../funciones/funciones.php";

// OBTENER COTIZACIONES
$cotizaciones = obtenerCotizacionesDashboard($dbh, 200);
?>

<div class="containerr">
  <button class="boton" onclick="cargarVistaCotizacion('cruds/crear_cotizacion.php')">
    <i class="fa-solid fa-plus"></i> Nueva Cotización
  </button>

  <label class="buscarlabel" for="cantidad-registros" style="margin-left: auto;">Mostrar:</label>
  <select class="buscar--box" id="cantidad-registros" style="width: auto; margin-right: 15px; padding-right: 10px;">
    <option value="8">8</option>
    <option value="25">25</option>
    <option value="50">50</option>
    <option value="-1">Todos</option>
  </select>

  <label class="buscarlabel" for="buscarboxcot">Buscar:</label>
  <input class="buscar--box" id="buscarboxcot" type="search" placeholder="Buscar por cliente, folio..." autocomplete="off">
</div>

<div class="container_dashboard_tablas">
  <h3>Cotizaciones</h3>
  <div id="scroll-container">
    <table class="tbl" id="tabla-cotizaciones" style="width:100%;">
      <thead>
        <tr>
          <th>Folio</th>
          <th>Fecha</th>
          <th>Cliente</th>
          <th>Total</th>
          <th>Estatus</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody id="cotizaciones-lista">

        <?php if (!empty($cotizaciones)): ?>
          <?php foreach ($cotizaciones as $cot):
            $folio = str_pad($cot['id_cotizacion'], 6, "0", STR_PAD_LEFT);
            $fecha = date('d/m/Y h:i A', strtotime($cot['fecha_creacion']));

            $cliente = trim($cot['nombre_cliente'] . ' ' . $cot['papellido_cliente'] . ' ' . $cot['sapellido_cliente']);
            if (empty($cliente)) {
              $cliente = "Público en General";
            }

            $estatus = $cot['estatus'];
            $colorBadge = '#6c757d';
            if ($estatus == 'Pendiente') $colorBadge = '#ffc107';
            if ($estatus == 'Aprobada') $colorBadge = '#28a745';
            if ($estatus == 'Cancelada' || $estatus == 'Rechazada') $colorBadge = '#dc3545';
          ?>
            <tr>
              <td><strong>#<?= $folio ?></strong></td>
              <td><?= $fecha ?></td>
              <td><?= htmlspecialchars($cliente) ?></td>
              <td style="color: #28a745; font-weight: bold;">$<?= number_format($cot['total'], 2) ?></td>
              <td>
                <span style="background-color: <?= $colorBadge ?>; color: <?= ($estatus == 'Pendiente') ? '#000' : '#fff' ?>; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold;">
                  <?= $estatus ?>
                </span>
              </td>
              <td style="white-space: nowrap;">
                <button class="btn" style="background-color: #3085d6; color: white; padding: 5px 8px; border: none; border-radius: 4px; cursor: pointer;" onclick="window.open('../php/cruds/imprimir_cotizacion.php?id=<?= $cot['id_cotizacion'] ?>', '_blank')" title="Imprimir / PDF">
                  <i class="fa-solid fa-print"></i>
                </button>

                <button class="btn" style="background-color: #25D366; color: white; padding: 5px 8px; border: none; border-radius: 4px; cursor: pointer;" onclick="enviarCotizacionWhatsApp(<?= $cot['id_cotizacion'] ?>)" title="Enviar por WhatsApp">
                  <i class="fa-brands fa-whatsapp"></i>
                </button>

                <button class="btn" style="background-color: #6f42c1; color: white; padding: 5px 8px; border: none; border-radius: 4px; cursor: pointer;" onclick="enviarCotizacionCorreo(<?= $cot['id_cotizacion'] ?>)" title="Enviar por Correo">
                  <i class="fa-solid fa-envelope"></i>
                </button>

                <?php if ($estatus == 'Pendiente'): ?>

                  <button class="btn" style="background-color: #28a745; color: white; padding: 5px 8px; border: none; border-radius: 4px; cursor: pointer;" onclick="convertirAVenta(<?= $cot['id_cotizacion'] ?>)" title="Convertir a Venta / Cobrar">
                    <i class="fa-solid fa-money-bill-wave"></i>
                  </button>

                  <button class="btn" style="background-color: #ffc107; color: #000; padding: 5px 8px; border: none; border-radius: 4px; cursor: pointer;" onclick="editarCotizacion(<?= $cot['id_cotizacion'] ?>)" title="Editar Cotización">
                    <i class="fa-solid fa-pen-to-square"></i>
                  </button>

                  <button class="btn" style="background-color: #dc3545; color: white; padding: 5px 8px; border: none; border-radius: 4px; cursor: pointer;" onclick="cancelarCotizacion(<?= $cot['id_cotizacion'] ?>)" title="Cancelar Cotización">
                    <i class="fa-solid fa-ban"></i>
                  </button>

                <?php endif; ?>
              </td>
            </tr>
          <?php endforeach; ?>
        <?php else: ?>
        <?php endif; ?>

      </tbody>
    </table>
  </div>
</div>