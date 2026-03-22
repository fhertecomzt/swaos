<?php

if (session_status() === PHP_SESSION_NONE) {
  session_start();
}
require_once 'php/config_keys.php';

// Verificamos si ya tiene errores para mostrar el captcha desde que carga la página
$mostrar_captcha_inicio = isset($_SESSION['intentos_portal']) && $_SESSION['intentos_portal'] > 0;
?>

<!DOCTYPE html>
<html lang="es">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Portal del Cliente | SWAOS</title>
  <link rel="icon" type="image/x-icon" href="imgs/favicon/favicon.ico">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
  <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
  <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
  <script src="https://www.google.com/recaptcha/api.js" async defer></script>

  <style>
    body {
      font-family: 'Arial', sans-serif;
      background-color: #5e9382;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      margin: 0;
    }

    .login-card {
      background: #ffffff;
      padding: 40px;
      border-radius: 12px;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
      width: 100%;
      max-width: 400px;
      text-align: center;
    }

    .login-card h2 {
      color: #007bff;
      margin-bottom: 10px;
    }

    .login-card p {
      color: #666;
      font-size: 14px;
      margin-bottom: 35px;
    }

    /* -----------------------------------------
           ✨ MAGIA DE LOS FLOATING LABELS ✨
           ----------------------------------------- */
    .input-group {
      position: relative;
      margin-bottom: 25px;
    }

    /* Ícono de la izquierda (Teléfono y Candado) */
    .input-group>i.icono-izq {
      position: absolute;
      left: 15px;
      top: 50%;
      transform: translateY(-50%);
      color: #aaa;
      transition: 0.3s;
      z-index: 2;
    }

    /* ✨ NUEVO: Ícono del Ojito a la derecha ✨ */
    .input-group>i.toggle-password {
      position: absolute;
      right: 15px;
      top: 50%;
      transform: translateY(-50%);
      color: #aaa;
      cursor: pointer;
      z-index: 10;
      font-size: 18px;
      transition: 0.2s;
    }

    .input-group input {
      width: 100%;
      padding: 14px 40px 14px 40px;
      /* Espacio extra a la izquierda y derecha para que el texto no pise los íconos */
      border: 1px solid #ddd;
      border-radius: 8px;
      font-size: 16px;
      box-sizing: border-box;
      outline: none;
      transition: 0.3s;
      background: transparent;
    }

    .input-group label {
      position: absolute;
      left: 40px;
      top: 50%;
      transform: translateY(-50%);
      background-color: #ffffff;
      color: #999;
      font-size: 15px;
      transition: 0.3s ease all;
      pointer-events: none;
      padding: 0 4px;
    }

    .input-group input:focus~label,
    .input-group input:not(:placeholder-shown)~label {
      top: 0;
      left: 15px;
      font-size: 12px;
      color: #007bff;
      font-weight: bold;
    }

    .input-group input:focus~i.icono-izq {
      color: #007bff;
    }

    .input-group input:focus {
      border-color: #007bff;
      box-shadow: 0 0 5px rgba(0, 123, 255, 0.2);
    }

    /* ----------------------------------------- */

    .btn-login {
      background: #007bff;
      color: white;
      border: none;
      width: 100%;
      padding: 14px;
      border-radius: 8px;
      font-size: 16px;
      font-weight: bold;
      cursor: pointer;
      transition: 0.3s;
      margin-top: 10px;
    }

    .btn-login:hover {
      background: #0056b3;
      transform: translateY(-2px);
    }
  </style>
</head>

