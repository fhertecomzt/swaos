// Llamar Usuarios super *********************************************
document
  .getElementById("usuariossup-link")
  .addEventListener("click", function (event) {
    event.preventDefault(); // Evita la acción por defecto del enlace
    fetch("usuariossup.php")
      .then((response) => response.text())
      .then((html) => {
        document.getElementById("content-area").innerHTML = html;

        // *** bloque dentro del callback ***
        const crearUsuarioFormSup = document.querySelector("#form-crearUserSup");
        console.log("Formulario de creación encontrado:", crearUsuarioFormSup);
        if (crearUsuarioFormSup) {
          crearUsuarioFormSup.addEventListener("submit", validarFormularioUser);
          console.log("Event listener adjuntado al formulario.");
        } else {
          console.log("Formulario de creación NO encontrado.");
        }
      })
      .catch((error) => {
        console.error("Error al cargar el contenido:", error);
      });
  });

//Crear usuario ***************************************************************
function abrirModalUserSup(id) {
  document.getElementById(id).style.display = "flex";
}

function cerrarModalUserSup(id) {
  document.getElementById(id).style.display = "none";
}

function procesarFormularioUserSup(event, tipo) {
  event.preventDefault(); //Para que no recergue la pagina
  const formData = new FormData(event.target);
  console.log("Interceptando envío del formulario usuarios"); // Verifica si se ejecuta

  fetch(`cruds/procesar_${tipo}_user.php`, {
    method: "POST",
    body: formData,
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("Respuesta del servidor:", data);

      if (!data.success) {
        throw new Error(data.message || "Error desconocido.");
      }

      console.log("Imagen subida con éxito:", data.rutaImagen);

      // Restablecer la variable después de recibir la respuesta del servidor
      enviando = false;

      // Aquí verificamos si la propiedad imagen existe antes de usarla
      if (!data.rutaImagen) {
        console.warn("No se recibió imagen en la respuesta del servidor.");
      }

      if (data.success) {
        // Cerrar el modal
        cerrarModalUserSup(tipo + "-modalUser");
        // Limpiar los campos del formulario
        event.target.reset();

        // Actualizar la tabla dinámicamente si es 'crear'
        if (tipo === "crear") {
          const tbody = document.querySelector("table tbody");

          // Crear una nueva fila
          const newRow = document.createElement("tr");
          newRow.innerHTML = `
                            <td data-lable"Imagen">${data.usuario.imagen}</td>
                            <td data-lable="Usuario:">${data.usuario.usuario}</td>
                            <td data-lable="Nombre:">${data.usuario.nombre}</td>
                            <td data-lable="Primer apellido:">${data.usuario.papellido}</td>
                            <td data-lable="Segundo apellido:">${data.usuario.sapellido}</td>
                            <td data-lable="Rol:">${data.usuario.nomrol}</td>
                            <td data-lable="Tienda:">${data.usuario.nomtienda}</td>
                            <td data-lable="Comisión:">${data.usuario.comision}</td>

                            <td data-lable="Estatus:">
                              <button class="btn ${
                                data.usuario.estatus == 0
                                  ? "btn-success"
                                  : "btn-danger"
                              }">
                                ${
                                  data.usuario.estatus == 0
                                    ? "Activo"
                                    : "Inactivo"
                                }
                              </button>
                            </td>
                            <td data-lable="Editar:">
                              <button title="Editar" class="editarUser fa-solid fa-pen-to-square" data-id="${
                                data.usuario.id
                              }"></button>
                              </td>
                              <td data-lable="Eliminar">
                              <button title="Eliminar" class="eliminarUser fa-solid fa-trash" data-id="${
                                data.usuario.id
                              }"></button>
                            </td>
                            `;

          tbody.insertBefore(newRow, tbody.firstChild);
        }

        // Mostrar un mensaje de éxito
        Swal.fire({
          title: "¡Éxito!",
          text: data.message || "Usuario registrado.",
          icon: "success",
          showConfirmButton: false,
          timer: 1500,
          timerProgressBar: true,
        });
      } else {
        // Mostrar un mensaje de error específico del backend
        Swal.fire({
          title: "Error",
          text: data.message || "Ocurrió un problema.", // Mostrar el mensaje específico si existe
          icon: "error",
          showConfirmButton: false,
          timer: 1500,
          timerProgressBar: true,
        });
      }
    })
    .catch((error) => {
      // Manejar errores inesperados
      console.error("Error en fetch:", error);
      Swal.fire({
        title: "Error",
        text: "Ocurrió un error inesperado. Intente más tarde.",
        icon: "error",
        showConfirmButton: false,
        timer: 1500,
        timerProgressBar: true,
      });
    });
}

