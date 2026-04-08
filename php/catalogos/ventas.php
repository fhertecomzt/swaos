<?php
if (session_status() === PHP_SESSION_NONE) {
  session_start();
}

$roles_permitidos = ["superusuario", "gerencia"];

//Includes
include "../verificar_sesion.php";
?>

<style>
  /* ESTILOS DEL PUNTO DE VENTA (POS)          */
  .pos-container {
    display: grid;
    grid-template-columns: 6fr 4fr;
    gap: 20px;
    /* Usamos 75vh para que ocupe el 75% del alto de la pantalla, sin importar el monitor */
    height: 75vh;
    min-height: 500px;
    /* Un tamaño mínimo para que no se aplaste en laptops chiquitas */
  }

  @media (max-width: 992px) {
    .pos-container {
      grid-template-columns: 1fr;
      /* En celulares se pone uno debajo del otro */
      height: auto;
    }
  }

  .pos-panel {
    background: #fff;
    border-radius: 10px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
    padding: 20px;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  /* --- LADO IZQUIERDO: PRODUCTOS --- */
  .pos-search {
    margin-bottom: 15px;
    position: relative;
  }

  .pos-search input {
    width: 100%;
    padding: 12px 12px 12px 40px;
    border: 1px solid #ddd;
    border-radius: 8px;
    font-size: 16px;
  }

  .pos-search i {
    position: absolute;
    left: 15px;
    top: 15px;
    color: #999;
  }

  .productos-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 15px;
    overflow-y: auto;
    padding-right: 5px;
  }

  .producto-card {
    border: 1px solid #eee;
    border-radius: 8px;
    padding: 15px;
    text-align: center;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    background: #fafafa;
  }

  .producto-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
    border-color: #007bff;
    background: #fff;
  }

  .prod-nombre {
    font-weight: 600;
    color: #333;
    margin-bottom: 5px;
    font-size: 14px;
    line-height: 1.2;
  }

  .prod-precio {
    color: #28a745;
    font-weight: bold;
    font-size: 16px;
  }

  .prod-stock {
    font-size: 12px;
    color: #888;
    margin-top: 5px;
  }

  /* --- LADO DERECHO: CARRITO --- */
  .carrito-table-container {
    flex-grow: 1;
    overflow-y: auto;
    margin-bottom: 15px;
  }

  .carrito-table {
    width: 100%;
    border-collapse: collapse;
  }

  .carrito-table th,
  .carrito-table td {
    padding: 10px;
    text-align: left;
    border-bottom: 1px solid #eee;
  }

  .carrito-table th {
    background: #f8f9fa;
    font-weight: 600;
    color: #555;
    position: sticky;
    top: 0;
    z-index: 1;
  }

  .btn-qty {
    background: #eee;
    border: none;
    padding: 2px 8px;
    border-radius: 4px;
    cursor: pointer;
    font-weight: bold;
  }

  .btn-qty:hover {
    background: #ddd;
  }

  .btn-remove {
    color: #dc3545;
    background: none;
    border: none;
    cursor: pointer;
    font-size: 16px;
  }

  /* --- TOTALES Y COBRO --- */
  .pos-totales {
    background: #f8f9fa;
    padding: 15px;
    border-radius: 8px;
  }

  .total-row {
    display: flex;
    justify-content: space-between;
    font-size: 16px;
    margin-bottom: 5px;
    color: #555;
  }

  .total-row.gran-total {
    font-size: 24px;
    font-weight: bold;
    color: #28a745;
    border-top: 2px solid #ddd;
    padding-top: 10px;
    margin-bottom: 15px;
  }

  .metodo-pago-select {
    width: 100%;
    padding: 5px;
    border-radius: 8px;
    border: 1px solid #ddd;
    margin-bottom: 15px;
    font-size: 16px;
  }

  .btn-cobrar {
    width: 100%;
    padding: 15px;
    font-size: 18px;
    font-weight: bold;
    background: #28a745;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: background 0.2s;
  }

  .btn-cobrar:hover {
    background: #218838;
  }

  .btn-cobrar:disabled {
    background: #ccc;
    cursor: not-allowed;
  }

  /* Modo Oscuro (Si lo tienes configurado) */
  .darkmode .pos-panel {
    background: #2c3034;
    border-color: #444;
  }

  .darkmode .pos-search input,
  .darkmode .metodo-pago-select {
    background: #3a3f48;
    border-color: #555;
    color: #fff;
  }

  .darkmode .producto-card {
    border-color: #444;
    background: #3a3f48;
  }

  .darkmode .producto-card:hover {
    border-color: #007bff;
    background: #2c3034;
  }

  .darkmode .prod-nombre {
    color: #eee;
  }

  .darkmode .carrito-table th {
    background: #3a3f48;
    color: #ccc;
    border-bottom-color: #555;
  }

  .darkmode .carrito-table td {
    border-bottom-color: #444;
    color: #eee;
  }

  .darkmode .pos-totales {
    background: #3a3f48;
  }

  .darkmode .btn-qty {
    background: #555;
    color: white;
  }

