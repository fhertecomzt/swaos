<?php

if (session_status() === PHP_SESSION_NONE) {
  session_start();
}

$roles_permitidos = ["superusuario"];

//Includes
include "verificar_sesion.php";
include "conexion.php";
include "funciones/funciones.php";
include "funciones/rellenos.php"; //Rellenos de los selects tienda y roles
include "funciones/activoinactivo.php";

//Función obtener usuarios de los roles de superusuario
$usuarios = obtenerUsuariosSup($dbh);
?>

<div class="containerr">
  <button class="boton" onclick="abrirModalUser('crear-modalUserSup')">Nuevo</button>
  <label class="buscarlabel" for="buscarboxusuarioSup">Buscar:</label>
  <input class="buscar--box" id="buscarboxusuarioSup" type="search" placeholder="Qué estas buscando?">

  <!-- Filtro de estatus -->
  <label class="buscarlabel" for="estatusFiltroUSup">Filtrar por Estatus:</label>
  <select class="buscar--box" id="estatusFiltroUSup" onchange="cargarUsuariosFiltradosSup()" style="width: 100px;">
    <option value="">Todos</option>
    <option value="Activo">Activo</option>
    <option value="Inactivo">Inactivo</option>
  </select>
</div>

<div class="container_dashboard_tablas" id="usuarios">
  <h3>Lista de Super usuarios</h3>
  <div id="scroll-containerUSup" style="height: 65vh; overflow-y: auto; position: relative;">
    <table class="tbl" id="tabla-usuariosSup">
      <thead>
        <tr>
          <th>Imagen</th>
          <th>Usuario</th>
          <th>Nombre</th>
          <th>Primer Apellido</th>
          <th>Segundo Apellido</th>
          <th>Rol</th>
          <th>Taller</th>
          <th>Acciones</th>
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
            <td data-lable="Taller:"><?php echo htmlspecialchars($u['nombre_t']); ?></td>
            <td data-lable="Estatus:"><button class="btn <?php echo ($u['estatus'] == 0) ? 'btn-success' : 'btn-danger'; ?>">
                <?php echo ($u['estatus'] == 0) ? 'Activo' : 'Inactivo'; ?>
              </button></td>

            <td data-lable="Editar:">
              <button title="Editar" class="editarUserSup fa-solid fa-pen-to-square" data-id="<?php echo $u['id_usuario']; ?>"></button>
            </td>
            <td data-lable="Eliminar:">
              <button title=" Eliminar" class="eliminarUserSup fa-solid fa-trash" data-id="<?php echo $u['id_usuario']; ?>"></button>
            </td>
          </tr>
        <?php endforeach; ?>
      </tbody>
    </table>

    <!-- Mensaje no encuentra resultados -->
    <p class="mensajevacio" id="mensaje-vacio" style="display: none; color: red;">No se encontraron resultados.</p>

    <!-- Modal para crear Usuario -->
    <div id="crear-modalUserSup" class="modal" style="display: none;">
      <div class="modal-contentUsuariosSup" style="height: 700px;">
        <span title="Cerrar" class="close" onclick="cerrarModalUser('crear-modalUserSup')">&times;</span>
        <h2 class="tittle">Crear SuperUsuario</h2>
        <form id="form-crearUserSup" enctype="multipart/form-data">

          <div class="form-group">
            <label for="crear-usuario">SuperUsuario:</label>
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
              foreach ($lista_rolesfull as $rolfull): ?>
                <option value="<?php echo htmlspecialchars($rolfull['id_rol']); ?>" <?php echo (isset($usuario) && $usuario['id_rol'] == $rolfull['id_rol']) ? 'selected' : ''; ?>>
                  <?php echo htmlspecialchars($rolfull['nom_rol']); ?>
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
          <span class="cancelarModal" onclick="cerrarModal('crear-modalUserSup')" type=" submit">Cancelar</span>

        </form>
      </div>
    </div>

    <!-- Modal para editar Usuario editarUserSup  -->
    <div id="editar-modalUserSup" class="modal" style="display: none;">
      <div class="modal-contentUsuariosSup" style="height: 700px;">
        <span title="Cerrar" class="close" onclick="cerrarModalUser('editar-modalUserSup')">&times;</span>
        <h2 class="tittle">Editar SuperUsuario</h2>

        <form id="form-editarUserSup">
          <input type="hidden" id="editar-idusuario" name="editar-idusuario" value="" />

          <div class="form-group">
            <label for="editar-usuario">Usuario:</label>
            <input type="text" id="editar-usuario" name="usuario" autocomplete="off" required>
          </div>

          <div class="form-group">
            <label for="editar-nombre">Nombre:</label>
            <input type="text" id="editar-nombre" name="nombre" autocomplete="off" required>
          </div>

          <div class="form-group">
            <label for="editar-papellido">Primer apellido:</label>
            <input type="text" id="editar-papellido" name="papellido" autocomplete="off" required>
          </div>

          <div class="form-group">
            <label for="editar-sapellido">Segundo apellido :</label>
            <input type="text" id="editar-sapellido" name="sapellido" autocomplete="off" required>
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
              <?php foreach ($lista_rolesfull as $rol): ?>
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
            <input type="text" id="editar-password1" name="password1" autocomplete="off">
          </div>

          <div class="form-group">
            <label for="editar-password2">Confirma Contraseña:</label>
            <input type="text" id="editar-password2" name="password2" autocomplete="off">
          </div>

          <!-- Selección del taller -->
          <div class="form-group">
            <label for="editar-tienda">Taller:</label>
            <select id="editar-tienda" name="tienda" required>
              <option value="">[Selecciona un taller]</option>
              <?php foreach ($lista_tiendas as $tienda): ?>
                <option value="<?php echo htmlspecialchars($tienda['nombre_t']); ?>" <?php echo (isset($usuario) && $usuario['taller_id'] == $tienda['id_taller']) ? 'selected' : ''; ?>>
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
          <span class="cancelarModal" onclick="cerrarModalUserSup('editar-modalUserSup')" type=" submit">Cancelar</span>
        </form>
      </div>
    </div>