function validarFormularioUserSup(event) {
  event.preventDefault();
  console.log("validarFormularioUser ejecutado");

  const usuario = document.querySelector("[name='usuario']").value.trim();
  const nombre = document.querySelector("[name='nombre']").value.trim();
  const papellido = document.querySelector("[name='papellido']").value.trim();
  const sapellido = document.querySelector("[name='sapellido']").value.trim();
  const rol = document.querySelector("[name='rol']").value.trim();
  const password1 = document.querySelector("[name='password1']").value.trim();
  const password2 = document.querySelector("[name='password2']").value.trim();
  const tienda = document.querySelector("[name='tienda']").value.trim();
  const estatus = document.querySelector("[name='estatus']").value.trim();

  console.log("Valores de los campos:", {
    usuario,
    nombre,
    papellido,
    sapellido,
    rol,
    password1,
    password2,
    tienda,
    estatus,
  });

  const errores = [];

  // Función para manejar la visualización de errores en los inputs
  function mostrarError(selector, mensaje) {
    errores.push(mensaje);
    const inputElement = document.querySelector(selector);
    if (inputElement) {
      inputElement.focus();
      inputElement.classList.add("input-error");
    }
  }

  // Validaciones simples
  if (usuario.length < 3) {
    mostrarError(
      "#crear-usuario",
      "El usuario debe tener al menos 3 caracteres."
    );
  }
  if (nombre.length < 3) {
    mostrarError(
      "#crear-nombre",
      "El nombre debe tener al menos 3 caracteres."
    );
  }
  if (papellido.length < 3) {
    mostrarError(
      "#crear-papellido",
      "El primer apellido debe tener al menos 3 caracteres."
    );
  }
  if (sapellido.length < 3) {
    mostrarError(
      "#crear-sapellido",
      "El segundo apellido debe tener al menos 3 caracteres."
    );
  }

  // Validación de contraseñas
  const passwordErrores = validarContrasenasInterno(password1, password2);
  errores.push(...passwordErrores);
  if (passwordErrores.length > 0) {
    const inputpassword1 = document.querySelector("#crear-password1");
    if (inputpassword1 && !inputpassword1.classList.contains("input-error")) {
      inputpassword1.focus();
      inputpassword1.classList.add("input-error");
    }
  }

  console.log("Errores de validación:", errores);

  if (errores.length > 0) {
    Swal.fire({
      title: "Errores en el formulario",
      html: errores.join("<br>"),
      icon: "error",
    });
    return;
  }

  console.log("Iniciando verificación de duplicados...");
  // Verificar duplicados antes de proceder
  verificarDuplicadoUserSup(usuario, nombre)
    .then((esDuplicado) => {
      console.log("Resultado de verificarDuplicadoUser:", esDuplicado);
      if (esDuplicado) {
        Swal.fire({
          title: "Error",
          text: "El usuario o nombre ya existen. Por favor, elige otro.",
          icon: "error",
        });
        return; // Detener la ejecución si hay duplicados
      }

      console.log("No hay duplicados, procediendo a procesarFormularioUser...");
      // Si no hay errores, enviar el formulario
      procesarFormularioUserSup(event, "crear");
    })
    .catch((error) => {
      console.error("Error al verificar duplicados:", error);
      Swal.fire({
        title: "Error",
        text: "Ocurrió un problema al validar el usuario.",
        icon: "error",
      });
    });
}

