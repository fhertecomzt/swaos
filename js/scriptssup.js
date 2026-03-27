// INICIALIZAR Y CARGAR MÓDULO DE SUPER USUARIOS
if (document.getElementById("usuariossup-link")) {
  document
    .getElementById("usuariossup-link")
    .addEventListener("click", function (event) {
      event.preventDefault();
      fetch("usuariossup.php")
        .then((response) => response.text())
        .then((html) => {
          document.getElementById("content-area").innerHTML = html;
          inicializarTablaGenerica(
            "#tabla-usuariosSup",
            "#buscarboxusuarioSup",
            "#estatusFiltroUSup",
          );
        })
        .catch((error) =>
          console.error("Error al cargar el contenido:", error),
        );
    });
}

function abrirModalUserSup(id) {
  document.getElementById(id).style.display = "flex";
}
function cerrarModalUserSup(id) {
  document.getElementById(id).style.display = "none";
}

// MOTOR DE REGLAS (Crear y Editar Super Usuario)
function validarFormularioUserSup(event, tipo = "crear") {
  event.preventDefault();
  const prefijo = tipo === "crear" ? "crear" : "editar";

  const reglasValidacion = [
    { id: `${prefijo}-usuario`, tipo: "texto", min: 3, mensaje: "El usuario debe tener al menos 3 caracteres." },
    { id: `${prefijo}-nombre`, tipo: "texto", min: 3, mensaje: "El nombre debe tener al menos 3 caracteres." },
    { id: `${prefijo}-papellido`, tipo: "texto", min: 3, mensaje: "El primer apellido debe tener al menos 3 caracteres." },
    { id: `${prefijo}-sapellido`, tipo: "texto", min: 3, mensaje: "El segundo apellido debe tener al menos 3 caracteres." },
    { id: `${prefijo}-email`, tipo: "email", mensaje: "Debes ingresar un correo electrónico válido." },
    { id: `${prefijo}-rol`, tipo: "select", mensaje: "Debes seleccionar un rol." },
    { id: `${prefijo}-tienda`, tipo: "select", mensaje: "Debes seleccionar un taller." },
    { id: `${prefijo}-password1`, tipo: "password", mensaje: "La contraseña debe tener al menos 6 caracteres, 1 mayúscula, 1 minúscula, 1 número y 1 carácter especial." },
    { id: `${prefijo}-password2`, tipo: "confirmacion", mensaje: "Las contraseñas no coinciden." },
  ];

  const errores = [];
  let primerCampoConError = null;

  reglasValidacion.forEach((regla) => {
    const elemento = document.getElementById(regla.id);
    if (!elemento) return;

    let valor = elemento.value.trim();
    let esValido = true;

    elemento.addEventListener("input", function () {
      this.classList.remove("input-error");
    });

    if (regla.tipo === "texto" && valor.length < regla.min) esValido = false;
    else if (regla.tipo === "select" && valor === "") esValido = false;
    else if (regla.tipo === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor)) esValido = false;
    else if (regla.tipo === "password") {
      const regexPass = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
      if (tipo === "crear" && valor === "") esValido = false;
      if (valor !== "" && !regexPass.test(valor)) esValido = false;
    } else if (regla.tipo === "confirmacion") {
      const pass1 = document.getElementById(`${prefijo}-password1`).value.trim();
      if (tipo === "crear" && valor === "") esValido = false;
      if (valor !== pass1) esValido = false;
    }

    if (!esValido) {
      errores.push(`<li>${regla.mensaje}</li>`);
      elemento.classList.add("input-error");
      if (!primerCampoConError) primerCampoConError = elemento;
    } else {
      elemento.classList.remove("input-error");
    }
  });

  if (errores.length > 0) {
    Swal.fire({
      title: "Faltan datos",
      html: `<ul style="text-align: left; font-size: 14px; color: #d33;">${errores.join("")}</ul>`,
      icon: "warning",
      returnFocus: false,
      confirmButtonColor: "#3085d6",
      confirmButtonText: "Entendido",
    });
    return;
  }

  const usuarioInput = document.getElementById(`${prefijo}-usuario`).value.trim();
  const idInput = tipo === "editar" ? document.getElementById("editar-idusuario").value : 0;

  verificarDuplicadoUserSup(usuarioInput, idInput).then((esDuplicado) => {
    if (!esDuplicado) procesarFormularioUserSup(event.target, tipo);
  });
}

