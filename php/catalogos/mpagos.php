<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

$roles_permitidos = ["supervisor", "gerencia"];

//Includes
include "../verificar_sesion.php";
include "../conexion.php";
include "../funciones/funciones.php";
include "../funciones/activoinactivo.php";

$mpagos = obtenerRegistros($dbh, "metodosdepago", "id_metpago, nombre_metpago, desc_metpago, estatus", "ASC", "id_metpago");
?>

<div class="containerr">
    <button class="boton" onclick="abrirModalMpago('crear-modalMpago')">Nuevo</button>
    <label class="buscarlabel" for="buscarboxmpago">Buscar:</label>
    <input class="buscar--box" id="buscarboxmpago" type="search" placeholder="Qué estas buscando?">

    <!-- Filtro de estatus -->
    <label class="buscarlabel" for="estatusFiltroMpago">Filtrar por Estatus:</label>
    <select class="buscar--box" id="estatusFiltroMpago" onchange="cargarMpagosFiltrados()" style="width: 100px;">
        <option value="">Todos</option>
        <option value="Activo">Activo</option>
        <option value="Inactivo">Inactivo</option>
    </select>

</div>

<div class="container_dashboard_tablas" id="mpagos">
    <h3>Lista de Métodos de pago</h3>
    <div id="scroll-containerMpag" style="height: 65vh; overflow-y: auto; position: relative;">

        <table class="tbl" id="tabla-mpagos">
            <thead>
                <tr>
                    <th>Método de pago</th>
                    <th>Descripción</th>
                    <th>Estatus</th>
                    <th colspan="2" style="text-align: center;">Acciones</th>
                </tr>
            </thead>
            <tbody id="mpagos-lista">
                <?php foreach ($mpagos as $u): ?>
                    <tr>
                        <td data-lable="Nombre:"><?php echo htmlspecialchars($u['nombre_metpago']); ?></td>
                        <td data-lable="Descripción:"><?php echo htmlspecialchars($u['desc_metpago']); ?></td>

                        <td data-lable="Estatus:"><button class="btn <?php echo ($u['estatus'] == 0) ? 'btn-success' : 'btn-danger'; ?>">
                                <?php echo ($u['estatus'] == 0) ? 'Activo' : 'Inactivo'; ?>
                            </button></td>

                        <td data-lable="Editar:">
                            <button title="Editar" class="editarMpago fa-solid fa-pen-to-square" data-id="<?php echo $u['id_metpago']; ?>"></button>
                        </td>
                        <td data-lable="Eliminar:">
                            <button title="Eliminar" class="eliminarMpago fa-solid fa-trash" data-id="<?php echo $u['id_metpago']; ?>"></button>
                        </td>
                    </tr>
                <?php endforeach; ?>
            </tbody>
        </table>
        <!-- Mensaje no encuentra resultados -->
        <p id="mensaje-vacio" class="mensajevacio" style="display: none; color: red;">No se encontraron resultados.</p>

        <!-- Modal para crear Mpago -->
        <div id="crear-modalMpago" class="modal" style="display: none;">
            <div class="modal-content" style="height: 269px;">
                <span title="Cerrar" class="close" onclick="cerrarModalMpago('crear-modalMpago')">&times;</span>
                <h2 class="tittle">Crear Método de pago</h2>
                <form id="form-crearMpago" onsubmit="validarFormularioMpago(event, 'crear')">

                    <div class="form-group">
                        <label for="crear-mpago">Nombre:</label>
                        <input type="text" id="crear-mpago" name="mpago" autocomplete="off"
                            pattern="[a-zA-ZÀ-ÿ\s]+"
                            title="Solo se permiten letras y espacios."
                            oninput="this.value = this.value.replace(/[^a-zA-ZÀ-ÿ\s]/g, '')" required>
                    </div>

                    <div class="form-group">
                        <label for="crear-desc_mpago">Descripción:</label>
                        <input type="text" id="crear-desc_mpago" name="desc_mpago" autocomplete="off" required>
                    </div>

                    <!-- Selección de Estatus -->
                    <div class="form-group">
                        <label for="estatus">Estatus:</label>
                        <select id="estatus" name="estatus">
                            <?php foreach ($options as $key => $text) { ?>
                                <option value="<?= $key ?>" <?= $key === $selected ? 'selected' : '' ?>><?= $text ?></option>
                            <?php } ?>
                        </select>
                    </div>

                    <button type="submit">Guardar</button>
                    <span class="cancelarModal" onclick="cerrarModalMpago('crear-modalMpago')" type=" submit">Cancelar</span>
                </form>
            </div>
        </div>

        <!-- Modal para editar Mpago -->
        <div id="editar-modalMpago" class="modal" style="display: none;">
            <div class="modal-content" style="height: 269px;">
                <span title="Cerrar" class="close" onclick="cerrarModalMpago('editar-modalMpago')">&times;</span>
                <h2 class="tittle">Editar Mpago</h2>
                <form id="form-editarMpago">
                    <input type="hidden" id="editar-idmpago" name="editar-idmpago" value="" />
                    
                    <div class="form-group">
                        <label for="editar-mpago">Nombre de la Mpago:</label>
                        <input type="text" id="editar-mpago" name="mpago" autocomplete="off"
                            pattern="[a-zA-ZÀ-ÿ\s]+"
                            title="Solo se permiten letras y espacios."
                            oninput="this.value = this.value.replace(/[^a-zA-ZÀ-ÿ\s]/g, '')" required>
                    </div>

                    <div class="form-group">
                        <label for="editar-desc_mpago">Descripción:</label>
                        <input type="text" id="editar-desc_mpago" name="desc_mpago" autocomplete="off" required>
                    </div>

                    <!-- Selección de Estatus -->
                    <div class="form-group">
                        <label for="editar-estatus">Estatus:</label>
                        <select id="editar-estatus" name="estatus">
                            <?php foreach ($options as $key => $text) { ?>
                                <option value="<?= $key ?>" <?= $key === $selected ? 'selected' : '' ?>><?= $text ?></option>
                            <?php } ?>
                        </select>
                    </div>

                    <button type="submit">Actualizar</button>
                    <span class="cancelarModal" onclick="cerrarModalMpago('editar-modalMpago')" type=" submit">Cancelar</span>
                </form>
            </div>
        </div>
    </div>
</div>