</style>

<div class="pos-header" style="background: #fff; padding: 15px 20px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 15px;">

  <div style="display: flex; flex-direction: column;">
    <h2 style="margin: 0; color: #333;"><i class="fa-solid fa-cash-register"></i> Punto de Venta</h2>
    <p style="margin: 5px 0 0 0; color: #888; font-size: 14px;">Venta rápida de mostrador</p>
  </div>

  <div id="pos-cliente-container" style="display: flex; gap: 5px; align-items: center; background: #f8f9fa; padding: 5px 10px; border-radius: 8px; border: 1px solid #ddd;">
    <i class="fa-solid fa-user" style="color: #888;"></i>
    <input type="text" id="pos-nombre-cliente" placeholder="Público en General" readonly style="border: none; background: transparent; width: 150px; outline: none; font-weight: bold; color: #333; font-size: 14px;">
    <input type="hidden" id="pos-id-cliente" value="0">

    <button id="btn-buscar-cliente-pos" style="background: #007bff; color: white; border: none; padding: 5px 8px; border-radius: 4px; cursor: pointer; margin-left: 5px;" title="Buscar / Cambiar Cliente">
      <i class="fa-solid fa-magnifying-glass"></i>
    </button>

    <button type="button" class="btn" style="background-color: #28a745; color: white; padding: 5px 10px; border-radius: 4px; cursor: pointer; border: none; margin-left: 5px;" onclick="abrirModalClienteExpress()" title="Alta Rápida de Cliente">
      <i class="fa-solid fa-user-plus"></i>
    </button>

    <button id="btn-quitar-cliente-pos" style="background: #dc3545; color: white; border: none; padding: 5px 8px; border-radius: 4px; cursor: pointer; display: none;" title="Regresar a Público en General">
      <i class="fa-solid fa-xmark"></i>
    </button>
  </div>

  <button id="btn-retiro-caja-pos" style="padding: 10px 15px; border: 1px solid #dc3545; background: #fff; border-radius: 8px; cursor: pointer; font-weight: bold; color: #dc3545; transition: 0.2s; margin-right: 10px;" title="Sacar dinero para gastos">
    <i class="fa-solid fa-money-bill-transfer"></i> Retiro de Caja
  </button>

  <button id="btn-reimprimir-pos" style="padding: 10px 15px; border: 1px solid #ddd; background: #f8f9fa; border-radius: 8px; cursor: pointer; font-weight: bold; color: #555; transition: 0.2s;">
    <i class="fa-solid fa-print"></i> Reimprimir Último
  </button>
</div>

</div>

<div class="pos-container">

  <div class="pos-panel">
    <div class="pos-search">
      <i class="fa-solid fa-barcode"></i>
      <input type="search" id="buscar-producto-pos" placeholder="Buscar producto por nombre o código..." autocomplete="off">
    </div>

    <div class="productos-grid" id="grid-productos-pos">
      <div style="grid-column: 1 / -1; text-align: center; padding: 20px; color: #888;">
        Cargando inventario...
      </div>
    </div>
  </div>

  <div class="pos-panel">
    <h3 style="margin-top: 0; border-bottom: 2px solid #eee; padding-bottom: 10px; color: #007bff;">
      <i class="fa-solid fa-cart-shopping"></i> Ticket de Venta
    </h3>

    <div class="carrito-table-container">
      <table class="carrito-table">
        <thead>
          <tr>
            <th>Producto</th>
            <th style="text-align: center;">Cant.</th>
            <th style="text-align: right;">Importe</th>
            <th></th>
          </tr>
        </thead>
        <tbody id="tabla-carrito-pos">
          <tr>
            <td colspan="4" style="text-align: center; color: #999; padding: 30px 10px;">
              El carrito está vacío. <br> Selecciona productos de la izquierda.
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="pos-totales">
      <div class="total-row">
        <span>Artículos:</span>
        <span id="pos-total-articulos">0</span>
      </div>
      <div class="total-row gran-total">
        <span>TOTAL:</span>
        <span id="pos-gran-total">$0.00</span>
      </div>

      <select id="pos-metodo-pago" class="metodo-pago-select">
        <option value="Efectivo">💵 Efectivo</option>
        <option value="Tarjeta">💳 Tarjeta (TDD/TDC)</option>
        <option value="Transferencia">🏦 Transferencia</option>
      </select>

      <button id="pos-btn-cobrar" class="btn-cobrar" disabled>
        <i class="fa-solid fa-check-circle"></i> COBRAR
      </button>
    </div>
  </div>

</div>