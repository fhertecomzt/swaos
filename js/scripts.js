document.addEventListener("DOMContentLoaded", () => {
  const menuToggle = document.getElementById("menu-toggle");
  const menu = document.getElementById("menu");
  const submenuLinks = document.querySelectorAll(".has-submenu > a"); // Los enlaces de los títulos de submenú
  const allMenuLinks = document.querySelectorAll("#menu a.nav-link"); // Selecciona TODOS los enlaces dentro del menú, incluyendo los de submenú
  const body = document.body;

  if (menuToggle && menu) {
    menuToggle.addEventListener("click", (e) => {
      e.preventDefault();
      menu.classList.toggle("open");
      body.classList.toggle("no-scroll");
    });

    // Este es el cambio clave: cierra el menú principal cuando se hace clic en CUALQUIER enlace dentro de él
    allMenuLinks.forEach((link) => {
      link.addEventListener("click", () => {
        // Si el enlace pertenece a un submenú y el submenú no está desplegado, no cerrar el menú principal todavía
        const parentLi = link.closest("li");
        if (
          parentLi &&
          parentLi.classList.contains("has-submenu") &&
          !link.nextElementSibling.classList.contains("show")
        ) {
          // Si es un enlace de un submenú y el submenú no está abierto, no hacemos nada para cerrar el menú principal.
          // Esto permite que el clic en el título del submenú lo despliegue.
          return;
        }

        // Si es un enlace normal o un enlace dentro de un submenú ya desplegado, cierra el menú principal
        menu.classList.remove("open");
        body.classList.remove("no-scroll");
      });
    });
  }

  // Controlar el despliegue de los submenús
  submenuLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const submenu = link.nextElementSibling; // Usamos link.nextElementSibling directamente
      if (submenu && submenu.tagName === "UL") {
        // Cierra otros submenús abiertos al abrir uno nuevo
        submenuLinks.forEach((otherLink) => {
          const otherSubmenu = otherLink.nextElementSibling;
          if (
            otherSubmenu &&
            otherSubmenu.classList.contains("show") &&
            otherSubmenu !== submenu
          ) {
            otherSubmenu.classList.remove("show");
          }
        });
        submenu.classList.toggle("show");
      }
    });
  });
});

//Variables globales ***********************************************************
let pagina = 2;
let cargando = false;

let enviando = false; // Variable global para evitar doble envío
let filtroAplicado = ""; // Variable global para almacenar el filtro

//Campos de nuevo producto para que aparezcan las caracteristicas
function toggleCampo(campo) {
  var checkbox = document.getElementById("check-" + campo);
  var campoDiv = document.getElementById("campo-" + campo);

  if (checkbox.checked) {
    campoDiv.style.display = "block";
  } else {
    campoDiv.style.display = "none";
  }
}

// Función genérica para mostrar alertas
function mostrarAlerta(tipo, titulo, mensaje) {
  Swal.fire({ title: titulo, text: mensaje, icon: tipo });
}

// Carga Dashboard y los cards movibles
document.addEventListener("DOMContentLoaded", function () {
  let contentArea = document.getElementById("content-area");
  
  if (contentArea) {
    fetch("../php/dashboard.php") 
      .then((response) => response.text())
      .then((data) => {
        contentArea.innerHTML = data; 
        
        // -Llamar función de los cards movibles
        iniciarDashboardSortable(); 
      })
      .catch((error) => console.error("Error al cargar el dashboard:", error));
  }
});

// Cargar por clic en el menu
const dashboardLink = document.getElementById("dashboard-link");
if (dashboardLink) {
    dashboardLink.addEventListener("click", function (event) {
        event.preventDefault(); 
        fetch("dashboard.php")
        .then((response) => response.text())
        .then((html) => {
            document.getElementById("content-area").innerHTML = html;

            // Aquí sí la tenías puesta
            iniciarDashboardSortable();
        })
        .catch((error) => {
            console.error("Error al cargar el contenido:", error);
        });
    });
}

// Función de movimientos
function iniciarDashboardSortable() {
    // HTML el contenedor tenga id="dashboard-cards"
    var el = document.getElementById('dashboard-cards');

    if (!el) return; 

    // A. Recuperar orden guardado
    var ordenGuardado = localStorage.getItem('ordenDashboard');
    if (ordenGuardado) {
        var ordenArray = ordenGuardado.split('|');
        ordenArray.forEach(function(id) {
            var card = el.querySelector(`.card[data-id="${id}"]`);
            if (card) {
                el.appendChild(card); 
            }
        });
    }

    // B. Activar Sortable (Evitamos duplicados con la validación)
    if (el.getAttribute('data-sortable-initialized')) return;
    
    Sortable.create(el, {
        animation: 150,
        ghostClass: 'tarjeta-fantasma',
        onEnd: function (evt) {
            var orden = [];
            el.querySelectorAll('.card').forEach(function(card) {
                orden.push(card.getAttribute('data-id'));
            });
            localStorage.setItem('ordenDashboard', orden.join('|'));
        }
    });
    
    el.setAttribute('data-sortable-initialized', 'true');
}

//Llamar Talleres *********************************************
document
  .getElementById("tiendas-link")
  .addEventListener("click", function (event) {
    event.preventDefault(); // Evita la acción por defecto del enlace
    fetch("tiendas.php")
      .then((response) => response.text())
      .then((html) => {
        document.getElementById("content-area").innerHTML = html;
        //cargarTiendasFiltradas();
      })
      .catch((error) => {
        console.error("Error al cargar el contenido:", error);
      });
  });

// Crear Talleres *******************************
function abrirModal(id) {
  document.getElementById(id).style.display = "flex";
}

function cerrarModal(id) {
  document.getElementById(id).style.display = "none";
}