//Validaciones contraseñas *****************************************************************
function validarContrasenasInternoSup(password1, password2) {
  const errores = [];

  // Validación de longitud mínima
  if (password1.length < 6) {
    errores.push("La contraseña debe tener al menos 6 caracteres.");
  }

  // Validación de coincidencia de contraseñas
  if (password1 !== password2) {
    errores.push("Las contraseñas no coinciden.");
  }

  // Validación de requisitos de complejidad
  const regex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
  if (!regex.test(password1)) {
    errores.push(
      "La contraseña debe contener al menos una mayúscula, una minúscula, un número y un carácter especial."
    );
  }

  return errores;
}

// Event listeners para remover la clase de error al escribir (delegados)
document.addEventListener("input", (event) => {
  if (event.target) {
    if (event.target.id === "crear-usuario" && event.target.value.length >= 3) {
      event.target.classList.remove("input-error");
    } else if (
      event.target.id === "crear-nombre" &&
      event.target.value.length >= 3
    ) {
      event.target.classList.remove("input-error");
    } else if (
      event.target.id === "crear-papellido" &&
      event.target.value.length >= 3
    ) {
      event.target.classList.remove("input-error");
    } else if (
      event.target.id === "crear-sapellido" &&
      event.target.value.length >= 3
    ) {
      event.target.classList.remove("input-error");
    } else if (event.target.id === "crear-password1") {
      if (
        event.target.value.length >= 6 &&
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/.test(
          event.target.value
        )
      ) {
        event.target.classList.remove("input-error");
      } else if (event.target.value.length >= 6) {
        // Podrías agregar una lógica para mostrar un mensaje más específico si cumple la longitud pero no la complejidad
      } else {
        // Si la longitud es menor a 6, la clase de error se gestiona en la validación del formulario
      }
    } else if (event.target.id === "crear-password2") {
      const password1Input = document.querySelector("#crear-password1");
      if (password1Input && event.target.value === password1Input.value) {
        event.target.classList.remove("input-error");
      } else if (
        password1Input &&
        event.target.value !== password1Input.value
      ) {
        event.target.classList.add("input-error");
      }
    }
  }
}); //Fin validar contraseña

function verificarDuplicadoUserSup(usuario, nombre) {
  return fetch("cruds/verificar_nombre_usuario.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ usuario, nombre }), // Ahora se envían ambos datos
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.existe) {
        Swal.fire({
          title: "Error",
          text: "El usuario o el nombre ya existen.",
          icon: "error",
        });
        return true; // Indicar que hay un duplicado
      }
      return false; // No hay duplicado
    })
    .catch((error) => {
      console.error("Error al verificar duplicado:", error);
      return true; // Asumimos duplicado en caso de error
    });
}

// Event listener para el envío del formulario de creación de usuario
const crearUsuarioFormSup = document.querySelector("#form-crearUserSup"); // Reemplaza con el ID real de tu formulario
if (crearUsuarioFormSup) {
  crearUsuarioFormSup.addEventListener("submit", validarFormularioUserSup);
}

