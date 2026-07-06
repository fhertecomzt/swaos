<?php

//Encabezados para evitar el caché
 ini_set('session.cookie_secure', '1'); // Requiere HTTPS
 ini_set('session.cookie_httponly', '1'); // Evita acceso por JavaScript
 ini_set('session.use_strict_mode', '1'); // Rechaza IDs inválidas

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Includes
include "conexion.php";
require_once "config_keys.php";

// Inicializar array de errores
$errores = [];

// Validar usuario y contraseña
$username = htmlspecialchars(trim($_POST['txtusuario'] ?? ''), ENT_QUOTES, 'UTF-8');
$password1 = $_POST['txtpassword1'] ?? ''; // La contraseña no se sanitiza, se deja intacta para password_verify

if (empty($_POST['txtusuario'])) {
    $errores[] = "El campo de usuario es obligatorio.";
}
if (empty($_POST['txtpassword1'])) {
    $errores[] = "El campo de contraseña es obligatorio.";
}
if (empty($username)) {
    $errores[] = "El campo de usuario está vacío.";
} elseif (strlen($username) < 3 || strlen($username) > 20) {
    $errores[] = "El nombre de usuario debe tener entre 3 y 20 caracteres.";
} elseif (!preg_match('/^[a-zA-Z0-9_]+$/', $username)) {
    $errores[] = "El nombre de usuario solo puede contener letras, números y guiones bajos.";
}
if (strlen($password1) < 6 || strlen($password1) > 32) {
    $errores[] = "La contraseña debe tener entre 6 y 32 caracteres.";
}

// Validar captcha
if (!isset($_SESSION['captcha_result']) || !isset($_POST['captcha']) || trim($_POST['captcha']) != $_SESSION['captcha_result']) {
    $errores[] = "Error: El captcha es incorrecto.";
}

