<?php

session_start();
// Manejar mensajes de error y añadirlos a la sesión
if (isset($_GET['session_expired'])) {
    $_SESSION['errores'][] = "Tu sesión ha expirado. Por favor, inicia sesión nuevamente.";
}

if (isset($_GET['error']) && $_GET['error'] === 'acceso_denegado') {
    $_SESSION['errores'][] = "No tienes permisos para acceder a esa página.";
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
                                <input type="text" placeholder="Usuario" id="user" name="txtusuario" required>
                            </div>

                            <div class="input-wrapper">
                                <i class="bx fa-solid fa-eye"></i>
                                <input type="password" placeholder="Contraseña" id="pass" name="txtpassword1" autocomplete="off" required>
                            </div>

                            <div class="input-wrapper">
                                <i class="fa-solid fa-calculator"></i>
                                <input type="number" placeholder="<?php echo $num1; ?> + <?php echo $num2; ?>=   " name="captcha" required>
                            </div>

                            <div class="recaptchamx">
                                <!-- Mostrar reCAPTCHA solo si se necesitan -->
                                <?php if (isset($_SESSION['mostrar_recaptcha']) && $_SESSION['mostrar_recaptcha']): ?>
                                    <div class="g-recaptcha" data-sitekey="6LfvWZYqAAAAABAAzNP9IPyPePJ5iwxONAh1DfVi"></div>
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
</body>

</html>