//Para Editar Usuarios ********************************************
document.addEventListener("DOMContentLoaded", function () {
  // Escuchar clic en el botón de editar
  document.addEventListener("click", function (event) {
    if (event.target.classList.contains("editarUserSup")) {
      const id = event.target.dataset.id;
      // console.log("Botón editar clickeado. ID:", id);

      fetch(`cruds/obtener_usuario_sup.php?id=${id}`)
        .then((response) => response.json())
        .then((data) => {
          //console.log("Datos recibidos del servidor:", data); //Depuracion

          if (data.success) {
            const formularioUsuarioSup =
              document.getElementById("form-editarUserSup");

            if (formularioUsuarioSup) {
              const campos = [
                "idusuario",
                "usuario",
                "nombre",
                "papellido",
                "sapellido",
                "rol",
                "tienda",
                "comision",
                "estatus",
              ];
              campos.forEach((campo) => {
                // console.log(`Asignando ${campo}:`, data.users[campo]);
                const input = formularioUsuarioSup[`editar-${campo}`];
                if (input) {
                  //console.log(`Asignando ${campo}:`, data.users[campo]);
                  if (
                    campo === "rol" ||
                    campo === "tienda" ||
                    campo === "estatus"
                  ) {
                    // Para los selects, seleccionar la opción correcta
                    input.value = data.users[campo] || "";
                  } else {
                    // Para los inputs de texto, asignar el valor directamente
                    input.value = data.users[campo] || "";
                  }
                } else {
                  console.warn(
                    `El campo editar-${campo} no existe en el formulario.`
                  );
                }
              });
              abrirModalUserSup("editar-modalUserSup");
            } else {
              console.error("Formulario de edición no encontrado.");
            }
          } else {
            mostrarAlerta(
              "error",
              "Error",
              data.message || "No se pudo cargar el campo."
            );
          }
        })
        .catch((error) => {
          console.error("Error al obtener el campo:", error);
          mostrarAlerta(
            "error",
            "Error",
            "Ocurrió un problema al obtener los datos."
          );
        });
    }
  });

  // Validar y enviar el formulario de editar ****************************
  document.body.addEventListener("submit", function (event) {
    if (event.target && event.target.id === "form-editarUserSup") {
      event.preventDefault(); // Esto evita el comportamiento de recargar la página.
      validarFormularioEdicionUsuarioSup(event.target);
    }
  });
});

//Validar duplicados en editar usuario
function verificarDuplicadoEditarUsuarioSup(usuario, id = 0) {
  //console.log("Usuario:", usuario);
  //console.log("ID (si aplica):", id);

  return fetch("cruds/verificar_nombre_usuario.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ usuario, id }),
  })
    .then((response) => response.json())
    .then((data) => {
      //console.log("Respuesta de verificar_nombre_usuario.php:", data);
      if (data.existe) {
        Swal.fire({
          title: "Error",
          text: data.message || "El usuario ya existe. Por favor, elige otro.", // Mostrar el mensaje específico si existe
          icon: "error",
          showConfirmButton: false,
          timer: 1500,
          timerProgressBar: true,
        });
      }
      return data.existe;
    })
    .catch((error) => {
      console.error("Error al verificar duplicado:", error);
      return true; // Asume duplicado en caso de error
    });
}