function verificarDuplicadoUserSup(usuario, id = 0) {
  return fetch("cruds/verificar_nombre_usuario.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ usuario, id }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.existe) {
        Swal.fire({
          title: "Atención",
          text: data.message || "El usuario ya existe. Por favor, elige otro.",
          icon: "warning",
          returnFocus: false,
          showConfirmButton: false,
          timer: 1500,
        });
      }
      return data.existe;
    })
    .catch(() => true);
}

function procesarFormularioUserSup(formulario, tipo) {
  const formData = new FormData(formulario);
  const url = tipo === "crear" ? "cruds/procesar_crear_user_sup.php" : "cruds/editar_user_sup.php";

  fetch(url, { method: "POST", body: formData })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        cerrarModalUserSup(`${tipo}-modalUserSup`);
        if (tipo === "crear") formulario.reset();

        // Actualizar la foto en vivo en el menú superior
        if (tipo === "editar" && data.nueva_imagen) {
          // Cambia "img-perfil-menu" por el ID real de la etiqueta <img> que tienes en tu menú superior
          const imgMenuSuperior = document.getElementById("img-perfil-menu");
          if (imgMenuSuperior) {
            imgMenuSuperior.src = data.nueva_imagen;
          }
        }

        Swal.fire({
          title: "¡Éxito!",
          text:
            data.message ||
            `SuperUsuario ${tipo === "crear" ? "registrado" : "actualizado"}.`,
          icon: "success",
          returnFocus: false,
          showConfirmButton: false,
          timer: 1500,
        }).then(() => {
          if (document.getElementById("usuariossup-link")) {
            document.getElementById("usuariossup-link").click();
          }
        });
      } else {
        Swal.fire("Atención", data.message || "Ocurrió un problema.", "warning");
      }
    })
    .catch((error) => {
      console.error("Error en procesarFormularioUserSup:", error);
      Swal.fire("Error", "Ocurrió un error inesperado.", "error");
    });
}
// OBTENER DATOS PARA EDITAR USUARIO Y EVENTOS SUBMIT
document.addEventListener("DOMContentLoaded", function () {
  document.body.addEventListener("submit", function (event) {
    if (event.target && event.target.id === "form-crearUserSup") {
      validarFormularioUserSup(event, "crear");
    } else if (event.target && event.target.id === "form-editarUserSup") {
      validarFormularioUserSup(event, "editar");
    }
  });

  document.body.addEventListener("click", function (event) {
    if (event.target.classList.contains("editarUserSup")) {
      const id = event.target.dataset.id;
      fetch(`cruds/obtener_usuario.php?id=${id}`)
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            const formulario = document.getElementById("form-editarUserSup");
            if (formulario) {
              const campos = [
                "idusuario",
                "usuario",
                "nombre",
                "papellido",
                "sapellido",
                "email",
                "rol",
                "tienda",
                "estatus",
              ];
              campos.forEach((campo) => {
                if (formulario[`editar-${campo}`]) {
                  formulario[`editar-${campo}`].value = data.users[campo] || "";
                }
              });
              document.getElementById("editar-password1").value = "";
              document.getElementById("editar-password2").value = "";

              abrirModalUserSup("editar-modalUserSup");
            }
          } else {
            Swal.fire(
              "Error",
              data.message || "No se pudo cargar el usuario.",
              "error",
            );
          }
        });
    }

    // ELIMINAR USUARIO SUP ***********************************
    if (event.target.classList.contains("eliminarUserSup")) {
      const id = event.target.dataset.id;
      Swal.fire({
        title: "¿Estás seguro?",
        text: "No podrás revertir esta acción",
        icon: "warning",
        returnFocus: false,
        showCancelButton: true,
        confirmButtonText: "Sí, eliminar",
      }).then((result) => {
        if (result.isConfirmed) {
          fetch(`cruds/eliminar_user.php?id=${id}`, { method: "POST" })
            .then((response) => response.json())
            .then((data) => {
              if (data.success) {
                Swal.fire("Eliminado", data.message, "success").then(() => {
                  if (document.getElementById("usuariossup-link")) {
                    document.getElementById("usuariossup-link").click();
                  }
                });
              } else {
                Swal.fire("Error", data.message, "error");
              }
            });
        }
      });
    }
  });
});