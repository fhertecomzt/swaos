<?php

//Encabezados para evitar el caché
header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
header("Cache-Control: post-check=0, pre-check=0", false);
header("Pragma: no-cache");

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

$roles_permitidos = ["superusuario"];
include "verificar_sesion.php";

/*
//Verificar si hay una sesión activa y si el rol está permitido
if (!isset($_SESSION['rol']) || !in_array($_SESSION['rol'], $roles_permitidos)) {
    header("Location: ../index.php?error=acceso_denegado");
    exit;
}

// Generar un token único en cada acceso
$current_token = bin2hex(random_bytes(32));
$_SESSION['current_token'] = $current_token;

// Verificar el token de navegación para detectar inconsistencias
if (isset($_SESSION['last_token'])) {
    $page_token = $_POST['page_token'] ?? '';
    if ($_SESSION['last_token'] !== $page_token) {
        // Destruir la sesión y redirigir al inicio con un mensaje
        session_unset();
        session_destroy();
        header("Location: ../index.php?session_expired=1&error=navegacion_inconsistente");
        exit;
    }
}

// Actualizar el último token utilizado
$_SESSION['last_token'] = $current_token;
*/

?>

<!DOCTYPE html>
<html>

<head>
    <meta charset="utf8mb4">
    <meta http-equiv="X-UA-Compatible" content="IE-edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Administrador AME</title>
    <link rel="icon" type="image/x-icon" href="../imgs/favicon/favicon.ico">

    <!-- CDn Font Awesome link fuente iconos-->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    <!--Estilo Css admin -->
    <link rel="stylesheet" href="../css/estiloadmin.css">
    <!--Estilo Css formulario -->
    <link rel="stylesheet" href="../css/formularios.css">
    <!--Estilo Css tablas -->
    <link rel="stylesheet" href="../css/tablas.css">
    <!--Estilo Css errores -->
    <link rel="stylesheet" href="../css/mensajesdeestado.css">
    <!--Estilo dashboard -->
    <link rel="stylesheet" href="../css/dashboard.css">

</head>

