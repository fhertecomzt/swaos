<?php

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

$roles_permitidos = ["superusuario", "gerencia"];

//Includes
include "verificar_sesion.php";
include "conexion.php";
include "funciones/funciones.php";
include "funciones/rellenos.php"; //Rellena los select de roles y tiendas
include "funciones/activoinactivo.php";

//Función obtener usuarios ocultando los rol de SISTEMAS
$usuarios = obtenerUsuarios($dbh);
?>

<div class="containerr">
    <button class="boton" onclick="abrirModalUser('crear-modalUser')">Nuevo</button>
    <label class="buscarlabel" for="buscarboxusuario">Buscar:</label>
    <input class="buscar--box" id="buscarboxusuario" type="search" placeholder="¿Qué estas buscando?" autocomplete="off">

    <!-- Filtro de estatus -->
    <label class="buscarlabel" for="estatusFiltroU">Filtrar por Estatus:</label>
    <select class="buscar--box" id="estatusFiltroU" onchange="cargarUsuariosFiltrados()" style="width: 100px;">
        <option value="">Todos</option>
        <option value="Activo">Activo</option>
        <option value="Inactivo">Inactivo</option>
    </select>
</div>

<div class="container_dashboard_tablas" id="usuarios">
    <h3>Lista de Usuarios</h3>
    <div id="scroll-containerU" style="height: 65vh; overflow-y: auto; position: relative;">

        <table class="tbl" id="tabla-usuarios">
            <thead>
                <tr>
                    <th>Imagen</th>
                    <th>Usuario</th>
                    <th>Nombre</th>
                    <th>Primer Apellido</th>
                    <th>Segundo Apellido</th>
                    <th>Rol</th>
                    <th>Taller</th>
                    <th>Estatus</th>
                    <th colspan="2" style="text-align: center;">Acciones</th>
                </tr>
            </thead>

            <tbody id="usuarios-lista">
                <?php foreach ($usuarios as $u): ?>
                    <tr>
                        <td data-lable="Imagen"><?php if (!empty($u['imagen'])): ?>
                                <img src=" <?php echo htmlspecialchars($u['imagen']); ?>" alt="Imagen de perfil" width="50" height="50">
                            <?php else: ?>
                                Sin imagen
                            <?php endif; ?>
                        </td>
                        <td data-lable="Usuario:"><?php echo htmlspecialchars($u['usuario']); ?></td>
                        <td data-lable="Nombre:"><?php echo htmlspecialchars($u['nombre']); ?></td>
                        <td data-lable="Primer apellido:"><?php echo htmlspecialchars($u['p_appellido']); ?></td>
                        <td data-lable="Segundo apellido:"><?php echo htmlspecialchars($u['s_appellido']); ?></td>
                        <td data-lable="Rol:"><?php echo htmlspecialchars($u['nom_rol']); ?></td>
                        <td data-lable="Tienda:"><?php echo htmlspecialchars($u['nombre_t']); ?></td>
                        <td data-lable="Estatus:"><button class="btn <?php echo ($u['estatus'] == 0) ? 'btn-success' : 'btn-danger'; ?>">
                                <?php echo ($u['estatus'] == 0) ? 'Activo' : 'Inactivo'; ?>
                            </button></td>

                        <td data-lable="Editar:">
                            <button title="Editar" class="editarUser fa-solid fa-pen-to-square" data-id="<?php echo $u['id_usuario']; ?>"></button>
                        </td>
                        <td data-lable="Eliminar:">
                            <button title=" Eliminar" class="eliminarUser fa-solid fa-trash" data-id="<?php echo $u['id_usuario']; ?>"></button>
                        </td>
                    </tr>
                <?php endforeach; ?>
            </tbody>
        </table>

        <!-- Mensaje no encuentra resultados -->
        <p class="mensajevacio" id="mensaje-vacio" style="display: none; color: red;">No se encontraron resultados.</p>


        <!-- Modal para crear Usuario -->
        <div id="crear-modalUser" class="modal" style="display: none;">
            <div class="modal-contentUsuarios" style="height: 700px;">
                <span title="Cerrar" class="close" onclick="cerrarModalUser('crear-modalUser')">&times;</span>
                <h2 class="tittle">Crear Usuario</h2>
                <form id="form-crearUser" enctype="multipart/form-data">

                    <div class="form-group">
                        <label for="crear-usuario">Usuario:</label>
                        <input type="text" id="crear-usuario" name="usuario" autocomplete="off"
                            pattern="[a-zA-ZÀ-ÿ0-9\s]+"
                            title="Solo se permiten letras, números y espacios."
                            oninput="this.value = this.value.replace(/[^a-zA-ZÀ-ÿ0-9\s]/g, '')" required>
                    </div>

                    <div class="form-group">
                        <label for="crear-nombre">Nombre:</label>
                        <input type="text" id="crear-nombre" name="nombre" autocomplete="off"
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
                        <label for="crear-sapellido">Segundo apellido :</label>
                        <input type="text" id="crear-sapellido" name="sapellido" autocomplete="off"
                            pattern="[a-zA-ZÀ-ÿ0-9\s]+"
                            title="Solo se permiten letras, números y espacios."
                            oninput="this.value = this.value.replace(/[^a-zA-ZÀ-ÿ0-9\s]/g, '')" required>
                    </div>

                    <div class="form-group">
                        <label for="crear-email">Email:</label>
                        <input type="email" id="crear-email" name="email" autocomplete="off" required>
                    </div>

                    <!-- Selección del rol -->
                    <div class="form-group">
                        <label for="crear-rol">Rol:</label>
                        <select id="crear-rol" name="rol" required>
                            <option value="">[Selecciona un rol]</option>
                            <?php
                            // Asumiendo que $lista_roles es un array de roles
                            foreach ($lista_roles as $rol): ?>
                                <option value="<?php echo htmlspecialchars($rol['id_rol']); ?>" <?php echo (isset($usuario) && $usuario['id_rol'] == $rol['id_rol']) ? 'selected' : ''; ?>>
                                    <?php echo htmlspecialchars($rol['nom_rol']); ?>
                                </option>
                            <?php endforeach; ?>
                        </select>
                    </div>

                    <div class="form-group">
                        <label for="crear-password1">Contraseña:</label>
                        <input type="password" id="crear-password1" name="password1" autocomplete="off" required>
                    </div>

                    <div class="form-group">
                        <label for="crear-password2">Confirma Contraseña:</label>
                        <input type="password" id="crear-password2" name="password2" autocomplete="off" required>
                    </div>

                    <!-- Selección de la taller -->
                    <div class="form-group">
                        <label for="crear-tienda">Taller:</label>
                        <select id="crear-tienda" name="tienda" required>
                            <option value="">[Selecciona un taller]</option>
                            <?php
                            foreach ($lista_tiendas as $tienda): ?>
                                <option value="<?php echo htmlspecialchars($tienda['id_taller']); ?>" <?php echo (isset($usuario) && $usuario['taller_id'] == $tienda['id_taller']) ? 'selected' : ''; ?>>
                                    <?php echo htmlspecialchars($tienda['nombre_t']); ?>
                                </option>
                            <?php endforeach; ?>
                        </select>
                    </div>

                    <div class="form-group">
                        <label for="crear-imagen">Imagen de perfil:</label>
                        <input type="file" id="crear-imagen" name="imagen" accept="image/*">
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
                    <span class="cancelarModal" onclick="cerrarModal('crear-modalUser')" type=" submit">Cancelar</span>

                </form>
            </div>
        </div>

        <!-- Modal para editar Usuario *****************************************-->
        <div id="editar-modalUser" class="modal" style="display: none;">
            <div class="modal-contentUsuarios">
                <span title="Cerrar" class="close" onclick="cerrarModalUser('editar-modalUser')">&times;</span>
                <h2 class="tittle">Editar Usuario</h2>

                <form id="form-editarUser" enctype="multipart/form-data" method="post">
                    <input type="hidden" id="editar-idusuario" name="editar-idusuario" value="" />

                    <div class="form-group">
                        <label for="editar-usuario">Usuario:</label>
                        <input type="text" id="editar-usuario" name="usuario" autocomplete="off"
                            pattern="[a-zA-ZÀ-ÿ0-9\s]+"
                            title="Solo se permiten letras, números y espacios."
                            oninput="this.value = this.value.replace(/[^a-zA-ZÀ-ÿ0-9\s]/g, '')" required>
                    </div>

                    <div class="form-group">
                        <label for="editar-nombre">Nombre:</label>
                        <input type="text" id="editar-nombre" name="nombre" autocomplete="off"
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
                        <label for="editar-sapellido">Segundo apellido :</label>
                        <input type="text" id="editar-sapellido" name="sapellido" autocomplete="off"
                            pattern="[a-zA-ZÀ-ÿ0-9\s]+"
                            title="Solo se permiten letras, números y espacios."
                            oninput="this.value = this.value.replace(/[^a-zA-ZÀ-ÿ0-9\s]/g, '')" required>
                    </div>

                    <div class="form-group">
                        <label for="editar-email">Email:</label>
                        <input type="email" id="editar-email" name="email" autocomplete="off" required>
                    </div>

                    <!-- Selección del rol -->
                    <div class="form-group">
                        <label for="editar-rol">Rol:</label>
                        <select id="editar-rol" name="rol" required>
                            <option value="">[Selecciona un rol]</option>
                            <?php foreach ($lista_roles as $rol): ?>
                                <option value="<?php echo htmlspecialchars($rol['nom_rol']); ?>"
                                    data-nomrol="<?php echo htmlspecialchars($rol['nom_rol']); ?>"
                                    <?php echo (isset($usuario) && $usuario['id_rol'] == $rol['id_rol']) ? 'selected' : ''; ?>>
                                    <?php echo htmlspecialchars($rol['nom_rol']); ?>
                                </option>
                            <?php endforeach; ?>
                        </select>
                    </div>

                    <div class="form-group">
                        <label for="editar-password1">Contraseña:</label>
                        <input type="password" id="editar-password1" name="password1" autocomplete="off">
                    </div>

                    <div class="form-group">
                        <label for="editar-password2">Confirma Contraseña:</label>
                        <input type="password" id="editar-password2" name="password2" autocomplete="off">
                    </div>

                    <!-- Selección de la tienda -->
                    <div class="form-group">
                        <label for="editar-tienda">Tienda:</label>
                        <select id="editar-tienda" name="tienda" required>
                            <option value="">[Selecciona un taller]</option>
                            <?php foreach ($lista_tiendas as $tienda): ?>
                                <option value="<?php echo htmlspecialchars($tienda['nombre_t']); ?>"
                                    data-nomrol="<?php echo htmlspecialchars($tienda['nombre_t']); ?>"
                                    <?php echo (isset($usuario) && $usuario['nombre_t'] == $tienda['id_taller']) ? 'selected' : ''; ?>>
                                    <?php echo htmlspecialchars($tienda['nombre_t']); ?>
                                </option>
                            <?php endforeach; ?>
                        </select>
                    </div>

                    <div class="form-group">
                        <label for="imagen">Imagen de perfil:</label>
                        <input type="file" id="imagen" name="imagen" accept="image/*">
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
                    <span class="cancelarModal" onclick="cerrarModalRol('editar-modalUser')" type=" submit">Cancelar</span>
                </form>
            </div>
        </div>
    </div>
</div><!--End container -->