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

$categorias = obtenerRegistros($dbh, "categorias", "id_categoria, nombre_cat, desc_cat, estatus", "ASC", "id_categoria");
?>

<div class="containerr">
    <button class="boton" onclick="abrirModalCat('crear-modalCat')">Nuevo</button>
    <label class="buscarlabel" for="buscarboxcat">Buscar:</label>
    <input class="buscar--box" id="buscarboxcat" type="search" placeholder="Qué estas buscando?" autocomplete="off">

    <!-- Filtro de estatus -->
    <label class="buscarlabel" for="estatusFiltroCat">Filtrar por Estatus:</label>
    <select class="buscar--box" id="estatusFiltroCat" onchange="cargarCatFiltradas()" style="width: 100px;">
        <option value="">Todos</option>
        <option value="Activo">Activo</option>
        <option value="Inactivo">Inactivo</option>
    </select>
</div>

<div class="container_dashboard_tablas" id="categorias">
    <h3>Lista de Categorías</h3>
    <div id="scroll-containerCat" style="height: 65vh; overflow-y: auto; position: relative;">

        <table class="tbl" id="tabla-categorias">
            <thead>
                <tr>
                    <th>Categoría</th>
                    <th>Descripción</th>
                    <th>Estatus</th>
                    <th colspan="2" style="text-align: center;">Acciones</th>
                </tr>
            </thead>

            <tbody id="categorias-lista">
                <?php foreach ($categorias as $u): ?>
                    <tr>
                        <td data-lable="Nombre:"><?php echo htmlspecialchars($u['nombre_cat']); ?></td>
                        <td data-lable="Descripción:"><?php echo htmlspecialchars($u['desc_cat']); ?></td>
                        <td data-lable="Estatus:"><button class="btn <?php echo ($u['estatus'] == 0) ? 'btn-success' : 'btn-danger'; ?>">
                                <?php echo ($u['estatus'] == 0) ? 'Activo' : 'Inactivo'; ?>
                            </button></td>
                        <td data-lable="Editar:">
                            <button title=" Editar" class="editarCat fa-solid fa-pen-to-square" data-id="<?php echo $u['id_categoria']; ?>"></button>
                        </td>
                        <td data-lable="Eliminar:">
                            <button title=" Eliminar" class="eliminarCat fa-solid fa-trash" data-id="<?php echo $u['id_categoria']; ?>"></button>
                        </td>
                    </tr>
                <?php endforeach; ?>
            </tbody>
        </table>

        <!-- Mensaje no encuentra resultados -->
        <p id="mensaje-vacio" class="mensajevacio" style="display: none; color: red;">No se encontraron resultados.</p>

        <!-- Modal para crear Categoria -->
        <div id="crear-modalCat" class="modal" style="display: none;">
            <div class="modal-content" style="height: 269px;">
                <span title="Cerrar" class="close" onclick="cerrarModalCat('crear-modalCat')">&times;</span>
                <h2 class="tittle">Crear Categoría</h2>
                <form id="form-crearCat" onsubmit="validarFormularioCat(event, 'crear')">

                    <div class="form-group">
                        <label for="crear-cat">Nombre:</label>
                        <input type="text" id="crear-cat" name="cat" autocomplete="off"
                            pattern="[a-zA-ZÀ-ÿ\s]+"
                            title="Solo se permiten letras y espacios."
                            oninput="this.value = this.value.replace(/[^a-zA-ZÀ-ÿ\s]/g, '')" required>
                    </div>

                    <div class="form-group">
                        <label for="crear-desc_cat">Descripción:</label>
                        <input type="text" id="crear-desc_cat" name="desc_cat" autocomplete="off" required>
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
                    <span class="cancelarModal" onclick="cerrarModalCat('crear-modalCat')" type=" submit">Cancelar</span>
                </form>
            </div>
        </div>

        <!-- Modal para editar Cat -->
        <div id="editar-modalCat" class="modal" style="display: none;">
            <div class="modal-content" style="height: 269px;">
                <span title="Cerrar" class="close" onclick="cerrarModalCat('editar-modalCat')">&times;</span>
                <h2 class="tittle">Editar Categoría</h2>
                <form id="form-editarCat">
                    <input type="hidden" id="editar-idcat" name="editar-idcat" value="" />
                    <div class="form-group">
                        <label for="editar-cat">Nombre:</label>
                        <input type="text" id="editar-cat" name="cat" autocomplete="off"
                            pattern="[a-zA-ZÀ-ÿ\s]+"
                            title="Solo se permiten letras y espacios."
                            oninput="this.value = this.value.replace(/[^a-zA-ZÀ-ÿ\s]/g, '')" required>
                    </div>
                    <div class="form-group">
                        <label for="editar-desc_cat">Descripción:</label>
                        <input type="text" id="editar-desc_cat" name="desc_cat" autocomplete="off" required>
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
                    <span class="cancelarModal" onclick="cerrarModalCat('editar-modalCat')" type=" submit">Cancelar</span>
                </form>
            </div>
        </div>
    </div>
</div>