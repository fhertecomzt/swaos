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
  <div class="cards">
    
    <div class="card" data-page="catalogos/productos.php">
      <div>
        <span class="card-numeros">10</span>
        <span class="card-nombre">ÓRDENES PENDIENTES</span>
      </div>
      <div class="card-icono">
        <i class="fa-solid fa-boxes-stacked"></i>
      </div>
    </div>
    
    <div class="card" data-page="catalogos/productos.php">
      <div>
        <span class="card-numeros">3</span>
        <span class="card-nombre">ÓRDENES LISTAS</span>
      </div>
      <div class="card-icono">
        <i class="fa-solid fa-boxes-stacked"></i>
      </div>
    </div>

    <div class="card" data-page="catalogos/productos.php">
      <div>
        <span class="card-numeros">0</span><br>
        <span class="card-nombre">Productos</span>
      </div>
      <div class="card-icono">
        <i class="fa-solid fa-boxes-stacked"></i>
      </div>
    </div>
    
    <div class="card" data-page="catalogos/clientes.php">
      <div>
        <span class=" card-numeros">0</span>
        <span class="card-nombre">Clientes</span>
      </div>
      <div class="card-icono">
        <i class="fa-solid fa-people-group"></i>
      </div>
    </div>

    <div class="card" data-page="catalogos/proveedores.php">
      <div>
        <span class=" card-numeros">0</span>
        <span class="card-nombre">Proveedores</span>
      </div>
      <div class="card-icono">
        <i class="fa-solid fa-people-group"></i>
      </div>
    </div>

    <div class="card">
      <div>
        <span class="card-numeros">3,500</span>
        <span class="card-nombre">Ventas</span>
      </div>
      <div class="card-icono">
        <i class="fa-solid fa-money-check-dollar"></i>
      </div>
    </div>

  </div><!--End Cards-->
</div><!--End Conteiner-->

</html>