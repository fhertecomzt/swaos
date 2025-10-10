<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

$roles_permitidos = ["superusuario", "gerencia"];

//Includes
include "../verificar_sesion.php";
include "../conexion.php";
include "../funciones/funciones.php";
include "../funciones/activoinactivo.php";

$tiposervicios = obtenerRegistros($dbh, "tiposervicios", "id_servicio, nom_servicio, desc_servicio, estatus", "ASC", "id_servicio");
?>

<div class="containerr">
    <button class="boton" onclick="abrirModalTiposervicios('crear-modalTiposervicios')">Nuevo</button>
    <label class="buscarlabel" for="buscarboxTiposervicios">Buscar:</label>
    <input class="buscar--box" id="buscarboxTiposervicios" type="search" placeholder="Qué estas buscando?" autocomplete="off">

    <!-- Filtro de estatus -->
    <label class="buscarlabel" for="estatusFiltroTiposervicios">Filtrar por Estatus:</label>
    <select class="buscar--box" id="estatusFiltroTiposervicios" onchange="cargarTiposerviciosFiltrados()" style="width: 100px;">
        <option value="">Todos</option>
        <option value="Activo">Activo</option>
        <option value="Inactivo">Inactivo</option>
    </select>
</div>

<div class="container_dashboard_tablas" id="tiposervicios">
    <h3>Lista de Tipos de servicios</h3>
    <div id="scroll-containerTiposervicios" style="height: 65vh; overflow-y: auto; position: relative;">
        <!-- Mostrar Tabla de registros -->
        <table class="tbl" id="tabla-tiposervicios">
            <thead>
                <tr>
                    <th>Tipo de servicio</th>
                    <th>Descripción</th>
                    <th>Estatus</th>
                    <th colspan="2" style="text-align: center;">Acciones</th>
                </tr>
            </thead>

            <tbody id="tiposervicios-lista">
                <?php foreach ($tiposervicios as $u): ?>
                    <tr>
                        <td data-lable="Nombre:"><?php echo htmlspecialchars($u['nom_servicio']); ?></td>
                        <td data-lable="Descripción:"><?php echo htmlspecialchars($u['desc_servicio']); ?></td>
                        <td data-lable="Estatus:"><button class="btn <?php echo ($u['estatus'] == 0) ? 'btn-success' : 'btn-danger'; ?>">
                                <?php echo ($u['estatus'] == 0) ? 'Activo' : 'Inactivo'; ?>
                            </button></td>
                        <td data-lable="Editar:">
                            <button title=" Editar" class="editarTiposervicio fa-solid fa-pen-to-square" data-id="<?php echo $u['id_servicio']; ?>"></button>
                        </td>
                        <td data-lable="Eliminar:">
                            <button title=" Eliminar" class="eliminarTiposervicio fa-solid fa-trash" data-id="<?php echo $u['id_servicio']; ?>"></button>
                        </td>
                    </tr>
                <?php endforeach; ?>
            </tbody>
        </table>

        <!-- Mensaje no encuentra resultados -->
        <p id="mensaje-vacio" class="mensajevacio" style="display: none; color: red;">No se encontraron resultados.</p>

        <!-- Modal para crear Tipo de servicios -->
        <div id="crear-modalTiposervicios" class="modal" style="display: none;">
            <div class="modal-content" style="height: 269px;">
                <span title="Cerrar" class="close" onclick="cerrarModalTiposervicios('crear-modalTiposervicios')">&times;</span>
                <h2 class="tittle">Crear Tipos de servicio</h2>
                <form id="form-crearTiposervicios" onsubmit="validarFormulariotiposervicios(event, 'crear')">

                    <div class="form-group">
                        <label for="crear-tiposervicios">Nombre:</label>
                        <input type="text" id="crear-tiposervicios" name="tiposervicios" autocomplete="off"
                            pattern="[a-zA-ZÀ-ÿ\s]+"
                            title="Solo se permiten letras y espacios."
                            oninput="this.value = this.value.replace(/[^a-zA-ZÀ-ÿ\s]/g, '')" required>
                    </div>

                    <div class="form-group">
                        <label for="crear-desc_tiposervicios">Descripción:</label>
                        <input type="text" id="crear-desc_tiposervicios" name="desc_tiposervicios" autocomplete="off" required>
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
                    <span class="cancelarModal" onclick="cerrarModalTiposervicios('crear-modalTiposervicios')" type=" submit">Cancelar</span>
                </form>
            </div>
        </div>

        <!-- Modal para editar tiposervicios -->
        <div id="editar-modalTiposervicio" class="modal" style="display: none;">
            <div class="modal-content" style="height: 269px;">
                <span title="Cerrar" class="close" onclick="cerrarModalTiposervicios('editar-modalTiposervicio')">&times;</span>
                <h2 class="tittle">Editar Tipo de servicio</h2>
                <form id="form-editarTiposervicio">
                    <input type="hidden" id="editar-idtiposervicio" name="editar-idtiposervicio" value="" />
                    <div class="form-group">
                        <label for="editar-tiposervicio">Nombre:</label>
                        <input type="text" id="editar-tiposervicio" name="tiposervicio" autocomplete="off"
                            pattern="[a-zA-ZÀ-ÿ\s]+"
                            title="Solo se permiten letras y espacios."
                            oninput="this.value = this.value.replace(/[^a-zA-ZÀ-ÿ\s]/g, '')" required>
                    </div>
                    <div class="form-group">
                        <label for="editar-desc_servicio">Descripción:</label>
                        <input type="text" id="editar-desc_servicio" name="desc_servicio" autocomplete="off" required>
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
                    <span class="cancelarModal" onclick="cerrarModalTiposervicios('editar-modalTiposervicio')" type=" submit">Cancelar</span>
                </form>
            </div>
        </div>
    </div>
</div>