function procesarFormulario(event, tipo) {
  event.preventDefault();
  const formData = new FormData(event.target);

  fetch(`cruds/procesar_${tipo}.php`, {
    method: "POST",
    body: formData,
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        // Cerrar el modal
        cerrarModal(tipo + "-modal");
        // Limpiar los campos del formulario
        event.target.reset();

        // Actualizar la tabla dinámicamente si es 'crear'
        if (tipo === "crear") {
          const tbody = document.querySelector("table tbody");

          console.log("creado", tbody);

          // Crear una nueva fila
          const newRow = document.createElement("tr");
          newRow.innerHTML = `
            <td data-lable="Nombre:">${data.tienda.nombre}</td>
            <td data-lable="Nombre, denominación o razón social:">${
              data.tienda.razonsocial
            }</td>
            <td data-lable="R.F.C.:">${data.tienda.rfc}</td>
            <td data-lable="Email:">${data.tienda.email}</td>
            <td data-lable="Teléfono">${data.tienda.telefono}</td>
            <td>
              <button class="btn ${
                data.tienda.estatus == 0 ? "btn-success" : "btn-danger"
              }">
              ${data.tienda.estatus == 0 ? "Activo" : "Inactivo"}
              </button>
            </td>

            <td data-lable="Editar:">
              <button title="Editar" class="editar fa-solid fa-pen-to-square" data-id="${
                data.tienda.id
              }"></button>
            </td>
            <td data-lable="Eliminar">
              <button title="Eliminar" class="eliminar fa-solid fa-trash" data-id="${
                data.tienda.id
              }"></button>
            </td>
          `;

          // Agregar la nueva fila a la tabla
          tbody.appendChild(newRow);
        }

        // Mostrar un mensaje de éxito
        Swal.fire({
          title: "¡Éxito!",
          text: data.message, // Usar el mensaje del backend
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

function validarFormularioTienda(event) {
  event.preventDefault();

  const nombre = document.querySelector("[name='nombre']").value.trim();
  const razonsocial = document
    .querySelector("[name='razonsocial']")
    .value.trim();
  const rfc = document.querySelector("[name='rfc']").value.trim();
  const calle = document.querySelector("[name='calle']").value.trim();
  const noexterior = document.querySelector("[name='noexterior']").value.trim();

  //Validaciones select de crear taller
  const selectEstado = document.querySelector("#estado");
  const selectMunicipio = document.querySelector("#municipio");
  const selectColonia = document.querySelector("#colonia");

  const errores = [];

  if (nombre.length < 3) {
    errores.push("El nombre debe tener al menos 3 caracteres.");
    const inputname = document.querySelector("#crear-nombre");
    inputname.focus();
    inputname.classList.add("input-error"); // Añade la clase de error
  }
  // Elimina la clase de error al corregir
  const inputname = document.querySelector("#crear-nombre");
  inputname.addEventListener("input", () => {
    if (inputname.value.length >= 3) {
      inputname.classList.remove("input-error"); // Quita la clase si el campo es válido
    }
  });

  if (razonsocial.length < 3) {
    errores.push(
      "La denominación o razón social: debe tener al menos 3 caracteres.",
    );
    const inputrazonsocial = document.querySelector("#crear-razonsocial");
    inputrazonsocial.focus();
    inputrazonsocial.classList.add("input-error"); // Añade la clase de error
  }
  // Elimina la clase de error al corregir
  const inputrazonsocial = document.querySelector("#crear-razonsocial");
  inputrazonsocial.addEventListener("input", () => {
    if (inputrazonsocial.value.length >= 3) {
      inputrazonsocial.classList.remove("input-error"); // Quita la clase si el campo es válido
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

  // Verificar duplicados tiendas ****************
  verificarDuplicado(nombre)
    .then((esDuplicado) => {
      if (esDuplicado) {
        Swal.fire({
          title: "Atención",
          text: "El nombre del taller ya existe. Por favor, elige otro.",
          icon: "warning",
          showConfirmButton: false,
          timer: 1500,
          timerProgressBar: true,
        });
      } else {
        // Si no hay errores, enviar el formulario de tiendas *********
        procesarFormulario(event, "crear");
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
function verificarDuplicado(nombre) {
  //console.log("Nombre:", nombre);

  return fetch("cruds/verificar_nombre.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nombre }),
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

//Editar taller *************************************************************************
document.addEventListener("DOMContentLoaded", function () {
  // Escuchar clic en el botón de editar
  document.body.addEventListener("click", function (event) {
    if (event.target.classList.contains("editar")) {
      const id = event.target.dataset.id;
      //console.log("Botón editar clickeado. ID:", id);

      fetch(`cruds/obtener_tienda.php?id=${id}`)
        .then((response) => response.json())
        .then((data) => {
          //console.log("Datos recibidos del servidor:", data);
          if (data.success) {
            const formulario = document.getElementById("form-editar");
            if (formulario) {
              // --- INICIO: NUEVA LÓGICA DE POBLADO ---
              // 1. Llenar campos simples (inputs de texto, etc.)
              const camposSimples = [
                "id",
                "nombre",
                "razonsocial",
                "rfc",
                "calle",
                "noexterior",
                "nointerior",
                "telefono",
                "email",
                "estatus",
              ];

              camposSimples.forEach((campo) => {
                const input = formulario[`editar-${campo}`];
                if (input) {
                  input.value = data.tienda[campo] || "";
                } else {
                  console.warn(`Campo 'editar-${campo}' no encontrado.`);
                }
              });

              // 2. Obtener los IDs y valores guardados de la base de datos
              const idEstadoDB = data.tienda.estado;
              const idMunicipioDB = data.tienda.municipio;
              const idColoniaDB = data.tienda.colonia;
              const cpDB = data.tienda.codigo_postal; // Obtenemos el CP

              // 3. Llamar a nuestra nueva función para cargar y seleccionar
              //    los valores en los selects anidados.
              cargarYSeleccionarUbicacionEditar(
                idEstadoDB,
                idMunicipioDB,
                idColoniaDB,
                cpDB,
              );

              // --- FIN: NUEVA LÓGICA DE POBLADO ---

              abrirModal("editar-modal");
            } else {
              console.error("Formulario de edición no encontrado.");
            }
          } else {
            mostrarAlerta(
              "error",
              "Error",
              data.message || "No se pudo cargar el taller.",
            );
          }
        })
        .catch((error) => {
          console.error("Error al obtener taller:", error);
          mostrarAlerta(
            "error",
            "Error",
            "Ocurrió un problema al obtener los datos.",
          );
        });
    }
  });

  // Validar y enviar el formulario de edición de tiendas ******
  document.body.addEventListener("submit", function (event) {
    if (event.target && event.target.id === "form-editar") {
      event.preventDefault();
      validarFormularioEdicion(event.target);
    }
  });
});

//Validar duplicados en edicion de talleres
function verificarDuplicadoEditarTienda(nombre, id = 0) {
  //console.log("Nombre:", nombre);
  //console.log("ID (si aplica):", id);

  return fetch("cruds/verificar_nombre.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nombre, id }),
  })
    .then((response) => response.json())
    .then((data) => {
      // console.log("Respuesta de verificar_nombre.php:", data);
      if (data.existe) {
        Swal.fire({
          title: "Atención",
          text: data.message || "El nombre del taller ya existe.", // Mostrar el mensaje específico si existe
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

// Validación del formulario de edición de tiendas
async function validarFormularioEdicion(formulario) {
  const campos = [
    {
      nombrec: "nombre",
      min: 3,
      mensaje: "El nombre debe tener al menos 3 caracteres.",
    },
    {
      nombrec: "razonsocial",
      min: 3,
      mensaje: "El razón social debe tener al menos 3 caracteres.",
    },
    {
      nombrec: "rfc",
      min: 12,
      mensaje: "El RFC debe tener al menos 12 caracteres.",
    },
    {
      nombrec: "calle",
      min: 3,
      mensaje: "La calle debe tener al menos 3 caracteres.",
    },
    {
      nombrec: "noexterior",
      min: 1,
      mensaje: "El número exterior debe ser mayor a 0",
      numerico: true,
    },
    {
      nombrec: "nointerior",
      min: 1,
      mensaje: "El número interior debe ser mayor o igual a 0",
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

    // Verificar si es numérico
    if (campo.numerico) {
      if (isNaN(parseInt(valor)) || parseInt(valor) < campo.min) {
        errores.push(campo.mensaje);
        campoFormulario.classList.add("input-error");
        campoFormulario.focus(); // Establece el foco en el campo inválido
        if (!primerError) primerError = campoFormulario; // Guardar el primer error
      } else {
        campoFormulario.addEventListener("input", () => {
          if (campoFormulario.value.length >= campo.min) {
            campoFormulario.classList.remove("input-error"); // Quita la clase si el campo es válido
          }
        });
        campoFormulario.classList.remove("input-error");
      }
    } else {
      // Validar por longitud mínima
      if (valor.length < campo.min) {
        errores.push(campo.mensaje);
        campoFormulario.classList.add("input-error");
        campoFormulario.focus(); // Establece el foco en el campo inválido
        if (!primerError) primerError = campoFormulario; // Guardar el primer error
      } else {
        campoFormulario.classList.remove("input-error");
      }
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
  const nombre = document.getElementById("editar-nombre").value.trim();
  const id = document.getElementById("editar-id").value;
  //console.log("Ver verificado duplicado id: ", id);
  //console.log("Ver verificado duplicado nombre: ", id);

  try {
    const esDuplicado = await verificarDuplicadoEditarTienda(nombre, id);
    if (esDuplicado) {
      return; // No enviar el formulario si hay duplicados
    } else {
      enviarFormularioEdicion(formulario); // Proceder si no hay duplicados
    }
  } catch (error) {
    console.error("Error al verificar duplicado:", error);
  }
}

// Enviar formulario de edición
function enviarFormularioEdicion(formulario) {
  if (!formulario) {
    console.error("El formulario no se encontró.");
    return;
  }
  const formData = new FormData(formulario);

  fetch("cruds/editar_tienda.php", {
    method: "POST",
    body: formData,
  })
    .then((response) => response.json())
    .then((data) => {
      //  console.log("Respuesta del servidor:", data);
      if (data.success) {
        Swal.fire({
          title: "¡Actualizada!",
          text: data.message, // Usar el mensaje del backend
          icon: "success",
          showConfirmButton: false,
          timer: 1500,
          timerProgressBar: true,
        });
        actualizarFilaTabla(formData);
        cerrarModal("editar-modal");
      } else {
        Swal.fire({
          title: "Atención",
          text: data.message || "Ocurrió un problema.", // Mostrar el mensaje específico si existe
          icon: "warning",
          showConfirmButton: false,
          timer: 1500,
          timerProgressBar: true,
        });
      }
    })
    .catch((error) => {
      console.error("Error al actualizar taller:", error);
      Swal.fire({
        title: "Error",
        text: data.message || "Ocurrió un problema.", // Mostrar el mensaje específico si existe
        icon: "error",
        showConfirmButton: false,
        timer: 1500,
        timerProgressBar: true,
      });
    });
}

// Actualizar fila de la tabla
function actualizarFilaTabla(formData) {
  //console.log("Datos enviados al formulario:", Object.fromEntries(formData));

  const fila = document
    .querySelector(`button[data-id="${formData.get("editar-id")}"]`)
    .closest("tr");
  if (fila) {
    fila.cells[0].textContent = formData.get("nombre");
    fila.cells[1].textContent = formData.get("razonsocial");
    fila.cells[2].textContent = formData.get("rfc");
    fila.cells[3].textContent = formData.get("email");
    fila.cells[4].textContent = formData.get("telefono");
    // Determinar clases y texto del botón
    const estatus = formData.get("estatus") === "0" ? "Activo" : "Inactivo";
    const claseBtn =
      formData.get("estatus") === "0" ? "btn btn-success" : "btn btn-danger";

    // Insertar el botón en la celda
    fila.cells[5].innerHTML = `<button class="${claseBtn}">${estatus}</button>`;
    //Para mantener el filtro seleccionado y actualizar la tabla cuando se edite
    cargarTiendasFiltradas();
  }
}

// --- INICIO: LÓGICA PARA SELECTS ANIDADOS (ESTADO, MUNICIPIO, COLONIA) ---

/**
 * Función auxiliar para llenar un <select> con opciones.
 * @param {HTMLSelectElement} selectElement - El elemento <select> a llenar.
 * @param {Array} items - Un array de objetos (ej. [{id: 1, nombre: 'Opción 1'}])
 * @param {String} [valorDefault] - El valor para la opción "Seleccionar".
 */
function popularSelect(selectElement, items, valorDefault = "Seleccionar") {
  if (!selectElement) return;
  selectElement.innerHTML = `<option value="">${valorDefault}</option>`; // Limpiar opciones
  items.forEach((item) => {
    const option = document.createElement("option");
    option.value = item.id;
    option.textContent = item.nombre;
    selectElement.appendChild(option);
  });
}

/**
 * Carga los municipios usando POST.
 * @param {string} idEstado - El ID del estado seleccionado.
 * @param {string} idSelectMunicipio - El ID del <select> de municipios.
 * @param {string} idSelectColonia - El ID del <select> de colonias.
 * @param {string} idInputCP - El ID del <input> de código postal.
 */
async function cargarMunicipios(
  idEstado,
  idSelectMunicipio,
  idSelectColonia,
  idInputCP,
) {
  const selectMunicipio = document.getElementById(idSelectMunicipio);
  const selectColonia = document.getElementById(idSelectColonia);
  const inputCP = document.getElementById(idInputCP);

  // Limpiar selects dependientes
  popularSelect(selectMunicipio, [], "Cargando...");
  popularSelect(selectColonia, []);
  if (inputCP) inputCP.value = "";

  if (idEstado) {
    try {
      const formData = new FormData();
      formData.append("estado", idEstado);

      const response = await fetch(`funciones/getMunicipios.php`, {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      popularSelect(selectMunicipio, data);
    } catch (error) {
      console.error("Error al cargar municipios:", error);
      popularSelect(selectMunicipio, [], "Error al cargar");
    }
  } else {
    popularSelect(selectMunicipio, []); // Limpiar si no hay estado
  }
}

/**
 * Carga las colonias usando POST.
 * @param {string} idMunicipio - El ID del municipio seleccionado.
 * @param {string} idSelectColonia - El ID del <select> de colonias.
 * @param {string} idInputCP - El ID del <input> de código postal.
 */
async function cargarColonias(idMunicipio, idSelectColonia, idInputCP) {
  const selectColonia = document.getElementById(idSelectColonia);
  const inputCP = document.getElementById(idInputCP);

  popularSelect(selectColonia, [], "Cargando...");
  if (inputCP) inputCP.value = "";

  if (idMunicipio) {
    try {
      const formData = new FormData();
      formData.append("municipio", idMunicipio);

      const response = await fetch(`funciones/getColonias.php`, {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      popularSelect(selectColonia, data);
    } catch (error) {
      console.error("Error al cargar colonias:", error);
      popularSelect(selectColonia, [], "Error al cargar");
    }
  } else {
    popularSelect(selectColonia, []); // Limpiar si no hay municipio
  }
}

/**
 * Carga el Código Postal usando POST.
 * @param {string} idColonia - El ID de la colonia seleccionada.
 * @param {string} idInputCP - El ID del <input> de código postal.
 */
async function cargarCP(idColonia, idInputCP) {
  const inputCP = document.getElementById(idInputCP);
  if (!inputCP) return;

  if (idColonia) {
    try {
      const formData = new FormData();
      formData.append("colonia", idColonia);

      const response = await fetch(`funciones/getCodigoPostal.php`, {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      inputCP.value = data.codigo_postal || "";
    } catch (error) {
      console.error("Error al cargar CP:", error);
      inputCP.value = "Error";
    }
  } else {
    inputCP.value = "";
  }
}

// --- Event Listeners para los selects (Usando delegación de eventos) ---

document.addEventListener("change", function (event) {
  // Para el modal CREAR (basado en tiendas.php)
  if (event.target.id === "estado") {
    cargarMunicipios(
      event.target.value,
      "municipio",
      "colonia",
      "codigo_postal",
    );
  }
  if (event.target.id === "municipio") {
    cargarColonias(event.target.value, "colonia", "codigo_postal");
  }
  if (event.target.id === "colonia") {
    cargarCP(event.target.value, "codigo_postal");
  }

  // Para el modal EDITAR (basado en tiendas.php)
  if (event.target.id === "editar-estado") {
    cargarMunicipios(
      event.target.value,
      "editar-municipio",
      "editar-colonia",
      "editar-codigo_postal",
    );
  }
  if (event.target.id === "editar-municipio") {
    cargarColonias(
      event.target.value,
      "editar-colonia",
      "editar-codigo_postal",
    );
  }
  if (event.target.id === "editar-colonia") {
    cargarCP(event.target.value, "editar-codigo_postal");
  }
});

/**
 * Función especial para el modal EDITAR: Carga y selecciona los valores guardados.
 * @param {string} idEstadoDB - El ID del estado guardado en la BD.
 * @param {string} idMunicipioDB - El ID del municipio guardado en la BD.
 * @param {string} idColoniaDB - El ID de la colonia guardada en la BD.
 * @param {string} cpDB - El Código Postal guardado en la BD.
 */
async function cargarYSeleccionarUbicacionEditar(
  idEstadoDB,
  idMunicipioDB,
  idColoniaDB,
  cpDB,
) {
  const selectEstado = document.getElementById("editar-estado");
  const selectMunicipio = document.getElementById("editar-municipio");
  const selectColonia = document.getElementById("editar-colonia");
  const inputCP = document.getElementById("editar-codigo_postal");

  // 1. Establecer Estado (ya debe estar cargado) y CP
  selectEstado.value = idEstadoDB;
  inputCP.value = cpDB || ""; // Asignamos el CP que ya teníamos

  // 2. Cargar Municipios y seleccionar el guardado
  await cargarMunicipios(
    idEstadoDB,
    "editar-municipio",
    "editar-colonia",
    "editar-codigo_postal",
  );
  selectMunicipio.value = idMunicipioDB; // ¡Seleccionar!

  // 3. Cargar Colonias y seleccionar la guardada
  await cargarColonias(idMunicipioDB, "editar-colonia", "editar-codigo_postal");
  selectColonia.value = idColoniaDB; // ¡Seleccionar!

  // 4. (Opcional) Recargar el CP por si acaso, aunque ya lo teníamos.
  // Si prefieres que el CP se base en la colonia guardada:
  await cargarCP(idColoniaDB, "editar-codigo_postal");
  // Si no, la línea del paso 1 (inputCP.value = cpDB) es suficiente.
}

// --- FIN: LÓGICA PARA SELECTS ANIDADOS ---

// Eliminar Taller ************************************************
document.addEventListener("click", function (event) {
  if (event.target.classList.contains("eliminar")) {
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
        fetch(`cruds/eliminar_tienda.php?id=${id}`, { method: "POST" })
          .then((response) => response.json())
          .then((data) => {
            if (data.success) {
              //alert("Tienda eliminada correctamente");
              Swal.fire({
                title: "¡Eliminado!",
                text: data.message, // Usar el mensaje del backend
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
                "error",
              );
            }
          })
          .catch((error) => {
            Swal.fire(
              "Error",
              "Hubo un problema al procesar tu solicitud.",
              "error",
            );
            console.error("Error al eliminar la tienda:", error);
          });
      }
    });
  }
});

//Buscar en la tabla y filtrar taller ******************************
document.addEventListener("DOMContentLoaded", function () {
  const observarDOM = new MutationObserver(function (mutations) {
    mutations.forEach((mutation) => {
      if (mutation.type === "childList") {
        const buscarBox = document.getElementById("buscarbox");
        if (buscarBox) {
          //console.log("Elemento 'buscarbox' encontrado dinámicamente");
          agregarEventoBuscar(buscarBox);
          observarDOM.disconnect(); // Deja de observar después de encontrarlo
        }
      }
    });
  });

  // Comienza a observar el body del DOM
  observarDOM.observe(document.body, { childList: true, subtree: true });

  // Si el elemento ya existe en el DOM
  const buscarBoxInicial = document.getElementById("buscarbox");
  if (buscarBoxInicial) {
    console.log("Elemento 'buscarbox' ya existe en el DOM");
    agregarEventoBuscar(buscarBoxInicial);
    observarDOM.disconnect(); // No es necesario seguir observando
  }

  // Función para agregar el evento de búsqueda
  function agregarEventoBuscar(buscarBox) {
    buscarBox.addEventListener("input", function () {
      const filtro = buscarBox.value.toLowerCase();
      const filas = document.querySelectorAll("#tabla-tiendas tbody tr");

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
    if (event.target.id === "buscarbox") {
      const buscarBox = event.target; // El input dinámico
      const filtro = buscarBox.value.toLowerCase();
      const limpiarBusqueda = document.getElementById("limpiar-busqueda"); // Botón dinámico
      const filas = document.querySelectorAll("#tabla-tiendas tbody tr");
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
    if (event.target.id === "limpiar-busqueda") {
      const buscarBox = document.getElementById("buscarbox");
      const limpiarBusqueda = event.target;

      if (buscarBox) {
        buscarBox.value = ""; // Limpiar el input
        if (limpiarBusqueda) {
          limpiarBusqueda.style.display = "none"; // Ocultar el botón de limpiar
          document.getElementById("mensaje-vacio").style.display = "none";
        }
      }

      const filas = document.querySelectorAll("#tabla-tiendas tbody tr");
      filas.forEach((fila) => {
        fila.style.display = ""; // Mostrar todas las filas
      });
    }
  });
});

//Función para filtrar tiendas desde el servidor ***********************************
function cargarTiendasFiltradas() {
  const estatusFiltro = document
    .getElementById("estatusFiltroT")
    .value.trim()
    .toLowerCase();

  if (!estatusFiltro) {
    cargarTiendas(); // Si el usuario selecciona "Todos", cargamos las primeras 10 tiendas normales
    return;
  }
  //console.log("Cargando tiendas filtradas del servidor:", estatusFiltro);

  fetch(`cruds/cargar_tiendas.php?estatus=${estatusFiltro}`)
    .then((response) => response.json())
    .then((data) => {
      // console.log("Filtradas: ",data);
      actualizarTablaTiendas(data);
    })
    .catch((error) =>
      console.error("Error al cargar tiendas filtradas:", error),
    );
}

//Función para actualizar la tabla con las tiendas filtradas
function actualizarTablaTiendas(tiendas) {
  let tbody = document.getElementById("tiendas-lista");
  tbody.innerHTML = ""; // Limpiar la tabla

  if (tiendas.length === 0) {
    tbody.innerHTML = `<tr><td colspan='7' style='text-align: center; color: red;'>No se encontraron talleres</td></tr>`;
    return;
  }
  //LIMPIAR LA TABLA antes de agregar nuevos tiendas
  tbody.innerHTML = "";

  tiendas.forEach((tienda) => {
    const fila = document.createElement("tr");
    fila.innerHTML = `
      <td data-lable="Nombre:">${tienda.nombre_t}</td>
      <td data-lable="Nombre, denominación o razón social:">${
        tienda.razonsocial_t
      }</td>
      <td data-lable="R.F.C.">${tienda.rfc_t}</td>
      <td data-lable="Email">${tienda.email_t}</td>
      <td data-lable="Teléfono">${tienda.tel_t}</td>

      <td data-lable="Estatus">
        <button class="btn ${
          tienda.estatus_t == 0 ? "btn-success" : "btn-danger"
        }">
          ${tienda.estatus_t == 0 ? "Activo" : "Inactivo"}
        </button>
      </td>
      <td data-lable="Editar">
        <button title="Editar" class="editar fa-solid fa-pen-to-square" data-id="${
          tienda.id_taller
        }"></button>
        </td>
        <td data-lable="Eliminar">
        <button title="Eliminar" class="eliminar fa-solid fa-trash" data-id="${
          tienda.id_taller
        }"></button>
      </td>
    `;
    tbody.appendChild(fila);
  });
}

//Función para cargar los primeros 10 tiendas por defecto
function cargarTiendas() {
  pagina = 2; //Reiniciar la paginación cuando seleccionas "Todos"
  cargando = false; //Asegurar que el scroll pueda volver a activarse

  fetch("cruds/cargar_tiendas.php?limit=10&offset=0")
    .then((response) => response.json())
    .then((data) => {
      actualizarTablaTiendas(data);
    })
    .catch((error) => console.error("Error al cargar tiendas:", error));
}

/* ------------------------ SCROLL INFINITO TIENDAS ------------------------*/

function cargarTiendasScroll() {
  if (cargando) return;
  cargando = true;

  // Obtener el filtro actual para que el scroll también lo respete
  const estatusFiltro = document
    .getElementById("estatusFiltroT")
    .value.trim()
    .toLowerCase();
  let url = `cruds/cargar_tiendas_scroll.php?page=${pagina}`;

  if (estatusFiltro !== "") {
    url += `&estatus=${estatusFiltro}`; // Enviar el filtro al servidor
  }

  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      if (data.length > 0) {
        const tbody = document.querySelector("#tabla-tiendas tbody");
        data.forEach((tienda) => {
          const row = document.createElement("tr");
          row.innerHTML = `
            <td>${tienda.nombre_t}</td>
            <td>${tienda.razonsocial_t}</td>
            <td>${tienda.rfc_t}</td>
            <td>${tienda.tel_t}</td>
            <td>
              <button class="btn ${
                tienda.estatus_t == 0 ? "btn-success" : "btn-danger"
              }">
                ${tienda.estatus_t == 0 ? "Activo" : "Inactivo"}
              </button>
            </td>
            <td>
              <button title="Editar" class="editar fa-solid fa-pen-to-square" data-id="${
                tienda.id_taller
              }"></button>
              &nbsp;&nbsp;&nbsp;
              <button title="Eliminar" class="eliminar fa-solid fa-trash" data-id="${
                tienda.id_taller
              }"></button>
            </td>
          `;
          tbody.appendChild(row);
        });

        pagina++; // Aumentamos la página
        cargando = false;
      } else {
        Swal.fire({
          title: "No hay más talleres.",
          icon: "info",
          showConfirmButton: false,
          timer: 1500,
          timerProgressBar: true,
        });
      }
    })
    .catch((error) => console.error("Error al cargar talleres:", error));
}

document.addEventListener("DOMContentLoaded", function () {
  if (window.location.pathname.includes("tiendas.php")) {
    pagina = 2; //  Reiniciar paginación
    cargando = false; // Permitir cargar más tiendas
    console.log("Reiniciando scroll y cargando tiendas en tiendas.php");

    //REACTIVAR EL SCROLL INFINITO CUANDO REGRESES A tiendas.php
    iniciarScrollTiendas();
  }
});

function iniciarScrollTiendas() {
  const scrollContainer = document.getElementById("scroll-container");
  if (!scrollContainer) return;

  scrollContainer.addEventListener("scroll", () => {
    if (
      scrollContainer.scrollTop + scrollContainer.clientHeight >=
        scrollContainer.scrollHeight - 10 &&
      !cargando
    ) {
      //console.log(" Scroll detectado, cargando más tiendas...");
      cargarTiendasScroll();
    }
  });

  //console.log(" Scroll infinito reactivado en tiendas.php");
}

const observerTiendas = new MutationObserver(() => {
  const tiendasSeccion = document.getElementById("scroll-container");
  if (tiendasSeccion) {
    observerTiendas.disconnect();
    iniciarScrollTiendas();
  }
});

const Tiendas = document.getElementById("content-area");
if (Tiendas) {
  observerTiendas.observe(Tiendas, { childList: true, subtree: true });
}

// Llamar Roles *************************************************
document
  .getElementById("roles-link")
  .addEventListener("click", function (event) {
    event.preventDefault(); // Evita la acción por defecto del enlace
    fetch("roles.php")
      .then((response) => response.text())
      .then((html) => {
        document.getElementById("content-area").innerHTML = html;

        cargarRolesFiltrados();
      })
      .catch((error) => {
        console.error("Error al cargar el contenido:", error);
      });
  });

//Crear Rol **********************************************
function abrirModalRol(id) {
  document.getElementById(id).style.display = "flex";
}

function cerrarModalRol(id) {
  document.getElementById(id).style.display = "none";
}

function procesarFormularioRol(event, tipo) {
  event.preventDefault(); //Para que no recergue la pagina
  const formData = new FormData(event.target);

  fetch(`cruds/procesar_${tipo}_rol.php`, {
    method: "POST",
    body: formData,
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        // Cerrar el modal
        cerrarModalRol(tipo + "-modalRol");
        // Limpiar los campos del formulario
        event.target.reset();

        // Actualizar la tabla dinámicamente si es 'crear'
        if (tipo === "crear") {
          const tbody = document.querySelector("table tbody");

          // Crear una nueva fila
          const newRow = document.createElement("tr");
          newRow.innerHTML = `
            <td data-lable="Nombre:">${data.rol.nombre}</td>
            <td data-lable="Descripción:">${data.rol.descripcion}</td>
            <td data-lable="Estatus:">
              <button class="btn ${
                data.rol.estatus == 0 ? "btn-success" : "btn-danger"
              }">
              ${data.rol.estatus == 0 ? "Activo" : "Inactivo"}
              </button>
            </td>

            <td data-lable="Editar:">
              <button title="Editar" class="editarRol fa-solid fa-pen-to-square" data-id="${
                data.rol.id
              }"></button>
            </td>
            <td data-lable="Eliminar">
              <button title="Eliminar" class="eliminarRol fa-solid fa-trash" data-id="${
                data.rol.id
              }"></button>
            </td>
          `;

          // Agregar la nueva fila a la tabla
          tbody.appendChild(newRow);
        }

        // Mostrar un mensaje de éxito
        Swal.fire({
          title: "¡Éxito!",
          text: data.message, // Usar el mensaje del backend
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
function validarFormularioRol(event) {
  event.preventDefault();

  const rol = document.querySelector("[name='rol']").value.trim();
  const desc_rol = document.querySelector("[name='desc_rol']").value.trim();

  const errores = [];

  if (rol.length < 3) {
    errores.push("El nombre debe tener al menos 3 caracteres.");
    const inputname = document.querySelector("#crear-rol");
    inputname.focus();
    inputname.classList.add("input-error"); // Añade la clase de error
  }
  // Elimina la clase de error al corregir
  const inputname = document.querySelector("#crear-rol");
  inputname.addEventListener("input", () => {
    if (inputname.value.length >= 3) {
      inputname.classList.remove("input-error"); // Quita la clase si el campo es válido
    }
  });

  if (desc_rol.length < 3) {
    errores.push("La descripción debe tener al menos 3 caracteres.");
    const inputdesc = document.querySelector("#crear-desc_rol");
    inputdesc.focus();
    inputdesc.classList.add("input-error"); // Añade la clase de error
  }
  // Elimina la clase de error al corregir
  const inputdesc = document.querySelector("#crear-desc_rol");
  inputdesc.addEventListener("input", () => {
    if (inputdesc.value.length >= 3) {
      inputdesc.classList.remove("input-error"); // Quita la clase si el campo es válido
    }
  });
  //Alerta de validaciones campos vacios Rol
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

  // Verificar duplicados
  verificarDuplicadoRol(rol)
    .then((esDuplicado) => {
      if (esDuplicado) {
        Swal.fire({
          title: "Error",
          text: "El nombre del Rol ya existe. Por favor, elige otro.",
          icon: "warning",
          showConfirmButton: false,
          timer: 1500,
          timerProgressBar: true,
        });
      } else {
        // Si no hay errores, enviar el formulario
        procesarFormularioRol(event, "crear");
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
function verificarDuplicadoRol(rol) {
  //console.log("Nombre verificar:", nombre_rol);

  return fetch("cruds/verificar_nombre_rol.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ rol }),
  })
    .then((response) => response.json())
    .then((data) => {
      //console.log("Respuesta de verificar_nombre.php:", data);
      if (data.existe) {
        mostrarAlerta("error", "Error", "El nombre del Rol ya existe.");
      }
      return data.existe;
    })
    .catch((error) => {
      console.error("Error al verificar duplicado:", error);
      return true; // Asume duplicado en caso de error
    });
}
//Editar Roles*******************************************************
document.addEventListener("DOMContentLoaded", function () {
  // Escuchar clic en el botón de editar
  document.addEventListener("click", function (event) {
    if (event.target.classList.contains("editarRol")) {
      const id = event.target.dataset.id;
      //console.log("Botón editar clickeado. ID:", id);

      fetch(`cruds/obtener_rol.php?id=${id}`)
        .then((response) => response.json())
        .then((data) => {
          //console.log("Datos recibidos del servidor:", data);
          if (data.success) {
            const formularioRol = document.getElementById("form-editarRol");
            if (formularioRol) {
              const campos = ["idrol", "rol", "desc_rol", "estatus"];
              campos.forEach((campo) => {
                //console.log(`Asignando ${campo}:`, data.rol[campo]);
                formularioRol[`editar-${campo}`].value = data.rol[campo] || "";
              });
              abrirModalRol("editar-modalRol");
            } else {
              console.error("Formulario de edición no encontrado.");
            }
          } else {
            mostrarAlerta(
              "error",
              "Error",
              data.message || "No se pudo cargar el Rol.",
            );
          }
        })
        .catch((error) => {
          console.error("Error al obtener Rol:", error);
          mostrarAlerta(
            "error",
            "Error",
            "Ocurrió un problema al obtener los datos.",
          );
        });
    }
  });

  // Validar y enviar el formulario de edición
  document.body.addEventListener("submit", function (event) {
    if (event.target && event.target.id === "form-editarRol") {
      event.preventDefault(); // Esto evita el comportamiento predeterminado de recargar la página.
      validarFormularioEdicionRol(event.target);
    }
  });
});

//Validar duplicados en edicion rol
function verificarDuplicadoEditarRol(rol, id = 0) {
  //console.log("Validando duplicados. ID:", id, "Rol:", rol);

  return fetch("cruds/verificar_nombre_rol.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ rol, id }),
  })
    .then((response) => response.json())
    .then((data) => {
      //console.log("Respuesta de verificar_nombre.php:", data);
      if (data.existe) {
        Swal.fire({
          title: "Error",
          text: data.message || "El nombre del Rol ya existe.", // Mostrar el mensaje específico si existe
          icon: "warning",
          showConfirmButton: false,
          timer: 1500,
          timerProgressBar: true,
        });
        //mostrarAlerta("error", "Error", "El nombre del Rol ya existe.");
      }
      return data.existe;
    })
    .catch((error) => {
      console.error("Error al verificar duplicado:", error);
      return true; // Asume duplicado en caso de error
    });
}
// Validación del formulario de edición Rol
async function validarFormularioEdicionRol(formulario) {
  const campos = [
    {
      nombre: "rol",
      min: 3,
      mensaje: "El rol debe tener al menos 3 caracteres.",
    },
    {
      nombre: "desc_rol",
      min: 3,
      mensaje: "La descripción debe tener al menos 3 caracteres.",
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
  // Si hay errores, mostrar la alerta y enfocar el primer campo con error, alerta automatica en edición
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
  const rolInput = document.getElementById("editar-rol");
  const idInput = document.getElementById("editar-idrol");
  if (!rolInput || !idInput) {
    console.log("Error: No se encontró el campo de Rol o ID.");
    return;
  }
  const rol = rolInput.value.trim();
  const id = idInput.value;

  try {
    //console.log("Verificando duplicado. ID:", id, "Rol:", rol);
    const esDuplicado = await verificarDuplicadoEditarRol(rol, id);
    if (esDuplicado) {
      return; // No enviar el formulario si hay duplicados
    } else {
      //cerrarModalRol("editar-modalRol");
      enviarFormularioEdicionRol(formulario); // Proceder si no hay duplicados
    }
  } catch (error) {
    console.error("Error al verificar duplicado:", error);
  }
}
// Enviar formulario de edición rol
function enviarFormularioEdicionRol(formulario) {
  if (!formulario) {
    console.error("El formulario no se encontró.");
    return;
  }
  const formData = new FormData(formulario);

  fetch("cruds/editar_rol.php", {
    method: "POST",
    body: formData,
  })
    .then((response) => response.json())
    .then((data) => {
      //console.log("Respuesta del servidorEdit:", data);
      if (data.success) {
        Swal.fire({
          title: "¡Actualizado!",
          text: data.message, // Usar el mensaje del backend
          icon: "success",
          showConfirmButton: false,
          timer: 1500,
          timerProgressBar: true,
        });
        actualizarFilaTablaRol(formData);
        cerrarModal("editar-modalRol");
      } else {
        Swal.fire({
          title: "Atención",
          text: data.message || "Ocurrió un problema.", // Mostrar el mensaje específico si existe
          icon: "error",
          showConfirmButton: false,
          timer: 1500,
          timerProgressBar: true,
        });
      }
    })
    .catch((error) => {
      console.error("Error al actualizar tienda:", error);
      Swal.fire({
        title: "Error",
        text: data.message || "Ocurrió un problema.", // Mostrar el mensaje específico si existe
        icon: "error",
        showConfirmButton: false,
        timer: 1500,
        timerProgressBar: true,
      });
    });
}
// Actualizar fila de la tabla
function actualizarFilaTablaRol(formData) {
  const fila = document
    .querySelector(`button[data-id="${formData.get("editar-idrol")}"]`)
    .closest("tr");
  //console.log(formData.get("editar-idrol"));
  if (fila) {
    fila.cells[0].textContent = formData.get("rol");
    fila.cells[1].textContent = formData.get("desc_rol");
    // Determinar clases y texto del botón
    const estatus = formData.get("estatus") === "0" ? "Activo" : "Inactivo";
    const claseBtn =
      formData.get("estatus") === "0" ? "btn btn-success" : "btn btn-danger";

    // Insertar el botón en la celda
    fila.cells[2].innerHTML = `<button class="${claseBtn}">${estatus}</button>`;
    cargarRolesFiltrados();
  }
}
// Eliminar Roles*****************
document.addEventListener("click", function (event) {
  if (event.target.classList.contains("eliminarRol")) {
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
        fetch(`cruds/eliminar_rol.php?id=${id}`, { method: "POST" })
          .then((response) => response.json())
          .then((data) => {
            if (data.success) {
              //alert("Registro eliminado correctamente");
              Swal.fire({
                title: "¡Eliminado!",
                text: data.message, // Usar el mensaje del backend
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
                "error",
              );
            }
          })
          .catch((error) => {
            Swal.fire(
              "Error",
              "Hubo un problema al procesar tu solicitud.",
              "error",
            );
            console.error("Error al eliminar la tienda:", error);
          });
      }
    });
  }
});

//Buscar en la tabla y filtrar ***************************************
document.addEventListener("DOMContentLoaded", function () {
  const observarDOM = new MutationObserver(function (mutations) {
    mutations.forEach((mutation) => {
      if (mutation.type === "childList") {
        const buscarBox = document.getElementById("buscarboxrol");
        if (buscarBox) {
          //console.log("Elemento 'buscarbox' encontrado dinámicamente");
          agregarEventoBuscarRol(buscarBox);
          observarDOM.disconnect(); // Deja de observar después de encontrarlo
        }
      }
    });
  });

  // Comienza a observar el body del DOM
  observarDOM.observe(document.body, { childList: true, subtree: true });

  // Si el elemento ya existe en el DOM
  const buscarBoxInicial = document.getElementById("buscarboxrol");
  if (buscarBoxInicial) {
    console.log("Elemento 'buscarboxrol' ya existe en el DOM");
    agregarEventoBuscarRol(buscarBoxInicial);
    observarDOM.disconnect(); // No es necesario seguir observando
  }

  // Función para agregar el evento de búsqueda
  function agregarEventoBuscarRol(buscarBox) {
    buscarBox.addEventListener("input", function () {
      const filtro = buscarBox.value.toLowerCase();
      const filas = document.querySelectorAll("#tabla-roles tbody tr");

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
    if (event.target.id === "buscarboxrol") {
      const buscarBox = event.target; // El input dinámico
      const filtro = buscarBox.value.toLowerCase();
      const limpiarBusquedaRol = document.getElementById("limpiar-busquedaRol"); // Botón dinámico
      const filas = document.querySelectorAll("#tabla-roles tbody tr");
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
    if (event.target.id === "limpiar-busquedaRol") {
      const buscarBox = document.getElementById("buscarboxrol");
      const limpiarBusquedaRol = event.target;

      if (buscarBox) {
        buscarBox.value = ""; // Limpiar el input
        if (limpiarBusquedaRol) {
          limpiarBusquedaRol.style.display = "none"; // Ocultar el botón de limpiar
          document.getElementById("mensaje-vacio").style.display = "none";
        }
      }

      const filas = document.querySelectorAll("#tabla-roles tbody tr");
      filas.forEach((fila) => {
        fila.style.display = ""; // Mostrar todas las filas
      });
    }
  });
});

//Función para filtrar roles desde el servidor**************************************
function cargarRolesFiltrados() {
  const estatusFiltro = document
    .getElementById("estatusFiltroR")
    .value.trim()
    .toLowerCase();

  if (!estatusFiltro) {
    cargarRoles(); // Si el usuario selecciona "Todos", cargamos las primeras 10 tiendas normales
    return;
  }
  //console.log("Cargando roles filtrados del servidor:", estatusFiltro);

  fetch(`cruds/cargar_roles.php?estatus=${estatusFiltro}`)
    .then((response) => response.json())
    .then((data) => {
      // console.log("Filtrados: ",data);
      actualizarTablaRoles(data);
    })
    .catch((error) => console.error("Error al cargar roles filtrados:", error));
}

//Función para actualizar la tabla con las tiendas filtradas
function actualizarTablaRoles(roles) {
  let tbody = document.getElementById("roles-lista");
  tbody.innerHTML = ""; // Limpiar la tabla

  if (roles.length === 0) {
    tbody.innerHTML = `<tr><td colspan='7' style='text-align: center; color: red;'>No se encontraron roles</td></tr>`;
    return;
  }
  //LIMPIAR LA TABLA antes de agregar nuevos roles
  tbody.innerHTML = "";

  roles.forEach((rol) => {
    const fila = document.createElement("tr");
    fila.innerHTML = `
      <td data-lable="Nombre:">${rol.nom_rol}</td>
      <td data-lable="Descripción:">${rol.desc_rol}</td>

      <td data-lable="Estatus">
        <button class="btn ${
          rol.estatus_rol == 0 ? "btn-success" : "btn-danger"
        }">
          ${rol.estatus_rol == 0 ? "Activo" : "Inactivo"}
        </button>
      </td>
      <td data-lable="Editar:">
        <button title="Editar" class="editarRol fa-solid fa-pen-to-square" data-id="${
          rol.id_rol
        }"></button>
        </td>
        <td data-lable="Eliminar:">
        <button title="Eliminar" class="eliminarRol fa-solid fa-trash" data-id="${
          rol.id_rol
        }"></button>
      </td>
    `;
    tbody.appendChild(fila);
  });
}

//Función para cargar los primeros 10 roles por defecto
function cargarRoles() {
  pagina = 2; //Reiniciar la paginación cuando seleccionas "Todos"
  cargando = false; //Asegurar que el scroll pueda volver a activarse

  fetch("cruds/cargar_roles.php?limit=10&offset=0")
    .then((response) => response.json())
    .then((data) => {
      actualizarTablaRoles(data);
    })
    .catch((error) => console.error("Error al cargar roles:", error));
}

/* ------------------------ SCROLL INFINITO ROL------------------------*/

function cargarRolesScroll() {
  if (cargando) return;
  cargando = true;

  // Obtener el filtro actual para que el scroll también lo respete
  const estatusFiltroR = document
    .getElementById("estatusFiltroR")
    .value.trim()
    .toLowerCase();
  let url = `cruds/cargar_roles_scroll.php?page=${pagina}`;

  if (estatusFiltroR !== "") {
    url += `&estatus=${estatusFiltroR}`; // Enviar el filtro al servidor
  }

  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      if (data.length > 0) {
        const tbody = document.querySelector("#tabla-roles tbody");
        data.forEach((rol) => {
          const row = document.createElement("tr");
          row.innerHTML = `
            <td data-lable="Nombre:">${rol.nombre}</td>
            <td data-lable="Descripción:">${rol.descripcion}</td>
            
            <td data-lable="Estatus:">
              <button class="btn ${
                rol.estatus == 0 ? "btn-success" : "btn-danger"
              }">
                ${rol.estatus == 0 ? "Activo" : "Inactivo"}
              </button>
            </td>
            <td data-lable="Editar">
              <button title="Editar" class="editarRol fa-solid fa-pen-to-square" data-id="${
                rol.idrol
              }"></button>
            </td>
        <td data-lable="Eliminar">
        <button title="Eliminar" class="eliminarRol fa-solid fa-trash" data-id="${
          rol.idrol
        }"></button>
      </td>
          `;
          tbody.appendChild(row);
        });

        pagina++; // Aumentamos la página
        cargando = false;
      } else {
        Swal.fire({
          title: "No hay más Roles.",
          icon: "info",
          showConfirmButton: false,
          timer: 1500,
          timerProgressBar: true,
        });
      }
    })
    .catch((error) => console.error("Error al cargar roles:", error));
}

document.addEventListener("DOMContentLoaded", function () {
  if (window.location.pathname.includes("roles.php")) {
    pagina = 2; //  Reiniciar paginación
    cargando = false; // Permitir cargar más roles
    console.log("Reiniciando scroll y cargando roles en roles.php");

    //REACTIVAR EL SCROLL INFINITO CUANDO REGRESES A roles.php
    iniciarScrollRoles();
  }
});

function iniciarScrollRoles() {
  const scrollContainer = document.getElementById("scroll-containerR");
  if (!scrollContainer) return;

  scrollContainer.addEventListener("scroll", () => {
    if (
      scrollContainer.scrollTop + scrollContainer.clientHeight >=
        scrollContainer.scrollHeight - 10 &&
      !cargando
    ) {
      //console.log(" Scroll detectado, cargando más Roles...");
      cargarRolesScroll();
    }
  });

  //console.log(" Scroll infinito reactivado en roles.php");
}

const observerRoles = new MutationObserver(() => {
  const rolesSeccion = document.getElementById("scroll-containerR");
  if (rolesSeccion) {
    observerRoles.disconnect();
    iniciarScrollRoles();
  }
});

const Roles = document.getElementById("content-area");
if (Roles) {
  observerRoles.observe(Roles, { childList: true, subtree: true });
}

// Llamar Usuarios *********************************************
document
  .getElementById("usuarios-link")
  .addEventListener("click", function (event) {
    event.preventDefault(); // Evita la acción por defecto del enlace
    fetch("usuarios.php")
      .then((response) => response.text())
      .then((html) => {
        document.getElementById("content-area").innerHTML = html;

        // *** bloque dentro del callback ***
        const crearUsuarioForm = document.querySelector("#form-crearUser");
        //console.log("Formulario de creación encontrado:", crearUsuarioForm);
        if (crearUsuarioForm) {
          crearUsuarioForm.addEventListener("submit", validarFormularioUser);
          //console.log("Event listener adjuntado al formulario.");
        } else {
          console.log("Formulario de creación NO encontrado.");
        }
      })
      .catch((error) => {
        console.error("Error al cargar el contenido:", error);
      });
  });

//Crear usuario ***************************************************************
function abrirModalUser(id) {
  document.getElementById(id).style.display = "flex";
}

function cerrarModalUser(id) {
  document.getElementById(id).style.display = "none";
}

function procesarFormularioUser(event, tipo) {
  event.preventDefault(); //Para que no recergue la pagina
  const formData = new FormData(event.target);
  //console.log("Interceptando envío del formulario usuarios"); // Verifica si se ejecuta

  fetch(`cruds/procesar_${tipo}_user.php`, {
    method: "POST",
    body: formData,
  })
    .then((response) => response.json())
    .then((data) => {
      //console.log("Respuesta del servidor:", data);

      if (!data.success) {
        throw new Error(data.message || "Error desconocido.");
      }

      //console.log("Imagen subida con éxito:", data.rutaImagen);

      // Restablecer la variable después de recibir la respuesta del servidor
      enviando = false;

      // Aquí verificamos si la propiedad imagen existe antes de usarla
      if (!data.rutaImagen) {
        //console.warn("No se recibió imagen en la respuesta del servidor.");
      }

      if (data.success) {
        // Cerrar el modal
        cerrarModalUser(tipo + "-modalUser");
        // Limpiar los campos del formulario
        event.target.reset();

        // Actualizar la tabla dinámicamente si es 'crear'
        if (tipo === "crear") {
          const tbody = document.querySelector("table tbody");

          // Crear una nueva fila
          const newRow = document.createElement("tr");
          newRow.innerHTML = `
                            <td data-lable"Imagen">${
                              data.usuario.imagen
                                ? `<img src="${data.usuario.imagen}" alt="Perfil" width="50" height="50" style="border-radius: 50%;">`
                                : "N/A"
                            } 
                            </td>
                            <td data-lable="Usuario:">${
                              data.usuario.usuario
                            }</td>
                            <td data-lable="Nombre:">${data.usuario.nombre}</td>
                            <td data-lable="Primer apellido:">${
                              data.usuario.appaterno
                            }</td>
                            <td data-lable="Segundo apellido:">${
                              data.usuario.sapellido
                            }</td>
                            <td data-lable="Rol:">${data.usuario.nom_rol}</td>
                            <td data-lable="Taller:">${
                              data.usuario.nombre_t
                            }</td>                            

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

function validarFormularioUser(event) {
  event.preventDefault();
  //console.log("validarFormularioUser ejecutado");

  const usuario = document.querySelector("[name='usuario']").value.trim();
  const nombre = document.querySelector("[name='nombre']").value.trim();
  const papellido = document.querySelector("[name='papellido']").value.trim();
  const sapellido = document.querySelector("[name='sapellido']").value.trim();
  const rol = document.querySelector("[name='rol']").value.trim();
  const password1 = document.querySelector("[name='password1']").value.trim();
  const password2 = document.querySelector("[name='password2']").value.trim();
  const tienda = document.querySelector("[name='tienda']").value.trim();
  const estatus = document.querySelector("[name='estatus']").value.trim();

  /*console.log("Valores de los campos:", {
    usuario,
    nombre,
    papellido,
    sapellido,
    rol,
    password1,
    password2,
    tienda,
    estatus,
  });*/

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
      "El usuario debe tener al menos 3 caracteres.",
    );
  }
  if (nombre.length < 3) {
    mostrarError(
      "#crear-nombre",
      "El nombre debe tener al menos 3 caracteres.",
    );
  }
  if (papellido.length < 3) {
    mostrarError(
      "#crear-papellido",
      "El primer apellido debe tener al menos 3 caracteres.",
    );
  }
  if (sapellido.length < 3) {
    mostrarError(
      "#crear-sapellido",
      "El segundo apellido debe tener al menos 3 caracteres.",
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

  //console.log("Errores de validación:", errores);

  if (errores.length > 0) {
    Swal.fire({
      title: "Errores en el formulario",
      html: errores.join("<br>"),
      icon: "error",
    });
    return;
  }

  // console.log("Iniciando verificación de duplicados...");
  // Verificar duplicados antes de proceder
  verificarDuplicadoUser(usuario)
    .then((esDuplicado) => {
      //console.log("Resultado de verificarDuplicadoUser:", esDuplicado);
      if (esDuplicado) {
        Swal.fire({
          title: "Error",
          text: "El usuario ya existe. Por favor, elige otro.",
          icon: "warning",
          showConfirmButton: false,
          timer: 1500,
          timerProgressBar: true,
        });
        return; // Detener la ejecución si hay duplicados
      }

      // console.log("No hay duplicados, procediendo a procesarFormularioUser...");
      // Si no hay errores, enviar el formulario
      procesarFormularioUser(event, "crear");
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
function validarContrasenasInterno(password1, password2) {
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
      "La contraseña debe contener al menos una mayúscula, una minúscula, un número y un carácter especial.",
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
          event.target.value,
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

function verificarDuplicadoUser(usuario, nombre) {
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
const crearUsuarioForm = document.querySelector("#form-crearUser"); // Reemplaza con el ID real de tu formulario
if (crearUsuarioForm) {
  crearUsuarioForm.addEventListener("submit", validarFormularioUser);
}

//Para Editar Usuarios ********************************************
document.addEventListener("DOMContentLoaded", function () {
  // Escuchar clic en el botón de editar
  document.addEventListener("click", function (event) {
    if (event.target.classList.contains("editarUser")) {
      const id = event.target.dataset.id;
      // console.log("Botón editar clickeado. ID:", id);

      fetch(`cruds/obtener_usuario.php?id=${id}`)
        .then((response) => response.json())
        .then((data) => {
          //console.log("Datos recibidos del servidor:", data); //Depuracion

          if (data.success) {
            const formularioUsuario =
              document.getElementById("form-editarUser");

            if (formularioUsuario) {
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
                // console.log(`Asignando ${campo}:`, data.users[campo]);
                const input = formularioUsuario[`editar-${campo}`];
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
                    `El campo editar-${campo} no existe en el formulario.`,
                  );
                }
              });
              abrirModalUser("editar-modalUser");
            } else {
              console.error("Formulario de edición no encontrado.");
            }
          } else {
            mostrarAlerta(
              "error",
              "Error",
              data.message || "No se pudo cargar el campo.",
            );
          }
        })
        .catch((error) => {
          console.error("Error al obtener el campo:", error);
          mostrarAlerta(
            "error",
            "Error",
            "Ocurrió un problema al obtener los datos.",
          );
        });
    }
  });

  // Validar y enviar el formulario de editar ****************************
  document.body.addEventListener("submit", function (event) {
    if (event.target && event.target.id === "form-editarUser") {
      event.preventDefault(); // Esto evita el comportamiento de recargar la página.
      validarFormularioEdicionUsuario(event.target);
    }
  });
});

//Validar duplicados en editar usuario
function verificarDuplicadoEditarUsuario(usuario, id = 0) {
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
async function validarFormularioEdicionUsuario(formularioUsuario) {
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
      icon: "warning",
      showConfirmButton: false,
      timer: 1500,
      timerProgressBar: true,
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
    const esDuplicado = await verificarDuplicadoEditarUsuario(usuario, id);
    if (esDuplicado) {
      return; // No enviar el formulario si hay duplicados
    } else {
      //cerrarModalusuario("editar-modalusuario");
      enviarFormularioEdicionUsuario(formularioUsuario); // Proceder si no hay duplicados
    }
  } catch (error) {
    console.error("Error al verificar duplicado:", error);
  }
}
// Enviar formulario de edición Usuario
function enviarFormularioEdicionUsuario(formularioUsuario) {
  if (!formularioUsuario) {
    console.error("El formulario no se encontró.");
    return;
  }
  const formData = new FormData(formularioUsuario);

  fetch("cruds/editar_user.php", {
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
        actualizarFilaTablaUsuario(formData);
        cerrarModalUser("editar-modalUser");
      } else {
        Swal.fire({
          title: "Atención",
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
function actualizarFilaTablaUsuario(formData) {
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
    // Determinar clases y texto del botón
    const estatus = formData.get("estatus") === "0" ? "Activo" : "Inactivo";
    const claseBtn =
      formData.get("estatus") === "0" ? "btn btn-success" : "btn btn-danger";

    // Insertar el botón en la celda
    fila.cells[8].innerHTML = `<button class="${claseBtn}">${estatus}</button>`;
    //Para mantener el filtro seleccionado y actualizar la tabla cuando se edite
    cargarUsuariosFiltrados();
  }
}

// Eliminar usuario *************************************************
document.addEventListener("click", function (event) {
  if (event.target.classList.contains("eliminarUser")) {
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
                "error",
              );
            }
          })
          .catch((error) => {
            Swal.fire(
              "Error",
              "Hubo un problema al procesar tu solicitud.",
              "error",
            );
            console.error("Error al eliminar la tienda:", error);
          });
      }
    });
  }
});

//Buscar en la tabla y filtrar usuarios
document.addEventListener("DOMContentLoaded", function () {
  const observarDOM = new MutationObserver(function (mutations) {
    mutations.forEach((mutation) => {
      if (mutation.type === "childList") {
        const buscarBox = document.getElementById("buscarboxusuario");
        if (buscarBox) {
          //console.log("Elemento 'buscarbox' encontrado dinámicamente");
          agregarEventoBuscarUsuario(buscarBox);
          observarDOM.disconnect(); // Deja de observar después de encontrarlo
        }
      }
    });
  });

  // Comienza a observar el body del DOM
  observarDOM.observe(document.body, { childList: true, subtree: true });

  // Si el elemento ya existe en el DOM
  const buscarBoxInicial = document.getElementById("buscarboxusuario");
  if (buscarBoxInicial) {
    console.log("Elemento 'buscarboxusuario' ya existe en el DOM");
    agregarEventoBuscarUsuario(buscarBoxInicial);
    observarDOM.disconnect(); // No es necesario seguir observando
  }

  // Función para agregar el evento de búsqueda
  function agregarEventoBuscarUsuario(buscarBox) {
    buscarBox.addEventListener("input", function () {
      const filtro = buscarBox.value.toLowerCase();
      const filas = document.querySelectorAll("#tabla-usuarios tbody tr");

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
    if (event.target.id === "buscarboxusuario") {
      const buscarBox = event.target; // El input dinámico
      const filtro = buscarBox.value.toLowerCase();
      const limpiarBusquedaUsuario = document.getElementById(
        "limpiar-busquedaUsuario",
      ); // Botón dinámico
      const filas = document.querySelectorAll("#tabla-usuarios tbody tr");
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
      const buscarBox = document.getElementById("buscarboxusuario");
      const limpiarBusquedaUsuarios = event.target;

      if (buscarBox) {
        buscarBox.value = ""; // Limpiar el input
        if (limpiarBusquedaUsuarios) {
          limpiarBusquedaUsuarios.style.display = "none"; // Ocultar el botón de limpiar
          document.getElementById("mensaje-vacio").style.display = "none";
        }
      }

      const filas = document.querySelectorAll("#tabla-usuarios tbody tr");
      filas.forEach((fila) => {
        fila.style.display = ""; // Mostrar todas las filas
      });
    }
  });
});

//Función para filtrar usuarios desde el servidor ****************************
function cargarUsuariosFiltrados() {
  const estatusFiltro = document
    .getElementById("estatusFiltroU")
    .value.trim()
    .toLowerCase();

  if (!estatusFiltro) {
    cargarUsuarios(); // Si el usuario selecciona "Todos", cargamos los primeros 10 usuarios normales
    return;
  }
  //console.log("Cargando usuarios filtradas del servidor:", estatusFiltro);

  fetch(`cruds/cargar_usuarios.php?estatus=${estatusFiltro}`)
    .then((response) => response.json())
    .then((data) => {
      //console.log("Filtradas: ",data);
      actualizarTablaUsuarios(data);
    })
    .catch((error) =>
      console.error("Error al cargar usuarios filtradas:", error),
    );
}

//Función para actualizar tabla usuarios filtrados
function actualizarTablaUsuarios(data) {
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
          <td data-lable="Primer apellido:">${usuario.p_appellido}</td>
          <td data-lable="Segundo apellido:">${
            usuario.s_appellido
          }</td>          
          <td data-lable="Rol:">${usuario.nom_rol}</td>
          <td data-lable="Taller:">${usuario.nombre_t}</td>

          <td data-lable="Estatus">
          <button class="btn ${
            usuario.estatus == 0 ? "btn-success" : "btn-danger"
          }">
                             ${usuario.estatus == 0 ? "Activo" : "Inactivo"}
          </button>
          </td>
          <td data-lable="Editar">
            <button title="Editar" class="editarUser fa-solid fa-pen-to-square" data-id="${
              usuario.id_usuario
            }"></button>
            </td>
            <td data-lable="Eliminar">
            <button title="Eliminar" class="eliminarUser fa-solid fa-trash" data-id="${
              usuario.id_usuario
            }"></button>
          </td>
      `;
    tbody.appendChild(fila);
  });
}

//Función para cargar los primeros 10 Usuarios por defecto
function cargarUsuarios() {
  pagina = 2; //Reiniciar la paginación cuando seleccionas "Todos"
  cargando = false; //Asegurar que el scroll pueda volver a activarse

  fetch("cruds/cargar_usuarios.php?limit=10&offset=0")
    .then((response) => response.json())
    .then((data) => {
      actualizarTablaUsuarios(data);
    })
    .catch((error) => console.error("Error al cargar usuarios:", error));
}

/* ------------------------ SCROLL USUARIOS INFINITO ------------------------*/

function cargarUsuariosScroll() {
  if (cargando) return;
  cargando = true;

  // Obtener el filtro actual para que el scroll también lo respete
  const estatusFiltro = document
    .getElementById("estatusFiltroU")
    .value.trim()
    .toLowerCase();
  let url = `cruds/cargar_usuarios_scroll.php?page=${pagina}`;

  if (estatusFiltro !== "") {
    url += `&estatus=${estatusFiltro}`; // Enviar el filtro al servidor
  }

  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      if (data.length > 0) {
        const tbody = document.querySelector("#tabla-usuarios tbody");
        data.forEach((usuario) => {
          const row = document.createElement("tr");
          row.innerHTML = `
            <td data-lable"Imagen:"><img src="${
              usuario.imagen
            }" width="50" height="50" onerror="this.src='../imgs/default.png'"></td>
            <td data-lable="Usuario:">${usuario.usuario}</td>
            <td data-lable="Nombre:">${usuario.nombre}</td>
            <td data-lable="Primer apellido:">${usuario.p_appellido}</td>
            <td data-lable="Segundo apellido:">${usuario.s_appellido}</td>
            <td data-lable="Rol:">${usuario.nom_rol}</td>
            <td data-lable="Tienda:">${usuario.nombre_t}</td>

            <td data-lable="Estatus:">
              <button class="btn ${
                usuario.estatus == 0 ? "btn-success" : "btn-danger"
              }">
                ${usuario.estatus == 0 ? "Activo" : "Inactivo"}
              </button>
            </td>
            <td data-lable="Editar:">
              <button title="Editar" class="editarUser fa-solid fa-pen-to-square" data-id="${
                usuario.id_usuario
              }"></button>
              </td>
              <td data-lable="Eliminar:">
              <button title="Eliminar" class="eliminarUser fa-solid fa-trash" data-id="${
                usuario.id_usuario
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
  if (window.location.pathname.includes("usuarios.php")) {
    pagina = 2; //  Reiniciar paginación
    cargando = false; // Permitir cargar más usuarios
    console.log("Reiniciando scroll y cargando usuarios en usuarios.php");

    //REACTIVAR EL SCROLL INFINITO CUANDO REGRESES A usuarios.php
    iniciarScrollUsuarios();
  }
});

function iniciarScrollUsuarios() {
  const scrollContainer = document.getElementById("scroll-containerU");
  if (!scrollContainer) return;

  scrollContainer.addEventListener("scroll", () => {
    if (
      scrollContainer.scrollTop + scrollContainer.clientHeight >=
        scrollContainer.scrollHeight - 10 &&
      !cargando
    ) {
      console.log(" Scroll detectado, cargando más usuarios...");
      cargarUsuariosScroll();
    }
  });

  //console.log(" Scroll infinito reactivado en usuarios.php");
}

const observerUsuarios = new MutationObserver(() => {
  const usuariosSeccion = document.getElementById("scroll-containerU");
  if (usuariosSeccion) {
    observerUsuarios.disconnect();
    iniciarScrollUsuarios();
  }
});

const Usuarios = document.getElementById("content-area");
if (Usuarios) {
  observerUsuarios.observe(Usuarios, { childList: true, subtree: true });
}

// Llamar Productos *******************************************************
document
  .getElementById("productos-link")
  .addEventListener("click", function (event) {
    event.preventDefault(); // Evita la acción por defecto del enlace
    fetch("catalogos/productos.php")
      .then((response) => response.text())
      .then((html) => {
        document.getElementById("content-area").innerHTML = html;

        cargarProductos(); // Cargar los productos sin filtro inmediatamente
        buscarProductosConFiltro(); // Buscar productos
      })
      .catch((error) => {
        console.error("Error al cargar el contenido:", error);
      });
  });

//Crear Productos**********************************************************
function abrirModalProducto(id) {
  document.getElementById(id).style.display = "flex";

  // Obtener los elementos del formulario de CREAR producto (si el modal es de creación)
  const crearCostoCompraInput = document.querySelector(
    "#crear-modalProducto #crear-costo_compra",
  );
  const crearGananciaInput = document.querySelector(
    "#crear-modalProducto #crear-ganancia",
  );
  const crearImpuestoSelect = document.querySelector(
    "#crear-modalProducto #crear-impuesto",
  );
  const crearPrecio1Input = document.querySelector(
    "#crear-modalProducto #crear-precio1",
  );

  // Adjuntar event listeners al formulario de CREAR si los elementos existen
  if (
    crearCostoCompraInput &&
    crearGananciaInput &&
    crearImpuestoSelect &&
    crearPrecio1Input
  ) {
    crearCostoCompraInput.addEventListener("input", () =>
      calcularPrecio(
        crearCostoCompraInput,
        crearGananciaInput,
        crearImpuestoSelect,
        crearPrecio1Input,
      ),
    );
    crearGananciaInput.addEventListener("input", () =>
      calcularPrecio(
        crearCostoCompraInput,
        crearGananciaInput,
        crearImpuestoSelect,
        crearPrecio1Input,
      ),
    );
    crearImpuestoSelect.addEventListener("change", () =>
      calcularPrecio(
        crearCostoCompraInput,
        crearGananciaInput,
        crearImpuestoSelect,
        crearPrecio1Input,
      ),
    );
  }

  // Obtener los elementos del formulario de EDITAR producto (si el modal es de edición)
  const editarCostoCompraInput = document.querySelector(
    "#editar-modalProducto #editar-costo_compra",
  );
  const editarGananciaInput = document.querySelector(
    "#editar-modalProducto #editar-ganancia",
  );
  const editarImpuestoSelect = document.querySelector(
    "#editar-modalProducto #editar-impuesto",
  );
  const editarPrecio1Input = document.querySelector(
    "#editar-modalProducto #editar-precio1",
  );

  // Adjuntar event listeners al formulario de EDITAR si los elementos existen
  if (
    editarCostoCompraInput &&
    editarGananciaInput &&
    editarImpuestoSelect &&
    editarPrecio1Input
  ) {
    editarCostoCompraInput.addEventListener("input", () =>
      calcularPrecio(
        editarCostoCompraInput,
        editarGananciaInput,
        editarImpuestoSelect,
        editarPrecio1Input,
      ),
    );
    editarGananciaInput.addEventListener("input", () =>
      calcularPrecio(
        editarCostoCompraInput,
        editarGananciaInput,
        editarImpuestoSelect,
        editarPrecio1Input,
      ),
    );
    editarImpuestoSelect.addEventListener("change", () =>
      calcularPrecio(
        editarCostoCompraInput,
        editarGananciaInput,
        editarImpuestoSelect,
        editarPrecio1Input,
      ),
    );
  }
}

function calcularPrecio(
  costoInput,
  gananciaInput,
  impuestoSelect,
  precioInput,
) {
  const costoCompra = parseFloat(costoInput.value) || 0;
  const gananciaPorcentaje = parseFloat(gananciaInput.value) || 0;

  // Obtener la tasa del impuesto desde el atributo data-tasa de la opción seleccionada
  const selectedOption = impuestoSelect.options[impuestoSelect.selectedIndex];
  const impuestoValor = parseFloat(selectedOption.dataset.tasa) || 0;

  const precioConGanancia = costoCompra * (1 + gananciaPorcentaje / 100);
  const precioFinal = precioConGanancia * (1 + impuestoValor);

  precioInput.value = precioFinal.toFixed(2);
}

function cerrarModalProducto(id) {
  document.getElementById(id).style.display = "none";
}

function procesarFormularioProducto(event, tipo) {
  event.preventDefault(); //Para que no recergue la pagina

  if (enviando) return; // Si ya se está enviando, detener la función
  enviando = true; // Marcar como "enviando" para evitar envíos repetidos

  //console.log("Interceptando envío del formulario2"); // Verifica si se ejecuta

  const formData = new FormData(document.getElementById("form-crearProducto"));

  fetch(`cruds/procesar_${tipo}_producto.php`, {
    method: "POST",
    body: formData,
  })
    .then((response) => response.json())
    .then((data) => {
      //console.log("Respuesta del servidor:", data);

      if (!data.success) {
        throw new Error(data.message || "Error desconocido.");
      }

      //console.log("Imagen subida con éxito:", data.rutaImagen);

      // Restablecer la variable después de recibir la respuesta del servidor
      enviando = false;

      // Aquí verificamos si la propiedad imagen existe antes de usarla
      if (!data.rutaImagen) {
        console.warn("No se recibió imagen en la respuesta del servidor.");
      }

      if (data.success) {
        // Cerrar el modal
        cerrarModalProducto(tipo + "-modalProducto");
        // Limpiar los campos del formulario
        event.target.reset();

        // Actualizar la tabla dinámicamente si es 'crear'
        if (tipo === "crear") {
          const tbody = document.querySelector("table tbody");

          // Crear una nueva fila
          //En la linea de estatus escribimos eso para que cuando
          //se inserte en la tabla se convierta a texto y no a número con su botón

          const newRow = document.createElement("tr");
          newRow.innerHTML = `
            <td data-lable"Imagen:">${data.producto.imagen}</td>
            <td data-lable"Código de barras:">${data.producto.codebar}</td>
            <td data-lable"Nombre:">${data.producto.producto}</td>
            <td data-lable"Costo:">${parseFloat(
              data.producto.costo_compra,
            ).toFixed(2)}</td>
            <td data-lable"Precio:">${parseFloat(data.producto.precio1).toFixed(
              2,
            )}</td> 
            <td data-lable"Stock mínimo:">${data.producto.stock_minimo}</td>
            <td data-lable"Stock:">0</td>
            <td data-lable"Estatus:">
              <button class="btn ${
                data.producto.estatus == 0 ? "btn-success" : "btn-danger"
              }">
              ${data.producto.estatus == 0 ? "Activo" : "Inactivo"}
              </button>
            </td>
            
            <td data-lable"Editar:">
              <button title="Editar" class="editarProducto fa-solid fa-pen-to-square" data-id="${
                data.producto.id
              }"></button>
              </td>
              <td data-lable"Eliminar:">
              <button title="Eliminar" class="eliminarProducto fa-solid fa-trash" data-id="${
                data.producto.id
              }"></button>
            </td>
          `;

          /* Agregar la nueva fila al final de la tabla
          tbody.appendChild(newRow);*/

          // Agregar la nueva fila al principio de la tabla
          tbody.insertBefore(newRow, tbody.firstChild);
        }

        // Mostrar un mensaje de éxito
        Swal.fire({
          title: "¡Éxito!",
          text: data.message, // Usar el mensaje del backend
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
        });
      }
    })
    .catch((error) => {
      // Mostrar un mensaje de error específico del backend
      Swal.fire({
        title: "Error",
        text: error.message || "Ocurrió un problema al enviar los datos.",
        icon: "error",
        showConfirmButton: false,
      });
    });
  enviando = false; // Permitir nuevos envíos después de finalizar la solicitud
}

function validarFormularioProducto(event) {
  event.preventDefault();

  const codebar = document.querySelector("[name='codebar']").value.trim();
  const producto = document.querySelector("[name='producto']").value.trim();
  const descprod = document.querySelector("[name='descprod']").value.trim();
  const idcategoria = document.querySelector("[name='categoria']").value.trim();
  //console.log("Categoria seleccionado:", idcategoria);

  const idmarca = document.querySelector("[name='marca']").value.trim();
  //console.log("Marca seleccionado:", idmarca);

  const costo_compra = document
    .querySelector("[name='costo_compra']")
    .value.trim();
  const ganancia = document.querySelector("[name='ganancia']").value.trim();
  const precio1 = document.querySelector("[name='precio1']").value.trim();

  const errores = [];
  //Validaciones simples
  if (codebar.length < 3) {
    errores.push("El código debe tener al menos 3 caracteres.");
    const inputcodebar = document.querySelector("#crear-codebar");
    inputcodebar.focus();
    inputcodebar.classList.add("input-error"); // Añade la clase de error
  }
  // Elimina la clase de error al corregir
  const inputcodebar = document.querySelector("#crear-codebar");
  inputcodebar.addEventListener("input", () => {
    if (inputcodebar.value.length >= 3) {
      inputcodebar.classList.remove("input-error"); // Quita la clase si el campo es válido
    }
  });
  if (producto.length < 3) {
    errores.push("El nombre debe tener al menos 3 caracteres.");
    const inputname = document.querySelector("#crear-producto");
    inputname.focus();
    inputname.classList.add("input-error"); // Añade la clase de error
  }
  // Elimina la clase de error al corregir
  const inputname = document.querySelector("#crear-producto");
  inputname.addEventListener("input", () => {
    if (inputname.value.length >= 3) {
      inputname.classList.remove("input-error"); // Quita la clase si el campo es válido
    }
  });

  if (descprod.length < 3) {
    errores.push("La descripción debe tener al menos 3 caracteres.");
    const inputdesc = document.querySelector("#crear-descprod");
    inputdesc.focus();
    inputdesc.classList.add("input-error"); // Añade la clase de error
  }
  // Elimina la clase de error al corregir
  const inputdesc = document.querySelector("#crear-descprod");
  inputdesc.addEventListener("input", () => {
    if (inputdesc.value.length >= 3) {
      inputdesc.classList.remove("input-error"); // Quita la clase si el campo es válido
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

  // Verificar duplicados antes de proceder
  verificarDuplicadoProducto(codebar, producto)
    .then((esDuplicado) => {
      if (esDuplicado) {
        Swal.fire({
          title: "Duplicado",
          text: "El nombre o código de barras ya existen. Por favor, elige otro.",
          icon: "error",
          showConfirmButton: false,
          timer: 1500,
          timerProgressBar: true,
        });
        return; // Detener la ejecución si hay duplicados
      }

      // Si no hay errores, enviar el formulario
      procesarFormularioProducto(event, "crear");
    })
    .catch((error) => {
      console.error("Error al verificar duplicados:", error);
      Swal.fire({
        title: "Error",
        text: "Ocurrió un problema al validar el producto.",
        icon: "error",
      });
    });
}
function verificarDuplicadoProducto(codebar, producto) {
  return fetch("cruds/verificar_nombre_producto.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ codebar, producto }), // Ahora se envían ambos datos
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.existe) {
        Swal.fire({
          title: "Duplicado",
          text: "El nombre o el código de barras ya existen.",
          icon: "warning",
          showConfirmButton: false,
          timer: 1500,
          timerProgressBar: true,
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

//Editar Productos************************************************************
document.addEventListener("DOMContentLoaded", function () {
  // Escuchar clic en el botón de editar
  document.addEventListener("click", function (event) {
    if (event.target.classList.contains("editarProducto")) {
      const id = event.target.dataset.id;
      //console.log("Botón editar clickeado. ID:", id);

      fetch(`cruds/obtener_producto.php?id=${id}`)
        .then((response) => response.json())
        .then((data) => {
          //console.log("Datos recibidos del servidor:", data);
          if (data.success) {
            const formularioProducto = document.getElementById(
              "form-editarProducto",
            );
            if (formularioProducto) {
              const campos = [
                "idproducto",
                "codebar",
                "producto",
                "descprod",
                "categoria",
                "marca",
                "proveedor",
                "umedida",
                "impuesto",
                "costo_compra",
                "ganancia",
                "precio1",
                "stock_minimo",
                "estatus",
              ];
              //console.log(`Asignando ${campos}:`, data.producto[campos]);
              campos.forEach((campo) => {
                const input = formularioProducto[`editar-${campo}`];
                if (input) {
                  //console.log(`Asignando ${campo}:`, data.producto[campo]);
                  input.value = data.producto[campo] || "";
                } else {
                  console.warn(
                    `El campo editar-${campo} no existe en el formulario.`,
                  );
                }
              });
              abrirModalProducto("editar-modalProducto");
            } else {
              console.error("Formulario de edición no encontrado.");
            }
          } else {
            mostrarAlerta(
              "error",
              "Error",
              data.message || "No se pudo cargar el campo.",
            );
          }
        })
        .catch((error) => {
          console.error("Error al obtener el campo:", error);
          mostrarAlerta(
            "error",
            "Error",
            "Ocurrió un problema al obtener los datos.",
          );
        });
    }
  });

  // Validar y enviar el formulario de edición
  document.body.addEventListener("submit", function (event) {
    if (event.target && event.target.id === "form-editarProducto") {
      event.preventDefault(); // Esto evita el comportamiento predeterminado de recargar la página.
      validarFormularioEdicionProducto(event.target);
    }
  });
});

//Validar duplicados de codigo de barras en edicion producto
function verificarDuplicadoEditarCodebar(codebar, id = 0) {
  return fetch("cruds/verificar_codebar_producto.php", {
    // Crea un nuevo archivo PHP para esto
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ codebar, id }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.existe) {
        //mostrarAlerta("error", "Error", "El código de barras ya existe.");
        Swal.fire({
          title: "¡Duplicado!",
          text: data.message || "El código de barras ya existe.",
          icon: "warning",
          showConfirmButton: false,
          timer: 1500,
          timerProgressBar: true,
        });
      }
      return data.existe;
    })
    .catch((error) => {
      console.error("Error al verificar código de barras:", error);
      return true; // Asume duplicado en caso de error
    });
}

//Validar duplicados en edicion producto
function verificarDuplicadoEditarProducto(producto, id = 0) {
  //console.log("Validando duplicados. ID:", id, "Producto:", producto);

  return fetch("cruds/verificar_nombre_producto.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ producto, id }),
  })
    .then((response) => response.json())
    .then((data) => {
      //console.log("Respuesta de verificar_nombre.php:", data);
      if (data.existe) {
        //mostrarAlerta("error", "Error", "El nombre ya existe.");
        Swal.fire({
          title: "¡Duplicado!",
          text: data.message || "El nombre o código de barras ya existe.",
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

// Validación del formulario de edición Producto
async function validarFormularioEdicionProducto(formulario) {
  const campos = [
    {
      nombre: "codebar",
      min: 3,
      mensaje: "El código de barras debe tener al menos 3 caracteres.",
    },
    {
      nombre: "producto",
      min: 3,
      mensaje: "El nombre debe tener al menos 3 caracteres.",
    },
    {
      nombre: "descprod",
      min: 3,
      mensaje: "La descripción debe tener al menos 3 caracteres.",
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

  // Verificar duplicado del nombre (tu código actual)
  const productoInput = document.getElementById("editar-producto");
  const idInput = document.getElementById("editar-idproducto");
  if (!productoInput || !idInput) {
    console.log("Error: No se encontró el campo producto o ID.");
    return;
  }
  const producto = productoInput.value.trim();
  const id = idInput.value;

  try {
    const esNombreDuplicado = await verificarDuplicadoEditarProducto(
      producto,
      id,
    );
    if (esNombreDuplicado) {
      return; // No enviar si el nombre está duplicado
    }
  } catch (error) {
    console.error("Error al verificar duplicado del nombre:", error);
    return;
  }

  // Verificar duplicado del código de barras
  const codebarInput = document.getElementById("editar-codebar");
  if (codebarInput) {
    const codebar = codebarInput.value.trim();
    try {
      const esCodebarDuplicado = await verificarDuplicadoEditarCodebar(
        codebar,
        id,
      );
      if (esCodebarDuplicado) {
        return; // No enviar si el código de barras está duplicado
      }
    } catch (error) {
      console.error(
        "Error al verificar duplicado del código de barras:",
        error,
      );
      return;
    }
  }

  // Si no hay errores de validación ni duplicados, enviar el formulario
  enviarFormularioEdicionProducto(formulario);
}

// Enviar formulario de edición Producto
function enviarFormularioEdicionProducto(formulario) {
  if (!formulario) {
    console.error("El formulario no se encontró.");
    return;
  }
  const formData = new FormData(formulario);

  fetch("cruds/editar_producto.php", {
    method: "POST",
    body: formData,
  })
    .then((response) => response.json())
    .then((data) => {
      //console.log("Respuesta del servidorEdit:", data);
      //Mensajes de text: desde el backend
      if (data.success) {
        Swal.fire({
          title: "¡Éxito!",
          text: data.message || "La actualización se realizó correctamente.",
          icon: "success",
          showConfirmButton: false,
          timer: 1500,
          timerProgressBar: true,
        });
        actualizarFilaTablaProducto(formData);
        cerrarModalProducto("editar-modalProducto");
      } else {
        Swal.fire({
          title: "Atención",
          text: data.message || "No se realizaron cambios en el Producto.",
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
function actualizarFilaTablaProducto(formData) {
  const fila = document
    .querySelector(`button[data-id="${formData.get("editar-idproducto")}"]`)
    .closest("tr");
  //console.log(formData.get("editar-idproducto"));
  if (fila) {
    fila.cells[0].textContent = formData.get("imagen");
    fila.cells[1].textContent = formData.get("codebar");
    fila.cells[2].textContent = formData.get("producto");
    fila.cells[3].textContent = formData.get("costo_compra");
    fila.cells[4].textContent = formData.get("precio1");
    fila.cells[5].textContent = formData.get("stock_minimo");

    cargarProductosFiltrados();
  }
}

// Eliminar Productos****************************************************
document.addEventListener("click", function (event) {
  if (event.target.classList.contains("eliminarProducto")) {
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
        fetch(`cruds/eliminar_producto.php?id=${id}`, { method: "POST" })
          .then((response) => response.json())
          .then((data) => {
            if (data.success) {
              //alert("Registro eliminado correctamente");
              Swal.fire({
                title: "¡Eliminado!",
                text: data.message,
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
                "error",
              );
            }
          })
          .catch((error) => {
            Swal.fire(
              "Error",
              "Hubo un problema al procesar tu solicitud.",
              "error",
            );
            console.error("Error al eliminar:", error);
          });
      }
    });
  }
});
//Filtrar productos por estatus *************************************************
document.addEventListener("DOMContentLoaded", function () {
  const estatusFiltroElement = document.getElementById("estatusFiltro");
  if (estatusFiltroElement) {
    estatusFiltroElement.addEventListener("change", cargarProductosPorEstatus); // Nueva función para el filtro independiente
  }
});

function cargarProductosPorEstatus() {
  const estatus = document.getElementById("estatusFiltro").value;
  let url = `cruds/cargar_productos.php`;
  if (estatus && estatus !== "todos") {
    // Asegurarse de no enviar "todos" como filtro
    url += `?estatus=${estatus}`;
  }

  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      actualizarTabla(data); // Usar actualizarTabla para la carga inicial y el filtro independiente
      // Reiniciar paginación si es necesario
    })
    .catch((error) =>
      console.error("Error al cargar productos por estatus:", error),
    );
}

// Buscar productos***********************************************************************
function buscarProductosConFiltro() {
  let timeout;
  const buscarBox = document.getElementById("buscarboxproducto");
  const filtroEstatusElement = document.getElementById("estatusFiltro");

  document.addEventListener("input", function (event) {
    if (event.target && event.target.id === "buscarboxproducto") {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        const filtro = buscarBox.value.trim().toLowerCase();
        const filtroEstatus = filtroEstatusElement.value;
        buscarProductos(filtro, filtroEstatus); // Llamar a buscarProductos solo cuando hay búsqueda
      }, 500);
    }
  });

  // El listener para el cambio del filtro de estatus ahora llama a cargarProductosPorEstatus
}

function buscarProductos(filtro, estatus) {
  let url = `cruds/buscar_productos.php?q=${encodeURIComponent(filtro)}`;
  if (estatus) {
    url += `&estatus=${estatus}`;
  }
  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      actualizarTablaProducto(data); // Usar actualizarTablaProducto para los resultados de búsqueda
    })
    .catch((error) => console.error("Error en la búsqueda:", error));
}

function actualizarTablaProducto(productos) {
  let tbody = document.getElementById("productos-lista");
  tbody.innerHTML = "";

  if (productos.length === 0) {
    tbody.innerHTML = `<tr><td colspan='9' style='text-align: center; color: red;'>No se encontraron productos</td></tr>`;
    return;
  }

  productos.forEach((producto) => {
    let stockValue = producto.stock === null ? 0 : producto.stock;
    const fila = document.createElement("tr");

    // Verificar si el stock es menor que el stock mínimo y aplicar una clase CSS
    if (stockValue < producto.stock_minimo) {
      fila.classList.add("bajo-stock"); // Añadir una clase para resaltar
    }

    fila.innerHTML = `
      <td data-lable="Imagen:"><img src="${
        producto.imagen
      }" width="50" height="50" onerror="this.src='../imgs/default.png'"></td>
      <td data-lable="Código de barras:">${producto.codebar_prod}</td>
      <td data-lable="Nombre:">${producto.nombre_prod}</td>
      <td data-lable="Costo:">${producto.costo_prod}</td>
      <td data-lable="Precio:">${producto.precio}</td>
      <td data-lable="Stock mínimo:">${producto.stock_minimo}</td>
      <td data-lable="Stock:">${stockValue}</td>
      <td data-lable="Estatus:">
        <button class="btn ${
          producto.estatus == 0 ? "btn-success" : "btn-danger"
        }">
          ${producto.estatus == 0 ? "Activo" : "Inactivo"}
        </button>
      </td>
      <td>
        <button title="Editar" class="editarProducto fa-solid fa-pen-to-square" data-id="${
          producto.id_prod
        }"></button>
        &nbsp;&nbsp;&nbsp;
        <button title="Eliminar" class="eliminarProducto fa-solid fa-trash" data-id="${
          producto.id_prod
        }"></button>
      </td>
    `;
    tbody.appendChild(fila);
  });
}

// Asegúrate de llamar a buscarProductosConFiltro en el lugar correcto,
// probablemente d

//Filtrar productos por estatus usando delegación de eventos*************************************************
document.addEventListener("DOMContentLoaded", function () {
  //Delegación de eventos para el filtro de estatus
  document.addEventListener("change", function (event) {
    if (event.target && event.target.id === "estatusFiltro") {
      cargarProductosFiltrados();
    }
  });

  // Detectar cuando se agregan nuevos productos y volver a aplicar el filtro
  const observer = new MutationObserver(() => {
    //console.log("Productos actualizados, aplicando filtro...");
    filtrarPorEstatus(); // Asegura que el filtro se mantenga cuando se cargan más productos con scroll
  });

  const productosLista = document.getElementById("productos-lista");
  if (productosLista) {
    observer.observe(productosLista, { childList: true, subtree: true });
  }
});

//Función para filtrar productos desde el servidor
function cargarProductosFiltrados() {
  const estatusFiltro = document
    .getElementById("estatusFiltro")
    .value.trim()
    .toLowerCase();
  filtroAplicado = estatusFiltro; // Almacena el filtro aplicado

  if (!estatusFiltro) {
    // Incluir "todos" como caso para cargar todos
    cargarProductos(); // Si el usuario selecciona "Todos" o no hay filtro, cargamos los primeros 10 productos normales
    return;
  }
  //console.log("Cargando productos filtrados del servidor:", estatusFiltro);

  fetch(`cruds/cargar_productos.php?estatus=${estatusFiltro}`)
    .then((response) => response.json())
    .then((data) => {
      actualizarTabla(data);
    })
    .catch((error) =>
      console.error("Error al cargar productos filtrados:", error),
    );
}

//Función para actualizar la tabla con los productos filtrados
function actualizarTabla(productos) {
  let tbody = document.getElementById("productos-lista");
  tbody.innerHTML = "";

  if (productos.length === 0) {
    tbody.innerHTML = `<tr><td colspan='9' style='text-align: center; color: red;'>No se encontraron productos</td></tr>`;
    return;
  }

  productos.forEach((producto) => {
    let stockValue = producto.stock === null ? 0 : producto.stock;
    const fila = document.createElement("tr");

    // Verificar si el stock es menor que el stock mínimo y aplicar una clase CSS
    if (stockValue < producto.stock_minimo) {
      fila.classList.add("bajo-stock"); // Añadir una clase para resaltar
    }

    fila.innerHTML = `
      <td data-lable="Imagen:"><img src="${
        producto.imagen
      }" width="50" height="50" onerror="this.src='../imgs/default.png'"></td>
      <td data-lable="Código de barras:">${producto.codebar_prod}</td>
      <td data-lable="Nombre:">${producto.nombre_prod}</td>
      <td data-lable="Costo:">${producto.costo_prod}</td>
      <td data-lable="Precio:">${producto.precio}</td>
      <td data-lable="Stock mínimo:">${producto.stock_minimo}</td>
      <td data-lable="Stock:">${stockValue}</td>
      <td data-lable="Estatus:">
        <button class="btn ${
          producto.estatus == 0 ? "btn-success" : "btn-danger"
        }">
          ${producto.estatus == 0 ? "Activo" : "Inactivo"}
        </button>
      </td>
      <td data-lable="Editar:">
        <button title="Editar" class="editarProducto fa-solid fa-pen-to-square" data-id="${
          producto.id_prod
        }"></button>
        </td>
      <td data-lable="Eliminar:">
        <button title="Eliminar" class="eliminarProducto fa-solid fa-trash" data-id="${
          producto.id_prod
        }"></button>
      </td>
    `;
    tbody.appendChild(fila);
  });
}

//Función para cargar los primeros 10 productos por defecto
function cargarProductos() {
  pagina = 2; //Reiniciar la paginación cuando seleccionas "Todos"
  cargando = false; //Asegurar que el scroll pueda volver a activarse

  fetch("cruds/cargar_productos.php?limit=10&offset=0")
    .then((response) => response.json())
    .then((data) => {
      actualizarTabla(data);
    })
    .catch((error) => console.error("Error al cargar productos:", error));
}

// Llamar Categorias **************************************************
document
  .getElementById("categorias-link")
  .addEventListener("click", function (event) {
    event.preventDefault(); // Evita la acción por defecto del enlace
    fetch("catalogos/categorias.php")
      .then((response) => response.text())
      .then((html) => {
        document.getElementById("content-area").innerHTML = html;
      })
      .catch((error) => {
        console.error("Error al cargar el contenido:", error);
      });
  });

//Crear Categoria******************************************
function abrirModalCat(id) {
  document.getElementById(id).style.display = "flex";
}

function cerrarModalCat(id) {
  document.getElementById(id).style.display = "none";
}

function procesarFormularioCat(event, tipo) {
  event.preventDefault(); //Para que no recergue la pagina
  const formData = new FormData(event.target);

  fetch(`cruds/procesar_${tipo}_cat.php`, {
    method: "POST",
    body: formData,
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        // Cerrar el modal
        cerrarModalCat(tipo + "-modalCat");
        // Limpiar los campos del formulario
        event.target.reset();

        // Actualizar la tabla dinámicamente si es 'crear'
        if (tipo === "crear") {
          const tbody = document.querySelector("table tbody");

          // Crear una nueva fila
          const newRow = document.createElement("tr");
          newRow.innerHTML = `
            <td data-lable="Nombre:">${data.cat.nombre}</td>
            <td data-lable="Descripción:">${data.cat.descripcion}</td>
            <td data-lable="Estatus:">
              <button class="btn ${
                data.cat.estatus == 0 ? "btn-success" : "btn-danger"
              }">
              ${data.cat.estatus == 0 ? "Activo" : "Inactivo"}
              </button>
            </td>
            
            <td data-lable="Editar:">
              <button title="Editar:" class="editarCat fa-solid fa-pen-to-square" data-id="${
                data.cat.id
              }"></button>
              </td>
            <td data-lable="Eliminar:">
              <button title="Eliminar:" class="eliminarCat fa-solid fa-trash" data-id="${
                data.cat.id
              }"></button>
            </td>
          `;

          // Agregar la nueva fila a la tabla
          tbody.appendChild(newRow);
        }

        // Mostrar un mensaje de éxito
        Swal.fire({
          title: "¡Éxito!",
          text: "La acción se realizó correctamente.",
          icon: "success",
          showConfirmButton: false,
          timer: 1500,
          timerProgressBar: true,
        });
      } else {
        // Mostrar un mensaje de error
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
function validarFormularioCat(event) {
  event.preventDefault();

  const cat = document.querySelector("[name='cat']").value.trim();
  const desc_cat = document.querySelector("[name='desc_cat']").value.trim();

  const errores = [];

  if (cat.length < 3) {
    errores.push("El nombre debe tener al menos 3 caracteres.");
    const inputname = document.querySelector("#crear-cat");
    inputname.focus();
    inputname.classList.add("input-error"); // Añade la clase de error
  }
  // Elimina la clase de error al corregir
  const inputname = document.querySelector("#crear-cat");
  inputname.addEventListener("input", () => {
    if (inputname.value.length >= 3) {
      inputname.classList.remove("input-error"); // Quita la clase si el campo es válido
    }
  });

  if (desc_cat.length < 3) {
    errores.push("La descripción debe tener al menos 3 caracteres.");
    const inputdesc = document.querySelector("#crear-desc_cat");
    inputdesc.focus();
    inputdesc.classList.add("input-error"); // Añade la clase de error
  }
  // Elimina la clase de error al corregir
  const inputdesc = document.querySelector("#crear-desc_cat");
  inputdesc.addEventListener("input", () => {
    if (inputdesc.value.length >= 3) {
      inputdesc.classList.remove("input-error"); // Quita la clase si el campo es válido
    }
  });
  //Alerta de validaciones campos vacios categorias
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

  // Verificar duplicados al crear
  verificarDuplicadoCat(cat)
    .then((esDuplicado) => {
      if (esDuplicado) {
        Swal.fire({
          title: "!Error¡",
          text: "El nombre de la Categoría ya existe. Por favor, elige otro.",
          icon: "warning",
          showConfirmButton: false,
          timer: 1500,
          timerProgressBar: true,
        });
      } else {
        // Si no hay errores, enviar el formulario
        procesarFormularioCat(event, "crear");
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
function verificarDuplicadoCat(cat) {
  //console.log("Nombre verificar duplicado:", nombre_cat);

  return fetch("cruds/verificar_nombre_cat.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ cat }),
  })
    .then((response) => response.json())
    .then((data) => {
      //console.log("Respuesta de verificar_nombre.php:", data);
      if (data.existe) {
        //mostrarAlerta("error", "Error", "El nombre de la Categoría ya existe.");
        Swal.fire({
          title: "!Atención¡",
          text: "El nombre de la Categoría ya existe.",
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
//Editar Categorias************************************************
document.addEventListener("DOMContentLoaded", function () {
  // Escuchar clic en el botón de editar
  document.addEventListener("click", function (event) {
    if (event.target.classList.contains("editarCat")) {
      const id = event.target.dataset.id;
      //console.log("Botón editar clickeado. ID:", id);

      fetch(`cruds/obtener_cat.php?id=${id}`)
        .then((response) => response.json())
        .then((data) => {
          //console.log("Datos recibidos del servidor:", data);
          if (data.success) {
            const formularioCat = document.getElementById("form-editarCat");
            if (formularioCat) {
              const campos = ["idcat", "cat", "desc_cat", "estatus"];
              campos.forEach((campo) => {
                //console.log(`Asignando ${campo}:`, data.cat[campo]);
                formularioCat[`editar-${campo}`].value = data.cat[campo] || "";
              });
              abrirModalCat("editar-modalCat");
            } else {
              console.error("Formulario de edición no encontrado.");
            }
          } else {
            mostrarAlerta(
              "error",
              "Error",
              data.message || "No se pudo cargar la Categoría.",
            );
          }
        })
        .catch((error) => {
          console.error("Error al obtener Categoría:", error);
          mostrarAlerta(
            "error",
            "Error",
            "Ocurrió un problema al obtener los datos.",
          );
        });
    }
  });

  // Validar y enviar el formulario de edición
  document.body.addEventListener("submit", function (event) {
    if (event.target && event.target.id === "form-editarCat") {
      event.preventDefault(); // Esto evita el comportamiento predeterminado de recargar la página.
      validarFormularioEdicionCat(event.target);
    }
  });
});

//Verificar dublicado al editar
function verificarDuplicadoEditarCat(cat, id = 0) {
  //console.log("Validando duplicados. ID:", id, "Cat:", cat);

  return fetch("cruds/verificar_nombre_cat.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ cat, id }),
  })
    .then((response) => response.json())
    .then((data) => {
      // console.log("Respuesta de verificar_nombre.php:", data);
      if (data.existe) {
        Swal.fire({
          title: "!Error¡",
          text: data.message || "El nombre de la categoría ya existe.", // Mostrar el mensaje específico si existe
          icon: "warning",
          showConfirmButton: false,
          timer: 1500,
          timerProgressBar: true,
        });
        //mostrarAlerta("error", "Error", "El nombre del Rol ya existe.");
      }
      return data.existe;
    })
    .catch((error) => {
      console.error("Error al verificar duplicado:", error);
      return true; // Asume duplicado en caso de error
    });
}
// Validación del formulario de edición Categoria
async function validarFormularioEdicionCat(formulario) {
  const campos = [
    {
      nombre: "cat",
      min: 3,
      mensaje: "La categoría debe tener al menos 3 caracteres.",
    },
    {
      nombre: "desc_cat",
      min: 3,
      mensaje: "La descripción debe tener al menos 3 caracteres.",
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
  const catInput = document.getElementById("editar-cat");
  const idInput = document.getElementById("editar-idcat");
  if (!catInput || !idInput) {
    console.log("Error: No se encontró el campo de Cat o ID.");
    return;
  }
  const cat = catInput.value.trim();
  const id = idInput.value;

  try {
    //console.log("Verificando duplicado. ID:", id, "Cat:", cat);
    const esDuplicado = await verificarDuplicadoEditarCat(cat, id);
    if (esDuplicado) {
      return; // No enviar el formulario si hay duplicados
    } else {
      enviarFormularioEdicionCat(formulario); // Proceder si no hay duplicados
    }
  } catch (error) {
    console.error("Error al verificar duplicado:", error);
  }
}
// Enviar formulario de edición Cat
function enviarFormularioEdicionCat(formulario) {
  if (!formulario) {
    console.error("El formulario no se encontró.");
    return;
  }
  const formData = new FormData(formulario);

  fetch("cruds/editar_cat.php", {
    method: "POST",
    body: formData,
  })
    .then((response) => response.json())
    .then((data) => {
      //console.log("Respuesta del servidorEdit:", data);
      if (data.success) {
        Swal.fire({
          title: "¡Actualizado!",
          text: data.message, // Usar el mensaje del backend
          icon: "success",
          showConfirmButton: false,
          timer: 1500,
          timerProgressBar: true,
        });
        // Actualizar la fila de la tabla sin recargar
        actualizarFilaTablaCat(formData);
        cerrarModal("editar-modalCat");
      } else {
        Swal.fire({
          title: "Atención",
          text: data.message, // Usar el mensaje del backend no hubo cambios
          icon: "warning",
          showConfirmButton: false,
          timer: 1500,
          timerProgressBar: true,
        });
      }
    })
    .catch((error) => {
      console.error("Error al actualizar Categoría:", error);
      mostrarAlerta(
        "error",
        "Error",
        "Ocurrió un problema al actualizar la Categoría.",
      );
    });
}
// Actualizar fila de la tabla categoria
function actualizarFilaTablaCat(formData) {
  const fila = document
    .querySelector(`button[data-id="${formData.get("editar-idcat")}"]`)
    .closest("tr");
  console.log(formData.get("editar-idcat"));
  if (fila) {
    fila.cells[0].textContent = formData.get("cat");
    fila.cells[1].textContent = formData.get("desc_cat");
    // Determinar clases y texto del botón
    const estatus = formData.get("estatus") === "0" ? "Activo" : "Inactivo";
    const claseBtn =
      formData.get("estatus") === "0" ? "btn btn-success" : "btn btn-danger";

    // Insertar el botón en la celda
    fila.cells[2].innerHTML = `<button class="${claseBtn}">${estatus}</button>`;
    cargarCatFiltradas();
  }
}
// Eliminar Categorias*********************************
document.addEventListener("click", function (event) {
  if (event.target.classList.contains("eliminarCat")) {
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
        fetch(`cruds/eliminar_cat.php?id=${id}`, { method: "POST" })
          .then((response) => response.json())
          .then((data) => {
            if (data.success) {
              //alert("Registro eliminado correctamente");
              Swal.fire({
                title: "¡Eliminada!",
                text: data.message, // Usar el mensaje del backend
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
                "error",
              );
            }
          })
          .catch((error) => {
            Swal.fire(
              "Error",
              "Hubo un problema al procesar tu solicitud.",
              "error",
            );
            console.error("Error al eliminar la tienda:", error);
          });
      }
    });
  }
});

//Buscar en la tabla y filtrar categorias *************************
document.addEventListener("DOMContentLoaded", function () {
  const observarDOM = new MutationObserver(function (mutations) {
    mutations.forEach((mutation) => {
      if (mutation.type === "childList") {
        const buscarBox = document.getElementById("buscarboxcat");
        if (buscarBox) {
          //console.log("Elemento 'buscarboxcat' encontrado dinámicamente");
          agregarEventoBuscarCat(buscarBox);
          observarDOM.disconnect(); // Deja de observar después de encontrarlo
        }
      }
    });
  });

  // Comienza a observar el body del DOM
  observarDOM.observe(document.body, { childList: true, subtree: true });

  // Si el elemento ya existe en el DOM
  const buscarBoxInicial = document.getElementById("buscarboxcat");
  if (buscarBoxInicial) {
    console.log("Elemento 'buscarboxcat' ya existe en el DOM");
    agregarEventoBuscarCat(buscarBoxInicial);
    observarDOM.disconnect(); // No es necesario seguir observando
  }

  // Función para agregar el evento de búsqueda
  function agregarEventoBuscarCat(buscarBox) {
    buscarBox.addEventListener("input", function () {
      const filtro = buscarBox.value.toLowerCase();
      const filas = document.querySelectorAll("#tabla-categorias tbody tr");

      filas.forEach((fila) => {
        const textoFila = fila.textContent.toLowerCase();
        fila.style.display = textoFila.includes(filtro) ? "" : "none";
      });
    });
  }
});

//Limpiar busqueda *****************************
document.addEventListener("DOMContentLoaded", function () {
  // Delegación del evento 'input' en el campo de búsqueda
  document.addEventListener("input", function (event) {
    if (event.target.id === "buscarboxcat") {
      const buscarBox = event.target; // El input dinámico
      const filtro = buscarBox.value.toLowerCase();
      const limpiarBusquedaCat = document.getElementById("limpiar-busquedaCat"); // Botón dinámico
      const filas = document.querySelectorAll("#tabla-categorias tbody tr");
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
    if (event.target.id === "limpiar-busquedaCat") {
      const buscarBox = document.getElementById("buscarboxcat");
      const limpiarBusquedaCat = event.target;

      if (buscarBox) {
        buscarBox.value = ""; // Limpiar el input
        if (limpiarBusquedaCat) {
          limpiarBusquedaCat.style.display = "none"; // Ocultar el botón de limpiar
          document.getElementById("mensaje-vacio").style.display = "none";
        }
      }

      const filas = document.querySelectorAll("#tabla-categorias tbody tr");
      filas.forEach((fila) => {
        fila.style.display = ""; // Mostrar todas las filas
      });
    }
  });
});

//Función para filtrar categorias desde el servidor ******************************
function cargarCatFiltradas() {
  const estatusFiltro = document
    .getElementById("estatusFiltroCat")
    .value.trim()
    .toLowerCase();

  if (!estatusFiltro) {
    cargarCategorias(); // Si el usuario selecciona "Todos", cargamos las primeras 10 tiendas normales
    return;
  }
  //console.log("Cargando categorias filtrados del servidor:", estatusFiltro);

  fetch(`cruds/cargar_categorias.php?estatus=${estatusFiltro}`)
    .then((response) => response.json())
    .then((data) => {
      // console.log("Filtrados: ",data);
      actualizarTablaCategorias(data);
    })
    .catch((error) =>
      console.error("Error al cargar categorias filtradas:", error),
    );
}

//Función para actualizar la tabla con las tiendas filtradas
function actualizarTablaCategorias(categorias) {
  let tbody = document.getElementById("categorias-lista");
  tbody.innerHTML = ""; // Limpiar la tabla

  if (categorias.length === 0) {
    tbody.innerHTML = `<tr><td colspan='7' style='text-align: center; color: red;'>No se encontraron categorias</td></tr>`;
    return;
  }
  //LIMPIAR LA TABLA antes de agregar nuevas categorias
  tbody.innerHTML = "";

  categorias.forEach((categoria) => {
    const fila = document.createElement("tr");
    fila.innerHTML = `
      <td data-lable="Nombre:">${categoria.nombre_cat}</td>
      <td data-lable="Descripción:">${categoria.desc_cat}</td>

      <td data-lable="Estatus">
        <button class="btn ${
          categoria.estatus == 0 ? "btn-success" : "btn-danger"
        }">
          ${categoria.estatus == 0 ? "Activo" : "Inactivo"}
        </button>
      </td>
      <td data-lable="Editar:">
        <button title="Editar" class="editarCat fa-solid fa-pen-to-square" data-id="${
          categoria.id_categoria
        }"></button>
        </td>
        <td data-lable="Eliminar:">
        <button title="Eliminar" class="eliminarCat fa-solid fa-trash" data-id="${
          categoria.id_categoria
        }"></button>
      </td>
    `;
    tbody.appendChild(fila);
  });
}

//Función para cargar los primeros 10 categorias por defecto
function cargarCategorias() {
  pagina = 2; //Reiniciar la paginación cuando seleccionas "Todos"
  cargando = false; //Asegurar que el scroll pueda volver a activarse

  fetch("cruds/cargar_categorias.php?limit=10&offset=0")
    .then((response) => response.json())
    .then((data) => {
      actualizarTablaCategorias(data);
    })
    .catch((error) => console.error("Error al cargar categorias:", error));
}

/* ---------------- SCROLL INFINITO Categorias----------------------*/

function cargarCategoriasScroll() {
  if (cargando) return;
  cargando = true;

  // Obtener el filtro actual para que el scroll también lo respete
  const estatusFiltroCat = document
    .getElementById("estatusFiltroCat")
    .value.trim()
    .toLowerCase();
  let url = `cruds/cargar_categorias_scroll.php?page=${pagina}`;

  if (estatusFiltroCat !== "") {
    url += `&estatus=${estatusFiltroCat}`; // Enviar el filtro al servidor
  }

  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      if (data.length > 0) {
        const tbody = document.querySelector("#tabla-categorias tbody");
        data.forEach((categoria) => {
          const row = document.createElement("tr");
          row.innerHTML = `
            <td data-lable="Nombre:">${categoria.nombre}</td>
            <td data-lable="Descripción:">${categoria.descripcion}</td>
            
            <td data-lable="Estatus:">
              <button class="btn ${
                categoria.estatus == 0 ? "btn-success" : "btn-danger"
              }">
                ${categoria.estatus == 0 ? "Activo" : "Inactivo"}
              </button>
            </td>
            <td data-lable="Editar">
              <button title="Editar" class="editarCat fa-solid fa-pen-to-square" data-id="${
                categoria.idcategoria
              }"></button>
            </td>
        <td data-lable="Eliminar">
        <button title="Eliminar" class="eliminarCat fa-solid fa-trash" data-id="${
          categoria.idcategoria
        }"></button>
      </td>
          `;
          tbody.appendChild(row);
        });

        pagina++; // Aumentamos la página
        cargando = false;
      } else {
        Swal.fire({
          title: "No hay más Categorías.",
          icon: "info",
          showConfirmButton: false,
          timer: 1500,
          timerProgressBar: true,
        });
      }
    })
    .catch((error) => console.error("Error al cargar Categorías:", error));
}

document.addEventListener("DOMContentLoaded", function () {
  if (window.location.pathname.includes("categorías.php")) {
    pagina = 2; //  Reiniciar paginación
    cargando = false; // Permitir cargar más categorías
    console.log("Reiniciando scroll y cargando categorías en categorías.php");

    //REACTIVAR EL SCROLL INFINITO CUANDO REGRESES A roles.php
    iniciarScrollCategorias();
  }
});

function iniciarScrollCategorias() {
  const scrollContainer = document.getElementById("scroll-containerCat");
  if (!scrollContainer) return;

  scrollContainer.addEventListener("scroll", () => {
    if (
      scrollContainer.scrollTop + scrollContainer.clientHeight >=
        scrollContainer.scrollHeight - 10 &&
      !cargando
    ) {
      //console.log(" Scroll detectado, cargando más Roles...");
      cargarCategoriasScroll();
    }
  });

  //console.log(" Scroll infinito reactivado en roles.php");
}

const observerCategorias = new MutationObserver(() => {
  const categoriasSeccion = document.getElementById("scroll-containerCat");
  if (categoriasSeccion) {
    observerCategorias.disconnect();
    iniciarScrollCategorias();
  }
});

const Categorias = document.getElementById("content-area");
if (Categorias) {
  observerCategorias.observe(Categorias, { childList: true, subtree: true });
}

// Llamar Marcas ********************************************
document
  .getElementById("marcas-link")
  .addEventListener("click", function (event) {
    event.preventDefault(); // Evita la acción por defecto del enlace
    fetch("catalogos/marcas.php")
      .then((response) => response.text())
      .then((html) => {
        document.getElementById("content-area").innerHTML = html;
        cargarMarcasFiltradas();
      })
      .catch((error) => {
        console.error("Error al cargar el contenido:", error);
      });
  });

//Crear Marcas***************************
function abrirModalMarca(id) {
  document.getElementById(id).style.display = "flex";
}

function cerrarModalMarca(id) {
  document.getElementById(id).style.display = "none";
}

function procesarFormularioMarca(event, tipo) {
  event.preventDefault(); //Para que no recergue la pagina
  const formData = new FormData(event.target);

  fetch(`cruds/procesar_${tipo}_marca.php`, {
    method: "POST",
    body: formData,
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        // Cerrar el modal
        cerrarModalMarca(tipo + "-modalMarca");
        // Limpiar los campos del formulario
        event.target.reset();

        // Actualizar la tabla dinámicamente si es 'crear'
        if (tipo === "crear") {
          const tbody = document.querySelector("table tbody");

          // Crear una nueva fila
          const newRow = document.createElement("tr");
          newRow.innerHTML = `
            <td data-lable="Nombre:">${data.marca.nombre}</td>
            <td data-lable="Descripción:">${data.marca.descripcion}</td>
            <td data-lable="Estatus:">
              <button class="btn ${
                data.marca.estatus == 0 ? "btn-success" : "btn-danger"
              }">
              ${data.marca.estatus == 0 ? "Activo" : "Inactivo"}
              </button>
            </td>
            <td data-lable="Editar:">
              <button title="Editar" class="editarMarca fa-solid fa-pen-to-square" data-id="${
                data.marca.id
              }"></button>
              </td>
              <td data-lable="Eliminar:">
              <button title="Eliminar" class="eliminarMarca fa-solid fa-trash" data-id="${
                data.marca.id
              }"></button>
            </td>
          `;

          // Agregar la nueva fila a la tabla
          tbody.appendChild(newRow);
        }

        // Mostrar un mensaje de éxito
        Swal.fire({
          title: "¡Éxito!",
          text: data.message, // Usar el mensaje del backend
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
function validarFormularioMarca(event) {
  event.preventDefault();

  const marca = document.querySelector("[name='marca']").value.trim();
  const desc_marca = document.querySelector("[name='desc_marca']").value.trim();

  const errores = [];

  if (marca.length < 2) {
    errores.push("El nombre debe tener al menos 2 caracteres.");
    const inputname = document.querySelector("#crear-marca");
    inputname.focus();
    inputname.classList.add("input-error"); // Añade la clase de error
  }
  // Elimina la clase de error al corregir
  const inputname = document.querySelector("#crear-marca");
  inputname.addEventListener("input", () => {
    if (inputname.value.length >= 3) {
      inputname.classList.remove("input-error"); // Quita la clase si el campo es válido
    }
  });

  if (desc_marca.length < 3) {
    errores.push("La descripción debe tener al menos 3 caracteres.");
    const inputdesc = document.querySelector("#crear-desc_marca");
    inputdesc.focus();
    inputdesc.classList.add("input-error"); // Añade la clase de error
  }
  // Elimina la clase de error al corregir
  const inputdesc = document.querySelector("#crear-desc_marca");
  inputdesc.addEventListener("input", () => {
    if (inputdesc.value.length >= 3) {
      inputdesc.classList.remove("input-error"); // Quita la clase si el campo es válido
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

  // Verificar duplicados
  verificarDuplicadoMarca(marca)
    .then((esDuplicado) => {
      if (esDuplicado) {
        Swal.fire({
          title: "Error",
          text: "El nombre de la marca ya existe. Por favor, elige otro.",
          icon: "warning",
          showConfirmButton: false,
          timer: 1500,
          timerProgressBar: true,
        });
      } else {
        // Si no hay errores, enviar el formulario
        procesarFormularioMarca(event, "crear");
      }
    })
    .catch((error) => {
      console.error("Error al verificar duplicados:", error);
      Swal.fire({
        title: "Error",
        text: "Ocurrió un problema al validar el nombre.",
        icon: "error",
      });
    });
}
function verificarDuplicadoMarca(marca) {
  //console.log("Nombre verificar:", marca);

  return fetch("cruds/verificar_nombre_marca.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ marca }),
  })
    .then((response) => response.json())
    .then((data) => {
      //console.log("Respuesta de verificar_nombre.php:", data);
      if (data.existe) {
        Swal.fire({
          title: "Error",
          text: data.message || "El nombre de la marca ya existe.", // Mostrar el mensaje específico si existe
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
//Editar Marcas ************************************************************
document.addEventListener("DOMContentLoaded", function () {
  // Escuchar clic en el botón de editar
  document.addEventListener("click", function (event) {
    if (event.target.classList.contains("editarMarca")) {
      const id = event.target.dataset.id;
      //console.log("Botón editar clickeado. ID:", id);

      fetch(`cruds/obtener_marca.php?id=${id}`)
        .then((response) => response.json())
        .then((data) => {
          //console.log("Datos recibidos del servidor:", data);
          if (data.success) {
            const formularioMarca = document.getElementById("form-editarMarca");
            if (formularioMarca) {
              const campos = ["idmarca", "marca", "desc_marca", "estatus"];
              campos.forEach((campo) => {
                //console.log(`Asignando ${campo}:`, data.marca[campo]);
                formularioMarca[`editar-${campo}`].value =
                  data.marca[campo] || "";
              });
              abrirModalMarca("editar-modalMarca");
            } else {
              console.error("Formulario de edición no encontrado.");
            }
          } else {
            mostrarAlerta(
              "error",
              "Error",
              data.message || "No se pudo cargar la Marca.",
            );
          }
        })
        .catch((error) => {
          console.error("Error al obtener la Marca:", error);
          mostrarAlerta(
            "error",
            "Error",
            "Ocurrió un problema al obtener los datos.",
          );
        });
    }
  });

  // Validar y enviar el formulario de edición
  document.body.addEventListener("submit", function (event) {
    if (event.target && event.target.id === "form-editarMarca") {
      event.preventDefault(); // Esto evita el comportamiento predeterminado de recargar la página.
      validarFormularioEdicionMarca(event.target);
    }
  });
});

//Validar duplicados en edicion Marca
function verificarDuplicadoEditarMarca(marca, id = 0) {
  //console.log("Validando duplicados. ID:", id, "Marca:", marca);

  return fetch("cruds/verificar_nombre_marca.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ marca, id }),
  })
    .then((response) => response.json())
    .then((data) => {
      //console.log("Respuesta de verificar_nombre.php:", data);
      if (data.existe) {
        Swal.fire({
          title: "Error",
          text: data.message || "El nombre de la marca ya existe.", // Mostrar el mensaje específico si existe
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
// Validación del formulario de edición Marca
async function validarFormularioEdicionMarca(formulario) {
  const campos = [
    {
      nombre: "marca",
      min: 2,
      mensaje: "El nombre debe tener al menos 2 caracteres.",
    },
    {
      nombre: "desc_marca",
      min: 3,
      mensaje: "La descripción debe tener al menos 3 caracteres.",
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
  const marcaInput = document.getElementById("editar-marca");
  const idInput = document.getElementById("editar-idmarca");
  if (!marcaInput || !idInput) {
    console.log("Error: No se encontró el campo de marca o ID.");
    return;
  }
  const marca = marcaInput.value.trim();
  const id = idInput.value;

  try {
    //console.log("Verificando duplicado. ID:", id, "Marca:", marca);
    const esDuplicado = await verificarDuplicadoEditarMarca(marca, id);
    if (esDuplicado) {
      return; // No enviar el formulario si hay duplicados
    } else {
      //cerrarModalMarca("editar-modalMarca");
      enviarFormularioEdicionMarca(formulario); // Proceder si no hay duplicados
    }
  } catch (error) {
    console.error("Error al verificar duplicado:", error);
  }
}
// Enviar formulario de edición Marca
function enviarFormularioEdicionMarca(formulario) {
  if (!formulario) {
    console.error("El formulario no se encontró.");
    return;
  }
  const formData = new FormData(formulario);

  fetch("cruds/editar_marca.php", {
    method: "POST",
    body: formData,
  })
    .then((response) => response.json())
    .then((data) => {
      //console.log("Respuesta del servidorEdit:", data);
      if (data.success) {
        Swal.fire({
          title: "¡Actualizado!",
          text: data.message, // Usar el mensaje del backend
          icon: "success",
          showConfirmButton: false,
          timer: 1500,
          timerProgressBar: true,
        });
        actualizarFilaTablaMarca(formData);
        cerrarModal("editar-modalMarca");
      } else {
        Swal.fire({
          title: "Atención",
          text: data.message, // Usar el mensaje del backend editar sin cambios marca
          icon: "warning",
          showConfirmButton: false,
          timer: 1500,
          timerProgressBar: true,
        });
      }
    })
    .catch((error) => {
      console.error("Error al actualizar la marca:", error);
      mostrarAlerta(
        "error",
        "Error",
        "Ocurrió un problema al actualizar la marca.",
      );
    });
}
// Actualizar fila de la tabla marcas
function actualizarFilaTablaMarca(formData) {
  const fila = document
    .querySelector(`button[data-id="${formData.get("editar-idmarca")}"]`)
    .closest("tr");
  //console.log(formData.get("editar-idmarca"));
  if (fila) {
    fila.cells[0].textContent = formData.get("marca");
    fila.cells[1].textContent = formData.get("desc_marca");
    // Determinar clases y texto del botón
    const estatus = formData.get("estatus") === "0" ? "Activo" : "Inactivo";
    const claseBtn =
      formData.get("estatus") === "0" ? "btn btn-success" : "btn btn-danger";

    // Insertar el botón en la celda
    fila.cells[2].innerHTML = `<button class="${claseBtn}">${estatus}</button>`;
    cargarMarcasFiltradas();
  }
}
// Eliminar Marcas*******************************
document.addEventListener("click", function (event) {
  if (event.target.classList.contains("eliminarMarca")) {
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
        fetch(`cruds/eliminar_marca.php?id=${id}`, { method: "POST" })
          .then((response) => response.json())
          .then((data) => {
            if (data.success) {
              //alert("Registro eliminado correctamente");
              Swal.fire(
                "¡Eliminado!",
                "El registro ha sido eliminado correctamente.",
                "success",
              );
              Swal.fire({
                title: "¡Eliminado!",
                text: "El registro ha sido eliminado correctamente.",
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
                "error",
              );
            }
          })
          .catch((error) => {
            Swal.fire(
              "Error",
              "Hubo un problema al procesar tu solicitud.",
              "error",
            );
            console.error("Error al eliminar la Marca:", error);
          });
      }
    });
  }
});

//Buscar en la tabla y filtrar
document.addEventListener("DOMContentLoaded", function () {
  const observarDOM = new MutationObserver(function (mutations) {
    mutations.forEach((mutation) => {
      if (mutation.type === "childList") {
        const buscarBox = document.getElementById("buscarboxmarca");
        if (buscarBox) {
          //console.log("Elemento 'buscarbox' encontrado dinámicamente");
          agregarEventoBuscarMarca(buscarBox);
          observarDOM.disconnect(); // Deja de observar después de encontrarlo
        }
      }
    });
  });

  // Comienza a observar el body del DOM
  observarDOM.observe(document.body, { childList: true, subtree: true });

  // Si el elemento ya existe en el DOM
  const buscarBoxInicial = document.getElementById("buscarboxmarca");
  if (buscarBoxInicial) {
    console.log("Elemento 'buscarboxmarca' ya existe en el DOM");
    agregarEventoBuscarMarca(buscarBoxInicial);
    observarDOM.disconnect(); // No es necesario seguir observando
  }

  // Función para agregar el evento de búsqueda
  function agregarEventoBuscarMarca(buscarBox) {
    buscarBox.addEventListener("input", function () {
      const filtro = buscarBox.value.toLowerCase();
      const filas = document.querySelectorAll("#tabla-marcas tbody tr");

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
    if (event.target.id === "buscarboxmarca") {
      const buscarBox = event.target; // El input dinámico
      const filtro = buscarBox.value.toLowerCase();
      const limpiarBusquedaMarca = document.getElementById(
        "limpiar-busquedaMarca",
      ); // Botón dinámico
      const filas = document.querySelectorAll("#tabla-marcas tbody tr");
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
    if (event.target.id === "limpiar-busquedaMarca") {
      const buscarBox = document.getElementById("buscarboxmarca");
      const limpiarBusquedaMarca = event.target;

      if (buscarBox) {
        buscarBox.value = ""; // Limpiar el input
        if (limpiarBusquedaMarca) {
          limpiarBusquedaMarca.style.display = "none"; // Ocultar el botón de limpiar
          document.getElementById("mensaje-vacio").style.display = "none";
        }
      }

      const filas = document.querySelectorAll("#tabla-marcas tbody tr");
      filas.forEach((fila) => {
        fila.style.display = ""; // Mostrar todas las filas
      });
    }
  });
});

//Función para filtrar marcas desde el servidor**************************************
function cargarMarcasFiltradas() {
  const estatusFiltro = document
    .getElementById("estatusFiltroMarca")
    .value.trim()
    .toLowerCase();

  if (!estatusFiltro) {
    cargarMarcas(); // Si el usuario selecciona "Todos", cargamos las primeras 10 tiendas normales
    return;
  }
  //console.log("Cargando marcas filtrados del servidor:", estatusFiltro);

  fetch(`cruds/cargar_marcas.php?estatus=${estatusFiltro}`)
    .then((response) => response.json())
    .then((data) => {
      // console.log("Filtrados: ",data);
      actualizarTablaMarcas(data);
    })
    .catch((error) =>
      console.error("Error al cargar marcas filtrados:", error),
    );
}

//Función para actualizar la tabla con las marcas filtradas
function actualizarTablaMarcas(marcas) {
  let tbody = document.getElementById("marcas-lista");
  tbody.innerHTML = ""; // Limpiar la tabla

  if (marcas.length === 0) {
    tbody.innerHTML = `<tr><td colspan='7' style='text-align: center; color: red;'>No se encontraron marcas</td></tr>`;
    return;
  }
  //LIMPIAR LA TABLA antes de agregar nuevos marcas
  tbody.innerHTML = "";

  marcas.forEach((marcas) => {
    const fila = document.createElement("tr");
    fila.innerHTML = `
      <td data-lable="Nombre:">${marcas.nom_marca}</td>
      <td data-lable="Descripción:">${marcas.desc_marca}</td>

      <td data-lable="Estatus">
        <button class="btn ${
          marcas.estatus == 0 ? "btn-success" : "btn-danger"
        }">
          ${marcas.estatus == 0 ? "Activo" : "Inactivo"}
        </button>
      </td>
      <td data-lable="Editar:">
        <button title="Editar" class="editarMarca fa-solid fa-pen-to-square" data-id="${
          marcas.id_marca
        }"></button>
        </td>
        <td data-lable="Eliminar:">
        <button title="Eliminar" class="eliminarMarca fa-solid fa-trash" data-id="${
          marcas.id_marca
        }"></button>
      </td>
    `;
    tbody.appendChild(fila);
  });
}

//Función para cargar los primeros 10 marcas por defecto
function cargarMarcas() {
  pagina = 2; //Reiniciar la paginación cuando seleccionas "Todos"
  cargando = false; //Asegurar que el scroll pueda volver a activarse

  fetch("cruds/cargar_marcas.php?limit=10&offset=0")
    .then((response) => response.json())
    .then((data) => {
      actualizarTablaMarcas(data);
    })
    .catch((error) => console.error("Error al cargar marcas:", error));
}

/* ------------------------ SCROLL INFINITO MARCAS------------------------*/

function cargarMarcasScroll() {
  if (cargando) return;
  cargando = true;

  // Obtener el filtro actual para que el scroll también lo respete
  const estatusFiltroMarca = document
    .getElementById("estatusFiltroMarca")
    .value.trim()
    .toLowerCase();
  let url = `cruds/cargar_marcas_scroll.php?page=${pagina}`;

  if (estatusFiltroMarca !== "") {
    url += `&estatus=${estatusFiltroMarca}`; // Enviar el filtro al servidor
  }

  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      if (data.length > 0) {
        const tbody = document.querySelector("#tabla-marcas tbody");
        data.forEach((rol) => {
          const row = document.createElement("tr");
          row.innerHTML = `
            <td data-lable="Nombre:">${marcas.nombre}</td>
            <td data-lable="Descripción:">${marcas.descripcion}</td>
            
            <td data-lable="Estatus:">
              <button class="btn ${
                marcas.estatus == 0 ? "btn-success" : "btn-danger"
              }">
                ${marcas.estatus == 0 ? "Activo" : "Inactivo"}
              </button>
            </td>
            <td data-lable="Editar">
              <button title="Editar" class="editarMarca fa-solid fa-pen-to-square" data-id="${
                marcas.id_marca
              }"></button>
            </td>
        <td data-lable="Eliminar">
        <button title="Eliminar" class="eliminarMarca fa-solid fa-trash" data-id="${
          rol.id_marca
        }"></button>
      </td>
          `;
          tbody.appendChild(row);
        });

        pagina++; // Aumentamos la página
        cargando = false;
      } else {
        Swal.fire({
          title: "No hay más Marcas.",
          icon: "info",
          showConfirmButton: false,
          timer: 1500,
          timerProgressBar: true,
        });
      }
    })
    .catch((error) => console.error("Error al cargar marcas:", error));
}

document.addEventListener("DOMContentLoaded", function () {
  if (window.location.pathname.includes("marcas.php")) {
    pagina = 2; //  Reiniciar paginación
    cargando = false; // Permitir cargar más marcas
    console.log("Reiniciando scroll y cargando marcas en marcas.php");

    //REACTIVAR EL SCROLL INFINITO CUANDO REGRESES A marcas.php
    iniciarScrollMarcas();
  }
});

function iniciarScrollMarcas() {
  const scrollContainer = document.getElementById("scroll-containerR");
  if (!scrollContainer) return;

  scrollContainer.addEventListener("scroll", () => {
    if (
      scrollContainer.scrollTop + scrollContainer.clientHeight >=
        scrollContainer.scrollHeight - 10 &&
      !cargando
    ) {
      //console.log(" Scroll detectado, cargando más Marcas...");
      cargarMarcasScroll();
    }
  });

  //console.log(" Scroll infinito reactivado en Marcas.php");
}

const observerMarcas = new MutationObserver(() => {
  const marcasSeccion = document.getElementById("scroll-containerR");
  if (marcasSeccion) {
    observerMarcas.disconnect();
    iniciarScrollMarcas();
  }
});

const Marcas = document.getElementById("content-area");
if (Marcas) {
  observerMarcas.observe(Marcas, { childList: true, subtree: true });
}

// Llamar Tipo de servicios *******************************************************
document
  .getElementById("tiposervicios-link")
  .addEventListener("click", function (event) {
    event.preventDefault(); // Evita la acción por defecto del enlace
    fetch("catalogos/tiposervicios.php")
      .then((response) => response.text())
      .then((html) => {
        document.getElementById("content-area").innerHTML = html;
      })
      .catch((error) => {
        console.error("Error al cargar el contenido:", error);
      });
  });

// Crear Tipo de servicios ******************************************
function abrirModalTiposervicios(id) {
  document.getElementById(id).style.display = "flex";
}

function cerrarModalTiposervicios(id) {
  document.getElementById(id).style.display = "none";
}
function procesarFormulariotiposervicios(event, tipo) {
  event.preventDefault(); //Para que no recergue la pagina
  const formData = new FormData(event.target);

  fetch(`cruds/procesar_${tipo}_tiposervicios.php`, {
    method: "POST",
    body: formData,
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        // Cerrar el modal
        cerrarModalTiposervicios(tipo + "-modalTiposervicios");
        // Limpiar los campos del formulario
        event.target.reset();

        // Actualizar la tabla dinámicamente si es 'crear'
        if (tipo === "crear") {
          const tbody = document.querySelector("table tbody");

          // Crear una nueva fila
          const newRow = document.createElement("tr");
          newRow.innerHTML = `
            <td data-lable="Nombre:">${data.tiposervicios.nombre}</td>
            <td data-lable="Descripción:">${data.tiposervicios.descripcion}</td>
            <td data-lable="Estatus:">
              <button class="btn ${
                data.tiposervicios.estatus == 0 ? "btn-success" : "btn-danger"
              }">
              ${data.tiposervicios.estatus == 0 ? "Activo" : "Inactivo"}
              </button>
            </td>
            
            <td data-lable="Editar:">
              <button title="Editar:" class="editarTiposervicio fa-solid fa-pen-to-square" data-id="${
                data.tiposervicios.id
              }"></button>
              </td>
            <td data-lable="Eliminar:">
              <button title="Eliminar:" class="eliminarTiposervicio fa-solid fa-trash" data-id="${
                data.tiposervicios.id
              }"></button>
            </td>
          `;

          // Agregar la nueva fila a la tabla
          tbody.appendChild(newRow);
        }

        // Mostrar un mensaje de éxito
        Swal.fire({
          title: "¡Éxito!",
          text: "La acción se realizó correctamente.",
          icon: "success",
          showConfirmButton: false,
          timer: 1500,
          timerProgressBar: true,
        });
      } else {
        // Mostrar un mensaje de error
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
function validarFormulariotiposervicios(event) {
  event.preventDefault();

  const tiposervicios = document
    .querySelector("[name='tiposervicios']")
    .value.trim();
  const desc_tiposervicios = document
    .querySelector("[name='desc_tiposervicios']")
    .value.trim();

  const errores = [];

  if (tiposervicios.length < 3) {
    errores.push("El nombre debe tener al menos 3 caracteres.");
    const inputname = document.querySelector("#crear-tiposervicios");
    inputname.focus();
    inputname.classList.add("input-error"); // Añade la clase de error
  }
  // Elimina la clase de error al corregir
  const inputname = document.querySelector("#crear-tiposervicios");
  inputname.addEventListener("input", () => {
    if (inputname.value.length >= 3) {
      inputname.classList.remove("input-error"); // Quita la clase si el campo es válido
    }
  });

  if (desc_tiposervicios.length < 3) {
    errores.push("La descripción debe tener al menos 3 caracteres.");
    const inputdesc = document.querySelector("#crear-desc_tiposervicios");
    inputdesc.focus();
    inputdesc.classList.add("input-error"); // Añade la clase de error
  }
  // Elimina la clase de error al corregir
  const inputdesc = document.querySelector("#crear-desc_tiposervicios");
  inputdesc.addEventListener("input", () => {
    if (inputdesc.value.length >= 3) {
      inputdesc.classList.remove("input-error"); // Quita la clase si el campo es válido
    }
  });
  //Alerta de validaciones campos vacios categorias
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

  // Verificar duplicados al crear
  verificarDuplicadotiposervicios(tiposervicios)
    .then((esDuplicado) => {
      if (esDuplicado) {
        Swal.fire({
          title: "!Error¡",
          text: "El nombre de la Tipo de servicio ya existe. Por favor, elige otro.",
          icon: "warning",
          showConfirmButton: false,
          timer: 1500,
          timerProgressBar: true,
        });
      } else {
        // Si no hay errores, enviar el formulario
        procesarFormulariotiposervicios(event, "crear");
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
function verificarDuplicadotiposervicios(tiposervicios) {
  //console.log("Nombre verificar duplicado:", tiposervicios);

  return fetch("cruds/verificar_nombre_tiposervicios.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tiposervicios }),
  })
    .then((response) => response.json())
    .then((data) => {
      //console.log("Respuesta de verificar_nombre.php:", data);
      if (data.existe) {
        //mostrarAlerta("error", "Error", "El nombre de la Tipo de servicio ya existe.");
        Swal.fire({
          title: "!Error¡",
          text: "El nombre del Tipo de servicio ya existe.",
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

//Editar Tipo servicios***********************************************
document.addEventListener("DOMContentLoaded", function () {
  // Escuchar clic en el botón de editar
  document.addEventListener("click", function (event) {
    if (event.target.classList.contains("editarTiposervicio")) {
      const id = event.target.dataset.id;
      //console.log("Botón editar clickeado. ID:", id);

      fetch(`cruds/obtener_tiposervicios.php?id=${id}`)
        .then((response) => response.json())
        .then((data) => {
          //console.log("Datos recibidos del servidor:", data);
          if (data.success) {
            const formularioTiposervicios = document.getElementById(
              "form-editarTiposervicio",
            );
            if (formularioTiposervicios) {
              const campos = [
                "idtiposervicio",
                "tiposervicio",
                "desc_servicio",
                "estatus",
              ];
              campos.forEach((campo) => {
                //console.log(`Asignando ${campo}:`, data.tiposervicios[campo]);
                formularioTiposervicios[`editar-${campo}`].value =
                  data.tiposervicios[campo] || "";
              });
              abrirModalTiposervicios("editar-modalTiposervicio");
            } else {
              console.error("Formulario de edición no encontrado.");
            }
          } else {
            mostrarAlerta(
              "error",
              "Error",
              data.message || "No se pudo cargar el tipo de servicio.",
            );
          }
        })
        .catch((error) => {
          console.error("Error al obtener el Tipo de servicio:", error);
          mostrarAlerta(
            "error",
            "Error",
            "Ocurrió un problema al obtener los datos.",
          );
        });
    }
  });

  // Validar y enviar el formulario de edición
  document.body.addEventListener("submit", function (event) {
    if (event.target && event.target.id === "form-editarTiposervicio") {
      event.preventDefault(); // Esto evita el comportamiento predeterminado de recargar la página.
      validarFormularioEdicionTiposervicio(event.target);
    }
  });
});

//Verificar dublicado al editar
function verificarDuplicadoEditarTiposervicio(tiposervicio, id = 0) {
  //console.log("Validando duplicados. ID:", id, "Tiposervicios:", tiposervicios);

  return fetch("cruds/verificar_nombre_tiposervicios.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tiposervicio, id }),
  })
    .then((response) => response.json())
    .then((data) => {
      //console.log("Respuesta de verificar_nombre.php:", data);
      if (data.existe) {
        Swal.fire({
          title: "!Error¡",
          text: data.message || "El nombre de la tipo servicios ya existe.", // Mostrar el mensaje específico si existe
          icon: "warning",
          showConfirmButton: false,
          timer: 1500,
          timerProgressBar: true,
        });
        //mostrarAlerta("error", "Error", "El nombre del Rol ya existe.");
      }
      return data.existe;
    })
    .catch((error) => {
      console.error("Error al verificar duplicado:", error);
      return true; // Asume duplicado en caso de error
    });
}
// Validación del formulario de edición Categoria
async function validarFormularioEdicionTiposervicio(formulario) {
  const campos = [
    {
      nombre: "tiposervicio",
      min: 3,
      mensaje: "El nombre debe tener al menos 3 caracteres.",
    },
    {
      nombre: "desc_servicio",
      min: 3,
      mensaje: "La descripción debe tener al menos 3 caracteres.",
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
  const catInput = document.getElementById("editar-tiposervicio");
  const idInput = document.getElementById("editar-idtiposervicio");
  if (!catInput || !idInput) {
    console.log("Error: No se encontró el campo de Tiposervicios o ID.");
    return;
  }
  const tiposervicios = catInput.value.trim();
  const id = idInput.value;

  try {
    //console.log("Verificando duplicado. ID:", id, "Tiposervicios:", tiposervicios);
    const esDuplicado = await verificarDuplicadoEditarTiposervicio(
      tiposervicios,
      id,
    );
    if (esDuplicado) {
      return; // No enviar el formulario si hay duplicados
    } else {
      enviarFormularioEdicionTiposervicio(formulario); // Proceder si no hay duplicados
    }
  } catch (error) {
    console.error("Error al verificar duplicado:", error);
  }
}
// Enviar formulario de edición Tiposervicios
function enviarFormularioEdicionTiposervicio(formulario) {
  if (!formulario) {
    console.error("El formulario no se encontró.");
    return;
  }
  const formData = new FormData(formulario);

  fetch("cruds/editar_tiposervicios.php", {
    method: "POST",
    body: formData,
  })
    .then((response) => response.json())
    .then((data) => {
      //console.log("Respuesta del servidorEdit:", data);
      if (data.success) {
        Swal.fire({
          title: "¡Actualizado!",
          text: data.message, // Usar el mensaje del backend
          icon: "success",
          showConfirmButton: false,
          timer: 1500,
          timerProgressBar: true,
        });
        // Actualizar la fila de la tabla sin recargar
        actualizarFilaTablaTiposervicio(formData);
        cerrarModal("editar-modalTiposervicio");
      } else {
        Swal.fire({
          title: "Atención",
          text: data.message, // Usar el mensaje del backend no hubo cambios
          icon: "warning",
          showConfirmButton: false,
          timer: 1500,
          timerProgressBar: true,
        });
      }
    })
    .catch((error) => {
      console.error("Error al actualizar Tipo de servicio:", error);
      mostrarAlerta(
        "error",
        "Error",
        "Ocurrió un problema al actualizar la Tipo de servicio.",
      );
    });
}
// Actualizar fila de la tabla tiposervicios
function actualizarFilaTablaTiposervicio(formData) {
  const fila = document
    .querySelector(`button[data-id="${formData.get("editar-idtiposervicio")}"]`)
    .closest("tr");
  console.log(formData.get("editar-idtiposervicio"));
  if (fila) {
    fila.cells[0].textContent = formData.get("tiposervicio");
    fila.cells[1].textContent = formData.get("desc_servicios");
    // Determinar clases y texto del botón
    const estatus = formData.get("estatus") === "0" ? "Activo" : "Inactivo";
    const claseBtn =
      formData.get("estatus") === "0" ? "btn btn-success" : "btn btn-danger";

    // Insertar el botón en la celda
    fila.cells[2].innerHTML = `<button class="${claseBtn}">${estatus}</button>`;
    cargarTiposerviciosFiltrados();
  }
}
// Eliminar Tipo de servicios*****************
document.addEventListener("click", function (event) {
  if (event.target.classList.contains("eliminarTiposervicio")) {
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
        fetch(`cruds/eliminar_tiposervicio.php?id=${id}`, { method: "POST" })
          .then((response) => response.json())
          .then((data) => {
            if (data.success) {
              //alert("Registro eliminado correctamente");
              Swal.fire({
                title: "¡Eliminado!",
                text: data.message, // Usar el mensaje del backend
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
                "error",
              );
            }
          })
          .catch((error) => {
            Swal.fire(
              "Error",
              "Hubo un problema al procesar tu solicitud.",
              "error",
            );
            console.error("Error al eliminar la tienda:", error);
          });
      }
    });
  }
});

//Buscar en la tabla y filtrar ***************************************
document.addEventListener("DOMContentLoaded", function () {
  const observarDOM = new MutationObserver(function (mutations) {
    mutations.forEach((mutation) => {
      if (mutation.type === "childList") {
        const buscarBox = document.getElementById("buscarboxTiposervicios");
        if (buscarBox) {
          //console.log("Elemento 'buscarbox' encontrado dinámicamente");
          agregarEventoBuscarTiposervicios(buscarBox);
          observarDOM.disconnect(); // Deja de observar después de encontrarlo
        }
      }
    });
  });

  // Comienza a observar el body del DOM
  observarDOM.observe(document.body, { childList: true, subtree: true });

  // Si el elemento ya existe en el DOM
  const buscarBoxInicial = document.getElementById("buscarboxTiposervicios");
  if (buscarBoxInicial) {
    console.log("Elemento 'buscarboxTiposervicios' ya existe en el DOM");
    agregarEventoBuscarTiposervicios(buscarBoxInicial);
    observarDOM.disconnect(); // No es necesario seguir observando
  }

  // Función para agregar el evento de búsqueda
  function agregarEventoBuscarTiposervicios(buscarBox) {
    buscarBox.addEventListener("input", function () {
      const filtro = buscarBox.value.toLowerCase();
      const filas = document.querySelectorAll("#tabla-tiposervicios tbody tr");

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
    if (event.target.id === "buscarboxTiposervicios") {
      const buscarBox = event.target; // El input dinámico
      const filtro = buscarBox.value.toLowerCase();
      const limpiarBusquedaTiposervicio = document.getElementById(
        "limpiar-busquedaTiposervicio",
      ); // Botón dinámico
      const filas = document.querySelectorAll("#tabla-tiposervicios tbody tr");
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
    if (event.target.id === "limpiar-busquedaTiposervicio") {
      const buscarBox = document.getElementById("buscarboxTiposervicios");
      const limpiarBusquedaTiposervicio = event.target;

      if (buscarBox) {
        buscarBox.value = ""; // Limpiar el input
        if (limpiarBusquedaTiposervicio) {
          limpiarBusquedaTiposervicio.style.display = "none"; // Ocultar el botón de limpiar
          document.getElementById("mensaje-vacio").style.display = "none";
        }
      }

      const filas = document.querySelectorAll("#tabla-tiposervicios tbody tr");
      filas.forEach((fila) => {
        fila.style.display = ""; // Mostrar todas las filas
      });
    }
  });
});

//Función para filtrar tipo servicios desde el servidor**************************************
function cargarTiposerviciosFiltrados() {
  const estatusFiltro = document
    .getElementById("estatusFiltroTiposervicios")
    .value.trim()
    .toLowerCase();

  if (!estatusFiltro) {
    cargarTiposervicios(); // Si el usuario selecciona "Todos", cargamos las primeras 10 tiendas normales
    return;
  }
  //console.log("Cargando tipo servicios filtrados del servidor:", estatusFiltro);

  fetch(`cruds/cargar_tiposervicios.php?estatus=${estatusFiltro}`)
    .then((response) => response.json())
    .then((data) => {
      // console.log("Filtrados: ",data);
      actualizarTablaTiposervicios(data);
    })
    .catch((error) =>
      console.error("Error al cargar tipo servicios filtrados:", error),
    );
}

//Función para actualizar la tabla con las tiendas filtradas
function actualizarTablaTiposervicios(tiposervicios) {
  let tbody = document.getElementById("tiposervicios-lista");
  tbody.innerHTML = ""; // Limpiar la tabla

  if (tiposervicios.length === 0) {
    tbody.innerHTML = `<tr><td colspan='7' style='text-align: center; color: red;'>No se encontraron Tiposervicios</td></tr>`;
    return;
  }
  //LIMPIAR LA TABLA antes de agregar nuevos tiposervicios
  tbody.innerHTML = "";

  tiposervicios.forEach((tiposervicio) => {
    const fila = document.createElement("tr");
    fila.innerHTML = `
      <td data-lable="Nombre:">${tiposervicio.nom_servicio}</td>
      <td data-lable="Descripción:">${tiposervicio.desc_servicio}</td>

      <td data-lable="Estatus">
        <button class="btn ${
          tiposervicio.estatus == 0 ? "btn-success" : "btn-danger"
        }">
          ${tiposervicio.estatus == 0 ? "Activo" : "Inactivo"}
        </button>
      </td>
      <td data-lable="Editar:">
        <button title="Editar" class="editarTiposervicio fa-solid fa-pen-to-square" data-id="${
          tiposervicio.id_servicio
        }"></button>
        </td>
        <td data-lable="Eliminar:">
        <button title="Eliminar" class="eliminarTiposervicio fa-solid fa-trash" data-id="${
          tiposervicio.id_servicio
        }"></button>
      </td>
    `;
    tbody.appendChild(fila);
  });
}

//Función para cargar los primeros 10 Tiposervicios por defecto
function cargarTiposervicios() {
  pagina = 2; //Reiniciar la paginación cuando seleccionas "Todos"
  cargando = false; //Asegurar que el scroll pueda volver a activarse

  fetch("cruds/cargar_tiposervicios.php?limit=10&offset=0")
    .then((response) => response.json())
    .then((data) => {
      actualizarTablaTiposervicios(data);
    })
    .catch((error) => console.error("Error al cargar tipo servicios:", error));
}

/* ------------------------ SCROLL INFINITO Tiposervicios------------------------*/

function cargarTiposerviciosScroll() {
  if (cargando) return;
  cargando = true;

  // Obtener el filtro actual para que el scroll también lo respete
  const estatusFiltroTiposervicios = document
    .getElementById("estatusFiltroR")
    .value.trim()
    .toLowerCase();
  let url = `cruds/cargar_tiposervicios_scroll.php?page=${pagina}`;

  if (estatusFiltroTiposervicios !== "") {
    url += `&estatus=${estatusFiltroR}`; // Enviar el filtro al servidor
  }

  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      if (data.length > 0) {
        const tbody = document.querySelector("#tabla-tiposervicios tbody");
        data.forEach((rol) => {
          const row = document.createElement("tr");
          row.innerHTML = `
            <td data-lable="Nombre:">${tiposervicio.nombre}</td>
            <td data-lable="Descripción:">${tiposervicio.descripcion}</td>
            
            <td data-lable="Estatus:">
              <button class="btn ${
                tiposervicio.estatus == 0 ? "btn-success" : "btn-danger"
              }">
                ${tiposervicio.estatus == 0 ? "Activo" : "Inactivo"}
              </button>
            </td>
            <td data-lable="Editar">
              <button title="Editar" class="editarRol fa-solid fa-pen-to-square" data-id="${
                tiposervicio.id_servicio
              }"></button>
            </td>
        <td data-lable="Eliminar">
        <button title="Eliminar" class="eliminarRol fa-solid fa-trash" data-id="${
          rol.id_servicio
        }"></button>
      </td>
          `;
          tbody.appendChild(row);
        });

        pagina++; // Aumentamos la página
        cargando = false;
      } else {
        Swal.fire({
          title: "No hay más Tipo de servicios.",
          icon: "info",
          showConfirmButton: false,
          timer: 1500,
          timerProgressBar: true,
        });
      }
    })
    .catch((error) =>
      console.error("Error al cargar Tipo de servicios:", error),
    );
}

document.addEventListener("DOMContentLoaded", function () {
  if (window.location.pathname.includes("tiposervicios.php")) {
    pagina = 2; //  Reiniciar paginación
    cargando = false; // Permitir cargar más roles
    console.log("Reiniciando scroll y cargando roles en tipo de servicios.php");

    //REACTIVAR EL SCROLL INFINITO CUANDO REGRESES A tipo de servicios.php
    iniciarScrollRoles();
  }
});

function iniciarScrollTiposervicios() {
  const scrollContainer = document.getElementById(
    "scroll-containerTiposervicios",
  );
  if (!scrollContainer) return;

  scrollContainer.addEventListener("scroll", () => {
    if (
      scrollContainer.scrollTop + scrollContainer.clientHeight >=
        scrollContainer.scrollHeight - 10 &&
      !cargando
    ) {
      //console.log(" Scroll detectado, cargando más Tiposervicios...");
      cargarTiposerviciosScroll();
    }
  });

  //console.log(" Scroll infinito reactivado en Tiposervicios.php");
}

const observerTiposervicios = new MutationObserver(() => {
  const tiposerviciosSeccion = document.getElementById(
    "scroll-containerTiposervicios",
  );
  if (tiposerviciosSeccion) {
    observerTiposervicios.disconnect();
    iniciarScrollTiposervicios();
  }
});

const Tiposervicios = document.getElementById("content-area");
if (Tiposervicios) {
  observerTiposervicios.observe(Tiposervicios, {
    childList: true,
    subtree: true,
  });
}

//Llamar estado de servicio
document
  .getElementById("estatusservicios-link")
  .addEventListener("click", function (event) {
    event.preventDefault(); // Evita la acción por defecto del enlace
    fetch("catalogos/estatusservicios.php")
      .then((response) => response.text())
      .then((html) => {
        document.getElementById("content-area").innerHTML = html;
      })
      .catch((error) => {
        console.error("Error al cargar el contenido:", error);
      });
  });

// Crear Estado de servicios ******************************************
function abrirModalEstadoservicio(id) {
  document.getElementById(id).style.display = "flex";
}

function cerrarModalEstadoservicio(id) {
  document.getElementById(id).style.display = "none";
}
function procesarFormularioEstadoservicios(event, tipo) {
  event.preventDefault(); //Para que no recergue la pagina
  const formData = new FormData(event.target);

  fetch(`cruds/procesar_${tipo}_estadoservicios.php`, {
    method: "POST",
    body: formData,
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        // Cerrar el modal
        cerrarModalEstadoservicio(tipo + "-modalEstadoservicio");
        // Limpiar los campos del formulario
        event.target.reset();

        // Actualizar la tabla dinámicamente si es 'crear'
        if (tipo === "crear") {
          const tbody = document.querySelector("table tbody");

          // Crear una nueva fila
          const newRow = document.createElement("tr");
          newRow.innerHTML = `
            <td data-lable="Nombre:">${data.estadoservicio.nombre}</td>
            <td data-lable="Descripción:">${
              data.estadoservicio.descripcion
            }</td>
            <td data-lable="Estatus:">
              <button class="btn ${
                data.estadoservicio.estatus == 0 ? "btn-success" : "btn-danger"
              }">
              ${data.estadoservicio.estatus == 0 ? "Activo" : "Inactivo"}
              </button>
            </td>
            
            <td data-lable="Editar:">
              <button title="Editar:" class="editarEstadoservicio fa-solid fa-pen-to-square" data-id="${
                data.estadoservicio.id
              }"></button>
              </td>
            <td data-lable="Eliminar:">
              <button title="Eliminar:" class="eliminarEstadoservicio fa-solid fa-trash" data-id="${
                data.estadoservicio.id
              }"></button>
            </td>
          `;

          // Agregar la nueva fila a la tabla
          tbody.appendChild(newRow);
        }

        // Mostrar un mensaje de éxito
        Swal.fire({
          title: "¡Éxito!",
          text: "La acción se realizó correctamente.",
          icon: "success",
          showConfirmButton: false,
          timer: 1500,
          timerProgressBar: true,
        });
      } else {
        // Mostrar un mensaje de error
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
function validarFormularioEstadoservicio(event) {
  event.preventDefault();

  const estadoservicio = document
    .querySelector("[name='estadoservicio']")
    .value.trim();
  const desc_estadoservicio = document
    .querySelector("[name='desc_estadoservicio']")
    .value.trim();

  const errores = [];

  if (estadoservicio.length < 3) {
    errores.push("El nombre debe tener al menos 3 caracteres.");
    const inputname = document.querySelector("#crear-estadoservicio");
    inputname.focus();
    inputname.classList.add("input-error"); // Añade la clase de error
  }
  // Elimina la clase de error al corregir
  const inputname = document.querySelector("#crear-estadoservicio");
  inputname.addEventListener("input", () => {
    if (inputname.value.length >= 3) {
      inputname.classList.remove("input-error"); // Quita la clase si el campo es válido
    }
  });

  if (desc_estadoservicio.length < 3) {
    errores.push("La descripción debe tener al menos 3 caracteres.");
    const inputdesc = document.querySelector("#crear-desc_estadoservicio");
    inputdesc.focus();
    inputdesc.classList.add("input-error"); // Añade la clase de error
  }
  // Elimina la clase de error al corregir
  const inputdesc = document.querySelector("#crear-desc_estadoservicio");
  inputdesc.addEventListener("input", () => {
    if (inputdesc.value.length >= 3) {
      inputdesc.classList.remove("input-error"); // Quita la clase si el campo es válido
    }
  });
  //Alerta de validaciones campos vacios categorias
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

  // Verificar duplicados al crear
  verificarDuplicadoEstadoservicios(estadoservicio)
    .then((esDuplicado) => {
      if (esDuplicado) {
        Swal.fire({
          title: "!Error¡",
          text: "El nombre del Estado de servicio ya existe. Por favor, elige otro.",
          icon: "warning",
          showConfirmButton: false,
          timer: 1500,
          timerProgressBar: true,
        });
      } else {
        // Si no hay errores, enviar el formulario
        procesarFormularioEstadoservicios(event, "crear");
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
function verificarDuplicadoEstadoservicios(estadoservicio) {
  //console.log("Nombre verificar duplicado:", estadoservicio);

  return fetch("cruds/verificar_nombre_estadoservicios.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ estadoservicio }),
  })
    .then((response) => response.json())
    .then((data) => {
      //console.log("Respuesta de verificar_nombre.php:", data);
      if (data.existe) {
        //mostrarAlerta("error", "Error", "El nombre de la Tipo de servicio ya existe.");
        Swal.fire({
          title: "!Error¡",
          text: "El nombre del Estado de servicio ya existe.",
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

//Editar Estado servicios***********************************************
document.addEventListener("DOMContentLoaded", function () {
  // Escuchar clic en el botón de editar
  document.addEventListener("click", function (event) {
    if (event.target.classList.contains("editarEstadoservicio")) {
      const id = event.target.dataset.id;
      //console.log("Botón editar clickeado. ID:", id);

      fetch(`cruds/obtener_estadoservicios.php?id=${id}`)
        .then((response) => response.json())
        .then((data) => {
          //console.log("Datos recibidos del servidor:", data);
          if (data.success) {
            const formularioEstadoservicios = document.getElementById(
              "form-editarEstadoservicio",
            );
            if (formularioEstadoservicios) {
              const campos = [
                "idestadoservicio",
                "estadoservicio",
                "desc_servicio",
                "estatus",
              ];
              campos.forEach((campo) => {
                //console.log(`Asignando ${campo}:`, data.estadoservicios[campo]);
                formularioEstadoservicios[`editar-${campo}`].value =
                  data.estadoservicios[campo] || "";
              });
              abrirModalEstadoservicio("editar-modalEstadoservicio");
            } else {
              console.error("Formulario de edición no encontrado.");
            }
          } else {
            mostrarAlerta(
              "error",
              "Error",
              data.message || "No se pudo cargar el Estado de servicio.",
            );
          }
        })
        .catch((error) => {
          console.error("Error al obtener el Estado de servicio:", error);
          mostrarAlerta(
            "error",
            "Error",
            "Ocurrió un problema al obtener los datos.",
          );
        });
    }
  });

  // Validar y enviar el formulario de edición
  document.body.addEventListener("submit", function (event) {
    if (event.target && event.target.id === "form-editarEstadoservicio") {
      event.preventDefault(); // Esto evita el comportamiento predeterminado de recargar la página.
      validarFormularioEdicionEstadoservicio(event.target);
    }
  });
});

//Verificar dublicado al editar
function verificarDuplicadoEditarEstadoservicio(estadoservicio, id = 0) {
  //console.log("Validando duplicados. ID:", id, "Estadoservicios:", Estadoservicios);

  return fetch("cruds/verificar_nombre_estadoservicios.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ estadoservicio, id }),
  })
    .then((response) => response.json())
    .then((data) => {
      //console.log("Respuesta de verificar_nombre.php:", data);
      if (data.existe) {
        Swal.fire({
          title: "!Error¡",
          text: data.message || "El nombre del estado de servicios ya existe.", // Mostrar el mensaje específico si existe
          icon: "warning",
          showConfirmButton: false,
          timer: 1500,
          timerProgressBar: true,
        });
        //mostrarAlerta("error", "Error", "El nombre del Rol ya existe.");
      }
      return data.existe;
    })
    .catch((error) => {
      console.error("Error al verificar duplicado:", error);
      return true; // Asume duplicado en caso de error
    });
}
// Validación del formulario de edición Estado de servicio
async function validarFormularioEdicionEstadoservicio(formulario) {
  const campos = [
    {
      nombre: "estadoservicio",
      min: 3,
      mensaje: "El nombre debe tener al menos 3 caracteres.",
    },
    {
      nombre: "desc_servicio",
      min: 3,
      mensaje: "La descripción debe tener al menos 3 caracteres.",
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
  const catInput = document.getElementById("editar-estadoservicio");
  const idInput = document.getElementById("editar-idestadoservicio");
  if (!catInput || !idInput) {
    console.log("Error: No se encontró el campo de Estadoservicios o ID.");
    return;
  }
  const Estadoservicios = catInput.value.trim();
  const id = idInput.value;

  try {
    //console.log("Verificando duplicado. ID:", id, "Estadoservicios:", Estadoservicios);
    const esDuplicado = await verificarDuplicadoEditarEstadoservicio(
      Estadoservicios,
      id,
    );
    if (esDuplicado) {
      return; // No enviar el formulario si hay duplicados
    } else {
      enviarFormularioEdicionEstadoservicio(formulario); // Proceder si no hay duplicados
    }
  } catch (error) {
    console.error("Error al verificar duplicado:", error);
  }
}
// Enviar formulario de edición Estadoservicios
function enviarFormularioEdicionEstadoservicio(formulario) {
  if (!formulario) {
    console.error("El formulario no se encontró.");
    return;
  }
  const formData = new FormData(formulario);

  fetch("cruds/editar_estadosservicios.php", {
    method: "POST",
    body: formData,
  })
    .then((response) => response.json())
    .then((data) => {
      //console.log("Respuesta del servidorEdit:", data);
      if (data.success) {
        Swal.fire({
          title: "¡Actualizado!",
          text: data.message, // Usar el mensaje del backend
          icon: "success",
          showConfirmButton: false,
          timer: 1500,
          timerProgressBar: true,
        });
        // Actualizar la fila de la tabla sin recargar
        actualizarFilaTablaEstadoservicio(formData);
        cerrarModal("editar-modalEstadoservicio");
      } else {
        Swal.fire({
          title: "Atención",
          text: data.message, // Usar el mensaje del backend no hubo cambios
          icon: "warning",
          showConfirmButton: false,
          timer: 1500,
          timerProgressBar: true,
        });
      }
    })
    .catch((error) => {
      console.error("Error al actualizar Estado de servicio:", error);
      mostrarAlerta(
        "error",
        "Error",
        "Ocurrió un problema al actualizar la Estado de servicio.",
      );
    });
}
// Actualizar fila de la tabla Estadoservicios
function actualizarFilaTablaEstadoservicio(formData) {
  const fila = document
    .querySelector(
      `button[data-id="${formData.get("editar-idestadoservicio")}"]`,
    )
    .closest("tr");
  console.log(formData.get("editar-idestadoservicio"));
  if (fila) {
    fila.cells[0].textContent = formData.get("estadoservicio");
    fila.cells[1].textContent = formData.get("desc_servicio");
    // Determinar clases y texto del botón
    const estatus = formData.get("estatus") === "0" ? "Activo" : "Inactivo";
    const claseBtn =
      formData.get("estatus") === "0" ? "btn btn-success" : "btn btn-danger";

    // Insertar el botón en la celda
    fila.cells[2].innerHTML = `<button class="${claseBtn}">${estatus}</button>`;
    cargarestadoserviciosFiltrados();
  }
}
// Eliminar Estado de servicios*****************
document.addEventListener("click", function (event) {
  if (event.target.classList.contains("eliminarEstadoservicio")) {
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
        fetch(`cruds/eliminar_estadoservicio.php?id=${id}`, { method: "POST" })
          .then((response) => response.json())
          .then((data) => {
            if (data.success) {
              //alert("Registro eliminado correctamente");
              Swal.fire({
                title: "¡Eliminado!",
                text: data.message, // Usar el mensaje del backend
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
                "error",
              );
            }
          })
          .catch((error) => {
            Swal.fire(
              "Error",
              "Hubo un problema al procesar tu solicitud.",
              "error",
            );
            console.error("Error al eliminar la tienda:", error);
          });
      }
    });
  }
});

//Buscar en la tabla y filtrar ***************************************
document.addEventListener("DOMContentLoaded", function () {
  const observarDOM = new MutationObserver(function (mutations) {
    mutations.forEach((mutation) => {
      if (mutation.type === "childList") {
        const buscarBox = document.getElementById("buscarboxEstadoservicios");
        if (buscarBox) {
          //console.log("Elemento 'buscarbox' encontrado dinámicamente");
          agregarEventoBuscarEstadoservicios(buscarBox);
          observarDOM.disconnect(); // Deja de observar después de encontrarlo
        }
      }
    });
  });

  // Comienza a observar el body del DOM
  observarDOM.observe(document.body, { childList: true, subtree: true });

  // Si el elemento ya existe en el DOM
  const buscarBoxInicial = document.getElementById("buscarboxEstadoservicios");
  if (buscarBoxInicial) {
    console.log("Elemento 'buscarboxEstadoservicios' ya existe en el DOM");
    agregarEventoBuscarEstadoservicios(buscarBoxInicial);
    observarDOM.disconnect(); // No es necesario seguir observando
  }

  // Función para agregar el evento de búsqueda
  function agregarEventoBuscarEstadoservicios(buscarBox) {
    buscarBox.addEventListener("input", function () {
      const filtro = buscarBox.value.toLowerCase();
      const filas = document.querySelectorAll("#tabla-estadoservicio tbody tr");

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
    if (event.target.id === "buscarboxEstadoservicios") {
      const buscarBox = event.target; // El input dinámico
      const filtro = buscarBox.value.toLowerCase();
      const limpiarBusquedaEstadoservicio = document.getElementById(
        "limpiar-busquedaEstadoservicio",
      ); // Botón dinámico
      const filas = document.querySelectorAll("#tabla-estadoservicio tbody tr");
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
    if (event.target.id === "limpiar-busquedaEstadoservicio") {
      const buscarBox = document.getElementById("buscarboxEstadoservicios");
      const limpiarBusquedaEstadoservicio = event.target;

      if (buscarBox) {
        buscarBox.value = ""; // Limpiar el input
        if (limpiarBusquedaEstadoservicio) {
          limpiarBusquedaEstadoservicio.style.display = "none"; // Ocultar el botón de limpiar
          document.getElementById("mensaje-vacio").style.display = "none";
        }
      }

      const filas = document.querySelectorAll("#tabla-estadoservicio tbody tr");
      filas.forEach((fila) => {
        fila.style.display = ""; // Mostrar todas las filas
      });
    }
  });
});

//Función para filtrar tipo servicios desde el servidor**************************************
function cargarestadoserviciosFiltrados() {
  const estatusFiltro = document
    .getElementById("estatusFiltroEstadoservicios")
    .value.trim()
    .toLowerCase();

  if (!estatusFiltro) {
    cargarestadoservicios(); // Si el usuario selecciona "Todos", cargamos las primeras 10 tiendas normales
    return;
  }
  //console.log("Cargando tipo servicios filtrados del servidor:", estatusFiltro);

  fetch(`cruds/cargar_estatusservicios.php?estatus=${estatusFiltro}`)
    .then((response) => response.json())
    .then((data) => {
      // console.log("Filtrados: ",data);
      actualizarTablaEstadoservicios(data);
    })
    .catch((error) =>
      console.error("Error al cargar tipo servicios filtrados:", error),
    );
}

//Función para actualizar la tabla con las tiendas filtradas
function actualizarTablaEstadoservicios(estadoservicios) {
  let tbody = document.getElementById("estadoservicios-lista");
  tbody.innerHTML = ""; // Limpiar la tabla

  if (estadoservicios.length === 0) {
    tbody.innerHTML = `<tr><td colspan='7' style='text-align: center; color: red;'>No se encontraron Estado servicios</td></tr>`;
    return;
  }
  //LIMPIAR LA TABLA antes de agregar nuevos estadoservicio
  tbody.innerHTML = "";

  estadoservicios.forEach((estadoservicios) => {
    const fila = document.createElement("tr");
    fila.innerHTML = `
      <td data-lable="Nombre:">${estadoservicios.estado_servicio}</td>
      <td data-lable="Descripción:">${estadoservicios.desc_estado_servicio}</td>

      <td data-lable="Estatus">
        <button class="btn ${
          estadoservicios.estatus == 0 ? "btn-success" : "btn-danger"
        }">
          ${estadoservicios.estatus == 0 ? "Activo" : "Inactivo"}
        </button>
      </td>
      <td data-lable="Editar:">
        <button title="Editar" class="editarEstadoservicio fa-solid fa-pen-to-square" data-id="${
          estadoservicios.id_estado_servicio
        }"></button>
        </td>
        <td data-lable="Eliminar:">
        <button title="Eliminar" class="eliminarEstadoservicio fa-solid fa-trash" data-id="${
          estadoservicios.id_estado_servicio
        }"></button>
      </td>
    `;
    tbody.appendChild(fila);
  });
}

//Función para cargar los primeros 10 Estadoservicios por defecto
function cargarestadoservicios() {
  pagina = 2; //Reiniciar la paginación cuando seleccionas "Todos"
  cargando = false; //Asegurar que el scroll pueda volver a activarse

  fetch("cruds/cargar_estatusservicios.php?limit=10&offset=0")
    .then((response) => response.json())
    .then((data) => {
      actualizarTablaEstadoservicios(data);
    })
    .catch((error) => console.error("Error al cargar tipo servicios:", error));
}

/* ----------------- SCROLL INFINITO Estado de servicios------------------------*/

function cargarestadoserviciosScroll() {
  if (cargando) return;
  cargando = true;

  // Obtener el filtro actual para que el scroll también lo respete
  const estatusFiltroEstadoservicios = document
    .getElementById("estatusFiltroEstadoservicios")
    .value.trim()
    .toLowerCase();
  let url = `cruds/cargar_estadosservicios_scroll.php?page=${pagina}`;

  if (estatusFiltroEstadoservicios !== "") {
    url += `&estatus=${estatusFiltroEstadoservicios}`; // Enviar el filtro al servidor
  }

  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      if (data.length > 0) {
        const tbody = document.querySelector("#tabla-estadoservicio tbody");
        data.forEach((rol) => {
          const row = document.createElement("tr");
          row.innerHTML = `
            <td data-lable="Nombre:">${estadosservicios.estado_servicio}</td>
            <td data-lable="Descripción:">${estadosservicios.descripcion}</td>
            
            <td data-lable="Estatus:">
              <button class="btn ${
                estadosservicios.estatus == 0 ? "btn-success" : "btn-danger"
              }">
                ${estadosservicios.estatus == 0 ? "Activo" : "Inactivo"}
              </button>
            </td>
            <td data-lable="Editar">
              <button title="Editar" class="editarEstadoservicio fa-solid fa-pen-to-square" data-id="${
                estadosservicios.id_estado_servicio
              }"></button>
            </td>
        <td data-lable="Eliminar">
        <button title="Eliminar" class="eliminarEstadoservicio fa-solid fa-trash" data-id="${
          estadosservicios.id_estado_servicio
        }"></button>
      </td>
          `;
          tbody.appendChild(row);
        });

        pagina++; // Aumentamos la página
        cargando = false;
      } else {
        Swal.fire({
          title: "No hay más Estado de servicios.",
          icon: "info",
          showConfirmButton: false,
          timer: 1500,
          timerProgressBar: true,
        });
      }
    })
    .catch((error) =>
      console.error("Error al cargar Estado de servicios:", error),
    );
}

document.addEventListener("DOMContentLoaded", function () {
  if (window.location.pathname.includes("estadoservicios.php")) {
    pagina = 2; //  Reiniciar paginación
    cargando = false; // Permitir cargar más roles
    console.log("Reiniciando scroll y cargando roles en tipo de servicios.php");

    //REACTIVAR EL SCROLL INFINITO CUANDO REGRESES A tipo de servicios.php
    iniciarScrollEstadoservicios();
  }
});

function iniciarScrollEstadoservicios() {
  const scrollContainer = document.getElementById(
    "scroll-containerEstadoservicios",
  );
  if (!scrollContainer) return;

  scrollContainer.addEventListener("scroll", () => {
    if (
      scrollContainer.scrollTop + scrollContainer.clientHeight >=
        scrollContainer.scrollHeight - 10 &&
      !cargando
    ) {
      //console.log(" Scroll detectado, cargando más Estadoservicios...");
      cargarestadoserviciosScroll();
    }
  });

  //console.log(" Scroll infinito reactivado en Estadoservicios.php");
}

const observerEstadoservicios = new MutationObserver(() => {
  const EstadoserviciosSeccion = document.getElementById(
    "scroll-containerEstadoservicios",
  );
  if (EstadoserviciosSeccion) {
    observerEstadoservicios.disconnect();
    iniciarScrollEstadoservicios();
  }
});

const Estadoservicios = document.getElementById("content-area");
if (Estadoservicios) {
  observerEstadoservicios.observe(Estadoservicios, {
    childList: true,
    subtree: true,
  });
}

// Llamar Metodos de pago *****************************************************
document
  .getElementById("mpagos-link")
  .addEventListener("click", function (event) {
    event.preventDefault(); // Evita la acción por defecto del enlace
    fetch("catalogos/mpagos.php")
      .then((response) => response.text())
      .then((html) => {
        document.getElementById("content-area").innerHTML = html;
        cargarMpagosFiltrados();
      })
      .catch((error) => {
        console.error("Error al cargar el contenido:", error);
      });
  });

//Crear Métodos de pagos ****************************
function abrirModalMpago(id) {
  document.getElementById(id).style.display = "flex";
}

function cerrarModalMpago(id) {
  document.getElementById(id).style.display = "none";
}

function procesarFormularioMpago(event, tipo) {
  event.preventDefault(); //Para que no recergue la pagina
  const formData = new FormData(event.target);

  fetch(`cruds/procesar_${tipo}_mpago.php`, {
    method: "POST",
    body: formData,
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        // Cerrar el modal
        cerrarModalMpago(tipo + "-modalMpago");
        // Limpiar los campos del formulario
        event.target.reset();

        // Actualizar la tabla dinámicamente si es 'crear'
        if (tipo === "crear") {
          const tbody = document.querySelector("table tbody");

          // Crear una nueva fila
          const newRow = document.createElement("tr");
          newRow.innerHTML = `
            <td data-lable="Nombre:">${data.mpago.nombre}</td>
            <td data-lable="Descripción:">${data.mpago.descripcion}</td>
            <td data-lable="Estatus:">
              <button class="btn ${
                data.mpago.estatus == 0 ? "btn-success" : "btn-danger"
              }">
              ${data.mpago.estatus == 0 ? "Activo" : "Inactivo"}
              </button>
            </td>
            <td data-lable="Editar:">
              <button title="Editar" class="editarMpago fa-solid fa-pen-to-square" data-id="${
                data.mpago.id
              }"></button>
              </td>
              <td data-lable="Eliminar:">
              <button title="Eliminar" class="eliminarMpago fa-solid fa-trash" data-id="${
                data.mpago.id
              }"></button>
            </td>
          `;

          // Agregar la nueva fila a la tabla
          tbody.appendChild(newRow);
        }

        // Mostrar un mensaje de éxito
        Swal.fire({
          title: "¡Éxito!",
          text: data.message, // Usar el mensaje del backend
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
function validarFormularioMpago(event) {
  event.preventDefault();

  const mpago = document.querySelector("[name='mpago']").value.trim();
  const desc_mpago = document.querySelector("[name='desc_mpago']").value.trim();

  const errores = [];

  if (mpago.length < 3) {
    errores.push("El nombre debe tener al menos 3 caracteres.");
    const inputname = document.querySelector("#crear-mpago");
    inputname.focus();
    inputname.classList.add("input-error"); // Añade la clase de error
  }
  // Elimina la clase de error al corregir
  const inputname = document.querySelector("#crear-mpago");
  inputname.addEventListener("input", () => {
    if (inputname.value.length >= 3) {
      inputname.classList.remove("input-error"); // Quita la clase si el campo es válido
    }
  });

  if (desc_mpago.length < 3) {
    errores.push("La descripción debe tener al menos 3 caracteres.");
    const inputdesc = document.querySelector("#crear-desc_mpago");
    inputdesc.focus();
    inputdesc.classList.add("input-error"); // Añade la clase de error
  }
  // Elimina la clase de error al corregir
  const inputdesc = document.querySelector("#crear-desc_mpago");
  inputdesc.addEventListener("input", () => {
    if (inputdesc.value.length >= 3) {
      inputdesc.classList.remove("input-error"); // Quita la clase si el campo es válido
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

  // Verificar duplicados
  verificarDuplicadoMpago(mpago)
    .then((esDuplicado) => {
      if (esDuplicado) {
        Swal.fire({
          title: "Error",
          text: "El nombre ya existe. Por favor, elige otro.",
          icon: "error",
          showConfirmButton: false,
          timer: 1500,
          timerProgressBar: true,
        });
      } else {
        // Si no hay errores, enviar el formulario
        procesarFormularioMpago(event, "crear");
      }
    })
    .catch((error) => {
      console.error("Error al verificar duplicados:", error);
      Swal.fire({
        title: "Error",
        text: "Ocurrió un problema al validar el nombre.",
        icon: "error",
      });
    });
}
function verificarDuplicadoMpago(mpago) {
  //console.log("Nombre verificar:", mpago);

  return fetch("cruds/verificar_nombre_mpago.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mpago }),
  })
    .then((response) => response.json())
    .then((data) => {
      //console.log("Respuesta de verificar_nombre.php:", data);
      if (data.existe) {
        Swal.fire({
          title: "Error",
          text: data.message || "El nombre de ya existe.", // Mostrar el mensaje específico si existe
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
//Editar Metodos de pago ******************************************************
document.addEventListener("DOMContentLoaded", function () {
  // Escuchar clic en el botón de editar
  document.addEventListener("click", function (event) {
    if (event.target.classList.contains("editarMpago")) {
      const id = event.target.dataset.id;
      //console.log("Botón editar clickeado. ID:", id);

      fetch(`cruds/obtener_mpago.php?id=${id}`)
        .then((response) => response.json())
        .then((data) => {
          //console.log("Datos recibidos del servidor:", data);
          if (data.success) {
            const formularioMpago = document.getElementById("form-editarMpago");
            if (formularioMpago) {
              const campos = ["idmpago", "mpago", "desc_mpago", "estatus"];
              campos.forEach((campo) => {
                //  console.log(`Asignando ${campo}:`, data.mpago[campo]);
                formularioMpago[`editar-${campo}`].value =
                  data.mpago[campo] || "";
              });
              abrirModalMpago("editar-modalMpago");
            } else {
              console.error("Formulario de edición no encontrado.");
            }
          } else {
            mostrarAlerta(
              "error",
              "Error",
              data.message || "No se pudo cargar el campo.",
            );
          }
        })
        .catch((error) => {
          console.error("Error al obtener el campo:", error);
          mostrarAlerta(
            "error",
            "Error",
            "Ocurrió un problema al obtener los datos.",
          );
        });
    }
  });

  // Validar y enviar el formulario de edición
  document.body.addEventListener("submit", function (event) {
    if (event.target && event.target.id === "form-editarMpago") {
      event.preventDefault(); // Esto evita el comportamiento predeterminado de recargar la página.
      validarFormularioEdicionMpago(event.target);
    }
  });
});

//Validar duplicados en edicion mpago
function verificarDuplicadoEditarMpago(mpago, id = 0) {
  //console.log("Validando duplicados. ID:", id, "Mpago:", mpago);

  return fetch("cruds/verificar_nombre_mpago.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mpago, id }),
  })
    .then((response) => response.json())
    .then((data) => {
      //console.log("Respuesta de verificar_nombre.php:", data);
      if (data.existe) {
        Swal.fire({
          title: "Error",
          text: data.message || "El nombre del método de pago ya existe.", // Mostrar el mensaje específico si existe
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
// Validación del formulario de edición Mpago
async function validarFormularioEdicionMpago(formulario) {
  const campos = [
    {
      nombre: "mpago",
      min: 3,
      mensaje: "El nombre debe tener al menos 3 caracteres.",
    },
    {
      nombre: "desc_mpago",
      min: 3,
      mensaje: "La descripción debe tener al menos 3 caracteres.",
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
  const mpagoInput = document.getElementById("editar-mpago");
  const idInput = document.getElementById("editar-idmpago");
  if (!mpagoInput || !idInput) {
    console.log("Error: No se encontró el campo o ID.");
    return;
  }
  const mpago = mpagoInput.value.trim();
  const id = idInput.value;

  try {
    //console.log("Verificando duplicado. ID:", id, "Mpago:", mpago);
    const esDuplicado = await verificarDuplicadoEditarMpago(mpago, id);
    if (esDuplicado) {
      return; // No enviar el formulario si hay duplicados
    } else {
      //cerrarModalMpago("editar-modalMpago");
      enviarFormularioEdicionMpago(formulario); // Proceder si no hay duplicados
    }
  } catch (error) {
    console.error("Error al verificar duplicado:", error);
  }
}
// Enviar formulario de edición Mpago
function enviarFormularioEdicionMpago(formulario) {
  if (!formulario) {
    console.error("El formulario no se encontró.");
    return;
  }
  const formData = new FormData(formulario);

  fetch("cruds/editar_mpago.php", {
    method: "POST",
    body: formData,
  })
    .then((response) => response.json())
    .then((data) => {
      //console.log("Respuesta del servidorEdit:", data);
      if (data.success) {
        Swal.fire({
          title: "Actualizado",
          text: data.message || "Sé realizaron cambios.", // Mostrar el mensaje específico si existe
          icon: "success",
          showConfirmButton: false,
          timer: 1500,
          timerProgressBar: true,
        });
        actualizarFilaTablaMpago(formData);
        cerrarModal("editar-modalMpago");
      } else {
        Swal.fire({
          title: "Atención",
          text: data.message || "No se realizaron cambios.", // Mostrar el mensaje específico si existe
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
function actualizarFilaTablaMpago(formData) {
  const fila = document
    .querySelector(`button[data-id="${formData.get("editar-idmpago")}"]`)
    .closest("tr");
  //console.log(formData.get("editar-idmpago"));
  if (fila) {
    fila.cells[0].textContent = formData.get("mpago");
    fila.cells[1].textContent = formData.get("desc_mpago");

    // Determinar clases y texto del botón
    const estatus = formData.get("estatus") === "0" ? "Activo" : "Inactivo";
    const claseBtn =
      formData.get("estatus") === "0" ? "btn btn-success" : "btn btn-danger";

    // Insertar el botón en la celda
    fila.cells[2].innerHTML = `<button class="${claseBtn}">${estatus}</button>`;
    cargarMpagosFiltrados();
  }
}
// Eliminar Método de pagos*****************************
document.addEventListener("click", function (event) {
  if (event.target.classList.contains("eliminarMpago")) {
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
        fetch(`cruds/eliminar_mpago.php?id=${id}`, { method: "POST" })
          .then((response) => response.json())
          .then((data) => {
            if (data.success) {
              //alert("Registro eliminado correctamente");
              Swal.fire({
                title: "Eliminado",
                text:
                  data.message || "El registro se ha eliminado correctamente.", // Mostrar el mensaje específico si existe
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
                "error",
              );
            }
          })
          .catch((error) => {
            Swal.fire(
              "Error",
              "Hubo un problema al procesar tu solicitud.",
              "error",
            );
            console.error("Error al eliminar:", error);
          });
      }
    });
  }
});

//Buscar en la tabla y filtrar
document.addEventListener("DOMContentLoaded", function () {
  const observarDOM = new MutationObserver(function (mutations) {
    mutations.forEach((mutation) => {
      if (mutation.type === "childList") {
        const buscarBox = document.getElementById("buscarboxmpago");
        if (buscarBox) {
          //console.log("Elemento 'buscarbox' encontrado dinámicamente");
          agregarEventoBuscarMpago(buscarBox);
          observarDOM.disconnect(); // Deja de observar después de encontrarlo
        }
      }
    });
  });

  // Comienza a observar el body del DOM
  observarDOM.observe(document.body, { childList: true, subtree: true });

  // Si el elemento ya existe en el DOM
  const buscarBoxInicial = document.getElementById("buscarboxmpago");
  if (buscarBoxInicial) {
    console.log("Elemento 'buscarboxmpago' ya existe en el DOM");
    agregarEventoBuscarMpago(buscarBoxInicial);
    observarDOM.disconnect(); // No es necesario seguir observando
  }

  // Función para agregar el evento de búsqueda
  function agregarEventoBuscarMpago(buscarBox) {
    buscarBox.addEventListener("input", function () {
      const filtro = buscarBox.value.toLowerCase();
      const filas = document.querySelectorAll("#tabla-mpagos tbody tr");

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
    if (event.target.id === "buscarboxmpago") {
      const buscarBox = event.target; // El input dinámico
      const filtro = buscarBox.value.toLowerCase();
      const limpiarBusquedaMpago = document.getElementById(
        "limpiar-busquedaMpago",
      ); // Botón dinámico
      const filas = document.querySelectorAll("#tabla-mpagos tbody tr");
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
    if (event.target.id === "limpiar-busquedaMpago") {
      const buscarBox = document.getElementById("buscarboxmpago");
      const limpiarBusquedaMpago = event.target;

      if (buscarBox) {
        buscarBox.value = ""; // Limpiar el input
        if (limpiarBusquedaMpago) {
          limpiarBusquedaMpago.style.display = "none"; // Ocultar el botón de limpiar
          document.getElementById("mensaje-vacio").style.display = "none";
        }
      }

      const filas = document.querySelectorAll("#tabla-mpagos tbody tr");
      filas.forEach((fila) => {
        fila.style.display = ""; // Mostrar todas las filas
      });
    }
  });
});
//Función para filtrar metodos de pago desde el servidor *******************************
function cargarMpagosFiltrados() {
  const estatusFiltro = document
    .getElementById("estatusFiltroMpago")
    .value.trim()
    .toLowerCase();

  if (!estatusFiltro) {
    cargarMpagos(); // Si el usuario selecciona "Todos", cargamos las primeras 10 normales
    return;
  }
  //console.log("Cargando mpags filtrados del servidor:", estatusFiltroMpago);

  fetch(`cruds/cargar_mpagos.php?estatus=${estatusFiltro}`)
    .then((response) => response.json())
    .then((data) => {
      //console.log("Filtrados: ",data);
      actualizarTablaMpagos(data);
    })
    .catch((error) =>
      console.error("Error al cargar métodos de pago filtrados:", error),
    );
}

//Función para actualizar la tabla con las métodos filtradas
function actualizarTablaMpagos(metodos) {
  let tbody = document.getElementById("mpagos-lista");
  tbody.innerHTML = ""; // Limpiar la tabla

  if (mpagos.length === 0) {
    tbody.innerHTML = `<tr><td colspan='7' style='text-align: center; color: red;'>No se encontraron métodos de pago</td></tr>`;
    return;
  }
  //LIMPIAR LA TABLA antes de agregar nuevos métodos
  tbody.innerHTML = "";

  metodos.forEach((mpagos) => {
    const fila = document.createElement("tr");
    fila.innerHTML = `
      <td data-lable="Nombre:">${mpagos.nombre_metpago}</td>
      <td data-lable="Descripción:">${mpagos.desc_metpago}</td>

      <td data-lable="Estatus">
        <button class="btn ${
          mpagos.estatus == 0 ? "btn-success" : "btn-danger"
        }">
          ${mpagos.estatus == 0 ? "Activo" : "Inactivo"}
        </button>
      </td>
      <td data-lable="Editar:">
        <button title="Editar" class="editarMpago fa-solid fa-pen-to-square" data-id="${
          mpagos.id_metpago
        }"></button>
        </td>
        <td data-lable="Eliminar:">
        <button title="Eliminar" class="eliminarMpago fa-solid fa-trash" data-id="${
          mpagos.id_metpago
        }"></button>
      </td>
    `;
    tbody.appendChild(fila);
  });
}

//Función para cargar los primeros 10 marcas por defecto
function cargarMpagos() {
  pagina = 2; //Reiniciar la paginación cuando seleccionas "Todos"
  cargando = false; //Asegurar que el scroll pueda volver a activarse

  fetch("cruds/cargar_mpagos.php?limit=10&offset=0")
    .then((response) => response.json())
    .then((data) => {
      actualizarTablaMpagos(data);
    })
    .catch((error) => console.error("Error al cargar métodos de pago:", error));
}

/* ------------------------ SCROLL INFINITO Mpagos------------------------*/

function cargarMpagosScroll() {
  if (cargando) return;
  cargando = true;

  // Obtener el filtro actual para que el scroll también lo respete
  const estatusFiltroMpago = document
    .getElementById("estatusFiltroMpago")
    .value.trim()
    .toLowerCase();
  let url = `cruds/cargar_mpagos_scroll.php?page=${pagina}`;

  if (estatusFiltroMpago !== "") {
    url += `&estatus=${estatusFiltroMpago}`; // Enviar el filtro al servidor
  }

  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      if (data.length > 0) {
        const tbody = document.querySelector("#tabla-mpagos tbody");
        data.forEach((rol) => {
          const row = document.createElement("tr");
          row.innerHTML = `
            <td data-lable="Nombre:">${mpagos.nombre}</td>
            <td data-lable="Descripción:">${mpagos.descripcion}</td>
            
            <td data-lable="Estatus:">
              <button class="btn ${
                mpagos.estatus == 0 ? "btn-success" : "btn-danger"
              }">
                ${mpagos.estatus == 0 ? "Activo" : "Inactivo"}
              </button>
            </td>
            <td data-lable="Editar">
              <button title="Editar" class="editarMpago fa-solid fa-pen-to-square" data-id="${
                mpagos.id_mpago
              }"></button>
            </td>
        <td data-lable="Eliminar">
        <button title="Eliminar" class="eliminarMpago fa-solid fa-trash" data-id="${
          rol.id_mpago
        }"></button>
      </td>
          `;
          tbody.appendChild(row);
        });

        pagina++; // Aumentamos la página
        cargando = false;
      } else {
        Swal.fire({
          title: "No hay más Métodos de pago.",
          icon: "info",
          showConfirmButton: false,
          timer: 1500,
          timerProgressBar: true,
        });
      }
    })
    .catch((error) => console.error("Error al cargar marcas:", error));
}

document.addEventListener("DOMContentLoaded", function () {
  if (window.location.pathname.includes("mpagos.php")) {
    pagina = 2; //  Reiniciar paginación
    cargando = false; // Permitir cargar más métodos de pago
    console.log("Reiniciando scroll y cargando métodos de pago en marcas.php");

    //REACTIVAR EL SCROLL INFINITO CUANDO REGRESES A métodos de pago mpagos.php
    iniciarScrollRoles();
  }
});

function iniciarScrollMpagos() {
  const scrollContainer = document.getElementById("scroll-containerMpag");
  if (!scrollContainer) return;

  scrollContainer.addEventListener("scroll", () => {
    if (
      scrollContainer.scrollTop + scrollContainer.clientHeight >=
        scrollContainer.scrollHeight - 10 &&
      !cargando
    ) {
      //console.log(" Scroll detectado, cargando más Marcas...");
      cargarMpagosScroll();
    }
  });

  //console.log(" Scroll infinito reactivado en Marcas.php");
}

const observerMpagos = new MutationObserver(() => {
  const containerMpag = document.getElementById("scroll-containerMpag");
  if (containerMpag) {
    observerMpagos.disconnect();
    iniciarScrollMpagos();
  }
});

const Mpagos = document.getElementById("content-area");
if (Mpagos) {
  observerMpagos.observe(Mpagos, { childList: true, subtree: true });
}

// Llamar Impuestos***************************************************
document
  .getElementById("impuestos-link")
  .addEventListener("click", function (event) {
    event.preventDefault(); // Evita la acción por defecto del enlace
    fetch("catalogos/impuestos.php")
      .then((response) => response.text())
      .then((html) => {
        document.getElementById("content-area").innerHTML = html;
        //cargarMarcasFiltradas();
      })
      .catch((error) => {
        console.error("Error al cargar el contenido:", error);
      });
  });

//Crear Impuestos ***************************************
function abrirModalImpuesto(id) {
  document.getElementById(id).style.display = "flex";
}

function cerrarModalImpuesto(id) {
  document.getElementById(id).style.display = "none";
}

function procesarFormularioImpuesto(event, tipo) {
  event.preventDefault(); //Para que no recergue la pagina
  const formData = new FormData(event.target);

  fetch(`cruds/procesar_${tipo}_impuesto.php`, {
    method: "POST",
    body: formData,
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        // Cerrar el modal
        cerrarModalImpuesto(tipo + "-modalImpuesto");
        // Limpiar los campos del formulario
        event.target.reset();

        // Actualizar la tabla dinámicamente si es 'crear'
        if (tipo === "crear") {
          const tbody = document.querySelector("table tbody");

          // Crear una nueva fila
          const newRow = document.createElement("tr");
          newRow.innerHTML = `
            <td data-lable="Nombre:">${data.impuesto.nombre}</td>
            <td data-lable="Tasa:">${data.impuesto.tasa}</td>
            <td data-lable="Estatus:">
              <button class="btn ${
                data.impuesto.estatus == 0 ? "btn-success" : "btn-danger"
              }">
              ${data.impuesto.estatus == 0 ? "Activo" : "Inactivo"}
              </button>
            </td>
            <td data-lable="Editar:">
              <button title="Editar" class="editarImpuesto fa-solid fa-pen-to-square" data-id="${
                data.impuesto.id
              }"></button>
              </td>
              <td data-lable="Eliminar:">
              <button title="Eliminar" class="eliminarImpuesto fa-solid fa-trash" data-id="${
                data.impuesto.id
              }"></button>
            </td>
          `;

          // Agregar la nueva fila a la tabla
          tbody.appendChild(newRow);
        }

        // Mostrar un mensaje de éxito
        Swal.fire({
          title: "¡Éxito!",
          text: data.message, // Usar el mensaje del backend
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
function validarFormularioImpuesto(event) {
  event.preventDefault();

  const impuesto = document.querySelector("[name='impuesto']").value.trim();
  const tasa = document.querySelector("[name='tasa']").value.trim();

  const errores = [];

  if (impuesto.length < 3) {
    errores.push("El nombre debe tener al menos 3 caracteres.");
    const inputname = document.querySelector("#crear-impuesto");
    inputname.focus();
    inputname.classList.add("input-error"); // Añade la clase de error
  }
  // Elimina la clase de error al corregir
  const inputname = document.querySelector("#crear-impuesto");
  inputname.addEventListener("input", () => {
    if (inputname.value.length >= 3) {
      inputname.classList.remove("input-error"); // Quita la clase si el campo es válido
    }
  });

  if (tasa.length < 1) {
    errores.push("La tasa debe tener al menos 1 carácter.");
    const inputdesc = document.querySelector("#crear-tasa");
    inputdesc.focus();
    inputdesc.classList.add("input-error"); // Añade la clase de error
  }
  // Elimina la clase de error al corregir
  const inputdesc = document.querySelector("#crear-tasa");
  inputdesc.addEventListener("input", () => {
    if (inputdesc.value.length >= 1) {
      inputdesc.classList.remove("input-error"); // Quita la clase si el campo es válido
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

  // Verificar duplicados
  verificarDuplicadoImpuesto(impuesto)
    .then((esDuplicado) => {
      if (esDuplicado) {
        Swal.fire({
          title: "Atención",
          text: "El nombre ya existe. Por favor, elige otro.",
          icon: "warning",
          showConfirmButton: false,
          timer: 1500,
          timerProgressBar: true,
        });
      } else {
        // Si no hay errores, enviar el formulario
        procesarFormularioImpuesto(event, "crear");
      }
    })
    .catch((error) => {
      console.error("Error al verificar duplicados:", error);
      Swal.fire({
        title: "Error",
        text: "Ocurrió un problema al validar el nombre.",
        icon: "error",
      });
    });
}
function verificarDuplicadoImpuesto(impuesto) {
  //console.log("Nombre verificar:", impuesto);

  return fetch("cruds/verificar_nombre_impuesto.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ impuesto }),
  })
    .then((response) => response.json())
    .then((data) => {
      //console.log("Respuesta de verificar_nombre.php:", data);
      if (data.existe) {
        Swal.fire({
          title: "Error",
          text: data.message || "El nombre del impuesto ya existe.", // Mostrar el mensaje específico si existe
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
//Editar Impuestos************************************************************
document.addEventListener("DOMContentLoaded", function () {
  // Escuchar clic en el botón de editar
  document.addEventListener("click", function (event) {
    if (event.target.classList.contains("editarImpuesto")) {
      const id = event.target.dataset.id;
      //console.log("Botón editar clickeado. ID:", id);

      fetch(`cruds/obtener_impuesto.php?id=${id}`)
        .then((response) => response.json())
        .then((data) => {
          //console.log("Datos recibidos del servidor:", data);
          if (data.success) {
            const formularioImpuesto = document.getElementById(
              "form-editarImpuesto",
            );
            if (formularioImpuesto) {
              const campos = ["idimpuesto", "impuesto", "tasa", "estatus"];
              campos.forEach((campo) => {
                //console.log(`Asignando ${campo}:`, data.impuesto[campo]);
                formularioImpuesto[`editar-${campo}`].value =
                  data.impuesto[campo] || "";
              });
              abrirModalImpuesto("editar-modalImpuesto");
            } else {
              console.error("Formulario de edición no encontrado.");
            }
          } else {
            mostrarAlerta(
              "error",
              "Error",
              data.message || "No se pudo cargar el campo.",
            );
          }
        })
        .catch((error) => {
          console.error("Error al obtener el campo:", error);
          mostrarAlerta(
            "error",
            "Error",
            "Ocurrió un problema al obtener los datos.",
          );
        });
    }
  });

  // Validar y enviar el formulario de edición
  document.body.addEventListener("submit", function (event) {
    if (event.target && event.target.id === "form-editarImpuesto") {
      event.preventDefault(); // Esto evita el comportamiento predeterminado de recargar la página.
      validarFormularioEdicionImpuesto(event.target);
    }
  });
});

//Validar duplicados en edicion impuesto
function verificarDuplicadoEditarImpuesto(impuesto, id = 0) {
  //console.log("Validando duplicados. ID:", id, "Impuesto:", impuesto);

  return fetch("cruds/verificar_nombre_impuesto.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ impuesto, id }),
  })
    .then((response) => response.json())
    .then((data) => {
      //console.log("Respuesta de verificar_nombre.php:", data);
      if (data.existe) {
        Swal.fire({
          title: "Atención",
          text: data.message || "El nombre del ya existe.", // Mostrar el mensaje específico si existe
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
// Validación del formulario de edición Impuesto
async function validarFormularioEdicionImpuesto(formulario) {
  const campos = [
    {
      nombre: "impuesto",
      min: 3,
      mensaje: "El nombre debe tener al menos 3 caracteres.",
    },
    {
      nombre: "tasa",
      min: 1,
      mensaje: "La tasa debe tener al menos 1 carácter.",
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
      icon: "error",
    });
    if (primerError) primerError.focus(); // Enfocar el primer campo con error
    return;
  }

  // Verificar duplicado antes de enviar el formulario
  const impuestoInput = document.getElementById("editar-impuesto");
  const idInput = document.getElementById("editar-idimpuesto");
  if (!impuestoInput || !idInput) {
    console.log("Error: No se encontró el campo o ID.");
    return;
  }
  const impuesto = impuestoInput.value.trim();
  const id = idInput.value;

  try {
    //console.log("Verificando duplicado. ID:", id, "Impuesto:", impuesto);
    const esDuplicado = await verificarDuplicadoEditarImpuesto(impuesto, id);
    if (esDuplicado) {
      return; // No enviar el formulario si hay duplicados
    } else {
      //cerrarModalImpuesto("editar-modalImpuesto");
      enviarFormularioEdicionImpuesto(formulario); // Proceder si no hay duplicados
    }
  } catch (error) {
    console.error("Error al verificar duplicado:", error);
  }
}
// Enviar formulario de edición Impuesto
function enviarFormularioEdicionImpuesto(formulario) {
  if (!formulario) {
    console.error("El formulario no se encontró.");
    return;
  }
  const formData = new FormData(formulario);

  fetch("cruds/editar_impuesto.php", {
    method: "POST",
    body: formData,
  })
    .then((response) => response.json())
    .then((data) => {
      //console.log("Respuesta del servidorEdit:", data);
      if (data.success) {
        Swal.fire({
          title: "Actualizado",
          text: data.message || "Se actualizo correctamente.", // Mostrar el mensaje específico si existe
          icon: "success",
          showConfirmButton: false,
          timer: 1500,
          timerProgressBar: true,
        });
        actualizarFilaTablaImpuesto(formData);
        cerrarModal("editar-modalImpuesto");
      } else {
        Swal.fire({
          title: "Atención",
          text: data.message || "No se ha actualizdo.", // Mostrar el mensaje específico si existe
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
function actualizarFilaTablaImpuesto(formData) {
  const fila = document
    .querySelector(`button[data-id="${formData.get("editar-idimpuesto")}"]`)
    .closest("tr");
  //console.log(formData.get("editar-idimpuesto"));
  if (fila) {
    fila.cells[0].textContent = formData.get("impuesto");
    fila.cells[1].textContent = formData.get("tasa");

    // Determinar clases y texto del botón
    const estatus = formData.get("estatus") === "0" ? "Activo" : "Inactivo";
    const claseBtn =
      formData.get("estatus") === "0" ? "btn btn-success" : "btn btn-danger";

    // Insertar el botón en la celda
    fila.cells[2].innerHTML = `<button class="${claseBtn}">${estatus}</button>`;
    cargarImpuestosFiltrados();
  }
}
// Eliminar Impuestos*****************************
document.addEventListener("click", function (event) {
  if (event.target.classList.contains("eliminarImpuesto")) {
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
        fetch(`cruds/eliminar_impuesto.php?id=${id}`, { method: "POST" })
          .then((response) => response.json())
          .then((data) => {
            if (data.success) {
              //alert("Registro eliminado correctamente");
              Swal.fire({
                title: "Eliminado",
                text: data.message || "El registro se ha eliminado.",
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
                "error",
              );
            }
          })
          .catch((error) => {
            Swal.fire(
              "Error",
              "Hubo un problema al procesar tu solicitud.",
              "error",
            );
            console.error("Error al eliminar:", error);
          });
      }
    });
  }
});

//Buscar en la tabla y filtrar
document.addEventListener("DOMContentLoaded", function () {
  const observarDOM = new MutationObserver(function (mutations) {
    mutations.forEach((mutation) => {
      if (mutation.type === "childList") {
        const buscarBox = document.getElementById("buscarboximpuesto");
        if (buscarBox) {
          //console.log("Elemento 'buscarbox' encontrado dinámicamente");
          agregarEventoBuscarImpuesto(buscarBox);
          observarDOM.disconnect(); // Deja de observar después de encontrarlo
        }
      }
    });
  });

  // Comienza a observar el body del DOM
  observarDOM.observe(document.body, { childList: true, subtree: true });

  // Si el elemento ya existe en el DOM
  const buscarBoxInicial = document.getElementById("buscarboximpuesto");
  if (buscarBoxInicial) {
    console.log("Elemento 'buscarboximpuesto' ya existe en el DOM");
    agregarEventoBuscarImpuesto(buscarBoxInicial);
    observarDOM.disconnect(); // No es necesario seguir observando
  }

  // Función para agregar el evento de búsqueda
  function agregarEventoBuscarImpuesto(buscarBox) {
    buscarBox.addEventListener("input", function () {
      const filtro = buscarBox.value.toLowerCase();
      const filas = document.querySelectorAll("#tabla-impuestos tbody tr");

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
    if (event.target.id === "buscarboximpuesto") {
      const buscarBox = event.target; // El input dinámico
      const filtro = buscarBox.value.toLowerCase();
      const limpiarBusquedaImpuesto = document.getElementById(
        "limpiar-busquedaImpuesto",
      ); // Botón dinámico
      const filas = document.querySelectorAll("#tabla-impuestos tbody tr");
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
    if (event.target.id === "limpiar-busquedaImpuesto") {
      const buscarBox = document.getElementById("buscarboximpuesto");
      const limpiarBusquedaImpuesto = event.target;

      if (buscarBox) {
        buscarBox.value = ""; // Limpiar el input
        if (limpiarBusquedaImpuesto) {
          limpiarBusquedaImpuesto.style.display = "none"; // Ocultar el botón de limpiar
          document.getElementById("mensaje-vacio").style.display = "none";
        }
      }

      const filas = document.querySelectorAll("#tabla-impuestos tbody tr");
      filas.forEach((fila) => {
        fila.style.display = ""; // Mostrar todas las filas
      });
    }
  });
});

//Función para filtrar Impuestos desde el servidor *********************************
function cargarImpuestosFiltrados() {
  const estatusFiltro = document
    .getElementById("estatusFiltroImpuesto")
    .value.trim()
    .toLowerCase();

  if (!estatusFiltro) {
    cargarImpuestos(); // Si el usuario selecciona "Todos", cargamos las primeras 10 tiendas normales
    return;
  }
  //console.log("Cargando impuestos filtrados del servidor:", estatusFiltro);

  fetch(`cruds/cargar_impuestos.php?estatus=${estatusFiltro}`)
    .then((response) => response.json())
    .then((data) => {
      // console.log("Filtrados: ",data);
      actualizarTablaImpuestos(data);
    })
    .catch((error) =>
      console.error("Error al cargar impuestos filtrados:", error),
    );
}

//Función para actualizar la tabla con las impuestos filtradas
function actualizarTablaImpuestos(impuestos) {
  let tbody = document.getElementById("impuestos-lista");
  tbody.innerHTML = ""; // Limpiar la tabla

  if (impuestos.length === 0) {
    tbody.innerHTML = `<tr><td colspan='7' style='text-align: center; color: red;'>No se encontraron impuestos</td></tr>`;
    return;
  }
  //LIMPIAR LA TABLA antes de agregar nuevos impuestos
  tbody.innerHTML = "";

  impuestos.forEach((impuestos) => {
    const fila = document.createElement("tr");
    fila.innerHTML = `
      <td data-lable="Nombre:">${impuestos.nomimpuesto}</td>
      <td data-lable="Descripción:">${impuestos.tasa}</td>

      <td data-lable="Estatus">
        <button class="btn ${
          impuestos.estatus == 0 ? "btn-success" : "btn-danger"
        }">
          ${impuestos.estatus == 0 ? "Activo" : "Inactivo"}
        </button>
      </td>
      <td data-lable="Editar:">
        <button title="Editar" class="editarImpuesto fa-solid fa-pen-to-square" data-id="${
          impuestos.idimpuesto
        }"></button>
        </td>
        <td data-lable="Eliminar:">
        <button title="Eliminar" class="eliminarImpuesto fa-solid fa-trash" data-id="${
          impuestos.idimpuesto
        }"></button>
      </td>
    `;
    tbody.appendChild(fila);
  });
}

//Función para cargar los primeros 10 impuestos defecto
function cargarImpuestos() {
  pagina = 2; //Reiniciar la paginación cuando seleccionas "Todos"
  cargando = false; //Asegurar que el scroll pueda volver a activarse

  fetch("cruds/cargar_impuestos.php?limit=10&offset=0")
    .then((response) => response.json())
    .then((data) => {
      actualizarTablaImpuestos(data);
    })
    .catch((error) => console.error("Error al cargar Impuestos:", error));
}

/* ------------------------ SCROLL INFINITO impuestos -------------------*/

function cargarImpuestosScroll() {
  if (cargando) return;
  cargando = true;

  // Obtener el filtro actual para que el scroll también lo respete
  const estatusFiltroImpuesto = document
    .getElementById("estatusFiltroImpuesto")
    .value.trim()
    .toLowerCase();
  let url = `cruds/cargar_impuestos_scroll.php?page=${pagina}`;

  if (estatusFiltroImpuesto !== "") {
    url += `&estatus=${estatusFiltroImpuesto}`; // Enviar el filtro al servidor
  }

  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      if (data.length > 0) {
        const tbody = document.querySelector("#tabla-impuestos tbody");
        data.forEach((impuesto) => {
          const row = document.createElement("tr");
          row.innerHTML = `
            <td data-lable="Nombre:">${impuesto.nombre}</td>
            <td data-lable="Descripción:">${impuesto.descripcion}</td>
            
            <td data-lable="Estatus:">
              <button class="btn ${
                impuesto.estatus == 0 ? "btn-success" : "btn-danger"
              }">
                ${impuesto.estatus == 0 ? "Activo" : "Inactivo"}
              </button>
            </td>
            <td data-lable="Editar">
              <button title="Editar" class="editarImpuesto fa-solid fa-pen-to-square" data-id="${
                impuesto.idimpuesto
              }"></button>
            </td>
        <td data-lable="Eliminar">
        <button title="Eliminar" class="eliminarImpuesto fa-solid fa-trash" data-id="${
          impuesto.idimpuesto
        }"></button>
      </td>
          `;
          tbody.appendChild(row);
        });

        pagina++; // Aumentamos la página
        cargando = false;
      } else {
        Swal.fire({
          title: "No hay más Impuestos.",
          icon: "info",
          showConfirmButton: false,
          timer: 1500,
          timerProgressBar: true,
        });
      }
    })
    .catch((error) => console.error("Error al cargar impuestos:", error));
}

document.addEventListener("DOMContentLoaded", function () {
  if (window.location.pathname.includes("impuestos.php")) {
    pagina = 2; //  Reiniciar paginación
    cargando = false; // Permitir cargar más marcas
    console.log("Reiniciando scroll y cargando impuestos en impuestos.php");

    //REACTIVAR EL SCROLL INFINITO CUANDO REGRESES A Impuestos.php
    iniciarScrollImpuestos();
  }
});

function iniciarScrollImpuestos() {
  const scrollContainer = document.getElementById("scroll-containerImp");
  if (!scrollContainer) return;

  scrollContainer.addEventListener("scroll", () => {
    if (
      scrollContainer.scrollTop + scrollContainer.clientHeight >=
        scrollContainer.scrollHeight - 10 &&
      !cargando
    ) {
      //console.log(" Scroll detectado, cargando más Impuestos...");
      cargarImpuestosScroll();
    }
  });

  //console.log(" Scroll infinito reactivado en Impuestos.php");
}

const observerImpuestos = new MutationObserver(() => {
  const impuestosSeccion = document.getElementById("scroll-containerImp");
  if (impuestosSeccion) {
    observerImpuestos.disconnect();
    iniciarScrollImpuestos();
  }
});

const Impuestos = document.getElementById("content-area");
if (Impuestos) {
  observerImpuestos.observe(Impuestos, { childList: true, subtree: true });
}

// Llamar Proveedores *************************************************
document
  .getElementById("proveedores-link")
  .addEventListener("click", function (event) {
    event.preventDefault(); // Evita la acción por defecto del enlace
    fetch("catalogos/proveedores.php")
      .then((response) => response.text())
      .then((html) => {
        document.getElementById("content-area").innerHTML = html;
      })
      .catch((error) => {
        console.error("Error al cargar el contenido:", error);
      });
  });

//Crear Proveedores***********************************
function abrirModalProveedor(id) {
  document.getElementById(id).style.display = "flex";
}

function cerrarModalProveedor(id) {
  document.getElementById(id).style.display = "none";
}

function procesarFormularioProveedor(event, tipo) {
  event.preventDefault(); //Para que no recergue la pagina
  const formData = new FormData(event.target);

  fetch(`cruds/procesar_${tipo}_proveedor.php`, {
    method: "POST",
    body: formData,
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        // Cerrar el modal
        cerrarModalProveedor(tipo + "-modalProveedor");
        // Limpiar los campos del formulario
        event.target.reset();

        // Actualizar la tabla dinámicamente si es 'crear'
        if (tipo === "crear") {
          const tbody = document.querySelector("table tbody");

          // Crear una nueva fila
          const newRow = document.createElement("tr");
          newRow.innerHTML = `
            <td>${data.proveedor.proveedor}</td>
            <td>${data.proveedor.contacto}</td>
            <td>${data.proveedor.telefono}</td>
            <td>${data.proveedor.email}</td>
            <td data-lable="Estatus:">
              <button class="btn ${
                data.proveedor.estatus == 0 ? "btn-success" : "btn-danger"
              }">
              ${data.proveedor.estatus == 0 ? "Activo" : "Inactivo"}
              </button>
            </td>
             <td>
              <button title="Editar" class="editarProveedor fa-solid fa-pen-to-square" data-id="${
                data.proveedor.id
              }"></button>
              </td>
              <td>
              <button title="Eliminar" class="eliminarProveedor fa-solid fa-trash" data-id="${
                data.proveedor.id
              }"></button>
            </td>
          `;

          // Agregar la nueva fila a la tabla
          tbody.appendChild(newRow);
        }

        // Mostrar un mensaje de éxito
        Swal.fire({
          title: "¡Éxito!",
          text: data.message, // Usar el mensaje del backend
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
function validarFormularioProveedor(event) {
  event.preventDefault();

  const proveedor = document.querySelector("[name='proveedor']").value.trim();
  const papellido = document.querySelector("[name='papellido']").value.trim();
  const sapellido = document.querySelector("[name='sapellido']").value.trim();
  const contacto = document.querySelector("[name='contacto']").value.trim();
  const rfc = document.querySelector("[name='rfc']").value.trim();

  const errores = [];

  if (proveedor.length < 3) {
    errores.push("El nombre debe tener al menos 3 caracteres.");
    const inputname = document.querySelector("#crear-proveedor");
    inputname.focus();
    inputname.classList.add("input-error"); // Añade la clase de error
  }
  // Elimina la clase de error al corregir
  const inputname = document.querySelector("#crear-proveedor");
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

  if (contacto.length < 3) {
    errores.push("La empresa debe tener al menos 3 caracteres.");
    const inputcontacto = document.querySelector("#crear-contacto");
    inputcontacto.focus();
    inputcontacto.classList.add("input-error"); // Añade la clase de error
  }
  // Elimina la clase de error al corregir
  const inputcontacto = document.querySelector("#crear-contacto");
  inputcontacto.addEventListener("input", () => {
    if (inputcontacto.value.length >= 3) {
      inputcontacto.classList.remove("input-error"); // Quita la clase si el campo es válido
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

  // Verificar duplicados
  verificarDuplicadoProveedor(proveedor)
    .then((esDuplicado) => {
      if (esDuplicado) {
        Swal.fire({
          title: "Atención",
          text: "El nombre ya existe. Por favor, elige otro.",
          icon: "warning",
          showConfirmButton: false,
          timer: 1500,
          timerProgressBar: true,
        });
      } else {
        // Si no hay errores, enviar el formulario
        procesarFormularioProveedor(event, "crear");
      }
    })
    .catch((error) => {
      console.error("Error al verificar duplicados:", error);
      Swal.fire({
        title: "Error",
        text: "Ocurrió un problema al validar el nombre.",
        icon: "error",
      });
    });
}
function verificarDuplicadoProveedor(proveedor) {
  //console.log("Nombre verificar:", proveedor);

  return fetch("cruds/verificar_nombre_proveedor.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ proveedor }),
  })
    .then((response) => response.json())
    .then((data) => {
      //console.log("Respuesta de verificar_nombre.php:", data);
      if (data.existe) {
        mostrarAlerta("error", "Error", "El nombre ya existe.");
      }
      return data.existe;
    })
    .catch((error) => {
      //console.error("Error al verificar duplicado:", error);
      return true; // Asume duplicado en caso de error
    });
}
//Editar Proveedores************************************************************
document.addEventListener("DOMContentLoaded", function () {
  // Escuchar clic en el botón de editar
  document.addEventListener("click", function (event) {
    if (event.target.classList.contains("editarProveedor")) {
      const id = event.target.dataset.id;
      //console.log("Botón editar clickeado. ID:", id);

      fetch(`cruds/obtener_proveedor.php?id=${id}`)
        .then((response) => response.json())
        .then((data) => {
          //console.log("Datos recibidos del servidor:", data);
          if (data.success) {
            const formularioProveedor = document.getElementById(
              "form-editarProveedor",
            );
            if (formularioProveedor) {
              const campos = [
                "idproveedor",
                "proveedor",
                "papellido",
                "sapellido",
                "contacto",
                "rfc",
                "telefono",
                "email",
                "estatus",
              ];
              //console.log(`Asignando ${campos}:`, data.proveedor[campos]);
              campos.forEach((campo) => {
                const input = formularioProveedor[`editar-${campo}`];
                if (input) {
                  //console.log(`Asignando ${campo}:`, data.proveedor[campo]);
                  input.value = data.proveedor[campo] || "";
                } else {
                  console.warn(
                    `El campo editar-${campo} no existe en el formulario.`,
                  );
                }
              });
              abrirModalProveedor("editar-modalProveedor");
            } else {
              console.error("Formulario de edición no encontrado.");
            }
          } else {
            mostrarAlerta(
              "error",
              "Error",
              data.message || "No se pudo cargar el campo.",
            );
          }
        })
        .catch((error) => {
          console.error("Error al obtener el campo:", error);
          mostrarAlerta(
            "error",
            "Error",
            "Ocurrió un problema al obtener los datos.",
          );
        });
    }
  });

  // Validar y enviar el formulario de edición
  document.body.addEventListener("submit", function (event) {
    if (event.target && event.target.id === "form-editarProveedor") {
      event.preventDefault(); // Esto evita el comportamiento predeterminado de recargar la página.
      validarFormularioEdicionProveedor(event.target);
    }
  });
});

//Validar duplicados en edicion proveedor
function verificarDuplicadoEditarProveedor(proveedor, id = 0) {
  //console.log("Validando duplicados. ID:", id, "Proveedor:", proveedor);

  return fetch("cruds/verificar_nombre_proveedor.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ proveedor, id }),
  })
    .then((response) => response.json())
    .then((data) => {
      //console.log("Respuesta de verificar_nombre.php:", data);
      if (data.existe) {
        mostrarAlerta("error", "Error", "El nombre ya existe.");
      }
      return data.existe;
    })
    .catch((error) => {
      console.error("Error al verificar duplicado:", error);
      return true; // Asume duplicado en caso de error
    });
}
// Validación del formulario de edición Proveedor
async function validarFormularioEdicionProveedor(formulario) {
  const campos = [
    {
      nombre: "proveedor",
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
      nombre: "contacto",
      min: 3,
      mensaje: "La empresa debe tener al menos 3 caracteres.",
    },
    {
      nombre: "rfc",
      min: 12,
      mensaje: "El RFC debe tener al menos 12 caracteres.",
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
      icon: "error",
      showConfirmButton: false,
      timer: 1500,
      timerProgressBar: true,
    });
    if (primerError) primerError.focus(); // Enfocar el primer campo con error
    return;
  }

  // Verificar duplicado antes de enviar el formulario
  const proveedorInput = document.getElementById("editar-proveedor");
  const idInput = document.getElementById("editar-idproveedor");
  if (!proveedorInput || !idInput) {
    console.log("Error: No se encontró el campo o ID.");
    return;
  }
  const proveedor = proveedorInput.value.trim();
  const id = idInput.value;

  try {
    //console.log("Verificando duplicado. ID:", id, "Proveedor:", proveedor);
    const esDuplicado = await verificarDuplicadoEditarProveedor(proveedor, id);
    if (esDuplicado) {
      return; // No enviar el formulario si hay duplicados
    } else {
      //cerrarModalProveedor("editar-modalProveedor");
      enviarFormularioEdicionProveedor(formulario); // Proceder si no hay duplicados
    }
  } catch (error) {
    console.error("Error al verificar duplicado:", error);
  }
}
// Enviar formulario de edición Proveedor
function enviarFormularioEdicionProveedor(formulario) {
  if (!formulario) {
    console.error("El formulario no se encontró.");
    return;
  }
  const formData = new FormData(formulario);

  fetch("cruds/editar_proveedor.php", {
    method: "POST",
    body: formData,
  })
    .then((response) => response.json())
    .then((data) => {
      //console.log("Respuesta del servidorEdit:", data);
      if (data.success) {
        Swal.fire({
          title: "Exito",
          text: data.message || "Registro actualizado correctamente.", // Mostrar el mensaje específico si existe
          icon: "success",
          showConfirmButton: false,
          timer: 1500,
          timerProgressBar: true,
        });

        actualizarFilaTablaProveedor(formData);
        cerrarModal("editar-modalProveedor");
      } else {
        Swal.fire({
          title: "Atención",
          text: data.message || "No se realizaron cambios en el proveedor.", // Mostrar el mensaje específico si existe
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
function actualizarFilaTablaProveedor(formData) {
  const fila = document
    .querySelector(`button[data-id="${formData.get("editar-idproveedor")}"]`)
    .closest("tr");
  //console.log(formData.get("editar-idproveedor"));
  if (fila) {
    fila.cells[0].textContent = formData.get("proveedor");
    fila.cells[1].textContent = formData.get("contacto");
    fila.cells[2].textContent = formData.get("telefono");
    fila.cells[3].textContent = formData.get("email");
    // Determinar clases y texto del botón
    const estatus = formData.get("estatus") === "0" ? "Activo" : "Inactivo";
    const claseBtn =
      formData.get("estatus") === "0" ? "btn btn-success" : "btn btn-danger";

    // Insertar el botón en la celda
    fila.cells[4].innerHTML = `<button class="${claseBtn}">${estatus}</button>`;
  }
}
// Eliminar Proveedores*****************************
document.addEventListener("click", function (event) {
  if (event.target.classList.contains("eliminarProveedor")) {
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
        fetch(`cruds/eliminar_proveedor.php?id=${id}`, { method: "POST" })
          .then((response) => response.json())
          .then((data) => {
            if (data.success) {
              //alert("Registro eliminado correctamente");
              Swal.fire({
                title: "Atención",
                text: data.message || "El registro se ha eliminado.",
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
                "error",
              );
            }
          })
          .catch((error) => {
            Swal.fire(
              "Error",
              "Hubo un problema al procesar tu solicitud.",
              "error",
            );
            console.error("Error al eliminar:", error);
          });
      }
    });
  }
});

//Buscar en la tabla y filtrar
document.addEventListener("DOMContentLoaded", function () {
  const observarDOM = new MutationObserver(function (mutations) {
    mutations.forEach((mutation) => {
      if (mutation.type === "childList") {
        const buscarBox = document.getElementById("buscarboxproveedor");
        if (buscarBox) {
          //console.log("Elemento 'buscarbox' encontrado dinámicamente");
          agregarEventoBuscarProveedor(buscarBox);
          observarDOM.disconnect(); // Deja de observar después de encontrarlo
        }
      }
    });
  });

  // Comienza a observar el body del DOM
  observarDOM.observe(document.body, { childList: true, subtree: true });

  // Si el elemento ya existe en el DOM
  const buscarBoxInicial = document.getElementById("buscarboxproveedor");
  if (buscarBoxInicial) {
    console.log("Elemento 'buscarboxproveedor' ya existe en el DOM");
    agregarEventoBuscarProveedor(buscarBoxInicial);
    observarDOM.disconnect(); // No es necesario seguir observando
  }

  // Función para agregar el evento de búsqueda
  function agregarEventoBuscarProveedor(buscarBox) {
    buscarBox.addEventListener("input", function () {
      const filtro = buscarBox.value.toLowerCase();
      const filas = document.querySelectorAll("#tabla-proveedores tbody tr");

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
    if (event.target.id === "buscarboxproveedor") {
      const buscarBox = event.target; // El input dinámico
      const filtro = buscarBox.value.toLowerCase();
      const limpiarBusquedaCliente = document.getElementById(
        "limpiar-busquedaCliente",
      ); // Botón dinámico
      const filas = document.querySelectorAll("#tabla-proveedores tbody tr");
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
      const buscarBox = document.getElementById("buscarboxproveedor");
      const limpiarBusquedaCliente = event.target;

      if (buscarBox) {
        buscarBox.value = ""; // Limpiar el input
        if (limpiarBusquedaCliente) {
          limpiarBusquedaCliente.style.display = "none"; // Ocultar el botón de limpiar
          document.getElementById("mensaje-vacio").style.display = "none";
        }
      }

      const filas = document.querySelectorAll("#tabla-proveedores tbody tr");
      filas.forEach((fila) => {
        fila.style.display = ""; // Mostrar todas las filas
      });
    }
  });
});

//Función para filtrar Proveedores desde el servidor ******************************
function cargarProvFiltrados() {
  const estatusFiltro = document
    .getElementById("estatusFiltroProv")
    .value.trim()
    .toLowerCase();

  if (!estatusFiltro) {
    cargarProveedores(); // Si el usuario selecciona "Todos", cargamos las primeros 10 proveedores normales
    return;
  }
  //console.log("Cargando Proveedores filtrados del servidor:", estatusFiltro);

  fetch(`cruds/cargar_proveedores.php?estatus=${estatusFiltro}`)
    .then((response) => response.json())
    .then((data) => {
      // console.log("Filtrados: ",data);
      actualizarTablaProveedores(data);
    })
    .catch((error) =>
      console.error("Error al cargar Proveedores filtrados:", error),
    );
}

//Función para actualizar la tabla con los proveedores filtradas
function actualizarTablaProveedores(proveedores) {
  let tbody = document.getElementById("proveedores-lista");
  tbody.innerHTML = ""; // Limpiar la tabla

  if (proveedores.length === 0) {
    tbody.innerHTML = `<tr><td colspan='7' style='text-align: center; color: red;'>No se encontraron proveedores</td></tr>`;
    return;
  }
  //LIMPIAR LA TABLA antes de agregar nuevas proveedores
  tbody.innerHTML = "";

  proveedores.forEach((proveedor) => {
    const fila = document.createElement("tr");
    fila.innerHTML = `
      <td data-lable="Nombre:">${proveedor.nombre_prov}</td>
      <td data-lable="Empresa:">${proveedor.contacto_prov}</td>
      <td data-lable="Teléfono:">${proveedor.tel_prov}</td>
      <td data-lable="Email:">${proveedor.email_prov}</td>

      <td data-lable="Estatus">
        <button class="btn ${
          proveedor.estatus == 0 ? "btn-success" : "btn-danger"
        }">
          ${proveedor.estatus == 0 ? "Activo" : "Inactivo"}
        </button>
      </td>
      <td data-lable="Editar:">
        <button title="Editar" class="editarProveedor fa-solid fa-pen-to-square" data-id="${
          proveedor.id_prov
        }"></button>
        </td>
        <td data-lable="Eliminar:">
        <button title="Eliminar" class="eliminarProveedor fa-solid fa-trash" data-id="${
          proveedor.id_prov
        }"></button>
      </td>
    `;
    tbody.appendChild(fila);
  });
}

//Función para cargar los primeros 10 provedores por defecto
function cargarProveedores() {
  pagina = 2; //Reiniciar la paginación cuando seleccionas "Todos"
  cargando = false; //Asegurar que el scroll pueda volver a activarse

  fetch("cruds/cargar_proveedores.php?limit=10&offset=0")
    .then((response) => response.json())
    .then((data) => {
      actualizarTablaProveedores(data);
    })
    .catch((error) => console.error("Error al cargar proveedores:", error));
}

// Llamar Ordenes de servicio *************************************************
// 1. CARGA DE MÓDULOS (AJAX)
document.getElementById("ordenes-link").addEventListener("click", function (event) {
    event.preventDefault();
    fetch("catalogos/ordenes.php")
      .then((response) => response.text())
      .then((html) => {
        document.getElementById("content-area").innerHTML = html;
      })
      .catch((error) => console.error("Error al cargar contenido:", error));
});


// 2. BUSCADOR DE CLIENTES (AUTOCOMPLETE)
let timeoutBusquedaCliente;

document.addEventListener('input', function(e) {
    if (e.target && e.target.id === 'busqueda-cliente') {
        const inputBusqueda = e.target;
        const termino = inputBusqueda.value.trim();
        const contenedor = inputBusqueda.closest('.autocomplete-container');
        const listaResultados = contenedor.querySelector('.lista-autocomplete');
        
        clearTimeout(timeoutBusquedaCliente);
        listaResultados.innerHTML = '';

        if (termino.length < 2) {
            listaResultados.style.display = 'none';
            return;
        }

        timeoutBusquedaCliente = setTimeout(() => {
            fetch(`cruds/buscar_clientes_select.php?q=${encodeURIComponent(termino)}`)
                .then(res => res.json())
                .then(data => {
                    listaResultados.innerHTML = ''; 
                    
                    if (data.length > 0) {
                        listaResultados.style.display = 'block';
                        data.forEach(cliente => {
                            const li = document.createElement('li');
                            li.style.padding = "10px"; 
                            li.style.cursor = "pointer";
                            li.style.borderBottom = "1px solid #eee";
                            li.textContent = `${cliente.nombre_cliente} ${cliente.papellido_cliente} (${cliente.tel_cliente})`;
                            
                            li.dataset.id = cliente.id_cliente;
                            li.dataset.nombre = `${cliente.nombre_cliente} ${cliente.papellido_cliente}`;
                            
                            listaResultados.appendChild(li);
                        });
                    } else {
                        // Mensaje de Cliente No Encontrado
                        listaResultados.style.display = 'block';
                        const liError = document.createElement('li');
                        liError.style.color = 'red';
                        liError.style.padding = '10px';
                        liError.style.textAlign = 'center';
                        liError.innerHTML = `
                            <i class="fa-solid fa-circle-exclamation"></i> Cliente no encontrado.<br>
                            <strong style="color: blue; cursor: pointer; text-decoration: underline;" 
                                    onclick="abrirModalClienteExpress()">
                                + ¡Regístralo aquí!
                            </strong>
                        `;
                        listaResultados.appendChild(liError);
                    }
                })
                .catch(err => console.error("Error búsqueda:", err));
        }, 300);
    }
});

// Selección de Cliente (Delegación)
document.addEventListener('click', function(e) {
    // Seleccionar item de la lista
    if (e.target && e.target.tagName === 'LI' && e.target.closest('.lista-autocomplete') && !e.target.closest('strong')) {
        const li = e.target;
        const contenedor = li.closest('.autocomplete-container');
        const inputBusqueda = contenedor.querySelector('#busqueda-cliente');
        const inputHidden = contenedor.querySelector('#id_cliente_seleccionado');
        const listaResultados = contenedor.querySelector('.lista-autocomplete');
        const btnLimpiar = contenedor.querySelector('#limpiar-cliente');

        inputBusqueda.value = li.dataset.nombre;
        inputBusqueda.disabled = true; 
        inputHidden.value = li.dataset.id;
        listaResultados.style.display = 'none';
        btnLimpiar.style.display = 'inline';
    }

    // Limpiar selección
    if (e.target && e.target.id === 'limpiar-cliente') {
        const btnLimpiar = e.target;
        const contenedor = btnLimpiar.closest('.autocomplete-container');
        const inputBusqueda = contenedor.querySelector('#busqueda-cliente');
        const inputHidden = contenedor.querySelector('#id_cliente_seleccionado');

        inputBusqueda.value = '';
        inputBusqueda.disabled = false;
        inputHidden.value = '';
        btnLimpiar.style.display = 'none';
        inputBusqueda.focus();
    }

    // Cerrar lista al hacer clic fuera
    if (!e.target.closest('.autocomplete-container')) {
        document.querySelectorAll('.lista-autocomplete').forEach(l => l.style.display = 'none');
    }
});


// 3. FUNCIONES DE UTILIDAD (GLOBALES)
function abrirModalOrden(id) { document.getElementById(id).style.display = 'flex'; }
function cerrarModalOrden(id) { document.getElementById(id).style.display = 'none'; }
function abrirModalClienteExpress() {
    document.getElementById('modalClienteExpress').style.display = 'block';
    document.getElementById('form-cliente-express').reset();
}
function cerrarModalClienteExpress() { document.getElementById('modalClienteExpress').style.display = 'none'; }

function calcularSaldoOrden() {
    const costo = parseFloat(document.getElementById('crear-costo').value) || 0;
    const anticipo = parseFloat(document.getElementById('crear-anticipo').value) || 0;
    document.getElementById('crear-saldo').value = (costo - anticipo).toFixed(2);
}

function previewEvidencia(input) {
    const container = document.getElementById('preview-container');
    container.innerHTML = ''; 
    if (input.files) {
        Array.from(input.files).forEach(file => {
            const reader = new FileReader();
            reader.onload = function(e) {
                const img = document.createElement('img');
                img.src = e.target.result;
                img.style.width = '50px'; img.style.height = '50px'; img.style.objectFit = 'cover';
                img.style.borderRadius = '4px'; img.style.border = '1px solid #ddd';
                container.appendChild(img);
            }
            reader.readAsDataURL(file);
        });
    }
}


// 4. LÓGICA DE CÁMARA WEB
let streamCamara = null;
let fotosCapturadas = [];

document.addEventListener('click', function(e) {
    // Activar
    if(e.target && e.target.id === 'btn-activar-camara') {
        const video = document.getElementById('video-webcam');
        navigator.mediaDevices.getUserMedia({ video: true })
            .then(function(stream) {
                streamCamara = stream;
                video.srcObject = stream;
                video.play();
                document.getElementById('camera-preview').style.display = 'block';
                e.target.style.display = 'none';
                document.getElementById('btn-tomar-foto').style.display = 'inline-block';
            })
            .catch(err => Swal.fire('Error', 'No se pudo acceder a la cámara.', 'error'));
    }
    
    // Capturar
    if(e.target && e.target.id === 'btn-tomar-foto') {
        const video = document.getElementById('video-webcam');
        const canvas = document.getElementById('canvas-webcam');
        const container = document.getElementById('preview-container');
        
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext('2d').drawImage(video, 0, 0);
        
        canvas.toBlob(function(blob) {
            const archivo = new File([blob], "foto_webcam_" + Date.now() + ".jpg", { type: "image/jpeg" });
            fotosCapturadas.push(archivo);
            
            const img = document.createElement('img');
            img.src = URL.createObjectURL(blob);
            img.style.width = '50px'; img.style.height = '50px'; img.style.objectFit = 'cover';
            img.style.border = '1px solid #28a745'; img.style.borderRadius = '4px';
            container.appendChild(img);
            
            // Efecto flash
            video.style.opacity = 0.5;
            setTimeout(() => video.style.opacity = 1, 100);
        }, 'image/jpeg', 0.95);
    }
});


// 5. ENVÍO DE FORMULARIOS (DELEGACIÓN DE EVENTOS)
document.addEventListener('submit', function(e) {
    
    // A) GUARDAR CLIENTE EXPRESS
    if (e.target && e.target.id === 'form-cliente-express') {
        e.preventDefault();
        e.stopPropagation();

        const formData = new FormData(e.target);

        fetch('cruds/guardar_cliente_express.php', { method: 'POST', body: formData })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                cerrarModalClienteExpress();
                const inputBusqueda = document.getElementById('busqueda-cliente');
                const inputHidden = document.getElementById('id_cliente_seleccionado');
                const btnLimpiar = document.getElementById('limpiar-cliente');
                const listaResultados = document.getElementById('lista-resultados-clientes');

                if (inputBusqueda && inputHidden) {
                    inputBusqueda.value = `${data.nombre_completo} (${data.telefono})`;
                    inputBusqueda.disabled = true; 
                    inputHidden.value = data.id;   
                    if (btnLimpiar) btnLimpiar.style.display = 'inline';
                    if (listaResultados) listaResultados.style.display = 'none';
                }
                Swal.fire({ icon: 'success', title: 'Cliente creado', toast: true, position: 'top-end', showConfirmButton: false, timer: 3000 });
            } else {
                Swal.fire('Error', data.message, 'error');
            }
        });
    }

    // B) CREAR ORDEN (INCLUYE FOTOS WEBCAM)
    if (e.target && e.target.id === 'form-crearOrden') {
        e.preventDefault();
        
        const form = e.target;
        const formData = new FormData(form);
        
        // Agregar fotos de webcam si existen
        if (typeof fotosCapturadas !== 'undefined' && fotosCapturadas.length > 0) {
            fotosCapturadas.forEach((foto, index) => {
                formData.append('evidencias[]', foto, `webcam_foto_${index}.jpg`);
            });
        }

        Swal.fire({ title: 'Procesando...', text: 'Generando orden...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

        fetch('cruds/procesar_crear_orden.php', { method: 'POST', body: formData })
        .then(res => res.json())
        .then(data => {
            if(data.success) {
                cerrarModalOrden('crear-modalOrden');
                form.reset();
                document.getElementById('preview-container').innerHTML = '';
                
                // Reset Cámara
                fotosCapturadas = []; 
                if(streamCamara) streamCamara.getTracks().forEach(track => track.stop());
                document.getElementById('camera-preview').style.display = 'none';
                document.getElementById('btn-activar-camara').style.display = 'inline-block';
                document.getElementById('btn-tomar-foto').style.display = 'none';

                // Reset Buscador Cliente
                const inputBusqueda = document.getElementById('busqueda-cliente');
                if(inputBusqueda) { inputBusqueda.value = ''; inputBusqueda.disabled = false; }
                if(document.getElementById('limpiar-cliente')) document.getElementById('limpiar-cliente').style.display = 'none';
                
                // ALERTA DE ÉXITO CON QR
                Swal.fire({
                    title: '¡Orden Creada!',
                    html: `<p>${data.message}</p>
                           <div style="display: flex; justify-content: center; margin: 15px 0;">
                               <div id="qrcode-container"></div>
                           </div>
                           <p style="font-size: 12px; color: #666;">Escanea para ver el rastreo</p>`,
                    icon: 'success',
                    confirmButtonText: '<i class="fa-brands fa-whatsapp"></i> Enviar WhatsApp',
                    showCancelButton: true,
                    cancelButtonText: 'Cerrar',
                    didOpen: () => {
                         new QRCode(document.getElementById("qrcode-container"), {
                            text: data.token_qr, width: 128, height: 128
                        });
                    }
                }).then((result) => {
                    if (result.isConfirmed) {
                        const tel = data.datos_whatsapp.telefono.replace(/\D/g,'');
                        const msg = encodeURIComponent(data.datos_whatsapp.mensaje);
                        window.open(`https://wa.me/${tel}?text=${msg}`, '_blank');
                    }
                    if(document.getElementById("ordenes-link")) document.getElementById("ordenes-link").click(); 
                });
            } else {
                Swal.fire('Error', data.message, 'error');
            }
        })
        .catch(err => {
            console.error(err);
            Swal.fire('Error', 'Fallo en el servidor', 'error');
        });
    }
});

