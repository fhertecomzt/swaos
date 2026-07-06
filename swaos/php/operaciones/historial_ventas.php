
<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

$roles_permitidos = ["superusuario", "gerencia"];

//Includes
include "../verificar_sesion.php";
?>
<div class="containerr" >

  <style>
    .ia-search-container {
      background: #ffffff;
      padding: 8px 10px 8px 20px;
      border-radius: 50px;
      box-shadow: 0 10px 25px rgba(99, 102, 241, 0.15);
      display: flex;
      gap: 15px;
      align-items: center;
      border: 1px solid #eef2ff;
      margin-bottom: 25px;
      transition: all 0.3s ease;
    }

    .ia-search-container:focus-within {
      box-shadow: 0 10px 30px rgba(99, 102, 241, 0.25);
      border-color: #c7d2fe;
    }

    .ia-icon-wrapper {
      background: #eff6ff;
      width: 35px;
      height: 35px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #6366f1;
    }

    .ia-input-text {
      flex: 1;
      border: none;
      outline: none;
      font-size: 15px;
      color: #334155;
      background: transparent;
      padding: 5px 0;
    }

    .ia-input-text::placeholder {
      color: #94a3b8;
    }

    .ia-btn-buscar {
      background: linear-gradient(135deg, #6366f1, #4f46e5);
      color: white;
      border: none;
      padding: 10px 24px;
      border-radius: 40px;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
      box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .ia-btn-buscar:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 15px rgba(99, 102, 241, 0.4);
    }

    .ia-btn-buscar:active {
      transform: translateY(0);
    }
  </style>

  <button onclick="abrirPopupIA()" class="boton" title="Preguntarle a la IA" style="background: linear-gradient(135deg, #6366f1, #4f46e5); color: white; border: none; border-radius: 5px; box-shadow: 0 4px 10px rgba(99, 102, 241, 0.3); transition: transform 0.2s; width: 46px;
    height: 31px;">
    <i class="fa-solid fa-wand-magic-sparkles"></i> IA
  </button>

  <div style="display: flex; gap: 15px; flex-wrap: wrap; align-items: flex-end; flex: 1;">
    <div class="form-group" style="width: auto; margin: 0; min-width: 130px;">
      <label>Fecha Inicio:</label>
      <input type="date" id="filtro-fecha-inicio" style="width: 70%;">
    </div>

    <div class="form-group" style="width: auto; margin: 0; min-width: 130px;">
      <label>Fecha Fin:</label>
      <input type="date" id="filtro-fecha-fin" style="width: 70%;">
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
    <div class="form-group" style="width: auto; margin: 0; flex: 1; min-width: 180px;">
      <label>Buscar Folio / Cliente:</label>
      <input type="search" id="filtro-texto" placeholder="Ej. 33 o Nombre..." style="width: 40%;" autocomplete="off">

      <button class="boton" onclick="cargarHistorial()" style="width: auto; height: 32px; padding: 0 15px; margin: 0; margin-bottom: 2px;">
        <i class="fa-solid fa-search"></i> Buscar
      </button>
    </div>
  </div>
</div>

<div class="container_dashboard_tablas">
  <h3><i class="fa-solid fa-clock-rotate-left"></i> Historial de Ventas y Devoluciones</h3>

  <table id="tabla-historial-ventas" class="tbl" style="width: 100%;">
    <thead>
      <tr>
        <th>Folio</th>
        <th>Fecha y Hora</th>
        <th>Nombre</th>
        <th>Apellido</th>
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