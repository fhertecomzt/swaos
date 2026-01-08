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

$clientes = obtenerRegistros($dbh, "clientes", "id_cliente, nombre_cliente, papellido_cliente, sapellido_cliente, calle_cliente, noext_cliente, noint_cliente, tel_cliente, email_cliente, estatus", "ASC", "id_cliente");
$estados = obtenerEstados($dbh);
$municipios = obtenerMunicipios($dbh);
$colonias = obtenerColonias($dbh);

?>

<div class="containerr">
    <button class="boton" onclick="abrirModalCliente('crear-modalCliente')">Nuevo</button>
    <label class="buscarlabel" for="buscarboxcliente">Buscar:</label>
    <input class="buscar--box" id="buscarboxcliente" type="search" placeholder="Qué estas buscando?" enterkeyhint="search">
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
                <fieldset>
                    <legend>Crear cliente</legend>
                    <form id="form-crearCliente" onsubmit="validarFormularioCliente(event, 'crear')">

                        <div class="form-group">
                            <label for="crear-cliente">Nombre:</label>
                            <input type="text" id="crear-cliente" name="cliente" autocomplete="off"
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
                                    oninput="this.value = this.value.replace(/[^a-zA-ZÀ-ÿ0-9]/g, '')" size="6" min="0" maxlength="6">
                            </div>
                        </div>

                        <div class="form-group">
                            <label for="estado">Estado</label>
                            <select name="estado" id="estado" required>
                                <option value="">Seleccionar</option>
                                <?php foreach ($estados as $row) : ?>
                                    <option value="<?php echo $row['id']; ?>"><?php echo $row['nombre']; ?></option>
                                <?php endforeach; ?>
                            </select>
                        </div>

                        <div class="form-group">
                            <label for="municipio">Municipio</label>
                            <select name="municipio" id="municipio" required>
                                <option value="">Seleccionar</option>
                            </select>
                        </div>

                        <div class="form-group">
                            <label for="colonia">Colonia</label>
                            <select name="colonia" id="colonia" required>
                                <option value="">Seleccionar</option>
                            </select>
                        </div>

                        <div class="form-group ladoble">
                            <label for="codigo_postal">Código Postal</label>
                            <input type="text" name="codigo_postal" id="codigo_postal" title="Solo contiente 5 números" readonly>
                        </div>

                        <div class="form-group">
                            <label for="crear-email">Email:
                                    <input type="email" id="crear-email" name="email" autocomplete="email" required>
                            </label>
                        </div>

                        <div class="form-containernum">
                            <div class="form-group" style="width: 40%">
                                <label for="crear-telefono">Teléfono:</label>
                                <input type="text" inputmode="numeric" id="crear-telefono" name="telefono" autocomplete="off" maxlength="10 "
                                    pattern="\d{10}"
                                    title="Por favor, ingrese un número de telefono de 10 dígitos."
                                    oninput="this.value = this.value.replace(/[^0-9]/g, '')" required>
                            </div>

                            <!-- Selección de Estatus -->
                            <div class="form-group" style="width: 50%">
                                <label for="estatus">Estatus:</label>
                                <select id="estatus" name="estatus" required>
                                    <?php foreach ($options as $key => $text) { ?>
                                        <option value="<?= $key ?>" <?= $key === $selected ? 'selected' : '' ?>><?= $text ?></option>
                                    <?php } ?>
                                </select>
                            </div>
                        </div>
                </fieldset>

                <button type="submit">Guardar</button>
                <span class="cancelarModal" onclick="cerrarModalCliente('crear-modalCliente')" type=" submit">Cancelar</span>
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

                    <button type="submit">Actualizar</button>
                </form>
            </div>
        </div>
    </div>
</div>