// Validación del formulario de edición
async function validarFormularioEdicionUsuarioSup(formularioUsuarioSup) {
  const campos = [
    {
      nombrec: "usuario",
      min: 3,
      mensaje: "El usuario debe tener al menos 3 caracteres.",
    },
    {
      nombrec: "nombre",
      min: 3,
      mensaje: "El nombre debe tener al menos 3 caracteres.",
    },
    {
      nombrec: "papellido",
      min: 3,
      mensaje: "El primer apellido debe tener al menos 3 caracteres.",
    },
    {
      nombrec: "sapellido",
      min: 3,
      mensaje: "El segundo apellido debe tener al menos 3 caracteres.",
    },
  ];

  let primerError = null;
  const errores = [];

  // Validar cada campo
  campos.forEach((campo) => {
    const campoFormulario = document.getElementById(`editar-${campo.nombrec}`);
    if (!campoFormulario) {
      console.error(`El campo editar-${campo.nombrec} no se encontró.`);
      return; // Continúa con el siguiente campo
    }
    campoFormulario.addEventListener("input", () => {
      //Quita lo rojo del error al validar que es mayor o igual a su validación
      if (campoFormulario.value.length >= campo.min) {
        campoFormulario.classList.remove("input-error"); // Quita la clase si el campo es válido
      }
    });
    const valor = campoFormulario.value.trim();
    // Validar por longitud mínima
    if (valor.length < campo.min) {
      errores.push(campo.mensaje);
      campoFormulario.classList.add("input-error");
      campoFormulario.focus(); // Establece el foco en el campo inválido
      if (!primerError) primerError = campoFormulario; // Guardar el primer error
    } else {
      campoFormulario.classList.remove("input-error");
    }
  });
  // Si hay errores, mostrar la alerta y enfocar el primer campo con error
  if (errores.length > 0) {
    Swal.fire({
      title: "Errores en el formulario",
      html: errores.join("<br>"),
      icon: "error",
    });
    if (primerError) primerError.focus(); // Enfocar el primer campo con error
    return;
  }
  // Verificar duplicado antes de enviar el formulario
  const idInput = document.getElementById("editar-idusuario");
  const usuarioInput = document.getElementById("editar-usuario");

  if (!usuarioInput || !idInput) {
    console.log("Error: No se encontró el campo o ID.");
    return;
  }
  const usuario = usuarioInput.value.trim();
  const id = idInput.value;

  try {
    //console.log("Verificando duplicado. ID:", id, "usuario:", usuario);
    const esDuplicado = await verificarDuplicadoEditarUsuarioSup(usuario, id);
    if (esDuplicado) {
      return; // No enviar el formulario si hay duplicados
    } else {
      //cerrarModalusuario("editar-modalusuario");
      enviarFormularioEdicionUsuarioSup(formularioUsuarioSup); // Proceder si no hay duplicados
    }
  } catch (error) {
    console.error("Error al verificar duplicado:", error);
  }
}
// Enviar formulario de edición Usuario
function enviarFormularioEdicionUsuarioSup(formularioUsuarioSup) {
  if (!formularioUsuarioSup) {
    console.error("El formulario no se encontró.");
    return;
  }
  const formData = new FormData(formularioUsuarioSup);

  fetch("cruds/editar_user_sup.php", {
    method: "POST",
    body: formData,
  })
    .then((response) => response.json())
    .then((data) => {
      //Prueba console.log("Respuesta del servidor Edit:", data); // Para depuración
      if (data.success) {
        Swal.fire({
          title: "¡Éxito!",
          text: data.message || "La actualización se realizó correctamente.",
          icon: "success",
          showConfirmButton: false,
          timer: 1500,
          timerProgressBar: true,
        });
        actualizarFilaTablaUsuarioSup(formData);
        cerrarModalUserSup("editar-modalUserSup");
      } else {
        Swal.fire({
          title: "¡Error!",
          text: data.message || "No hubo cambios en el registro.",
          icon: "warning",
          showConfirmButton: false,
          timer: 1500,
          timerProgressBar: true,
        });
      }
    })
    .catch((error) => {
      console.error("Error al actualizar:", error);
      mostrarAlerta("error", "Error", "Ocurrió un problema al actualizar.");
    });
}
// Actualizar fila de la tabla usuario ************************************
function actualizarFilaTablaUsuarioSup(formData) {
  //  console.log("Datos enviados al formulario:", Object.fromEntries(formData));

  const fila = document
    .querySelector(`button[data-id="${formData.get("editar-idusuario")}"]`)
    .closest("tr");
  //console.log(formData.get("editar-idusuario"));
  if (fila) {
    fila.cells[0].textContent = formData.get("imagen");
    fila.cells[1].textContent = formData.get("usuario");
    fila.cells[2].textContent = formData.get("nombre");
    fila.cells[3].textContent = formData.get("papellido");
    fila.cells[4].textContent = formData.get("sapellido");
    fila.cells[5].textContent = formData.get("rol");
    fila.cells[6].textContent = formData.get("tienda");
    fila.cells[7].textContent = formData.get("comision");
    // Determinar clases y texto del botón
    const estatus = formData.get("estatus") === "0" ? "Activo" : "Inactivo";
    const claseBtn =
      formData.get("estatus") === "0" ? "btn btn-success" : "btn btn-danger";

    // Insertar el botón en la celda
    fila.cells[8].innerHTML = `<button class="${claseBtn}">${estatus}</button>`;
    //Para mantener el filtro seleccionado y actualizar la tabla cuando se edite
    cargarUsuariosFiltradosSup();
  }
}

