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
?>

<div class="containerr">
    <!-- <button class="boton" onclick="abrirModalRol('crear-modalRol')">Nuevo</button> -->
    <!--Titulo perfil de usuario -->
    <h2 style="margin: 15px;"><i class="fa-solid fa-user-pen"></i> Perfil de usuario</h2>
</div>

<div class="container_dashboard_tablas" id="perfil">
    <div style="display: flex; margin:10%">
        <div style="width: 60%; ">
            <table id="tablaPerfilUsuarios">
                <thead>
                    <tr>
                        <th>Taller:</th>
                        <td><?php echo $_SESSION['nombre_t'] ?></td>
                    </tr>
                    <tr>
                        <th>Usuario:</th>
                        <td><?php echo $_SESSION['usuario'] ?></td>
                    </tr>
                    <tr>
                        <th>Nombre completo:</th>
                        <td><?php echo $_SESSION['nombre'] . " " . $_SESSION['appaterno'] . " " . $_SESSION['apmaterno']; ?></td>
                    </tr>
                    <tr>
                        <th>Rol:</th>
                        <td><?php echo $_SESSION['rol']; ?></td>
                    </tr>
                    <tr>
                        <th>Taller:</th>
                        <td><?php echo $_SESSION['email']; ?></td>
                    </tr>
                    <tr>
                        <th>Contraseña:</th>
                        <td><input id="#tablaPerfilUsuarios" type="password" value="*************" placeholder="" disabled>
                            <button title="Cambiar contraseña" class="editarPerfilUser fa-solid fa-pen" onclick="abrirModalPerfilUser('editar-modalPerfilUser', <?php echo $_SESSION['idusuario']; ?>)"></button>
                        </td>
                    </tr>
                </thead>
            </table>
        </div>
        <div style="width: 40%; text-align: center;">

            <form id="form-editarFoto" enctype="multipart/form-data" method="POST">
                <div class="imagen-placeholder-perfil">

                    <img src="<?php echo htmlspecialchars($_SESSION['imagen']); ?>"
                        alt="Imagen de perfil"
                        width="200"
                        height="200"
                        id="previewImagenPerfil"
                        title="Haz clic para cambiar tu foto">

                    <input type="file"
                        id="inputImagenPerfil"
                        name="imagen_perfil"
                        accept="image/jpeg, image/png"
                        style="display: none;">

                    <input type="hidden" name="id_usuario_foto" value="<?php echo $_SESSION['idusuario']; ?>">
                </div>

                <div style="margin-top: 10px;">
                    <button type="button" class="boton-secundario" id="btnSeleccionarFoto">
                        Seleccionar Foto
                    </button>
                    <button type="submit" class="boton" id="btnGuardarFoto" style="display: none; width: 100px">
                        Guardar Foto
                    </button>
                </div>
            </form>

        </div>

        <style>
            .imagen-placeholder-perfil img {
                cursor: pointer;
                border-radius: 25%;
                /* Para que se vea circular */
                border: 3px solid #ddd;
                transition: opacity 0.3s;
            }

            .imagen-placeholder-perfil img:hover {
                opacity: 0.7;
            }
        </style>
    </div>
    <!-- Modal para editar perfil de Usuario **************************************-->
    <div id="editar-modalPerfilUser" class="modal" style="display: none;">
        <div class="modal-contentPerfilUsuario">
            <span title="Cerrar" class="close" onclick="cerrarModalPerfilUser('editar-modalPerfilUser')">&times;</span>
            <h2 class="tittle">Editar contraseña</h2>

            <form id="form-editarPerfilUser" method="POST">
                <input type="hidden" id="editar-idperfilusuario" name="id_usuario_perfil" value="" />

                <div class="form-group">
                    <label for="editar-passwordactual">Contraseña Actual:</label>
                    <input type="password" id="editar-passwordactual" name="password_actual" autocomplete="off" required>
                </div>
                <div class="form-group">
                    <label for="editar-password1">Nueva Contraseña:</label>
                    <input type="password" id="editar-password1" name="password1" autocomplete="off">
                </div>

                <div class="form-group">
                    <label for="editar-password2">Confirmar Nueva Contraseña:</label>
                    <input type="password" id="editar-password2" name="password2" autocomplete="off">
                </div>
                <button type="submit">Actualizar</button>
                <span class="cancelarModal" onclick="cerrarModalPerfilUser('editar-modalPerfilUser')" type=" submit">Cancelar</span>
            </form>
        </div>
    </div><!--End modal perfil de usuario -->

</div><!--End container -->