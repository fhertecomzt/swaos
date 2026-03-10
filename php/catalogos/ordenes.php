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

//Metodos de pago
$metpagos = obtenerRegistros($dbh, "metodosdepago", "id_metpago, nombre_metpago", "ASC", "nombre_metpago", 100, 1, true);

// ordenes de servicio
$ordenes = obtenerOrdenesDashboard($dbh, 50);
// Estados de servicio (Para el modal de edición)
$estados_servicio = obtenerRegistros($dbh, "estadosservicios", "id_estado_servicio, estado_servicio", "ASC", "id_estado_servicio", 100, 1, true);
?>

<div class="containerr">
  <button class="boton" onclick="abrirModalOrden('crear-modalOrden')">
    <i class="fa-solid fa-plus"></i> Nueva Orden
  </button>

  <label class="buscarlabel" for="cantidad-registros" style="margin-left: auto;">Mostrar:</label>
  <select class="buscar--box" id="cantidad-registros" style="width: auto; margin-right: 15px; padding-right: 10px;">
    <option value="8">8</option>
    <option value="25">25</option>
    <option value="50">50</option>
    <option value="-1">Todos</option>
  </select>

  <label class="buscarlabel" for="buscarboxorden">Buscar:</label>
  <input class="buscar--box" id="buscarboxorden" type="search" placeholder="Buscar por cliente, folio..." autocomplete="off">
</div>

<div class="container_dashboard_tablas" id="ordenes">
  <h3>Órdenes de Servicio</h3>
  <div id="scroll-container">
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

              <button title="Enviar WhatsApp" class="btn-whatsapp" style="background-color: #25D366; color: white; border-radius: 5px; padding: 5px 8px; cursor: pointer;"
                onclick="enviarWhatsOrden('<?php echo $ord['tel_cliente']; ?>', '<?php echo $ord['id_orden']; ?>', '<?php echo htmlspecialchars($ord['nombre_cliente']); ?>', '<?php echo $ord['saldo_servicio']; ?>', '<?php echo $ord['estado_servicio']; ?>', '<?php echo htmlspecialchars($_SESSION['nombre_t']); ?>')">
                <i class="fa-brands fa-whatsapp pointer-events-none"></i>
              </button>

              <button title="Imprimir Ticket" class="btn-imprimir" style="background-color: #34495e; color: white; border-radius: 5px; padding: 5px 8px; cursor: pointer;"
                onclick="imprimirTicket('<?php echo $ord['id_orden']; ?>')">
                <i class="fa-solid fa-print pointer-events-none"></i>
              </button>

              <button title="Ver QR" class="btn-qr"
                onclick="verQrOrden('<?php echo $ord['token_hash']; ?>')">
                <i class="fa-solid fa-qrcode"></i>
              </button>

              <button title="Editar" class="editarOrden fa-solid fa-pen-to-square" data-id="<?php echo $ord['id_orden']; ?>" style="background-color: #c1c13c; color: white; border-radius: 5px; padding: 5px 8px; cursor: pointer;"></button>

              <button title="Cancelar Orden" class="eliminarOrden" data-id="<?php echo $ord['id_orden']; ?>" style="background-color: #cb2c3c; color: white; border-radius: 5px; padding: 5px 8px; cursor: pointer;">
                <i class="fa-solid fa-trash pointer-events-none"></i>
              </button>
            </td>
          </tr>
        <?php endforeach; ?>
      </tbody>
    </table>
  </div>
</div>