// Eliminar usuario *************************************************
document.addEventListener("click", function (event) {
  if (event.target.classList.contains("eliminarUserSup")) {
    const id = event.target.dataset.id;

    Swal.fire({
      title: "¿Estás seguro?",
      text: "No podrás revertir esta acción",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        // Realizar la solicitud para eliminar
        fetch(`cruds/eliminar_user.php?id=${id}`, { method: "POST" })
          .then((response) => response.json())
          .then((data) => {
            if (data.success) {
              //alert("Registro eliminado correctamente");
              Swal.fire({
                title: "Eliminado",
                text: data.message, // Mostrar el mensaje específico si existe
                icon: "warning",
                showConfirmButton: false,
                timer: 1500,
                timerProgressBar: true,
              });
              // Remover la fila de la tabla
              event.target.closest("tr").remove();
            } else {
              Swal.fire(
                "Error",
                data.message || "No se pudo eliminar el registro.",
                "error"
              );
            }
          })
          .catch((error) => {
            Swal.fire(
              "Error",
              "Hubo un problema al procesar tu solicitud.",
              "error"
            );
            console.error("Error al eliminar la tienda:", error);
          });
      }
    });
  }
});

//Buscar en la tabla y filtrar usuarios
document.addEventListener("DOMContentLoaded", function () {
  const observarDOMSup = new MutationObserver(function (mutations) {
    mutations.forEach((mutation) => {
      if (mutation.type === "childList") {
        const buscarBox = document.getElementById("buscarboxusuarioSup");
        if (buscarBox) {
          //console.log("Elemento 'buscarbox' encontrado dinámicamente");
          agregarEventoBuscarUsuarioSup(buscarBox);
          observarDOMSup.disconnect(); // Deja de observar después de encontrarlo
        }
      }
    });
  });

  // Comienza a observar el body del DOM
  observarDOMSup.observe(document.body, { childList: true, subtree: true });

  // Si el elemento ya existe en el DOM
  const buscarBoxInicial = document.getElementById("buscarboxusuarioSup");
  if (buscarBoxInicial) {
    console.log("Elemento 'buscarboxusuarioSup' ya existe en el DOM");
    agregarEventoBuscarUsuarioSup(buscarBoxInicial);
    observarDOMSup.disconnect(); // No es necesario seguir observando
  }

  // Función para agregar el evento de búsqueda
  function agregarEventoBuscarUsuarioSup(buscarBox) {
    buscarBox.addEventListener("input", function () {
      const filtro = buscarBox.value.toLowerCase();
      const filas = document.querySelectorAll("#tabla-usuariosSup tbody tr");

      filas.forEach((fila) => {
        const textoFila = fila.textContent.toLowerCase();
        fila.style.display = textoFila.includes(filtro) ? "" : "none";
      });
    });
  }
});

//Limpiar busqueda usuarios
document.addEventListener("DOMContentLoaded", function () {
  // Delegación del evento 'input' en el campo de búsqueda
  document.addEventListener("input", function (event) {
    if (event.target.id === "buscarboxusuarioSup") {
      const buscarBox = event.target; // El input dinámico
      const filtro = buscarBox.value.toLowerCase();
      const limpiarBusquedaUsuario = document.getElementById(
        "limpiar-busquedaUsuario"
      ); // Botón dinámico
      const filas = document.querySelectorAll("#tabla-usuariosSup tbody tr");
      const mensajeVacio = document.getElementById("mensaje-vacio");

      let coincidencias = 0; // Contador de filas visibles

      filas.forEach((fila) => {
        const textoFila = fila.textContent.toLowerCase();
        if (textoFila.includes(filtro)) {
          fila.style.display = ""; // Mostrar fila
          coincidencias++;
        } else {
          fila.style.display = "none"; // Ocultar fila
        }
      });

      // Mostrar/ocultar mensaje de resultados vacíos
      if (coincidencias === 0) {
        mensajeVacio.style.display = "block";
      } else {
        mensajeVacio.style.display = "none";
      }

      // Filtrar las filas de la tabla
      filas.forEach((fila) => {
        const textoFila = fila.textContent.toLowerCase();
        fila.style.display = textoFila.includes(filtro) ? "" : "none";
      });
    }
  });

  // Delegación del evento 'click' en el botón "Limpiar"
  document.addEventListener("click", function (event) {
    if (event.target.id === "limpiar-busquedaUsuarios") {
      const buscarBox = document.getElementById("buscarboxusuarioSup");
      const limpiarBusquedaUsuarios = event.target;

      if (buscarBox) {
        buscarBox.value = ""; // Limpiar el input
        if (limpiarBusquedaUsuarios) {
          limpiarBusquedaUsuarios.style.display = "none"; // Ocultar el botón de limpiar
          document.getElementById("mensaje-vacio").style.display = "none";
        }
      }

      const filas = document.querySelectorAll("#tabla-usuariosSup tbody tr");
      filas.forEach((fila) => {
        fila.style.display = ""; // Mostrar todas las filas
      });
    }
  });
});

