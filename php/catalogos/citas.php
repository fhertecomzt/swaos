<?php
if (session_status() === PHP_SESSION_NONE) {
  session_start();
}
include "../verificar_sesion.php";
?>
<div class="containerr" style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; padding: 2px 20px;">

  <div style="display: flex; align-items: center; gap: 15px;">
    <button class="boton" onclick="abrirModalNuevaCita()">
      <i class="fa-solid fa-calendar-plus"></i> Agendar Cita
    </button>

    <div style="display: flex; gap: 5px;">
      <button class="btn" style="background: #343a40; color: white; border: none; padding: 5px 12px; border-radius: 4px; cursor: pointer;" id="btn-prev-cita" title="Anterior"><i class="fa-solid fa-chevron-left"></i></button>
      <button class="btn" style="background: #343a40; color: white; border: none; padding: 5px 12px; border-radius: 4px; cursor: pointer;" id="btn-next-cita" title="Siguiente"><i class="fa-solid fa-chevron-right"></i></button>
      <button class="btn" style="background: #6c757d; color: white; border: none; padding: 5px 15px; border-radius: 4px; cursor: pointer; font-weight: bold;" id="btn-hoy-cita">Hoy</button>
    </div>
  </div>

  <h2 id="titulo-calendario" style="margin: 0; color: #007bff; font-size: 22px; text-transform: capitalize;">Cargando...</h2>

  <div style="display: flex; gap: 5px;">
    <button class="btn" style="background: #17a2b8; color: white; border: none; padding: 5px 15px; border-radius: 4px; cursor: pointer;" id="btn-mes-cita">Mes</button>
    <button class="btn" style="background: #17a2b8; color: white; border: none; padding: 5px 15px; border-radius: 4px; cursor: pointer;" id="btn-sem-cita">Semana</button>
    <button class="btn" style="background: #17a2b8; color: white; border: none; padding: 5px 15px; border-radius: 4px; cursor: pointer;" id="btn-dia-cita">Día</button>
    <button class="btn" style="background: #17a2b8; color: white; border: none; padding: 5px 15px; border-radius: 4px; cursor: pointer;" id="btn-lista-cita">Agenda</button>
  </div>

</div>

<div class="container_dashboard_tablas" style="padding: 40px; background: #fff; border-radius: 8px;">
  <h3>Lista de citas</h3>
  <div id="calendario-citas"></div>
</div>
<div id="crear-modalCita" class="modal" style="display: none; z-index: 1000; background-color: rgba(0,0,0,0.85);">
  <div class="modal-contentProductos" style="max-width: 600px; margin-top: 5%;">
    <span class="close" onclick="document.getElementById('crear-modalCita').style.display='none';">&times;</span>
    <h3 class="tittle"><i class="fa-solid fa-calendar-plus"></i> Agendar Nueva Cita</h3>

    <form id="form-crearCita" novalidate>

      <div class="form-group autocomplete-container" style="position: relative;">
        <label for="busqueda-cliente">Buscar Cliente: <span style="color:red;">*</span></label>
        <input type="text" id="busqueda-cliente" class="swal2-input" placeholder=" Escribe nombre o teléfono..." autocomplete="off" style="width: 100%; margin:0; padding-right: 30px;">
        <input type="hidden" name="id_cliente" id="id_cliente_seleccionado">
        <button type="button" id="limpiar-cliente" style="display: none; position: absolute; right: -4px; bottom: -7px; background: none; border: none; cursor: pointer; color: #dc3545; font-size: 16px;" title="Quitar cliente"><i class="fa-solid fa-times" style="pointer-events: none;"></i></button>
        <ul class="lista-autocomplete" style="display: none; position: absolute; z-index: 1000; background: white; border: 1px solid #ccc; width: 100%; max-height: 200px; overflow-y: auto; list-style: none; padding: 0; margin: 0; box-shadow: 0 4px 6px rgba(0,0,0,0.1);"></ul>
      </div>

      <div class="form-group" style="display: flex; gap: 15px;">
        <div style="flex: 1;">
          <label>Inicio de Cita: <span style="color:red;">*</span></label>
          <input type="datetime-local" name="fecha_inicio" id="cita-fecha-inicio" required style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;">
        </div>
        <div style="flex: 1;">
          <label>Fin de Cita: <span style="color:red;">*</span></label>
          <input type="datetime-local" name="fecha_fin" id="cita-fecha-fin" required style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;">
        </div>
      </div>

      <div class="form-group">
        <label>Tipo de Servicio: <span style="color:red;">*</span></label>
        <select name="tipo_cita" id="cita-tipo" required onchange="toggleDireccionCita()" style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;">
          <option value="">Seleccionar...</option>
          <option value="Taller"> Recepción en Taller</option>
          <option value="Domicilio"> Servicio a Domicilio / Empresa</option>
          <option value="Remoto"> Soporte Remoto (AnyDesk/TeamViewer)</option>
        </select>
      </div>

      <div class="form-group">
        <label>Asignar a Técnico: <span style="color:red;">*</span></label>
        <select name="id_tecnico" id="cita-tecnico" required style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;">
          <option value="">Seleccionar técnico...</option>
          <option value="1">Administrador (Yo)</option>
          <option value="2">Técnico Auxiliar (Juan)</option>
          <option value="3">Soporte Remoto (Ana)</option>
        </select>
      </div>

      <div class="form-group" id="div-direccion-cita" style="display: none;">
        <label>Dirección de Visita: <span style="color:red;">*</span></label>
        <input type="text" name="direccion_visita" id="cita-direccion" placeholder="Calle, Número, Colonia, Referencias..." style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;">
      </div>

      <div class="form-group">
        <label>Motivo de la cita / Falla reportada: <span style="color:red;">*</span></label>
        <textarea name="motivo" id="cita-motivo" rows="3" required style="width: 100%; border: 1px solid #ccc; border-radius: 4px; padding: 10px;"></textarea>
      </div>

      <div style="text-align: right; margin-top: 20px;">
        <button type="submit" class="boton-guardar" style="background-color: #28a745; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; font-weight: bold;"><i class="fa-solid fa-save"></i> Guardar Cita</button>
        <span class="cancelarModal" onclick="document.getElementById('crear-modalCita').style.display='none';" style="margin-left: 15px; cursor: pointer; color: #dc3545; font-weight: bold;">Cancelar</span>
      </div>
    </form>
  </div>
</div>