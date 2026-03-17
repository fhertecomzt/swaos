<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}
include "../verificar_sesion.php";
require "../conexion.php"; // Agregamos la conexión

// OBTENEMOS LA TASA DE IVA DINÁMICA DESDE TU TABLA
$tasaIva = 16.00; // Respaldo por si falla
try {
    $stmtIva = $dbh->query("SELECT tasa FROM impuestos WHERE idimpuesto = 1 AND estatus = 0");
    if ($row = $stmtIva->fetch(PDO::FETCH_ASSOC)) {
        $tasaIva = floatval($row['tasa']);
    }
} catch (Exception $e) {
}
?>
<style>
    /* Diseño de las tarjetas de productos */
    .producto-card {
        border: 1px solid #dee2e6;
        border-radius: 8px;
        padding: 12px;
        cursor: pointer;
        text-align: center;
        background-color: #fff;
        transition: transform 0.2s, box-shadow 0.2s;
    }

    .producto-card:hover {
        transform: scale(1.03);
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
        border-color: #007bff;
    }

    .producto-card .prod-nombre {
        font-weight: 700;
        font-size: 14px;
        color: #343a40;
        margin-bottom: 8px;
    }

    .producto-card .prod-precio {
        color: #28a745;
        font-size: 18px;
        font-weight: bold;
    }

    .producto-card .prod-stock {
        font-size: 12px;
        color: #6c757d;
        margin-top: 8px;
    }

    /* Para el input del cliente readonly que no se vea feo */
    #cot-nombre-cliente[readonly] {
        background-color: #fff !important;
        cursor: not-allowed;
    }
</style>

<input type="hidden" id="tasa-iva-global" value="<?= $tasaIva ?>">

<div class="containerr">
    <h2>Generar Cotización / Proyecto</h2>
</div>

<div class="pos-container" style="display: flex; gap: 20px; padding: 15px;">

    <div class="pos-panel-izquierdo" style="flex: 6; background: #fff; padding: 15px; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">

        <div style="display: flex; gap: 10px; margin-bottom: 15px;">
            <input type="search" id="buscar-producto-cot" class="buscar--box" placeholder="Buscar refacción en inventario..." style="width: 100%; border: 2px solid #007bff; border-radius: 10px;">

            <button onclick=" agregarConceptoLibre()" class="btn" style="background-color: #ffc107; color: #000; font-weight: bold; white-space: nowrap; border-radius: 9px; padding: 10px">
                <i class="fa-solid fa-pen-to-square"></i> + Concepto Libre
            </button>
        </div>

        <div id="grid-productos-cot" class="grid-productos" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 15px; max-height: 65vh; overflow-y: auto;">
        </div>
    </div>

    <div class="pos-panel-derecho" style="flex: 4; background: #fff; padding: 15px; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); display: flex; flex-direction: column;">

        <div style="background: #f8f9fa; padding: 10px; border-radius: 5px; margin-bottom: 15px; border: 1px solid #ddd;">
            <label style="font-weight: bold; font-size: 14px; color: #555;">Cliente a cotizar:</label>
            <div style="display: flex; gap: 5px; margin-top: 5px;">
                <input type="hidden" id="cot-id-cliente" value="0">
                <input type="text" id="cot-nombre-cliente" class="swal2-input" readonly placeholder="Público en General" style="height: 35px; font-size: 14px; margin: 0; flex: 1; background: #e9ecef;">

                <button type="button" id="btn-buscar-cliente-cot" class="btn" style="background-color: #17a2b8; padding: 0 15px;" title="Buscar Cliente"><i class="fa-solid fa-magnifying-glass"></i></button>

                <button type="button" onclick="abrirModalClienteExpress()" class="btn" style="background-color: #28a745; padding: 0 15px;" title="Nuevo Cliente Exprés"><i class="fa-solid fa-user-plus"></i></button>

                <button type="button" id="btn-quitar-cliente-cot" class="btn" style="background-color: #dc3545; display: none; padding: 0 15px;" title="Quitar Cliente"><i class="fa-solid fa-xmark"></i></button>
            </div>
        </div>

        <div style="flex: 1; overflow-y: auto; border: 1px solid #ddd; border-radius: 5px; margin-bottom: 15px;">
            <table class="tbl" style="margin: 0; width: 100%;">
                <thead style="position: sticky; top: 0; background: #007bff; color: white;">
                    <tr>
                        <th style="padding: 10px;">Concepto</th>
                        <th style="padding: 10px; text-align: center;">Cant.</th>
                        <th style="padding: 10px; text-align: right;">Subt.</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody id="tabla-carrito-cot">
                </tbody>
            </table>
        </div>

        <div style="background: #e9ecef; padding: 15px; border-radius: 5px; text-align: right;">
            <h4 style="margin: 0; color: #555; font-size: 14px;">Total Artículos: <span id="cot-total-articulos">0</span></h4>
            <h4 style="margin: 5px 0 0 0; color: #555; font-size: 18px;">Subtotal: <span id="cot-subtotal">$0.00</span></h4>
            <h4 style="margin: 0 0 5px 0; color: #555; font-size: 18px;">IVA (<?= $tasaIva ?>%): <span id="cot-iva">$0.00</span></h4>
            <h1 style="margin: 5px 0 15px 0; color: #007bff; font-size: 35px;" id="cot-gran-total">$0.00</h1>

            <button id="btn-guardar-cot" class="btn" style="background-color: #28a745; width: 100%; font-size: 18px; padding: 12px; font-weight: bold; border-radius: 6px;">
                <i class=" fa-solid fa-floppy-disk"></i> GUARDAR COTIZACIÓN
            </button>
        </div>
    </div>
</div>