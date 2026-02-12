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

    <div class="card card-pendiente" data-id="pendientes" data-page="catalogos/1productos.php" style="background: linear-gradient(45deg, #f09819, #edde5d);">
      <div>
        <span class="card-numeros">0</span>
        <p><span class="card-nombre">Órdenes pendientes</span></p>
      </div>
      <div class="card-icono">
        <i class="fa-solid fa-boxes-stacked"></i>
      </div>
    </div>

    <div class="card" data-id="listas" data-page="catalogos/2productos.php" style="background: linear-gradient(45deg, #11998e, #38ef7d);">
      <div>
        <span class=" card-numeros">0</span>
        <p> <span class="card-nombre">Órdenes listas</span></p>
      </div>
      <div class="card-icono">
        <i class="fa-solid fa-boxes-stacked"></i>
      </div>
    </div>

    <div class="card" data-id="productos" data-page="catalogos/productos.php" style="background: linear-gradient(45deg, #2980b9, #6dd5fa);">
      <div>
        <span class=" card-numeros">0</span><br>
        <p><span class="card-nombre">Productos</span></p>
      </div>
      <div class="card-icono">
        <i class="fa-solid fa-boxes-stacked"></i>
      </div>
    </div>

    <div class="card" data-id="clientes" data-page="catalogos/clientes.php" style="background: linear-gradient(45deg, #373b44, #4286f4);">
      <div>
        <span class=" card-numeros">0</span>
        <p><span class="card-nombre">Clientes</span></p>
      </div>
      <div class="card-icono">
        <i class="fa-solid fa-people-group"></i>
      </div>
    </div>

    <div class="card" data-id="proveedores" data-page="catalogos/proveedores.php" style="background-color: #546e7a;;">
      <div>
        <span class=" card-numeros">0</span>
        <p><span class="card-nombre">Proveedores</span></p>
      </div>
      <div class="card-icono">
        <i class="fa-solid fa-people-group"></i>
      </div>
    </div>

    <div class="card" data-id="ventas" data-page="catalogos/productos.php" style="background-color: #00897b;">
      <div>
        <span class="card-numeros">0</span>
        <p><span class="card-nombre">Ventas</span></p>
      </div>
      <div class="card-icono">
        <i class="fa-solid fa-money-check-dollar"></i>
      </div>
    </div>

  </div><!--End Cards-->
</div><!--End Conteiner-->

</html>