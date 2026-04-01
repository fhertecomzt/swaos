<?php
if (session_status() === PHP_SESSION_NONE) {
  session_start();
}
// Ajusta los roles según tu necesidad
$roles_permitidos = ["superusuario", "gerencia", "almacen"];
include "../verificar_sesion.php";
require "../conexion.php";
include "../funciones/funciones.php";

// Obtenemos los productos activos para los selects
$productos = obtenerRegistros($dbh, "productos", "id_prod, codebar_prod, nombre_prod, costo_prod", "ASC", "nombre_prod", 2000, 1, 0);
// Proveedores (Solo los que tienen estatus = 0)
$stmtProv = $dbh->query("SELECT id_prov, contacto_prov FROM proveedores WHERE estatus = 0");
$proveedores = $stmtProv->fetchAll(PDO::FETCH_ASSOC);

// Obtenemos tu ID de sucursal actual
$id_mi_taller = $_SESSION['taller_id'] ?? 1;

// Talleres (Solo activos)
// Hacemos la consulta directa porque la columna se llama 'estatus_t' y tu función maestra chocaría
$stmtTalleres = $dbh->query("SELECT id_taller, nombre_t FROM talleres WHERE estatus_t = 0");
$talleres = $stmtTalleres->fetchAll(PDO::FETCH_ASSOC);
?>

<style>
  .kardex-pane {
    display: none;
    padding: 1px 16px;
    /* 25px arriba/abajo, 30px a los lados */
    box-sizing: border-box;
    /* Evita que el padding haga más grande el div */
    width: 100%;
  }

  .kardex-pane.active {
    display: block;
  }

  /* Para que el botón rojo no se aplaste el texto */
  #form-salida-multiple button[type="submit"] {
    white-space: nowrap;
  }

  /* ESTILOS PREMIUM PARA LAS PESTAÑAS (TABS) */
  .kardex-tabs {
    display: flex;
    border-bottom: 2px solid #eef2f5;
    margin-bottom: 20px;
    gap: 10px;
  }

  .kardex-tab {
    padding: 12px 20px;
    cursor: pointer;
    background: transparent;
    border: none;
    font-size: 15px;
    font-weight: bold;
    color: #6c757d;
    border-bottom: 3px solid transparent;
    transition: all 0.3s ease;
  }

  .kardex-tab:hover {
    color: #34495e;
    background: #f8f9fa;
    border-radius: 5px 5px 0 0;
  }

  .kardex-tab.active {
    color: var(--color_sky);
    /* Usa el azul de tu tema */
    border-bottom: 3px solid var(--color_sky);
  }

  .kardex-pane {
    display: none;
    animation: fadeIn 0.4s;
  }

  .kardex-pane.active {
    display: block;
  }

  /* CONTENEDOR DEL BOTÓN FINAL */
  .contenedor-accion-final {
    text-align: right;
    margin-top: 20px;
    padding-top: 20px;
    border-top: 2px dashed #eef2f5;
    /* Una línea sutil para separar la tabla del botón */
  }

  /* BOTÓN Procesar ESTILO ERP */
  .btn-procesar-erp {
    color: white;
    font-size: 16px;
    font-weight: bold;
    padding: 12px 30px;
    border: none;
    border-radius: 8px;
    /* Bordes más redonditos y modernos */
    cursor: pointer;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    /* Sombrita elegante */
    transition: all 0.3s ease;
    display: inline-flex;
    align-items: center;
    gap: 10px;
  }

  /* Efecto al pasar el mouse */
  .btn-procesar-erp:hover {
    transform: translateY(-2px);
    /* Se levanta un poquito */
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2);
    /* La sombra se hace más grande */
  }

  /* BOTÓN Agregar ESTILO ERP */
  .btn-agregar-erp {
    color: white;
    font-size: 16px;
    font-weight: bold;
    padding: 12px 30px;
    border: none;
    border-radius: 8px;
    /* Bordes más redonditos y modernos */
    cursor: pointer;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    /* Sombrita elegante */
    transition: all 0.3s ease;
    display: inline-flex;
    align-items: center;
    gap: 10px;
  }

  /* Efecto al pasar el mouse */
  .btn-agregar-erp:hover {
    transform: translateY(-2px);
    /* Se levanta un poquito */
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2);
    /* La sombra se hace más grande */
  }

  /* ESTILOS PARA TABLAS CON SCROLL INTERNO (CARRITOS) */
  .tabla-scroll {
    max-height: 280px;
    /* 280px son aprox 1 encabezado + 5 productos La tabla no crecerá más del 35% de la pantalla */
    overflow-y: auto;
    /* Activa la barra de scroll si se pasa del límite */
    border: 1px solid #eef2f5;
    border-radius: 5px;
    margin-bottom: 20px;
  }

  .tabla-scroll table {
    margin-bottom: 0 !important;
    /* Evita doble margen */
  }

  /* Congelamos el encabezado arriba */
  .tabla-scroll thead th {
    position: sticky;
    top: 0;
    z-index: 10;
    background-color: #34495e;
    /* Ajusta al color oscuro de tus tablas */
    color: white;
  }

  /* Congelamos el Total abajo (Para la pestaña de Entradas) */
  .tabla-scroll tfoot th,
  .tabla-scroll tfoot td {
    position: sticky;
    bottom: 0;
    background-color: #f8f9fa;
    z-index: 10;
    border-top: 2px solid #ddd;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(5px);
    }

    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
