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

$proveedores = obtenerRegistros($dbh, "proveedores", "id_prov, nombre_prov, papellido_prov, sapellido_prov, contacto_prov, rfc_prov, tel_prov, email_prov, estatus", "ASC", "id_prov");
?>

<div class="containerr">
    <button class="boton" onclick="abrirModalProveedor('crear-modalProveedor')">Nuevo</button>
    <label class="buscarlabel" for="buscarboxproveedor">Buscar:</label>
    <input class="buscar--box" id="buscarboxproveedor" type="search" placeholder="Qué estas buscando?" autocomplete="off">

        <!-- Filtro de estatus -->
    <label class="buscarlabel" for="estatusFiltroProv">Filtrar por Estatus:</label>
    <select class="buscar--box" id="estatusFiltroProv" onchange="cargarProvFiltrados()" style="width: 100px;">
        <option value="">Todos</option>
        <option value="Activo">Activo</option>
        <option value="Inactivo">Inactivo</option>
    </select>

</div>

<div class="container_dashboard_tablas" id="proveedores">
    <h3>Lista de Proveedores</h3>
    <div id="scroll-containerProv" style="height: 65vh; overflow-y: auto; position: relative;">

        <table class="tbl" id="tabla-proveedores">
            <thead>
                <tr>
                    <th>Nombre</th>
                    <th>Empresa</th>
                    <th>Teléfono</th>
                    <th>Email</th>
                    <th>Estatus</th>
                    <th colspan="2" style="text-align: center;">Acciones</th>
                </tr>
            </thead>
            <tbody>
                <?php foreach ($proveedores as $u): ?>
                    <tr>
                        <td data-lable="Nombre:"><?php echo htmlspecialchars($u['nombre_prov']); ?></td>
                        <td data-lable="Contacto:"><?php echo htmlspecialchars($u['contacto_prov']); ?></td>
                        <td data-lable="Teléfono:"><?php echo htmlspecialchars($u['tel_prov']); ?></td>
                        <td data-lable="Email:"><?php echo htmlspecialchars($u['email_prov']); ?></td>
                        <td data-lable="Estatus:"><button class="btn <?php echo ($u['estatus'] == 0) ? 'btn-success' : 'btn-danger'; ?>">
                                <?php echo ($u['estatus'] == 0) ? 'Activo' : 'Inactivo'; ?>
                            </button></td>

                        <td data-lable="Editar:">
                            <button title="Editar" class="editarProveedor fa-solid fa-pen-to-square" data-id="<?php echo $u['id_prov']; ?>"></button>
                        </td>
                        <td data-lable="Eliminar:">
                            <button title="Eliminar" class="eliminarProveedor fa-solid fa-trash" data-id="<?php echo $u['id_prov']; ?>"></button>
                        </td>
                    </tr>
                <?php endforeach; ?>
            </tbody>
        </table>
        <!-- Mensaje no encuentra resultados -->
        <p id="mensaje-vacio" class="mensajevacio" style="display: none; color: red;">No se encontraron resultados.</p>

        <!-- Modal para crear Proveedor -->
        <div id="crear-modalProveedor" class="modal" style="display: none;">
            <div class="modal-content">
                <span title="Cerrar" class="close" onclick="cerrarModalProveedor('crear-modalProveedor')">&times;</span>
                <h2 class="tittle">Crear Proveedor</h2>
                <form id="form-crearProveedor" onsubmit="validarFormularioProveedor(event, 'crear')">

                    <div class="form-group">
                        <label for="crear-proveedor">Nombre:</label>
                        <input type="text" id="crear-proveedor" name="proveedor" autocomplete="off"
                            pattern="[a-zA-ZÀ-ÿ0-9\s]+"
                            title="Solo se permiten letras, números y espacios."
                            oninput="this.value = this.value.replace(/[^a-zA-ZÀ-ÿ0-9\s]/g, '')" required>
                    </div>

                    <div class="form-group">
                        <label for="crear-papellido">Primer apellido:</label>
                        <input type="text" id="crear-papellido" name="papellido" autocomplete="off"
                            pattern="[a-zA-ZÀ-ÿ0-9\s]+"
                            title="Solo se permiten letras, números y espacios."
                            oninput="this.value = this.value.replace(/[^a-zA-ZÀ-ÿ0-9\s]/g, '')" required>
                    </div>

                    <div class="form-group">
                        <label for="crear-sapellido">Segundo apellido:</label>
                        <input type="text" id="crear-sapellido" name="sapellido" autocomplete="off"
                            pattern="[a-zA-ZÀ-ÿ0-9\s]+"
                            title="Solo se permiten letras, números y espacios."
                            oninput="this.value = this.value.replace(/[^a-zA-ZÀ-ÿ0-9\s]/g, '')" required>
                    </div>

                    <div class="form-group">
                        <label for="crear-contacto">Empresa:</label>
                        <input type="text" id="crear-contacto" name="contacto" autocomplete="off"
                            pattern="[a-zA-ZÀ-ÿ0-9\s]+"
                            title="Solo se permiten letras, números y espacios."
                            oninput="this.value = this.value.replace(/[^a-zA-ZÀ-ÿ0-9\s]/g, '')" required>
                    </div>

                    <div class="form-group">
                        <label for="crear-rfc">R.F.C.:</label>
                        <input type="text" id="crear-rfc" name="rfc" autocomplete="off"
                            pattern="[a-zA-Z0-9]+"
                            title="Solo se permiten letras y números."
                            oninput="this.value = this.value.replace(/[^a-zA-Z0-9]/g, '')" maxlength="13" required>
                    </div>

                    <div class="form-group">
                        <label for="crear-telefono">Teléfono:</label>
                        <input type="text" id="crear-telefono" name="telefono" autocomplete="off" maxlength="10 "
                            pattern="\d{10}"
                            title="Por favor, ingrese un número de telefono de 10 dígitos."
                            oninput="this.value = this.value.replace(/[^0-9]/g, '')" required>
                    </div>

                    <div class="form-group">
                        <label for="crear-email">Email:</label>
                        <input type="email" id="crear-email" name="email" autocomplete="off" required>
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
                    <span class="cancelarModal" onclick="cerrarModalProveedor('crear-modalProveedor')" type=" submit">Cancelar</span>

                </form>
            </div>
        </div>

        <!-- Modal para editar Proveedor -->
        <div id="editar-modalProveedor" class="modal" style="display: none;">
            <div class="modal-content">
                <span title="Cerrar" class="close" onclick="cerrarModalProveedor('editar-modalProveedor')">&times;</span>
                <h2 class="tittle">Editar Proveedor</h2>
                <form id="form-editarProveedor">

                    <input type="hidden" id="editar-idproveedor" name="editar-idproveedor" value="" />

                    <div class="form-group">
                        <label for="editar-proveedor">Nombre:</label>
                        <input type="text" id="editar-proveedor" name="proveedor" autocomplete="off"
                            pattern="[a-zA-ZÀ-ÿ0-9\s]+"
                            title="Solo se permiten letras, números y espacios."
                            oninput="this.value = this.value.replace(/[^a-zA-ZÀ-ÿ0-9\s]/g, '')" required>
                    </div>

                    <div class="form-group">
                        <label for="editar-papellido">Primer apellido:</label>
                        <input type="text" id="editar-papellido" name="papellido" autocomplete="off"
                            pattern="[a-zA-ZÀ-ÿ0-9\s]+"
                            title="Solo se permiten letras, números y espacios."
                            oninput="this.value = this.value.replace(/[^a-zA-ZÀ-ÿ0-9\s]/g, '')" required>
                    </div>

                    <div class="form-group">
                        <label for="editar-sapellido">Segundo apellido:</label>
                        <input type="text" id="editar-sapellido" name="sapellido" autocomplete="off"
                            pattern="[a-zA-ZÀ-ÿ0-9\s]+"
                            title="Solo se permiten letras, números y espacios."
                            oninput="this.value = this.value.replace(/[^a-zA-ZÀ-ÿ0-9\s]/g, '')" required>
                    </div>

                    <div class="form-group">
                        <label for="editar-contacto">Empresa:</label>
                        <input type="text" id="editar-contacto" name="contacto" autocomplete="off"
                            pattern="[a-zA-ZÀ-ÿ0-9\s]+"
                            title="Solo se permiten letras, números y espacios."
                            oninput="this.value = this.value.replace(/[^a-zA-ZÀ-ÿ0-9\s]/g, '')" required>
                    </div>

                    <div class="form-group">
                        <label for="editar-rfc">R.F.C.:</label>
                        <input type="text" id="editar-rfc" name="rfc" autocomplete="off"
                            pattern="[a-zA-Z0-9]+"
                            title="Solo se permiten letras y números."
                            oninput="this.value = this.value.replace(/[^a-zA-Z0-9]/g, '')" maxlength="13" required>
                    </div>

                    <div class="form-group">
                        <label for="editar-telefono">Teléfono:</label>
                        <input type="text" id="editar-telefono" name="telefono" autocomplete="off" maxlength="10 "
                            pattern="\d{10}"
                            title="Por favor, ingrese un número de telefono de 10 dígitos."
                            oninput="this.value = this.value.replace(/[^0-9]/g, '')" required>
                    </div>

                    <div class="form-group">
                        <label for="editar-email">Email:</label>
                        <input type="email" id="editar-email" name="email" autocomplete="off" required>
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

                    <span class="cancelarModal" onclick="cerrarModalProveedor('editar-modalProveedor')" type=" submit">Cancelar</span>

                </form>
            </div>
        </div>
    </div>
</div>