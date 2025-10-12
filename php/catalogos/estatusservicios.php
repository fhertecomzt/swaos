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

$estadosservicios = obtenerRegistros($dbh, "estadosservicios", "id_estado_servicio, estado_servicio, desc_estado_servicio, estatus", "ASC", "id_estado_servicio");
?>

<div class="containerr">
    <button class="boton" onclick="abrirModalEstadoservicio('crear-modalEstadoservicio')">Nuevo</button>
    <label class="buscarlabel" for="buscarboxEstadoservicios">Buscar:</label>
    <input class="buscar--box" id="buscarboxEstadoservicios" type="search" placeholder="Qué estas buscando?" autocomplete="off">

    <!-- Filtro de estatus -->
    <label class="buscarlabel" for="estatusFiltroEstadoservicios">Filtrar por Estatus:</label>
    <select class="buscar--box" id="estatusFiltroEstadoservicios" onchange="cargarestadoserviciosFiltrados()" style="width: 100px;">
        <option value="">Todos</option>
        <option value="Activo">Activo</option>
        <option value="Inactivo">Inactivo</option>
    </select>
</div>

<div class="container_dashboard_tablas" id="estadoservicio">
    <h3>Lista de Estados de servicio</h3>
    <div id="scroll-containerEstadoservicios" style="height: 65vh; overflow-y: auto; position: relative;">
        <table class="tbl" id="tabla-estadoservicio">
            <thead>
                <tr>
                    <th>Estados de servicio</th>
                    <th>Descripción</th>
                    <th>Estatus</th>
                    <th colspan="2" style="text-align: center;">Acciones</th>
                </tr>
            </thead>
            <tbody id="estadoservicios-lista">
                <?php foreach ($estadosservicios as $u): ?>
                    <tr>
                        <td data-lable="Nombre:"><?php echo htmlspecialchars($u['estado_servicio']); ?></td>
                        <td data-lable="Descripción:"><?php echo htmlspecialchars($u['desc_estado_servicio']); ?></td>
                        <td data-lable="Estatus:"><button class="btn <?php echo ($u['estatus'] == 0) ? 'btn-success' : 'btn-danger'; ?>">
                                <?php echo ($u['estatus'] == 0) ? 'Activo' : 'Inactivo'; ?>
                            </button></td>
                        <td data-lable="Editar:">
                            <button title="Editar" class="editarEstadoservicio fa-solid fa-pen-to-square" data-id="<?php echo $u['id_estado_servicio']; ?>"></button>
                        </td>
                        <td data-lable="Eliminar:">
                            <button title="Eliminar" class="eliminarEstadoservicio fa-solid fa-trash" data-id="<?php echo $u['id_estado_servicio']; ?>"></button>
                        </td>
                    </tr>
                <?php endforeach; ?>
            </tbody>
        </table>
        <!-- Mensaje no encuentra resultados -->
        <p id="mensaje-vacio" class="mensajevacio" style="display: none; color: red;">No se encontraron resultados.</p>

        <!-- Modal para crear Estadoservicio -->
        <div id="crear-modalEstadoservicio" class="modal" style="display: none;">
            <div class="modal-content" style="height: 269px;">
                <span title="Cerrar" class="close" onclick="cerrarModalEstadoservicio('crear-modalEstadoservicio')">&times;</span>
                <h2 class="tittle">Crear Estado de servicio</h2>

                <form id="form-crearEstadoservicio" onsubmit="validarFormularioEstadoservicio(event, 'crear')">
                    <div class="form-group">
                        <label for="crear-estadoservicio">Nombre:</label>
                        <input type="text" id="crear-estadoservicio" name="estadoservicio" autocomplete="off"
                            pattern="[a-zA-ZÀ-ÿ\s]+"
                            title="Solo se permiten letras y espacios."
                            oninput="this.value = this.value.replace(/[^a-zA-ZÀ-ÿ\s]/g, '')" required>
                    </div>

                    <div class="form-group">
                        <label for="crear-desc_estadoservicio">Descripción:</label>
                        <input type="text" id="crear-desc_estadoservicio" name="desc_estadoservicio" autocomplete="off" required>
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
                    <span class="cancelarModal" onclick="cerrarModalEstadoservicio('crear-modalEstadoservicio')" type=" submit">Cancelar</span>
                </form>
            </div>
        </div>

        <!-- Modal para editar Estadoservicio -->
        <div id="editar-modalEstadoservicio" class="modal" style="display: none;">
            <div class="modal-content" style="height: 269px;">
                <span title="Cerrar" class="close" onclick="cerrarModalEstadoservicio('editar-modalEstadoservicio')">&times;</span>
                <h2 class="tittle">Editar Estado de servicio</h2>
                <form id="form-editarEstadoservicio">
                    <input type="hidden" id="editar-idestadoservicio" name="editar-idestadoservicio" value="" />
                    <div class="form-group">
                        <label for="editar-estadoservicio">Nombre del estado de servicio:</label>
                        <input type="text" id="editar-estadoservicio" name="estadoservicio" autocomplete="off"
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
                    <span class="cancelarModal" onclick="cerrarModalEstadoservicio('editar-modalEstadoservicio')" type=" submit">Cancelar</
                            </form>
            </div>
        </div>
    </div>
</div>