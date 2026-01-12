<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

$roles_permitidos = ["superusuario", "gerencia"];

//Includes
include "../verificar_sesion.php";
require "../conexion.php";
include "../funciones/funciones.php";
include "../funciones/activoinactivo.php";

$marcas = obtenerRegistros($dbh, "marcas", "id_marca, nom_marca, desc_marca, estatus", "ASC", "id_marca");
?>

<div class="containerr">
    <button class="boton" onclick="abrirModalMarca('crear-modalMarca')">Nuevo</button>
    <label class="buscarlabel" for="buscarboxmarca">Buscar:</label>
    <input class="buscar--box" id="buscarboxmarca" type="search" placeholder="Qué estas buscando?" autocomplete="off">

    <!-- Filtro de estatus -->
    <label class="buscarlabel" for="estatusFiltroMarca">Filtrar por Estatus:</label>
    <select class="buscar--box" id="estatusFiltroMarca" onchange="cargarMarcasFiltradas()" style="width: 100px;">
        <option value="">Todos</option>
        <option value="Activo">Activo</option>
        <option value="Inactivo">Inactivo</option>
    </select>
</div>

<div class="container_dashboard_tablas" id="marcas">
    <h3>Lista de marcas</h3>
    <div id="scroll-containerMarca" style="height: 65vh; overflow-y: auto; position: relative;">
        <table class="tbl" id="tabla-marcas">
            <thead>
                <tr>
                    <th>Marca</th>
                    <th>Descripción</th>
                    <th>Estatus</th>
                    <th colspan="2" style="text-align: center;">Acciones</th>
                </tr>
            </thead>
            <tbody id="marcas-lista">
                <?php foreach ($marcas as $u): ?>
                    <tr>
                        <td data-lable="Nombre:"><?php echo htmlspecialchars($u['nom_marca']); ?></td>
                        <td data-lable="Descripción:"><?php echo htmlspecialchars($u['desc_marca']); ?></td>
                        <td data-lable="Estatus:"><button class="btn <?php echo ($u['estatus'] == 0) ? 'btn-success' : 'btn-danger'; ?>">
                                <?php echo ($u['estatus'] == 0) ? 'Activo' : 'Inactivo'; ?>
                            </button></td>
                        <td data-lable="Editar:">
                            <button title="Editar" class="editarMarca fa-solid fa-pen-to-square" data-id="<?php echo $u['id_marca']; ?>"></button>
                        </td>
                        <td data-lable="Eliminar:">
                            <button title="Eliminar" class="eliminarMarca fa-solid fa-trash" data-id="<?php echo $u['id_marca']; ?>"></button>
                        </td>
                    </tr>
                <?php endforeach; ?>
            </tbody>
        </table>
        <!-- Mensaje no encuentra resultados -->
        <p id="mensaje-vacio" class="mensajevacio" style="display: none; color: red;">No se encontraron resultados.</p>

        <!-- Modal para crear Marca -->
        <div id="crear-modalMarca" class="modal" style="display: none;">
            <div class="modal-content" style="height: 269px;">
                <span title="Cerrar" class="close" onclick="cerrarModalMarca('crear-modalMarca')">&times;</span>
                <h2 class="tittle">Crear Marca</h2>

                <form id="form-crearMarca" onsubmit="validarFormularioMarca(event, 'crear')">
                    <div class="form-group">
                        <label for="crear-marca">Nombre:</label>
                        <input type="text" id="crear-marca" name="marca" autocomplete="off"
                            pattern="[a-zA-ZÀ-ÿ\s]+"
                            title="Solo se permiten letras y espacios."
                            oninput="this.value = this.value.replace(/[^a-zA-ZÀ-ÿ\s]/g, '')" required>
                    </div>

                    <div class="form-group">
                        <label for="crear-desc_marca">Descripción:</label>
                        <input type="text" id="crear-desc_marca" name="desc_marca" autocomplete="off" required>
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
                    <span class="cancelarModal" onclick="cerrarModalMarca('crear-modalMarca')" type=" submit">Cancelar</span>
                </form>
            </div>
        </div>

        <!-- Modal para editar Marca -->
        <div id="editar-modalMarca" class="modal" style="display: none;">
            <div class="modal-content" style="height: 269px;">
                <span title="Cerrar" class="close" onclick="cerrarModalMarca('editar-modalMarca')">&times;</span>
                <h2 class="tittle">Editar Marca</h2>
                <form id="form-editarMarca">
                    <input type="hidden" id="editar-idmarca" name="editar-idmarca" value="" />
                    <div class="form-group">
                        <label for="editar-marca">Nombre de la Marca:</label>
                        <input type="text" id="editar-marca" name="marca" autocomplete="off"
                            pattern="[a-zA-ZÀ-ÿ\s]+"
                            title="Solo se permiten letras y espacios."
                            oninput="this.value = this.value.replace(/[^a-zA-ZÀ-ÿ\s]/g, '')" required>
                    </div>
                    <div class="form-group">
                        <label for="editar-desc_marca">Descripción:</label>
                        <input type="text" id="editar-desc_marca" name="desc_marca" autocomplete="off" required>
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
                    <span class="cancelarModal" onclick="cerrarModalMarca('editar-modalMarca')" type=" submit">Cancelar</span>
                </form>
            </div>
        </div>
    </div>
</div>