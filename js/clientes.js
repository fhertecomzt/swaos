document
  .getElementById("clientes-link")
  .addEventListener("click", function (event) {
    event.preventDefault(); // Evita la acción por defecto del enlace
    fetch("catalogos/clientes.php")
      .then((response) => response.text())
      .then((html) => {
        document.getElementById("content-area").innerHTML = html;
      })
      .catch((error) => {
        console.error("Error al cargar el contenido:", error);
      });
  });

//Crear Clientes***************
function abrirModalCliente(id) {
  document.getElementById(id).style.display = "flex";
}

function cerrarModalCliente(id) {
  document.getElementById(id).style.display = "none";
}

function procesarFormularioCliente(event, tipo) {
  event.preventDefault(); //Para que no recergue la pagina
  const formData = new FormData(event.target);

  fetch(`cruds/procesar_${tipo}_cliente.php`, {
    method: "POST",
    body: formData,
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        // Cerrar el modal
        cerrarModalCliente(tipo + "-modalCliente");
        // Limpiar los campos del formulario
        event.target.reset();

        // Actualizar la tabla dinámicamente si es 'crear'
        if (tipo === "crear") {
          const tbody = document.querySelector("table tbody");

          // Crear una nueva fila
          const newRow = document.createElement("tr");
          newRow.innerHTML = `
            <td>${data.cliente.cliente}</td>
            <td>${data.cliente.telefono}</td>
            <td>${data.cliente.email}</td>
            <td><button class="btn ${
              data.cliente.estatus == 0 ? "btn-success" : "btn-danger"
            }">
              ${data.cliente.estatus == 0 ? "Activo" : "Inactivo"}
              </button>
            </td>
            <td>
              <button title="Editar" class="editarCliente fa-solid fa-pen-to-square" data-id="${
                data.cliente.id
              }"></button>
              </td>
              <td>
              <button title="Eliminar" class="eliminarCliente fa-solid fa-trash" data-id="${
                data.cliente.id
              }"></button>
            </td>
          `;

          // Agregar la nueva fila a la tabla
          tbody.appendChild(newRow);
        }

        // Mostrar un mensaje de fin de scroll
        Swal.fire({
          title: "Registro exitoso",
          text: data.message, // Usar el mensaje del backend
          icon: "success",
          showConfirmButton: false,
          timer: 1500,
        });
      } else {
        // Mostrar un mensaje de error específico del backend
        Swal.fire({
          title: "Error",
          text: data.message || "Ocurrió un problema.", // Mostrar el mensaje específico si existe
          icon: "error",
        });
      }
    })
    .catch((error) => {
      // Manejar errores inesperados
      console.error("Error:", error);
      Swal.fire({
        title: "Error",
        text: "Ocurrió un error inesperado. Intente más tarde.",
        icon: "error",
      });
    });
}
function validarFormularioCliente(event) {
  event.preventDefault();

  const cliente = document.querySelector("[name='cliente']").value.trim();
  const papellido = document.querySelector("[name='papellido']").value.trim();
  const sapellido = document.querySelector("[name='sapellido']").value.trim();
  const rfc = document.querySelector("[name='rfc']").value.trim();
  const calle = document.querySelector("[name='calle']").value.trim();
  const noexterior = document.querySelector("[name='noexterior']").value.trim();
  const telefono = document.querySelector("[name='telefono']").value.trim();

  //Validaciones select de crear cliente
  const selectEstado = document.querySelector("#estado");
  const selectMunicipio = document.querySelector("#municipio");
  const selectColonia = document.querySelector("#colonia");

  const errores = [];

  if (cliente.length < 3) {
    errores.push("El nombre debe tener al menos 3 caracteres.");
    const inputname = document.querySelector("#crear-cliente");
    inputname.focus();
    inputname.classList.add("input-error"); // Añade la clase de error
  }
  // Elimina la clase de error al corregir
  const inputname = document.querySelector("#crear-cliente");
  inputname.addEventListener("input", () => {
    if (inputname.value.length >= 3) {
      inputname.classList.remove("input-error"); // Quita la clase si el campo es válido
    }
  });

  if (papellido.length < 3) {
    errores.push("El primer apellido debe tener al menos 3 caracteres.");
    const inputpapellido = document.querySelector("#crear-papellido");
    inputpapellido.focus();
    inputpapellido.classList.add("input-error"); // Añade la clase de error
  }
  // Elimina la clase de error al corregir
  const inputpapellido = document.querySelector("#crear-papellido");
  inputpapellido.addEventListener("input", () => {
    if (inputpapellido.value.length >= 3) {
      inputpapellido.classList.remove("input-error"); // Quita la clase si el campo es válido
    }
  });

  if (sapellido.length < 3) {
    errores.push("El segundo apellido debe tener al menos 3 caracteres.");
    const inputsapellido = document.querySelector("#crear-sapellido");
    inputsapellido.focus();
    inputsapellido.classList.add("input-error"); // Añade la clase de error
  }
  // Elimina la clase de error al corregir
  const inputsapellido = document.querySelector("#crear-sapellido");
  inputsapellido.addEventListener("input", () => {
    if (inputsapellido.value.length >= 3) {
      inputsapellido.classList.remove("input-error"); // Quita la clase si el campo es válido
    }
  });

  if (rfc.length < 12) {
    errores.push("El RFC debe tener al menos 12 caracteres.");
    const inputrfc = document.querySelector("#crear-rfc");
    inputrfc.focus();
    inputrfc.classList.add("input-error"); // Añade la clase de error
  }
  // Elimina la clase de error al corregir
  const inputrfc = document.querySelector("#crear-rfc");
  inputrfc.addEventListener("input", () => {
    if (inputrfc.value.length >= 12) {
      inputrfc.classList.remove("input-error"); // Quita la clase si el campo es válido
    }
  });

  if (calle.length < 3) {
    errores.push("La calle debe tener al menos 3 caracteres.");
    const inputcalle = document.querySelector("#crear-calle");
    inputcalle.focus();
    inputcalle.classList.add("input-error"); // Añade la clase de error
  }
  // Elimina la clase de error al corregir
  const inputcalle = document.querySelector("#crear-calle");
  inputcalle.addEventListener("input", () => {
    if (inputcalle.value.length >= 3) {
      inputcalle.classList.remove("input-error"); // Quita la clase si el campo es válido
    }
  });
  if (isNaN(parseInt(noexterior)) || parseInt(noexterior) < 1) {
    errores.push("El número exterior debe ser mayor a 0");
    const inputnoexterior = document.querySelector("#crear-noexterior");
    inputnoexterior.focus();
    inputnoexterior.classList.add("input-error"); // Añade la clase de error
  }
  // Elimina la clase de error al corregir
  const inputnoexterior = document.querySelector("#crear-noexterior");
  inputnoexterior.addEventListener("input", () => {
    if (inputnoexterior.value.length >= 1) {
      inputnoexterior.classList.remove("input-error"); // Quita la clase si el campo es válido
    }
  });

  if (telefono.length < 1) {
    errores.push("EL teléfono debe contener 10 números.");
    const inputtelefono = document.querySelector("#crear-telefono");
    inputtelefono.focus();
    inputtelefono.classList.add("input-error"); // Añade la clase de error
  }
  // Elimina la clase de error al corregir
  const inputtelefono = document.querySelector("#crear-telefono");
  inputtelefono.addEventListener("input", () => {
    if (inputtelefono.value.length >= 1) {
      inputtelefono.classList.remove("input-error"); // Quita la clase si el campo es válido
    }
  });
  if (selectEstado.value === "") {
    errores.push("Selecciona un estado.");
    const selectestado = document.querySelector("#estado");
    selectestado.focus();
    selectestado.classList.add("input-error"); // Añade la clase de error
  }
  // Elimina la clase de error al corregir
  const selectestado = document.querySelector("#estado");
  selectestado.addEventListener("input", () => {
    if (selectestado.value.length >= 0) {
      selectestado.classList.remove("input-error"); // Quita la clase si el campo es válido
    }
  });

  if (selectMunicipio.value === "") {
    errores.push("Selecciona un municipio.");
    const selectmunicipio = document.querySelector("#municipio");
    selectmunicipio.focus();
    selectmunicipio.classList.add("input-error"); // Añade la clase de error
  }
  // Elimina la clase de error al corregir
  const selectmunicipio = document.querySelector("#municipio");
  selectmunicipio.addEventListener("input", () => {
    if (selectmunicipio.value.length >= 0) {
      selectmunicipio.classList.remove("input-error"); // Quita la clase si el campo es válido
    }
  });

  if (selectColonia.value === "") {
    errores.push("Selecciona una colonia.");
    const selectColonia = document.querySelector("#colonia");
    selectColonia.focus();
    selectColonia.classList.add("input-error"); // Añade la clase de error
  }
  // Elimina la clase de error al corregir
  const selectcolonia = document.querySelector("#colonia");
  selectcolonia.addEventListener("input", () => {
    if (selectcolonia.value.length >= 0) {
      selectcolonia.classList.remove("input-error"); // Quita la clase si el campo es válido
    }
  });

  if (errores.length > 0) {
    Swal.fire({
      title: "Errores en el formulario",
      html: errores.join("<br>"),
      icon: "warning",
      showConfirmButton: false,
      timer: 1500,
      timerProgressBar: true,
    });
    return;
  }

  // Verificar duplicados de clientes
  verificarDuplicadoCliente(cliente)
    .then((esDuplicado) => {
      if (esDuplicado) {
        Swal.fire({
          title: "Error",
          text: "El nombre del cliente ya existe. Por favor, elige otro.",
          icon: "warning",
          showConfirmButton: false,
          timer: 1500,
          timerProgressBar: true,
        });
      } else {
        // Si no hay errores, enviar el formulario
        procesarFormularioCliente(event, "crear");
      }
    })
    .catch((error) => {
      console.error("Error al verificar duplicados:", error);
      Swal.fire({
        title: "Error",
        text: "Ocurrió un problema al validar el nombre.",
        icon: "error",
        showConfirmButton: false,
        timer: 1500,
        timerProgressBar: true,
      });
    });
}
function verificarDuplicadoCliente(cliente) {
  //console.log("Nombre verificar:", cliente);

  return fetch("cruds/verificar_nombre_cliente.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ cliente }),
  })
    .then((response) => response.json())
    .then((data) => {
      //console.log("Respuesta de verificar_nombre.php:", data);
      if (data.existe) {
        Swal.fire({
          title: "Error",
          text: data.message, // Mostrar el mensaje específico si existe
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
//Editar Clientes************************************************************
document.addEventListener("DOMContentLoaded", function () {
  // Escuchar clic en el botón de editar
  document.addEventListener("click", function (event) {
    if (event.target.classList.contains("editarCliente")) {
      const id = event.target.dataset.id;
      //console.log("Botón editar clickeado. ID:", id);

      fetch(`cruds/obtener_cliente.php?id=${id}`)
        .then((response) => response.json())
        .then((data) => {
          //console.log("Datos recibidos del servidor:", data);
          if (data.success) {
            const formularioCliente =
              document.getElementById("form-editarCliente");
            if (formularioCliente) {
              // --- INICIO: NUEVA LÓGICA DE POBLADO ---
              // 1. Llenar campos simples (inputs de texto, etc.)
              const campos = [
                "idcliente",
                "cliente",
                "papellido",
                "sapellido",
                "rfc",
                "calle",
                "noexterior",
                "nointerior",
                "email",
                "telefono",
                "estatus",
              ];
              //console.log(`Asignando ${campos}:`, data.cliente[campos]);
              campos.forEach((campo) => {
                const input = formularioCliente[`editar-${campo}`];
                if (input) {
                  //console.log(`Asignando ${campo}:`, data.cliente[campo]);
                  input.value = data.cliente[campo] || "";
                } else {
                  console.warn(`Campo 'editar-${campo}' no encontrado.`);
                }
              });

              // 2. Obtener los IDs y valores guardados de la base de datos
              const idEstadoDB = data.cliente.estado;
              const idMunicipioDB = data.cliente.municipio;
              const idColoniaDB = data.cliente.colonia;
              const cpDB = data.cliente.codigo_postal; // Obtenemos el CP

              // 3. Llamar a nuestra nueva función para cargar y seleccionar
              //    los valores en los selects anidados.
              cargarYSeleccionarUbicacionEditar(
                idEstadoDB,
                idMunicipioDB,
                idColoniaDB,
                cpDB
              );

              // --- FIN: NUEVA LÓGICA DE POBLADO ---
              abrirModalCliente("editar-modalCliente");
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

  // Validar y enviar el formulario de edición
  document.body.addEventListener("submit", function (event) {
    if (event.target && event.target.id === "form-editarCliente") {
      event.preventDefault(); // Esto evita el comportamiento predeterminado de recargar la página.
      validarFormularioEdicionCliente(event.target);
    }
  });
});

// Función genérica para mostrar alertas
function mostrarAlerta(tipo, titulo, mensaje) {
  Swal.fire({ title: titulo, text: mensaje, icon: tipo });
}

//Validar duplicados en edicion cliente
function verificarDuplicadoEditarCliente(cliente, id = 0) {
  //console.log("Validando duplicados. ID:", id, "Cliente:", cliente);

  return fetch("cruds/verificar_nombre_cliente.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ cliente, id }),
  })
    .then((response) => response.json())
    .then((data) => {
      //console.log("Respuesta de verificar_nombre.php:", data);
      if (data.existe) {
        Swal.fire({
          title: "Atención",
          text: data.message || "El nombre del cliente ya existe.", // Mostrar el mensaje específico si existe
          icon: "warning",
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
// Validación del formulario de edición Cliente
async function validarFormularioEdicionCliente(formulario) {
  const campos = [
    {
      nombre: "cliente",
      min: 3,
      mensaje: "El nombre debe tener al menos 3 caracteres.",
    },
    {
      nombre: "papellido",
      min: 3,
      mensaje: "El primer apellido debe tener al menos 3 caracteres.",
    },
    {
      nombre: "sapellido",
      min: 3,
      mensaje: "El segundo apellido debe tener al menos 3 caracteres.",
    },
    {
      nombre: "rfc",
      min: 12,
      mensaje: "El RFC debe tener al menos 12 caracteres.",
    },
    {
      nombre: "calle",
      min: 3,
      mensaje: "La calle debe tener al menos 3 caracteres.",
    },
    {
      nombre: "noexterior",
      min: 1,
      mensaje: "El número exterior debe ser mayor a 0",
      numerico: true,
    },
    {
      nombre: "nointerior",
      min: 0,
      mensaje: "El número interior debe ser mayor o igual a 0",
    },
  ];
  let primerError = null;
  const errores = [];

  // Validar cada campo
  campos.forEach((campo) => {
    const campoFormulario = document.getElementById(`editar-${campo.nombre}`);
    if (!campoFormulario) {
      console.error(`El campo editar-${campo.nombre} no se encontró.`);
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
      icon: "warning",
      showConfirmButton: false,
      timer: 1500,
      timerProgressBar: true,
    });
    if (primerError) primerError.focus(); // Enfocar el primer campo con error
    return;
  }

  // Verificar duplicado antes de enviar el formulario
  const clienteInput = document.getElementById("editar-cliente");
  const idInput = document.getElementById("editar-idcliente");
  if (!clienteInput || !idInput) {
    console.log("Error: No se encontró el campo o ID.");
    return;
  }
  const cliente = clienteInput.value.trim();
  const id = idInput.value;

  try {
    //console.log("Verificando duplicado. ID:", id, "Cliente:", cliente);
    const esDuplicado = await verificarDuplicadoEditarCliente(cliente, id);
    if (esDuplicado) {
      return; // No enviar el formulario si hay duplicados
    } else {
      //cerrarModalCliente("editar-modalCliente");
      enviarFormularioEdicionCliente(formulario); // Proceder si no hay duplicados
    }
  } catch (error) {
    console.error("Error al verificar duplicado:", error);
  }
}
// Enviar formulario de edición Cliente
function enviarFormularioEdicionCliente(formulario) {
  if (!formulario) {
    console.error("El formulario no se encontró.");
    return;
  }
  const formData = new FormData(formulario);

  fetch("cruds/editar_cliente.php", {
    method: "POST",
    body: formData,
  })
    .then((response) => response.json())
    .then((data) => {
      //console.log("Respuesta del servidorEdit:", data);
      if (data.success) {
        Swal.fire({
          title: "Actualizado",
          text: data.message || "El cliente ha sido actualizado correctamente.", // Mostrar el mensaje específico si existe
          icon: "success",
          showConfirmButton: false,
          timer: 1500,
          timerProgressBar: true,
        });

        actualizarFilaTablaCliente(formData);
        cerrarModal("editar-modalCliente");
      } else {
        Swal.fire({
          title: "!Atención!",
          text: data.message || "No se realizaron cambios en el registro.", // Mostrar el mensaje específico si existe
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
// Actualizar fila de la tabla
function actualizarFilaTablaCliente(formData) {
  const fila = document
    .querySelector(`button[data-id="${formData.get("editar-idcliente")}"]`)
    .closest("tr");
  //console.log(formData.get("editar-idcliente"));
  if (fila) {
    fila.cells[0].textContent = formData.get("cliente");
    fila.cells[1].textContent = formData.get("telefono");
    fila.cells[2].textContent = formData.get("email");
    // Determinar clases y texto del botón
    const estatus = formData.get("estatus") === "0" ? "Activo" : "Inactivo";
    const claseBtn =
      formData.get("estatus") === "0" ? "btn btn-success" : "btn btn-danger";

    // Insertar el botón en la celda
    fila.cells[3].innerHTML = `<button class="${claseBtn}">${estatus}</button>`;
    //Para mantener el filtro seleccionado y actualizar la tabla cuando se edite
    cargarClientesFiltrados();
  }
}
// Eliminar Clientes*****************************
document.addEventListener("click", function (event) {
  if (event.target.classList.contains("eliminarCliente")) {
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
        fetch(`cruds/eliminar_cliente.php?id=${id}`, { method: "POST" })
          .then((response) => response.json())
          .then((data) => {
            if (data.success) {
              //alert("Registro eliminado correctamente");

              Swal.fire({
                title: "Eliminado!",
                text:
                  data.message ||
                  "El registro ha sido eliminado correctamente.", // Mostrar el mensaje específico si existe
                icon: "success",
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
            console.error("Error al eliminar:", error);
          });
      }
    });
  }
});

//Buscar en la tabla y filtrar *************************
document.addEventListener("DOMContentLoaded", function () {
  const observarDOM = new MutationObserver(function (mutations) {
    mutations.forEach((mutation) => {
      if (mutation.type === "childList") {
        const buscarBox = document.getElementById("buscarboxcliente");
        if (buscarBox) {
          //console.log("Elemento 'buscarbox' encontrado dinámicamente");
          agregarEventoBuscarCliente(buscarBox);
          observarDOM.disconnect(); // Deja de observar después de encontrarlo
        }
      }
    });
  });

  // Comienza a observar el body del DOM
  observarDOM.observe(document.body, { childList: true, subtree: true });

  // Si el elemento ya existe en el DOM
  const buscarBoxInicial = document.getElementById("buscarboxcliente");
  if (buscarBoxInicial) {
    console.log("Elemento 'buscarboxcliente' ya existe en el DOM");
    agregarEventoBuscarCliente(buscarBoxInicial);
    observarDOM.disconnect(); // No es necesario seguir observando
  }

  // Función para agregar el evento de búsqueda
  function agregarEventoBuscarCliente(buscarBox) {
    buscarBox.addEventListener("input", function () {
      const filtro = buscarBox.value.toLowerCase();
      const filas = document.querySelectorAll("#tabla-clientes tbody tr");

      filas.forEach((fila) => {
        const textoFila = fila.textContent.toLowerCase();
        fila.style.display = textoFila.includes(filtro) ? "" : "none";
      });
    });
  }
});

//Limpiar busqueda
document.addEventListener("DOMContentLoaded", function () {
  // Delegación del evento 'input' en el campo de búsqueda
  document.addEventListener("input", function (event) {
    if (event.target.id === "buscarboxcliente") {
      const buscarBox = event.target; // El input dinámico
      const filtro = buscarBox.value.toLowerCase();
      const limpiarBusquedaCliente = document.getElementById(
        "limpiar-busquedaCliente"
      ); // Botón dinámico
      const filas = document.querySelectorAll("#tabla-clientes tbody tr");
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
    if (event.target.id === "limpiar-busquedaCliente") {
      const buscarBox = document.getElementById("buscarboxcliente");
      const limpiarBusquedaCliente = event.target;

      if (buscarBox) {
        buscarBox.value = ""; // Limpiar el input
        if (limpiarBusquedaCliente) {
          limpiarBusquedaCliente.style.display = "none"; // Ocultar el botón de limpiar
          document.getElementById("mensaje-vacio").style.display = "none";
        }
      }

      const filas = document.querySelectorAll("#tabla-clientes tbody tr");
      filas.forEach((fila) => {
        fila.style.display = ""; // Mostrar todas las filas
      });
    }
  });
});

//Función para filtrar clientes desde el servidor ***********************************
function cargarClientesFiltrados() {
  const estatusFiltro = document
    .getElementById("estatusFiltroCl")
    .value.trim()
    .toLowerCase();

  if (!estatusFiltro) {
    cargarClientes(); // Si el usuario selecciona "Todos", cargamos las primeras 10 Clientes normales
    return;
  }
  //console.log("Cargando Clientes filtrados del servidor:", estatusFiltro);

  fetch(`cruds/cargar_clientes.php?estatus=${estatusFiltro}`)
    .then((response) => response.json())
    .then((data) => {
      //console.log("Filtrados: ",data);
      actualizarTablaClientes(data);
    })
    .catch((error) =>
      console.error("Error al cargar clientes filtrados:", error)
    );
}

//Función para actualizar la tabla con las Clientes filtrados
function actualizarTablaClientes(clientes) {
  let tbody = document.getElementById("clientes-lista");
  tbody.innerHTML = ""; // Limpiar la tabla

  if (clientes.length === 0) {
    tbody.innerHTML = `<tr><td colspan='7' style='text-align: center; color: red;'>No se encontraron clientes</td></tr>`;
    return;
  }
  //LIMPIAR LA TABLA antes de agregar nuevos clientes
  tbody.innerHTML = "";

  clientes.forEach((cliente) => {
    const fila = document.createElement("tr");
    fila.innerHTML = `
      <td data-lable="Nombre:">${cliente.nombre_cliente}</td>
      <td data-lable="Teléfono">${cliente.tel_cliente}</td>
      <td data-lable="Email">${cliente.email_cliente}</td>

      <td data-lable="Estatus">
        <button class="btn ${
          cliente.estatus == 0 ? "btn-success" : "btn-danger"
        }">
          ${cliente.estatus == 0 ? "Activo" : "Inactivo"}
        </button>
      </td>
      <td data-lable="Editar">
        <button title="Editar" class="editarCliente fa-solid fa-pen-to-square" data-id="${
          cliente.id_cliente
        }"></button>
        </td>
        <td data-lable="Eliminar">
        <button title="Eliminar" class="eliminarCliente fa-solid fa-trash" data-id="${
          cliente.id_cliente
        }"></button>
      </td>
    `;
    tbody.appendChild(fila);
  });
}

//Función para cargar los primeros 10 tiendas por defecto
function cargarClientes() {
  pagina = 2; //Reiniciar la paginación cuando seleccionas "Todos"
  cargando = false; //Asegurar que el scroll pueda volver a activarse

  fetch("cruds/cargar_clientes.php?limit=10&offset=0")
    .then((response) => response.json())
    .then((data) => {
      actualizarTablaClientes(data);
    })
    .catch((error) => console.error("Error al cargar Clientes:", error));
}
