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

$tiendas = obtenerRegistros($dbh, "talleres", "id_taller, nombre_t, razonsocial_t, rfc_t, email_t, tel_t, estatus_t", "ASC", "id_taller");
$estados = obtenerEstados($dbh);
$municipios = obtenerMunicipios($dbh);
$colonias = obtenerColonias($dbh);

?>

<div class="containerr">
    <button class="boton" onclick="abrirModal('crear-modal')">Nuevo</button>
    <label class="buscarlabel" for="buscarbox">Buscar:</label>
    <input class="buscar--box" id="buscarbox" type="search" placeholder="¿Qué estás buscando?" autocomplete="off">

    <!-- Filtro de estatus -->
    <label class="buscarlabel" for="estatusFiltroT">Filtrar por Estatus:</label>
    <select class="buscar--box" id="estatusFiltroT" onchange="cargarTiendasFiltradas()" style="width: 100px;">
        <option value="">Todos</option>
        <option value="Activo">Activo</option>
        <option value="Inactivo">Inactivo</option>
    </select>
</div>

<div class="container_dashboard_tablas" id="tiendas">
    <h3>Lista de talleres</h3>
    <div id="scroll-container" style="height: 65vh; overflow-y: auto; position: relative;">

        <table class="tbl" id="tabla-tiendas">
            <thead>
                <tr>
                    <th>Nombre del taller</th>
                    <th>Nombre, denominación o razón social</th>
                    <th>R.F.C.</th>
                    <th>Email</th>
                    <th>Teléfono</th>
                    <th>Estatus</th>
                    <th colspan="2" style="text-align: center;">Acciones</th>
                </tr>

            </thead>
            <tbody id="tiendas-lista">
                <?php foreach ($tiendas as $tienda) : ?>
                    <tr>
                        <td data-lable="Nombre: "><?php echo $tienda['nombre_t']; ?></td>
                        <td data-lable="Nombre, denominación o razón social: "><?php echo $tienda['razonsocial_t']; ?></td>
                        <td data-lable="R.F.C.: "><?php echo $tienda['rfc_t']; ?></td>
                        <td data-lable="Email: "><?php echo $tienda['email_t']; ?></td>
                        <td data-lable="Teléfono"><?php echo $tienda['tel_t']; ?></td>
                        <td data-lable="Estatus"><button class="btn <?php echo ($tienda['estatus_t'] == 0) ? 'btn-success' : 'btn-danger'; ?>">
                                <?php echo ($tienda['estatus_t'] == 0) ? 'Activo' : 'Inactivo'; ?>
                            </button></td>
                        <td data-lable=" Editar">
                            <button title="Editar" class="editar fa-solid fa-pen-to-square" data-id="<?php echo $tienda['id_taller']; ?>"></button>
                        </td>
                        <td data-lable="Eliminar">
                            <button title="Eliminar" class="eliminar fa-solid fa-trash" data-id="<?php echo $tienda['id_taller']; ?>"></button>
                        </td>

                    </tr>
                <?php endforeach; ?>
            </tbody>
        </table>
        <!-- Mensaje no encuentra resultados -->
        <p class="mensajevacio" id="mensaje-vacio" style="display: none;">No se encontraron resultados.</p>
    </div>

    <!-- Modal para crear taller -->
    <div id="crear-modal" class="modal" style="display: none;">
        <div class="modal-content">
            <span title="Cerrar" class="close" onclick="cerrarModal('crear-modal')">&times;</span>
            <h2 class="tittle">Crear taller</h2>
            <form id="form-crear" onsubmit="validarFormularioTienda(event)">
                <div class="form-group">
                    <label for="crear-nombre">Nombre del taller:</label>
                    <input type="text" id="crear-nombre" name="nombre" autocomplete="off"
                        pattern="[a-zA-ZÀ-ÿ\s]+"
                        title="Solo se permiten letras y espacios."
                        oninput="this.value = this.value.replace(/[^a-zA-ZÀ-ÿ\s]/g, '')" required>
                </div>
                <div class="form-group">
                    <label for="crear-razonsocial">Nombre, denominación o razón social:</label>
                    <input type="text" id="crear-razonsocial" name="razonsocial" autocomplete="off"
                        pattern="[a-zA-ZÀ-ÿ\s]+"
                        title="Solo se permiten letras y espacios."
                        oninput="this.value = this.value.replace(/[^a-zA-ZÀ-ÿ\s]/g, '')" required>
                </div>

                <div class="form-group">
                    <label for="crear-rfc">R.F.C.:</label>
                    <input type="text" id="crear-rfc" name="rfc" autocomplete="off" maxlength="13"
                        pattern="[a-zA-Z0-9]+"
                        title="Solo se permiten letras y números."
                        oninput="this.value = this.value.replace(/[^a-zA-Z0-9]/g, '')" required>
                </div>

                <div class="form-group">
                    <label for="crear-calle">Calle:</label>
                    <input type="text" id="crear-calle" name="calle" autocomplete="off"
                        pattern="[a-zA-ZÀ-ÿ\s]+"
                        title="Solo se permiten letras y espacios."
                        oninput="this.value = this.value.replace(/[^a-zA-ZÀ-ÿ\s]/g, '')" required>
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
                        <label for="crear-nointerior">No. Interior:</label>
                        <input type="text" id="crear-nointerior" name="nointerior" autocomplete="off" size="10" min="0" value="0"
                            title="Solo se permiten letras y números."
                            oninput="this.value = this.value.replace(/[^a-zA-ZÀ-ÿ0-9]/g, '')" size=" 10" min="0" value="0" maxlength="6" required>
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
                    <input type="text" name="codigo_postal" id="codigo_postal" readonly>
                </div>

                <div class="form-group">
                    <label for="crear-email">Email:</label>
                    <input type="email" id="crear-email" name="email" autocomplete="off" required>
                </div>

                <div class="form-containernum">

                    <div class="form-group" style="width: 40%">
                        <label for="crear-telefono">Teléfono:</label>
                        <input type="text" id="crear-telefono" name="telefono" autocomplete="off" maxlength="10 "
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
                <div class="form-containernum">
                    <button type="submit">Guardar</button>
                    <span class="cancelarModal" onclick="cerrarModal('crear-modal')" type=" submit">Cancelar</span>
                </div>
            </form>
        </div>
    </div>

    <!-- Modal para editar taller  -->
    <div id="editar-modal" class="modal" style="display: none;">
        <div class="modal-content">
            <span title="Cerrar" class="close" onclick="cerrarModal('editar-modal')">&times;</span>
            <h2 class="tittle">Editar taller</h2>
            <form id="form-editar">
                <input type="hidden" id="editar-id" name="editar-id" value="" />
                <div class="form-group">
                    <label class="form-group" for="editar-nombre">Nombre:</label>
                    <input type="text" id="editar-nombre" name="nombre" autocomplete="off" pattern="[a-zA-ZÀ-ÿ\s]+" title="Solo se permiten letras y espacios." oninput="this.value = this.value.replace(/[^a-zA-ZÀ-ÿ\s]/g, '')" required />
                </div>

                <div class="form-group">
                    <label for="editar-razonsocial">Nombre, denominación o razón social:</label>
                    <input type="text" id="editar-razonsocial" name="razonsocial" autocomplete="off" pattern="[a-zA-ZÀ-ÿ\s]+" title="Solo se permiten letras y espacios." oninput="this.value = this.value.replace(/[^a-zA-ZÀ-ÿ\s]/g, '')" required />
                </div>

                <div class="form-group">
                    <label for="editar-rfc">R.F.C.:</label>
                    <input type="text" id="editar-rfc" name="rfc" maxlength="13" autocomplete="off" maxlength="13" pattern="[a-zA-Z0-9]+" title="Solo se permiten letras y números." oninput="this.value = this.value.replace(/[^a-zA-Z0-9]/g, '')" required />
                </div>

                <div class="form-group">
                    <label for="editar-calle">Calle:</label>
                    <input type="text" id="editar-calle" name="calle" autocomplete="off"
                        pattern="[a-zA-ZÀ-ÿ\s]+"
                        title="Solo se permiten letras y espacios."
                        oninput="this.value = this.value.replace(/[^a-zA-ZÀ-ÿ\s]/g, '')" size="10" min="0" maxlength="30" required>
                </div>

                <div class="form-containernum">
                    <div class="form-group ladoble">
                        <label for="editar-noexterior">No. exterior:</label>
                        <input type="number" id="editar-noexterior" name="noexterior" autocomplete="off"
                            pattern="[0-9]+"
                            title="Solo se permiten númerosx."
                            oninput="this.value = this.value.replace(/[^0-9\s]/g, '')" size="6" min="0" maxlength="6" required>
                    </div>

                    <div class="form-group ladoble">
                        <label for="editar-nointerior">No. Interior:</label>
                        <input type="text" id="editar-nointerior" name="nointerior" autocomplete="off" size="10" min="0" value="0" title="Solo se permiten letras y números." oninput="this.value = this.value.replace(/[^a-zA-ZÀ-ÿ0-9]/g, '')" maxlength="6">
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
                        <input type="email" id="editar-email" name="email" autocomplete="off" required />
                    </div>

                    <div class="form-group">
                        <label for="editar-telefono">Teléfono:</label>
                        <input type="numeric" id="editar-telefono" name="telefono" autocomplete="off" maxlength="10 "
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
                    <span class="cancelarModal" onclick="cerrarModal('editar-modal')" type=" submit">Cancelar</span>
            </form>
        </div>
    </div>
</div><!--End container -->