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

$tipoequipos = obtenerRegistros($dbh, "equipos", "id_equipo, nombre_equipo, desc_equipo, estatus", "ASC", "id_equipo");
?>

<div class="containerr">
    <button class="boton" onclick="abrirModalTipoequipos('crear-modalTipoequipos')">Nuevo</button>

    <!-- Filtro de estatus -->
    <label class="buscarlabel" for="cantidad-registros" style="margin-left: auto;">Mostrar:</label>
    <select class="buscar--box" id="cantidad-registros" style="width: auto; margin-right: 15px; padding-right: 10px;">
        <option value="8">8</option>
        <option value="25">25</option>
        <option value="50">50</option>
        <option value="-1">Todos</option>
    </select>

    <label class="buscarlabel" for="buscarboxTipoequipos">Buscar:</label>
    <input class="buscar--box" id="buscarboxTipoequipos" type="search" placeholder="Qué estas buscando?" autocomplete="off">
</div>

<div class="container_dashboard_tablas" id="tipoequipos">
    <h3>Lista de tipos de equipos</h3>
    <div id="scroll-containerTipoequipos">
        <!-- Mostrar Tabla de registros -->
        <table class="tbl" id="tabla-tipoequipos">
            <thead>
                <tr>
                    <th>Tipo de equipo</th>
                    <th>Descripción</th>
                    <th>Estatus</th>
                    <th style="text-align: center;">Acciones</th>
                </tr>
            </thead>

            <tbody id="tipoequipos-lista">
                <?php foreach ($tipoequipos as $u): ?>
                    <tr>
                        <td data-lable="Nombre:"><?php echo htmlspecialchars($u['nombre_equipo']); ?></td>
                        <td data-lable="Descripción:"><?php echo htmlspecialchars($u['desc_equipo']); ?></td>
                        <td data-lable="Estatus:"><button class="btn <?php echo ($u['estatus'] == 0) ? 'btn-success' : 'btn-danger'; ?>">
                                <?php echo ($u['estatus'] == 0) ? 'Activo' : 'Inactivo'; ?>
                            </button></td>
                        <td data-lable="Acciones:">
                            <button title=" Editar" class="editarTipoequipo fa-solid fa-pen-to-square" data-id="<?php echo $u['id_equipo']; ?>"></button>

                            <button title=" Eliminar" class="eliminarTipoequipo fa-solid fa-trash" data-id="<?php echo $u['id_equipo']; ?>"></button>
                        </td>
                    </tr>
                <?php endforeach; ?>
            </tbody>
        </table>

        <!-- Mensaje no encuentra resultados -->
        <p id="mensaje-vacio" class="mensajevacio" style="display: none; color: red;">No se encontraron resultados.</p>

        <!-- Modal para crear Tipo de equipos -->
        <div id="crear-modalTipoequipos" class="modal" style="display: none;">
            <div class="modal-content" style="height: 269px;">
                <span title="Cerrar" class="close" onclick="cerrarModalTipoequipos('crear-modalTipoequipos')">&times;</span>
                <h2 class="tittle">Crear tipos de equipo</h2>
                <form id="form-crearTipoequipos" onsubmit="validarFormularioTipoequipos(event, 'crear')" novalidate>

                    <div class="form-group">
                        <label for="crear-tipoequipos">Nombre:</label>
                        <input type="text" id="crear-tipoequipos" name="tipoequipos" autocomplete="off"
                            pattern="[a-zA-ZÀ-ÿ\s]+"
                            title="Solo se permiten letras y espacios."
                            oninput="this.value = this.value.replace(/[^a-zA-ZÀ-ÿ\s]/g, '')" required>
                    </div>

                    <div class="form-group">
                        <label for="crear-desc_tipoequipos">Descripción:</label>
                        <input type="text" id="crear-desc_tipoequipos" name="desc_tipoequipos" autocomplete="off" required>
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
                    <span class="cancelarModal" onclick="cerrarModalTipoequipos('crear-modalTipoequipos')" type=" submit">Cancelar</span>
                </form>
            </div>
        </div>

        <!-- Modal para editar tipoequipos -->
        <div id="editar-modalTipoequipos" class="modal" style="display: none;">
            <div class="modal-content" style="height: 269px;">
                <span title="Cerrar" class="close" onclick="cerrarModalTipoequipos('editar-modalTipoequipos')">&times;</span>
                <h2 class="tittle">Editar tipo de equipos</h2>
                <form id="form-editarTipoequipo" novalidate>
                    <input type="hidden" id="editar-idtipoequipo" name="editar-idtipoequipo" value="" />
                    <div class="form-group">
                        <label for="editar-tipoequipo">Nombre:</label>
                        <input type="text" id="editar-tipoequipo" name="tipoequipo" autocomplete="off"
                            pattern="[a-zA-ZÀ-ÿ\s]+"
                            title="Solo se permiten letras y espacios."
                            oninput="this.value = this.value.replace(/[^a-zA-ZÀ-ÿ\s]/g, '')" required>
                    </div>
                    <div class="form-group">
                        <label for="editar-desc_equipo">Descripción:</label>
                        <input type="text" id="editar-desc_equipo" name="desc_equipo" autocomplete="off" required>
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
                    <span class="cancelarModal" onclick="cerrarModalTipoequipos('editar-modalTipoequipos')" type=" submit">Cancelar</span>
                </form>
            </div>
        </div>
    </div>
</div>