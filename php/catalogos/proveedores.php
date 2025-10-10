<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

$roles_permitidos = ["SISTEMAS", "GERENCIA"];

//Includes
include "../verificar_sesion.php";
include "../conexion.php";
include "../funciones/funciones.php";
include "../funciones/activoinactivo.php";

$proveedores = obtenerRegistros($dbh, "proveedores", "idproveedor, nomproveedor, contacproveedor, rfcproveedor, telproveedor, celproveedor, emailproveedor, limitecredproveedor, dicredproveedor", "ASC", "idproveedor");
?>

<div class="containerr">
    <button class="boton" onclick="abrirModalProveedor('crear-modalProveedor')">Nuevo</button>
    <label class="buscarlabel" for="buscarboxproveedor">Buscar:</label>
    <input class="buscar--box" id="buscarboxproveedor" type="search" placeholder="Qué estas buscando?">
</div>

<div class="container_dashboard_tablas" id="proveedores">
    <h3>Lista de Proveedores</h3>
    <div id="scroll-containerProv" style="height: 65vh; overflow-y: auto; position: relative;">

        <table class="tbl" id="tabla-proveedores">
            <thead>
                <tr>
                    <th>Nombre</th>
                    <th>Contacto</th>
                    <th>Teléfono</th>
                    <th>Email</th>
                    <th colspan="2" style="text-align: center;">Acciones</th>
                </tr>
            </thead>
            <tbody>
                <?php foreach ($proveedores as $u): ?>
                    <tr>
                        <td data-lable="Nombre:"><?php echo htmlspecialchars($u['nomproveedor']); ?></td>
                        <td data-lable="Contacto:"><?php echo htmlspecialchars($u['contacproveedor']); ?></td>
                        <td data-lable="Teléfono:"><?php echo htmlspecialchars($u['telproveedor']); ?></td>
                        <td data-lable="Email:"><?php echo htmlspecialchars($u['emailproveedor']); ?></td>
                        <td data-lable="Editar:">
                            <button title="Editar" class="editarProveedor fa-solid fa-pen-to-square" data-id="<?php echo $u['idproveedor']; ?>"></button>
                        </td>
                        <td data-lable="Eliminar:">
                            <button title="Eliminar" class="eliminarProveedor fa-solid fa-trash" data-id="<?php echo $u['idproveedor']; ?>"></button>
                        </td>
                    </tr>
                <?php endforeach; ?>
            </tbody>
        </table>
        <!-- Mensaje no encuentra resultados -->
        <p id="mensaje-vacio" style="display: none; color: red;">No se encontraron resultados.</p>

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
                        <label for="crear-contacto">Contacto:</label>
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
                        <label for="crear-celular">Celular:</label>
                        <input type="text" id="crear-celular" name="celular" autocomplete="off" maxlength="10 "
                            pattern="\d{10}"
                            title="Por favor, ingrese un número de telefono de 10 dígitos."
                            oninput="this.value = this.value.replace(/[^0-9]/g, '')" required>
                    </div>

                    <div class="form-group">
                        <label for="crear-email">Email:</label>
                        <input type="email" id="crear-email" name="email" autocomplete="off" required>
                    </div>

                    <div class="form-group">
                        <label for="crear-limitecred">Limite de crédito:</label>
                        <input type="text" id="crear-limitecred" name="limitecred" autocomplete="off"
                            pattern="[0-9]+"
                            title="Solo se permiten números."
                            oninput="this.value = this.value.replace(/[^0-9]/g, '')" size="10" min="0" value="0" maxlength="10" required>
                    </div>

                    <div class="form-group">
                        <label for="crear-diacred">Días de crédito:</label>
                        <input type="text" id="crear-diacred" name="diacred" autocomplete="off"
                            pattern="^(?:[0-9]|[1-9][0-9]|[1-3][0-6][0-5])$"
                            title="Ingrese un número entre 1 y 365." size="3" min="0" value="0" max="365" required>
                    </div>

                    <button type="submit">Guardar</button>
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
                        <label for="editar-contacto">Contacto:</label>
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
                        <label for="editar-celular">Celular:</label>
                        <input type="text" id="editar-celular" name="celular" autocomplete="off" maxlength="10 "
                            pattern="\d{10}"
                            title="Por favor, ingrese un número de telefono de 10 dígitos."
                            oninput="this.value = this.value.replace(/[^0-9]/g, '')" required>
                    </div>

                    <div class="form-group">
                        <label for="editar-email">Email:</label>
                        <input type="email" id="editar-email" name="email" autocomplete="off" required>
                    </div>

                    <div class="form-group">
                        <label for="editar-limitecred">Limite de crédito:</label>
                        <input type="text" id="editar-limitecred" name="limitecred" autocomplete="off"
                            pattern="^\d+(\.\d{1,2})?$"
                            title="Ingrese un número válido con hasta 2 decimales (ej. 100.50)"
                            size="10" min="0" value="0" maxlength="10" required>
                    </div>

                    <div class="form-group">
                        <label for="editar-diacred">Días de crédito:</label>
                        <input type="text" id="editar-diacred" name="diacred" autocomplete="off"
                            pattern="^(?:[0-9]|[1-9][0-9]|[1-3][0-6][0-5])$"
                            title="Ingrese un número entre 0 y 365." size="3" min="0" value="0" max="365" required>
                    </div>

                    <button type="submit">Actualizar</button>
                </form>
            </div>
        </div>
    </div>
</div>