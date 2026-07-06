<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

$roles_permitidos = ["superusuario", "gerencia"];

require __DIR__ . '/../verificar_sesion.php'; // Actívalo si usas control de sesión en SWAOS
require __DIR__ . '/../conexion.php';
?>
<!DOCTYPE html>
<html lang="es">

<div class="container">
    <h2 class="page-title" style="color: #0094fd; border-bottom: 2px solid #0094fd; padding-bottom: 10px; margin-bottom: 20px;">
        <i class="fa-solid fa-chart-line"></i> Reportes y Estadísticas
    </h2>

    <div class="filtros-card" style="background: white; border-radius: 8px; padding: 20px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); margin-bottom: 20px; display: flex; flex-wrap: wrap; gap: 15px; align-items: flex-end; border-left: 5px solid #2c3e50;">
        <div class="filtro-grupo" style="display: flex; flex-direction: column; flex: 1; min-width: 200px;">
            <label for="tipo_reporte" style="font-weight: bold; font-size: 13px; color: #555; margin-bottom: 5px;">Tipo de Reporte:</label>
            <select id="tipo_reporte" style="padding: 10px; border: 1px solid #ccc; border-radius: 5px; height: 45px; font-size: 14px; min-width: 280px; outline: none;">
                <option value="ordenes">Órdenes de Servicio</option>
                <option value="ventas">Ventas Generales</option>
                <option value="inventario">Catálogo de Productos y Existencias</option>
                <option value="conteo">Conteo Físico de Inventario (Ciego)</option>
                <option value="caja">Corte de Caja</option>
            </select>
        </div>

        <div class="filtro-grupo" style="display: flex; flex-direction: column; flex: 1; min-width: 200px;">
            <label for="fecha_inicio" style="font-weight: bold; font-size: 13px; color: #555; margin-bottom: 5px;">Fecha Inicio:</label>
            <input type="date" id="fecha_inicio" value="<?php echo date('Y-m-01'); ?>" style="padding: 10px; border: 1px solid #ccc; border-radius: 5px;">
        </div>
        <div class="filtro-grupo" style="display: flex; flex-direction: column; flex: 1; min-width: 200px;">
            <label for="fecha_fin" style="font-weight: bold; font-size: 13px; color: #555; margin-bottom: 5px;">Fecha Fin:</label>
            <input type="date" id="fecha_fin" value="<?php echo date('Y-m-t'); ?>" style="padding: 10px; border: 1px solid #ccc; border-radius: 5px;">
        </div>

        <button class="btn-generar" id="btnGenerar" onclick="generarReporte()" style="background-color: #0094fd; color: white; border: none; padding: 10px 20px; border-radius: 5px; font-weight: bold; cursor: pointer; height: 40px;">
            <i class="fa-solid fa-bolt"></i> Generar Reporte
        </button>
    </div>

    <div class="kpi-grid" id="panel-kpis" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-bottom: 20px;">
        <div class="kpi-card" style="background: white; border-radius: 8px; padding: 20px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); display: flex; align-items: center; gap: 15px;">
            <i class="fa-solid fa-hashtag" style="font-size: 30px; color: #0094fd; opacity: 0.8;"></i>
            <div class="kpi-info">
                <h3 id="kpi_registros" style="margin: 0; font-size: 24px; color: #333;">0</h3>
                <p id="lbl_registros" style="margin: 0; font-size: 12px; color: #777; text-transform: uppercase; font-weight: bold;">Registros Encontrados</p>
            </div>
        </div>
        <div class="kpi-card" style="background: white; border-radius: 8px; padding: 20px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); display: flex; align-items: center; gap: 15px; border-left: 4px solid #28a745;">
            <i class="fa-solid fa-money-bill-wave" style="font-size: 30px; color: #28a745;"></i>
            <div class="kpi-info">
                <h3 id="kpi_total" style="margin: 0; font-size: 24px; color: #333;">$0.00</h3>
                <p id="lbl_total" style="margin: 0; font-size: 12px; color: #777; text-transform: uppercase; font-weight: bold;">Total Calculado</p>
            </div>
        </div>
    </div>

    <div class="tabla-card" style="background: white; border-radius: 8px; padding: 20px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); overflow-x: auto;">
        <div id="contenedor-tabla-reporte">
            <p style="text-align: center; color: #777; padding: 30px;">
                <i class="fa-solid fa-filter" style="font-size: 30px; margin-bottom: 10px; display: block;"></i>
                Selecciona un tipo de reporte y haz clic en "Generar Reporte".
            </p>
        </div>
    </div>
</div>

</body>

</html>