//Función para cargar los primeras 10 ordenes por defecto
function cargarOrdenes() {
  pagina = 2; //Reiniciar la paginación cuando seleccionas "Todos"
  cargando = false; //Asegurar que el scroll pueda volver a activarse

  fetch("cruds/cargar_ordenes.php?limit=10&offset=0")
    .then((response) => response.json())
    .then((data) => {
      actualizarTablaOrdenes(data);
    })
    .catch((error) => console.error("Error al cargar ordenes:", error));
}

// Llamar informes *****************************************************************
document
  .getElementById("informes-link")
  .addEventListener("click", function (event) {
    event.preventDefault(); // Evita la acción por defecto del enlace
    fetch("../php/operaciones/informes.php")
      .then((response) => response.text())
      .then((html) => {
        document.getElementById("content-area").innerHTML = html;
        asignarControladorFormularioInforme(); // Asigna el controlador después de cargar el contenido
      })
      .catch((error) => {
        console.error("Error al cargar el contenido:", error);
      });
  });

// Guardar informe
function enviarFormularioInforme(event) {
  event.preventDefault(); // Evita la recarga de la página

  const formData = new FormData(event.target); // Obtiene los datos del formulario
  fetch("../php/operaciones/informes.php", {
    method: "POST",
    body: formData,
  })
    .then((response) => response.text())
    .then((html) => {
      document.getElementById("content-area").innerHTML = html; // Actualiza el contenido
      asignarControladorFormularioInformes(); // Vuelve a asignar el controlador para el nuevo contenido
    })
    .catch((error) => {
      console.error("Error al enviar el formulario:", error);
    });
}
//Cargamos datos para editar
function cargarEditarInforme(id) {
  fetch("../php/operaciones/informes.php?idinforme=" + id)
    .then((response) => response.text())
    .then((html) => {
      document.getElementById("content-area").innerHTML = html;
      asignarControladorFormularioInforme();
    })
    .catch((error) => {
      console.error("Error al cargar el contenido:", error);
    });
}
//Eliminamos el informe
function eliminarAbono(id) {
  if (confirm("¿Estás seguro de que deseas eliminar este informe?")) {
    fetch("../php/operaciones/informes.php?action=delete&idinforme=" + id)
      .then((response) => response.text())
      .then((html) => {
        document.getElementById("content-area").innerHTML = html;
        asignarControladorFormularioInforme();
      })
      .catch((error) => {
        console.error("Error al eliminar el Informe:", error);
      });
  }
}
// Inicializar al cargar la página
document.addEventListener("DOMContentLoaded", function () {
  asignarControladorFormularioInforme(); // Asigna el controlador cuando el DOM esté listo
});

// Asignar controlador al formulario
function asignarControladorFormularioInforme() {
  const form = document.querySelector("form"); // Selecciona el formulario dentro del nuevo contenido
  if (form) {
    form.addEventListener("submit", enviarFormularioInforme); // Asigna el evento submit
  }
}
// Función para limpiar el formulario Informes
function limpiarFormularioInformes() {
  console.log("Limpiando el formulario de Informes..."); // Para depuración

  // Seleccionar todos los elementos input de texto y ocultos
  const campos = document.querySelectorAll(
    '#frmInformes input[type="hidden"], #frmInformes[type="text"], #frmInformes input[type="email"], #frmInformes input[type="number"]',
  );
  campos.forEach((campo) => (campo.value = ""));

  // Seleccionar todos los elementos select del formulario
  const selects = document.querySelectorAll("#frmInformes select");
  selects.forEach((select) => (select.selectedIndex = 0)); // Reinicia el select al primer valor (generalmente un placeholder)
}
