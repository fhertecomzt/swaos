<div class="containerr" style="height: auto; min-height: 60px; padding: 10px 20px; display: flex; flex-wrap: wrap; gap: 15px; align-items: flex-end; justify-content: space-between;">

  <div style="display: flex; gap: 15px; flex-wrap: wrap; align-items: flex-end; flex: 1;">
    <div class="form-group" style="width: auto; margin: 0; min-width: 130px;">
      <label>Fecha Inicio:</label>
      <input type="date" id="filtro-fecha-inicio" style="width: 70%;">
    </div>

    <div class="form-group" style="width: auto; margin: 0; min-width: 130px;">
      <label>Fecha Fin:</label>
      <input type="date" id="filtro-fecha-fin" style="width: 70%;">
    </div>

    <div class="form-group" style="width: auto; margin: 0; flex: 1; min-width: 180px;">
      <label>Buscar Folio / Cliente:</label>
      <input type="search" id="filtro-texto" placeholder="Ej. 33 o Nombre..." style="width: 60%;">
    </div>

    <button class="boton" onclick="cargarHistorial()" style="width: auto; height: 32px; padding: 0 15px; margin: 0; margin-bottom: 2px;">
      <i class="fa-solid fa-search"></i> Buscar
    </button>
  </div>

  <div style="display: flex; align-items: center; margin-bottom: 2px;">
    <label class="buscarlabel" for="cantidad-registros" style="margin: 0 10px 0 0; font-size: 15px;">Mostrar:</label>
    <select class="buscar--box" id="cantidad-registros" style="width: auto; margin: 0; height: 32px; padding: 0 10px;">
      <option value="8">8</option>
      <option value="25">25</option>
      <option value="50">50</option>
      <option value="-1">Todos</option>
    </select>
  </div>

</div>

<div class="container_dashboard_tablas" style="position: relative; top: 0; margin-top: 15px; height: auto;">
  <h3><i class="fa-solid fa-clock-rotate-left"></i> Historial de Ventas y Devoluciones</h3>

  <table id="tabla-historial-ventas" class="tbl" style="width: 100%;">
    <thead>
      <tr>
        <th>Folio</th>
        <th>Fecha y Hora</th>
        <th>Cliente</th>
        <th>Total</th>
        <th>Estatus</th>
        <th style="text-align: center;">Acciones</th>
      </tr>
    </thead>
    <tbody id="tabla-historial">
      <tr>
        <td colspan="6" style="text-align: center; color: #666;">Cargando historial...</td>
      </tr>
    </tbody>
  </table>
</div>