<?php

if (session_status() === PHP_SESSION_NONE) {
  session_start();
}

$roles_permitidos = ["superusuario", "gerencia"];

//Includes
include "verificar_sesion.php";

?>
<!DOCTYPE html>
<html lang="es">

<head>
</head>

<div class="container_dashboard" id="dashboard">
  <!--Cards-->
  <div class="cards" id="dashboard-cards">

    <div class="card card-pendiente" data-menu-link="ordenes-link" data-filtro="Recibido" style=" background: linear-gradient(45deg, #f09819, #edde5d); cursor: pointer;">
      <div>
        <span class="card-numeros" id="dash-pendientes">0</span>
        <p><span class="card-nombre">Órdenes pendientes</span></p>
      </div>
      <div class="card-icono">
        <i class="fa-solid fa-clock"></i>
      </div>
    </div>

    <div class="card" data-menu-link="ordenes-link" data-filtro="Terminado" style="background: linear-gradient(45deg, #11998e, #38ef7d); cursor: pointer;">
      <div>
        <span class="card-numeros" id="dash-listas">0</span>
        <p> <span class="card-nombre">Órdenes listas</span></p>
      </div>
      <div class="card-icono">
        <i class="fa-solid fa-check-double"></i>
      </div>
    </div>

    <div class="card" data-menu-link="productos-link" style="background: linear-gradient(45deg, #2980b9, #6dd5fa); cursor: pointer;">
      <div>
        <span class="card-numeros" id="dash-productos">0</span><br>
        <p><span class="card-nombre">Productos</span></p>
      </div>
      <div class="card-icono">
        <i class="fa-solid fa-boxes-stacked"></i>
      </div>
    </div>

    <div class="card" data-menu-link="clientes-link" style="background: linear-gradient(45deg, #373b44, #4286f4); cursor: pointer;">
      <div>
        <span class="card-numeros" id="dash-clientes">0</span>
        <p><span class="card-nombre">Clientes</span></p>
      </div>
      <div class="card-icono">
        <i class="fa-solid fa-people-group"></i>
      </div>
    </div>

    <div class="card" data-menu-link="proveedores-link" style="background-color: #546e7a; cursor: pointer;">
      <div>
        <span class="card-numeros" id="dash-proveedores">0</span>
        <p><span class="card-nombre">Proveedores</span></p>
      </div>
      <div class="card-icono">
        <i class="fa-solid fa-truck-fast"></i>
      </div>
    </div>

    <div class="card" data-menu-link="ventas-link" style="background-color: #00897b; cursor: pointer;">
      <div>
        <span class="card-numeros" id="dash-ventas">0</span>
        <p><span class="card-nombre">Ventas</span></p>
      </div>
      <div class="card-icono">
        <i class="fa-solid fa-money-check-dollar"></i>
      </div>
    </div>

  </div><!--End Cards-->
</div><!--End Conteiner-->

</html>