</style>

<div class="containerr" style="display: flex; align-items: center; flex-wrap: wrap;">
  <h3 style="color: var(--color_sky);
    font-size: 20px;
    padding: 10px;
    margin: auto; margin: 0;"><i class="fa-solid fa-boxes-stacked"></i> Movimientos de Inventario</h3>

  <div id="controles-kardex" style="display: none; margin-left: auto; align-items: center;">
    <label class="buscarlabel" for="kardex-length" style="margin-right: 5px;">Mostrar:</label>
    <select class="buscar--box" id="kardex-length" style="width: auto; margin-right: 15px;">
      <option value="08">8</option>
      <option value="25">25</option>
      <option value="50">50</option>
      <option value="-1">Todos</option>
    </select>

    <label class="buscarlabel" for="kardex-search" style="margin-right: 5px;">Buscar:</label>
    <input class="buscar--box" id="kardex-search" type="search" placeholder="¿Qué buscas?" autocomplete="off">
    <button class="boton" onclick="cargarTablaKardex()" style="margin: 0;"><i class="fa-solid fa-rotate-right"></i> Actualizar Tabla</button>
  </div>
</div>

<div class="container_dashboard_tablas" style="min-height: 70vh;">

  <div class="kardex-tabs">
    <button class="kardex-tab active" onclick="cambiarPestanaInventario(event, 'tab-historial')">
      <i class="fa-solid fa-clock-rotate-left"></i> Historial Kardex
    </button>
    <button class="kardex-tab" onclick="cambiarPestanaInventario(event, 'tab-entradas')">
      <i class="fa-solid fa-arrow-turn-down" style="color: #28a745;"></i> Entradas (Compras)
    </button>
    <button class="kardex-tab" onclick="cambiarPestanaInventario(event, 'tab-salidas')">
      <i class="fa-solid fa-arrow-turn-up" style="color: #dc3545;"></i> Salidas (Mermas/Ajustes)
    </button>
    <button class="kardex-tab" onclick="cambiarPestanaInventario(event, 'tab-traspasos')">
      <i class="fa-solid fa-right-left" style="color: #17a2b8;"></i> Traspasos (Sucursales)
    </button>
  </div>

  <div id="tab-historial" class="kardex-pane active">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
      <h4>Historial de Movimientos</h4>
    </div>

    <table id="tabla-kardex" class="tbl" style="width: 100%; font-size: 13px;">
      <thead>
        <tr>
          <th>ID</th>
          <th>Fecha</th>
          <th>Producto</th>
          <th>Tipo</th>
          <th>Cant.</th>
          <th>Stock Ant.</th>
          <th>Stock Nuevo</th>
          <th>Motivo</th>
          <th>Usuario</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody id="cuerpo-tabla-kardex">
        <tr>
          <td colspan="9" style="text-align: center;">Haz clic en "Actualizar Tabla" para cargar los datos.</td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- Entradas -->
  <div id="tab-entradas" class="kardex-pane">
    <h4 style="margin-bottom: 15px; color: #28a745;"><i class="fa-solid fa-truck-ramp-box"></i> Registro de Compra a Proveedor</h4>

    <form id="form-compra-multiple">
      <div style="display: flex; gap: 15px; margin-bottom: 20px; background: #f8f9fa; padding: 15px; border-radius: 5px; border: 1px solid #ddd;">
        <div style="flex: 1;">
          <label style="font-weight: bold;">Proveedor:</label>
          <select id="compra-proveedor" class="buscar--box" style="width: 100%;" required>
            <option value="">-- Seleccione un Proveedor --</option>
            <?php foreach ($proveedores as $prov): ?>
              <option value="<?php echo $prov['id_prov']; ?>"><?php echo htmlspecialchars($prov['contacto_prov']); ?></option>
            <?php endforeach; ?>
          </select>
        </div>
        <div style="flex: 1;">
          <label style="font-weight: bold;">Folio de Factura/Nota:</label>
          <input type="search" id="compra-folio" class="buscar--box" style="width: 95%;" placeholder="Ej. FAC-90210" autocomplete="off" required oninput="this.value = this.value.replace(/[^a-zA-Z0-9-]/g, '')">
        </div>
      </div>

      <div style="margin-bottom: 20px;">
        <label style="font-weight: bold;">Buscar Producto para Agregar:</label>
        <div style="display: flex; gap: 10px;">
          <input type="search" id="buscador-producto-compra" class="buscar--box" style="flex: 1;" placeholder="Escribe el nombre o escanea el código..." autocomplete="off" oninput="this.value = this.value.replace(/[^a-zA-Z0-9\s.-]/g, '')">
          <button type="button" class="btn-procesar-erp" onclick="agregarProductoCompra()" style="background: #17a2b8;"><i class="fa-solid fa-plus"></i> Agregar</button>
        </div>
        <div id="sugerencias-compra" style="position: absolute; background: white; border: 1px solid #ccc; width: 40%; max-height: 200px; overflow-y: auto; display: none; z-index: 1000; box-shadow: 0 4px 6px rgba(0,0,0,0.1);"></div>
      </div>

      <div class="tabla-scroll">
        <table class="tbl" style="width: 100%; margin-bottom: 20px;">
          <thead>
            <tr>
              <th>Producto</th>
              <th style="width: 120px; text-align: center;">Cant.</th>
              <th style="width: 150px; text-align: center;">Costo Unit. ($)</th>
              <th style="width: 150px; text-align: center;">Subtotal</th>
              <th style="width: 50px; text-align: center;">X</th>
            </tr>
          </thead>
          <tbody id="cuerpo-carrito-compra">
            <tr id="fila-vacia-compra">
              <td colspan="5" style="text-align: center; color: #888; padding: 15px;">No hay productos en la factura. Busca y agrega uno.</td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <td colspan="3" style="text-align: right; font-weight: bold; font-size: 16px;">TOTAL FACTURA:</td>
              <td style="text-align: center; font-weight: bold; font-size: 16px; color: #28a745;" id="total-compra-texto">$0.00</td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div class="contenedor-accion-final">
        <button type="submit" class="btn-procesar-erp" style="background-color: #28a745;">
          <i class="fa-solid fa-floppy-disk"></i> Procesar Compra
        </button>
      </div>

    </form>
  </div>

  <!-- Salidas -->
  <div id="tab-salidas" class="kardex-pane">
    <h4 style="margin-bottom: 15px; color: #dc3545;"><i class="fa-solid fa-arrow-right-from-bracket"></i> Registro de Salidas / Mermas</h4>

    <form id="form-salida-multiple">
      <div style="margin-bottom: 20px; background: #f8f9fa; padding: 15px; border-radius: 5px; border: 1px solid #ddd;">
        <label style="font-weight: bold;">Motivo de la Salida / Referencia:</label>
        <input type="search" id="salida-motivo" name="motivo" class="buscar--box" style="width: 95%;" placeholder="Ej. Merma por cristal roto..." required oninput="this.value = this.value.replace(/[<>&\&quot;\'\{\}\[\]\\]/g, '')" autocomplete="off">
      </div>

      <div style="margin-bottom: 20px;">
        <label style="font-weight: bold;">Buscar Producto para Extraer:</label>
        <div style="display: flex; gap: 10px;">
          <input type="search" id="buscador-producto-salida" class="buscar--box" style="flex: 1;" placeholder="Escribe el nombre o escanea el código..." autocomplete="off" oninput="this.value = this.value.replace(/[^a-zA-Z0-9\s.-]/g, '')">
          <button type="button" class="btn-procesar-erp" onclick="agregarProductoSalida()" style="background: #17a2b8;"><i class=" fa-solid fa-plus"></i> Agregar</button>
        </div>
        <div id="sugerencias-salida" style="position: absolute; background: white; border: 1px solid #ccc; width: 40%; max-height: 200px; overflow-y: auto; display: none; z-index: 1000; box-shadow: 0 4px 6px rgba(0,0,0,0.1);"></div>
      </div>

      <div class="tabla-scroll">
        <table class="tbl" style="width: 100%; margin-bottom: 20px;">
          <thead>
            <tr>
              <th>Producto</th>
              <th style="width: 150px; text-align: center;">Stock Disponible</th>
              <th style="width: 150px; text-align: center;">Cant. a Sacar</th>
              <th style="width: 50px; text-align: center;">X</th>
            </tr>
          </thead>
          <tbody id="cuerpo-carrito-salida">
            <tr id="fila-vacia-salida">
              <td colspan="4" style="text-align: center; color: #888; padding: 15px;">No hay productos en la lista. Busca y agrega uno.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="contenedor-accion-final">
        <button type="submit" class="btn-procesar-erp" style="background-color: #dc3545;">
          <i class="fa-solid fa-minus"></i> Procesar Salida de Inventario
        </button>
      </div>

    </form>
  </div>

  <!-- Traspasos -->
  <div id="tab-traspasos" class="kardex-pane">
    <h4 style="margin-bottom: 15px; color: #17a2b8;"><i class="fa-solid fa-truck-fast"></i> Traspaso de Inventario a Otra Sucursal</h4>
        <form id="form-traspaso-multiple">
          <div style="margin-bottom: 20px; background: #f8f9fa; padding: 15px; border-radius: 5px; border: 1px solid #ddd;">
            <label style="font-weight: bold;">Enviar mercancía a la Sucursal / Taller:</label>
            <select id="traspaso-destino" name="taller_destino" class="buscar--box" style="width: 95%;" required>
              <option value="">-- Seleccione la Sucursal Destino --</option>
              <?php foreach ($talleres as $t): ?>
                <?php if ($t['id_taller'] != $id_mi_taller): ?>
                  <option value="<?php echo $t['id_taller']; ?>"><?php echo htmlspecialchars($t['nombre_t']); ?></option>
                <?php endif; ?>
              <?php endforeach; ?>
            </select>
          </div>

          <div style="margin-bottom: 20px;">
            <label style="font-weight: bold;">Buscar Producto a Transferir:</label>
            <div style="display: flex; gap: 10px;">
              <input type="search" id="buscador-producto-traspaso" class="buscar--box" style="flex: 1;" placeholder="Escribe el nombre o escanea el código..." autocomplete="off" oninput="this.value = this.value.replace(/[^a-zA-Z0-9\s.-]/g, '')">
              <button type="button" class="btn-procesar-erp" onclick="agregarProductoTraspaso()" style="background: #17a2b8;"><i class="fa-solid fa-plus"></i> Agregar</button>
            </div>
            <div id="sugerencias-traspaso" style="position: absolute; background: white; border: 1px solid #ccc; width: 40%; max-height: 200px; overflow-y: auto; display: none; z-index: 1000; box-shadow: 0 4px 6px rgba(0,0,0,0.1);"></div>
          </div>

            <div class="tabla-scroll">
              <table class="tbl" style="width: 100%; margin-bottom: 20px;">
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th style="width: 150px; text-align: center;">Stock Mi Taller</th>
                    <th style="width: 150px; text-align: center;">Cant. a Enviar</th>
                    <th style="width: 50px; text-align: center;">X</th>
                  </tr>
                </thead>
                <tbody id="cuerpo-carrito-traspaso">
                  <tr id="fila-vacia-traspaso">
                    <td colspan="4" style="text-align: center; color: #888; padding: 15px;">No hay productos a transferir. Busca y agrega uno.</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="contenedor-accion-final">
              <button type="submit" class="btn-procesar-erp" style="background-color: #28a745;">
                <i class="fa-solid fa-paper-plane"></i> Procesar Traspaso
              </button>
            </div>

          </form>
  </div>

  </div>
</div>