<body>

  <div class="login-card">
    <h2><i class="fa-solid fa-laptop-medical"></i> Portal del Cliente</h2>
    <p>Ingresa para ver el historial de tus equipos y servicios.</p>

    <form id="formLoginCliente">
      <div class="input-group">
        <input type="text" id="telefono" name="telefono" placeholder=" " required maxlength="10" oninput="this.value = this.value.replace(/[^0-9]/g, '')" autocomplete="off">
        <label for="telefono">Número de Teléfono (10 dígitos)</label>
        <i class="fa-solid fa-phone icono-izq"></i>
      </div>

      <div class="input-group">
        <input type="password" id="clave" name="clave" placeholder=" " required>
        <label for="clave">Clave de Acceso</label>
        <i class="fa-solid fa-lock icono-izq"></i>
        <i class="fa-solid fa-eye toggle-password" id="ojito" style="display: none;"></i>
      </div>

      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; font-size: 13px;">
        <label style="color: #555; cursor: pointer; display: flex; align-items: center; gap: 5px;">
          <input type="checkbox" id="chkRecordarme" style="cursor: pointer;"> Recordar teléfono
        </label>

        <a href="#" onclick="recuperarClaveAutomatica(event)" style="color: #007bff; text-decoration: none; font-weight: bold;">
          ¿Olvidaste tu clave?
        </a>
      </div>

      <div id="contenedor-captcha" style="display: <?php echo $mostrar_captcha_inicio ? 'flex' : 'none'; ?>; justify-content: center; margin-bottom: 20px;">
        <div class="g-recaptcha" data-sitekey="<?php echo RECAPTCHA_SITE_KEY; ?>"></div>
      </div>

      <button type="submit" class="btn-login" id="btnSubmit">
        Entrar a mi Portal <i class="fa-solid fa-arrow-right"></i>
      </button>
    </form>
  </div>

  <script>
    //   Detector de expulsiones
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('expulsado') === 'inactividad') {
      Swal.fire({
        icon: 'info',
        title: 'Sesión Expirada',
        text: 'Por tu seguridad, hemos cerrado tu sesión debido a 15 minutos de inactividad.',
        confirmButtonColor: '#007bff'
      });
      // Limpiamos la URL para que no vuelva a salir si recarga la página
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (urlParams.get('expulsado') === 'denegado') {
      // Limpiamos silenciosamente si intentó entrar sin loguearse
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    // LÓGICA DEL OJITO Adaptada de ojito.js
    const passInput = document.getElementById("clave");
    const iconOjito = document.getElementById("ojito");

    // Mostrar/Ocultar el ojito si hay texto
    passInput.addEventListener("input", () => {
      if (passInput.value.length > 0) {
        iconOjito.style.display = "inline";
      } else {
        iconOjito.style.display = "none";
      }
    });

    // Función para mostrar contraseña (Mousedown / Touchstart)
    const showPassword = (e) => {
      e.preventDefault(); // Evita que el teclado del celular parpadee
      passInput.type = "text";
      iconOjito.classList.remove("fa-eye");
      iconOjito.classList.add("fa-eye-slash");
      iconOjito.style.color = "#dc3545"; // Color rojo al presionar
    };

    // Función para ocultar contraseña (Mouseup / Touchend / Mouseleave)
    const hidePassword = () => {
      passInput.type = "password";
      iconOjito.classList.add("fa-eye");
      iconOjito.classList.remove("fa-eye-slash");
      iconOjito.style.color = "#aaa"; // Regresa al color gris original
    };

    // Eventos para Computadora (Mouse)
    iconOjito.addEventListener("mousedown", showPassword);
    iconOjito.addEventListener("mouseup", hidePassword);
    iconOjito.addEventListener("mouseleave", hidePassword);

    // Eventos para Celulares (Pantalla Táctil)
    iconOjito.addEventListener("touchstart", showPassword);
    iconOjito.addEventListener("touchend", hidePassword);

    // LÓGICA DE LOGIN (Envío del formulario)
    const inputTelefono = document.getElementById('telefono');
    const chkRecordarme = document.getElementById('chkRecordarme');

    // Al cargar la página, revisamos si el cliente guardó su teléfono antes
    if (localStorage.getItem('swaos_telefono_portal')) {
      inputTelefono.value = localStorage.getItem('swaos_telefono_portal');
      chkRecordarme.checked = true;
    }
    document.getElementById('formLoginCliente').addEventListener('submit', function(e) {
      e.preventDefault();

      // Guardar o borrar el teléfono de la memoria del navegador
      if (chkRecordarme.checked) {
        localStorage.setItem('swaos_telefono_portal', inputTelefono.value);
      } else {
        localStorage.removeItem('swaos_telefono_portal');
      }

      let btn = document.getElementById('btnSubmit');
      btn.innerHTML = 'Verificando... <i class="fa-solid fa-spinner fa-spin"></i>';
      btn.disabled = true;

      let formData = new FormData(this);

      fetch('php/login_portal_cliente.php', {
          method: 'POST',
          body: formData
        })
        .then(response => response.json())
        .then(data => {
          if (data.success) {
            Swal.fire({
              icon: 'success',
              title: data.message,
              showConfirmButton: false,
              timer: 1500
            }).then(() => {
              window.location.href = 'mi_historial.php';
            });
          } else {
            Swal.fire('Error', data.message, 'error');
            btn.innerHTML = 'Entrar a mi Portal <i class="fa-solid fa-arrow-right"></i>';
            btn.disabled = false;
            // Si el servidor dice que muestres el captcha, lo hacemos visible
            if (data.mostrar_captcha) {
              document.getElementById('contenedor-captcha').style.display = 'flex';
            }

            // Reiniciamos el captcha solo si ya está cargado
            if (typeof grecaptcha !== 'undefined' && document.getElementById('contenedor-captcha').style.display === 'flex') {
              grecaptcha.reset();
            }
          }
        })
        .catch(error => {
          Swal.fire('Error', 'Hubo un problema de conexión.', 'error');
          btn.innerHTML = 'Entrar a mi Portal <i class="fa-solid fa-arrow-right"></i>';
          btn.disabled = false;
        });
    });

    // LÓGICA DE RECUPERACIÓN DE CLAVE POR EMAIL
    function recuperarClaveAutomatica(e) {
      e.preventDefault();

      Swal.fire({
        title: 'Recuperar Clave',
        text: 'Ingresa tu número de teléfono registrado (10 dígitos):',
        input: 'text',
        inputAttributes: {
          maxlength: 10,
          inputmode: 'numeric' // Llama al teclado numérico en celulares
        },
        showCancelButton: true,
        confirmButtonText: 'Enviar nueva clave',
        cancelButtonText: 'Cancelar',
        showLoaderOnConfirm: true,

        // Revisar que no escriba nada que no sea telefono
        didOpen: () => {
          const input = Swal.getInput();
          input.addEventListener('input', () => {
            // Si escribes una letra, la borra instantáneamente
            input.value = input.value.replace(/[^0-9]/g, '');
          });
        },

        preConfirm: (telefonoLogin) => {
          // Validar que sean exactamente 10 números
          if (!telefonoLogin || telefonoLogin.length !== 10) {
            Swal.showValidationMessage('Por favor, ingresa los 10 dígitos exactos de tu teléfono.');
            return false;
          }

          return fetch('php/recuperar_clave_cliente.php', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
              },
              body: 'telefono=' + encodeURIComponent(telefonoLogin)
            })
            .then(response => response.json())
            .then(data => {
              if (!data.success) {
                throw new Error(data.message);
              }
              return data;
            })
            .catch(error => {
              Swal.showValidationMessage(error.message);
            });
        },
        allowOutsideClick: () => !Swal.isLoading()
      }).then((result) => {
        if (result.isConfirmed) {
          Swal.fire({
            icon: 'success',
            title: '¡Enviado!',
            text: result.value.message
          });
        }
      });
    }
  </script>

</body>

</html>