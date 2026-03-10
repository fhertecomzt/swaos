<?php
if (session_status() === PHP_SESSION_NONE) {
  session_start();
}
$roles_permitidos = ["superusuario", "gerencia"];
include "verificar_sesion.php";
?>

<div class="container_dashboard" id="dashboard">

  <div class="cards" id="dashboard-cards">
      <div class="card card-minimal" data-menu-link="ordenes-link" data-filtro="Pendientes">
        <div>
          <span class="card-numeros" id="dash-pendientes">0</span>
          <p><span class="card-nombre">Órdenes pendientes</span></p>
        </div>
        <div class="card-icono text-warning"><i class="fa-solid fa-clock"></i></div>
      </div>
      <div class="card card-minimal" data-menu-link="ordenes-link" data-filtro="Terminado">
        <div>
          <span class="card-numeros" id="dash-listas">0</span>
          <p><span class="card-nombre">Órdenes listas</span></p>
        </div>
        <div class="card-icono text-success"><i class="fa-solid fa-check-double"></i></div>
      </div>
      <div class="card card-minimal" data-menu-link="productos-link">
        <div>
          <span class="card-numeros" id="dash-productos">0</span>
          <p><span class="card-nombre">Productos</span></p>
        </div>
        <div class="card-icono text-info"><i class="fa-solid fa-boxes-stacked"></i></div>
      </div>
      <div class="card card-minimal" data-menu-link="clientes-link">
        <div>
          <span class="card-numeros" id="dash-clientes">0</span>
          <p><span class="card-nombre">Clientes</span></p>
        </div>
        <div class="card-icono text-primary"><i class="fa-solid fa-people-group"></i></div>
      </div>
      <div class="card card-minimal" data-menu-link="proveedores-link">
        <div>
          <span class="card-numeros" id="dash-proveedores">0</span>
          <p><span class="card-nombre">Proveedores</span></p>
        </div>
        <div class="card-icono text-secondary"><i class="fa-solid fa-truck-fast"></i></div>
      </div>
      <div class="card card-minimal" data-menu-link="ventas-link">
        <div>
          <span class="card-numeros" id="dash-ventas">0</span>
          <p><span class="card-nombre">Ventas</span></p>
        </div>
        <div class="card-icono text-teal"><i class="fa-solid fa-money-check-dollar"></i></div>
      </div>
    </div>

    <div class="command-center">

      <div class="panel-grafica">
        <h3 class="panel-title">Estado de los Equipos</h3>
        <div class="canvas-container">
          <canvas id="miGraficaEquipos"></canvas>
        </div>
      </div>

      <div class="panel-acciones">
        <h3 class="panel-title">Acciones Rápidas</h3>
        <div class="botones-accion">
          <button class="btn-accion btn-nueva-orden" data-menu-link="ordenes-link">
            <i class="fa-solid fa-plus"></i> Nueva Orden
          </button>

          <button class="btn-accion btn-nuevo-cliente" data-menu-link="clientes-link">
            <i class="fa-solid fa-user-plus"></i> Nuevo Cliente
          </button>

          <button class="btn-accion btn-cobrar" data-menu-link="ventas-link">
            <i class="fa-solid fa-cash-register"></i> Cobrar / Vender
          </button>
        </div>
      </div>

      <div class="panel-tabla">
        <h3 class="panel-title">Órdenes Recientes</h3>
        <div class="tabla-responsive">
          <table class="tabla-moderna">
            <thead>
              <tr>
                <th>Folio</th>
                <th>Cliente</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody id="tabla-ultimas-ordenes">
              <tr>
                <td colspan="3" style="text-align:center;">Cargando...</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  </div>