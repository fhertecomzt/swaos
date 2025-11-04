//Llamar perfil *****************************************************************
document
  .getElementById("perfil-link")
  .addEventListener("click", function (event) {
    event.preventDefault(); // Evita la acción por defecto del enlace
    fetch("perfil.php")
      .then((response) => response.text())
      .then((html) => {
        document.getElementById("content-area").innerHTML = html;
      })
      .catch((error) => {
        console.error("Error al cargar el contenido:", error);
      });
  });

//Para editar perfil ********************************************
// Función para abrir el modal y asignar el ID del usuario
function abrirModalPerfilUser(idModal, idUsuario) {
  // Asignar el ID del usuario (de la sesión) al campo oculto del formulario
  const inputId = document.getElementById("editar-idperfilusuario");
  if (inputId) {
    inputId.value = idUsuario;
  } else {
    console.error("No se encontró el input oculto del ID de usuario.");
    return;
  }
  document.getElementById(idModal).style.display = "flex";
}

// Función para cerrar el modal y limpiar el formulario
function cerrarModalPerfilUser(idModal) {
  const modal = document.getElementById(idModal);
  modal.style.display = "none";

  // Limpiar el formulario al cerrar
  const form = modal.querySelector("form");
  if (form) {
    form.reset();
    // Quitar clases de error si existen
    form.querySelectorAll(".input-error").forEach((input) => {
      input.classList.remove("input-error");
    });
  }
}

// 1. OYENTE DEL SUBMIT DEL FORMULARIO
// (Usando delegación de eventos en el body)
document.addEventListener("submit", function (event) {
  if (event.target && event.target.id === "form-editarPerfilUser") {
    event.preventDefault(); // Prevenir el envío tradicional
    validarYEnviarFormularioPerfil(event.target);
  }
});

// 2. FUNCIÓN DE VALIDACIÓN
async function validarYEnviarFormularioPerfil(formulario) {
  const passwordActualInput = formulario.password_actual;
  const passwordInput = formulario.password1; // Obtener el elemento input
  const password2Input = formulario.password2; // Obtener el elemento input 2

  const passwordActual = passwordActualInput.value.trim();
  const password = formulario.password1.value.trim();
  const password2 = formulario.password2.value.trim();

  const errores = [];

  //  Validación de campos vacios
  if (passwordActual.length === 0) {
    errores.push("La contraseña actual no puede estar vacía.");
    passwordActualInput.classList.add("input-error");
    passwordActualInput.focus();
  }

  if (password.length === 0) {
    errores.push("La contraseña no puede estar vacía.");
    passwordInput.classList.add("input-error");
    passwordInput.focus(); // Poner foco en el primer campo vacío
  }

  if (password2.length === 0) {
    // Solo añadimos el error si el primero no estaba ya vacío
    if (password.length > 0) {
      errores.push("Debe confirmar la contraseña.");
      password2Input.classList.add("input-error");
      password2Input.focus();
    }
  }

  // Validar complejidad (usando la misma lógica de 'crear usuario')
  if (password.length > 0 && password2.length > 0) {
    const passwordErrores = validarContrasenasInterno(password, password2);
    errores.push(...passwordErrores);

    if (passwordErrores.length > 0) {
      if (!passwordInput.classList.contains("input-error")) {
        passwordInput.classList.add("input-error");
      }
      if (!password2Input.classList.contains("input-error")) {
        password2Input.classList.add("input-error");
      }
    }
  }

  if (errores.length > 0) {
    Swal.fire({
      title: "Errores de Validación",
      html: errores.join("<br>"),
      icon: "error",
      timer: 1500,
      showConfirmButton: false,
      timerProgressBar: true,
    });
    return;
  }

  // Si la validación pasa, enviar el formulario
  enviarFormularioPerfil(formulario);
}
// Oyente 'input' para limpiar el error del nuevo campo
document
  .getElementById("editar-passwordactual")
  ?.addEventListener("input", (e) => e.target.classList.remove("input-error"));

// 3. FUNCIÓN DE ENVÍO (FETCH)
function enviarFormularioPerfil(formulario) {
  const formData = new FormData(formulario);

  fetch("cruds/procesar_editar_perfil.php", {
    method: "POST",
    body: formData,
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        Swal.fire({
          title: "¡Éxito!",
          text: data.message,
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
          timerProgressBar: true,
        });
        cerrarModalPerfilUser("editar-modalPerfilUser");
      } else {
        Swal.fire({
          title: "Error",
          text: data.message,
          icon: "error",
        });
      }
    })
    .catch((error) => {
      console.error("Error en fetch:", error);
      Swal.fire("Error", "Ocurrió un error inesperado.", "error");
    });
}