//Función para filtrar usuarios desde el servidor ****************************
function cargarUsuariosFiltradosSup() {
  const estatusFiltro = document
    .getElementById("estatusFiltroUSup")
    .value.trim()
    .toLowerCase();

  if (!estatusFiltro) {
    cargarUsuariosSup(); // Si el usuario selecciona "Todos", cargamos los primeros 10 usuarios normales
    return;
  }
  //console.log("Cargando usuarios filtradas del servidor:", estatusFiltro);

  fetch(`cruds/cargar_usuarios_sup.php?estatus=${estatusFiltro}`)
    .then((response) => response.json())
    .then((data) => {
      //console.log("Filtradas: ",data);
      actualizarTablaUsuariosSup(data);
    })
    .catch((error) =>
      console.error("Error al cargar usuarios filtradas:", error)
    );
}

//Función para actualizar tabla usuarios filtrados
function actualizarTablaUsuariosSup(data) {
  let tbody = document.getElementById("usuarios-lista");
  tbody.innerHTML = ""; // Limpiar la tabla
  //console.log(data);

  if (data.length === 0) {
    tbody.innerHTML = `<tr><td colspan='7' style='text-align: center; color: red;'>No se encontraron usuarios</td></tr>`;
    return;
  }
  //LIMPIAR LA TABLA antes de agregar nuevos usuarios
  tbody.innerHTML = "";

  data.forEach((usuario) => {
    const fila = document.createElement("tr");
    fila.innerHTML = `
          <td data-lable"Imagen:"><img src="${
            usuario.imagen
          }" width="50" height="50" onerror="this.src='../imgs/default.png'"></td>
          <td data-lable="Usuario:">${usuario.usuario}</td>
          <td data-lable="Nombre:">${usuario.nombre}</td>
          <td data-lable="Primer apellido:">${usuario.appaterno}</td>
          <td data-lable="Segundo apellido:">${usuario.apmaterno}</td>          
          <td data-lable="Rol:">${usuario.nomrol}</td>
          <td data-lable="Tienda:">${usuario.nomtienda}</td>
          <td data-lable="Comisión:">${usuario.comision}</td>

          <td data-lable="Estatus">
          <button class="btn ${
            usuario.estatus == 0 ? "btn-success" : "btn-danger"
          }">
                             ${usuario.estatus == 0 ? "Activo" : "Inactivo"}
          </button>
          </td>
          <td data-lable="Editar">
            <button title="Editar" class="editarUserSup fa-solid fa-pen-to-square" data-id="${
              usuario.idusuario
            }"></button>
            </td>
            <td data-lable="Eliminar">
            <button title="Eliminar" class="eliminarUserSup fa-solid fa-trash" data-id="${
              usuario.idusuario
            }"></button>
          </td>
      `;
    tbody.appendChild(fila);
  });
}

//Función para cargar los primeros 10 Usuarios por defecto
function cargarUsuariosSup() {
  pagina = 2; //Reiniciar la paginación cuando seleccionas "Todos"
  cargando = false; //Asegurar que el scroll pueda volver a activarse

  fetch("cruds/cargar_usuarios_sup.php?limit=10&offset=0")
    .then((response) => response.json())
    .then((data) => {
      actualizarTablaUsuariosSup(data);
    })
    .catch((error) => console.error("Error al cargar usuarios:", error));
}