<body class="<?php echo (isset($_COOKIE['darkmode']) && $_COOKIE['darkmode'] == 'true') ? 'darkmode' : ''; ?>">
    <!--Nav-->
    <nav class="navbar">
        <figure class="logo">

            <img class="nav__logo" src="../imgs/logo.png" alt="Mascomputación">
        </figure>

        <div class="nav__icon">
            <a href="#" id="menu-toggle">☰</a>
        </div>

        <div class="nav__links" id="menu">
            <ul class="menu nav_target">
                <li class="nav-item">
                    <a href="#" id="dashboard-link" class="nav-link">
                        <i class="fas fa-tachometer-alt"></i>
                        <span class="titles_btns">INICIO</span>
                    </a>
                </li>

                <!--Matenimiento-->
                <li class="nav-item has-submenu">
                    <a href="#" class="nav-link">
                        <i class="fas fa-wrench"></i>
                        <span class="titles_btns">MANTENIMIENTO</span>
                    </a>
                    <ul>
                        <li>
                            <a href="#" id="tiendas-link" class="nav-link">
                                <i class="fa-solid fa-shop"></i>
                                <span>TALLERES</span>
                            </a>
                        </li>
                        <li>
                            <a href="#" id="roles-link" class="nav-link">
                                <i class="fa-regular fa-address-book"></i>
                                <span>ROLES</span>
                            </a>
                        </li>
                        <li>
                            <a href="#" id="usuarios-link" class="nav-link">
                                <i class="fas fa-user"></i>
                                <span>USUARIOS</span>
                            </a>
                        </li>
                        <li>
                            <a href="#" id="usuariossup-link" class="nav-link">
                                <i class="fas fa-user"></i>
                                <span>SUP-USUARIOS</span>
                            </a>
                        </li>
                    </ul>
                </li>

                <!--Catálogos-->
                <li class="nav-item has-submenu">
                    <a href="#" class="nav-link">
                        <i class="fa-solid fa-folder-tree"></i>
                        <span class="titles_btns">CATÁLOGOS</span>
                    </a>
                    <ul>
                        <li>
                            <a href="#" id="productos-link" class="nav-link">
                                <i class="fa-solid fa-boxes-stacked"></i>
                                <span>PRODUCTOS</span>
                            </a>
                        </li>
                        <li>
                            <a href="#" id="categorias-link" class="nav-link">
                                <i class="fa-solid fa-layer-group"></i>
                                <span>CATEGORIAS</span>
                            </a>
                        </li>
                        <li>
                            <a href="#" id="marcas-link" class="nav-link">
                                <i class="fa-regular fa-copyright"></i>
                                <span>MARCAS</span>
                            </a>
                        </li>
                        <li>
                            <a href="#" id="tiposervicios-link" class="nav-link">
                                <i class="fa-solid fa-list-check"></i>
                                <span>TIPO DESERVICIOS</span>
                            </a>
                        </li>
                        <li>
                            <a href="#" id="estatusservicios-link" class="nav-link">
                                <i class="fa-solid fa-list-check"></i>
                                <span>ESTATUS SERVICIOS</span>
                            </a>
                        </li>
                        <li>
                            <a href="#" id="mpagos-link" class="nav-link">
                                <i class="fa-solid fa-file-invoice-dollar"></i>
                                <span>MÉTODOS DE PAGO</span>
                            </a>
                        </li>
                        <li>
                            <a href="#" id="impuestos-link" class="nav-link">
                                <i class="fa-solid fa-file-invoice-dollar"></i>
                                <span>IMPUESTOS</span>
                            </a>
                        </li>
                        <li>
                            <a href="#" id="proveedores-link" class="nav-link">
                                <i class="fa-solid fa-person-half-dress"></i>
                                <span>PROVEEDORES</span>
                            </a>
                        </li>
                        <li>
                            <a href="#" id="clientes-link" class="nav-link">
                                <i class="fa-solid fa-people-group"></i>
                                <span>CLIENTES</span>
                            </a>
                        </li>
                </li>
            </ul>

            <!--Órdenes de servicio-->
            <li><a href="#">
                    <i class="fa-solid fa-address-card"></i>
                    <span class="titles_btns">ÓRDENES DE SERVICIO</span>
                </a>
                <ul>
                    <li>
                        <a href="#" id="movimientos-link">
                            <i class="fa-solid fa-list-check"></i>
                            <span>MOVIMIENTOS</span>
                        </a>
                    </li>

                    <li>
                        <a href="#" id="etiquetas-link">
                            <i class="fa-solid fa-barcode"></i>
                            <span>ETIQUETAS</span>
                        </a>
                    </li>
                    <li>
                        <a href="#" id="ajustesinventario-link" class="disabled-link" onclick="return false;">
                            <i class=" fa-solid fa-sliders"></i>
                            <span>AJUSTES INVENTARIO</span>
                        </a>
                    </li>
                    <li>
                        <a href="#" id="abonosproveedor-link" class="disabled-link" onclick="return false;">
                            <i class=" fa-solid fa-money-bill-1-wave"></i>
                            <span>ABONOS A PROVEEDOR</span>
                        </a>
                    </li>
                </ul>
            </li>

            <!--Ventas-->
            <li>
                <a href="#" id="ventas-link">
                    <i class="fa-solid fa-cash-register"></i>
                    <span class="titles_btns">VENTAS</span>
                </a>
            </li>

            <!--Cotizaciones-->
            <li>
                <a href="#" id="ventas-link">
                    <i class="fa-solid fa-cash-register"></i>
                    <span class="titles_btns">COTIZACIONES</span>
                </a>
            </li>

            <!--Citas-->
            <li>
                <a href="#" id="ventas-link">
                    <i class="fa-solid fa-cash-register"></i>
                    <span class="titles_btns">CITAS</span>
                </a>
            </li>

            <!--Cliente-->
            <li>
                <a href="#" id="ventas-link">
                    <i class="fa-solid fa-cash-register"></i>
                    <span class="titles_btns">CLIENTE</span>
                </a>
            </li>

            <!--Reportes-->
            <li><a href="#" id="informes-link" class="disabled-link" onclick="return false;">
                    <i class=" fa-solid fa-sheet-plastic"></i>
                    <span class="titles_btns">REPORTES</span>
                </a>
            </li>

            <!--Mi cuenta-->
            <li><a href="#">
                    <i class="fa-solid fa-address-card"></i>
                    <span class="titles_btns">MI CUENTA</span>
                </a>
                <ul>
                    <li>
                        <a href="#" id="perfil-link" class="disabled-link" onclick="return false;">
                            <i class=" fa-solid fa-user-pen"></i>
                            <span>PERFIL</span>
                        </a>
                    </li>
                    <li>
                        <a href="logout.php" id="">
                            <i class="fa-solid fa-rotate"></i>
                            <span>CAMBIAR DE USUARIO</span>
                        </a>
                    </li>
                    <li>
                        <a href="logout.php" id="">
                            <i class="fa-solid fa-right-from-bracket"></i>
                            <span>SALIR</span>
                        </a>
                    </li>
                </ul>
            </li>

            </ul>
        </div><!--Fin del nav__links-->
    </nav><!--Fin Nav-->

    <div class="darkmodebtn">
        <button id="btndarkmode">
            <i title="Modo oscuro" class="fa-solid fa-sun"></i>
            <p class="darkmode_title"></p>
        </button>
    </div><!--Fin Darmode btn-->

    <div class="main--content" id="main-content">
        <div class="header--wrapper">
            <!-- <a href="#menu" class="nav_target">
                <img src="../imgs/menu.svg" alt="Mi menú" class="nav__icon" style="height: 45px; width: 45px; padding: 5px; margin-right: 20px;" />
            </a> -->
            <div class="header--title">
                <!-- <h2>Taller: <?php echo $_SESSION['nombre_t'] . ", Id: " . $_SESSION['taller_id'] ?></h2> -->
                <h2>Taller: <?php echo $_SESSION['nombre_t'] ?></h2>
                <span>Usuario: <?php echo $_SESSION['usuario'] ?></span>
            </div>
            <div class="user--info">
                <!-- Botón o imagen para abrir el dropdown Perfil -->
                <div class="perfil-dropdown">
                    <button class="perfil-btn">
                        <img src="<?php echo $_SESSION['imagen']; ?>" alt="Perfil" class="perfil-img">
                    </button>

                    <!-- Contenido del Dropdown Perfil -->
                    <div id="perfilDropdown" class="dropdown-content">
                        <div class="perfil-info">
                            <img src="<?php echo $_SESSION['imagen']; ?>" alt="Imagen de perfil" width="80" height="80">
                            <p><strong><?php echo $_SESSION['usuario']; ?></strong></p>
                            <p><?php echo $_SESSION['nombre'] . " " . $_SESSION['appaterno'] . " " . $_SESSION['apmaterno']; ?></p>
                            <p><strong>Rol:</strong> <?php echo $_SESSION['rol']; ?></p>
                            <p><strong>Taller:</strong> <?php echo $_SESSION['nombre_t']; ?></p>
                        </div>
                        <a href="../php/logout.php" class="logout-btn">Cerrar sesión</a>
                    </div>
                </div>
            </div>
        </div><!--Fin header--wrapper-->

        <div class="content-area" id="content-area">
            <!-- Contenido dinámico se cargará aquí -->
            <?php
            if (isset($_GET['page']) && $_GET['page'] === 'tiendas') {
                include 'tiendas.php';
            }
            ?>
        </div>
    </div>

    <!--Scripts JS-->

    <script src="../js/dashboard.js"></script>

    <script src="../js/scripts.js"></script>
    <script src="../js/scriptssup.js"></script>
    <script src="../js/clientes.js"></script>
    <script src="../js/perfil.js"></script>


    <script src="../js/modooscuro.js"></script>
    <script src="../js/tiempo_sessiones.js"></script>

    <!--Alertas SweetAlert2-->
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>

    <!--Scripts Selects anidados estado, ciudad, colonia y cp-->
    <script src="../js/peticionesedosmun.js"></script>
</body>

</html>