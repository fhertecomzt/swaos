<?php
if (session_status() === PHP_SESSION_NONE) {
  session_start();
}
$roles_permitidos = ["superusuario", "gerencia"];


// Includes obligatorios
include "../verificar_sesion.php";
require "../conexion.php";
include "../funciones/funciones.php";

// 1. OBTENCIÓN DE CATÁLOGOS USANDO FUNCIONES.PHP
// El 'true' al final activa el filtro WHERE estatus = 0

// Clientes (Traemos 2000 por si tienes muchos, página 1, solo activos)
$clientes = obtenerRegistros($dbh, "clientes", "id_cliente, nombre_cliente, papellido_cliente", "ASC", "nombre_cliente", 2000, 1, true);

// Equipos
$equipos = obtenerRegistros($dbh, "equipos", "id_equipo, nombre_equipo", "ASC", "nombre_equipo", 100, 1, true);

// Marcas
$marcas = obtenerRegistros($dbh, "marcas", "id_marca, nom_marca", "ASC", "nom_marca", 100, 1, true);

// Servicios
$servicios = obtenerRegistros($dbh, "tiposervicios", "id_servicio, nom_servicio", "ASC", "nom_servicio", 100, 1, true);

// ordenes de servicio
$ordenes = obtenerOrdenesDashboard($dbh, 50);
?>

<div class="containerr">
  <button class="boton" onclick="abrirModalOrden('crear-modalOrden')">
    <i class="fa-solid fa-plus"></i> Nueva Orden
  </button>
  <label class="buscarlabel" for="buscarboxorden">Buscar:</label>
  <input class="buscar--box" id="buscarboxorden" type="search" placeholder="Buscar por cliente, folio o modelo..." autocomplete="off">
</div>

<div class="container_dashboard_tablas" id="ordenes">
  <h3>Órdenes de Servicio</h3>
  <div id="scroll-container" style="height: 65vh; overflow-y: auto;">
    <table class="tbl" id="tabla-ordenes">
      <thead>
        <tr>
          <th>Folio</th>
          <th>Cliente</th>
          <th>Equipo</th>
          <th>Falla Reportada</th>
          <th>Costo</th>
          <th>Estado</th>
          <th>Fecha</th>
          <th style="text-align: center;">Acciones</th>
        </tr>
      </thead>
      <tbody id="ordenes-lista">
        <?php foreach ($ordenes as $ord): ?>
          <tr>
            <td data-lable="Folio">#<?php echo $ord['id_orden']; ?></td>
            <td data-lable="Cliente"><?php echo htmlspecialchars($ord['nombre_cliente'] . ' ' . $ord['papellido_cliente']); ?></td>
            <td data-lable="Equipo"><?php echo htmlspecialchars($ord['nombre_equipo'] . ' ' . $ord['modelo']); ?></td>
            <td data-lable="Falla"><?php echo htmlspecialchars(substr($ord['falla'], 0, 30)) . '...'; ?></td>
            <td data-lable="Costo">$<?php echo number_format($ord['costo_servicio'], 2); ?></td>

            <td data-lable="Estado">
              <span class="badge-estado est-<?php echo strtolower($ord['estado_servicio']); ?>">
                <?php echo htmlspecialchars($ord['estado_servicio']); ?>
              </span>
            </td>

            <td data-lable="Fecha"><?php echo date('d/m/Y', strtotime($ord['creado_servicio'])); ?></td>

            <td data-lable="Acciones" style="display: flex; gap: 10px; justify-content: center;">
              <button title="Enviar WhatsApp" class="btn-whatsapp"
                onclick="enviarWhatsOrden('<?php echo $ord['token_hash']; ?>', '<?php echo $ord['id_orden']; ?>')">
                <i class="fa-brands fa-whatsapp"></i>
              </button>

              <button title="Ver QR" class="btn-qr"
                onclick="verQrOrden('<?php echo $ord['token_hash']; ?>')">
                <i class="fa-solid fa-qrcode"></i>
              </button>

              <button title="Editar" class="editarOrden fa-solid fa-pen-to-square" data-id="<?php echo $ord['id_orden']; ?>"></button>
            </td>
          </tr>
        <?php endforeach; ?>
      </tbody>
    </table>
  </div>
