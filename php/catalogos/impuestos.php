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

$impuestos = obtenerRegistros($dbh, "impuestos", "idimpuesto, nomimpuesto, tasa, estatus", "ASC", "idimpuesto");
?>

<div class="containerr">
    <button class="boton" onclick="abrirModalImpuesto('crear-modalImpuesto')">Nuevo</button>

    <!-- Filtro de estatus -->
    <label class="buscarlabel" for="cantidad-registros" style="margin-left: auto;">Mostrar:</label>
    <select class="buscar--box" id="cantidad-registros" style="width: auto; margin-right: 15px; padding-right: 10px;">
        <option value="8">8</option>
        <option value="25">25</option>
        <option value="50">50</option>
        <option value="-1">Todos</option>
    </select>
    <label class="buscarlabel" for="buscarboximpuesto">Buscar:</label>
    <input class="buscar--box" id="buscarboximpuesto" type="search" placeholder="Qué estas buscando?" autocomplete="off">
</div>

<div class="container_dashboard_tablas" id="impuestos">
    <h3>Lista de impuestos</h3>
    <div id="scroll-containerImp" style="height: 65vh; overflow-y: auto; position: relative;">
        <table class="tbl" id="tabla-impuestos">
            <thead>
                <tr>
                    <th>Nombre de impuesto</th>
                    <th>Tasa</th>
                    <th>Estatus</th>
                    <th style="text-align: center;">Acciones</th>
                </tr>
            </thead>
            <tbody id="impuestos-lista">
                <?php foreach ($impuestos as $u): ?>
                    <tr>
                        <td data-lable="Nombre:"><?php echo htmlspecialchars($u['nomimpuesto']); ?></td>
                        <td data-lable="Tasa:"><?php echo htmlspecialchars($u['tasa']); ?></td>
                        <td data-lable="Estatus:"><button class="btn <?php echo ($u['estatus'] == 0) ? 'btn-success' : 'btn-danger'; ?>">
                                <?php echo ($u['estatus'] == 0) ? 'Activo' : 'Inactivo'; ?>
                            </button></td>
                        <td data-lable="Acciones:">
                            <button title="Editar" class="editarImpuesto fa-solid fa-pen-to-square" data-id="<?php echo $u['idimpuesto']; ?>"></button>

                            <button title="Eliminar" class="eliminarImpuesto fa-solid fa-trash" data-id="<?php echo $u['idimpuesto']; ?>"></button>
                        </td>
                    </tr>
                <?php endforeach; ?>
            </tbody>
        </table>
        <!-- Mensaje no encuentra resultados -->
        <p id="mensaje-vacio" class="mensajevacio" style="display: none; color: red;">No se encontraron resultados.</p>

        <!-- Modal para crear Impuesto -->
        <div id="crear-modalImpuesto" class="modal" style="display: none;">
            <div class="modal-content" style="height: 269px;">
                <span title="Cerrar" class="close" onclick="cerrarModalImpuesto('crear-modalImpuesto')">&times;</span>
                <h2 class="tittle">Crear Impuesto</h2>

                <form id="form-crearImpuesto" onsubmit="validarFormularioImpuesto(event, 'crear')" novalidate>
                    <div class="form-group">
                        <label for="crear-impuesto">Nombre:</label>
                        <input type="text" id="crear-impuesto" name="impuesto" autocomplete="off"
                            pattern="[a-zA-ZÀ-ÿ\s]+"
                            title="Solo se permiten letras y espacios."
                            oninput="this.value = this.value.replace(/[^a-zA-ZÀ-ÿ\s]/g, '')" required>
                    </div>

                    <div class="form-group">
                        <label for="crear-tasa">Tasa:</label>
                        <input type="number" id="crear-tasa" name="tasa" autocomplete="off" placeholder="Ej, 0.00" required>
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
                    <span class="cancelarModal" onclick="cerrarModalImpuesto('crear-modalImpuesto')" type=" submit">Cancelar</span>
                </form>
            </div>
        </div>

        <!-- Modal para editar Impuesto -->
        <div id="editar-modalImpuesto" class="modal" style="display: none;">
            <div class="modal-content" style="height: 269px;">
                <span title="Cerrar" class="close" onclick="cerrarModalImpuesto('editar-modalImpuesto')">&times;</span>
                <h2 class="tittle">Editar Impuestos</h2>
                <form id="form-editarImpuesto" novalidate>
                    <input type="hidden" id="editar-idimpuesto" name="editar-idimpuesto" value="" />
                    <div class="form-group">
                        <label for="editar-impuesto">Nombre de la Impuesto:</label>
                        <input type="text" id="editar-impuesto" name="impuesto" autocomplete="off"
                            pattern="[a-zA-ZÀ-ÿ\s]+"
                            title="Solo se permiten letras y espacios."
                            oninput="this.value = this.value.replace(/[^a-zA-ZÀ-ÿ\s]/g, '')" required>
                    </div>
                    <div class="form-group">
                        <label for="editar-tasa">Tasa:</label>
                        <input type="number" id="editar-tasa" name="tasa" autocomplete="off" placeholder="Ej, 0.00" required>
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
                    <span class="cancelarModal" onclick="cerrarModalImpuesto('editar-modalImpuesto')" type=" submit">Cancelar</span>
                </form>
            </div>
        </div>
    </div>
</div>