// 4. FUNCIÓN AUXILIAR DE VALIDACIÓN DE CONTRASEÑA
// (Reutilizada del script de crear usuario)
function validarContrasenasInterno(password1, password2) {
  const errores = [];
  if (password1.length < 6) {
    errores.push("La contraseña debe tener al menos 6 caracteres.");
  }
  if (password1 !== password2) {
    errores.push("Las contraseñas no coinciden.");
  }
  const regex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
  if (!regex.test(password1)) {
    errores.push(
      "La contraseña debe contener al menos una mayúscula, una minúscula, un número y un carácter especial."
    );
  }
  return errores;
}

// Oyentes 'input' para limpiar los errores visuales al escribir
document
  .getElementById("editar-password1")
  ?.addEventListener("input", (e) => e.target.classList.remove("input-error"));
document
  .getElementById("editar-password2")
  ?.addEventListener("input", (e) => e.target.classList.remove("input-error"));
document.addEventListener("click", function (event) {
  const dropdownBtn = event.target.closest(".perfil-btn");
  const dropdown = document.getElementById("perfilDropdown");

  // Clic en el botón de perfil
  if (dropdownBtn) {
    dropdown.style.display =
      dropdown.style.display === "block" ? "none" : "block";
    return;
  }

  // Clic fuera del dropdown
  if (!event.target.closest(".perfil-dropdown")) {
    dropdown.style.display = "none";
  }
});


//Para editar foto ********************************************************


// 1. DELEGAR EVENTO 'CLICK' (Para botones y la imagen)
document.body.addEventListener('click', function(event) {
    
    // Clic en el botón "Seleccionar Foto"
    if (event.target.id === 'btnSeleccionarFoto') {
        event.preventDefault(); 
        document.getElementById('inputImagenPerfil').click(); // Disparar el input oculto
    }

    // Clic en la imagen de preview
    if (event.target.id === 'previewImagenPerfil') {
        event.preventDefault();
        document.getElementById('inputImagenPerfil').click(); // Disparar el input oculto
    }
});

// 2. DELEGAR EVENTO 'CHANGE' (Para el input de archivo)
document.body.addEventListener('change', function(event) {
    
    if (event.target.id === 'inputImagenPerfil') {
        const file = event.target.files[0];
        const previewImagen = document.getElementById('previewImagenPerfil');
        const btnGuardar = document.getElementById('btnGuardarFoto');

        if (file && previewImagen) {
            const reader = new FileReader();
            reader.onload = function(e) {
                previewImagen.src = e.target.result; 
            }
            reader.readAsDataURL(file);
            
            if (btnGuardar) {
                btnGuardar.style.display = 'inline-block'; // Mostrar botón
            }
        }
    }
});

// 3. DELEGAR EVENTO 'SUBMIT' (Para el formulario de la foto)
document.body.addEventListener('submit', function(event) {
    
    if (event.target.id === 'form-editarFoto') {
        event.preventDefault(); // ¡CRUCIAL! Evita la recarga de página

        const formFoto = event.target;
        const btnGuardar = document.getElementById('btnGuardarFoto');
        const formData = new FormData(formFoto);

        if (btnGuardar) {
            btnGuardar.disabled = true;
            btnGuardar.textContent = "Guardando...";
        }

        fetch('cruds/procesar_cambiar_foto.php', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                Swal.fire({
                    title: "¡Éxito!",
                    text: data.message,
                    icon: "success",
                    timer: 1500,
                    showConfirmButton: false
                });
                
                // Actualizar dinámicamente
                const nuevaUrl = data.nuevaImagenUrl + '?t=' + new Date().getTime();
                
                // Actualizar imagen del header (asumiendo que tiene ID)
                const headerImg = document.getElementById('header-user-image'); 
                if (headerImg) headerImg.src = nuevaUrl; 
                
                // Actualizar imagen del perfil
                const previewImagen = document.getElementById('previewImagenPerfil');
                if (previewImagen) previewImagen.src = nuevaUrl; 
                
                if (btnGuardar) btnGuardar.style.display = 'none';
                
            } else {
                Swal.fire("Error", data.message, "error");
            }
        })
        .catch(error => {
            console.error('Error al subir la foto:', error);
            Swal.fire("Error", "Ocurrió un error inesperado.", "error");
        })
        .finally(() => {
            if (btnGuardar) {
                btnGuardar.disabled = false;
                btnGuardar.textContent = "Guardar Foto";
            }
        });
    }
});