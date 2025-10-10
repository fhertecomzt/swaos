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

$clientes = obtenerRegistros($dbh, "clientes", "idcliente, nom_cliente, tel_cliente, email_cliente", "ASC", "idcliente");
?>

<div class="containerr">
    <button class="boton" onclick="abrirModalCliente('crear-modalCliente')">Nuevo</button>
    <label class="buscarlabel" for="buscarboxcliente">Buscar:</label>
    <input class="buscar--box" id="buscarboxcliente" type="search" placeholder="Qué estas buscando?">
</div>

<div class="container_dashboard_tablas" id="clientes">
    <h3>Lista de Clientes</h3>
    <div id="scroll-containerCli" style="height: 65vh; overflow-y: auto; position: relative;">
        <table class="tbl" id="tabla-clientes">
            <thead>
                <tr>
                    <th>Nombre</th>
                    <th>Teléfono</th>
                    <th>Email</th>
                    <th colspan="2" style="text-align: center;">Acciones</th>
                </tr>
            </thead>
            <tbody>
                <?php foreach ($clientes as $u): ?>
                    <tr>
                        <td data-lable="Nombre:"><?php echo htmlspecialchars($u['nom_cliente']); ?></td>
                        <td data-lable="Teléfono:"><?php echo htmlspecialchars($u['tel_cliente']); ?></td>
                        <td data-lable="Email:"><?php echo htmlspecialchars($u['email_cliente']); ?></td>
                        <td data-lable="Editar:">
                            <button title="Editar" class="editarCliente fa-solid fa-pen-to-square" data-id="<?php echo $u['idcliente']; ?>"></button>
                        </td>
                        <td data-lable="Eliminar:">
                            <button title="Eliminar" class="eliminarCliente fa-solid fa-trash" data-id="<?php echo $u['idcliente']; ?>"></button>
                        </td>
                    </tr>
                <?php endforeach; ?>
            </tbody>
        </table>
        <!-- Mensaje no encuentra resultados -->
        <p id="mensaje-vacio" style="display: none; color: red;">No se encontraron resultados.</p>

        <!-- Modal para crear Cliente -->
        <div id="crear-modalCliente" class="modal" style="display: none;">
            <div class="modal-content">
                <span title="Cerrar" class="close" onclick="cerrarModalCliente('crear-modalCliente')">&times;</span>
                <h2 class="tittle">Crear Cliente</h2>
                <form id="form-crearCliente" onsubmit="validarFormularioCliente(event, 'crear')">

                    <div class="form-group">
                        <label for="crear-cliente">Nombre:</label>
                        <input type="text" id="crear-cliente" name="cliente" autocomplete="off"
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
                        <label for="crear-calle">Calle:</label>
                        <input type="text" id="crear-calle" name="calle" autocomplete="off"
                            pattern="[a-zA-Z0-9\s]+"
                            title="Solo se permiten letras, espacios y números."
                            oninput="this.value = this.value.replace(/[^a-zA-Z0-9\s]/g, '')" required>
                    </div>

                    <div class="form-containernum">
                        <div class="form-group ladoble">
                            <label for="crear-noexterior">No. exterior:</label>
                            <input type="number" id="crear-noexterior" name="noexterior" autocomplete="off"
                                pattern="[0-9]+"
                                title="Solo se permiten números."
                                oninput="this.value = this.value.replace(/[^0-9\s]/g, '')" size="6" min="0" maxlength="6" required>
                        </div>

                        <div class="form-group ladoble">
                            <label for="crear-nointerior">No. interior:</label>
                            <input type="text" id="crear-nointerior" name="nointerior" autocomplete="off"
                                ptitle="Solo se permiten letras y números."
                                oninput="this.value = this.value.replace(/[^a-zA-ZÀ-ÿ0-9]/g, '')" size="6" min="0" maxlength="6" required>
                        </div>
                    </div>

                    <div class="form-group">
                        <label for="crear-cpostal">Código postal:</label>
                        <input type="text" id="crear-cpostal" name="cpostal" autocomplete="off"
                            pattern="\d{5}"
                            title="Por favor, ingrese un código postal de 5 dígitos."
                            oninput="this.value = this.value.replace(/[^0-9]/g, '')" maxlength="5" required>
                    </div>

                    <div class="form-group">
                        <label for="crear-colonia">Colonia:</label>
                        <input type="text" id="crear-colonia" name="colonia" autocomplete="off"
                            pattern="[a-zA-ZÀ-ÿ\s]+"
                            title="Solo se permiten letras y espacios."
                            oninput="this.value = this.value.replace(/[^a-zA-ZÀ-ÿ\s]/g, '')" required>
                    </div>

                    <div class="form-group">
                        <label for="crear-ciudad">Ciudad:</label>
                        <input type="text" id="crear-ciudad" name="ciudad" autocomplete="off"
                            pattern="[a-zA-ZÀ-ÿ\s]+"
                            title="Solo se permiten letras y espacios."
                            oninput="this.value = this.value.replace(/[^a-zA-ZÀ-ÿ\s]/g, '')" required>
                    </div>

                    <div class="form-group">
                        <label for="crear-estado">Estado:</label>
                        <input type="text" id="crear-estado" name="estado" autocomplete="off"
                            pattern="[a-zA-ZÀ-ÿ\s]+"
                            title="Solo se permiten letras y espacios."
                            oninput="this.value = this.value.replace(/[^a-zA-ZÀ-ÿ\s]/g, '')" required>
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

        <!-- Modal para editar Cliente -->
        <div id="editar-modalCliente" class="modal" style="display: none;">
            <div class="modal-content">
                <span title="Cerrar" class="close" onclick="cerrarModalCliente('editar-modalCliente')">&times;</span>
                <h2 class="tittle">Editar Cliente</h2>
                <form id="form-editarCliente">

                    <input type="hidden" id="editar-idcliente" name="editar-idcliente" value="" />

                    <div class="form-group">
                        <label for="editar-cliente">Nombre:</label>
                        <input type="text" id="editar-cliente" name="cliente" autocomplete="off"
                            pattern="[a-zA-ZÀ-ÿ0-9\s]+"
                            title="Solo se permiten letras, números y espacios."
                            oninput="this.value = this.value.replace(/[^a-zA-ZÀ-ÿ0-9\s]/g, '')" required>
                    </div>

                    <div class="form-group">
                        <label for="editar-rfc">R.F.C.:</label>
                        <input type="text" id="editar-rfc" name="rfc" autocomplete="off" maxlength="13"
                            pattern="[a-zA-Z0-9]+"
                            title="Solo se permiten letras y números."
                            oninput="this.value = this.value.replace(/[^a-zA-Z0-9]/g, '')" required>
                    </div>

                    <div class="form-group">
                        <label for="editar-calle">Calle:</label>
                        <input type="text" id="editar-calle" name="calle" autocomplete="off"
                            pattern="[a-zA-Z0-9\s]+"
                            title="Solo se permiten letras, espacios y números."
                            oninput="this.value = this.value.replace(/[^a-zA-Z0-9\s]/g, '')" required>
                    </div>

                    <div class="form-containernum">
                        <div class="form-group ladoble">
                            <label for="editar-noexterior">No. exterior:</label>
                            <input type="number" id="editar-noexterior" name="noexterior" autocomplete="off"
                                pattern="[0-9]+"
                                title="Solo se permiten números."
                                oninput="this.value = this.value.replace(/[^0-9]/g, '')" size="6" min="0" maxlength="6" required>
                        </div>

                        <div class="form-group ladoble">
                            <label for="editar-nointerior">No. interior:</label>
                            <input type="text" id="editar-nointerior" name="nointerior" autocomplete="off"
                                ptitle="Solo se permiten letras y números."
                                oninput="this.value = this.value.replace(/[^a-zA-ZÀ-ÿ0-9]/g, '')" size="6" min="0" maxlength="6" required>
                        </div>
                    </div>

                    <div class="form-group">
                        <label for="editar-cpostal">Código postal:</label>
                        <input type="text" id="editar-cpostal" name="cpostal" autocomplete="off"
                            pattern="\d{5}"
                            title="Por favor, ingrese un código postal de 5 dígitos."
                            oninput="this.value = this.value.replace(/[^0-9]/g, '')" maxlength="5" required>
                    </div>

                    <div class="form-group">
                        <label for="editar-colonia">Colonia:</label>
                        <input type="text" id="editar-colonia" name="colonia" autocomplete="off"
                            pattern="[a-zA-ZÀ-ÿ\s]+"
                            title="Solo se permiten letras y espacios."
                            oninput="this.value = this.value.replace(/[^a-zA-ZÀ-ÿ\s]/g, '')" required>
                    </div>

                    <div class="form-group">
                        <label for="editar-ciudad">Ciudad:</label>
                        <input type="text" id="editar-ciudad" name="ciudad" autocomplete="off"
                            pattern="[a-zA-ZÀ-ÿ\s]+"
                            title="Solo se permiten letras y espacios."
                            oninput="this.value = this.value.replace(/[^a-zA-ZÀ-ÿ\s]/g, '')" required>
                    </div>

                    <div class="form-group">
                        <label for="editar-estado">Estado:</label>
                        <input type="text" id="editar-estado" name="estado" autocomplete="off"
                            pattern="[a-zA-ZÀ-ÿ\s]+"
                            title="Solo se permiten letras y espacios."
                            oninput="this.value = this.value.replace(/[^a-zA-ZÀ-ÿ\s]/g, '')" required>
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
                            title="Ingrese un número entre 0 y 365."
                            oninput="this.value = this.value.replace(/[^0-9]/g, '')" size="3" min="0" value="0" max="365" maxlength="10" required>
                    </div>

                    <button type="submit">Actualizar</button>
                </form>
            </div>
        </div>
    </div>
</div>