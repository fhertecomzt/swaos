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

$umedidas = obtenerRegistros($dbh, "unidades_med", "id_unidad, nom_unidad, desc_unidad, estatus", "ASC", "id_unidad");
?>

<div class="containerr">
    <button class="boton" onclick="abrirModalUmed('crear-modalUmedida')">Nuevo</button>

    <!-- Filtro de estatus -->
    <label class="buscarlabel" for="cantidad-registros" style="margin-left: auto;">Mostrar:</label>
    <select class="buscar--box" id="cantidad-registros" style="width: auto; margin-right: 15px; padding-right: 10px;">
        <option value="8">8</option>
        <option value="25">25</option>
        <option value="50">50</option>
        <option value="-1">Todos</option>
    </select>

    <label class="buscarlabel" for="buscarboxumed">Buscar:</label>
    <input class="buscar--box" id="buscarboxumed" type="search" placeholder="Qué estas buscando?">

</div>

<div class="container_dashboard_tablas" id="umedidas">
    <h3>Lista de unidades de medida</h3>
    <div id="scroll-containerUmedidas">

        <table class="tbl" id="tabla-umedidas">
            <thead>
                <tr>
                    <th>Unidad de medida</th>
                    <th>Descripción</th>
                    <th>Estatus</th>
                    <th style="text-align: center;">Acciones</th>
                </tr>
            </thead>
            <tbody id="umedidas-lista">
                <?php foreach ($umedidas as $u): ?>
                    <tr>
                        <td data-lable="Nombre:"><?php echo htmlspecialchars($u['nom_unidad']); ?></td>
                        <td data-lable="Descripción:"><?php echo htmlspecialchars($u['desc_unidad']); ?></td>

                        <td data-lable="Estatus:"><button class="btn <?php echo ($u['estatus'] == 0) ? 'btn-success' : 'btn-danger'; ?>">
                                <?php echo ($u['estatus'] == 0) ? 'Activo' : 'Inactivo'; ?>
                            </button></td>

                        <td data-lable="Acciones:">
                            <button title="Editar" class="editarUmed fa-solid fa-pen-to-square" data-id="<?php echo $u['id_unidad']; ?>"></button>

                            <button title="Eliminar" class="eliminarUmed fa-solid fa-trash" data-id="<?php echo $u['id_unidad']; ?>"></button>
                        </td>
                    </tr>
                <?php endforeach; ?>
            </tbody>
        </table>
        <!-- Mensaje no encuentra resultados -->
        <p id="mensaje-vacio" class="mensajevacio" style="display: none; color: red;">No se encontraron resultados.</p>

        <!-- Modal para crear Umed -->
        <div id="crear-modalUmedida" class="modal" style="display: none;">
            <div class="modal-content" style="height: 269px;">
                <span title="Cerrar" class="close" onclick="cerrarModalUmed('crear-modalUmedida')">&times;</span>
                <h2 class="tittle">Crear Unidad de medida</h2>
                <form id="form-crearUmed" onsubmit="validarFormularioUmed(event, 'crear')" novalidate>

                    <div class="form-group">
                        <label for="crear-umed">Nombre:</label>
                        <input type="text" id="crear-umed" name="umed" autocomplete="off"
                            pattern="[a-zA-ZÀ-ÿ\s]+"
                            title="Solo se permiten letras y espacios."
                            oninput="this.value = this.value.replace(/[^a-zA-ZÀ-ÿ\s]/g, '')" required>
                    </div>

                    <div class="form-group">
                        <label for="crear-desc_umed">Descripción:</label>
                        <input type="text" id="crear-desc_umed" name="desc_umed" autocomplete="off" required>
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
                    <span class="cancelarModal" onclick="cerrarModalUmed('crear-modalUmedida')" type=" submit">Cancelar</span>
                </form>
            </div>
        </div>

        <!-- Modal para editar Umed -->
        <div id="editar-modalUmed" class="modal" style="display: none;">
            <div class="modal-content" style="height: 269px;">
                <span title="Cerrar" class="close" onclick="cerrarModalUmed('editar-modalUmed')">&times;</span>
                <h2 class="tittle">Editar Unidad de medida</h2>
                <form id="form-editarUmed" novalidate>
                    <input type="hidden" id="editar-idumed" name="editar-idumed" value="" />

                    <div class="form-group">
                        <label for="editar-umed">Nombre de la unidad:</label>
                        <input type="text" id="editar-umed" name="umed" autocomplete="off"
                            pattern="[a-zA-ZÀ-ÿ\s]+"
                            title="Solo se permiten letras y espacios."
                            oninput="this.value = this.value.replace(/[^a-zA-ZÀ-ÿ\s]/g, '')" required>
                    </div>

                    <div class="form-group">
                        <label for="editar-desc_umed">Descripción:</label>
                        <input type="text" id="editar-desc_umed" name="desc_umed" autocomplete="off" required>
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
                    <span class="cancelarModal" onclick="cerrarModalUmed('editar-modalUmed')" type=" submit">Cancelar</span>
                </form>
            </div>
        </div>
    </div>
</div>