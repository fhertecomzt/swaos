<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

$roles_permitidos = ["superusuario", "gerencia"];

//Includes
include "verificar_sesion.php";
include "conexion.php";
include "funciones/funciones.php";
include "funciones/activoinactivo.php";

$roles = obtenerRegistros($dbh, "roles", "id_rol, nom_rol, desc_rol, estatus_rol", "ASC", "id_rol");
?>

<div class="containerr">
    <button class="boton" onclick="abrirModalRol('crear-modalRol')">Nuevo</button>

    <!-- Filtro de estatus -->
    <label class="buscarlabel" for="cantidad-registros" style="margin-left: auto;">Mostrar:</label>
    <select class="buscar--box" id="cantidad-registros" style="width: auto; margin-right: 15px; padding-right: 10px;">
        <option value="8">8</option>
        <option value="25">25</option>
        <option value="50">50</option>
        <option value="-1">Todos</option>
    </select>
    <label class="buscarlabel" for="buscarboxrol">Buscar:</label>
    <input class="buscar--box" id="buscarboxrol" type="search" placeholder="Qué estas buscando?" autocomplete="off">
</div>

<div class="container_dashboard_tablas" id="roles">
    <h3>Lista de Roles</h3>
    <div id="scroll-containerR">

        <table class="tbl" id="tabla-roles">
            <thead>
                <tr>
                    <th>Rol</th>
                    <th>Descripción</th>
                    <th>Estatus</th>
                    <th style="text-align: center;">Acciones</th>
                </tr>
            </thead>

            <tbody id="roles-lista">
                <?php foreach ($roles as $u): ?>
                    <tr>
                        <td data-lable="Nombre:"><?php echo htmlspecialchars($u['nom_rol']); ?></td>
                        <td data-lable="Descripción:"><?php echo htmlspecialchars($u['desc_rol']); ?></td>
                        <td data-lable="Estatus:">
                            <button class="btn <?php echo ($u['estatus_rol'] == 0) ? 'btn-success' : 'btn-danger'; ?>">
                                <?php echo ($u['estatus_rol'] == 0) ? 'Activo' : 'Inactivo'; ?>
                            </button>
                        </td>
                        <td data-lable="Acciones:">
                            <button title="Editar" class="editarRol fa-solid fa-pen-to-square" data-id="<?php echo $u['id_rol']; ?>"></button>

                            <button title="Eliminar" class="eliminarRol fa-solid fa-trash" data-id="<?php echo $u['id_rol']; ?>"></button>
                        </td>
                    </tr>

                <?php endforeach; ?>
            </tbody>
        </table>

        <!-- Mensaje no encuentra resultados -->
        <p class="mensajevacio" id="mensaje-vacio" style="display: none; color: red;">No se encontraron resultados.</p>

        <!-- Modal para crear Rol -->
        <div id="crear-modalRol" class="modal" style="display: none;">
            <div class="modal-content" style="height: 269px;">
                <span title="Cerrar" class="close" onclick="cerrarModalRol('crear-modalRol')">&times;</span>
                <h2 class="tittle">Crear Rol</h2>
                <form id="form-crearRol" onsubmit="validarFormularioRol(event)" novalidate>

                    <div class="form-group">
                        <label for="crear-rol">Nombre:</label>
                        <input type="text" id="crear-rol" name="rol" autocomplete="off"
                            pattern="[a-zA-ZÀ-ÿ\s]+"
                            title="Solo se permiten letras y espacios."
                            oninput="this.value = this.value.replace(/[^a-zA-ZÀ-ÿ\s]/g, '')" required>
                    </div>

                    <div class="form-group">
                        <label for="crear-desc_rol">Descripción:</label>
                        <input type="text" id="crear-desc_rol" name="desc_rol" autocomplete="off" required>
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
                    <span class="cancelarModal" onclick="cerrarModalRol('crear-modalRol')" type=" submit">Cancelar</span>
                </form>
            </div>
        </div>

        <!-- Modal para editar Rol -->
        <div id="editar-modalRol" class="modal" style="display: none;">
            <div class="modal-content" style="height: 269px;">
                <span title="Cerrar" class="close" onclick="cerrarModalRol('editar-modalRol')">&times;</span>
                <h2 class="tittle">Editar Rol</h2>
                <form id="form-editarRol" novalidate>
                    <input type="hidden" id="editar-idrol" name="editar-idrol" value="" />
                    <div class="form-group">
                        <label for="editar-rol">Nombre:</label>
                        <input type="text" id="editar-rol" name="rol" autocomplete="off"
                            pattern="[a-zA-ZÀ-ÿ\s]+"
                            title="Solo se permiten letras y espacios."
                            oninput="this.value = this.value.replace(/[^a-zA-ZÀ-ÿ\s]/g, '')" required>
                    </div>
                    <div class="form-group">
                        <label for="editar-desc_rol">Descripción:</label>
                        <input type="text" id="editar-desc_rol" name="desc_rol" autocomplete="off" required>
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
                    <span class="cancelarModal" onclick="cerrarModalRol('editar-modalRol')" type=" submit">Cancelar</span>
                </form>
            </div>
        </div>
    </div>
</div><!--End container -->