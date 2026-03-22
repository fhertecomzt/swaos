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

$clientes = obtenerRegistros($dbh, "clientes", "id_cliente, nombre_cliente, papellido_cliente, sapellido_cliente, rfc_cliente, calle_cliente, noext_cliente, noint_cliente, tel_cliente, email_cliente, estatus", "ASC", "id_cliente");
$estados = obtenerEstados($dbh);
$municipios = obtenerMunicipios($dbh);
$colonias = obtenerColonias($dbh);

?>

<div class="containerr">
    <button id="btn-crear-cliente" class="boton" onclick="abrirModalCliente('crear-modalCliente')">Nuevo</button>

    <!-- Filtro de estatus -->
    <label class="buscarlabel" for="cantidad-registros" style="margin-left: auto;">Mostrar:</label>
    <select class="buscar--box" id="cantidad-registros" style="width: auto; margin-right: 15px; padding-right: 10px;">
        <option value="8">8</option>
        <option value="25">25</option>
        <option value="50">50</option>
        <option value="-1">Todos</option>
    </select>
    <label class="buscarlabel" for="buscarboxcliente">Buscar:</label>
    <input class="buscar--box" id="buscarboxcliente" type="search" placeholder="Qué estas buscando?" autocomplete="off">
</div>

<div class="container_dashboard_tablas" id="clientes">
    <h3>Lista de Clientes</h3>
    <div id="scroll-containerCli">
        <table class="tbl" id="tabla-clientes">
            <thead>
                <tr>
                    <th>Nombre</th>
                    <th>Primer apellido</th>
                    <th>Segundo apellido</th>
                    <th>Teléfono</th>
                    <th>Email</th>
                    <th>Estatus</th>
                    <th style="text-align: center;">Acciones</th>
                </tr>
            </thead>
            <tbody id="clientes-lista">
                <?php foreach ($clientes as $u): ?>
                    <tr>
                        <td data-lable="Nombre:"><?php echo htmlspecialchars($u['nombre_cliente']); ?></td>
                        <td data-lable="Primer apellido:"><?php echo htmlspecialchars($u['papellido_cliente']); ?></td>
                        <td data-lable="Segundo apellido:"><?php echo htmlspecialchars($u['sapellido_cliente']); ?></td>
                        <td data-lable="Teléfono:"><?php echo htmlspecialchars($u['tel_cliente']); ?></td>
                        <td data-lable="Email:"><?php echo htmlspecialchars($u['email_cliente']); ?></td>
                        <td data-lable="Estatus"><button class="btn <?php echo ($u['estatus'] == 0) ? 'btn-success' : 'btn-danger'; ?>">
                                <?php echo ($u['estatus'] == 0) ? 'Activo' : 'Inactivo'; ?>
                            </button></td>
                        <td data-lable="Acciones:" style="display: flex; gap: 5px; justify-content: center;">
                            <button title="Ver Expediente 360" class="verExpediente" data-id="<?php echo $u['id_cliente']; ?>" style="background-color: #17a2b8; color: white; border-radius: 5px; padding: 5px 8px; cursor: pointer; border: none;">
                                <i class="fa-solid fa-address-card pointer-events-none"></i>
                            </button>

                            <button title="Editar" class="editarCliente fa-solid fa-pen-to-square" data-id="<?php echo $u['id_cliente']; ?>" style="background-color: #c1c13c; color: white; border-radius: 5px; padding: 5px 8px; cursor: pointer; border: none;"></button>

                            <button title="Eliminar" class="eliminarCliente fa-solid fa-trash" data-id="<?php echo $u['id_cliente']; ?>" style="background-color: #cb2c3c; color: white; border-radius: 5px; padding: 5px 8px; cursor: pointer; border: none;"></button>
                        </td>
                    </tr>
                <?php endforeach; ?>
            </tbody>
        </table>
        <!-- Mensaje no encuentra resultados -->
        <p class="mensajevacio" id="mensaje-vacio" style="display: none;">No se encontraron resultados.</p>


        <!-- Modal para crear Cliente -->
        <div id="crear-modalCliente" class="modal" style="display: none;">
            <div class="modal-content">
                <span title="Cerrar" class="close" onclick="cerrarModalCliente('crear-modalCliente')">&times;</span>
                <legend>Crear cliente</legend>
                <form id="form-crearCliente" onsubmit="validarFormularioCliente(event, 'crear')" novalidate>

                    <div class="form-group">
                        <label for="crear-cliente">Nombre:</label>
                        <input type="text" id="crear-cliente" name="cliente" autocomplete="off"
                            pattern="[a-zA-ZÀ-ÿ\s]+"
                            title="Solo se permiten letras y espacios."
                            oninput="this.value = this.value.replace(/[^a-zA-ZÀ-ÿ\s]/g, '')" required>
                    </div>
                    <div class="form-group">
                        <label for="crear-papellido">Primer apellido:</label>
                        <input type="text" id="crear-papellido" name="papellido" autocomplete="off"
                            pattern="[a-zA-ZÀ-ÿ\s]+"
                            title="Solo se permiten letras y espacios."
                            oninput="this.value = this.value.replace(/[^a-zA-ZÀ-ÿ\s]/g, '')" required>
                    </div>
                    <div class="form-group">
                        <label for="crear-sapellido">Segundo apellido:</label>
                        <input type="text" id="crear-sapellido" name="sapellido" autocomplete="off"
                            pattern="[a-zA-ZÀ-ÿ\s]+"
                            title="Solo se permiten letras y espacios."
                            oninput="this.value = this.value.replace(/[^a-zA-ZÀ-ÿ\s]/g, '')" required>
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
                            <input type="text" inputmode="numeric" id="crear-telefono" name="telefono" autocomplete="off" maxlength="10"
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
                <form id="form-editarCliente" novalidate>

                    <input type="hidden" id="editar-idcliente" name="editar-idcliente" value="" />

                    <div class="form-group">
                        <label for="editar-cliente">Nombre:</label>
                        <input type="text" id="editar-cliente" name="cliente" autocomplete="off"
                            pattern="[a-zA-ZÀ-ÿ\s]+"
                            title="Solo se permiten letras y espacios."
                            oninput="this.value = this.value.replace(/[^a-zA-ZÀ-ÿ\s]/g, '')" required>
                    </div>

                    <div class="form-group">
                        <label for="editar-papellido">Primer apellido:</label>
                        <input type="text" id="editar-papellido" name="papellido" autocomplete="off"
                            pattern="[a-zA-ZÀ-ÿ\s]+"
                            title="Solo se permiten letras y espacios."
                            oninput="this.value = this.value.replace(/[^a-zA-ZÀ-ÿ\s]/g, '')" required>
                    </div>
                    <div class="form-group">
                        <label for="editar-sapellido">Segundo apellido:</label>
                        <input type="text" id="editar-sapellido" name="sapellido" autocomplete="off"
                            pattern="[a-zA-ZÀ-ÿ\s]+"
                            title="Solo se permiten letras y espacios."
                            oninput="this.value = this.value.replace(/[^a-zA-ZÀ-ÿ\s]/g, '')" required>
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
                                oninput="this.value = this.value.replace(/[^a-zA-ZÀ-ÿ0-9]/g, '')" size="6" min="0" maxlength="6">
                        </div>
                    </div>

                    <div class="form-group">
                        <label for="estado">Estado</label>
                        <select name="estado" id="editar-estado">
                            <?php foreach ($estados as $row) : ?>
                                <option value="<?php echo $row['id']; ?>"><?php echo $row['nombre']; ?></option>
                            <?php endforeach; ?>
                        </select>
                    </div>

                    <div class="form-group">
                        <label for="municipio">Municipio</label>
                        <select name="municipio" id="editar-municipio">
                            <option value="">Seleccionar</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label for="colonia">Colonia</label>
                        <select name="colonia" id="editar-colonia">
                            <option value="">Seleccionar</option>
                        </select>
                    </div>

                    <div class="form-group ladoble">
                        <label for="codigo_postal">Código Postal</label>
                        <input type="text" name="codigo_postal" id="editar-codigo_postal" readonly>
                    </div>

                    <div class="form-group">
                        <label for="editar-email">Email:</label>
                        <input type="email" id="editar-email" name="email" autocomplete="off" required>
                    </div>

                    <div class="form-group">
                        <label for="editar-telefono">Teléfono:</label>
                        <input type="text" id="editar-telefono" name="telefono" autocomplete="off" maxlength="10"
                            pattern="\d{10}"
                            title="Por favor, ingrese un número de telefono de 10 dígitos."
                            oninput="this.value = this.value.replace(/[^0-9]/g, '')" required>
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
                    <span class="cancelarModal" onclick="cerrarModalCliente('editar-modalCliente')" type=" submit">Cancelar</span>

                </form>
            </div>
        </div>

        <!-- Modal para expediente Cliente -->
        <div id="expediente-modalCliente" class="modal" style="display: none;">
            <div class="modal-content" style="max-width: 900px; width: 95%;">
                <span title="Cerrar" class="close" onclick="cerrarModalCliente('expediente-modalCliente')">&times;</span>
                <h2 class="tittle"><i class="fa-solid fa-address-card"></i> Expediente del Cliente</h2>

                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin-top: 15px;">

                    <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; border: 1px solid #eee;">
                        <h4 style="margin-top: 0; color: #333; border-bottom: 2px solid #17a2b8; padding-bottom: 5px;">Perfil</h4>
                        <h3 id="exp-nombre" style="margin: 5px 0; color: #0d6efd;">Cargando...</h3>
                        <p style="margin: 5px 0; font-size: 13px;"><strong><i class="fa-solid fa-phone"></i></strong> <span id="exp-telefono">...</span></p>
                        <p style="margin: 5px 0; font-size: 13px;"><strong><i class="fa-solid fa-envelope"></i></strong> <span id="exp-email">...</span></p>
                        <p style="margin: 5px 0; font-size: 13px;"><strong><i class="fa-solid fa-map-location-dot"></i></strong> <span id="exp-direccion">...</span></p>
                        <button id="exp-btn-whatsapp" class="btn-accion" style="background-color: #25D366; width: 100%; margin-top: 10px; border:none; padding: 8px; color: white; border-radius: 5px; cursor: pointer;">
                            <i class="fa-brands fa-whatsapp"></i> Enviar Mensaje
                        </button>
                    </div>

                    <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; border: 1px solid #eee; display: flex; flex-direction: column; justify-content: center; text-align: center;">
                        <h4 style="margin-top: 0; color: #333; border-bottom: 2px solid #28a745; padding-bottom: 5px; text-align: left;">Valor Acumulado</h4>
                        <div style="font-size: 32px; font-weight: bold; color: #28a745;" id="exp-total-gastado">$0.00</div>
                        <div style="font-size: 13px; color: #666;">Total invertido en el taller</div>
                        <br>
                        <div style="display: flex; justify-content: space-around; margin-top: 10px;">
                            <div>
                                <strong style="font-size: 20px; color: #333;" id="exp-total-ordenes">0</strong><br>
                                <span style="font-size: 11px; color: #666;">Órdenes Totales</span>
                            </div>
                            <div>
                                <strong style="font-size: 20px; color: #dc3545;" id="exp-total-canceladas">0</strong><br>
                                <span style="font-size: 11px; color: #666;">Canceladas</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div style="margin-top: 20px;">
                    <h4 style="color: #333; border-bottom: 2px solid #6f42c1; padding-bottom: 5px;"><i class="fa-solid fa-laptop-medical"></i> Historial de Órdenes y Equipos</h4>

                    <div class="tabla-responsive" style="max-height: 250px; overflow-y: auto;">
                        <table class="tbl" style="width: 100%; font-size: 12px;">
                            <thead>
                                <tr>
                                    <th>Folio</th>
                                    <th>Fecha</th>
                                    <th>Equipo</th>
                                    <th>Falla / Servicio</th>
                                    <th>Estado</th>
                                    <th>Total</th>
                                </tr>
                            </thead>
                            <tbody id="exp-tabla-ordenes">
                                <tr>
                                    <td colspan="6" style="text-align: center;">Cargando historial...</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </div>
    </div>
</div>