/* ------------------------ SCROLL USUARIOS INFINITO ------------------------*/

function cargarUsuariosScrollSup() {
  if (cargando) return;
  cargando = true;

  // Obtener el filtro actual para que el scroll también lo respete
  const estatusFiltro = document
    .getElementById("estatusFiltroUSup")
    .value.trim()
    .toLowerCase();
  let url = `cruds/cargar_usuarios_scroll_sup.php?page=${pagina}`;

  if (estatusFiltro !== "") {
    url += `&estatus=${estatusFiltro}`; // Enviar el filtro al servidor
  }

  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      if (data.length > 0) {
        const tbody = document.querySelector("#tabla-usuariosSup tbody");
        data.forEach((usuario) => {
          const row = document.createElement("tr");
          row.innerHTML = `
            <td data-lable"Imagen:"><img src="${
              usuario.imagen
            }" width="50" height="50" onerror="this.src='../imgs/default.png'"></td>
            <td data-lable="Usuario:">${usuario.usuario}</td>
            <td data-lable="Nombre:">${usuario.nombre}</td>
            <td data-lable="Primer apellido:">${usuario.appaterno}</td>
            <td data-lable="Segundo apellido:">${usuario.apmaterno}</td>
            <td data-lable="Rol:">${usuario.nomrol}</td>
            <td data-lable="Tienda:">${usuario.nomtienda}</td>
            <td data-lable="Comisión:">${usuario.comision}</td>

            <td data-lable="Estatus:">
              <button class="btn ${
                usuario.estatus == 0 ? "btn-success" : "btn-danger"
              }">
                ${usuario.estatus == 0 ? "Activo" : "Inactivo"}
              </button>
            </td>
            <td data-lable="Editar:">
              <button title="Editar" class="editarUserSup fa-solid fa-pen-to-square" data-id="${
                usuario.idusuario
              }"></button>
              </td>
              <td data-lable="Eliminar:">
              <button title="Eliminar" class="eliminarUserSup fa-solid fa-trash" data-id="${
                usuario.idusuario
              }"></button>
            </td>
          `;
          tbody.appendChild(row);
        });

        pagina++; // Aumentamos la página
        cargando = false;
      } else {
        Swal.fire({
          title: "No hay más usuarios.",
          icon: "info",
          showConfirmButton: false,
          timer: 1500,
          timerProgressBar: true,
        });
      }
    })
    .catch((error) => console.error("Error al cargar usuarios:", error));
}

document.addEventListener("DOMContentLoaded", function () {
  if (window.location.pathname.includes("usuariossup.php")) {
    pagina = 2; //  Reiniciar paginación
    cargando = false; // Permitir cargar más usuarios
    console.log("Reiniciando scroll y cargando usuarios en usuarios.php");

    //REACTIVAR EL SCROLL INFINITO CUANDO REGRESES A usuarios.php
    iniciarScrollUsuariosSup();
  }
});

function iniciarScrollUsuariosSup() {
  const scrollContainer = document.getElementById("scroll-containerUSup");
  if (!scrollContainer) return;

  scrollContainer.addEventListener("scroll", () => {
    if (
      scrollContainer.scrollTop + scrollContainer.clientHeight >=
        scrollContainer.scrollHeight - 10 &&
      !cargando
    ) {
      console.log(" Scroll detectado, cargando más usuarios...");
      cargarUsuariosScrollSup();
    }
  });

  //console.log(" Scroll infinito reactivado en usuarios.php");
}

const observerUsuariosSup = new MutationObserver(() => {
  const usuariosSeccionSup = document.getElementById("scroll-containerUSup");
  if (usuariosSeccionSup) {
    observer.disconnect();
    iniciarScrollUsuariosSup();
  }
});

const UsuariosSup = document.getElementById("content-area");
if (UsuariosSup) {
  observerUsuariosSup.observe(UsuariosSup, { childList: true, subtree: true });
}
