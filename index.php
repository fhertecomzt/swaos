<?php

session_start();

require_once 'php/config_keys.php';

// Manejar mensajes de error y añadirlos a la sesión
if (isset($_GET['session_expired'])) {
    $_SESSION['errores'][] = "Tu sesión ha expirado. Por favor, inicia sesión nuevamente.";
}

if (isset($_GET['error']) && $_GET['error'] === 'acceso_denegado') {
    $_SESSION['errores'][] = "No tienes permisos para acceder a esa página.";
}

// MENSAJE: SESIÓN DUPLICADA
if (isset($_GET['error']) && $_GET['error'] === 'sesion_duplicada') {
    $_SESSION['errores'][] = "⚠️ Tu sesión se cerró porque ingresaste desde otro dispositivo o navegador.";
}

//Captcha suma basico
$num1 = rand(1, 9);
$num2 = rand(1, 9);
$_SESSION['captcha_result'] = $num1 + $num2;

?>

<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Sistema Web De Administración Para Ordenes De Servicio">
    <link rel="icon" type="image/x-icon" href="imgs/favicon/favicon.ico">
    <meta name="robots" content="noindex" />
    <title>SWAOS LOGIN</title>

    <link rel="stylesheet" type="text/css" href="css/estilologin.css">

    <!-- CDn Font Awesome link Fuente iconos-->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
</head>

<body>
    <div class="container_principal">
        <main>
            <div class="contenedor-form">

                <div class="information">
                    <div class="logomovil"></div>
                    <div class="info-childs">
                        <h2>SWAOS</h2>
                        <p>Sistema web de administración para órdenes de servicio</p>
                    </div>
                </div>

                <div class="form-information">
                    <div class="form-information-childs">
                        <h2>Inicio de sesión</h2>
                        <form class="form" action="php/validarlogin.php" method="POST">

                            <div class="input-wrapper">
                                <i class="fa-solid fa-user"></i>
                                <input type="text" placeholder=" " id="user" name="txtusuario" autocomplete="off" required>
                                <label for="user" class="label-flotante">Usuario</label>
                            </div>


                            <div class="input-wrapper">
                                <i class="bx fa-solid fa-eye"></i>
                                <input type="password" placeholder=" " id="pass" name="txtpassword1" autocomplete="off" required>
                                <label for="pass" class="label-flotante">Contraseña</label>
                            </div>

                            <div class="input-wrapper">
                                <i class="fa-solid fa-calculator"></i>
                                <input type="number" placeholder=" " name="captcha" id="captcha" required>
                                <label for="captcha" class="label-flotante">Suma: <?php echo $num1; ?> + <?php echo $num2; ?> =</label>
                            </div>
                            <div style="text-align: left; margin-bottom: 15px; margin-left: 65px;">
                                <input type="checkbox" id="chkRecordarUsuario">
                                <label for="chkRecordarUsuario" style="color: #666; font-size: 14px; cursor: pointer;">Recordar mi usuario</label>
                            </div>

                            <div class="recaptchamx">
                                <?php if (isset($_SESSION['mostrar_recaptcha']) && $_SESSION['mostrar_recaptcha']): ?>
                                    <div class="g-recaptcha" data-sitekey="<?php echo RECAPTCHA_SITE_KEY; ?>"></div>
                                <?php endif; ?>
                            </div>

                            <button type="submit" name="btn_iniciar" class="btn_iniciar" id="botoniniciar">ENTRAR</button>
                        </form>
                        <!-- Mostrar el error si existe -->
                        <div style="width: 400px;">
                            <?php
                            if (session_status() === PHP_SESSION_NONE) {
                                session_start();
                            }
                            if (isset($_SESSION['errores']) && !empty($_SESSION['errores'])) {
                                echo '<div class="errror">';
                                foreach ($_SESSION['errores'] as $error) {
                                    echo "<p>$error</p>"; // Mostrar cada error en un párrafo
                                }
                                echo '</div>';
                                unset($_SESSION['errores']); // Limpiar errores después de mostrarlos
                            }
                            ?>
                        </div>
                    </div>

                </div>
            </div>
        </main>
        <footer>Copyright © 2025. <a href="#">@Creador: Fernando Renteria</a>

        </footer>
    </div>
    <!-- Script de reCAPTCHA -->
    <script src="https://www.google.com/recaptcha/api.js" async defer></script>
    <script src="js/ojito.js"></script>

    <script>
        // LÓGICA DE "RECORDAR MI USUARIO" 
        const inputUsuario = document.getElementById('user');
        const chkRecordar = document.getElementById('chkRecordarUsuario');
        const formLogin = document.querySelector('.form');

        // 1. Al cargar la página, revisamos si el usuario guardó su nombre antes
        if (localStorage.getItem('swaos_usuario_admin')) {
            inputUsuario.value = localStorage.getItem('swaos_usuario_admin');
            chkRecordar.checked = true;
        }

        // 2. Antes de enviar el formulario, guardamos o borramos según el checkbox
        formLogin.addEventListener('submit', function() {
            if (chkRecordar.checked) {
                // Si la casilla está marcada, guardamos el texto del input
                localStorage.setItem('swaos_usuario_admin', inputUsuario.value);
            } else {
                // Si la desmarcó, limpiamos el rastro
                localStorage.removeItem('swaos_usuario_admin');
            }
        });
    </script>
</body>

</html>