<!-- Modal para crear Orden -->
<div id="crear-modalOrden" class="modal" style="display: none;">
  <div class="modal-contentOrdenes">
    <span class="close" onclick="cerrarModalOrden('crear-modalOrden')">&times;</span>
    <h2 class="tittle">Nueva Orden de Servicio</h2>

    <form id="form-crearOrden" enctype="multipart/form-data" novalidate>
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
            <input type="text" name="numero_serie" placeholder="Obligatorio para garantía" 
              pattern="[a-zA-ZÀ-ÿ0-9\s]+"
              title="Solo se permiten letras, números y espacios."
              oninput="this.value = this.value.replace(/[^a-zA-ZÀ-ÿ0-9\s]/g, '')" required>
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
            <textarea name="falla" rows="3" style="width: 80%;" placeholder="¿Qué dice el cliente que falla?" required></textarea>
          </div>
          <div class="form-group" style="width: 100%;">
            <label>Diagnóstico Técnico (Opcional):</label>
            <textarea name="diagnostico" rows="3" style="width: 80%;" placeholder="Observaciones técnicas iniciales"></textarea>
          </div>
          <div class="form-group" style="width: 100%;">
            <label>Observaciones Generales:</label>
            <textarea name="observaciones" rows="3" style="width: 80%;" placeholder="Detalles estéticos, condiciones, etc."></textarea>
          </div>
        </div>

        <div>
          <h4>5. Costos y Evidencia</h4>
          <div class="form-containernum">
            <div class="form-group ladoble">
              <label>Costo Total ($):</label>
              <input type="number" id="crear-costo" name="costo" step="0.01" min="0" oninput="calcularSaldoOrden()">
            </div>
            <div class="form-group ladoble">
              <label>Anticipo ($):</label>
              <input type="number" id="crear-anticipo" name="anticipo" step="0.01" min="0" value="0" oninput="calcularSaldoOrden()">
            </div>

            <div class="form-group ladoble">
              <label>Método de Pago (Del Anticipo):</label>
              <select name="id_metodo_pago" id="crear-metodo-pago">
                <option value="">Seleccionar...</option>
                <?php foreach ($metpagos as $mp): ?>
                  <option value="<?php echo $mp['id_metpago']; ?>"><?php echo $mp['nombre_metpago']; ?></option>
                <?php endforeach; ?>
              </select>
            </div>
            <div class="form-group ladoble">
              <label>Saldo Restante ($):</label>
              <input type="text" id="crear-saldo" name="saldo" readonly style="background: #eee; font-weight: bold; color: red;">
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
<!-- Modal para crear un cliente express -->
<div id="modalClienteExpress" class="modal" style="display: none; z-index: 2000; background-color: rgba(0,0,0,0.85);">
  <div class="modal-contentProductos" style="max-width: 500px; margin-top: 10%;">
    <span class="close" onclick="cerrarModalClienteExpress()">&times;</span>
    <h3 class="tittle">Nuevo Cliente Rápido</h3>

    <form id="form-cliente-express" novalidate>
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
<!-- Modal para editar Orden -->
<div id="editar-modalOrden" class="modal" style="display: none; z-index: 1050;">
  <div class="modal-contentOrdenes" style="max-width: 950px;"> <span class="close" onclick="cerrarModalOrden('editar-modalOrden')">&times;</span>
    <h2 class="tittle">Actualizar Orden #<span id="edit-folio-text"></span></h2>

    <form id="form-editarOrden">
      <input type="hidden" id="edit-id-orden" name="id_orden">

      <div class="form-grid-2">
        <div class="seccion-form">
          <h4>1. Estado y Diagnóstico</h4>

          <div class="form-group" style="width: 100%;">
            <label>Estado del Equipo:</label>
            <select id="edit-estado" name="id_estado_servicio" required>
              <option value="">Selecciona un estado...</option>
              <?php foreach ($estados_servicio as $est): ?>
                <option value="<?php echo $est['id_estado_servicio']; ?>"><?php echo $est['estado_servicio']; ?></option>
              <?php endforeach; ?>
            </select>
          </div>

          <div class="form-group" style="width: 100%;">
            <label>Falla Reportada Inicialmente:</label>
            <textarea id="edit-falla" rows="2" readonly style="background:#eee;"></textarea>
          </div>

          <div class="form-group" style="width: 100%;">
            <label>Diagnóstico Técnico / Solución:</label>
            <textarea id="edit-diagnostico" name="diagnostico" rows="2" placeholder="Describe el trabajo realizado..."></textarea>
          </div>
        </div>

        <div class="seccion-form">
          <h4>2. Costos y Abonos</h4>
          <div class="form-containernum">

            <div class="form-group ladoble">
              <label style="color: var(--color_sky); font-weight: bold;">Mano de Obra ($):</label>
              <input type="number" id="edit-mano-obra" name="mano_obra" step="0.01" min="0" value="0" oninput="calcularSaldoEdit()">
            </div>
            <div class="form-group ladoble">
              <label>Costo Total (Auto):</label>
              <input type="number" id="edit-costo" name="costo_servicio" step="0.01" min="0" readonly style="background: #eef2f5; font-weight: bold;">
            </div>

            <div class="form-group ladoble">
              <label>Anticipo Acumulado ($):</label>
              <input type="text" id="edit-anticipo" name="anticipo_servicio" readonly style="background: #eee;">
            </div>
            <div class="form-group ladoble">
              <label>Saldo Restante ($):</label>
              <input type="text" id="edit-saldo" name="saldo_servicio" readonly style="background: #eee; font-weight: bold; color: red;">
            </div>

            <div class="form-group ladoble" style="margin-top: 10px;">
              <label style="color: green; font-weight: bold;">Nuevo Abono ($):</label>
              <input type="number" id="edit-nuevo-abono" name="nuevo_abono" step="0.01" min="0" value="0" oninput="calcularSaldoEdit()" style="border-color: green;">
            </div>
            <div class="form-group ladoble" style="margin-top: 10px;">
              <label style="color: green; font-weight: bold;">Método de Pago:</label>
              <select name="id_metodo_pago" id="edit-metodo-pago" style="border-color: green;">
                <option value="">Seleccionar...</option>
                <?php foreach ($metpagos as $mp): ?>
                  <option value="<?php echo $mp['id_metpago']; ?>"><?php echo $mp['nombre_metpago']; ?></option>
                <?php endforeach; ?>
              </select>
            </div>
          </div>
        </div>

        <!-- si queremos que abran al iniciar ponemos open <details open style="...">). -->
        <div style="width: 100%; margin-top: 15px; grid-column: 1 / -1;">
          <details style="border: 1px solid #ddd; border-radius: 5px; background: #fff; box-shadow: 0 2px 5px rgba(0,0,0,0.05);">
            <summary style="padding: 10px 15px; background: #f4f6f9; color: #34495e; font-weight: bold; cursor: pointer; user-select: none; border-radius: 5px; outline: none;">
              <i class="fa-solid fa-clock-rotate-left"></i> Ver Historial de Pagos Recibidos <span style="font-size: 12px; font-weight: normal; color: #777; float: right;">(Clic para desplegar ▼)</span>
            </summary>

            <div style="padding: 10px; max-height: 130px; overflow-y: auto;">
              <table class="tbl" style="width: 100%; margin: 0; font-size: 12px;">
                <thead style="background: #e9ecef; color: #333;">
                  <tr>
                    <th style="padding: 5px;">Fecha</th>
                    <th style="padding: 5px;">Monto</th>
                    <th style="padding: 5px;">Método de Pago</th>
                  </tr>
                </thead>
                <tbody id="tabla-historial-pagos">
                  <tr>
                    <td colspan="3" style="text-align: center; color: #888;">No hay abonos registrados.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </details>
        </div>
        <!-- si queremos que abran al iniciar ponemos open <details open style="...">). -->
        <div style="width: 100%; margin-top: 15px; grid-column: 1 / -1;">
          <details style="border: 1px solid #ddd; border-radius: 5px; background: #fff; box-shadow: 0 2px 5px rgba(0,0,0,0.05);">
            <summary style="padding: 12px 15px; background: #f4f6f9; color: var(--color_sky); font-weight: bold; font-size: 15px; cursor: pointer; user-select: none; border-radius: 5px; outline: none;">
              <i class="fa-solid fa-screwdriver-wrench"></i> 3. Refacciones y Piezas Utilizadas <span style="font-size: 12px; font-weight: normal; color: #777; float: right;">(Clic para desplegar ▼)</span>
            </summary>

            <div style="padding: 15px; border-top: 1px solid #ddd;">
              <div class="form-group" style="position: relative; margin-bottom: 10px;">
                <label>Buscar Producto (Escribe nombre, código o número de parte):</label>
                <input type="search" id="busqueda-producto-orden" placeholder="Ej. Pantalla, Batería, Memoria RAM..." autocomplete="off">
                <ul id="lista-resultados-productos" class="lista-autocomplete" style="display: none; max-height: 200px; overflow-y: auto;"></ul>
              </div>

              <div style="max-height: 200px; overflow-y: auto; border: 1px solid #ddd; border-radius: 5px;">
                <table class="tbl" style="width: 100%; margin: 0; font-size: 13px;">
                  <thead style="position: sticky; top: 0; background: #34495e; color: white;">
                    <tr>
                      <th style="padding: 8px;">Producto</th>
                      <th style="padding: 8px; width: 80px; text-align: center;">Cant.</th>
                      <th style="padding: 8px; width: 100px; text-align: center;">Precio</th>
                      <th style="padding: 8px; width: 100px; text-align: center;">Subtotal</th>
                      <th style="padding: 8px; width: 50px; text-align: center;"></th>
                    </tr>
                  </thead>
                  <tbody id="tabla-refacciones-orden">
                    <tr id="fila-vacia-refacciones">
                      <td colspan="5" style="text-align: center; color: #888; padding: 15px;">No se han agregado refacciones a esta orden.</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div style="text-align: right; margin-top: 10px; font-size: 16px;">
                <strong>Total Piezas: </strong>
                <span style="color: var(--color_sky); font-weight: bold; font-size: 18px;">$<span id="total-refacciones-text">0.00</span></span>
                <input type="hidden" id="total-refacciones-input" name="total_refacciones" value="0">
              </div>
            </div>
          </details>
        </div>

        <div style="text-align: right; margin-top: 10px; font-size: 16px;">
          <strong>Total Piezas: </strong>
          <span style="color: var(--color_sky); font-weight: bold; font-size: 18px;">$<span id="total-refacciones-text">0.00</span></span>
          <input type="hidden" id="total-refacciones-input" name="total_refacciones" value="0">
        </div>
      </div>

      <div style="margin-top: 20px; text-align: right;">
        <button type="submit" class="boton-guardar"><i class="fa-solid fa-floppy-disk"></i> Guardar Cambios</button>
        <span class="cancelarModal" onclick="cerrarModalOrden('editar-modalOrden')">Cancelar</span>
      </div>
    </form>
  </div>
</div>