</div>

<!-- Modal para crear Orden -->
<div id="crear-modalOrden" class="modal" style="display: none;">
  <div class="modal-contentProductos" style="width: 40%; max-width: 900px;">
    <span class="close" onclick="cerrarModalOrden('crear-modalOrden')">&times;</span>
    <h2 class="tittle">Nueva Orden de Servicio</h2>

    <form id="form-crearOrden" enctype="multipart/form-data">
      <input type="hidden" name="id_usuario_sesion" value="<?php echo $_SESSION['id_usuario'] ?? 0; ?>">

      <div class="form-grid-3">
        <div class="seccion-form">
          <h4>1. Cliente</h4>
          <div class="form-group" style="width: 100%;">
            <label>Seleccionar Cliente:</label>
            <div class="autocomplete-container" style="position: relative;">
              <label>Cliente:</label>

              <input type="search" id="busqueda-cliente" placeholder="Escribe nombre o teléfono..." autocomplete="off">

              <input type="hidden" id="id_cliente_seleccionado" name="id_cliente" required>

              <ul id="lista-resultados-clientes" class="lista-autocomplete" style="display: none;"></ul>
              <p></p>
              <span id="limpiar-cliente" style="display:none; cursor:pointer; color:red; font-size: 12px;">[x] Cambiar cliente</span>
              <p></p>

              <small style="color: blue; cursor: pointer;" onclick="abrirModalClienteExpress()">+ Nuevo Cliente Rápido</small>
            </div>
          </div>
        </div>

        <div class="seccion-form">
          <h4>2. Datos del Equipo</h4>
          <div class="form-group">
            <label>Tipo:</label>
            <select name="tipo_equipo" required>
              <option value="">Selecciona un tipo de equipo...</option>
              <?php foreach ($equipos as $e): ?>
                <option value="<?php echo $e['id_equipo']; ?>"><?php echo $e['nombre_equipo']; ?></option>
              <?php endforeach; ?>
            </select>
          </div>
          <div class="form-group">
            <label>Marca:</label>
            <select name="marca" required>
              <option value="">Selecciona una marca...</option>
              <?php foreach ($marcas as $m): ?>
                <option value="<?php echo $m['id_marca']; ?>"><?php echo $m['nom_marca']; ?></option>
              <?php endforeach; ?>
            </select>
          </div>
          <div class="form-group">
            <label>Modelo:</label>
            <input type="text" name="modelo" placeholder="Ej. equipo generico" required>
          </div>
          <div class="form-group">
            <label>No. Serie / IMEI:</label>
            <input type="text" name="numero_serie" placeholder="Obligatorio para garantía">
          </div>
        </div>

        <div class="seccion-form">
          <h4>3. Recepción</h4>
          <div class="form-group">
            <label>Contraseña / Patrón:</label>
            <input type="text" name="contrasena_dispositivo" placeholder="Ej. 1234 o Patrón 'Z'">
          </div>
          <div class="form-group">
            <label>Accesorios (Cargador, funda...):</label>
            <input type="text" name="accesorios" placeholder="Detallar todo lo recibido">
          </div>
          <div class="form-group">
            <label>Fecha Estimada Entrega:</label>
            <input type="datetime-local" name="fecha_entrega_estimada"
              value="<?php echo date('Y-m-d\TH:i', strtotime('+3 days')); ?>">
          </div>
        </div>
      </div>

      <hr>

      <div class="form-grid-2">
        <div>
          <h4>4. Diagnóstico Inicial</h4>
          <div class="form-group" style="width: 100%;">
            <label>Tipo Servicio:</label>
            <select name="tipo_servicio" required>
              <option value="">Selecciona tipo de servicio...</option>
              <?php foreach ($servicios as $s): ?>
                <option value="<?php echo $s['id_servicio']; ?>"><?php echo $s['nom_servicio']; ?></option>
              <?php endforeach; ?>
            </select>
          </div>
          <div class="form-group" style="width: 100%;">
            <label>Falla Reportada (Cliente):</label>
            <textarea name="falla" rows="2" placeholder="¿Qué dice el cliente que falla?" required></textarea>
          </div>
          <div class="form-group" style="width: 100%;">
            <label>Diagnóstico Técnico (Opcional):</label>
            <textarea name="diagnostico" rows="2" placeholder="Observaciones técnicas iniciales"></textarea>
          </div>
          <div class="form-group" style="width: 100%;">
            <label>Observaciones Generales:</label>
            <textarea name="observaciones" rows="2" placeholder="Detalles estéticos, condiciones, etc."></textarea>
          </div>
        </div>

        <div>
          <h4>5. Costos y Evidencia</h4>
          <div class="form-containernum">
            <div class="form-group laquinta">
              <label>Costo Total:</label>
              <input type="number" id="crear-costo" name="costo" step="0.01" min="0" oninput="calcularSaldoOrden()">
            </div>
            <div class="form-group laquinta">
              <label>Anticipo:</label>
              <input type="number" id="crear-anticipo" name="anticipo" step="0.01" min="0" value="0" oninput="calcularSaldoOrden()">
            </div>
            <div class="form-group laquinta">
              <label>Saldo:</label>
              <input type="text" id="crear-saldo" name="saldo" readonly style="background: #eee; font-weight: bold;">
            </div>
          </div>

          <div class="form-group" style="width: 100%; margin-top: 10px; border: 2px dashed #ccc; padding: 10px; text-align: center;">
            <div class="camera-section" style="text-align: center; margin-bottom: 10px;">
              <div id="camera-preview" style="display:none; margin-bottom: 5px;">
                <video id="video-webcam" width="300" height="225" autoplay style="border: 2px solid #333; border-radius: 5px;"></video>
                <canvas id="canvas-webcam" style="display:none;"></canvas>
              </div>

              <button type="button" id="btn-activar-camara" class="boton" style="background: #6c757d; font-size: 12px;">
                <i class="fa-solid fa-video"></i> Usar Cámara PC
              </button>

              <button type="button" id="btn-tomar-foto" class="boton" style="display:none; background: #dc3545; font-size: 12px;">
                <i class="fa-solid fa-camera"></i> Capturar
              </button>
            </div>

            <label for="evidencias-upload" ...>
              <label for="evidencias-upload" style="cursor: pointer; color: #007bff;">
                <i class="fa-solid fa-camera"></i> Subir Fotos de Evidencia
              </label>
              <input type="file" id="evidencias-upload" name="evidencias[]" multiple accept="image/*" style="display: none;" onchange="previewEvidencia(this)">
              <div id="preview-container" style="display: flex; gap: 5px; flex-wrap: wrap; margin-top: 5px;"></div>
          </div>
        </div>
      </div>

      <div style="margin-top: 20px; text-align: right;">
        <button type="submit" class="boton-guardar">Generar Orden</button>
        <span class="cancelarModal" onclick="cerrarModalOrden('crear-modalOrden')">Cancelar</span>
      </div>
    </form>
  </div>
</div>

<div id="modalClienteExpress" class="modal" style="display: none; z-index: 2000; background-color: rgba(0,0,0,0.85);">
  <div class="modal-contentProductos" style="max-width: 500px; margin-top: 10%;">
    <span class="close" onclick="cerrarModalClienteExpress()">&times;</span>
    <h3 class="tittle">Nuevo Cliente Rápido</h3>

    <form id="form-cliente-express">
      <div class="form-group">
        <label>Nombre:</label>
        <input type="text" name="nombre" required autocomplete="off">
      </div>

      <div class="form-group">
        <label>Primer Apellido:</label>
        <input type="text" name="apellido" required autocomplete="off">
      </div>

      <div class="form-group">
        <label>Teléfono (WhatsApp):</label>
        <input type="text" name="telefono" required pattern="[0-9]+" title="Solo números" maxlength="10">
      </div>

      <div class="form-group">
        <label>Email (Opcional):</label>
        <input type="email" name="email">
      </div>

      <div style="text-align: right; margin-top: 15px;">
        <button type="submit" class="boton-guardar">Guardar y Seleccionar</button>
        <span class="cancelarModal" onclick="cerrarModalClienteExpress()">Cancelar</span>
      </div>
    </form>
  </div>
</div>