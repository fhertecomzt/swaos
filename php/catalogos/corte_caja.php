<style>
  .corte-container {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .corte-header {
    background: #fff;
    padding: 20px;
    border-radius: 10px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  /* Tarjetas de Resumen */
  .resumen-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 15px;
  }

  .card-dinero {
    background: #fff;
    padding: 20px;
    border-radius: 10px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
    text-align: center;
    border-bottom: 4px solid #ddd;
  }

  .card-dinero.efectivo {
    border-color: #28a745;
  }

  .card-dinero.tarjeta {
    border-color: #007bff;
  }

  .card-dinero.transferencia {
    border-color: #17a2b8;
  }

  .card-titulo {
    font-size: 14px;
    color: #666;
    font-weight: bold;
    text-transform: uppercase;
    margin-bottom: 10px;
  }

  .card-monto {
    font-size: 28px;
    font-weight: bold;
    color: #333;
  }

  /* Sección del Cuadre Físico */
  .cuadre-panel {
    background: #fff;
    padding: 30px;
    border-radius: 10px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .cuadre-panel h3 {
    margin-top: 0;
    color: #333;
  }

  .input-gigante {
    font-size: 30px;
    text-align: center;
    padding: 10px;
    width: 250px;
    border: 2px dashed #ccc;
    border-radius: 10px;
    margin: 20px 0;
    outline: none;
    transition: 0.3s;
  }

  .input-gigante:focus {
    border-color: #28a745;
    background: #f8fff9;
  }

  .resultado-cuadre {
    font-size: 20px;
    font-weight: bold;
    padding: 15px;
    border-radius: 8px;
    width: 100%;
    max-width: 400px;
    margin-bottom: 20px;
  }

  .cuadre-ok {
    background: #d4edda;
    color: #155724;
    border: 1px solid #c3e6cb;
  }

  .cuadre-falta {
    background: #f8d7da;
    color: #721c24;
    border: 1px solid #f5c6cb;
  }

  .cuadre-sobra {
    background: #fff3cd;
    color: #856404;
    border: 1px solid #ffeeba;
  }

  .btn-cerrar-caja {
    background: #dc3545;
    color: white;
    border: none;
    padding: 15px 30px;
    font-size: 18px;
    font-weight: bold;
    border-radius: 8px;
    cursor: pointer;
    transition: 0.2s;
  }

  .btn-cerrar-caja:hover {
    background: #c82333;
  }

  .btn-cerrar-caja:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
</style>

<div class="corte-container">

  <div class="corte-header">
    <div>
      <h2 style="margin: 0; color: #333;"><i class="fa-solid fa-cash-register"></i> Corte de Caja (Reporte Z)</h2>
      <p style="margin: 5px 0 0 0; color: #888;">Resumen de ingresos del turno actual</p>

    </div>
    <div style="margin-bottom: 20px; text-align: right;">
      <button type="button" class="btn btn-success" onclick="ingresarEfectivo()" style="background-color: #28a745; border-color: #28a745; color: white; padding: 10px 20px; border-radius: 5px; font-weight: bold; cursor: pointer; display: inline-flex; align-items: center; gap: 8px; font-size: 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        <i class="fa-solid fa-money-bill-trend-up"></i> Ingresar Efectivo
      </button>
    </div>
    <div style="text-align: right;">
      <strong style="font-size: 18px; color: #007bff;" id="corte-fecha-actual">Cargando fecha...</strong>
    </div>
  </div>

  <div class="resumen-grid">
    <div class="card-dinero efectivo">
      <div class="card-titulo"><i class="fa-solid fa-money-bill-wave"></i> Efectivo en Sistema</div>
      <div class="card-monto" id="corte-total-efectivo">$0.00</div>
    </div>
    <div class="card-dinero tarjeta">
      <div class="card-titulo"><i class="fa-solid fa-credit-card"></i> Tarjetas (TDD/TDC)</div>
      <div class="card-monto" id="corte-total-tarjeta">$0.00</div>
    </div>
    <div class="card-dinero transferencia">
      <div class="card-titulo"><i class="fa-solid fa-building-columns"></i> Transferencias</div>
      <div class="card-monto" id="corte-total-transferencia">$0.00</div>
    </div>
  </div>

  <div class="cuadre-panel">
    <h3>¿Cuánto Efectivo físico hay en el cajón?</h3>
    <p style="color: #666; margin-bottom: 0;">Cuenta los billetes y monedas e ingresa la cantidad exacta.</p>

    <input type="number" id="corte-efectivo-fisico" class="input-gigante" placeholder="$0.00" step="0.50" min="0">

    <div id="corte-mensaje-resultado" class="resultado-cuadre" style="display: none;">
      Esperando conteo...
    </div>

    <button id="btn-procesar-corte" class="btn-cerrar-caja" disabled>
      <i class="fa-solid fa-lock"></i> CERRAR TURNO E IMPRIMIR
    </button>
  </div>

</div>