if (empty($errores)) {
    try {
        // Primero, verificamos si el usuario existe
        $stmtCheck = $dbh->prepare("SELECT id_usuario, estatus FROM usuarios WHERE usuario = :username");
        $stmtCheck->bindParam(':username', $username);
        $stmtCheck->execute();
        $checkUser = $stmtCheck->fetch(PDO::FETCH_ASSOC);


        if ($checkUser) { // El usuario existe, ahora verificamos su estatus
            if ($checkUser['estatus'] == '1') {
                $_SESSION['errores'] = ["Esta cuenta está inactiva. Por favor, contacte al administrador."];
                header("Location: ../index.php");
                exit;
            }

            // Si el usuario está activo, procedemos con la verificación de la contraseña y la sesión
            $stmt = $dbh->prepare("SELECT usuarios.id_usuario, usuarios.usuario, usuarios.nombre, usuarios.email, usuarios.p_appellido, usuarios.s_appellido, usuarios.password, usuarios.imagen, roles.nom_rol, talleres.id_taller, talleres.nombre_t, usuarios.intentos_fallidos, usuarios.bloqueado_hasta, usuarios.session_token, usuarios.ultimo_acceso_token,
            TIMESTAMPDIFF(SECOND, usuarios.ultimo_acceso_token, NOW()) as inactividad_segundos
            FROM usuarios
            JOIN roles ON usuarios.id_rol = roles.id_rol
            JOIN talleres ON usuarios.taller_id = talleres.id_taller
            WHERE usuarios.usuario = :username");
            $stmt->bindParam(':username', $username);
            $stmt->execute();
            $user = $stmt->fetch(PDO::FETCH_ASSOC);

            // Sincronizamos con los 10 minutos del sistema (600 segundos)
            $tiempo_maximo_token = 600;

            // Limpiamos las "Sesiones Zombie" usando el tiempo de MySQL
            if ($user['session_token'] !== null && $user['inactividad_segundos'] > $tiempo_maximo_token) {
                $updateStmt = $dbh->prepare("UPDATE usuarios SET session_token = NULL WHERE id_usuario = :id");
                $updateStmt->bindParam(':id', $user['id_usuario']);
                $updateStmt->execute();
                $user['session_token'] = null;
            }

            // // Bloqueamos si la sesión está viva en otro lado
            // if ($user['session_token'] !== null) {
            //     $_SESSION['errores'] = [" Esta cuenta ya está en uso. Cierra la sesión activa o espera 10 minutos de inactividad."];
            //     header("Location: ../index.php");
            //     exit;
            // }

            if ($user) { // Comprobar si el usuario existe (de nuevo, pero ahora con todos los datos)
                if ($user['bloqueado_hasta'] && strtotime($user['bloqueado_hasta']) > time()) {
                    $tiempoRestante = strtotime($user['bloqueado_hasta']) - time();
                    $_SESSION['errores'] = ["Cuenta bloqueada. Inténtelo de nuevo en " . ceil($tiempoRestante / 60) . " minutos."];
                    header("Location: ../index.php");
                    exit;
                }

                // Validar reCAPTCHA si es necesario
                if (isset($_SESSION['mostrar_recaptcha']) && $_SESSION['mostrar_recaptcha']) {
                    if (!isset($_POST['g-recaptcha-response']) || empty($_POST['g-recaptcha-response'])) {
                        $_SESSION['errores'] = ["Por favor completa el reCAPTCHA."];
                        header("Location: ../index.php");
                        exit;
                    }

                    // Usamos la constante mágica en lugar del texto fijo
                    $recaptchaSecret = RECAPTCHA_SECRET_KEY;
                    $response = file_get_contents("https://www.google.com/recaptcha/api/siteverify?secret=$recaptchaSecret&response=" . $_POST['g-recaptcha-response']);
                    $recaptchaResult = json_decode($response, true);

                    if (!$recaptchaResult['success']) {
                        $_SESSION['errores'] = ["Validación de reCAPTCHA fallida. Inténtalo de nuevo."];
                        header("Location: ../index.php");
                        exit;
                    }
                }
                // **Si no está bloqueado, verifique la contraseña**
                if (password_verify($password1, $user['password'])) {

                    // Regenerar el ID de sesión para evitar la fijación de la sesión
                    session_regenerate_id(true);

                    // Generar un nuevo token de sesión
                    $sessionToken = bin2hex(random_bytes(32));

                    // Actualizar la información de la sesión del usuario en la base de datos
                    $updateStmt = $dbh->prepare("UPDATE usuarios SET session_token = :token, last_login_ip = :ip, intentos_fallidos = 0, bloqueado_hasta = NULL, ultimo_acceso_token = NOW() WHERE id_usuario = :id");
                    $updateStmt->bindParam(':token', $sessionToken);
                    $updateStmt->bindParam(':ip', $_SERVER['REMOTE_ADDR']);
                    $updateStmt->bindParam(':id', $user['id_usuario']);
                    $updateStmt->execute();

                    // Almacenar información del usuario en la sesión
                    $_SESSION['loggedin'] = true;
                    $_SESSION['idusuario'] = $user['id_usuario'];
                    $_SESSION['usuario'] = $user['usuario'];
                    $_SESSION['nombre'] = $user['nombre'];
                    $_SESSION['appaterno'] = $user['p_appellido'];
                    $_SESSION['apmaterno'] = $user['s_appellido'];
                    $_SESSION['imagen'] = $user['imagen'];
                    $_SESSION['rol'] = $user['nom_rol'];
                    $_SESSION['taller_id'] = $user['id_taller'];
                    $_SESSION['nombre_t'] = $user['nombre_t'];
                    $_SESSION['email'] = $user['email'];
                    $_SESSION['session_token'] = $sessionToken; // Almacenar el token de sesión en la sesión
                    $_SESSION['ultimo_acceso'] = time(); // Inicializar la hora del último acceso

                    // Redirigir según el rol
                    switch ($_SESSION['rol']) {
                        case 'superusuario':
                            header("Location: ad.php");
                            break;
                        case 'ventas':
                            header("Location: vta.php");
                            break;
                        case 'gerencia':
                            header("Location: gm.php");
                            break;
                        default:
                            header("Location: index.php");
                            break;
                    }
                    exit;
                } else { // **Si la contraseña es incorrecta, gestiona el inicio de sesión fallido**
                    // Incrementar intentos fallidos
                    $intentosFallidos = $user['intentos_fallidos'] + 1;
                    $updateStmt = $dbh->prepare("UPDATE usuarios SET intentos_fallidos = :intentos WHERE id_usuario = :id");
                    $updateStmt->bindParam(':intentos', $intentosFallidos);
                    $updateStmt->bindParam(':id', $user['id_usuario']);
                    $updateStmt->execute();

                    //Mostrar recaptcha despues de 2 intentos incorrectos
                    if ($intentosFallidos >= 2) {
                        $_SESSION['mostrar_recaptcha'] = true;
                    }

                    if ($intentosFallidos >= 3) {
                        $bloqueoHasta = date("Y-m-d H:i:s", time() + 15 * 60);
                        $stmt = $dbh->prepare("UPDATE usuarios SET bloqueado_hasta = :bloqueado WHERE id_usuario = :id");
                        $stmt->bindParam(':bloqueado', $bloqueoHasta);
                        $stmt->bindParam(':id', $user['id_usuario']);
                        $stmt->execute();
                        $_SESSION['errores'] = ["Cuenta bloqueada por 15 minutos."];
                        header("Location: ../index.php");
                        exit;
                    }

                    $_SESSION['errores'] = ["Contraseña incorrecta. Intentos restantes: " . (3 - $intentosFallidos)];
                    header("Location: ../index.php");
                    exit;
                }
            } else {
                // Esto no debería ocurrir aquí si la primera consulta ($stmtCheck) encontró al usuario
                $_SESSION['errores'] = ["Error interno: Usuario activo no encontrado después de la verificación de estatus."];
                header("Location: ../index.php");
                exit;
            }
        } else { // El usuario no existe
            $_SESSION['errores'] = ["Usuario no encontrado."];
            header("Location: ../index.php");
            exit;
        }
    } catch (PDOException $e) {
        // Registrar el error para fines de depuración
        error_log("Database error in validarlogin.php: " . $e->getMessage());
        // $_SESSION['errores'] = ["Ocurrió un error al intentar iniciar sesión."];
        header("Location: ../index.php");
        exit;
    }
} else {
    $_SESSION['errores'] = $errores;
    header("Location: ../index.php");
    exit;
}
