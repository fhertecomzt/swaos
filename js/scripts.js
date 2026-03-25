document.addEventListener("DOMContentLoaded", () => {
  const menuToggle = document.getElementById("menu-toggle");
  const navbar = document.querySelector(".navbar"); // <--- Seleccionamos toda la barra
  const submenuLinks = document.querySelectorAll(".has-submenu > a");
  const allMenuLinks = document.querySelectorAll(".menu a.nav-link");
  const body = document.body;

  // ABRIR / CERRAR MENÚ (Botón Hamburguesa)
  if (menuToggle && navbar) {
    menuToggle.addEventListener("click", (e) => {
      e.preventDefault();
      navbar.classList.toggle("open"); // Hace entrar/salir el menú en celular
    });

    // CERRAR AL TOCAR UN ENLACE (Solo si es un enlace final y estamos en celular)
    allMenuLinks.forEach((link) => {
      link.addEventListener("click", () => {
        const parentLi = link.closest("li");

        // Si tocamos un título que tiene submenú, NO cerramos la barra
        if (parentLi && parentLi.classList.contains("has-submenu")) {
          return;
        }

        // Si tocamos un enlace normal (ej. Inicio, Ventas) en CELULAR, cerramos la barra
        if (window.innerWidth <= 768) {
          navbar.classList.remove("open");
        }
      });
    });
  }

  // ACORDEÓN DE SUBMENÚS
  submenuLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const submenu = link.nextElementSibling;
      if (submenu && submenu.tagName === "UL") {
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

// DATATABLES: FUNCIÓN MAESTRA UNIVERSAL PARA TODO EL SISTEMA
// INICIALIZACIÓN DE DATATABLES (PAGINADOR Y BUSCADOR)
function inicializarTablaGenerica(idTabla, idBuscador, idSelectorCantidad) {
  // Verificamos si la tabla existe en la pantalla actual
  if ($(idTabla).length) {
    // Si ya era DataTables, la limpiamos
    if ($.fn.DataTable.isDataTable(idTabla)) {
      $(idTabla).DataTable().destroy();
    }

    // Inicializamos la tabla
    let tabla = $(idTabla).DataTable({
      language: {
        url: "//cdn.datatables.net/plug-ins/1.13.6/i18n/es-ES.json",
      },
      pageLength: 8,
      order: [[0, "desc"]], // Ordena por la primera columna de mayor a menor
      dom: "rtip", // Oculta los controles feos por defecto
      scrollY: "60vh", // Encabezados fijos nativos
      scrollCollapse: true,
    });

    // Conectamos TU caja de búsqueda personalizada
    $(idBuscador)
      .off("keyup")
      .on("keyup", function () {
        tabla.search(this.value).draw();
      });

    // Conectamos TU selector de cantidades personalizado
    $(idSelectorCantidad)
      .off("change")
      .on("change", function () {
        tabla.page.len(this.value).draw();
      });
  }
}

// Carga Dashboard y los cards movibles
document.addEventListener("DOMContentLoaded", function () {
  let contentArea = document.getElementById("content-area");

  if (contentArea) {
    fetch("../php/dashboard.php")
      .then((response) => response.text())
      .then((data) => {
        contentArea.innerHTML = data;

        // Llamar función de los cards movibles
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
  var el = document.getElementById("dashboard-cards");

  if (!el) return;

  //  Recuperar orden guardado
  var ordenGuardado = localStorage.getItem("ordenDashboard");
  if (ordenGuardado) {
    var ordenArray = ordenGuardado.split("|");
    ordenArray.forEach(function (id) {
      var card = el.querySelector(`.card[data-id="${id}"]`);
      if (card) {
        el.appendChild(card);
      }
    });
  }

  //  Activar Sortable (Evitamos duplicados con la validación)
  if (el.getAttribute("data-sortable-initialized")) return;

  Sortable.create(el, {
    animation: 150,
    ghostClass: "tarjeta-fantasma",
    onEnd: function (evt) {
      var orden = [];
      el.querySelectorAll(".card").forEach(function (card) {
        orden.push(card.getAttribute("data-id"));
      });
      localStorage.setItem("ordenDashboard", orden.join("|"));
    },
  });

  el.setAttribute("data-sortable-initialized", "true");
}

//Llamar Talleres *********************************************
if (document.getElementById("tiendas-link")) {
  document
    .getElementById("tiendas-link")
    .addEventListener("click", function (event) {
      event.preventDefault();
      fetch("tiendas.php")
        .then((response) => response.text())
        .then((html) => {
          document.getElementById("content-area").innerHTML = html;
          // INICIALIZAMOS DATATABLES AQUÍ:
          inicializarTablaGenerica(
            "#tabla-tiendas",
            "#buscarbox",
            "#cantidad-registros",
          );
        })
        .catch((error) =>
          console.error("Error al cargar el contenido:", error),
        );
    });
}

function abrirModal(id) {
  document.getElementById(id).style.display = "flex";
}

function cerrarModal(id) {
  document.getElementById(id).style.display = "none";
}

// CREAR TIENDA (Con Motor de Reglas Avanzado)
function validarFormularioTienda(event) {
  event.preventDefault();

  const reglasValidacion = [
    {
      id: "crear-nombre",
      tipo: "texto",
      min: 3,
      mensaje: "El nombre del taller debe tener al menos 3 caracteres.",
    },
    {
      id: "crear-razonsocial",
      tipo: "texto",
      min: 3,
      mensaje: "La razón social debe tener al menos 3 caracteres.",
    },
    {
      id: "crear-rfc",
      tipo: "texto",
      min: 12,
      mensaje: "El RFC debe tener al menos 12 caracteres.",
    },
    {
      id: "crear-calle",
      tipo: "texto",
      min: 3,
      mensaje: "La calle debe tener al menos 3 caracteres.",
    },
    {
      id: "crear-noexterior",
      tipo: "numero",
      minVal: 1,
      mensaje: "El número exterior debe ser mayor a 0.",
    },
    { id: "estado", tipo: "select", mensaje: "Debes seleccionar un estado." },
    {
      id: "municipio",
      tipo: "select",
      mensaje: "Debes seleccionar un municipio.",
    },
    {
      id: "colonia",
      tipo: "select",
      mensaje: "Debes seleccionar una colonia.",
    },
    {
      id: "crear-email",
      tipo: "email",
      mensaje: "Debes ingresar un correo electrónico válido.",
    },
    {
      id: "crear-telefono",
      tipo: "texto",
      min: 10,
      mensaje: "El teléfono debe tener al menos 10 dígitos.",
    },
  ];

  const errores = [];
  let primerCampoConError = null;

  reglasValidacion.forEach((regla) => {
    const elemento = document.getElementById(regla.id);
    if (!elemento) return;

    let valor = elemento.value.trim();
    let esValido = true;

    elemento.addEventListener(
      regla.tipo === "select" ? "change" : "input",
      function () {
        this.classList.remove("input-error");
      },
    );

    if (regla.tipo === "texto") {
      if (valor.length < regla.min) esValido = false;
    } else if (regla.tipo === "numero") {
      let num = parseFloat(valor);
      if (valor === "" || isNaN(num) || num < regla.minVal) esValido = false;
    } else if (regla.tipo === "select") {
      if (valor === "") esValido = false;
    } else if (regla.tipo === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(valor)) esValido = false;
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
    // Quitar el cursor por seguridad
    if (document.activeElement) {
      document.activeElement.blur();
    }

    Swal.fire({
      title: "Faltan datos",
      html: `<ul style="text-align: left; font-size: 14px; color: #d33;">${errores.join("")}</ul>`,
      icon: "warning",
      confirmButtonColor: "#3085d6",
      confirmButtonText: "Entendido",
      // Esperamos a que la alerta desaparezca al 100%
      didClose: () => {
        if (primerCampoConError) primerCampoConError.focus();
      },
    });

    return;
  }

  const nombre = document.getElementById("crear-nombre").value.trim();

  verificarDuplicado(nombre).then((esDuplicado) => {
    if (!esDuplicado) procesarFormulario(event, "crear");
  });
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
        cerrarModal(tipo + "-modal");
        event.target.reset();

        Swal.fire({
          title: "¡Éxito!",
          text: data.message || "Taller guardado correctamente.",
          icon: "success",
          showConfirmButton: false,
          timer: 1500,
          timerProgressBar: true,
        }).then(() => {
          // RECARGA LIMPIA DE DATATABLES
          if (document.getElementById("tiendas-link")) {
            document.getElementById("tiendas-link").click();
          }
        });
      } else {
        Swal.fire("Error", data.message || "Ocurrió un problema.", "error");
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      Swal.fire("Error", "Ocurrió un error inesperado.", "error");
    });
}

function verificarDuplicado(nombre) {
  return fetch("cruds/verificar_nombre.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nombre }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.existe) {
        Swal.fire({
          title: "Atención",
          text: "Ya existe un taller con este nombre.",
          icon: "warning",
          showConfirmButton: false,
          timer: 1500,
        });
      }
      return data.existe;
    })
    .catch((error) => {
      console.error("Error al verificar duplicado:", error);
      return true;
    });
}

// EDITAR TIENDA/TALLER
document.addEventListener("DOMContentLoaded", function () {
  // Escuchar clic en el botón de editar
  document.body.addEventListener("click", function (event) {
    if (event.target.classList.contains("editar")) {
      const id = event.target.dataset.id;

      fetch(`cruds/obtener_tienda.php?id=${id}`)
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            const formulario = document.getElementById("form-editar");
            if (formulario) {
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
                }
              });

              // Lógica de ubicaciones anidadas
              const idEstadoDB = data.tienda.estado;
              const idMunicipioDB = data.tienda.municipio;
              const idColoniaDB = data.tienda.colonia;
              const cpDB = data.tienda.codigo_postal;

              cargarYSeleccionarUbicacionEditar(
                idEstadoDB,
                idMunicipioDB,
                idColoniaDB,
                cpDB,
              );

              abrirModal("editar-modal");
            }
          } else {
            Swal.fire(
              "Error",
              data.message || "No se pudo cargar el taller.",
              "error",
            );
          }
        })
        .catch((error) => {
          console.error("Error al obtener taller:", error);
          Swal.fire(
            "Error",
            "Ocurrió un problema al obtener los datos.",
            "error",
          );
        });
    }
  });

  document.body.addEventListener("submit", function (event) {
    if (event.target && event.target.id === "form-editar") {
      event.preventDefault();
      validarFormularioEdicion(event.target);
    }
  });
});

async function validarFormularioEdicion(formulario) {
  const reglasValidacion = [
    {
      id: "editar-nombre",
      tipo: "texto",
      min: 3,
      mensaje: "El nombre del taller debe tener al menos 3 caracteres.",
    },
    {
      id: "editar-razonsocial",
      tipo: "texto",
      min: 3,
      mensaje: "La razón social debe tener al menos 3 caracteres.",
    },
    {
      id: "editar-rfc",
      tipo: "texto",
      min: 12,
      mensaje: "El RFC debe tener al menos 12 caracteres.",
    },
    {
      id: "editar-calle",
      tipo: "texto",
      min: 3,
      mensaje: "La calle debe tener al menos 3 caracteres.",
    },
    {
      id: "editar-noexterior",
      tipo: "numero",
      minVal: 1,
      mensaje: "El número exterior debe ser mayor a 0.",
    },
    {
      id: "editar-estado",
      tipo: "select",
      mensaje: "Debes seleccionar un estado.",
    },
    {
      id: "editar-municipio",
      tipo: "select",
      mensaje: "Debes seleccionar un municipio.",
    },
    {
      id: "editar-colonia",
      tipo: "select",
      mensaje: "Debes seleccionar una colonia.",
    },
    {
      id: "editar-email",
      tipo: "email",
      mensaje: "Debes ingresar un correo electrónico válido.",
    },
    {
      id: "editar-telefono",
      tipo: "texto",
      min: 10,
      mensaje: "El teléfono debe tener al menos 10 dígitos.",
    },
  ];

  const errores = [];
  let primerCampoConError = null;

  reglasValidacion.forEach((regla) => {
    const elemento = document.getElementById(regla.id);
    if (!elemento) return;

    let valor = elemento.value.trim();
    let esValido = true;

    elemento.addEventListener(
      regla.tipo === "select" ? "change" : "input",
      function () {
        this.classList.remove("input-error");
      },
    );

    if (regla.tipo === "texto") {
      if (valor.length < regla.min) esValido = false;
    } else if (regla.tipo === "numero") {
      let num = parseFloat(valor);
      if (valor === "" || isNaN(num) || num < regla.minVal) esValido = false;
    } else if (regla.tipo === "select") {
      if (valor === "") esValido = false;
    } else if (regla.tipo === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(valor)) esValido = false;
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
    // Quitar el cursor por seguridad
    if (document.activeElement) {
      document.activeElement.blur();
    }

    Swal.fire({
      title: "Faltan datos",
      html: `<ul style="text-align: left; font-size: 14px; color: #d33;">${errores.join("")}</ul>`,
      icon: "warning",
      confirmButtonColor: "#3085d6",
      confirmButtonText: "Entendido",
      // Esperamos a que la alerta desaparezca al 100%
      didClose: () => {
        if (primerCampoConError) primerCampoConError.focus();
      },
    });

    return;
  }

  const nombre = document.getElementById("editar-nombre").value.trim();
  const id = document.getElementById("editar-id").value;

  try {
    const esDuplicado = await verificarDuplicadoEditarTienda(nombre, id);
    if (!esDuplicado) enviarFormularioEdicion(formulario);
  } catch (error) {
    console.error("Error al verificar duplicado:", error);
  }
}

function verificarDuplicadoEditarTienda(nombre, id = 0) {
  return fetch("cruds/verificar_nombre.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nombre, id }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.existe) {
        Swal.fire({
          title: "Atención",
          text: data.message || "El nombre del taller ya existe.",
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
      return true;
    });
}

function enviarFormularioEdicion(formulario) {
  if (!formulario) return;
  const formData = new FormData(formulario);

  fetch("cruds/editar_tienda.php", {
    method: "POST",
    body: formData,
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        Swal.fire({
          title: "¡Actualizada!",
          text: data.message || "El taller ha sido actualizado.",
          icon: "success",
          showConfirmButton: false,
          timer: 1500,
          timerProgressBar: true,
        }).then(() => {
          // RECARGA LIMPIA DE DATATABLES
          if (document.getElementById("tiendas-link")) {
            document.getElementById("tiendas-link").click();
          }
        });
        cerrarModal("editar-modal");
      } else {
        Swal.fire(
          "Atención",
          data.message || "Ocurrió un problema.",
          "warning",
        );
      }
    })
    .catch((error) => {
      console.error("Error al actualizar taller:", error);
      Swal.fire(
        "Error",
        "Ocurrió un problema al procesar la solicitud.",
        "error",
      );
    });
}

// ELIMINAR TIENDA/TALLER
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
        fetch(`cruds/eliminar_tienda.php?id=${id}`, { method: "POST" })
          .then((response) => response.json())
          .then((data) => {
            if (data.success) {
              Swal.fire({
                title: "¡Eliminado!",
                text:
                  data.message || "El taller se ha eliminado correctamente.",
                icon: "success",
                showConfirmButton: false,
                timer: 1500,
                timerProgressBar: true,
              }).then(() => {
                if (document.getElementById("tiendas-link")) {
                  document.getElementById("tiendas-link").click();
                }
              });
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

// LÓGICA PARA SELECTS ANIDADOS (ESTADO, MUNICIPIO, COLONIA)
function popularSelect(selectElement, items, valorDefault = "Seleccionar") {
  if (!selectElement) return;
  selectElement.innerHTML = `<option value="">${valorDefault}</option>`;
  items.forEach((item) => {
    const option = document.createElement("option");
    option.value = item.id;
    option.textContent = item.nombre;
    selectElement.appendChild(option);
  });
}

async function cargarMunicipios(
  idEstado,
  idSelectMunicipio,
  idSelectColonia,
  idInputCP,
) {
  const selectMunicipio = document.getElementById(idSelectMunicipio);
  const selectColonia = document.getElementById(idSelectColonia);
  const inputCP = document.getElementById(idInputCP);

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
    popularSelect(selectMunicipio, []);
  }
}

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
    popularSelect(selectColonia, []);
  }
}

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

document.addEventListener("change", function (event) {
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

  //  Seleccionamos el Estado
  selectEstado.value = idEstadoDB;

  //  Cargamos municipios (esperamos a que termine) y seleccionamos
  await cargarMunicipios(
    idEstadoDB,
    "editar-municipio",
    "editar-colonia",
    "editar-codigo_postal",
  );
  selectMunicipio.value = idMunicipioDB;

  //  Cargamos colonias (esperamos a que termine) y seleccionamos
  await cargarColonias(idMunicipioDB, "editar-colonia", "editar-codigo_postal");
  selectColonia.value = idColoniaDB;

  // terminó de cargar todo, ahora sí inyectamos el Código Postal
  if (inputCP) {
    inputCP.value = cpDB || "";
  }
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

        inicializarTablaGenerica(
          "#tabla-roles",
          "#buscarboxrol",
          "#cantidad-registros",
        );
      })
      .catch((error) => {
        console.error("Error al cargar el contenido:", error);
      });
  });

function abrirModalRol(id) {
  document.getElementById(id).style.display = "flex";
}

function cerrarModalRol(id) {
  document.getElementById(id).style.display = "none";
}

//Crear Rol **********************************************
// INICIALIZAR Y CARGAR MÓDULO DE ROLES
if (document.getElementById("roles-link")) {
  document
    .getElementById("roles-link")
    .addEventListener("click", function (event) {
      event.preventDefault();
      fetch("roles.php")
        .then((response) => response.text())
        .then((html) => {
          document.getElementById("content-area").innerHTML = html;
          inicializarTablaGenerica(
            "#tabla-roles",
            "#buscarboxrol",
            "#cantidad-registros",
          );
        })
        .catch((error) =>
          console.error("Error al cargar el contenido:", error),
        );
    });
}

function abrirModalRol(id) {
  document.getElementById(id).style.display = "flex";
}

function cerrarModalRol(id) {
  document.getElementById(id).style.display = "none";
}

// VERIFICAR DUPLICADOS DE ROLES
function verificarDuplicadoRol(rol, id = 0) {
  return fetch("cruds/verificar_nombre_rol.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ rol, id }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.existe) {
        Swal.fire({
          title: "Atención",
          text: data.message || "El nombre del Rol ya existe.",
          icon: "warning",
          showConfirmButton: false,
          timer: 1500,
        });
      }
      return data.existe;
    })
    .catch((error) => {
      console.error("Error al verificar duplicado:", error);
      return true;
    });
}

// CREAR ROL (Motor de Reglas)
function validarFormularioRol(event) {
  event.preventDefault();

  const reglasValidacion = [
    {
      id: "crear-rol",
      tipo: "texto",
      min: 3,
      mensaje: "El nombre del rol debe tener al menos 3 caracteres.",
    },
    {
      id: "crear-desc_rol",
      tipo: "texto",
      min: 3,
      mensaje: "La descripción debe tener al menos 3 caracteres.",
    },
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

    if (!esValido) {
      errores.push(`<li>${regla.mensaje}</li>`);
      elemento.classList.add("input-error");
      if (!primerCampoConError) primerCampoConError = elemento;
    } else {
      elemento.classList.remove("input-error");
    }
  });

  if (errores.length > 0) {
    // Quitar el cursor por seguridad
    if (document.activeElement) {
      document.activeElement.blur();
    }

    Swal.fire({
      title: "Faltan datos",
      html: `<ul style="text-align: left; font-size: 14px; color: #d33;">${errores.join("")}</ul>`,
      icon: "warning",
      confirmButtonColor: "#3085d6",
      confirmButtonText: "Entendido",
      // Esperamos a que la alerta desaparezca al 100%
      didClose: () => {
        if (primerCampoConError) primerCampoConError.focus();
      },
    });

    return;
  }

  const rolInput = document.getElementById("crear-rol");

  verificarDuplicadoRol(rolInput.value.trim(), 0).then((esDuplicado) => {
    if (!esDuplicado) procesarFormularioRol(event);
  });
}

function procesarFormularioRol(event) {
  const formData = new FormData(event.target);

  fetch("cruds/procesar_crear_rol.php", {
    method: "POST",
    body: formData,
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        cerrarModalRol("crear-modalRol");
        event.target.reset();

        Swal.fire({
          title: "¡Éxito!",
          text: data.message || "Rol creado correctamente.",
          icon: "success",
          showConfirmButton: false,
          timer: 1500,
          timerProgressBar: true,
        }).then(() => {
          if (document.getElementById("roles-link")) {
            document.getElementById("roles-link").click();
          }
        });
      } else {
        Swal.fire(
          "Atención",
          data.message || "Ocurrió un problema.",
          "warning",
        );
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      Swal.fire("Error", "Ocurrió un error inesperado.", "error");
    });
}

// OBTENER DATOS PARA EDITAR ROL
document.addEventListener("DOMContentLoaded", function () {
  document.body.addEventListener("click", function (event) {
    if (event.target.classList.contains("editarRol")) {
      const id = event.target.dataset.id;

      fetch(`cruds/obtener_rol.php?id=${id}`)
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            const formulario = document.getElementById("form-editarRol");
            if (formulario) {
              const campos = ["idrol", "rol", "desc_rol", "estatus"];
              campos.forEach((campo) => {
                if (formulario[`editar-${campo}`]) {
                  formulario[`editar-${campo}`].value = data.rol[campo] || "";
                }
              });
              abrirModalRol("editar-modalRol");
            }
          } else {
            Swal.fire(
              "Error",
              data.message || "No se pudo cargar el Rol.",
              "error",
            );
          }
        })
        .catch((error) => {
          console.error("Error al obtener Rol:", error);
          Swal.fire(
            "Error",
            "Ocurrió un problema al obtener los datos.",
            "error",
          );
        });
    }
  });

  // Evento submit para editar
  document.body.addEventListener("submit", function (event) {
    if (event.target && event.target.id === "form-editarRol") {
      validarFormularioEdicionRol(event);
    }
  });
});

// EDITAR ROL (Motor de Reglas)
function validarFormularioEdicionRol(event) {
  event.preventDefault();
  const formulario = event.target;

  const reglasValidacion = [
    {
      id: "editar-rol",
      tipo: "texto",
      min: 3,
      mensaje: "El nombre del rol debe tener al menos 3 caracteres.",
    },
    {
      id: "editar-desc_rol",
      tipo: "texto",
      min: 3,
      mensaje: "La descripción debe tener al menos 3 caracteres.",
    },
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

    if (!esValido) {
      errores.push(`<li>${regla.mensaje}</li>`);
      elemento.classList.add("input-error");
      if (!primerCampoConError) primerCampoConError = elemento;
    } else {
      elemento.classList.remove("input-error");
    }
  });

  if (errores.length > 0) {
    // Quitar el cursor por seguridad
    if (document.activeElement) {
      document.activeElement.blur();
    }
    Swal.fire({
      title: "Faltan datos",
      html: `<ul style="text-align: left; font-size: 14px; color: #d33;">${errores.join("")}</ul>`,
      icon: "warning",
      confirmButtonColor: "#3085d6",
      confirmButtonText: "Entendido",
      // Esperamos a que la alerta desaparezca al 100%
      didClose: () => {
        if (primerCampoConError) primerCampoConError.focus();
      },
    });

    return;
  }

  const rolInput = document.getElementById("editar-rol");
  const idInput = document.getElementById("editar-idrol");

  verificarDuplicadoRol(rolInput.value.trim(), idInput.value).then(
    (esDuplicado) => {
      if (!esDuplicado) enviarFormularioEdicionRol(formulario);
    },
  );
}

function enviarFormularioEdicionRol(formulario) {
  const formData = new FormData(formulario);

  fetch("cruds/editar_rol.php", {
    method: "POST",
    body: formData,
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        cerrarModalRol("editar-modalRol");
        Swal.fire({
          title: "¡Actualizado!",
          text: data.message || "Rol actualizado correctamente.",
          icon: "success",
          showConfirmButton: false,
          timer: 1500,
          timerProgressBar: true,
        }).then(() => {
          if (document.getElementById("roles-link")) {
            document.getElementById("roles-link").click();
          }
        });
      } else {
        Swal.fire(
          "Atención",
          data.message || "Ocurrió un problema.",
          "warning",
        );
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      Swal.fire("Error", "Ocurrió un error inesperado.", "error");
    });
}

// ELIMINAR ROL
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
        fetch(`cruds/eliminar_rol.php?id=${id}`, { method: "POST" })
          .then((response) => response.json())
          .then((data) => {
            if (data.success) {
              Swal.fire({
                title: "¡Eliminado!",
                text: data.message || "El rol se ha eliminado correctamente.",
                icon: "success",
                showConfirmButton: false,
                timer: 1500,
                timerProgressBar: true,
              }).then(() => {
                if (document.getElementById("roles-link")) {
                  document.getElementById("roles-link").click();
                }
              });
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

// Llamar Usuarios *********************************************
// INICIALIZAR Y CARGAR MÓDULO DE USUARIOS
if (document.getElementById("usuarios-link")) {
  document
    .getElementById("usuarios-link")
    .addEventListener("click", function (event) {
      event.preventDefault();
      fetch("usuarios.php")
        .then((response) => response.text())
        .then((html) => {
          document.getElementById("content-area").innerHTML = html;
          // DATATABLES TOMA EL CONTROL DEL BUSCADOR Y EL PAGINADOR
          inicializarTablaGenerica(
            "#tabla-usuarios",
            "#buscarboxusuario",
            "#estatusFiltroU",
          );
        })
        .catch((error) =>
          console.error("Error al cargar el contenido:", error),
        );
    });
}

function abrirModalUser(id) {
  document.getElementById(id).style.display = "flex";
}
function cerrarModalUser(id) {
  document.getElementById(id).style.display = "none";
}

// MOTOR DE REGLAS (Crear y Editar Usuario)
function validarFormularioUser(event, tipo = "crear") {
  event.preventDefault();
  const prefijo = tipo === "crear" ? "crear" : "editar";

  const reglasValidacion = [
    {
      id: `${prefijo}-usuario`,
      tipo: "texto",
      min: 3,
      mensaje: "El usuario debe tener al menos 3 caracteres.",
    },
    {
      id: `${prefijo}-nombre`,
      tipo: "texto",
      min: 3,
      mensaje: "El nombre debe tener al menos 3 caracteres.",
    },
    {
      id: `${prefijo}-papellido`,
      tipo: "texto",
      min: 3,
      mensaje: "El primer apellido debe tener al menos 3 caracteres.",
    },
    {
      id: `${prefijo}-sapellido`,
      tipo: "texto",
      min: 3,
      mensaje: "El segundo apellido debe tener al menos 3 caracteres.",
    },
    {
      id: `${prefijo}-email`,
      tipo: "email",
      mensaje: "Debes ingresar un correo electrónico válido.",
    },
    {
      id: `${prefijo}-rol`,
      tipo: "select",
      mensaje: "Debes seleccionar un rol.",
    },
    {
      id: `${prefijo}-tienda`,
      tipo: "select",
      mensaje: "Debes seleccionar un taller.",
    },
    {
      id: `${prefijo}-password1`,
      tipo: "password",
      mensaje:
        "La contraseña debe tener al menos 6 caracteres, 1 mayúscula, 1 minúscula, 1 número y 1 carácter especial.",
    },
    {
      id: `${prefijo}-password2`,
      tipo: "confirmacion",
      mensaje: "Las contraseñas no coinciden.",
    },
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
    else if (
      regla.tipo === "email" &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor)
    )
      esValido = false;
    else if (regla.tipo === "password") {
      const regexPass =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
      if (tipo === "crear" && valor === "") esValido = false; // Obligatorio al crear
      if (valor !== "" && !regexPass.test(valor)) esValido = false; // Si escribe algo, debe cumplir
    } else if (regla.tipo === "confirmacion") {
      const pass1 = document
        .getElementById(`${prefijo}-password1`)
        .value.trim();
      if (tipo === "crear" && valor === "") esValido = false;
      if (valor !== pass1) esValido = false; // Deben ser exactamente iguales
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

  const usuarioInput = document
    .getElementById(`${prefijo}-usuario`)
    .value.trim();
  const idInput =
    tipo === "editar" ? document.getElementById("editar-idusuario").value : 0;

  verificarDuplicadoUser(usuarioInput, idInput).then((esDuplicado) => {
    if (!esDuplicado) procesarFormularioUser(event.target, tipo);
  });
}

function verificarDuplicadoUser(usuario, id = 0) {
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

function procesarFormularioUser(formulario, tipo) {
  const formData = new FormData(formulario);
  const url =
    tipo === "crear"
      ? "cruds/procesar_crear_user.php"
      : "cruds/editar_user.php";

  fetch(url, { method: "POST", body: formData })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        cerrarModalUser(`${tipo}-modalUser`);
        if (tipo === "crear") formulario.reset();

        Swal.fire({
          title: "¡Éxito!",
          text:
            data.message ||
            `Usuario ${tipo === "crear" ? "registrado" : "actualizado"}.`,
          icon: "success",
          returnFocus: false,
          showConfirmButton: false,
          timer: 1500,
        }).then(() => {
          if (document.getElementById("usuarios-link")) {
            document.getElementById("usuarios-link").click(); // Recarga limpia de DataTables
          }
        });
      } else {
        Swal.fire(
          "Atención",
          data.message || "Ocurrió un problema.",
          "warning",
        );
      }
    })
    .catch(() => Swal.fire("Error", "Ocurrió un error inesperado.", "error"));
}

// OBTENER DATOS PARA EDITAR USUARIO Y EVENTOS SUBMIT
document.addEventListener("DOMContentLoaded", function () {
  // Eventos submit delegados al document body (funcionan aunque DataTables re-dibuje el HTML)
  document.body.addEventListener("submit", function (event) {
    if (event.target && event.target.id === "form-crearUser") {
      validarFormularioUser(event, "crear");
    } else if (event.target && event.target.id === "form-editarUser") {
      validarFormularioUser(event, "editar");
    }
  });

  document.body.addEventListener("click", function (event) {
    if (event.target.classList.contains("editarUser")) {
      const id = event.target.dataset.id;
      fetch(`cruds/obtener_usuario.php?id=${id}`)
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            const formulario = document.getElementById("form-editarUser");
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
              // Limpiar contraseñas para que no queden marcadas
              document.getElementById("editar-password1").value = "";
              document.getElementById("editar-password2").value = "";

              abrirModalUser("editar-modalUser");
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

    // ELIMINAR USUARIO ***********************************************
    if (event.target.classList.contains("eliminarUser")) {
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
                  if (document.getElementById("usuarios-link"))
                    document.getElementById("usuarios-link").click();
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

// Llamar Productos *******************************************************
document
  .getElementById("productos-link")
  .addEventListener("click", function (event) {
    event.preventDefault(); // Evita la acción por defecto del enlace
    fetch("catalogos/productos.php")
      .then((response) => response.text())
      .then((html) => {
        document.getElementById("content-area").innerHTML = html;
        inicializarTablaGenerica(
          "#tabla-productos",
          "#buscarboxproducto",
          "#cantidad-registros",
        );
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
          if (document.getElementById("productos-link")) {
            document.getElementById("productos-link").click(); // Recarga la tabla limpia
          }
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

// VALIDACIÓN DEL FORMULARIO DE CREAR PRODUCTO
function validarFormularioProducto(event) {
  event.preventDefault();

  // reglas para TODOS los campos en un solo lugar
  const reglasValidacion = [
    // Textos
    {
      id: "crear-codebar",
      tipo: "texto",
      min: 3,
      mensaje: "El código de barras debe tener al menos 3 caracteres.",
    },
    {
      id: "crear-producto",
      tipo: "texto",
      min: 3,
      mensaje: "El nombre del producto debe tener al menos 3 caracteres.",
    },
    {
      id: "crear-descprod",
      tipo: "texto",
      min: 3,
      mensaje: "La descripción debe tener al menos 3 caracteres.",
    },

    // Selects (Listas desplegables)
    {
      id: "crear-categoria",
      tipo: "select",
      mensaje: "Debes seleccionar una Categoría.",
    },
    {
      id: "crear-marca",
      tipo: "select",
      mensaje: "Debes seleccionar una Marca.",
    },
    {
      id: "crear-proveedor",
      tipo: "select",
      mensaje: "Debes seleccionar un Proveedor.",
    },
    {
      id: "crear-umedida",
      tipo: "select",
      mensaje: "Debes seleccionar una Unidad de Medida.",
    },
    {
      id: "crear-impuesto",
      tipo: "select",
      mensaje: "Debes seleccionar un Impuesto.",
    },

    // Números (Costos y Precios)
    {
      id: "crear-costo_compra",
      tipo: "numero",
      minVal: 0.01,
      mensaje: "El costo de compra debe ser mayor a $0.",
    },
    {
      id: "crear-ganancia",
      tipo: "numero",
      minVal: 0,
      mensaje: "El porcentaje de ganancia no puede ser negativo.",
    },
    {
      id: "crear-precio1",
      tipo: "numero",
      minVal: 0.01,
      mensaje:
        "El precio final debe ser mayor a $0 (calcula el costo y ganancia).",
    },
    {
      id: "crear-stock_minimo",
      tipo: "numero",
      minVal: 0,
      mensaje: "El stock mínimo no puede ser negativo.",
    },
  ];

  const errores = [];
  let primerCampoConError = null;

  reglasValidacion.forEach((regla) => {
    const elemento = document.getElementById(regla.id);
    if (!elemento) return; // Si el campo no existe en el HTML, lo ignora

    let valor = elemento.value.trim();
    let esValido = true;

    //  borde rojo desaparezca cuando el usuario corrija el error
    if (regla.tipo === "select") {
      // Los selects usan 'change' cuando eliges una opción
      elemento.addEventListener("change", function () {
        if (this.value.trim() !== "") this.classList.remove("input-error");
      });
    } else {
      // Los inputs de texto/número usan 'input' cuando escribes
      elemento.addEventListener("input", function () {
        this.classList.remove("input-error");
      });
    }

    // Evaluar si el campo pasa la prueba
    if (regla.tipo === "texto") {
      if (valor.length < regla.min) esValido = false;
    } else if (regla.tipo === "select") {
      if (valor === "") esValido = false;
    } else if (regla.tipo === "numero") {
      let num = parseFloat(valor);
      if (isNaN(num) || num < regla.minVal) esValido = false;
    }

    // Aplica el estilo rojo y guardar el mensaje si falló
    if (!esValido) {
      errores.push(`<li>${regla.mensaje}</li>`); // Lo guardamos como elemento de lista HTML
      elemento.classList.add("input-error");

      // Guardamos el primer elemento que falló para hacerle "focus" al final
      if (!primerCampoConError) primerCampoConError = elemento;
    } else {
      elemento.classList.remove("input-error"); // Por si estaba rojo de un error anterior
    }
  });

  //  Si se encontraron errores, mostrar la alerta estructurada
  if (errores.length > 0) {
    // Quitar el cursor por seguridad
    if (document.activeElement) {
      document.activeElement.blur();
    }

    Swal.fire({
      title: "Faltan datos",
      html: `<ul style="text-align: left; font-size: 14px; color: #d33;">${errores.join("")}</ul>`,
      icon: "warning",
      confirmButtonColor: "#3085d6",
      confirmButtonText: "Entendido",
      // Esperamos a que la alerta desaparezca al 100%
      didClose: () => {
        if (primerCampoConError) primerCampoConError.focus();
      },
    });

    return;
  }

  // Si pasa las validaciones visuales, verificamos duplicados en la BD
  const codebar = document.getElementById("crear-codebar").value.trim();
  const producto = document.getElementById("crear-producto").value.trim();

  verificarDuplicadoProducto(codebar, producto)
    .then((esDuplicado) => {
      if (esDuplicado) {
        return; // Detener la ejecución si hay duplicados (tu función ya lanza su propia alerta)
      }
      // ¡Todo perfecto! Enviamos el formulario al servidor
      procesarFormularioProducto(event, "crear");
    })
    .catch((error) => {
      console.error("Error al verificar duplicados:", error);
      Swal.fire(
        "Error",
        "Ocurrió un problema al validar el producto en la base de datos.",
        "error",
      );
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
// VALIDACIÓN DEL FORMULARIO DE EDICIÓN PRODUCTO
async function validarFormularioEdicionProducto(formulario) {
  //  las reglas exactas para los campos de EDICIÓN (id empieza con "editar-")
  const reglasValidacion = [
    // Textos
    {
      id: "editar-codebar",
      tipo: "texto",
      min: 3,
      mensaje: "El código de barras debe tener al menos 3 caracteres.",
    },
    {
      id: "editar-producto",
      tipo: "texto",
      min: 3,
      mensaje: "El nombre del producto debe tener al menos 3 caracteres.",
    },
    {
      id: "editar-descprod",
      tipo: "texto",
      min: 3,
      mensaje: "La descripción debe tener al menos 3 caracteres.",
    },

    // Selects (Listas desplegables)
    {
      id: "editar-categoria",
      tipo: "select",
      mensaje: "Debes seleccionar una Categoría.",
    },
    {
      id: "editar-marca",
      tipo: "select",
      mensaje: "Debes seleccionar una Marca.",
    },
    {
      id: "editar-proveedor",
      tipo: "select",
      mensaje: "Debes seleccionar un Proveedor.",
    },
    {
      id: "editar-umedida",
      tipo: "select",
      mensaje: "Debes seleccionar una Unidad de Medida.",
    },
    {
      id: "editar-impuesto",
      tipo: "select",
      mensaje: "Debes seleccionar un Impuesto.",
    },

    // Números (Costos y Precios)
    {
      id: "editar-costo_compra",
      tipo: "numero",
      minVal: 0.01,
      mensaje: "El costo de compra debe ser mayor a $0.",
    },
    {
      id: "editar-ganancia",
      tipo: "numero",
      minVal: 0,
      mensaje: "El porcentaje de ganancia no puede ser negativo.",
    },
    {
      id: "editar-stock_minimo",
      tipo: "numero",
      minVal: 0,
      mensaje: "El stock mínimo no puede ser negativo.",
    },
  ];

  const errores = [];
  let primerCampoConError = null;

  // El "Motor" que revisa cada regla automáticamente
  reglasValidacion.forEach((regla) => {
    const elemento = document.getElementById(regla.id);
    if (!elemento) return; // Si no lo encuentra, lo salta para no romper el código

    let valor = elemento.value.trim();
    let esValido = true;

    //  Programar que el borde rojo desaparezca al corregir
    if (regla.tipo === "select") {
      elemento.addEventListener("change", function () {
        if (this.value.trim() !== "") this.classList.remove("input-error");
      });
    } else {
      elemento.addEventListener("input", function () {
        this.classList.remove("input-error");
      });
    }

    // Evaluar si el campo pasa la prueba
    if (regla.tipo === "texto") {
      if (valor.length < regla.min) esValido = false;
    } else if (regla.tipo === "select") {
      if (valor === "") esValido = false;
    } else if (regla.tipo === "numero") {
      let num = parseFloat(valor);
      if (isNaN(num) || num < regla.minVal) esValido = false;
    }

    //  Aplicar el estilo rojo y guardar el mensaje si falló
    if (!esValido) {
      errores.push(`<li>${regla.mensaje}</li>`);
      elemento.classList.add("input-error");
      if (!primerCampoConError) primerCampoConError = elemento;
    } else {
      elemento.classList.remove("input-error");
    }
  });

  // Si hay errores visuales, mostramos la alerta y detenemos todo
  if (errores.length > 0) {
    // Quitar el cursor por seguridad
    if (document.activeElement) {
      document.activeElement.blur();
    }

    Swal.fire({
      title: "Faltan datos",
      html: `<ul style="text-align: left; font-size: 14px; color: #d33;">${errores.join("")}</ul>`,
      icon: "warning",
      confirmButtonColor: "#3085d6",
      confirmButtonText: "Entendido",
      // Esperamos a que la alerta desaparezca al 100%
      didClose: () => {
        if (primerCampoConError) primerCampoConError.focus();
      },
    });

    return;
  }

  // Validar duplicados en la Base de Datos (Backend)
  const productoInput = document.getElementById("editar-producto");
  const codebarInput = document.getElementById("editar-codebar");
  const idInput = document.getElementById("editar-idproducto");

  if (!productoInput || !idInput || !codebarInput) return;

  const producto = productoInput.value.trim();
  const codebar = codebarInput.value.trim();
  const id = idInput.value;

  try {
    // Primero revisamos si el nombre ya lo tiene otro producto
    const esNombreDuplicado = await verificarDuplicadoEditarProducto(
      producto,
      id,
    );
    if (esNombreDuplicado) return; // Se detiene porque ya saltó la alerta de duplicado

    // Luego revisamos si el código de barras ya lo tiene otro
    const esCodebarDuplicado = await verificarDuplicadoEditarCodebar(
      codebar,
      id,
    );
    if (esCodebarDuplicado) return; // Se detiene
  } catch (error) {
    console.error("Error validando duplicados:", error);
    return;
  }

  // Pasa todas las validaciones! Enviamos al servidor
  enviarFormularioEdicionProducto(formulario);
}

// Enviar formulario de edición Producto (AQUÍ SÍ EXISTE 'data')
function enviarFormularioEdicionProducto(formulario) {
  if (!formulario) return;

  const formData = new FormData(formulario);

  // Hacemos la petición a PHP
  fetch("cruds/editar_producto.php", {
    method: "POST",
    body: formData,
  })
    .then((response) => response.json())
    .then((data) => {
      // AQUÍ ES DONDE NACE LA VARIABLE 'data' QUE MANDA EL SERVIDOR
      if (data.success) {
        Swal.fire({
          title: "¡Éxito!",
          text: data.message || "La actualización se realizó correctamente.",
          icon: "success",
          showConfirmButton: false,
          timer: 1500,
          timerProgressBar: true,
        }).then(() => {
          // Cuando termine la barrita, recargamos la tabla automáticamente
          if (document.getElementById("productos-link")) {
            document.getElementById("productos-link").click();
          }
        });

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
      Swal.fire("Error", "Ocurrió un problema al actualizar.", "error");
    });
}

// Eliminar producto ************************************************************
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
        fetch(`cruds/eliminar_producto.php?id=${id}`, { method: "POST" })
          .then((response) => response.json())
          .then((data) => {
            if (data.success) {
              Swal.fire({
                title: "¡Eliminado!",
                text:
                  data.message || "El registro se ha eliminado correctamente.",
                icon: "success",
                showConfirmButton: false,
                timer: 1500,
                timerProgressBar: true,
              }).then(() => {
                if (document.getElementById("productos-link")) {
                  document.getElementById("productos-link").click(); // Recarga limpia
                }
              });
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

// Llamar Categorias **************************************************
document
  .getElementById("categorias-link")
  .addEventListener("click", function (event) {
    event.preventDefault(); // Evita la acción por defecto del enlace
    fetch("catalogos/categorias.php")
      .then((response) => response.text())
      .then((html) => {
        document.getElementById("content-area").innerHTML = html;
        //Funcion para filtrar y buscar
        inicializarTablaGenerica(
          "#tabla-categorias",
          "#buscarboxcat",
          "#cantidad-registros",
        );
      })
      .catch((error) => {
        console.error("Error al cargar el contenido:", error);
      });
  });

function abrirModalCat(id) {
  document.getElementById(id).style.display = "flex";
}

function cerrarModalCat(id) {
  document.getElementById(id).style.display = "none";
}

// CREAR CATEGORÍA (Validación y Procesamiento) ******************************************
function validarFormularioCat(event) {
  event.preventDefault();

  const reglasValidacion = [
    {
      id: "crear-cat",
      tipo: "texto",
      min: 3,
      mensaje: "La categoría debe tener al menos 3 caracteres.",
    },
    {
      id: "crear-desc_cat",
      tipo: "texto",
      min: 3,
      mensaje: "La descripción debe tener al menos 3 caracteres.",
    },
  ];

  const errores = [];
  let primerCampoConError = null;

  reglasValidacion.forEach((regla) => {
    const elemento = document.getElementById(regla.id);
    if (!elemento) return;

    let valor = elemento.value.trim();

    elemento.addEventListener("input", function () {
      this.classList.remove("input-error");
    });

    if (valor.length < regla.min) {
      errores.push(`<li>${regla.mensaje}</li>`);
      elemento.classList.add("input-error");
      if (!primerCampoConError) primerCampoConError = elemento;
    } else {
      elemento.classList.remove("input-error");
    }
  });

  if (errores.length > 0) {
    // Quitar el cursor por seguridad
    if (document.activeElement) {
      document.activeElement.blur();
    }

    Swal.fire({
      title: "Faltan datos",
      html: `<ul style="text-align: left; font-size: 14px; color: #d33;">${errores.join("")}</ul>`,
      icon: "warning",
      confirmButtonColor: "#3085d6",
      confirmButtonText: "Entendido",
      // Esperamos a que la alerta desaparezca al 100%
      didClose: () => {
        if (primerCampoConError) primerCampoConError.focus();
      },
    });

    return;
  }

  const cat = document.getElementById("crear-cat").value.trim();
  verificarDuplicadoCat(cat).then((esDuplicado) => {
    if (!esDuplicado) procesarFormularioCat(event, "crear");
  });
}

function procesarFormularioCat(event, tipo) {
  event.preventDefault();
  const formData = new FormData(event.target);

  fetch(`cruds/procesar_${tipo}_cat.php`, {
    method: "POST",
    body: formData,
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        cerrarModalCat(tipo + "-modalCat");
        event.target.reset();

        Swal.fire({
          title: "¡Éxito!",
          text: data.message || "La acción se realizó correctamente.",
          icon: "success",
          showConfirmButton: false,
          timer: 1500,
          timerProgressBar: true,
        }).then(() => {
          // Recargamos DataTables limpiamente
          if (document.getElementById("categorias-link")) {
            document.getElementById("categorias-link").click();
          }
        });
      } else {
        Swal.fire({
          title: "Error",
          text: data.message || "Ocurrió un problema.",
          icon: "error",
        });
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      Swal.fire({
        title: "Error",
        text: "Ocurrió un error inesperado.",
        icon: "error",
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

// Editar categoria
async function validarFormularioEdicionCat(formulario) {
  const reglasValidacion = [
    {
      id: "editar-cat",
      tipo: "texto",
      min: 3,
      mensaje: "La categoría debe tener al menos 3 caracteres.",
    },
    {
      id: "editar-desc_cat",
      tipo: "texto",
      min: 3,
      mensaje: "La descripción debe tener al menos 3 caracteres.",
    },
  ];

  const errores = [];
  let primerCampoConError = null;

  reglasValidacion.forEach((regla) => {
    const elemento = document.getElementById(regla.id);
    if (!elemento) return;

    let valor = elemento.value.trim();

    elemento.addEventListener("input", function () {
      this.classList.remove("input-error");
    });

    if (valor.length < regla.min) {
      errores.push(`<li>${regla.mensaje}</li>`);
      elemento.classList.add("input-error");
      if (!primerCampoConError) primerCampoConError = elemento;
    } else {
      elemento.classList.remove("input-error");
    }
  });

  if (errores.length > 0) {
    // Quitar el cursor por seguridad
    if (document.activeElement) {
      document.activeElement.blur();
    }

    Swal.fire({
      title: "Faltan datos",
      html: `<ul style="text-align: left; font-size: 14px; color: #d33;">${errores.join("")}</ul>`,
      icon: "warning",
      confirmButtonColor: "#3085d6",
      confirmButtonText: "Entendido",
      // Esperamos a que la alerta desaparezca al 100%
      didClose: () => {
        if (primerCampoConError) primerCampoConError.focus();
      },
    });

    return;
  }

  const catInput = document.getElementById("editar-cat");
  const idInput = document.getElementById("editar-idcat");
  if (!catInput || !idInput) return;

  try {
    const esDuplicado = await verificarDuplicadoEditarCat(
      catInput.value.trim(),
      idInput.value,
    );
    if (!esDuplicado) enviarFormularioEdicionCat(formulario);
  } catch (error) {
    console.error("Error al verificar duplicado:", error);
  }
}

function enviarFormularioEdicionCat(formulario) {
  if (!formulario) return;
  const formData = new FormData(formulario);

  fetch("cruds/editar_cat.php", {
    method: "POST",
    body: formData,
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        Swal.fire({
          title: "¡Actualizado!",
          text: data.message || "Categoría actualizada correctamente.",
          icon: "success",
          showConfirmButton: false,
          timer: 1500,
          timerProgressBar: true,
        }).then(() => {
          // Recargamos DataTables limpiamente
          if (document.getElementById("categorias-link")) {
            document.getElementById("categorias-link").click();
          }
        });
        // Si la función de cerrar modal se llama cerrarModalCat, asegúrate de que diga eso:
        cerrarModalCat("editar-modalCat");
      } else {
        Swal.fire({
          title: "Atención",
          text: data.message || "No hubo cambios.",
          icon: "warning",
          showConfirmButton: false,
          timer: 1500,
          timerProgressBar: true,
        });
      }
    })
    .catch((error) => {
      console.error("Error al actualizar:", error);
      Swal.fire("Error", "Ocurrió un problema al actualizar.", "error");
    });
}

// Eliminar Categorias *********************************
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
              Swal.fire({
                title: "¡Eliminada!",
                text: data.message,
                icon: "success",
                showConfirmButton: false,
                timer: 1500,
                timerProgressBar: true,
              }).then(() => {
                // Recargamos DataTables limpiamente
                if (document.getElementById("categorias-link")) {
                  document.getElementById("categorias-link").click();
                }
              });
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

// Llamar Marcas ********************************************
document
  .getElementById("marcas-link")
  .addEventListener("click", function (event) {
    event.preventDefault(); // Evita la acción por defecto del enlace
    fetch("catalogos/marcas.php")
      .then((response) => response.text())
      .then((html) => {
        document.getElementById("content-area").innerHTML = html;
        inicializarTablaGenerica(
          "#tabla-marcas",
          "#buscarboxmarca",
          "#cantidad-registros",
        );
      })
      .catch((error) => {
        console.error("Error al cargar el contenido:", error);
      });
  });

function abrirModalMarca(id) {
  document.getElementById(id).style.display = "flex";
}

function cerrarModalMarca(id) {
  document.getElementById(id).style.display = "none";
}

// Crear Marca ******************************************
function validarFormularioMarca(event) {
  event.preventDefault();

  const reglasValidacion = [
    {
      id: "crear-marca",
      tipo: "texto",
      min: 3,
      mensaje: "La marca debe tener al menos 3 caracteres.",
    },
    {
      id: "crear-desc_marca",
      tipo: "texto",
      min: 3,
      mensaje: "La descripción debe tener al menos 3 caracteres.",
    },
  ];

  const errores = [];
  let primerCampoConError = null;

  reglasValidacion.forEach((regla) => {
    const elemento = document.getElementById(regla.id);
    if (!elemento) return;

    let valor = elemento.value.trim();

    elemento.addEventListener("input", function () {
      this.classList.remove("input-error");
    });

    if (valor.length < regla.min) {
      errores.push(`<li>${regla.mensaje}</li>`);
      elemento.classList.add("input-error");
      if (!primerCampoConError) primerCampoConError = elemento;
    } else {
      elemento.classList.remove("input-error");
    }
  });

  if (errores.length > 0) {
    // Quitar el cursor por seguridad
    if (document.activeElement) {
      document.activeElement.blur();
    }

    Swal.fire({
      title: "Faltan datos",
      html: `<ul style="text-align: left; font-size: 14px; color: #d33;">${errores.join("")}</ul>`,
      icon: "warning",
      confirmButtonColor: "#3085d6",
      confirmButtonText: "Entendido",
      // Esperamos a que la alerta desaparezca al 100%
      didClose: () => {
        if (primerCampoConError) primerCampoConError.focus();
      },
    });

    return;
  }

  const marca = document.getElementById("crear-marca").value.trim();
  verificarDuplicadoMarca(marca).then((esDuplicado) => {
    if (!esDuplicado) procesarFormularioMarca(event, "crear");
  });
}

function procesarFormularioMarca(event, tipo) {
  event.preventDefault();
  const formData = new FormData(event.target);

  fetch(`cruds/procesar_${tipo}_marca.php`, {
    method: "POST",
    body: formData,
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        cerrarModalMarca(tipo + "-modalMarca");
        event.target.reset();

        Swal.fire({
          title: "¡Éxito!",
          text: data.message || "La acción se realizó correctamente.",
          icon: "success",
          showConfirmButton: false,
          timer: 1500,
          timerProgressBar: true,
        }).then(() => {
          // Recargamos DataTables limpiamente
          if (document.getElementById("marcas-link")) {
            document.getElementById("marcas-link").click();
          }
        });
      } else {
        Swal.fire({
          title: "Error",
          text: data.message || "Ocurrió un problema.",
          icon: "error",
        });
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      Swal.fire({
        title: "Error",
        text: "Ocurrió un error inesperado.",
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
  const reglasValidacion = [
    {
      id: "editar-marca",
      tipo: "texto",
      min: 3,
      mensaje: "La marca debe tener al menos 3 caracteres.",
    },
    {
      id: "editar-desc_marca",
      tipo: "texto",
      min: 3,
      mensaje: "La descripción debe tener al menos 3 caracteres.",
    },
  ];

  const errores = [];
  let primerCampoConError = null;

  reglasValidacion.forEach((regla) => {
    const elemento = document.getElementById(regla.id);
    if (!elemento) return;

    let valor = elemento.value.trim();

    elemento.addEventListener("input", function () {
      this.classList.remove("input-error");
    });

    if (valor.length < regla.min) {
      errores.push(`<li>${regla.mensaje}</li>`);
      elemento.classList.add("input-error");
      if (!primerCampoConError) primerCampoConError = elemento;
    } else {
      elemento.classList.remove("input-error");
    }
  });

  if (errores.length > 0) {
    // Quitar el cursor por seguridad
    if (document.activeElement) {
      document.activeElement.blur();
    }

    Swal.fire({
      title: "Faltan datos",
      html: `<ul style="text-align: left; font-size: 14px; color: #d33;">${errores.join("")}</ul>`,
      icon: "warning",
      confirmButtonColor: "#3085d6",
      confirmButtonText: "Entendido",
      // Esperamos a que la alerta desaparezca al 100%
      didClose: () => {
        if (primerCampoConError) primerCampoConError.focus();
      },
    });

    return;
  }

  const marcaInput = document.getElementById("editar-marca");
  const idInput = document.getElementById("editar-idmarca");
  if (!marcaInput || !idInput) return;

  try {
    const esDuplicado = await verificarDuplicadoEditarMarca(
      marcaInput.value.trim(),
      idInput.value,
    );
    if (!esDuplicado) enviarFormularioEdicionMarca(formulario);
  } catch (error) {
    console.error("Error al verificar duplicado:", error);
  }
}

// Enviar formulario de edición Marca
function enviarFormularioEdicionMarca(formulario) {
  if (!formulario) return;
  const formData = new FormData(formulario);

  fetch("cruds/editar_marca.php", {
    method: "POST",
    body: formData,
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        Swal.fire({
          title: "¡Actualizado!",
          text: data.message || "Marca actualizada correctamente.",
          icon: "success",
          showConfirmButton: false,
          timer: 1500,
          timerProgressBar: true,
        }).then(() => {
          // Recargamos DataTables limpiamente
          if (document.getElementById("marcas-link")) {
            document.getElementById("marcas-link").click();
          }
        });
        // Si tu función de cerrar modal se llama cerrarModalMarca, asegúrate de que diga eso:
        cerrarModalMarca("editar-modalMarca");
      } else {
        Swal.fire({
          title: "Atención",
          text: data.message || "No hubo cambios.",
          icon: "warning",
          showConfirmButton: false,
          timer: 1500,
          timerProgressBar: true,
        });
      }
    })
    .catch((error) => {
      console.error("Error al actualizar:", error);
      Swal.fire("Error", "Ocurrió un problema al actualizar.", "error");
    });
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
              Swal.fire({
                title: "¡Eliminada!",
                text: data.message,
                icon: "success",
                showConfirmButton: false,
                timer: 1500,
                timerProgressBar: true,
              }).then(() => {
                // Recargamos DataTables limpiamente
                if (document.getElementById("marcas-link")) {
                  document.getElementById("marcas-link").click();
                }
              });
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

// Llamar Tipo de servicios *******************************************************
document
  .getElementById("tiposervicios-link")
  .addEventListener("click", function (event) {
    event.preventDefault(); // Evita la acción por defecto del enlace
    fetch("catalogos/tiposervicios.php")
      .then((response) => response.text())
      .then((html) => {
        document.getElementById("content-area").innerHTML = html;
        //Funcion para filtrar y buscar
        inicializarTablaGenerica(
          "#tabla-tiposervicios",
          "#buscarboxTiposervicios",
          "#cantidad-registros",
        );
      })
      .catch((error) => {
        console.error("Error al cargar el contenido:", error);
      });
  });

function abrirModalTiposervicios(id) {
  document.getElementById(id).style.display = "flex";
}

function cerrarModalTiposervicios(id) {
  document.getElementById(id).style.display = "none";
}

// Crear tipo de servicios ******************************************
function validarFormularioTiposervicios(event) {
  event.preventDefault();

  const reglasValidacion = [
    {
      id: "crear-tiposervicios",
      tipo: "texto",
      min: 3,
      mensaje: "El tipo de servicios debe tener al menos 3 caracteres.",
    },
    {
      id: "crear-desc_tiposervicios",
      tipo: "texto",
      min: 3,
      mensaje: "La descripción debe tener al menos 3 caracteres.",
    },
  ];

  const errores = [];
  let primerCampoConError = null;

  reglasValidacion.forEach((regla) => {
    const elemento = document.getElementById(regla.id);
    if (!elemento) return;

    let valor = elemento.value.trim();

    elemento.addEventListener("input", function () {
      this.classList.remove("input-error");
    });

    if (valor.length < regla.min) {
      errores.push(`<li>${regla.mensaje}</li>`);
      elemento.classList.add("input-error");
      if (!primerCampoConError) primerCampoConError = elemento;
    } else {
      elemento.classList.remove("input-error");
    }
  });

  if (errores.length > 0) {
    // Quitar el cursor por seguridad
    if (document.activeElement) {
      document.activeElement.blur();
    }

    Swal.fire({
      title: "Faltan datos",
      html: `<ul style="text-align: left; font-size: 14px; color: #d33;">${errores.join("")}</ul>`,
      icon: "warning",
      confirmButtonColor: "#3085d6",
      confirmButtonText: "Entendido",
      // Esperamos a que la alerta desaparezca al 100%
      didClose: () => {
        if (primerCampoConError) primerCampoConError.focus();
      },
    });

    return;
  }

  const tiposervicios = document
    .getElementById("crear-tiposervicios")
    .value.trim();
  verificarDuplicadoTiposervicios(tiposervicios).then((esDuplicado) => {
    if (!esDuplicado) procesarFormularioTiposervicios(event, "crear");
  });
}

function procesarFormularioTiposervicios(event, tipo) {
  event.preventDefault();
  const formData = new FormData(event.target);

  fetch(`cruds/procesar_${tipo}_tiposervicios.php`, {
    method: "POST",
    body: formData,
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        cerrarModalTiposervicios(tipo + "-modalTiposervicios");
        event.target.reset();

        Swal.fire({
          title: "¡Éxito!",
          text: data.message || "La acción se realizó correctamente.",
          icon: "success",
          showConfirmButton: false,
          timer: 1500,
          timerProgressBar: true,
        }).then(() => {
          // Recargamos DataTables limpiamente
          if (document.getElementById("tiposervicios-link")) {
            document.getElementById("tiposervicios-link").click();
          }
        });
      } else {
        Swal.fire({
          title: "Error",
          text: data.message || "Ocurrió un problema.",
          icon: "error",
        });
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      Swal.fire({
        title: "Error",
        text: "Ocurrió un error inesperado.",
        icon: "error",
      });
    });
}

function verificarDuplicadoTiposervicios(tiposervicios) {
  //console.log("Nombre verificar duplicado:", nombre_tiposervicios);

  return fetch("cruds/verificar_nombre_tiposervicios.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tiposervicios }),
  })
    .then((response) => response.json())
    .then((data) => {
      //console.log("Respuesta de verificar_nombre.php:", data);
      if (data.existe) {
        //mostrarAlerta("error", "Error", "El nombre de la tiposervicios ya existe.");
        Swal.fire({
          title: "!Atención¡",
          text: "El nombre del tipo de servicios ya existe.",
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

// Editar tipo de servicios ***********************************
document.addEventListener("DOMContentLoaded", function () {
  // Escuchar clic en el botón de editar
  document.addEventListener("click", function (event) {
    if (event.target.classList.contains("editarTiposervicio")) {
      const id = event.target.dataset.id;

      fetch(`cruds/obtener_tiposervicios.php?id=${id}`)
        .then((response) => response.json())
        .then((data) => {
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
                const input = formularioTiposervicios[`editar-${campo}`];
                if (input) {
                  input.value = data.tiposervicios[campo] || "";
                }
              });
              abrirModalTiposervicios("editar-modalTiposervicio");
            }
          } else {
            Swal.fire(
              "Error",
              data.message || "No se pudo cargar el tipo de servicio.",
              "error",
            );
          }
        })
        .catch((error) => {
          console.error("Error al obtener el Tipo de servicio:", error);
          Swal.fire(
            "Error",
            "Ocurrió un problema al obtener los datos.",
            "error",
          );
        });
    }
  });

  // Escuchar el submit del formulario de edición
  document.body.addEventListener("submit", function (event) {
    if (event.target && event.target.id === "form-editarTiposervicio") {
      event.preventDefault();
      validarFormularioEdicionTiposervicio(event.target);
    }
  });
});

// Verificar duplicado al editar
function verificarDuplicadoEditarTiposervicio(tiposervicio, id = 0) {
  return fetch("cruds/verificar_nombre_tiposervicios.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tiposervicio, id }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.existe) {
        Swal.fire({
          title: "¡Atención!",
          text: data.message || "El nombre del tipo de servicio ya existe.",
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
      return true;
    });
}

// Validación del Motor de Reglas
async function validarFormularioEdicionTiposervicio(formulario) {
  // Los IDs aquí ya coinciden exactamente con tu HTML
  const reglasValidacion = [
    {
      id: "editar-tiposervicio",
      tipo: "texto",
      min: 3,
      mensaje: "El tipo de servicio debe tener al menos 3 caracteres.",
    },
    {
      id: "editar-desc_servicio",
      tipo: "texto",
      min: 3,
      mensaje: "La descripción debe tener al menos 3 caracteres.",
    },
  ];

  const errores = [];
  let primerCampoConError = null;

  reglasValidacion.forEach((regla) => {
    const elemento = document.getElementById(regla.id);
    if (!elemento) return;

    let valor = elemento.value.trim();

    elemento.addEventListener("input", function () {
      this.classList.remove("input-error");
    });

    if (valor.length < regla.min) {
      errores.push(`<li>${regla.mensaje}</li>`);
      elemento.classList.add("input-error");
      if (!primerCampoConError) primerCampoConError = elemento;
    } else {
      elemento.classList.remove("input-error");
    }
  });

  if (errores.length > 0) {
    // Quitar el cursor por seguridad
    if (document.activeElement) {
      document.activeElement.blur();
    }

    Swal.fire({
      title: "Faltan datos",
      html: `<ul style="text-align: left; font-size: 14px; color: #d33;">${errores.join("")}</ul>`,
      icon: "warning",
      confirmButtonColor: "#3085d6",
      confirmButtonText: "Entendido",
      // Esperamos a que la alerta desaparezca al 100%
      didClose: () => {
        if (primerCampoConError) primerCampoConError.focus();
      },
    });

    return;
  }

  // IDs corregidos para buscar en el DOM
  const tiposerviciosInput = document.getElementById("editar-tiposervicio");
  const idInput = document.getElementById("editar-idtiposervicio");

  if (!tiposerviciosInput || !idInput) return;

  try {
    const esDuplicado = await verificarDuplicadoEditarTiposervicio(
      tiposerviciosInput.value.trim(),
      idInput.value,
    );
    // Cambiamos el nombre de la función aquí para que no llame a Categorías
    if (!esDuplicado) enviarFormularioEdicionTiposervicio(formulario);
  } catch (error) {
    console.error("Error al verificar duplicado:", error);
  }
}

// Enviar a la Base de Datos
function enviarFormularioEdicionTiposervicio(formulario) {
  if (!formulario) return;
  const formData = new FormData(formulario);

  fetch("cruds/editar_tiposervicios.php", {
    method: "POST",
    body: formData,
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        Swal.fire({
          title: "¡Actualizado!",
          text: data.message || "Tipo de servicio actualizado correctamente.",
          icon: "success",
          showConfirmButton: false,
          timer: 1500,
          timerProgressBar: true,
        }).then(() => {
          // Cambiado a tiposervicios-link
          if (document.getElementById("tiposervicios-link")) {
            document.getElementById("tiposervicios-link").click();
          }
        });

        // Cerrar el modal con el ID y función correcta
        cerrarModalTiposervicios("editar-modalTiposervicio");
      } else {
        Swal.fire({
          title: "Atención",
          text: data.message || "No se realizaron cambios.",
          icon: "warning",
          showConfirmButton: false,
          timer: 1500,
          timerProgressBar: true,
        });
      }
    })
    .catch((error) => {
      console.error("Error al actualizar Tipo de servicio:", error);
      Swal.fire("Error", "Ocurrió un problema al actualizar.", "error");
    });
}

// Eliminar Tipo de servicios *********************************************
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
              Swal.fire({
                title: "¡Eliminada!",
                text: data.message,
                icon: "success",
                showConfirmButton: false,
                timer: 1500,
                timerProgressBar: true,
              }).then(() => {
                // Recargamos DataTables limpiamente
                if (document.getElementById("tiposervicios-link")) {
                  document.getElementById("tiposervicios-link").click();
                }
              });
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

//Llamar estado de servicio *******************************************
document
  .getElementById("estatusservicios-link")
  .addEventListener("click", function (event) {
    event.preventDefault(); // Evita la acción por defecto del enlace
    fetch("catalogos/estatusservicios.php")
      .then((response) => response.text())
      .then((html) => {
        document.getElementById("content-area").innerHTML = html;
        //Funcion para filtrar y buscar
        inicializarTablaGenerica(
          "#tabla-estadoservicio",
          "#buscarboxEstadoservicios",
          "#cantidad-registros",
        );
      })
      .catch((error) => {
        console.error("Error al cargar el contenido:", error);
      });
  });

function abrirModalEstadoservicio(id) {
  document.getElementById(id).style.display = "flex";
}

function cerrarModalEstadoservicio(id) {
  document.getElementById(id).style.display = "none";
}
// Crear Estado de servicios ******************************************
function validarFormularioEstadoservicio(event) {
  event.preventDefault();

  const reglasValidacion = [
    {
      id: "crear-estadoservicio",
      tipo: "texto",
      min: 3,
      mensaje: "El estado de servicio debe tener al menos 3 caracteres.",
    },
    {
      id: "crear-desc_estadoservicio",
      tipo: "texto",
      min: 3,
      mensaje: "La descripción debe tener al menos 3 caracteres.",
    },
  ];

  const errores = [];
  let primerCampoConError = null;

  reglasValidacion.forEach((regla) => {
    const elemento = document.getElementById(regla.id);
    if (!elemento) return;

    let valor = elemento.value.trim();

    elemento.addEventListener("input", function () {
      this.classList.remove("input-error");
    });

    if (valor.length < regla.min) {
      errores.push(`<li>${regla.mensaje}</li>`);
      elemento.classList.add("input-error");
      if (!primerCampoConError) primerCampoConError = elemento;
    } else {
      elemento.classList.remove("input-error");
    }
  });

  if (errores.length > 0) {
    // Quitar el cursor por seguridad
    if (document.activeElement) {
      document.activeElement.blur();
    }

    Swal.fire({
      title: "Faltan datos",
      html: `<ul style="text-align: left; font-size: 14px; color: #d33;">${errores.join("")}</ul>`,
      icon: "warning",
      confirmButtonColor: "#3085d6",
      confirmButtonText: "Entendido",
      // Esperamos a que la alerta desaparezca al 100%
      didClose: () => {
        if (primerCampoConError) primerCampoConError.focus();
      },
    });

    return;
  }

  const estadoservicio = document
    .getElementById("crear-estadoservicio")
    .value.trim();
  verificarDuplicadoEstadoservicio(estadoservicio).then((esDuplicado) => {
    if (!esDuplicado) procesarFormularioEstadoservicio(event, "crear");
  });
}

function procesarFormularioEstadoservicio(event, tipo) {
  event.preventDefault();
  const formData = new FormData(event.target);

  fetch(`cruds/procesar_${tipo}_estadoservicios.php`, {
    method: "POST",
    body: formData,
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        cerrarModalEstadoservicio(tipo + "-modalEstadoservicio");
        event.target.reset();

        Swal.fire({
          title: "¡Éxito!",
          text: data.message || "La acción se realizó correctamente.",
          icon: "success",
          showConfirmButton: false,
          timer: 1500,
          timerProgressBar: true,
        }).then(() => {
          // Recargamos DataTables limpiamente
          if (document.getElementById("estatusservicios-link")) {
            document.getElementById("estatusservicios-link").click();
          }
        });
      } else {
        Swal.fire({
          title: "Error",
          text: data.message || "Ocurrió un problema.",
          icon: "error",
        });
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      Swal.fire({
        title: "Error",
        text: "Ocurrió un error inesperado.",
        icon: "error",
      });
    });
}

function verificarDuplicadoEstadoservicio(estadoservicio) {
  //console.log("Nombre verificar duplicado:", nombre_estadoservicio);

  return fetch("cruds/verificar_nombre_estadoservicios.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ estadoservicio }),
  })
    .then((response) => response.json())
    .then((data) => {
      //console.log("Respuesta de verificar_nombre.php:", data);
      if (data.existe) {
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

  // Validar y enviar el formulario de edición estadoservicio
  document.body.addEventListener("submit", function (event) {
    if (event.target && event.target.id === "form-editarEstadoservicio") {
      event.preventDefault(); // Esto evita el comportamiento predeterminado de recargar la página.
      validarFormularioEdicionEstadoservicio(event.target);
    }
  });
});

//Verificar dublicado al editar estadoservicio
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
  const reglasValidacion = [
    {
      id: "editar-estadoservicio",
      tipo: "texto",
      min: 3,
      mensaje: "El estado de servicio debe tener al menos 3 caracteres.",
    },
    {
      id: "editar-desc_servicio",
      tipo: "texto",
      min: 3,
      mensaje: "La descripción debe tener al menos 3 caracteres.",
    },
  ];

  const errores = [];
  let primerCampoConError = null;

  reglasValidacion.forEach((regla) => {
    const elemento = document.getElementById(regla.id);
    if (!elemento) return;

    let valor = elemento.value.trim();

    elemento.addEventListener("input", function () {
      this.classList.remove("input-error");
    });

    if (valor.length < regla.min) {
      errores.push(`<li>${regla.mensaje}</li>`);
      elemento.classList.add("input-error");
      if (!primerCampoConError) primerCampoConError = elemento;
    } else {
      elemento.classList.remove("input-error");
    }
  });

  if (errores.length > 0) {
    // Quitar el cursor por seguridad
    if (document.activeElement) {
      document.activeElement.blur();
    }

    Swal.fire({
      title: "Faltan datos",
      html: `<ul style="text-align: left; font-size: 14px; color: #d33;">${errores.join("")}</ul>`,
      icon: "warning",
      confirmButtonColor: "#3085d6",
      confirmButtonText: "Entendido",
      // Esperamos a que la alerta desaparezca al 100%
      didClose: () => {
        if (primerCampoConError) primerCampoConError.focus();
      },
    });

    return;
  }

  const estadoservicioInput = document.getElementById("editar-estadoservicio");
  const idInput = document.getElementById("editar-idestadoservicio");
  if (!estadoservicioInput || !idInput) return;

  try {
    const esDuplicado = await verificarDuplicadoEditarEstadoservicio(
      estadoservicioInput.value.trim(),
      idInput.value,
    );
    if (!esDuplicado) enviarFormularioEdicionEstadoservicio(formulario);
  } catch (error) {
    console.error("Error al verificar duplicado:", error);
  }
}

function enviarFormularioEdicionEstadoservicio(formulario) {
  if (!formulario) return;
  const formData = new FormData(formulario);

  fetch("cruds/editar_estadosservicios.php", {
    method: "POST",
    body: formData,
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        Swal.fire({
          title: "¡Actualizado!",
          text: data.message || "Estado de servicio actualizado correctamente.",
          icon: "success",
          showConfirmButton: false,
          timer: 1500,
          timerProgressBar: true,
        }).then(() => {
          // Recargamos DataTables limpiamente
          if (document.getElementById("estatusservicios-link")) {
            document.getElementById("estatusservicios-link").click();
          }
        });
        // Si tu función de cerrar modal se llama cerrarModalEstadoservicio, asegúrate de que diga eso:
        cerrarModalEstadoservicio("editar-modalEstadoservicio");
      } else {
        Swal.fire({
          title: "Atención",
          text: data.message || "No hubo cambios.",
          icon: "warning",
          showConfirmButton: false,
          timer: 1500,
          timerProgressBar: true,
        });
      }
    })
    .catch((error) => {
      console.error("Error al actualizar:", error);
      Swal.fire("Error", "Ocurrió un problema al actualizar.", "error");
    });
}

// Eliminar Estado de servicios *******************************************
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
              Swal.fire({
                title: "¡Eliminada!",
                text: data.message,
                icon: "success",
                showConfirmButton: false,
                timer: 1500,
                timerProgressBar: true,
              }).then(() => {
                // Recargamos DataTables limpiamente
                if (document.getElementById("estatusservicios-link")) {
                  document.getElementById("estatusservicios-link").click();
                }
              });
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

// Llamar Metodos de pago *****************************************************
document
  .getElementById("mpagos-link")
  .addEventListener("click", function (event) {
    event.preventDefault(); // Evita la acción por defecto del enlace
    fetch("catalogos/mpagos.php")
      .then((response) => response.text())
      .then((html) => {
        document.getElementById("content-area").innerHTML = html;

        inicializarTablaGenerica(
          "#tabla-mpagos",
          "#buscarboxmpago",
          "#cantidad-registros",
        );
      })
      .catch((error) => {
        console.error("Error al cargar el contenido:", error);
      });
  });

function abrirModalMpago(id) {
  document.getElementById(id).style.display = "flex";
}

function cerrarModalMpago(id) {
  document.getElementById(id).style.display = "none";
}

//Crear Métodos de pagos ****************************
function validarFormularioMpago(event) {
  event.preventDefault();

  const reglasValidacion = [
    {
      id: "crear-mpago",
      tipo: "texto",
      min: 3,
      mensaje: "El método de pago debe tener al menos 3 caracteres.",
    },
    {
      id: "crear-desc_mpago",
      tipo: "texto",
      min: 3,
      mensaje: "La descripción debe tener al menos 3 caracteres.",
    },
  ];

  const errores = [];
  let primerCampoConError = null;

  reglasValidacion.forEach((regla) => {
    const elemento = document.getElementById(regla.id);
    if (!elemento) return;

    let valor = elemento.value.trim();

    elemento.addEventListener("input", function () {
      this.classList.remove("input-error");
    });

    if (valor.length < regla.min) {
      errores.push(`<li>${regla.mensaje}</li>`);
      elemento.classList.add("input-error");
      if (!primerCampoConError) primerCampoConError = elemento;
    } else {
      elemento.classList.remove("input-error");
    }
  });

  if (errores.length > 0) {
    // Quitar el cursor por seguridad
    if (document.activeElement) {
      document.activeElement.blur();
    }

    Swal.fire({
      title: "Faltan datos",
      html: `<ul style="text-align: left; font-size: 14px; color: #d33;">${errores.join("")}</ul>`,
      icon: "warning",
      confirmButtonColor: "#3085d6",
      confirmButtonText: "Entendido",
      // Esperamos a que la alerta desaparezca al 100%
      didClose: () => {
        if (primerCampoConError) primerCampoConError.focus();
      },
    });

    return;
  }

  const mpago = document.getElementById("crear-mpago").value.trim();
  verificarDuplicadoMpago(mpago).then((esDuplicado) => {
    if (!esDuplicado) procesarFormularioMpago(event, "crear");
  });
}

function procesarFormularioMpago(event, tipo) {
  event.preventDefault();
  const formData = new FormData(event.target);

  fetch(`cruds/procesar_${tipo}_mpago.php`, {
    method: "POST",
    body: formData,
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        cerrarModalMpago(tipo + "-modalMpago");
        event.target.reset();

        Swal.fire({
          title: "¡Éxito!",
          text: data.message || "La acción se realizó correctamente.",
          icon: "success",
          showConfirmButton: false,
          timer: 1500,
          timerProgressBar: true,
        }).then(() => {
          // Recargamos DataTables limpiamente
          if (document.getElementById("mpagos-link")) {
            document.getElementById("mpagos-link").click();
          }
        });
      } else {
        Swal.fire({
          title: "Error",
          text: data.message || "Ocurrió un problema.",
          icon: "error",
        });
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      Swal.fire({
        title: "Error",
        text: "Ocurrió un error inesperado.",
        icon: "error",
      });
    });
}

function verificarDuplicadoMpago(mpago) {
  //console.log("Nombre verificar duplicado:", nombre_mpago);

  return fetch("cruds/verificar_nombre_mpago.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mpago }),
  })
    .then((response) => response.json())
    .then((data) => {
      //console.log("Respuesta de verificar_nombre.php:", data);
      if (data.existe) {
        //mostrarAlerta("error", "Error", "El nombre del método de pago ya existe.");
        Swal.fire({
          title: "!Atención¡",
          text: "El nombre del método de pago ya existe.",
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

//Editar Métodos de pago ******************************************************
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
  const reglasValidacion = [
    {
      id: "editar-mpago",
      tipo: "texto",
      min: 3,
      mensaje: "El método de pago debe tener al menos 3 caracteres.",
    },
    {
      id: "editar-desc_mpago",
      tipo: "texto",
      min: 3,
      mensaje: "La descripción debe tener al menos 3 caracteres.",
    },
  ];

  const errores = [];
  let primerCampoConError = null;

  reglasValidacion.forEach((regla) => {
    const elemento = document.getElementById(regla.id);
    if (!elemento) return;

    let valor = elemento.value.trim();

    elemento.addEventListener("input", function () {
      this.classList.remove("input-error");
    });

    if (valor.length < regla.min) {
      errores.push(`<li>${regla.mensaje}</li>`);
      elemento.classList.add("input-error");
      if (!primerCampoConError) primerCampoConError = elemento;
    } else {
      elemento.classList.remove("input-error");
    }
  });

  if (errores.length > 0) {
    // Quitar el cursor por seguridad
    if (document.activeElement) {
      document.activeElement.blur();
    }

    Swal.fire({
      title: "Faltan datos",
      html: `<ul style="text-align: left; font-size: 14px; color: #d33;">${errores.join("")}</ul>`,
      icon: "warning",
      confirmButtonColor: "#3085d6",
      confirmButtonText: "Entendido",
      // Esperamos a que la alerta desaparezca al 100%
      didClose: () => {
        if (primerCampoConError) primerCampoConError.focus();
      },
    });

    return;
  }

  const mpagoInput = document.getElementById("editar-mpago");
  const idInput = document.getElementById("editar-idmpago");
  if (!mpagoInput || !idInput) return;

  try {
    const esDuplicado = await verificarDuplicadoEditarMpago(
      mpagoInput.value.trim(),
      idInput.value,
    );
    if (!esDuplicado) enviarFormularioEdicionMpago(formulario);
  } catch (error) {
    console.error("Error al verificar duplicado:", error);
  }
}

function enviarFormularioEdicionMpago(formulario) {
  if (!formulario) return;
  const formData = new FormData(formulario);

  fetch("cruds/editar_mpago.php", {
    method: "POST",
    body: formData,
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        Swal.fire({
          title: "¡Actualizado!",
          text: data.message || "Método de pago actualizado correctamente.",
          icon: "success",
          showConfirmButton: false,
          timer: 1500,
          timerProgressBar: true,
        }).then(() => {
          // Recargamos DataTables limpiamente
          if (document.getElementById("mpagos-link")) {
            document.getElementById("mpagos-link").click();
          }
        });
        // Si tu función de cerrar modal se llama cerrarModalMpago, asegúrate de que diga eso:
        cerrarModalMpago("editar-modalMpago");
      } else {
        Swal.fire({
          title: "Atención",
          text: data.message || "No hubo cambios.",
          icon: "warning",
          showConfirmButton: false,
          timer: 1500,
          timerProgressBar: true,
        });
      }
    })
    .catch((error) => {
      console.error("Error al actualizar:", error);
      Swal.fire("Error", "Ocurrió un problema al actualizar.", "error");
    });
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
              Swal.fire({
                title: "¡Eliminado!",
                text: data.message,
                icon: "success",
                showConfirmButton: false,
                timer: 1500,
                timerProgressBar: true,
              }).then(() => {
                // Recargamos DataTables limpiamente
                if (document.getElementById("mpagos-link")) {
                  document.getElementById("mpagos-link").click();
                }
              });
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

// Llamar Impuestos***************************************************
document
  .getElementById("impuestos-link")
  .addEventListener("click", function (event) {
    event.preventDefault(); // Evita la acción por defecto del enlace
    fetch("catalogos/impuestos.php")
      .then((response) => response.text())
      .then((html) => {
        document.getElementById("content-area").innerHTML = html;
        inicializarTablaGenerica(
          "#tabla-impuestos",
          "#buscarboximpuesto",
          "#cantidad-registros",
        );
      })
      .catch((error) => {
        console.error("Error al cargar el contenido:", error);
      });
  });

function abrirModalImpuesto(id) {
  document.getElementById(id).style.display = "flex";
}

function cerrarModalImpuesto(id) {
  document.getElementById(id).style.display = "none";
}

//Crear Impuestos ***************************************
function validarFormularioImpuesto(event) {
  event.preventDefault();

  // Definimos las reglas (¡Adiós descripción, hola número!)
  const reglasValidacion = [
    {
      id: "crear-impuesto",
      tipo: "texto",
      min: 3,
      mensaje: "El nombre del impuesto debe tener al menos 3 caracteres.",
    },
    {
      id: "crear-tasa",
      tipo: "numero",
      minVal: 0,
      mensaje: "La tasa debe ser un número mayor o igual a 0.",
    },
  ];

  const errores = [];
  let primerCampoConError = null;

  //Recorremos las reglas
  reglasValidacion.forEach((regla) => {
    const elemento = document.getElementById(regla.id);
    if (!elemento) return;

    let valor = elemento.value.trim();
    let esValido = true; // Asumimos que es válido hasta demostrar lo contrario

    elemento.addEventListener("input", function () {
      this.classList.remove("input-error");
    });

    // Evaluamos según el tipo de campo
    if (regla.tipo === "texto") {
      if (valor.length < regla.min) esValido = false;
    } else if (regla.tipo === "numero") {
      let num = parseFloat(valor);
      // Es inválido si está vacío, si no es un número (isNaN) o si es menor a 0
      if (valor === "" || isNaN(num) || num < regla.minVal) esValido = false;
    }

    // Aplicamos los estilos de error
    if (!esValido) {
      errores.push(`<li>${regla.mensaje}</li>`);
      elemento.classList.add("input-error");
      if (!primerCampoConError) primerCampoConError = elemento;
    } else {
      elemento.classList.remove("input-error");
    }
  });

  if (errores.length > 0) {
    // Quitar el cursor por seguridad
    if (document.activeElement) {
      document.activeElement.blur();
    }

    Swal.fire({
      title: "Faltan datos",
      html: `<ul style="text-align: left; font-size: 14px; color: #d33;">${errores.join("")}</ul>`,
      icon: "warning",
      confirmButtonColor: "#3085d6",
      confirmButtonText: "Entendido",
      // Esperamos a que la alerta desaparezca al 100%
      didClose: () => {
        if (primerCampoConError) primerCampoConError.focus();
      },
    });

    return;
  }

  const impuesto = document.getElementById("crear-impuesto").value.trim();
  verificarDuplicadoImpuesto(impuesto).then((esDuplicado) => {
    if (!esDuplicado) procesarFormularioImpuesto(event, "crear");
  });
}

function procesarFormularioImpuesto(event, tipo) {
  event.preventDefault();
  const formData = new FormData(event.target);

  fetch(`cruds/procesar_${tipo}_impuesto.php`, {
    method: "POST",
    body: formData,
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        cerrarModalImpuesto(tipo + "-modalImpuesto");
        event.target.reset();

        Swal.fire({
          title: "¡Éxito!",
          text: data.message || "La acción se realizó correctamente.",
          icon: "success",
          showConfirmButton: false,
          timer: 1500,
          timerProgressBar: true,
        }).then(() => {
          // Recargamos DataTables limpiamente
          if (document.getElementById("impuestos-link")) {
            document.getElementById("impuestos-link").click();
          }
        });
      } else {
        Swal.fire({
          title: "Error",
          text: data.message || "Ocurrió un problema.",
          icon: "error",
        });
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      Swal.fire({
        title: "Error",
        text: "Ocurrió un error inesperado.",
        icon: "error",
      });
    });
}

function verificarDuplicadoImpuesto(impuesto) {
  //console.log("Nombre verificar duplicado:", nombre_impuesto);

  return fetch("cruds/verificar_nombre_impuesto.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ impuesto }),
  })
    .then((response) => response.json())
    .then((data) => {
      //console.log("Respuesta de verificar_nombre.php:", data);
      if (data.existe) {
        //mostrarAlerta("error", "Error", "El nombre de la impuesto ya existe.");
        Swal.fire({
          title: "!Atención¡",
          text: "El nombre del impuesto ya existe.",
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

//Editar Impuestos ***********************************************************
// Escuchar clic en el botón de editar y cargar los datos
document.addEventListener("click", function (event) {
  if (event.target.classList.contains("editarImpuesto")) {
    const id = event.target.dataset.id;

    fetch(`cruds/obtener_impuesto.php?id=${id}`)
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          const formularioImpuesto = document.getElementById(
            "form-editarImpuesto",
          );
          if (formularioImpuesto) {
            const campos = ["idimpuesto", "impuesto", "tasa", "estatus"];

            campos.forEach((campo) => {
              const input = formularioImpuesto[`editar-${campo}`];
              if (input) {
                input.value = data.impuesto[campo] || "";
              }
            });
            abrirModalImpuesto("editar-modalImpuesto");
          }
        } else {
          Swal.fire(
            "Error",
            data.message || "No se pudo cargar el campo.",
            "error",
          );
        }
      })
      .catch((error) => {
        console.error("Error al obtener el campo:", error);
        Swal.fire(
          "Error",
          "Ocurrió un problema al obtener los datos.",
          "error",
        );
      });
  }
});

// Escuchar el submit del formulario de edición (AQUÍ ESTÁ FUERA DEL DOMContentLoaded)
document.addEventListener("submit", function (event) {
  if (event.target && event.target.id === "form-editarImpuesto") {
    event.preventDefault();
    validarFormularioEdicionImpuesto(event.target);
  }
});

// Verificar duplicados en la base de datos
function verificarDuplicadoEditarImpuesto(impuesto, id = 0) {
  return fetch("cruds/verificar_nombre_impuesto.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ impuesto, id }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.existe) {
        Swal.fire({
          title: "Atención",
          text: data.message || "El nombre del impuesto ya existe.",
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
      return true;
    });
}

// Validación  del Formulario
async function validarFormularioEdicionImpuesto(formulario) {
  const reglasValidacion = [
    {
      id: "editar-impuesto",
      tipo: "texto",
      min: 3,
      mensaje: "El impuesto debe tener al menos 3 caracteres.",
    },
    {
      id: "editar-tasa",
      tipo: "numero",
      minVal: 0,
      mensaje: "La tasa debe ser un número mayor o igual a 0.",
    },
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

    if (regla.tipo === "texto") {
      if (valor.length < regla.min) esValido = false;
    } else if (regla.tipo === "numero") {
      let num = parseFloat(valor);
      if (valor === "" || isNaN(num) || num < regla.minVal) esValido = false;
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
    // Quitar el cursor por seguridad
    if (document.activeElement) {
      document.activeElement.blur();
    }

    Swal.fire({
      title: "Faltan datos",
      html: `<ul style="text-align: left; font-size: 14px; color: #d33;">${errores.join("")}</ul>`,
      icon: "warning",
      confirmButtonColor: "#3085d6",
      confirmButtonText: "Entendido",
      // Esperamos a que la alerta desaparezca al 100%
      didClose: () => {
        if (primerCampoConError) primerCampoConError.focus();
      },
    });

    return;
  }

  const impuestoInput = document.getElementById("editar-impuesto");
  const idInput = document.getElementById("editar-idimpuesto");
  if (!impuestoInput || !idInput) return;

  try {
    const esDuplicado = await verificarDuplicadoEditarImpuesto(
      impuestoInput.value.trim(),
      idInput.value,
    );
    if (!esDuplicado) enviarFormularioEdicionImpuesto(formulario);
  } catch (error) {
    console.error("Error al verificar duplicado:", error);
  }
}

//Enviar Datos al Servidor
function enviarFormularioEdicionImpuesto(formulario) {
  if (!formulario) return;
  const formData = new FormData(formulario);

  fetch("cruds/editar_impuesto.php", {
    method: "POST",
    body: formData,
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        Swal.fire({
          title: "¡Actualizado!",
          text: data.message || "Impuesto actualizado correctamente.",
          icon: "success",
          showConfirmButton: false,
          timer: 1500,
          timerProgressBar: true,
        }).then(() => {
          if (document.getElementById("impuestos-link")) {
            document.getElementById("impuestos-link").click();
          }
        });
        cerrarModalImpuesto("editar-modalImpuesto");
      } else {
        Swal.fire({
          title: "Atención",
          text: data.message || "No hubo cambios.",
          icon: "warning",
          showConfirmButton: false,
          timer: 1500,
          timerProgressBar: true,
        });
      }
    })
    .catch((error) => {
      console.error("Error al actualizar:", error);
      Swal.fire("Error", "Ocurrió un problema al actualizar.", "error");
    });
}

// Eliminar Impuestos *****************************
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
              Swal.fire({
                title: "¡Eliminado!",
                text: data.message,
                icon: "success",
                showConfirmButton: false,
                timer: 1500,
                timerProgressBar: true,
              }).then(() => {
                // Recargamos DataTables limpiamente
                if (document.getElementById("impuestos-link")) {
                  document.getElementById("impuestos-link").click();
                }
              });
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

// Llamar Proveedores *************************************************
document
  .getElementById("proveedores-link")
  .addEventListener("click", function (event) {
    event.preventDefault(); // Evita la acción por defecto del enlace
    fetch("catalogos/proveedores.php")
      .then((response) => response.text())
      .then((html) => {
        document.getElementById("content-area").innerHTML = html;

        inicializarTablaGenerica(
          "#tabla-proveedores",
          "#buscarboxproveedor",
          "#cantidad-registros",
        );
      })
      .catch((error) => {
        console.error("Error al cargar el contenido:", error);
      });
  });

function abrirModalProveedor(id) {
  document.getElementById(id).style.display = "flex";
}

function cerrarModalProveedor(id) {
  document.getElementById(id).style.display = "none";
}

//Crear Proveedores***********************************
function validarFormularioProveedor(event) {
  event.preventDefault();

  //  Reglas expandido soporta emails y teléfonos
  const reglasValidacion = [
    {
      id: "crear-proveedor",
      tipo: "texto",
      min: 3,
      mensaje: "El nombre debe tener al menos 3 caracteres.",
    },
    {
      id: "crear-papellido",
      tipo: "texto",
      min: 3,
      mensaje: "El primer apellido debe tener al menos 3 caracteres.",
    },
    {
      id: "crear-sapellido",
      tipo: "texto",
      min: 3,
      mensaje: "El segundo apellido debe tener al menos 3 caracteres.",
    },
    {
      id: "crear-contacto",
      tipo: "texto",
      min: 3,
      mensaje: "La empresa debe tener al menos 3 caracteres.",
    },
    {
      id: "crear-rfc",
      tipo: "texto",
      min: 12,
      mensaje: "El RFC debe tener al menos 12 caracteres.",
    },
    {
      id: "crear-telefono",
      tipo: "texto",
      min: 10,
      mensaje: "El teléfono debe tener exactamente 10 dígitos.",
    },
    {
      id: "crear-email",
      tipo: "email",
      mensaje:
        "Debes ingresar un correo electrónico válido (ej. pedro@correo.com).",
    },
  ];

  const errores = [];
  let primerCampoConError = null;

  // Evaluamos cada regla
  reglasValidacion.forEach((regla) => {
    const elemento = document.getElementById(regla.id);
    if (!elemento) return;

    let valor = elemento.value.trim();
    let esValido = true;

    elemento.addEventListener("input", function () {
      this.classList.remove("input-error");
    });

    // Validamos Texto vs Email
    if (regla.tipo === "texto") {
      if (valor.length < regla.min) esValido = false;
    } else if (regla.tipo === "email") {
      // Fórmula (RegEx) para comprobar que tiene un "@" y un punto "."
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(valor)) esValido = false;
    }

    // Pintamos de rojo si falló
    if (!esValido) {
      errores.push(`<li>${regla.mensaje}</li>`);
      elemento.classList.add("input-error");
      if (!primerCampoConError) primerCampoConError = elemento;
    } else {
      elemento.classList.remove("input-error");
    }
  });

  //  Mostrar errores
  if (errores.length > 0) {
    // Quitar el cursor por seguridad
    if (document.activeElement) {
      document.activeElement.blur();
    }

    Swal.fire({
      title: "Faltan datos",
      html: `<ul style="text-align: left; font-size: 14px; color: #d33;">${errores.join("")}</ul>`,
      icon: "warning",
      confirmButtonColor: "#3085d6",
      confirmButtonText: "Entendido",
      // Esperamos a que la alerta desaparezca al 100%
      didClose: () => {
        if (primerCampoConError) primerCampoConError.focus();
      },
    });

    return;
  }

  // Verificar duplicados antes de enviar
  const proveedor = document.getElementById("crear-proveedor").value.trim();
  verificarDuplicadoProveedor(proveedor).then((esDuplicado) => {
    if (!esDuplicado) procesarFormularioProveedor(event, "crear");
  });
}

function procesarFormularioProveedor(event, tipo) {
  event.preventDefault();
  const formData = new FormData(event.target);

  fetch(`cruds/procesar_${tipo}_proveedor.php`, {
    method: "POST",
    body: formData,
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        cerrarModalProveedor(tipo + "-modalProveedor");
        event.target.reset();

        Swal.fire({
          title: "¡Éxito!",
          text: data.message || "Proveedor guardado correctamente.",
          icon: "success",
          showConfirmButton: false,
          timer: 1500,
          timerProgressBar: true,
        }).then(() => {
          // Recargamos DataTables usando el menú
          if (document.getElementById("proveedores-link")) {
            document.getElementById("proveedores-link").click();
          }
        });
      } else {
        Swal.fire({
          title: "Error",
          text: data.message || "Ocurrió un problema.",
          icon: "error",
        });
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      Swal.fire({
        title: "Error",
        text: "Ocurrió un error inesperado.",
        icon: "error",
      });
    });
}

function verificarDuplicadoProveedor(proveedor) {
  return fetch("cruds/verificar_nombre_proveedor.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ proveedor }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.existe) {
        Swal.fire({
          title: "Atención",
          text: data.message || "El nombre del proveedor ya existe.",
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
      return true;
    });
}

//Editar Proveedores************************************************************
// Escuchar clic en el botón de editar y cargar datos
document.addEventListener("click", function (event) {
  if (event.target.classList.contains("editarProveedor")) {
    const id = event.target.dataset.id;

    fetch(`cruds/obtener_proveedor.php?id=${id}`)
      .then((response) => response.json())
      .then((data) => {
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

            campos.forEach((campo) => {
              const input = formularioProveedor[`editar-${campo}`];
              if (input) {
                input.value = data.proveedor[campo] || "";
              }
            });
            abrirModalProveedor("editar-modalProveedor");
          }
        } else {
          Swal.fire(
            "Error",
            data.message || "No se pudo cargar el proveedor.",
            "error",
          );
        }
      })
      .catch((error) => {
        console.error("Error al obtener el campo:", error);
        Swal.fire(
          "Error",
          "Ocurrió un problema al obtener los datos.",
          "error",
        );
      });
  }
});

// Escuchar el submit del formulario de edición (Fuera del DOMContentLoaded)
document.addEventListener("submit", function (event) {
  if (event.target && event.target.id === "form-editarProveedor") {
    event.preventDefault();
    validarFormularioEdicionProveedor(event.target);
  }
});

// Verificar duplicados
function verificarDuplicadoEditarProveedor(proveedor, id = 0) {
  return fetch("cruds/verificar_nombre_proveedor.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ proveedor, id }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.existe) {
        Swal.fire({
          title: "Atención",
          text: data.message || "El nombre ya existe. Por favor, elige otro.",
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
      return true;
    });
}

// Validación  del Formulario
async function validarFormularioEdicionProveedor(formulario) {
  // Motor de reglas (Soporta Textos y Emails)
  const reglasValidacion = [
    {
      id: "editar-proveedor",
      tipo: "texto",
      min: 3,
      mensaje: "El nombre debe tener al menos 3 caracteres.",
    },
    {
      id: "editar-papellido",
      tipo: "texto",
      min: 3,
      mensaje: "El primer apellido debe tener al menos 3 caracteres.",
    },
    {
      id: "editar-sapellido",
      tipo: "texto",
      min: 3,
      mensaje: "El segundo apellido debe tener al menos 3 caracteres.",
    },
    {
      id: "editar-contacto",
      tipo: "texto",
      min: 3,
      mensaje: "La empresa debe tener al menos 3 caracteres.",
    },
    {
      id: "editar-rfc",
      tipo: "texto",
      min: 12,
      mensaje: "El RFC debe tener al menos 12 caracteres.",
    },
    {
      id: "editar-telefono",
      tipo: "texto",
      min: 10,
      mensaje: "El teléfono debe tener exactamente 10 dígitos.",
    },
    {
      id: "editar-email",
      tipo: "email",
      mensaje: "Debes ingresar un correo electrónico válido.",
    },
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

    if (regla.tipo === "texto") {
      if (valor.length < regla.min) esValido = false;
    } else if (regla.tipo === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(valor)) esValido = false;
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
    // Quitar el cursor por seguridad
    if (document.activeElement) {
      document.activeElement.blur();
    }

    Swal.fire({
      title: "Faltan datos",
      html: `<ul style="text-align: left; font-size: 14px; color: #d33;">${errores.join("")}</ul>`,
      icon: "warning",
      confirmButtonColor: "#3085d6",
      confirmButtonText: "Entendido",
      // Esperamos a que la alerta desaparezca al 100%
      didClose: () => {
        if (primerCampoConError) primerCampoConError.focus();
      },
    });

    return;
  }

  const proveedorInput = document.getElementById("editar-proveedor");
  const idInput = document.getElementById("editar-idproveedor");
  if (!proveedorInput || !idInput) return;

  try {
    const esDuplicado = await verificarDuplicadoEditarProveedor(
      proveedorInput.value.trim(),
      idInput.value,
    );
    if (!esDuplicado) enviarFormularioEdicionProveedor(formulario);
  } catch (error) {
    console.error("Error al verificar duplicado:", error);
  }
}

// Enviar formulario al servidor
function enviarFormularioEdicionProveedor(formulario) {
  if (!formulario) return;
  const formData = new FormData(formulario);

  fetch("cruds/editar_proveedor.php", {
    method: "POST",
    body: formData,
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        Swal.fire({
          title: "¡Actualizado!",
          text: data.message || "Registro actualizado correctamente.",
          icon: "success",
          showConfirmButton: false,
          timer: 1500,
          timerProgressBar: true,
        }).then(() => {
          // Recargamos DataTables usando el menú
          if (document.getElementById("proveedores-link")) {
            document.getElementById("proveedores-link").click();
          }
        });

        cerrarModalProveedor("editar-modalProveedor");
      } else {
        Swal.fire({
          title: "Atención",
          text: data.message || "No se realizaron cambios en el proveedor.",
          icon: "warning",
          showConfirmButton: false,
          timer: 1500,
          timerProgressBar: true,
        });
      }
    })
    .catch((error) => {
      console.error("Error al actualizar:", error);
      Swal.fire("Error", "Ocurrió un problema al actualizar.", "error");
    });
}

// Eliminar Proveedores *****************************
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
              Swal.fire({
                title: "¡Eliminado!",
                text:
                  data.message || "El registro se ha eliminado correctamente.",
                icon: "success",
                showConfirmButton: false,
                timer: 1500,
                timerProgressBar: true,
              }).then(() => {
                if (document.getElementById("proveedores-link")) {
                  document.getElementById("proveedores-link").click();
                }
              });
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

/// Llamar Ordenes de servicio *************************************************
document
  .getElementById("ordenes-link")
  .addEventListener("click", function (event) {
    event.preventDefault();
    fetch("catalogos/ordenes.php")
      .then((response) => response.text())
      .then((html) => {
        document.getElementById("content-area").innerHTML = html;

        // filtros y busqueda
        inicializarTablaGenerica(
          "#tabla-ordenes",
          "#buscarboxorden",
          "#cantidad-registros",
        );

        //  Filtros del Dashboard 
        let filtroGuardado = sessionStorage.getItem("filtroDashboard");

        if (filtroGuardado) {
          // damos 200 milisegundos a DataTables para que termine de construirse
          setTimeout(() => {
            let miTablaDeOrdenes = $("#tabla-ordenes").DataTable();
            let cajaBusqueda = $("#buscarboxorden");

            // APLICAR EL FILTRO INTELIGENTE
            if (filtroGuardado === "Pendientes") {
              // Usamos Regex (true, false) para buscar múltiples estados al mismo tiempo
              miTablaDeOrdenes
                .search("Recibido|Revisión|Diagnósticado", true, false)
                .draw();
              if (cajaBusqueda.length > 0)
                cajaBusqueda.val("Filtrando Pendientes..."); // Solo visual
            } else {
              // Filtro normal para un Folio exacto o para "Terminado"
              miTablaDeOrdenes.search(filtroGuardado).draw();
              if (cajaBusqueda.length > 0) cajaBusqueda.val(filtroGuardado); // Visual
            }

            //  Botón dinámico de "Ver Todas"
            if (
              cajaBusqueda.length > 0 &&
              $("#btn-limpiar-dashboard").length === 0
            ) {
              // Creamos el botón elegante
              let btnLimpiar = $(
                "<button id='btn-limpiar-dashboard' class='boton' style='margin-left: 15px; background-color: #204eda; color: white;'>Ver Todas</button>",
              );

              // Lo pegamos justo después de la caja de búsqueda
              cajaBusqueda.after(btnLimpiar);

              // Le damos la orden de limpiar la tabla al hacer clic
              btnLimpiar.on("click", function () {
                cajaBusqueda.val(""); // Limpia la caja de texto visual
                miTablaDeOrdenes.search("").draw(); // Le quita el filtro real a DataTables
                $(this).remove(); // El botón se autodestruye
              });
            }

            // Borramos el mensaje de la memoria para que no se recicle
            sessionStorage.removeItem("filtroDashboard");
          }, 200);
        }

        // Conversión de Cita a Orden 
        setTimeout(() => {
          if (typeof revisarConversionCita === "function") {
            revisarConversionCita();
          }
        }, 150);

      })
      .catch((error) => console.error("Error al cargar contenido:", error));
  });

// BUSCADOR DE CLIENTES (AUTOCOMPLETE)
let timeoutBusquedaCliente;

document.addEventListener("input", function (e) {
  if (e.target && e.target.id === "busqueda-cliente") {
    const inputBusqueda = e.target;
    const termino = inputBusqueda.value.trim();
    const contenedor = inputBusqueda.closest(".autocomplete-container");
    const listaResultados = contenedor.querySelector(".lista-autocomplete");

    clearTimeout(timeoutBusquedaCliente);
    listaResultados.innerHTML = "";

    if (termino.length < 2) {
      listaResultados.style.display = "none";
      return;
    }

    timeoutBusquedaCliente = setTimeout(() => {
      fetch(`cruds/buscar_clientes_select.php?q=${encodeURIComponent(termino)}`)
        .then((res) => res.json())
        .then((data) => {
          listaResultados.innerHTML = "";

          if (data.length > 0) {
            listaResultados.style.display = "block";
            data.forEach((cliente) => {
              const li = document.createElement("li");
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
            listaResultados.style.display = "block";
            const liError = document.createElement("li");
            liError.style.color = "red";
            liError.style.padding = "10px";
            liError.style.textAlign = "center";
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
        .catch((err) => console.error("Error búsqueda:", err));
    }, 300);
  }
});

// Selección de Cliente
document.addEventListener("click", function (e) {
  // Seleccionar item de la lista
  if (
    e.target &&
    e.target.tagName === "LI" &&
    e.target.closest(".lista-autocomplete") &&
    !e.target.closest("strong")
  ) {
    const li = e.target;
    const contenedor = li.closest(".autocomplete-container");
    const inputBusqueda = contenedor.querySelector("#busqueda-cliente");
    const inputHidden = contenedor.querySelector("#id_cliente_seleccionado");
    const listaResultados = contenedor.querySelector(".lista-autocomplete");
    const btnLimpiar = contenedor.querySelector("#limpiar-cliente");

    inputBusqueda.value = li.dataset.nombre;
    inputBusqueda.disabled = true;
    inputHidden.value = li.dataset.id;
    listaResultados.style.display = "none";
    btnLimpiar.style.display = "inline";
  }

  // Limpiar selección
  if (e.target && e.target.id === "limpiar-cliente") {
    const btnLimpiar = e.target;
    const contenedor = btnLimpiar.closest(".autocomplete-container");
    const inputBusqueda = contenedor.querySelector("#busqueda-cliente");
    const inputHidden = contenedor.querySelector("#id_cliente_seleccionado");

    inputBusqueda.value = "";
    inputBusqueda.disabled = false;
    inputHidden.value = "";
    btnLimpiar.style.display = "none";
    inputBusqueda.focus();
  }

  // Cerrar lista al hacer clic fuera
  if (!e.target.closest(".autocomplete-container")) {
    document
      .querySelectorAll(".lista-autocomplete")
      .forEach((l) => (l.style.display = "none"));
  }
});

// FUNCIONES DE UTILIDAD (GLOBALES)
function abrirModalOrden(id) {
  document.getElementById(id).style.display = "flex";
}
// Variable global para detectar si necesitamos refrescar la tabla
window.huboCambiosEnOrden = false;

function cerrarModalOrden(id) {
  document.getElementById(id).style.display = "none";

  // Si cerramos el modal y se guardó algo, recargamos la pantalla de fondo
  if (window.huboCambiosEnOrden && document.getElementById("ordenes-link")) {
      document.getElementById("ordenes-link").click(); // Simula el clic en el menú
      window.huboCambiosEnOrden = false; // Apagamos el avisador para la próxima vez
  }
}

function calcularSaldoOrden() {
  const costo = parseFloat(document.getElementById("crear-costo").value) || 0;
  const anticipo =
    parseFloat(document.getElementById("crear-anticipo").value) || 0;
  document.getElementById("crear-saldo").value = (costo - anticipo).toFixed(2);
}

function previewEvidencia(input) {
  const container = document.getElementById("preview-container");
  container.innerHTML = "";
  if (input.files) {
    Array.from(input.files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = function (e) {
        const img = document.createElement("img");
        img.src = e.target.result;
        img.style.width = "50px";
        img.style.height = "50px";
        img.style.objectFit = "cover";
        img.style.borderRadius = "4px";
        img.style.border = "1px solid #ddd";
        container.appendChild(img);
      };
      reader.readAsDataURL(file);
    });
  }
}
// LÓGICA DE CÁMARA WEB
let streamCamara = null;
let fotosCapturadas = [];

document.addEventListener("click", function (e) {
  // Activar
  if (e.target && e.target.id === "btn-activar-camara") {
    const video = document.getElementById("video-webcam");
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then(function (stream) {
        streamCamara = stream;
        video.srcObject = stream;
        video.play();
        document.getElementById("camera-preview").style.display = "block";
        e.target.style.display = "none";
        document.getElementById("btn-tomar-foto").style.display =
          "inline-block";
      })
      .catch((err) =>
        Swal.fire("Error", "No se pudo acceder a la cámara.", "error"),
      );
  }

  // Capturar
  if (e.target && e.target.id === "btn-tomar-foto") {
    const video = document.getElementById("video-webcam");
    const canvas = document.getElementById("canvas-webcam");
    const container = document.getElementById("preview-container");

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0);

    canvas.toBlob(
      function (blob) {
        const archivo = new File([blob], "foto_webcam_" + Date.now() + ".jpg", {
          type: "image/jpeg",
        });
        fotosCapturadas.push(archivo);

        const img = document.createElement("img");
        img.src = URL.createObjectURL(blob);
        img.style.width = "50px";
        img.style.height = "50px";
        img.style.objectFit = "cover";
        img.style.border = "1px solid #28a745";
        img.style.borderRadius = "4px";
        container.appendChild(img);

        // Efecto flash
        video.style.opacity = 0.5;
        setTimeout(() => (video.style.opacity = 1), 100);
      },
      "image/jpeg",
      0.95,
    );
  }
});

// FUNCIÓN MATEMÁTICA PARA EL MODAL DE EDITAR
function calcularSaldoEdit() {
  const costo = parseFloat(document.getElementById("edit-costo").value) || 0;
  const anticipoAcumulado =
    parseFloat(document.getElementById("edit-anticipo").value) || 0;
  const nuevoAbono =
    parseFloat(document.getElementById("edit-nuevo-abono").value) || 0;

  // El saldo es el costo menos lo que ya había dado, menos lo que está dando ahorita
  let saldoFinal = costo - (anticipoAcumulado + nuevoAbono);

  // Evitamos que el saldo sea negativo visualmente
  if (saldoFinal < 0) saldoFinal = 0;

  const inputSaldo = document.getElementById("edit-saldo");
  if (inputSaldo) {
    inputSaldo.value = saldoFinal.toFixed(2);
  }
}

// ALTA EXPRÉS DE CLIENTES
window.abrirModalClienteExpress = function () {
  Swal.fire({
    title: "Alta Exprés de Cliente",
    html: `
            <p style="font-size:13px; color:#666; margin-bottom:15px;">Captura los datos básicos para enviarle su comprobante.</p>
            <input id="swal-cli-nombre" class="swal2-input" placeholder="Nombre(s) *" style="width: 85%;">
            <input id="swal-cli-papellido" class="swal2-input" placeholder="Primer Apellido *" style="width: 85%;">
            <input id="swal-cli-sapellido" class="swal2-input" placeholder="Segundo Apellido" style="width: 85%;">
            
            <input id="swal-cli-telefono" type="tel" class="swal2-input" placeholder="Teléfono a 10 dígitos *" style="width: 85%;" maxlength="10" oninput="this.value = this.value.replace(/[^0-9]/g, '').slice(0, 10);">
            
            <input id="swal-cli-correo" type="email" class="swal2-input" placeholder="Correo (Opcional)" style="width: 85%;">
        `,
    showCancelButton: true,
    confirmButtonText:
      '<i class="fa-solid fa-floppy-disk"></i> Guardar y Asignar',
    confirmButtonColor: "#28a745",
    cancelButtonText: "Cancelar",
    preConfirm: () => {
      // Obtenemos los valores
      let nombre = document.getElementById("swal-cli-nombre").value.trim();
      let papellido = document
        .getElementById("swal-cli-papellido")
        .value.trim();
      let sapellido = document
        .getElementById("swal-cli-sapellido")
        .value.trim();
      let telefono = document.getElementById("swal-cli-telefono").value.trim();
      let correo = document.getElementById("swal-cli-correo").value.trim();

      // EXPRESIÓN REGULAR: Solo letras, acentos, ñ y espacios
      const regexLetras = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;

      // VALIDACIONES ESTRICTAS DE NOMBRES
      if (nombre.length < 3) {
        Swal.showValidationMessage(
          "El nombre debe tener al menos 3 caracteres.",
        );
        return false;
      }
      if (!regexLetras.test(nombre)) {
        Swal.showValidationMessage("El nombre solo debe contener letras.");
        return false;
      }

      if (papellido.length < 3) {
        Swal.showValidationMessage(
          "El primer apellido debe tener al menos 3 caracteres.",
        );
        return false;
      }
      if (!regexLetras.test(papellido)) {
        Swal.showValidationMessage(
          "El primer apellido solo debe contener letras.",
        );
        return false;
      }

      if (sapellido !== "") {
        if (sapellido.length < 3) {
          Swal.showValidationMessage(
            "Si escribes segundo apellido, debe ser de 3 caracteres mínimo.",
          );
          return false;
        }
        if (!regexLetras.test(sapellido)) {
          Swal.showValidationMessage(
            "El segundo apellido solo debe contener letras.",
          );
          return false;
        }
      }

      // Teléfono (ya está limitado a 10 por el HTML, pero aseguramos que escriban los 10)
      if (telefono.length !== 10) {
        Swal.showValidationMessage(
          "El teléfono debe tener exactamente 10 números.",
        );
        return false;
      }

      // Correo
      if (correo !== "" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
        Swal.showValidationMessage(
          "Debes ingresar un formato de correo electrónico válido.",
        );
        return false;
      }

      return { nombre, papellido, sapellido, telefono, correo };
    },
  }).then((result) => {
    if (result.isConfirmed) {
      Swal.fire({
        title: "Guardando...",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      let formData = new FormData();
      formData.append("nombre", result.value.nombre);
      formData.append("papellido", result.value.papellido);
      formData.append("sapellido", result.value.sapellido);
      formData.append("telefono", result.value.telefono);
      formData.append("email", result.value.correo);

      fetch("cruds/guardar_cliente_express.php", {
        method: "POST",
        body: formData,
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            // ÓRDENES DE SERVICIO
            const inputBusqueda = document.getElementById("busqueda-cliente");
            const inputHidden = document.getElementById(
              "id_cliente_seleccionado",
            );
            const btnLimpiar = document.getElementById("limpiar-cliente");
            const listaResultados = document.getElementById(
              "lista-resultados-clientes",
            );

            if (inputBusqueda && inputHidden) {
              inputBusqueda.value = `${data.nombre_completo} (${data.telefono})`;
              inputBusqueda.disabled = true;
              inputHidden.value = data.id;
              if (btnLimpiar) btnLimpiar.style.display = "inline";
              if (listaResultados) listaResultados.style.display = "none";
            }

            // COTIZACIONES
            const inputHiddenCot = document.getElementById("cot-id-cliente");
            const inputNombreCot =
              document.getElementById("cot-nombre-cliente");
            const btnQuitarCot = document.getElementById(
              "btn-quitar-cliente-cot",
            );

            //  PUNTO DE VENTA (POS)
            const inputHiddenPOS = document.getElementById("pos-id-cliente");
            const inputNombrePOS =
              document.getElementById("pos-nombre-cliente");
            const btnQuitarPOS = document.getElementById(
              "btn-quitar-cliente-pos",
            );

            if (inputHiddenPOS && inputNombrePOS) {
              inputHiddenPOS.value = data.id;
              inputNombrePOS.value = data.nombre_completo.split(" ")[0]; // Solo ponemos el primer nombre
              if (btnQuitarPOS) btnQuitarPOS.style.display = "inline-block";
            }

            Swal.fire({
              icon: "success",
              title: "¡Cliente Asignado!",
              toast: true,
              position: "top-end",
              showConfirmButton: false,
              timer: 3000,
            });
          } else {
            Swal.fire(
              "Error",
              data.message || "No se pudo guardar el cliente.",
              "error",
            );
          }
        })
        .catch((err) => {
          console.error(err);
          Swal.fire("Error", "Error de conexión con el servidor", "error");
        });
    }
  });
};

// MANEJO DE TODOS LOS FORMULARIOS (SUBMITS)
document.addEventListener("submit", function (e) {
  // CREAR ORDEN (INCLUYE FOTOS WEBCAM)
  if (e.target && e.target.id === "form-crearOrden") {
    e.preventDefault();
    const form = e.target;
    let hayErrores = false;

    function validarCampo(selector, esSelect = false) {
      const campo = form.querySelector(selector);
      if (!campo) return true;

      const valor = campo.value.trim();
      if (valor === "") {
        campo.classList.add("input-error");
        campo.style.border = "1px solid #d33";
        hayErrores = true;
        campo.addEventListener(
          esSelect ? "change" : "input",
          function () {
            this.classList.remove("input-error");
            this.style.border = "";
          },
          { once: true },
        );
        return false;
      } else {
        campo.classList.remove("input-error");
        campo.style.border = "";
        return true;
      }
    }

    const idCliente = document.getElementById("id_cliente_seleccionado").value;
    const cajaBusquedaCliente = document.getElementById("busqueda-cliente");
    if (!idCliente || idCliente.trim() === "") {
      if (cajaBusquedaCliente) {
        cajaBusquedaCliente.classList.add("input-error");
        hayErrores = true;
        cajaBusquedaCliente.addEventListener(
          "input",
          function () {
            this.classList.remove("input-error");
          },
          { once: true },
        );
      }
    } else {
      if (cajaBusquedaCliente)
        cajaBusquedaCliente.classList.remove("input-error");
    }

    validarCampo('[name="tipo_equipo"]', true);
    validarCampo('[name="marca"]', true);
    validarCampo('[name="tipo_servicio"]', true);
    validarCampo('[name="modelo"]');
    validarCampo('[name="falla"]');

    // Si hay anticipo, exigir método de pago
    const anticipoIngresado =
      parseFloat(document.getElementById("crear-anticipo").value) || 0;
    const selectMetodoPagoCrear = document.getElementById("crear-metodo-pago");

    if (anticipoIngresado > 0) {
      // Reutilizamos tu función auxiliar para pintar de rojo
      validarCampo("#crear-metodo-pago", true);
    } else {
      // Si el anticipo es 0, le quitamos el rojo por si se arrepintió
      if (selectMetodoPagoCrear) {
        selectMetodoPagoCrear.classList.remove("input-error");
        selectMetodoPagoCrear.style.border = "";
      }
    }

    if (hayErrores) {
      Swal.fire({
        title: "Faltan datos",
        text: "Por favor, revisa y completa los campos marcados en rojo.",
        icon: "warning",
        returnFocus: false,
        confirmButtonColor: "#3085d6",
      });
      return;
    }

    const formData = new FormData(form);

    if (typeof fotosCapturadas !== "undefined" && fotosCapturadas.length > 0) {
      fotosCapturadas.forEach((foto, index) => {
        formData.append("evidencias[]", foto, `webcam_foto_${index}.jpg`);
      });
    }

    Swal.fire({
      title: "Procesando...",
      text: "Generando orden...",
      allowOutsideClick: false,
      returnFocus: false,
      didOpen: () => Swal.showLoading(),
    });

    fetch("cruds/procesar_crear_orden.php", { method: "POST", body: formData })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          cerrarModalOrden("crear-modalOrden");
          form.reset();
          document.getElementById("preview-container").innerHTML = "";

          fotosCapturadas = [];
          if (streamCamara)
            streamCamara.getTracks().forEach((track) => track.stop());
          document.getElementById("camera-preview").style.display = "none";
          document.getElementById("btn-activar-camara").style.display =
            "inline-block";
          document.getElementById("btn-tomar-foto").style.display = "none";

          if (cajaBusquedaCliente) {
            cajaBusquedaCliente.value = "";
            cajaBusquedaCliente.disabled = false;
          }
          if (document.getElementById("limpiar-cliente"))
            document.getElementById("limpiar-cliente").style.display = "none";

          Swal.fire({
            title: "¡Orden Creada!",
            html: `<p>${data.message}</p>
                           <div style="display: flex; justify-content: center; margin: 15px 0;">
                               <div id="qrcode-container"></div>
                           </div>
                           <p style="font-size: 12px; color: #666;">Escanea para ver el rastreo</p>`,
            icon: "success",
            returnFocus: false,
            confirmButtonText:
              '<i class="fa-brands fa-whatsapp"></i> Enviar WhatsApp',
            showCancelButton: true,
            cancelButtonText: "Cerrar",
            didOpen: () => {
              new QRCode(document.getElementById("qrcode-container"), {
                text: data.token_qr,
                width: 128,
                height: 128,
              });
            },
          }).then((result) => {
            if (result.isConfirmed) {
              const tel = data.datos_whatsapp.telefono.replace(/\D/g, "");
              const msg = encodeURIComponent(data.datos_whatsapp.mensaje);
              window.open(`https://wa.me/${tel}?text=${msg}`, "_blank");
            }
            if (document.getElementById("ordenes-link"))
              document.getElementById("ordenes-link").click();
          });
        } else {
          Swal.fire({
            title: "Error",
            text: data.message,
            icon: "error",
            returnFocus: false,
          });
        }
      })
      .catch((err) => {
        console.error(err);
        Swal.fire({
          title: "Error",
          text: "Fallo en el servidor",
          icon: "error",
          returnFocus: false,
        });
      });
  }

 // EDITAR ORDEN
  if (e.target && e.target.id === "form-editarOrden") {
    e.preventDefault();

    const form = e.target;
    const estadoActual = document.getElementById("edit-estado").value;
    const diagActual = document.getElementById("edit-diagnostico").value.trim();
    const costoActual = parseFloat(document.getElementById("edit-costo").value || 0).toFixed(2);
    const nuevoAbono = parseFloat(document.getElementById("edit-nuevo-abono").value) || 0;

    const costoOriginal = parseFloat(form.dataset.costoOrig) || 0;
    const anticipoOriginal = parseFloat(document.getElementById("edit-anticipo").value) || 0;
    const saldoRestanteReal = costoOriginal - anticipoOriginal;
    const metodoPagoEdit = document.getElementById("edit-metodo-pago");

    // Validar Método de pago si hay abono
    if (nuevoAbono > 0 && (!metodoPagoEdit.value || metodoPagoEdit.value.trim() === "")) {
      metodoPagoEdit.classList.add("input-error");
      metodoPagoEdit.style.border = "1px solid #d33";
      Swal.fire({
        title: "Falta Método de Pago",
        text: "Si estás registrando un abono, debes seleccionar con qué método te pagó el cliente.",
        icon: "warning",
        returnFocus: false,
        confirmButtonColor: "#3085d6",
      });
      metodoPagoEdit.addEventListener("change", function () {
          this.classList.remove("input-error");
          this.style.border = "1px solid green";
        }, { once: true });
      return; 
    }

    // Validar que no abone de más
    if (nuevoAbono > saldoRestanteReal && saldoRestanteReal > 0) {
      Swal.fire({
        title: "Abono excedido",
        text: `El cliente solo debe $${saldoRestanteReal.toFixed(2)}. No puedes abonar $${nuevoAbono.toFixed(2)}.`,
        icon: "error",
        returnFocus: false,
      });
      return;
    }

    // Preparamos los datos
    const formData = new FormData(form);

    // UX: Cambiamos el botón visualmente
    const btnGuardar = form.querySelector('.boton-guardar');
    const textoOriginal = btnGuardar.innerHTML;
    btnGuardar.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Guardando...';
    btnGuardar.disabled = true;

    fetch("cruds/procesar_editar_orden.php", { method: "POST", body: formData })
      .then((res) => res.json())
      .then((data) => {
        // Restauramos el botón
        btnGuardar.innerHTML = textoOriginal;
        btnGuardar.disabled = false;

        if (data.success) {
          // Le avisamos al sistema que la tabla ya no está actualizada
          window.huboCambiosEnOrden = true;
          // Mostramos alerta pero NO CERRAMOS EL MODAL
          Swal.fire({
            icon: "success",
            title: "¡Orden Actualizada!",
            text: "Los costos, estatus y refacciones se han guardado.",
            returnFocus: false,
            showConfirmButton: false,
            timer: 2000,
          });

          // TRUCO UX: Sumar el abono nuevo al anticipo acumulado visualmente
          const inputAnticipo = document.getElementById("edit-anticipo");
          const inputNuevoAbono = document.getElementById("edit-nuevo-abono");

          if (parseFloat(inputNuevoAbono.value) > 0) {
            let suma =
              parseFloat(inputAnticipo.value) +
              parseFloat(inputNuevoAbono.value);
            inputAnticipo.value = suma.toFixed(2);
            inputNuevoAbono.value = "0.00"; // Lo reseteamos para no cobrar doble
          }

          // Refrescamos los saldos visuales
          calcularSaldoEdit();

          // Actualizamos los "datasets" para evitar la alerta de "Sin cambios" si le da guardar 2 veces seguidas
          form.dataset.estadoOrig = estadoActual;
          form.dataset.diagOrig = diagActual;
          form.dataset.costoOrig = costoActual;

          // NOTA: Ya no hacemos document.getElementById("ordenes-link").click();
          // porque eso recargaba toda la página y cerraba tu modal a la fuerza.
        } else {
          Swal.fire({
            title: "Error",
            text: data.message, // Aquí salta la validación de no entregar sin liquidar
            icon: "error",
            returnFocus: false,
          });
        }
      })
      .catch((err) => {
        btnGuardar.innerHTML = textoOriginal;
        btnGuardar.disabled = false;
        console.error(err);
        Swal.fire("Error", "Ocurrió un problema de conexión.", "error");
      });
  }
});

// MANEJO DE CLICS EN TABLA (EDITAR Y CANCELAR ORDENES) ***************************************
document.addEventListener("click", function (e) {
  // ABRIR MODAL EDITAR
  const btnEditar = e.target.closest(".editarOrden");
  if (btnEditar) {
    const idOrden = btnEditar.getAttribute("data-id");

    Swal.fire({
      title: "Cargando datos...",
      allowOutsideClick: false,
      returnFocus: false,
      didOpen: () => Swal.showLoading(),
    });

    fetch(`cruds/obtener_orden.php?id=${idOrden}`)
      .then((res) => res.json())
      .then((data) => {
        Swal.close();
        if (data.success) {
          document.getElementById("edit-id-orden").value = data.orden.id_orden;
          document.getElementById("edit-folio-text").textContent =
            data.orden.id_orden;
          document.getElementById("edit-estado").value =
            data.orden.id_estado_servicio;
          document.getElementById("edit-falla").value = data.orden.falla;
          document.getElementById("edit-diagnostico").value =
            data.orden.diagnostico || "";

          // Costos y anticipos
          document.getElementById("edit-mano-obra").value =
            data.orden.costo_servicio || 0;
          document.getElementById("edit-anticipo").value =
            data.orden.anticipo_servicio || 0;

          // Limpiamos los campos de nuevos pagos
          document.getElementById("edit-nuevo-abono").value = "0";
          const selectMetP = document.getElementById("edit-metodo-pago");
          if (selectMetP) {
            selectMetP.value = "";
            selectMetP.classList.remove("input-error");
            selectMetP.style.border = "1px solid green";
          }

          // Disparamos el cálculo
          calcularSaldoEdit();

          // LLENAR HISTORIAL DE PAGOS (AQUÍ ES EL LUGAR CORRECTO)
          const tbodyPagos = document.getElementById("tabla-historial-pagos");
          if (tbodyPagos) {
            tbodyPagos.innerHTML = ""; // Limpiamos la tabla
            if (data.abonos && data.abonos.length > 0) {
              data.abonos.forEach((abono) => {
                const tr = document.createElement("tr");
                tr.innerHTML = `
                                <td style="padding: 5px; text-align: center;">${abono.fecha_abono}</td>
                                <td style="padding: 5px; text-align: center; color: green; font-weight: bold;">$${parseFloat(abono.monto_abono).toFixed(2)}</td>
                                <td style="padding: 5px; text-align: center;">${abono.metodo}</td>
                            `;
                tbodyPagos.appendChild(tr);
              });
            } else {
              tbodyPagos.innerHTML =
                '<tr><td colspan="3" style="text-align: center; color: #888;">No hay abonos registrados.</td></tr>';
            }
          }

          const formEditar = document.getElementById("form-editarOrden");
          formEditar.dataset.estadoOrig = data.orden.id_estado_servicio;
          formEditar.dataset.diagOrig = data.orden.diagnostico || "";
          formEditar.dataset.costoOrig = parseFloat(
            data.orden.costo_servicio,
          ).toFixed(2);

          // Limpiar refacciones visualmente por ahora
          document.getElementById("tabla-refacciones-orden").innerHTML = `
                    <tr id="fila-vacia-refacciones">
                        <td colspan="5" style="text-align: center; color: #888; padding: 15px;">No se han agregado refacciones a esta orden.</td>
                    </tr>`;
          document.getElementById("total-refacciones-input").value = 0;
          document.getElementById("total-refacciones-text").textContent =
            "0.00";

          abrirModalOrden("editar-modalOrden");
        } else {
          Swal.fire({
            title: "Error",
            text: data.message,
            icon: "error",
            returnFocus: false,
          });
        }
      })
      .catch((err) => {
        Swal.close();
        console.error(err);
        Swal.fire({
          title: "Error",
          text: "No se pudo conectar con el servidor.",
          icon: "error",
          returnFocus: false,
        });
      });
  }

  // CANCELAR ORDEN
  const btnEliminar = e.target.closest(".eliminarOrden");
  if (btnEliminar) {
    const idOrden = btnEliminar.getAttribute("data-id");

    Swal.fire({
      title: "¿Estás seguro?",
      text:
        "La orden #" +
        idOrden +
        " será cancelada. No se borrará del historial.",
      icon: "warning",
      returnFocus: false,
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Sí, cancelar orden",
      cancelButtonText: "No, regresar",
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: "Procesando...",
          allowOutsideClick: false,
          returnFocus: false,
          didOpen: () => Swal.showLoading(),
        });

        fetch("cruds/procesar_eliminar_orden.php", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: "id_orden=" + idOrden,
        })
          .then((res) => res.json())
          .then((data) => {
            if (data.success) {
              Swal.fire({
                title: "¡Cancelada!",
                text: data.message,
                icon: "success",
                returnFocus: false,
              }).then(() => {
                if (document.getElementById("ordenes-link")) {
                  document.getElementById("ordenes-link").click();
                }
              });
            } else {
              Swal.fire({
                title: "Error",
                text: data.message,
                icon: "error",
                returnFocus: false,
              });
            }
          })
          .catch((err) => {
            console.error(err);
            Swal.fire({
              title: "Error",
              text: "Fallo de conexión.",
              icon: "error",
              returnFocus: false,
            });
          });
      }
    });
  }
});

// UTILIDADES FINALES (WHATSAPP, IMPRESIÓN, QR)
function enviarWhatsOrden(telefono, folio, cliente, saldo, estado, taller) {
  let tel = telefono.replace(/\D/g, "");
  if (tel.length === 10) tel = "52" + tel;

  let mensaje = `¡Hola ${cliente}! Te contactamos de *${taller}*.\n\n`;
  mensaje += `Te informamos que tu orden de servicio con *Folio #${folio}* se encuentra actualmente en estado: *${estado.toUpperCase()}*.\n\n`;

  let saldoNum = parseFloat(saldo);
  if (saldoNum > 0) {
    mensaje += `*Saldo pendiente:* $${saldoNum.toFixed(2)}\n\n`;
  } else {
    mensaje += `*Saldo:* Equipo pagado en su totalidad.\n\n`;
  }

  mensaje += `Si tienes alguna duda, responde a este mensaje. ¡Gracias por tu preferencia!`;
  window.open(
    `https://wa.me/${tel}?text=${encodeURIComponent(mensaje)}`,
    "_blank",
  );
}

function imprimirTicket(idOrden) {
  window.open(
    `cruds/imprimir_ticket.php?id=${idOrden}`,
    "Ticket",
    "width=400,height=600",
  );
}

function verQrOrden(token) {
  const urlRastreo = `https://swaos.rf.gd/track.php?t=${token}`;
  const urlImagenQR = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(urlRastreo)}`;

  Swal.fire({
    title: "Código de Rastreo",
    text: "Pide al cliente que escanee este código.",
    imageUrl: urlImagenQR,
    imageWidth: 250,
    imageHeight: 250,
    imageAlt: "QR",
    returnFocus: false,
    confirmButtonText: "Cerrar",
    confirmButtonColor: "#34495e",
  });
}

// MINI PUNTO DE VENTA EN ORDENES (REFACCIONES)
// Reescribimos la función calcularSaldoEdit para que sume Refacciones + Mano de Obra
function calcularSaldoEdit() {
  const manoObra =
    parseFloat(document.getElementById("edit-mano-obra").value) || 0;
  const totalRefacciones =
    parseFloat(document.getElementById("total-refacciones-input").value) || 0;

  // El costo total de la orden ahora se calcula solo
  const costoTotal = manoObra + totalRefacciones;
  document.getElementById("edit-costo").value = costoTotal.toFixed(2);

  const anticipoAcumulado =
    parseFloat(document.getElementById("edit-anticipo").value) || 0;
  const nuevoAbono =
    parseFloat(document.getElementById("edit-nuevo-abono").value) || 0;

  let saldoFinal = costoTotal - (anticipoAcumulado + nuevoAbono);
  if (saldoFinal < 0) saldoFinal = 0;

  const inputSaldo = document.getElementById("edit-saldo");
  if (inputSaldo) inputSaldo.value = saldoFinal.toFixed(2);
}

// Lógica para sumar las filas de la tabla de refacciones
function recalcularTablaRefacciones() {
  let total = 0;
  const filas = document.querySelectorAll(".fila-refaccion");

  filas.forEach((fila) => {
    const cantidad = parseFloat(fila.querySelector(".input-cant").value) || 1;
    const precio = parseFloat(fila.querySelector(".input-precio").value) || 0;
    const subtotal = cantidad * precio;

    fila.querySelector(".td-subtotal").textContent = "$" + subtotal.toFixed(2);
    total += subtotal;
  });

  document.getElementById("total-refacciones-text").textContent =
    total.toFixed(2);
  document.getElementById("total-refacciones-input").value = total.toFixed(2);

  // Mostramos u ocultamos el mensaje de "tabla vacía"
  document.getElementById("fila-vacia-refacciones").style.display =
    filas.length === 0 ? "table-row" : "none";

  // Al recalcular las piezas, forzamos recalcular el saldo general de la orden
  calcularSaldoEdit();
}

// Eliminar una pieza del carrito
function eliminarRefaccion(btn) {
  btn.closest("tr").remove();
  recalcularTablaRefacciones();
}

//  Agregar al carrito de mentiras (Frontend)
function agregarRefaccion(idProducto, nombre, precio) {
  // Verificamos si ya está en la tabla para sumarle 1 en lugar de duplicar fila
  const filaExistente = document.querySelector(
    `.fila-refaccion[data-id="${idProducto}"]`,
  );
  if (filaExistente) {
    const inputCant = filaExistente.querySelector(".input-cant");
    inputCant.value = parseInt(inputCant.value) + 1;
    recalcularTablaRefacciones();
    return;
  }

  const tbody = document.getElementById("tabla-refacciones-orden");
  const tr = document.createElement("tr");
  tr.className = "fila-refaccion";
  tr.dataset.id = idProducto;

  // Aquí inyectamos inputs invisibles (name="refacciones[]") para enviarlos a PHP
  tr.innerHTML = `
        <td style="padding: 5px;">
            ${nombre}
            <input type="hidden" name="refacciones_id[]" value="${idProducto}">
        </td>
        <td style="padding: 5px; text-align: center;">
            <input type="number" name="refacciones_cant[]" class="input-cant" value="1" min="1" oninput="recalcularTablaRefacciones()" style="width: 60px; text-align: center; padding: 2px;">
        </td>
        <td style="padding: 5px; text-align: center;">
            <input type="number" name="refacciones_precio[]" class="input-precio" value="${precio}" step="0.01" min="0" oninput="recalcularTablaRefacciones()" style="width: 80px; text-align: center; padding: 2px;">
        </td>
        <td style="padding: 5px; text-align: center; font-weight: bold;" class="td-subtotal">$${precio.toFixed(2)}</td>
        <td style="padding: 5px; text-align: center;">
            <button type="button" onclick="eliminarRefaccion(this)" style="background: red; color: white; border: none; padding: 3px 8px; border-radius: 3px; cursor: pointer;"><i class="fa-solid fa-trash"></i></button>
        </td>
    `;

  tbody.appendChild(tr);
  recalcularTablaRefacciones();
}

// El Buscador Autocomplete
let timeoutBusquedaProd;
document.addEventListener("input", function (e) {
  if (e.target && e.target.id === "busqueda-producto-orden") {
    const termino = e.target.value.trim();
    const listaResultados = document.getElementById(
      "lista-resultados-productos",
    );

    clearTimeout(timeoutBusquedaProd);
    listaResultados.innerHTML = "";

    if (termino.length < 2) {
      listaResultados.style.display = "none";
      return;
    }

    timeoutBusquedaProd = setTimeout(() => {
      // Este es el archivo PHP que crearemos enseguida para buscar el stock
      fetch(`cruds/buscar_productos_orden.php?q=${encodeURIComponent(termino)}`)
        .then((res) => res.json())
        .then((data) => {
          listaResultados.innerHTML = "";
          if (data.length > 0) {
            listaResultados.style.display = "block";
            data.forEach((prod) => {
              const li = document.createElement("li");
              li.style.padding = "10px";
              li.style.cursor = "pointer";
              li.style.borderBottom = "1px solid #eee";

              // Si tiene stock 0, lo pintamos rojo pero igual dejamos agregarlo (por si llegó y no lo han metido al sistema)
              const stockTexto =
                prod.stock > 0
                  ? `<span style="color:green;">Stock: ${prod.stock}</span>`
                  : `<span style="color:red;">Stock: ${prod.stock}</span>`;

              li.innerHTML = `<strong>${prod.codebar}</strong> - ${prod.nombre} | ${stockTexto} | $${prod.precio}`;

              // Evento de clic para agregarlo a la tabla
              li.onmousedown = function () {
                agregarRefaccion(prod.id, prod.nombre, parseFloat(prod.precio));
                e.target.value = "";
                listaResultados.style.display = "none";
              };
              listaResultados.appendChild(li);
            });
          } else {
            listaResultados.style.display = "block";
            listaResultados.innerHTML =
              '<li style="padding: 10px; color: red;">No se encontró el producto.</li>';
          }
        })
        .catch((err) => console.error(err));
    }, 300);
  }
});

// IMPRIMIR NOTA DE ENTREGA FINAL (58mm)
window.imprimirNotaEntrega = function(id_orden) {
    // Abrimos el ticket en una ventanita pequeña flotante ideal para miniprinters
    let url = "../php/cruds/imprimir_nota_entrega.php?id=" + id_orden;
    window.open(url, "NotaEntrega", "width=400,height=600,scrollbars=yes");
};

// Llamar Ventas ********************************************
document
  .getElementById("ventas-link")
  .addEventListener("click", function (event) {
    event.preventDefault(); // Evita la acción por defecto del enlace
    fetch("catalogos/ventas.php")
      .then((response) => response.text())
      .then((html) => {
        document.getElementById("content-area").innerHTML = html;
        inicializarPOS();
      })
      .catch((error) => {
        console.error("Error al cargar el contenido:", error);
      });
  });

// MOTOR DEL PUNTO DE VENTA (POS)
let productosPOS = [];
let carritoPOS = [];
window.idCotizacionOrigenPOS = 0; // Para recordar si venimos de una cotización

function inicializarPOS() {
  // Verificamos si hay cortes pendientes de días anteriores
  fetch("../php/funciones/verificar_corte_pendiente.php")
    .then((res) => res.json())
    .then((data) => {
      if (data.bloquear) {
        Swal.fire({
          title: "¡Corte Pendiente!",
          text: "Detectamos ventas de días anteriores sin cerrar. Debes realizar tu Corte de Caja antes de iniciar un nuevo turno de ventas.",
          icon: "error",
          allowOutsideClick: false,
          confirmButtonColor: "#dc3545",
          confirmButtonText:
            '<i class="fa-solid fa-cash-register"></i> Ir a Corte de Caja',
        }).then(() => {
          // Redirigimos al usuario a la pantalla de Corte a la fuerza
          if (document.getElementById("corte-link")) {
            document.getElementById("corte-link").click();
          }
        });

        // Ocultamos la interfaz del POS para que no pueda vender nada
        let posContainer = document.getElementById("pos-container");
        if (posContainer) posContainer.style.opacity = "0.2";
        if (posContainer) posContainer.style.pointerEvents = "none";
        return; // Detenemos la ejecución del POS aquí mismo
      }

      // SI NO HAY BLOQUEO, CONTINÚA EL FLUJO NORMAL DEL POS
      carritoPOS = [];
      window.idCotizacionOrigenPOS = 0; // La reseteamos a 0 por si es una venta normal

      let cotizacionPendiente = sessionStorage.getItem("cotizacion_a_venta");

      if (cotizacionPendiente) {
        let dataCot = JSON.parse(cotizacionPendiente);

        //LE DAMOS LA MEMORIA AL POS:
        window.idCotizacionOrigenPOS = dataCot.cotizacion.id_cotizacion;

        // Inyectamos los datos del cliente en la caja (si es que había uno)
        setTimeout(() => {
          // Pequeño delay para asegurar que el DOM cargó
          let inputIdClienteVenta = document.getElementById("pos-id-cliente");
          let inputNombreClienteVenta =
            document.getElementById("pos-nombre-cliente");
          let btnQuitarCliente = document.getElementById(
            "btn-quitar-cliente-pos",
          );

          if (inputIdClienteVenta)
            inputIdClienteVenta.value = dataCot.cotizacion.id_cliente;

          if (inputNombreClienteVenta && dataCot.cotizacion.id_cliente != "0") {
            // Si no es público en general, llenamos el campo y mostramos la "X"
            inputNombreClienteVenta.value =
              dataCot.cotizacion.nombre_cliente_completo;
            if (btnQuitarCliente)
              btnQuitarCliente.style.display = "inline-block";
          }
        }, 100);

        // Pasamos todos los productos de la cotización al carrito de ventas
        dataCot.detalles.forEach((det) => {
          carritoPOS.push({
            id_interno: "cot_" + det.id_detalle,
            id_prod: det.id_producto, // CORREGIDO PARA QUE NO MARQUE ERROR EN PHP
            nombre: det.concepto,
            precio: parseFloat(det.precio_unitario),
            cantidad: parseInt(det.cantidad),
            stock_max: 9999, // Ignoramos stock por si era concepto libre
          });
        });

        // Le ordenamos a la pantalla que redibuje la tabla con los productos nuevos
        if (typeof actualizarCarritoUI === "function") {
          actualizarCarritoUI();
        }

        // Limpiamos la memoria del navegador para que no se vuelva a cargar en el futuro
        sessionStorage.removeItem("cotizacion_a_venta");

        // Alerta de éxito para el cajero
        const Toast = Swal.mixin({
          toast: true,
          position: "top-end",
          showConfirmButton: false,
          timer: 3000,
        });
        Toast.fire({
          icon: "success",
          title:
            "Cotización #" + dataCot.cotizacion.id_cotizacion + " cargada.",
        });
      }

      cargarInventarioPOS();

      // Activar buscador en tiempo real
      let buscador = document.getElementById("buscar-producto-pos");
      if (buscador) {
        buscador.addEventListener("input", function (e) {
          renderizarGridProductos(e.target.value);
        });
      }

      // Activar botón de cobrar (lo conectaremos a PHP en el siguiente paso)
      let btnCobrar = document.getElementById("pos-btn-cobrar");
      if (btnCobrar) {
        btnCobrar.addEventListener("click", function () {
          if (carritoPOS.length === 0) return;

          let totalVenta = carritoPOS.reduce(
            (sum, item) => sum + item.precio * item.cantidad,
            0,
          );
          let metodoPago = document.getElementById("pos-metodo-pago").value;

          // PAGO EN EFECTIVO (Calculadora de Cambio)
          if (metodoPago === "Efectivo") {
            Swal.fire({
              title: "Cobro en Efectivo ",
              html: `<h2 style="color:#28a745; margin:10px 0;">Total: $${totalVenta.toFixed(2)}</h2>`,
              input: "number",
              inputAttributes: { step: "0.50", min: totalVenta },
              inputPlaceholder: "¿Con cuánto paga el cliente?",
              showCancelButton: true,
              confirmButtonText: '<i class="fa-solid fa-check"></i> Procesar',
              cancelButtonText: "Cancelar",
              inputValidator: (value) => {
                if (!value) return "Debes ingresar una cantidad";
                if (parseFloat(value) < totalVenta)
                  return "El pago es menor al total a cobrar";
              },
            }).then((result) => {
              if (result.isConfirmed) {
                let pagoReal = parseFloat(result.value);
                let cambio = pagoReal - totalVenta;

                // Mostramos el cambio en gigante y luego cobramos
                Swal.fire({
                  icon: "info",
                  title: "Su Cambio es:",
                  html: `<h1 style="font-size: 40px; color: #007bff; margin: 0;">$${cambio.toFixed(2)}</h1>`,
                  confirmButtonText: "Continuar a Entrega de Ticket",
                  allowOutsideClick: false,
                }).then(() => {
                  procesarCobroEnBackend(
                    totalVenta,
                    metodoPago,
                    pagoReal,
                    cambio,
                    "",
                  );
                });
              }
            });
          }
          // PAGO CON TARJETA (Pide Referencia)
          else if (metodoPago === "Tarjeta") {
            Swal.fire({
              title: "Cobro con Tarjeta",
              text: `Total a cobrar: $${totalVenta.toFixed(2)}`,
              input: "text",
              inputPlaceholder: "Ingresa el No. de Autorización o Referencia",
              showCancelButton: true,
              confirmButtonText: '<i class="fa-solid fa-check"></i> Procesar',
              cancelButtonText: "Cancelar",
            }).then((result) => {
              if (result.isConfirmed) {
                procesarCobroEnBackend(
                  totalVenta,
                  metodoPago,
                  0,
                  0,
                  result.value,
                );
              }
            });
          }
          // TRANSFERENCIA (Pasa directo)
          else {
            procesarCobroEnBackend(totalVenta, metodoPago, 0, 0, "");
          }
        });
      }

      // Función global para enviar los datos a PHP
      window.procesarCobroEnBackend = function (
        totalVenta,
        metodoPago,
        pagoCliente,
        cambioCliente,
        referencia,
      ) {
        let btnCobrar = document.getElementById("pos-btn-cobrar");
        btnCobrar.disabled = true;
        btnCobrar.innerHTML =
          '<i class="fa-solid fa-spinner fa-spin"></i> COBRANDO...';

        let idClienteSeleccionado = document.getElementById("pos-id-cliente")
          ? document.getElementById("pos-id-cliente").value
          : 0;

        let datosVenta = {
          carrito: carritoPOS,
          total: totalVenta,
          metodo_pago: metodoPago,
          referencia: referencia,
          id_cliente: idClienteSeleccionado,
          pago_cliente: pagoCliente,
          cambio_cliente: cambioCliente,
          id_cotizacion_origen: window.idCotizacionOrigenPOS,
        };

        fetch("../php/cruds/procesar_venta_mostrador.php", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(datosVenta),
        })
          .then((res) => res.json())
          .then((data) => {
            if (data.success) {
              carritoPOS = [];
              cargarInventarioPOS();
              actualizarCarritoUI();
              btnCobrar.innerHTML =
                '<i class="fa-solid fa-check-circle"></i> COBRAR';

              let selectPago = document.getElementById("pos-metodo-pago");
              if (selectPago) selectPago.value = "Efectivo";

              localStorage.setItem("ultima_venta_pos", data.id_venta);

              let nombreCliente = document.getElementById("pos-nombre-cliente")
                ? document.getElementById("pos-nombre-cliente").value
                : "";
              if (!nombreCliente || nombreCliente === "")
                nombreCliente = "Cliente";
              let telefonoCliente = data.telefono || "";
              let emailCliente = data.email || "";
              let tokenTicket = data.token || "";

              mostrarOpcionesTicket(
                data.id_venta,
                telefonoCliente,
                nombreCliente,
                totalVenta,
                emailCliente,
                tokenTicket,
              );
            } else {
              Swal.fire("Error", data.message, "error");
              btnCobrar.disabled = false;
            }
          })
          .catch((error) => {
            console.error("Error en el cobro:", error);
            Swal.fire("Error", "Ocurrió un error en el servidor.", "error");
            btnCobrar.disabled = false;
          });
      };

      // Botón de Reimprimir Último Ticket
      let btnReimprimir = document.getElementById("btn-reimprimir-pos");
      if (btnReimprimir) {
        btnReimprimir.addEventListener("click", function () {
          let ultimaVenta = localStorage.getItem("ultima_venta_pos");
          if (ultimaVenta) {
            window.open(
              "../php/cruds/imprimir_ticket_pos.php?id=" + ultimaVenta,
              "_blank",
            );
          } else {
            Swal.fire(
              "Aviso",
              "No hay registros de ventas recientes en esta computadora.",
              "info",
            );
          }
        });
      }

      // BUSCADOR DE CLIENTES EN EL POS
      let btnBuscarCliente = document.getElementById("btn-buscar-cliente-pos");
      let btnQuitarCliente = document.getElementById("btn-quitar-cliente-pos");
      let inputIdCliente = document.getElementById("pos-id-cliente");
      let inputNombreCliente = document.getElementById("pos-nombre-cliente");

      if (btnBuscarCliente) {
        btnBuscarCliente.addEventListener("click", function () {
          fetch("../php/funciones/api_clientes_pos.php")
            .then((res) => res.json())
            .then((clientes) => {
              if (clientes.error) {
                Swal.fire(
                  "Error",
                  "No se pudieron cargar los clientes.",
                  "error",
                );
                return;
              }

              let options =
                '<option value="0" selected>Público en General</option>';
              clientes.forEach((c) => {
                options += `<option value="${c.id_cliente}">${c.nombre}- ${c.papellido} - ${c.telefono}</option>`;
              });

              Swal.fire({
                title: "Seleccionar Cliente 👤",
                html: `
                      <input type="search" id="swal-search-cliente" class="swal2-input" placeholder="🔍 Buscar por nombre o teléfono..." autocomplete="off" style="width: 90%; max-width: 100%; margin: 0 auto 15px auto; display: block; box-sizing: border-box;">
                      <select id="swal-select-cliente" size="6" style="width: 90%; height:140px !important; max-width: 100%; overflow-y: auto; overflow-x: hidden; padding: 10px; font-size: 15px; border: 1px solid #d9d9d9; border-radius: 8px; outline: none; display: block; margin: 0 auto; box-sizing: border-box; background: #fff; color: #333;">
                          ${options}
                      </select>
                  `,
                showCancelButton: true,
                confirmButtonText: '<i class="fa-solid fa-check"></i> Asignar',
                cancelButtonText: "Cancelar",
                didOpen: () => {
                  let buscador = document.getElementById("swal-search-cliente");
                  let select = document.getElementById("swal-select-cliente");
                  let opciones = select.getElementsByTagName("option");

                  buscador.focus();

                  buscador.addEventListener("keyup", function () {
                    let filtro = this.value.toLowerCase();
                    for (let i = 0; i < opciones.length; i++) {
                      let texto = opciones[i].textContent.toLowerCase();
                      if (opciones[i].value === "0" || texto.includes(filtro)) {
                        opciones[i].style.display = "";
                      } else {
                        opciones[i].style.display = "none";
                      }
                    }
                  });

                  select.addEventListener("dblclick", function () {
                    Swal.clickConfirm();
                  });
                },
                preConfirm: () => {
                  let select = document.getElementById("swal-select-cliente");
                  if (select.selectedIndex === -1) {
                    Swal.showValidationMessage(
                      "Selecciona un cliente de la lista",
                    );
                    return false;
                  }
                  return {
                    id: select.value,
                    texto: select.options[select.selectedIndex].text,
                  };
                },
              }).then((result) => {
                if (result.isConfirmed) {
                  let cliente = result.value;
                  inputIdCliente.value = cliente.id;

                  if (cliente.id === "0") {
                    inputNombreCliente.value = "";
                    btnQuitarCliente.style.display = "none";
                  } else {
                    let soloNombre = cliente.texto.split(" - ")[0];
                    inputNombreCliente.value = soloNombre;
                    btnQuitarCliente.style.display = "inline-block";
                  }
                }
              });
            });
        });
      }

      if (btnQuitarCliente) {
        btnQuitarCliente.addEventListener("click", function () {
          inputIdCliente.value = "0";
          inputNombreCliente.value = "";
          this.style.display = "none";
        });
      }

      // BOTÓN DE RETIRO DE CAJA (GASTOS)
      let btnRetiroCaja = document.getElementById("btn-retiro-caja-pos");
      if (btnRetiroCaja) {
        btnRetiroCaja.addEventListener("click", function () {
          Swal.fire({
            title: "Retiro de Efectivo",
            html: `
                  <p style="font-size: 14px; color: #666; margin-bottom: 15px;">Registra el dinero que tomas físicamente del cajón.</p>
                  <input type="text" id="swal-motivo-retiro" class="swal2-input" placeholder="Motivo (Ej. Pago de agua, comida...)" autocomplete="off" style="width: 85%;">
                  <input type="number" id="swal-monto-retiro" class="swal2-input" placeholder="$ Monto a retirar" step="0.50" min="0.50" style="width: 85%;">
              `,
            showCancelButton: true,
            confirmButtonColor: "#dc3545",
            confirmButtonText:
              '<i class="fa-solid fa-hand-holding-dollar"></i> Registrar Retiro',
            cancelButtonText: "Cancelar",
            preConfirm: () => {
              let motivo = document
                .getElementById("swal-motivo-retiro")
                .value.trim();
              let monto = parseFloat(
                document.getElementById("swal-monto-retiro").value,
              );

              if (!motivo) {
                Swal.showValidationMessage(
                  "Debes escribir un motivo para el corte.",
                );
                return false;
              }
              if (!monto || monto <= 0) {
                Swal.showValidationMessage(
                  "Ingresa una cantidad válida mayor a 0.",
                );
                return false;
              }

              return { motivo: motivo, monto: monto };
            },
          }).then((result) => {
            if (result.isConfirmed) {
              fetch("../php/funciones/registrar_retiro_caja.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(result.value),
              })
                .then((res) => res.json())
                .then((data) => {
                  if (data.success) {
                    Swal.fire({
                      icon: "success",
                      title: "Retiro Registrado",
                      text: `Se restaron $${result.value.monto.toFixed(2)} de la caja.`,
                      timer: 2000,
                      showConfirmButton: false,
                    });
                  } else {
                    Swal.fire("Error", data.message, "error");
                  }
                });
            }
          });
        });
      }
    })
    .catch((err) => {
      console.error("Error al verificar corte:", err);
    });
}

//  Traer productos de la base de datos
function cargarInventarioPOS() {
  // Asegúrate de que la ruta apunte correctamente a tu archivo
  fetch("../php/funciones/api_productos_pos.php")
    .then((res) => res.json())
    .then((data) => {
      if (!data.error) {
        productosPOS = data;
        renderizarGridProductos("");
      } else {
        console.error(data.error);
      }
    })
    .catch((err) => console.error("Error al cargar POS", err));
}

//  Dibujar las tarjetas de productos
function renderizarGridProductos(filtro = "") {
  let grid = document.getElementById("grid-productos-pos");
  if (!grid) return;

  grid.innerHTML = "";
  filtro = filtro.toLowerCase();

  // Filtramos el arreglo de productos
  let filtrados = productosPOS.filter(
    (p) =>
      p.nombre_prod.toLowerCase().includes(filtro) ||
      (p.codigo_prod && p.codigo_prod.toLowerCase().includes(filtro)),
  );

  if (filtrados.length === 0) {
    grid.innerHTML =
      '<div style="grid-column: 1 / -1; text-align: center; color: #888;">No se encontraron productos.</div>';
    return;
  }

  // Dibujamos cada tarjeta
  filtrados.forEach((prod) => {
    let card = document.createElement("div");
    card.className = "producto-card";
    card.innerHTML = `
            <div class="prod-nombre">${prod.nombre_prod}</div>
            <div class="prod-precio">$${parseFloat(prod.p_venta).toFixed(2)}</div>
            <div class="prod-stock">Stock: ${prod.stock}</div>
        `;
    // Al darle clic, lo mandamos al carrito
    card.addEventListener("click", () => agregarAlCarrito(prod));
    grid.appendChild(card);
  });
}

// Lógica del Carrito
function agregarAlCarrito(producto) {
  // Asegurarnos de que el stock sea un NÚMERO real y no un texto fantasma
  let stockReal = parseInt(producto.stock);
  let item = carritoPOS.find((i) => i.id_prod === producto.id_prod);

  if (item) {
    if (item.cantidad < stockReal) {
      item.cantidad++;
    } else {
      if (typeof Swal !== "undefined") {
        Swal.fire({
          icon: "warning",
          title: "Stock insuficiente",
          text: "No hay más unidades.",
          timer: 1500,
        });
      } else {
        alert("Stock insuficiente: No hay más unidades disponibles.");
      }
    }
  } else {
    carritoPOS.push({
      id_prod: producto.id_prod,
      nombre: producto.nombre_prod,
      precio: parseFloat(producto.p_venta),
      cantidad: 1,
      stock_max: stockReal, // Guardado como número real puro
    });
  }
  actualizarCarritoUI();
}

// BOTONES: Sumar, Restar y Eliminar
window.modificarCantidad = function (id_prod, delta) {
  let item = carritoPOS.find((i) => i.id_prod === id_prod);
  if (!item) return;

  // Forzamos a que ambos sean números puros antes de sumarlos/restarlos
  item.cantidad = parseInt(item.cantidad) + parseInt(delta);

  if (item.cantidad <= 0) {
    carritoPOS = carritoPOS.filter((i) => i.id_prod !== id_prod); // Adiós producto
  } else if (item.cantidad > item.stock_max) {
    item.cantidad = item.stock_max; // Topamos al máximo stock (número puro)
  }
  actualizarCarritoUI();
};

// CAJA DE TEXTO: Función "Dictadora"
window.fijarCantidad = function (id_prod, cantidadStr) {
  let item = carritoPOS.find((i) => i.id_prod === id_prod);
  if (!item) return;

  let nuevaC = parseInt(cantidadStr);

  // Si borran el número o ponen letras, lo regresamos a 1
  if (isNaN(nuevaC) || nuevaC <= 0) {
    item.cantidad = 1;
  }
  // Si piden más del stock, los topamos al máximo
  else if (nuevaC > item.stock_max) {
    item.cantidad = item.stock_max; // Número puro
    if (typeof Swal !== "undefined") {
      Swal.fire({
        icon: "warning",
        title: "Stock límite",
        text: `Solo tenemos ${item.stock_max} disponibles.`,
        timer: 1500,
      });
    } else {
      alert(`Stock límite: Solo tenemos ${item.stock_max} disponibles.`);
    }
  }
  // Si todo está bien, le asignamos el número exacto
  else {
    item.cantidad = nuevaC;
  }

  actualizarCarritoUI();
};

// Dibujar la tabla del carrito y calcular el gran total
function actualizarCarritoUI() {
  let tbody = document.getElementById("tabla-carrito-pos");
  let totalArticulosSpan = document.getElementById("pos-total-articulos");
  let granTotalSpan = document.getElementById("pos-gran-total");
  let btnCobrar = document.getElementById("pos-btn-cobrar");

  tbody.innerHTML = "";
  let granTotal = 0;
  let totalArticulos = 0;

  if (carritoPOS.length === 0) {
    tbody.innerHTML =
      '<tr><td colspan="4" style="text-align: center; color: #999; padding: 30px 10px;">El carrito está vacío.</td></tr>';
    btnCobrar.disabled = true;
    totalArticulosSpan.textContent = "0";
    granTotalSpan.textContent = "$0.00";
    return;
  }

  carritoPOS.forEach((item) => {
    let subtotal = item.precio * item.cantidad;
    granTotal += subtotal;
    totalArticulos += item.cantidad;

    // Ya no usamos onclick en el HTML, dejamos las clases listas para JS
    let tr = document.createElement("tr");

    tr.innerHTML = `
            <td style="font-size: 14px; font-weight: 600;">${item.nombre}</td>
            <td style="text-align: center; white-space: nowrap;">
                <button class="btn-qty btn-restar-pos">-</button>
                <input type="number" class="input-qty pos-cantidad-manual" value="${item.cantidad}" min="1" max="${item.stock_max}" style="width: 50px; text-align: center; font-weight: bold; border: 1px solid #ddd; border-radius: 4px; margin: 0 5px; outline: none;">
                <button class="btn-qty btn-sumar-pos">+</button>
            </td>
            <td style="text-align: right; color: #28a745; font-weight: bold;">$${subtotal.toFixed(2)}</td>
            <td style="text-align: right;">
                <button class="btn-remove btn-quitar-pos" title="Quitar">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </td>
        `;

    // BOTONES DEL CARRITO PARA AUMENTAR O DISMINUIR CANTIDAD DEL PRODUCTO
    tr.querySelector(".btn-restar-pos").addEventListener("click", function () {
      modificarCantidad(item.id_prod, -1);
    });

    tr.querySelector(".btn-sumar-pos").addEventListener("click", function () {
      modificarCantidad(item.id_prod, 1);
    });

    tr.querySelector(".btn-quitar-pos").addEventListener("click", function () {
      modificarCantidad(item.id_prod, -item.cantidad);
    });

    //  Si el usuario escribe el número a mano
    // Usamos 'change' para cuando el usuario da Enter o clic afuera
    tr.querySelector(".pos-cantidad-manual").addEventListener(
      "change",
      function () {
        fijarCantidad(item.id_prod, this.value);
      },
    );

    // Usamos 'keyup' para evitar que se quede pasmado si escriben y borran rápido
    tr.querySelector(".pos-cantidad-manual").addEventListener(
      "keyup",
      function (e) {
        if (e.key === "Enter") {
          fijarCantidad(item.id_prod, this.value);
        }
      },
    );

    tbody.appendChild(tr);
  });

  totalArticulosSpan.textContent = totalArticulos;
  granTotalSpan.textContent = `$${granTotal.toFixed(2)}`;
  btnCobrar.disabled = false;
}

// Llamar corte de caja ********************************************
document
  .getElementById("corte-link")
  .addEventListener("click", function (event) {
    event.preventDefault(); // Evita la acción por defecto del enlace
    fetch("catalogos/corte_caja.php")
      .then((response) => response.text())
      .then((html) => {
        document.getElementById("content-area").innerHTML = html;
        inicializarCorteCaja();
      })
      .catch((error) => {
        console.error("Error al cargar el contenido:", error);
      });
  });

// MÓDULO: CORTE DE CAJA (REPORTE Z) - VERSIÓN CORTE CIEGO
function inicializarCorteCaja() {
  fetch("../php/funciones/api_corte_caja.php")
    .then((res) => res.json())
    .then((data) => {
      if (data.success) {
        document.getElementById("corte-fecha-actual").textContent = data.fecha;

        //  CORTE CIEGO: Ocultamos los totales visuales con signos de interrogación
        document.getElementById("corte-total-efectivo").textContent = "$ ??.??";
        document.getElementById("corte-total-tarjeta").textContent = "$ ??.??";
        document.getElementById("corte-total-transferencia").textContent =
          "$ ??.??";

        //  GUARDAMOS LOS DATOS REALES EN SECRETO EN LA MEMORIA
        window.efectivoEsperadoSistema = data.efectivo;
        window.tarjetaEsperada = data.tarjeta;
        window.transferenciaEsperada = data.transferencia;
        window.retirosCorte = data.retiros;

        if (data.efectivo > 0 || data.tarjeta > 0 || data.transferencia > 0) {
          activarCuadreFisicoCiego();
        } else {
          document.getElementById("corte-mensaje-resultado").style.display =
            "block";
          document.getElementById("corte-mensaje-resultado").textContent =
            "No hay ventas registradas en el turno actual.";
          document.getElementById("corte-mensaje-resultado").className =
            "resultado-cuadre cuadre-sobra";
        }
      }
    })
    .catch((err) => console.error("Error al cargar corte:", err));
}

// Lógica del Cajero (Corte Ciego)
function activarCuadreFisicoCiego() {
  let inputFisico = document.getElementById("corte-efectivo-fisico");
  let mensaje = document.getElementById("corte-mensaje-resultado");
  let btnCerrar = document.getElementById("btn-procesar-corte");

  // Limpiamos la pantalla inicial
  mensaje.style.display = "block";
  mensaje.textContent = "Cuenta el dinero del cajón e ingresa el monto total.";
  mensaje.className = "resultado-cuadre";
  btnCerrar.disabled = false;

  // EVENTO DEL BOTÓN CERRAR TURNO (Aquí ocurre la revelación)
  btnCerrar.onclick = function () {
    let fisico = parseFloat(inputFisico.value);
    let esperado = window.efectivoEsperadoSistema;

    if (isNaN(fisico) || fisico < 0) {
      Swal.fire(
        "Atención",
        "Debes ingresar cuánto dinero físico contaste en la caja.",
        "warning",
      );
      return;
    }

    let diferencia = fisico - esperado;

    // Preparamos el veredicto
    let titulo = "";
    let htmlMensaje = "";
    let icono = "";

    if (diferencia === 0) {
      titulo = "¡Cuadre Perfecto! ";
      htmlMensaje = `El sistema esperaba <b>$${esperado.toFixed(2)}</b> y contaste exactamente <b>$${fisico.toFixed(2)}</b>.`;
      icono = "success";
    } else if (diferencia < 0) {
      titulo = "¡Faltante Detectado! ";
      htmlMensaje = `Faltan <b style="color:red;">$${Math.abs(diferencia).toFixed(2)}</b> en caja.<br><br>El sistema esperaba <b>$${esperado.toFixed(2)}</b> y solo declaraste <b>$${fisico.toFixed(2)}</b>.`;
      icono = "warning";
    } else {
      titulo = "¡Sobrante Detectado! ";
      htmlMensaje = `Sobran <b style="color:green;">$${diferencia.toFixed(2)}</b> en caja.<br><br>El sistema esperaba <b>$${esperado.toFixed(2)}</b> y declaraste <b>$${fisico.toFixed(2)}</b>.`;
      icono = "info";
    }

    Swal.fire({
      title: titulo,
      html:
        htmlMensaje + "<br><br>¿Confirmar este resultado e Imprimir Corte Z?",
      icon: icono,
      showCancelButton: true,
      confirmButtonColor: "#dc3545",
      confirmButtonText: '<i class="fa-solid fa-lock"></i> Sí, Cerrar Turno',
      cancelButtonText: "Cancelar, volver a contar",
    }).then((result) => {
      if (result.isConfirmed) {
        btnCerrar.disabled = true;
        btnCerrar.innerHTML =
          '<i class="fa-solid fa-spinner fa-spin"></i> Guardando...';

        // Armamos el empaque leyendo desde nuestra memoria secreta
        let datosCorte = {
          esperado: esperado,
          fisico: fisico,
          diferencia: diferencia,
          tarjeta: window.tarjetaEsperada,
          transferencia: window.transferenciaEsperada,
          retiros: window.retirosCorte,
        };

        fetch("../php/funciones/procesar_corte_caja.php", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(datosCorte),
        })
          .then((res) => res.json())
          .then((data) => {
            if (data.success) {
              Swal.fire({
                icon: "success",
                title: "¡Turno Cerrado!",
                text: "El corte ha sido registrado exitosamente.",
                timer: 2000,
                showConfirmButton: false,
              }).then(() => {
                window.open(
                  "../php/cruds/imprimir_ticket_corte.php?id=" + data.id_corte,
                  "_blank",
                );
                btnCerrar.innerHTML =
                  '<i class="fa-solid fa-lock"></i> CERRAR TURNO E IMPRIMIR';
                inputFisico.value = "";
                inicializarCorteCaja(); // Recargamos para que todo vuelva a cero
              });
            } else {
              Swal.fire("Error", data.message, "error");
              btnCerrar.disabled = false;
              btnCerrar.innerHTML =
                '<i class="fa-solid fa-lock"></i> CERRAR TURNO E IMPRIMIR';
            }
          });
      }
    });
  };
}

// Llamar Historial de ventas *****************************************************************
document
  .getElementById("historialventas-link")
  .addEventListener("click", function (event) {
    event.preventDefault();
    fetch("../php/operaciones/historial_ventas.php")
      .then((response) => response.text())
      .then((html) => {
        document.getElementById("content-area").innerHTML = html;

        //  Forzamos las cajitas de fecha al día local exacto
        let hoyLocal = new Date().toLocaleDateString("en-CA"); // Formato YYYY-MM-DD
        document.getElementById("filtro-fecha-inicio").value = hoyLocal;
        document.getElementById("filtro-fecha-fin").value = hoyLocal;

        // AQUÍ VA EL EVENTO (Detecta el Enter o la "X" nativa del buscador)
        document
          .getElementById("filtro-texto")
          .addEventListener("search", function () {
            cargarHistorial();
          });

        cargarHistorial();
      })
      .catch((error) => console.error("Error al cargar el contenido:", error));
  });

// FUNCIONES DEL HISTORIAL DE VENTAS
function cargarHistorial() {
  let fechaInicio = document.getElementById("filtro-fecha-inicio").value;
  let fechaFin = document.getElementById("filtro-fecha-fin").value;
  let texto = document.getElementById("filtro-texto").value;

  // Para que espacios ("Público en General") no rompan la URL
  let url = `../php/funciones/api_historial_ventas.php?inicio=${fechaInicio}&fin=${fechaFin}&buscar=${encodeURIComponent(texto)}`;

  fetch(url)
    .then((res) => res.json())
    .then((data) => {
      let tbody = document.getElementById("tabla-historial");
      if (!tbody) return;

      // DESTRUIMOS DATATABLES ANTES DE TOCAR EL HTML
      if ($.fn.DataTable.isDataTable("#tabla-historial-ventas")) {
        $("#tabla-historial-ventas").DataTable().destroy();
      }

      //  SI HAY ERROR SQL LO MOSTRAMOS
      if (data.error) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: red; font-weight: bold;"> ${data.error}</td></tr>`;
        return;
      }

      // LIMPIAMOS LA TABLA
      tbody.innerHTML = "";

    // SI HAY DATOS, DIBUJAMOS LAS FILAS (Si no, DataTables pondrá su propio mensaje)
      if (data.length > 0) {
        data.forEach((venta) => {
          let badgeClass = "est-listo";
          let estatusTexto = venta.estatus || "Completada";

          if (estatusTexto === "Cancelada") badgeClass = "est-cancelado";
          if (estatusTexto === "Devolución Parcial") badgeClass = "est-revisión";

          let disableBotones = estatusTexto === "Cancelada"
              ? 'disabled style="opacity: 0.5; cursor: not-allowed;"'
              : "";

          // ETIQUETA VISUAL
          let tipo = venta.tipo_movimiento ? venta.tipo_movimiento.toUpperCase() : 'VENTA';
          let badgeTipo = '';

          if (tipo.includes('VENTA')) {
              badgeTipo = `<span style="background: #17a2b8; color: white; padding: 2px 6px; border-radius: 4px; font-size: 10px; display: inline-block; margin-top: 3px;"><i class="fa-solid fa-cart-shopping"></i> POS</span>`;
          } else if (tipo.includes('ANTICIPO')) {
              badgeTipo = `<span style="background: #ffc107; color: black; padding: 2px 6px; border-radius: 4px; font-size: 10px; display: inline-block; margin-top: 3px;"><i class="fa-solid fa-hourglass-half"></i> ANTICIPO</span>`;
          } else if (tipo.includes('ABONO') || tipo.includes('LIQUIDACION')) {
              badgeTipo = `<span style="background: #28a745; color: white; padding: 2px 6px; border-radius: 4px; font-size: 10px; display: inline-block; margin-top: 3px;"><i class="fa-solid fa-money-bill-wave"></i> ${tipo}</span>`;
          } else {
              badgeTipo = `<span style="background: #6c757d; color: white; padding: 2px 6px; border-radius: 4px; font-size: 10px; display: inline-block; margin-top: 3px;">${tipo}</span>`;
          }

          // Color en el primer <td> del Folio según el tipo de movimiento
          let fila = `
                    <tr>
                        <td style="vertical-align: middle;"><strong>#${venta.id_venta}</strong> <br> ${badgeTipo}</td>
                        <td style="vertical-align: middle;">${venta.fecha_venta}</td>
                        <td style="vertical-align: middle;">${venta.nombre_cliente}</td>
                        <td style="vertical-align: middle;"><strong>$${parseFloat(venta.total).toFixed(2)}</strong></td>
                        <td style="vertical-align: middle;"><span class="badge-estado ${badgeClass}">${estatusTexto}</span></td>
                        <td style="text-align: center; vertical-align: middle;" class="tbl">
                            <button class="editar" title="Reimprimir Ticket" onclick="reimprimirVenta(${venta.id_venta})">
                                <i class="fa-solid fa-print" style="font-size: 16px;"></i>
                            </button>
                            <button class="editar" title="Devolución Parcial" onclick="abrirDevolucion(${venta.id_venta})" ${disableBotones} style="color: #f39c12;">
                                <i class="fa-solid fa-boxes-packing" style="font-size: 16px;"></i>
                            </button>
                            <button class="eliminar" title="Cancelar Venta Completa" onclick="cancelarVentaTotal(${venta.id_venta})" ${disableBotones}>
                                <i class="fa-solid fa-ban" style="font-size: 16px;"></i>
                            </button>
                        </td>
                    </tr>
                `;
          tbody.innerHTML += fila;
        });
      }
      

      // VOLVEMOS A ENCENDER DATATABLES
      let cantidadRegistros = parseInt(
        document.getElementById("cantidad-registros").value,
      );

      let miTabla = $("#tabla-historial-ventas").DataTable({
        language: {
          decimal: "",
          emptyTable: "No se encontraron ventas con esos filtros.",
          info: "Mostrando _START_ a _END_ de _TOTAL_ registros",
          infoEmpty: "Mostrando 0 a 0 de 0 registros",
          infoFiltered: "(filtrado de _MAX_ registros en total)",
          infoPostFix: "",
          thousands: ",",
          lengthMenu: "Mostrar _MENU_ registros",
          loadingRecords: "Cargando...",
          processing: "Procesando...",
          search: "Buscar:",
          zeroRecords: "No se encontraron resultados",
          paginate: {
            first: "Primero",
            last: "Último",
            next: "Siguiente",
            previous: "Anterior",
          },
        },
        pageLength: cantidadRegistros === -1 ? 10000 : cantidadRegistros, // -1 es Todos
        order: [],
        info: true,
        lengthChange: false,
        searching: false,
        scrollY: "50vh",
        scrollCollapse: true,
        scrollX: true,
      });

      // Activamos la reacción inmediata del select "Mostrar: X"
      $("#cantidad-registros")
        .off("change")
        .on("change", function () {
          let val = parseInt($(this).val());
          miTabla.page.len(val === -1 ? 10000 : val).draw();
        });
    })
    .catch((err) => {
      console.error("Error al cargar historial:", err);
    });
}

function reimprimirVenta(idVenta) {
  window.open("../php/cruds/imprimir_ticket_pos.php?id=" + idVenta, "_blank");
}

function abrirDevolucion(idVenta) {
  // Vamos a buscar qué compró el cliente en ese folio
  fetch("../php/operaciones/api_detalle_ticket.php?id=" + idVenta)
    .then((res) => res.json())
    .then((detalles) => {
      // Si solo fueron servicios o abonos, le avisamos que no hay nada físico que devolver
      if (detalles.length === 0) {
        Swal.fire(
          "Atención",
          "Este ticket no tiene productos físicos o ya fue devuelto por completo.",
          "info",
        );
        return;
      }

      // Construimos una tabla HTML para meterla en el SweetAlert
      let html =
        '<table class="table table-bordered table-striped" style="font-size: 14px; text-align: left;">';
      html +=
        '<thead class="thead-dark"><tr><th>Producto</th><th style="text-align:center;">Compró</th><th style="text-align:center;">Devolver</th></tr></thead><tbody>';

      detalles.forEach((item) => {
        html += `<tr>
                <td style="vertical-align: middle;">${item.concepto}</td>
                <td style="text-align:center; vertical-align: middle;"><strong>${item.cantidad}</strong></td>
                <td style="text-align:center; width: 120px;">
                    <input type="number" class="form-control input-devolucion" 
                           data-iddetalle="${item.id_detalle}" 
                           data-idproducto="${item.id_producto}" 
                           data-precio="${item.precio_unitario}" 
                           min="0" max="${item.cantidad}" value="0" style="text-align: center;">
                </td>
            </tr>`;
      });
      html += "</tbody></table>";

      // Lanzamos el SweetAlert con la tabla adentro
      Swal.fire({
        title: `<i class="fa-solid fa-boxes-packing" style="color: #f39c12;"></i> Devolución - Folio #${idVenta}`,
        html: html,
        width: "600px", // Lo hacemos más ancho para que quepa la tabla
        showCancelButton: true,
        confirmButtonColor: "#f39c12",
        cancelButtonColor: "#6c757d",
        confirmButtonText: "Procesar Devolución",
        cancelButtonText: "Cancelar",
        preConfirm: () => {
          // Cuando el usuario le da a "Procesar", recolectamos cuántos quiso devolver
          let devoluciones = [];
          document.querySelectorAll(".input-devolucion").forEach((input) => {
            let cantDevolver = parseInt(input.value);
            if (cantDevolver > 0) {
              devoluciones.push({
                id_detalle: input.dataset.iddetalle,
                id_producto: input.dataset.idproducto,
                precio: parseFloat(input.dataset.precio),
                cantidad_devolver: cantDevolver,
              });
            }
          });

          if (devoluciones.length === 0) {
            Swal.showValidationMessage(
              "Debes seleccionar al menos 1 pieza para devolver.",
            );
          }
          return devoluciones;
        },
      }).then((result) => {
        if (result.isConfirmed) {
          // Preparamos el paquete de datos en formato JSON
          let payload = {
            id_venta: idVenta,
            devoluciones: result.value,
          };

          // Hacemos la llamada al servidor
          fetch("../php/operaciones/procesar_devolucion_parcial.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          })
            .then((res) => res.json())
            .then((data) => {
              if (data.success) {
                // ¡Éxito! Mostramos mensaje y recargamos la tabla
                Swal.fire("¡Procesado!", data.mensaje, "success");
                cargarHistorial();
              } else {
                Swal.fire("Atención", data.mensaje, "error");
              }
            })
            .catch((err) => {
              console.error("Error al procesar devolución:", err);
              Swal.fire(
                "Error",
                "No se pudo conectar con el servidor",
                "error",
              );
            });
        }
      });
    })
    .catch((err) => console.error("Error al cargar detalles:", err));
}

function cancelarVentaTotal(idVenta) {
  Swal.fire({
    title: `¿Anular el ticket #${idVenta}?`,
    text: "El estatus cambiará a Cancelado y TODAS las piezas regresarán a tu inventario. Esta acción no se puede deshacer.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#6c757d",
    confirmButtonText: '<i class="fa-solid fa-ban"></i> Sí, anular venta',
    cancelButtonText: "Cancelar",
  }).then((result) => {
    if (result.isConfirmed) {
      // Preparamos el paquete de datos para PHP
      let formData = new FormData();
      formData.append("id_venta", idVenta);

      // Se lo mandamos a nuestro nuevo archivo PHP
      fetch("../php/operaciones/cancelar_venta_total.php", {
        method: "POST",
        body: formData,
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            // Si todo salió bien, mostramos palomita verde
            Swal.fire("¡Anulada!", data.mensaje, "success");
            // ¡Y recargamos la tabla para que el semáforo se ponga ROJO!
            cargarHistorial();
          } else {
            // Si PHP nos mandó un error, lo mostramos (ej. tabla incorrecta)
            Swal.fire("Atención", data.mensaje, "error");
          }
        })
        .catch((err) => {
          console.error("Error al cancelar:", err);
          Swal.fire(
            "Error de red",
            "No se pudo conectar con el servidor.",
            "error",
          );
        });
    }
  });
}

// FUNCIÓN PARA INGRESAR EFECTIVO A LA CAJA
function ingresarEfectivo() {
  Swal.fire({
    title:
      '<i class="fa-solid fa-money-bill-trend-up" style="color:#28a745;"></i> Ingresar Efectivo',
    html: `
            <div style="text-align: left;">
                <label style="font-weight: bold; font-size: 14px;">Monto a ingresar ($):</label>
                <input type="number" id="monto-ingreso" class="swal2-input" placeholder="Ej. 500" style="margin-top: 5px;">
                
                <label style="font-weight: bold; font-size: 14px; margin-top: 15px; display: block;">Motivo / Concepto:</label>
                <input type="text" id="concepto-ingreso" class="swal2-input" placeholder="Ej. Fondo de caja para devoluciones" style="margin-top: 5px;">
            </div>
        `,
    confirmButtonColor: "#28a745",
    confirmButtonText: "Registrar Ingreso",
    showCancelButton: true,
    cancelButtonText: "Cancelar",
    preConfirm: () => {
      const monto = Swal.getPopup().querySelector("#monto-ingreso").value;
      const concepto = Swal.getPopup().querySelector("#concepto-ingreso").value;
      if (!monto || monto <= 0) {
        Swal.showValidationMessage(`Por favor, ingresa un monto válido.`);
      }
      if (!concepto) {
        Swal.showValidationMessage(`Por favor, escribe el motivo del ingreso.`);
      }
      return { monto: monto, concepto: concepto };
    },
  }).then((result) => {
    if (result.isConfirmed) {
      let formData = new FormData();
      formData.append("monto", result.value.monto);
      formData.append("concepto", result.value.concepto);

      fetch("../php/operaciones/ingresar_efectivo.php", {
        method: "POST",
        body: formData,
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            Swal.fire(
              "¡Ingreso Exitoso!",
              "El dinero ya está disponible en tu caja.",
              "success",
            );
          } else {
            Swal.fire("Error", data.mensaje, "error");
          }
        })
        .catch((err) => {
          console.error("Error al ingresar efectivo:", err);
          Swal.fire("Error", "No se pudo conectar con el servidor", "error");
        });
    }
  });
}

// VENTANA DE OPCIONES DE TICKET (WHATSAPP, CORREO, IMPRIMIR)
function mostrarOpcionesTicket(
  idTicket,
  telefonoCliente,
  nombreCliente,
  total,
  emailCliente = "",
  tokenTicket = "",
) {
  // 🔥 Recibe Token
  Swal.fire({
    title: "¡Venta Exitosa!",
    text: "¿Cómo deseas entregar el comprobante?",
    icon: "success",
    showDenyButton: true,
    showCancelButton: true,
    confirmButtonText: '<i class="fa-brands fa-whatsapp"></i> WhatsApp',
    confirmButtonColor: "#25D366",
    denyButtonText: '<i class="fa-solid fa-print"></i> Imprimir',
    denyButtonColor: "#3085d6",
    cancelButtonText: '<i class="fa-solid fa-envelope"></i> Correo',
    cancelButtonColor: "#dc3545",
    allowOutsideClick: false,
  }).then((result) => {
    if (result.isConfirmed) {
      enviarTicketWhatsApp(
        telefonoCliente,
        nombreCliente,
        idTicket,
        total,
        tokenTicket,
      );
    } else if (result.isDenied) {
      imprimirTicketFisico(idTicket, tokenTicket);
    } else if (result.dismiss === Swal.DismissReason.cancel) {
      enviarTicketCorreo(nombreCliente, idTicket, emailCliente, tokenTicket);
    }
  });
}

// MOTOR DE ENVÍO POR WHATSAPP (Con confirmación siempre y Token)
function enviarTicketWhatsApp(
  telefono,
  nombre,
  folio,
  total,
  tokenTicket = "",
) {
  let telPrellenado = !telefono || telefono === "0" ? "" : telefono;

  Swal.fire({
    title: "Enviar por WhatsApp",
    html: `
        <p style="font-size:14px; color:#555; margin-bottom:15px;">
            Verifica el número para enviar el ticket <strong>#${folio}</strong>:
        </p>
        <input type="number" id="wa-telefono-pos" class="swal2-input" placeholder="Teléfono a 10 dígitos" value="${telPrellenado}" style="width: 80%;">
    `,
    showCancelButton: true,
    confirmButtonText: 'Enviar <i class="fa-brands fa-whatsapp"></i>',
    confirmButtonColor: "#25D366",
    cancelButtonText: "Cancelar",
    preConfirm: () => {
      let tel = document.getElementById("wa-telefono-pos").value.trim();
      if (tel.length < 10) {
        Swal.showValidationMessage("Ingresa un número válido a 10 dígitos.");
        return false;
      }
      return tel;
    },
  }).then((result) => {
    if (result.isConfirmed) {
      ejecutarWhatsApp(result.value, nombre, folio, total, tokenTicket);
    }
  });
}

function ejecutarWhatsApp(telefono, nombre, folio, total, tokenTicket = "") {
  // Ahora el enlace de WhatsApp lleva el Token secreto incrustado
  let linkTicket = new URL(
    "../php/cruds/imprimir_ticket_pos.php?id=" +
      folio +
      "&token=" +
      tokenTicket,
    window.location.href,
  ).href;

  let mensaje = `Hola *${nombre}*, gracias por tu compra.\n\n`;
  mensaje += ` *Folio:* #${folio}\n`;
  mensaje += ` *Total:* $${parseFloat(total).toFixed(2)}\n\n`;
  mensaje += `Puedes descargar tu comprobante digital en el siguiente enlace:\n${linkTicket}\n\n`;
  mensaje += `¡Vuelve pronto! `;

  let celLimpio = telefono.replace(/\D/g, "");
  if (celLimpio.length === 10) celLimpio = "52" + celLimpio;

  window.open(
    `https://wa.me/${celLimpio}?text=${encodeURIComponent(mensaje)}`,
    "_blank",
  );
}

function imprimirTicketFisico(folio, tokenTicket = "") {
  window.open(
    `../php/cruds/imprimir_ticket_pos.php?id=${folio}&token=${tokenTicket}`,
    "_blank",
  );
}

// MOTOR DE ENVÍO POR CORREO ELECTRÓNICO (Con confirmación siempre y Token)
function enviarTicketCorreo(
  nombre,
  folio,
  correoCliente = "",
  tokenTicket = "",
) {
  Swal.fire({
    title: "Enviar por Correo",
    html: `
        <p style="font-size:14px; color:#555; margin-bottom:15px;">
            Verifica el correo electrónico para enviar el ticket <strong>#${folio}</strong>:
        </p>
        <input type="email" id="correo-email-pos" class="swal2-input" placeholder="cliente@empresa.com" value="${correoCliente}" style="width: 80%;">
    `,
    showCancelButton: true,
    confirmButtonText: 'Enviar Ticket <i class="fa-solid fa-paper-plane"></i>',
    confirmButtonColor: "#dc3545",
    cancelButtonText: "Cancelar",
    preConfirm: () => {
      let email = document.getElementById("correo-email-pos").value.trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        Swal.showValidationMessage("Ingresa un correo electrónico válido.");
        return false;
      }
      return email;
    },
  }).then((result) => {
    if (result.isConfirmed && result.value) {
      ejecutarEnvioCorreo(result.value, nombre, folio, tokenTicket);
    }
  });
}

function ejecutarEnvioCorreo(email, nombre, folio, tokenTicket = "") {
  Swal.fire({
    title: "Enviando Correo...",
    text: "Conectando con el servidor postal",
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading();
    },
  });

  // Ahora el enlace por correo lleva el Token secreto incrustado
  let linkTicket = new URL(
    "../php/cruds/imprimir_ticket_pos.php?id=" +
      folio +
      "&token=" +
      tokenTicket,
    window.location.href,
  ).href;

  fetch("../php/cruds/enviar_ticket_correo.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: email,
      nombre: nombre,
      folio: folio,
      link: linkTicket,
    }),
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.success)
        Swal.fire(
          "¡Enviado!",
          "El ticket ha sido enviado al correo.",
          "success",
        );
      else
        Swal.fire(
          "Error",
          data.message || "No se pudo enviar el correo.",
          "error",
        );
    })
    .catch((error) =>
      Swal.fire("Error", "Hubo un problema de conexión.", "error"),
    );
}

// LLamar cotizaciones ***********************************************
document
  .getElementById("cotizaciones-link")
  .addEventListener("click", function (event) {
    event.preventDefault(); // Evita la acción por defecto del enlace
    fetch("catalogos/cotizaciones.php")
      .then((response) => response.text())
      .then((html) => {
        document.getElementById("content-area").innerHTML = html;
        inicializarTablaGenerica(
          "#tabla-cotizaciones",
          "#buscarboxcot",
          "#cantidad-registros",
        );
      })
      .catch((error) => {
        console.error("Error al cargar el contenido de cotizaciones:", error);
      });
  });

let carritoCot = [];
let productosCot = []; // Reutilizamos la API del POS

function inicializarCotizaciones() {
  carritoCot = [];
  cargarInventarioCot();

  // Buscador
  let buscador = document.getElementById("buscar-producto-cot");
  if (buscador) {
    buscador.addEventListener("input", function (e) {
      renderizarGridCotizaciones(e.target.value);
    });
  }

  // Botón Guardar Cotización
  let btnGuardar = document.getElementById("btn-guardar-cot");
  if (btnGuardar) {
    btnGuardar.addEventListener("click", guardarCotizacion);
  }
}

// Traer inventario usando la API que ya tienes del POS
function cargarInventarioCot() {
  fetch("../php/funciones/api_productos_pos.php")
    .then((res) => res.json())
    .then((data) => {
      if (!data.error) {
        productosCot = data;
        renderizarGridCotizaciones("");
      }
    });
}

// Dibujar cuadritos de productos
function renderizarGridCotizaciones(filtro = "") {
  let grid = document.getElementById("grid-productos-cot");
  if (!grid) return;
  grid.innerHTML = "";
  filtro = filtro.toLowerCase();

  let filtrados = productosCot.filter((p) =>
    p.nombre_prod.toLowerCase().includes(filtro),
  );

  filtrados.forEach((prod) => {
    let card = document.createElement("div");
    card.className = "producto-card"; // Usa tu misma clase CSS del POS
    card.innerHTML = `
            <div class="prod-nombre">${prod.nombre_prod}</div>
            <div class="prod-precio">$${parseFloat(prod.p_venta).toFixed(2)}</div>
            <div class="prod-stock">Stock Actual: ${prod.stock}</div>
        `;
    // Al cotizar NO nos importa si no hay stock, pero le avisamos
    card.addEventListener("click", () =>
      agregarAlCarritoCot(
        prod.id_prod,
        prod.nombre_prod,
        prod.p_venta,
        1,
        prod.stock,
      ),
    );
    grid.appendChild(card);
  });
}

// Agregar conceptos que no existen en inventario
window.agregarConceptoLibre = function () {
  Swal.fire({
    title: "Agregar Servicio / Concepto Libre",
    html: `
            <input id="swal-concepto" class="swal2-input" placeholder="Descripción (Ej. Mano de obra, Cableado...)" autocomplete="off">
            <input id="swal-precio" type="number" class="swal2-input" placeholder="Precio Unitario (Ej. 1500)" step="0.50" min="0">
            <input id="swal-cantidad" type="number" class="swal2-input" placeholder="Cantidad" value="1" min="1">
        `,
    showCancelButton: true,
    confirmButtonText: '<i class="fa-solid fa-plus"></i> Añadir a Cotización',
    confirmButtonColor: "#ffc107",
    preConfirm: () => {
      let concepto = document.getElementById("swal-concepto").value.trim();
      let precio = parseFloat(document.getElementById("swal-precio").value);
      let cantidad = parseInt(document.getElementById("swal-cantidad").value);

      if (!concepto) {
        Swal.showValidationMessage("Escribe una descripción");
        return false;
      }
      if (!precio || precio < 0) {
        Swal.showValidationMessage("Ingresa un precio válido");
        return false;
      }
      if (!cantidad || cantidad < 1) {
        Swal.showValidationMessage("Ingresa una cantidad válida");
        return false;
      }

      return { concepto, precio, cantidad };
    },
  }).then((result) => {
    if (result.isConfirmed) {
      // Mandamos NULL como ID porque no existe en la BD
      agregarAlCarritoCot(
        null,
        result.value.concepto,
        result.value.precio,
        result.value.cantidad,
        9999,
      );
    }
  });
};

// Lógica del carrito de cotizaciones (Acepta NULLs)
function agregarAlCarritoCot(id_prod, nombre, precio, cantidad, stock_max) {
  // Si id_prod es null, usamos un ID temporal (ej. un timestamp) solo para el DOM
  let id_interno = id_prod === null ? "libre_" + Date.now() : id_prod;

  let item = carritoCot.find((i) => i.id_interno === id_interno);

  if (item) {
    item.cantidad += cantidad;
  } else {
    carritoCot.push({
      id_interno: id_interno,
      id_prod_real: id_prod, // null si es libre, ID real si es del catálogo
      nombre: nombre,
      precio: parseFloat(precio),
      cantidad: parseInt(cantidad),
      stock_max: parseInt(stock_max), // Para cotizar podemos ignorar el tope si quieres
    });
  }
  actualizarCarritoCotUI();
}

function eliminarDelCarritoCot(id_interno) {
  carritoCot = carritoCot.filter((i) => i.id_interno !== id_interno);
  actualizarCarritoCotUI();
}

function actualizarCarritoCotUI() {
  let tbody = document.getElementById("tabla-carrito-cot");
  let totalSpan = document.getElementById("cot-gran-total");
  let totalArticulosSpan = document.getElementById("cot-total-articulos");

  // Nuevos Span del Desglose
  let subtotalSpan = document.getElementById("cot-subtotal");
  let ivaSpan = document.getElementById("cot-iva");
  let btnGuardar = document.getElementById("btn-guardar-cot");

  // Leemos el IVA desde la base de datos
  let tasaIvaInput = document.getElementById("tasa-iva-global");
  let tasaIva = tasaIvaInput ? parseFloat(tasaIvaInput.value) : 16;
  let factorIva = 1 + tasaIva / 100;

  tbody.innerHTML = "";
  let granTotalBruto = 0;
  let totalArticulos = 0;

  if (carritoCot.length === 0) {
    tbody.innerHTML =
      '<tr><td colspan="4" style="text-align: center; padding: 20px;">No hay conceptos a cotizar.</td></tr>';
    btnGuardar.disabled = true;
    totalSpan.textContent = "$0.00";
    totalArticulosSpan.textContent = "0";
    if (subtotalSpan) subtotalSpan.textContent = "$0.00";
    if (ivaSpan) ivaSpan.textContent = "$0.00";
    return;
  }

  carritoCot.forEach((item) => {
    let subtotalBrutoItem = item.precio * item.cantidad;
    granTotalBruto += subtotalBrutoItem;
    totalArticulos += item.cantidad;

    // Quitamos el IVA solo para la visualización de la tabla
    let precioNeto = item.precio / factorIva;
    let subtotalNetoItem = precioNeto * item.cantidad;

    let badge =
      item.id_prod_real === null
        ? '<span style="background: #ffc107; color: #000; font-size: 10px; padding: 2px 5px; border-radius: 3px; margin-left: 5px;">LIBRE</span>'
        : "";

    let tr = document.createElement("tr");
    tr.innerHTML = `
            <td style="font-size: 14px;">${item.nombre} ${badge}</td>
            <td style="text-align: center; font-weight: bold;">${item.cantidad}</td>
            <td style="text-align: right; color: #28a745; font-weight: bold;">$${subtotalNetoItem.toFixed(2)}</td>
            <td style="text-align: right;">
                <button class="btn" style="background-color: #dc3545; color: white; border: none; padding: 6px 10px; border-radius: 4px; cursor: pointer;" onclick="eliminarDelCarritoCot('${item.id_interno}')" title="Quitar">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </td>
        `;
    tbody.appendChild(tr);
  });

  // Calculamos Subtotal General y el IVA General para el final
  let subtotalGeneral = granTotalBruto / factorIva;
  let ivaGeneral = granTotalBruto - subtotalGeneral;

  if (subtotalSpan) subtotalSpan.textContent = "$" + subtotalGeneral.toFixed(2);
  if (ivaSpan) ivaSpan.textContent = "$" + ivaGeneral.toFixed(2);
  totalSpan.textContent = `$${granTotalBruto.toFixed(2)}`;
  totalArticulosSpan.textContent = totalArticulos;
  btnGuardar.disabled = false;
}

// GUARDAR COTIZACIÓN EN BASE DE DATOS
function guardarCotizacion() {
  if (carritoCot.length === 0) {
    Swal.fire("Atención", "El carrito de cotización está vacío.", "warning");
    return;
  }

  let idCliente = document.getElementById("cot-id-cliente").value;
  let totalCotizacion = carritoCot.reduce(
    (sum, item) => sum + item.precio * item.cantidad,
    0,
  );

  let btnGuardar = document.getElementById("btn-guardar-cot");
  btnGuardar.disabled = true;
  btnGuardar.innerHTML =
    '<i class="fa-solid fa-spinner fa-spin"></i> PROCESANDO...';

  // EL EMPAQUE AHORA INCLUYE EL ID
  let datosCotizacion = {
    id_cotizacion: window.idCotizacionEditando || 0, // Manda el ID o manda 0
    id_cliente: idCliente,
    total: totalCotizacion,
    carrito: carritoCot,
  };

  fetch("../php/cruds/procesar_crear_cotizacion.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(datosCotizacion),
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.success) {
        Swal.fire({
          title:
            window.idCotizacionEditando > 0 ? "¡Actualizada!" : "¡Guardada!",
          text: "Se procesó correctamente el Folio #" + data.id_cotizacion,
          icon: "success",
          showCancelButton: true,
          confirmButtonText: '<i class="fa-solid fa-print"></i> Imprimir / PDF',
          cancelButtonText: "Regresar al Historial",
          confirmButtonColor: "#3085d6",
        }).then((result) => {
          if (result.isConfirmed) {
            window.open(
              "../php/cruds/imprimir_cotizacion.php?id=" +
                data.id_cotizacion +
                "&token=" +
                data.token,
              "_blank",
            );
          }
          // Limpiamos y regresamos al menú de cotizaciones
          if (document.getElementById("cotizaciones-link")) {
            document.getElementById("cotizaciones-link").click();
          }
        });
      } else {
        Swal.fire("Error", data.message, "error");
        btnGuardar.disabled = false;
      }
    })
    .catch((err) => {
      console.error(err);
      Swal.fire("Error", "Error de conexión con el servidor.", "error");
      btnGuardar.disabled = false;
    });
}

// BUSCADOR DE CLIENTES PARA COTIZACIONES
function inicializarCotizaciones() {
  carritoCot = [];
  cargarInventarioCot();

  // Buscador de productos
  let buscador = document.getElementById("buscar-producto-cot");
  if (buscador) {
    buscador.addEventListener("input", function (e) {
      renderizarGridCotizaciones(e.target.value);
    });
  }

  // Botón Guardar Cotización
  let btnGuardar = document.getElementById("btn-guardar-cot");
  if (btnGuardar) {
    btnGuardar.addEventListener("click", guardarCotizacion);
  }

  // BUSCADOR DE CLIENTES
  let btnBuscarClienteCot = document.getElementById("btn-buscar-cliente-cot");
  let btnQuitarClienteCot = document.getElementById("btn-quitar-cliente-cot");
  let inputIdClienteCot = document.getElementById("cot-id-cliente");
  let inputNombreClienteCot = document.getElementById("cot-nombre-cliente");

  if (btnBuscarClienteCot) {
    // Le quitamos el DOMContentLoaded porque ya estamos dentro del inicializador
    btnBuscarClienteCot.addEventListener("click", function () {
      fetch("../php/funciones/api_clientes_pos.php")
        .then((res) => res.json())
        .then((clientes) => {
          if (clientes.error) {
            Swal.fire("Error", "No se pudieron cargar los clientes.", "error");
            return;
          }

          let options =
            '<option value="0" selected>Público en General</option>';
          clientes.forEach((c) => {
            options += `<option value="${c.id_cliente}">${c.nombre} ${c.papellido} - ${c.telefono}</option>`;
          });

          Swal.fire({
            title: "Seleccionar Cliente",
            html: `
                            <input type="search" id="swal-search-cliente-cot" class="swal2-input" placeholder="Buscar por nombre o teléfono..." autocomplete="off" style="width: 90%; margin: 0 auto 10px auto; display: block;">
                            <select id="swal-select-cliente-cot" size="6" style="width: 90%; height:140px; margin: 0 auto; display: block; padding: 10px; border-radius: 5px; border: 1px solid #ccc;">
                                ${options}
                            </select>
                        `,
            showCancelButton: true,
            confirmButtonText: '<i class="fa-solid fa-check"></i> Asignar',
            cancelButtonText: "Cancelar",
            didOpen: () => {
              let buscadorSwal = document.getElementById(
                "swal-search-cliente-cot",
              );
              let selectSwal = document.getElementById(
                "swal-select-cliente-cot",
              );
              let opcionesSwal = selectSwal.options;

              buscadorSwal.focus();
              buscadorSwal.addEventListener("keyup", function () {
                let filtro = this.value.toLowerCase();
                for (let i = 0; i < opcionesSwal.length; i++) {
                  let texto = opcionesSwal[i].text.toLowerCase();
                  opcionesSwal[i].style.display =
                    opcionesSwal[i].value === "0" || texto.includes(filtro)
                      ? ""
                      : "none";
                }
              });

              selectSwal.addEventListener("dblclick", () =>
                Swal.clickConfirm(),
              );
            },
            preConfirm: () => {
              let selectSwal = document.getElementById(
                "swal-select-cliente-cot",
              );
              if (selectSwal.selectedIndex === -1) {
                Swal.showValidationMessage("Selecciona un cliente");
                return false;
              }
              return {
                id: selectSwal.value,
                texto: selectSwal.options[selectSwal.selectedIndex].text,
              };
            },
          }).then((result) => {
            if (result.isConfirmed) {
              let cliente = result.value;
              inputIdClienteCot.value = cliente.id;

              if (cliente.id === "0") {
                inputNombreClienteCot.value = "Público en General";
                btnQuitarClienteCot.style.display = "none";
              } else {
                inputNombreClienteCot.value = cliente.texto.split(" - ")[0];
                btnQuitarClienteCot.style.display = "inline-block";
              }
            }
          });
        });
    });
  }

  if (btnQuitarClienteCot) {
    btnQuitarClienteCot.addEventListener("click", function () {
      inputIdClienteCot.value = "0";
      inputNombreClienteCot.value = "Público en General";
      this.style.display = "none";
    });
  }
}

// MÓDULO DE COTIZACIONES (Dashboard y Funciones Globales)

window.idCotizacionEditando = 0; // Variable Global

window.cargarVistaCotizacion = function (archivo) {
  window.idCotizacionEditando = 0; // Reset a 0 porque es NUEVA
  fetch(archivo)
    .then((response) => response.text())
    .then((html) => {
      document.getElementById("content-area").innerHTML = html;
      if (typeof window.inicializarCotizaciones === "function") {
        window.inicializarCotizaciones();
      }
    })
    .catch((error) =>
      console.error("Error al cargar la vista de cotizaciones:", error),
    );
};

// Botón Enviar WhatsApp (COTIZACIONES)
window.enviarCotizacionWhatsApp = function (id) {
  // Mostramos un loading mientras vamos al servidor por el teléfono del cliente
  Swal.fire({
    title: "Obteniendo datos...",
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading();
    },
  });

  fetch("../php/cruds/obtener_datos_wa_cotizacion.php?id=" + id)
    .then((res) => res.json())
    .then((data) => {
      Swal.close();

      if (data.success) {
        //Abrimos la ventana confirmando el número
        Swal.fire({
          title: "Enviar por WhatsApp",
          html: `
                    <p style="font-size:14px; color:#555; margin-bottom:15px;">
                        Verifica el número para enviar la cotización <strong>#${id}</strong>:
                    </p>
                    <input type="number" id="wa-telefono-cot" class="swal2-input" placeholder="Teléfono a 10 dígitos" value="${data.telefono}" style="width: 80%;">
                `,
          showCancelButton: true,
          confirmButtonText:
            'Enviar Mensaje <i class="fa-brands fa-whatsapp"></i>',
          confirmButtonColor: "#25D366",
          cancelButtonText: "Cancelar",
          preConfirm: () => {
            let tel = document.getElementById("wa-telefono-cot").value.trim();
            if (tel.length < 10) {
              Swal.showValidationMessage(
                "Ingresa un número válido a 10 dígitos.",
              );
              return false;
            }
            return tel;
          },
        }).then((result) => {
          if (result.isConfirmed) {
            let telefonoFinal = result.value;

            //Construimos la URL con el Token de Seguridad Encriptado
            let linkCotizacion = new URL(
              "../php/cruds/imprimir_cotizacion.php?id=" +
                id +
                "&token=" +
                data.token,
              window.location.href,
            ).href;

            // Armamos un mensaje bien estructurado
            let mensaje = `Hola *${data.nombre}* ,\n\n`;
            mensaje += `Te compartimos tu *Cotización #${id}* por un total de *$${parseFloat(data.total).toFixed(2)}*.\n\n`;
            mensaje += `Puedes ver e imprimir tu presupuesto detallado en el siguiente enlace:\n${linkCotizacion}\n\n`;
            mensaje += `Si tienes alguna duda, estamos a tus órdenes. ¡Excelente día!`;

            // Limpiamos el teléfono por si tiene espacios y le agregamos la lada +52 (México)
            let celLimpio = telefonoFinal.replace(/\D/g, "");
            if (celLimpio.length === 10) celLimpio = "52" + celLimpio;

            // Abrimos la API de WhatsApp (Abrirá Web en PC o la App en Celular)
            window.open(
              `https://wa.me/${celLimpio}?text=${encodeURIComponent(mensaje)}`,
              "_blank",
            );
          }
        });
      } else {
        Swal.fire("Error", data.message, "error");
      }
    })
    .catch((err) => {
      console.error(err);
      Swal.fire("Error", "Fallo de conexión con el servidor.", "error");
    });
};

window.editarCotizacion = function (id) {
  Swal.fire({
    title: "Abriendo cotización...",
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading();
    },
  });

  fetch("../php/cruds/obtener_cotizacion_completa.php?id=" + id)
    .then((res) => res.json())
    .then((data) => {
      if (data.success) {
        window.idCotizacionEditando = id; // Avisamos al sistema que estamos EDITANDO

        // Reutilizamos tu vista del carrito
        fetch("cruds/crear_cotizacion.php")
          .then((response) => response.text())
          .then((html) => {
            document.getElementById("content-area").innerHTML = html;

            if (typeof window.inicializarCotizaciones === "function") {
              window.inicializarCotizaciones();
            }

            // Inyectamos el Cliente
            document.getElementById("cot-id-cliente").value =
              data.cotizacion.id_cliente;
            document.getElementById("cot-nombre-cliente").value =
              data.cotizacion.nombre_cliente_completo;
            if (data.cotizacion.id_cliente != "0") {
              let btnQuitar = document.getElementById("btn-quitar-cliente-cot");
              if (btnQuitar) btnQuitar.style.display = "inline-block";
            }

            // Inyectamos los Productos
            carritoCot = [];
            data.detalles.forEach((det) => {
              carritoCot.push({
                id_interno: "old_" + det.id_detalle,
                id_prod_real: det.id_producto,
                nombre: det.concepto,
                precio: parseFloat(det.precio_unitario),
                cantidad: parseInt(det.cantidad),
                stock_max: 9999,
              });
            });

            actualizarCarritoCotUI();

            // Cambiamos el botón Verde a Amarillo
            let btnGuardar = document.getElementById("btn-guardar-cot");
            if (btnGuardar) {
              btnGuardar.innerHTML =
                '<i class="fa-solid fa-pen-to-square"></i> ACTUALIZAR COTIZACIÓN #' +
                id;
              btnGuardar.style.backgroundColor = "#ffc107";
              btnGuardar.style.color = "#000";
            }

            Swal.close();
          });
      } else {
        Swal.fire("Error", data.message, "error");
      }
    });
};

// Botón Enviar por Correo (USANDO PHPMAILER)
window.enviarCotizacionCorreo = function (id) {
  Swal.fire({
    title: "Obteniendo datos...",
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading();
    },
  });

  // Buscamos el correo del cliente en la BD
  fetch("../php/cruds/obtener_email_cotizacion.php?id=" + id)
    .then((res) => res.json())
    .then((data) => {
      Swal.close();
      if (data.success) {
        // Abrimos la ventana con el correo pre-llenado (si existe)
        Swal.fire({
          title: "Enviar por Correo",
          html: `
                    <p style="font-size:14px; color:#555; margin-bottom:15px;">
                        Verifica el correo para la cotización <strong>#${id}</strong>:
                    </p>
                    <input type="email" id="swal-correo-cot" class="swal2-input" value="${data.email}" placeholder="ejemplo@correo.com" style="width: 80%;">
                `,
          showCancelButton: true,
          confirmButtonText: 'Enviar <i class="fa-solid fa-paper-plane"></i>',
          confirmButtonColor: "#6f42c1",
          preConfirm: () => {
            let correo = document
              .getElementById("swal-correo-cot")
              .value.trim();
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
              Swal.showValidationMessage("Ingresa un correo válido.");
              return false;
            }
            return correo;
          },
        }).then((result) => {
          if (result.isConfirmed) {
            Swal.fire({
              title: "Enviando correo...",
              allowOutsideClick: false,
              didOpen: () => {
                Swal.showLoading();
              },
            });

            // Le quitamos 'ad.php' a la ruta para que quede limpia (Ej: http://localhost/swaos/php/)
            let urlBase =
              window.location.origin +
              window.location.pathname.replace("ad.php", "");
            let linkAproximado =
              urlBase + "../php/cruds/imprimir_cotizacion.php?id=" + id;

            // Mandamos todo al PHPMailer en formato JSON
            fetch("../php/cruds/enviar_correo_cotizacion.php", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                id_cotizacion: id,
                email: result.value,
                nombre: data.nombre,
                total: data.total,
                url_base: urlBase,
              }),
            })
              .then((res) => res.json())
              .then((resData) => {
                if (resData.success) {
                  Swal.fire("¡Enviado!", resData.message, "success");
                } else {
                  Swal.fire("Error", resData.message, "error");
                }
              });
          }
        });
      }
    });
};

// Botón Convertir Cotización a Venta
window.convertirAVenta = function (id) {
  Swal.fire({
    title: "¿Convertir a Venta? 🛒",
    text: "Enviaremos los productos de esta cotización al Punto de Venta para ser cobrados.",
    icon: "question",
    showCancelButton: true,
    confirmButtonColor: "#28a745",
    confirmButtonText: "Sí, ir a caja",
    cancelButtonText: "Cancelar",
  }).then((result) => {
    if (result.isConfirmed) {
      Swal.fire({
        title: "Preparando caja...",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      // Vamos por los datos completos de la cotización
      fetch("../php/cruds/obtener_cotizacion_completa.php?id=" + id)
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            // Guardamos la cotización en la memoria temporal del navegador
            sessionStorage.setItem("cotizacion_a_venta", JSON.stringify(data));
            Swal.close();
            // Damos un clic "fantasma" a tu menú de VENTAS para cambiar de pantalla
            // NOTA: Asegúrase de que el ID de tu menú lateral de ventas se llame "ventas-link"
            let btnVentas = document.getElementById("ventas-link");
            if (btnVentas) {
              btnVentas.click();
            } else {
              Swal.fire(
                "Aviso",
                "Ve manualmente al módulo de Ventas, tu carrito ya te está esperando.",
                "info",
              );
            }
          } else {
            Swal.fire("Error", data.message, "error");
          }
        })
        .catch((err) => {
          console.error(err);
          Swal.fire("Error", "Fallo de conexión con el servidor.", "error");
        });
    }
  });
};

// Botón Cancelar Cotización (Conectado a BD)
window.cancelarCotizacion = function (id) {
  Swal.fire({
    title: "¿Cancelar Cotización?",
    text: "El estatus cambiará a 'Cancelada'. Esta acción no se puede deshacer.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#dc3545",
    cancelButtonColor: "#6c757d",
    confirmButtonText: '<i class="fa-solid fa-ban"></i> Sí, cancelar',
    cancelButtonText: "No, regresar",
  }).then((result) => {
    if (result.isConfirmed) {
      Swal.fire({
        title: "Cancelando...",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      let formData = new FormData();
      formData.append("id_cotizacion", id);

      fetch("../php/cruds/cancelar_cotizacion.php", {
        method: "POST",
        body: formData,
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            Swal.fire("¡Cancelada!", data.message, "success").then(() => {
              // Recargamos la tabla limpiamente haciendo clic fantasma en el menú
              if (document.getElementById("cotizaciones-link")) {
                document.getElementById("cotizaciones-link").click();
              }
            });
          } else {
            Swal.fire("Atención", data.message, "warning");
          }
        })
        .catch((err) => {
          console.error(err);
          Swal.fire("Error", "Fallo de conexión con el servidor.", "error");
        });
    }
  });
};

// Llamar Citas ********************************************
// (FullCalendar)
let botonCitasMenu = document.getElementById("citas-link");

if (botonCitasMenu) {
  botonCitasMenu.addEventListener("click", function (event) {
    event.preventDefault(); // Evita la acción por defecto del enlace
    fetch("catalogos/citas.php")
      .then((response) => response.text())
      .then((html) => {
        document.getElementById("content-area").innerHTML = html;

        setTimeout(() => {
          if (typeof inicializarCalendarioSWAOS === "function") {
            inicializarCalendarioSWAOS();
          }
        }, 100);
      })
      .catch((error) => {
        console.error("Error al cargar el contenido:", error);
      });
  });
}

window.inicializarCalendarioSWAOS = function () {
  let calendarEl = document.getElementById("calendario-citas");
  if (!calendarEl) return;

  // Si ya hay un calendario en memoria, lo destruimos antes de crear otro
  if (window.calendarioSWAOSActivo) {
    window.calendarioSWAOSActivo.destroy();
  }

  calendarEl.innerHTML = "";

  // Instanciamos el calendario
  let calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: "dayGridMonth",
    locale: "es",
    height: 500, // LO HICIMOS MÁS CHICO
    headerToolbar: false, //APAGAMOS LA BARRA FEA POR DEFECTO
    editable: true, // ¡Permite mover las citas con el mouse!
    eventDurationEditable: false, // Evitamos que estiren la cita, solo moverla
    eventOverlap: false, // No permite que suelten una cita encima de otra

    // EVENTO: Cuando el usuario arrastra y suelta una cita en otro día/hora
    eventDrop: function (info) {
      let formData = new FormData();
      formData.append("id_cita", info.event.id);

      // Ajustamos al formato que necesita MySQL (YYYY-MM-DDTHH:mm)
      let inicioIso = new Date(
        info.event.start.getTime() -
          info.event.start.getTimezoneOffset() * 60000,
      )
        .toISOString()
        .slice(0, 16);
      let finIso = new Date(
        info.event.end.getTime() - info.event.end.getTimezoneOffset() * 60000,
      )
        .toISOString()
        .slice(0, 16);

      formData.append("fecha_inicio", inicioIso);
      formData.append("fecha_fin", finIso);

      fetch("../php/funciones/reprogramar_cita.php", {
        method: "POST",
        body: formData,
      })
        .then((res) => res.json())
        .then((data) => {
          if (!data.success) {
            Swal.fire("Error", data.message, "error");
            info.revert(); // Regresa la cita a su lugar original si falla
          } else {
            // Pequeña notificación visual sin estorbar
            const Toast = Swal.mixin({
              toast: true,
              position: "top-end",
              showConfirmButton: false,
              timer: 2000,
            });
            Toast.fire({ icon: "success", title: "Cita Reprogramada" });
          }
        });
    },

    //  Cada que se cambia de vista, esto lee el mes y lo pega en nuestro <h2>
    datesSet: function (info) {
      let tituloEl = document.getElementById("titulo-calendario");
      if (tituloEl) {
        tituloEl.innerText = info.view.title;
      }
    },

    // Leemos lo que manda PHP antes de dárselo al calendario
    events: function (fetchInfo, successCallback, failureCallback) {
      // Le pegamos la hora exacta a la URL para obligar al navegador a descargar datos frescos SIEMPRE
      let urlFresco =
        "../php/funciones/api_cargar_citas.php?t=" + new Date().getTime();
      fetch(urlFresco)
        .then((response) => response.text()) // Lo leemos como texto puro primero
        .then((textoBruto) => {
          try {
            let datosJSON = JSON.parse(textoBruto);

            // Verificamos si PHP mandó el arreglo de citas correctamente
            if (Array.isArray(datosJSON)) {
              successCallback(datosJSON);
            } else {
              console.error("🚨 PHP devolvió un objeto con error:", datosJSON);
              Swal.fire(
                "Error en BD",
                datosJSON.error || "Revisa la consola.",
                "error",
              );
              failureCallback("No es un arreglo");
            }
          } catch (error) {
            console.error(
              " ERROR FATAL DE PHP. Esto fue lo que respondió el servidor:",
            );
            console.error(textoBruto); // ¡AQUÍ VEREMOS EL ERROR REAL!
            failureCallback(error);
          }
        })
        .catch((error) => {
          console.error("Error de conexión:", error);
          failureCallback(error);
        });
    },

    dateClick: function (info) {
      abrirModalNuevaCita(info.dateStr);
    },
    // EVENTO: Cuando el usuario hace CLIC EN UNA CITA YA CREADA
    eventClick: function (info) {
      let props = info.event.extendedProps;

      // Formateamos la fecha para que se lea bonita en español
      let fechaInicio = info.event.start.toLocaleString("es-MX", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });

      // Si es a domicilio, mostramos la dirección, si no, la ocultamos
      let htmlDireccion =
        props.tipo === "Domicilio"
          ? `<p style="margin-bottom: 8px;"><i class="fa-solid fa-map-location-dot" style="color:#fd7e14;"></i> <strong>Dirección:</strong> ${props.direccion}</p>`
          : "";

      // BOTÓN DE WHATSAPP INYECTADO EN EL HTML
      // BOTÓN SIMPLIFICADO: Solo le pasamos el ID, la función se encargará del resto
      let btnWhatsApp = `<button onclick="enviarWhatsCita('${info.event.id}')" style="width: 100%; margin-top: 15px; background-color: #25D366; color: white; border: none; padding: 10px; border-radius: 5px; cursor: pointer; font-weight: bold; font-size: 16px;"><i class="fa-brands fa-whatsapp"></i> Enviar Recordatorio al Cliente</button>`;

      let htmlDetalles = `
        <div style="text-align: left; font-size: 15px; padding: 10px; background: #f8f9fa; border-radius: 8px; border: 1px solid #dee2e6;">
            <p style="margin-bottom: 8px;"><i class="fa-solid fa-user" style="color:#007bff;"></i> <strong>Cliente:</strong> ${props.cliente}</p>
            <p style="margin-bottom: 8px;"><i class="fa-solid fa-phone" style="color:#6c757d;"></i> <strong>Tel:</strong> ${props.telefono || "No registrado"}</p>
            <p style="margin-bottom: 8px;"><i class="fa-solid fa-tag" style="color:#6f42c1;"></i> <strong>Servicio:</strong> ${props.tipo}</p>
            <p style="margin-bottom: 8px;"><i class="fa-solid fa-clock" style="color:#28a745;"></i> <strong>Agendado:</strong> <span style="text-transform: capitalize;">${fechaInicio}</span></p>
            <p style="margin-bottom: 5px;"><strong><i class="fa-solid fa-circle-check" style="color:${info.event.backgroundColor};"></i> Estatus:</strong> 
                <span style="font-weight:bold; color:${info.event.backgroundColor}; text-transform: uppercase;">${props.estatus}</span>
            </p>
            ${htmlDireccion}
            <hr style="border-top: 1px solid #ccc; margin: 15px 0;">
            <p style="margin-bottom: 5px;"><strong>Motivo / Falla:</strong></p>
            <p style="background: #fff; padding: 10px; border-radius: 4px; border: 1px dashed #ccc; margin: 0;">${props.motivo}</p>
            ${btnWhatsApp}
        </div>
      `;

      Swal.fire({
        title: "Cita #" + info.event.id,
        html: htmlDetalles,
        showCancelButton: true,
        showDenyButton: true,
        confirmButtonColor: "#28a745",
        denyButtonColor: "#dc3545",
        cancelButtonColor: "#6c757d",
        confirmButtonText:
          '<i class="fa-solid fa-file-invoice"></i> Crear Orden de Servicio',
        denyButtonText: '<i class="fa-solid fa-ban"></i> Cancelar Cita',
        cancelButtonText: "Cerrar",
        showConfirmButton: props.estatus !== "Atendida", // Se oculta si ya se atendió
        showDenyButton: props.estatus !== "Atendida", // Se oculta si ya se atendió
        width: "500px",
      }).then((result) => {
        if (result.isConfirmed) {
          //  Empacamos los datos de la cita (ahora sin cerrar la cita todavía)
          let datosConversion = {
            id_cita: info.event.id,
            id_cliente: props.id_cliente,
            nombre_cliente: props.cliente,
            falla: props.motivo,
          };
          sessionStorage.setItem(
            "citaParaOrden",
            JSON.stringify(datosConversion),
          );

          //  Cerramos la ventana actual
          Swal.close();

          // Simulamos un clic en tu menú lateral para abrir el módulo de Órdenes
          let btnOrdenes = document.getElementById("ordenes-link");
          if (btnOrdenes) {
            btnOrdenes.click();
          } else {
            Swal.fire(
              "Error",
              "No se encontró el enlace al módulo de órdenes.",
              "error",
            );
          }
        } else if (result.isDenied) {
          // Lógica Real para CANCELAR
          Swal.fire({
            title: "¿Cancelar Cita?",
            text: "Se liberará este espacio en la agenda.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#dc3545",
            cancelButtonColor: "#6c757d",
            confirmButtonText: "Sí, Cancelar",
            cancelButtonText: "No, mantener",
          }).then((borrar) => {
            if (borrar.isConfirmed) {
              let formCancel = new FormData();
              formCancel.append("id_cita", info.event.id);

              fetch("../php/funciones/cancelar_cita.php", {
                method: "POST",
                body: formCancel,
              })
                .then((res) => res.json())
                .then((data) => {
                  if (data.success) {
                    info.event.remove(); // Desaparece la cita del calendario visualmente
                    Swal.fire("Cancelada", "La cita fue retirada.", "success");
                  } else {
                    Swal.fire("Error", data.message, "error");
                  }
                });
            }
          });
        }
      });
    },
  });

  //  Renderizamos el calendario en la pantalla
  // Guardamos el calendario nuevo en la variable global
  window.calendarioSWAOSActivo = calendar;
  calendar.render();

  // CONECTAMOS NUESTROS BOTONES HTML CON LA API INTERNA DE FULLCALENDAR

  let btnPrev = document.getElementById("btn-prev-cita");
  if (btnPrev) btnPrev.onclick = () => calendar.prev();

  let btnNext = document.getElementById("btn-next-cita");
  if (btnNext) btnNext.onclick = () => calendar.next();

  let btnHoy = document.getElementById("btn-hoy-cita");
  if (btnHoy) btnHoy.onclick = () => calendar.today();

  let btnMes = document.getElementById("btn-mes-cita");
  if (btnMes) btnMes.onclick = () => calendar.changeView("dayGridMonth");

  let btnSem = document.getElementById("btn-sem-cita");
  if (btnSem) btnSem.onclick = () => calendar.changeView("timeGridWeek");

  let btnDia = document.getElementById("btn-dia-cita");
  if (btnDia) btnDia.onclick = () => calendar.changeView("timeGridDay");

  let btnLista = document.getElementById("btn-lista-cita");
  if (btnLista) btnLista.onclick = () => calendar.changeView("listWeek");
};;;

// FUNCIONES DEL MÓDULO DE CITAS

window.abrirModalNuevaCita = function (fechaPreseleccionada = "") {
  // Reseteamos el formulario completo
  document.getElementById("form-crearCita").reset();
  document.getElementById("div-direccion-cita").style.display = "none";

  // Limpiamos la cajita del buscador de clientes
  let inputBusqueda = document.getElementById("busqueda-cliente");
  let inputHidden = document.getElementById("id_cliente_seleccionado");
  let btnLimpiar = document.getElementById("limpiar-cliente");
  if (inputBusqueda) {
    inputBusqueda.value = "";
    inputBusqueda.disabled = false;
  }
  if (inputHidden) inputHidden.value = "";
  if (btnLimpiar) btnLimpiar.style.display = "none";

  // LECTOR INTELIGENTE DE FECHA Y HORA
  if (fechaPreseleccionada) {
    // ¿Viene con hora incluida de la vista Semana/Día? (ej: 2026-03-18T14:30:00-07:00)
    if (fechaPreseleccionada.includes("T")) {
      // Cortamos exactamente hasta el minuto para el inicio "YYYY-MM-DDTHH:mm"
      let inicioStr = fechaPreseleccionada.substring(0, 16);
      document.getElementById("cita-fecha-inicio").value = inicioStr;

      // Para la fecha final, le sumamos 1 hora usando el motor de JavaScript
      let fechaObj = new Date(fechaPreseleccionada);
      fechaObj.setHours(fechaObj.getHours() + 1);

      // Reconstruimos el formato para el input HTML
      let yyyy = fechaObj.getFullYear();
      let mm = String(fechaObj.getMonth() + 1).padStart(2, "0");
      let dd = String(fechaObj.getDate()).padStart(2, "0");
      let hh = String(fechaObj.getHours()).padStart(2, "0");
      let mins = String(fechaObj.getMinutes()).padStart(2, "0");

      document.getElementById("cita-fecha-fin").value =
        `${yyyy}-${mm}-${dd}T${hh}:${mins}`;
    } else {
      // Es un clic normal de la vista de MES (día entero)
      document.getElementById("cita-fecha-inicio").value =
        fechaPreseleccionada + "T10:00";
      document.getElementById("cita-fecha-fin").value =
        fechaPreseleccionada + "T11:00";
    }
  } else {
    // Si hizo clic en el Botón Azul "Agendar Cita", ponemos la hora actual
    let fechaObj = new Date();
    let yyyy = fechaObj.getFullYear();
    let mm = String(fechaObj.getMonth() + 1).padStart(2, "0");
    let dd = String(fechaObj.getDate()).padStart(2, "0");
    let hh = String(fechaObj.getHours()).padStart(2, "0");
    let mins = String(fechaObj.getMinutes()).padStart(2, "0");

    document.getElementById("cita-fecha-inicio").value =
      `${yyyy}-${mm}-${dd}T${hh}:${mins}`;

    // Final + 1 hora
    fechaObj.setHours(fechaObj.getHours() + 1);
    let hhFin = String(fechaObj.getHours()).padStart(2, "0");
    document.getElementById("cita-fecha-fin").value =
      `${yyyy}-${mm}-${dd}T${hhFin}:${mins}`;
  }

  // Mostramos la ventana
  document.getElementById("crear-modalCita").style.display = "flex";
};

// Muestra u oculta el campo de Dirección dependiendo de lo que elijas
window.toggleDireccionCita = function () {
  let tipo = document.getElementById("cita-tipo").value;
  let divDir = document.getElementById("div-direccion-cita");
  if (tipo === "Domicilio") {
    divDir.style.display = "block";
  } else {
    divDir.style.display = "none";
  }
};

// Atrapar el guardado del formulario
document.addEventListener("submit", function (e) {
  if (e.target && e.target.id === "form-crearCita") {
    e.preventDefault();

    // Validaciones estrictas
    let idCliente = document.getElementById("id_cliente_seleccionado").value;
    if (!idCliente || idCliente === "") {
      Swal.fire(
        "Cliente Requerido",
        "Debes buscar y seleccionar un cliente de la lista. Si es nuevo, dalo de alta.",
        "warning",
      );
      return;
    }

    let tipoCita = document.getElementById("cita-tipo").value;
    if (
      tipoCita === "Domicilio" &&
      document.getElementById("cita-direccion").value.trim() === ""
    ) {
      Swal.fire(
        "Dirección Requerida",
        "Debes ingresar la dirección para poder ir a realizar el servicio a domicilio.",
        "warning",
      );
      return;
    }

    // VALIDACIÓN DE VIAJES EN EL TIEMPO
    let fechaInicioInput = document.getElementById("cita-fecha-inicio").value;
    let fechaInicioObj = new Date(fechaInicioInput);
    let ahora = new Date();

    // Le restamos 5 minutos a "ahora" por si el recepcionista se tarda escribiendo
    ahora.setMinutes(ahora.getMinutes() - 5);

    if (fechaInicioObj < ahora) {
      Swal.fire(
        "Fecha Inválida",
        "No puedes agendar una cita en el pasado. Verifica la fecha y hora de inicio.",
        "warning",
      );
      return;
    }

    let formData = new FormData(e.target);

    Swal.fire({
      title: "Agendando cita...",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    // Lo mandamos al backend
    fetch("../php/cruds/procesar_crear_cita.php", {
      method: "POST",
      body: formData,
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          document.getElementById("crear-modalCita").style.display = "none";
          Swal.fire("¡Agenda Confirmada!", data.message, "success").then(() => {
            // Recargamos el módulo para ver la nueva cita pintada en el calendario
            document.getElementById("citas-link").click();
          });
        } else {
          Swal.fire("Error", data.message, "error");
        }
      })
      .catch((err) => {
        console.error(err);
        Swal.fire(
          "Error",
          "Ocurrió un problema de conexión con la base de datos.",
          "error",
        );
      });
  }
});

// Enviar Cita por WhatsApp (Estrategia de Dos Enlaces)
window.enviarWhatsCita = function (idCita) {
  //  Jalamos toda la información directamente del calendario activo
  let calendar = window.calendarioSWAOSActivo;
  let evento = calendar.getEventById(idCita);
  let props = evento.extendedProps;

  let telefono = props.telefono;
  if (
    !telefono ||
    telefono === "undefined" ||
    telefono === "null" ||
    telefono === ""
  ) {
    Swal.fire(
      "Atención",
      "Este cliente no tiene teléfono registrado.",
      "warning",
    );
    return;
  }

  //  Formateamos la fecha para que se lea bonita
  let fechaBonita = evento.start.toLocaleString("es-MX", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  // ARMAMOS EL ENLACE 1: Para iPhone / Outlook (.ics) LIMPIO
  // Solo tomamos el origen (ej. https://tudominio.com) y le pegamos la ruta directa
  let urlBase = window.location.origin;

  // Asegúrate de que esta ruta sea exacta desde la raíz de tu servidor
  let linkIcs =
    urlBase +
    "/php/funciones/descargar_cita.php?id=" +
    idCita +
    "&token=" +
    props.token;

  //  ARMAMOS EL ENLACE 2: Directo para Google Calendar (Android)
  // Convertimos las fechas al formato exacto que exige Google (YYYYMMDDTHHMMSSZ)
  let startISO = evento.start.toISOString().replace(/-|:|\.\d\d\d/g, "");
  let endISO = evento.end
    ? evento.end.toISOString().replace(/-|:|\.\d\d\d/g, "")
    : startISO;

  // Usamos el nombre dinámico en el título del evento
  let nombreEmpresa = props.nombre_empresa || "Taller de computadoras";
  let tituloUrl = encodeURIComponent(
    "Cita " + nombreEmpresa + " - " + props.tipo,
  );
  let detallesUrl = encodeURIComponent(
    "Cliente: " + props.cliente + "\nMotivo: " + props.motivo,
  );
  let linkGoogle = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${tituloUrl}&details=${detallesUrl}&dates=${startISO}/${endISO}`;

  // Usamos el nombre dinámico en el texto de WhatsApp
  let mensaje = `Hola *${props.cliente}*, te confirmamos tu cita con *${nombreEmpresa}*.\n\n`;
  mensaje += `*Fecha:* ${fechaBonita}\n\n`;
  mensaje += `*Agrega esta cita a tu agenda con 1 clic:* \n\n`;
  mensaje += `*Si usas Android (Google):*\n${linkGoogle}\n\n`;
  mensaje += `*Si usas iPhone (Apple):*\n${linkIcs}\n\n`;
  mensaje += `¡Te esperamos!`;

  // Limpiamos el teléfono y abrimos WhatsApp
  let celLimpio = telefono.replace(/\D/g, "");
  if (celLimpio.length === 10) celLimpio = "52" + celLimpio;

  window.open(
    `https://wa.me/${celLimpio}?text=${encodeURIComponent(mensaje)}`,
    "_blank",
  );
};;;

// CONVERSIÓN DE CITA A ORDEN DE SERVICIO
window.revisarConversionCita = function() {
    //  Revisamos si hay un paquete esperando en la memoria
    let paqueteDatos = sessionStorage.getItem("citaParaOrden");
    
    if (paqueteDatos) {
      //  Desempacamos los datos
      let cita = JSON.parse(paqueteDatos);

      //  Abrimos la ventana modal de Nueva Orden automáticamente
      if (typeof abrirModalOrden === "function") {
        abrirModalOrden("crear-modalOrden");
      } else {
        document.getElementById("crear-modalOrden").style.display = "flex";
      }

      // Auto-llenamos los campos con la información de la cita
      setTimeout(() => {
        // Cliente visible
        let inputBusqueda = document.getElementById("busqueda-cliente");
        if (inputBusqueda) inputBusqueda.value = cita.nombre_cliente;

        // ID Cliente oculto
        let inputId = document.getElementById("id_cliente_seleccionado");
        if (inputId) inputId.value = cita.id_cliente;

        // Falla reportada
        let textareaFalla = document.querySelector(
          '#form-crearOrden textarea[name="falla"]',
        );
        if (textareaFalla) textareaFalla.value = cita.falla;

        // Guardamos el ID de la cita de donde venimos
        let inputIdCita = document.getElementById("id_cita_origen");
        if (inputIdCita) inputIdCita.value = cita.id_cita;
      }, 200); // Le damos 200 milisegundos a la ventana para que termine de abrirse

      //  Destruimos el paquete para que no se vuelva a abrir la próxima vez que entres a Órdenes
      sessionStorage.removeItem("citaParaOrden");
    }
}

// Llamar reportes *****************************************************************
document
  .getElementById("reportes-link")
  .addEventListener("click", function (event) {
    event.preventDefault(); // Evita la acción por defecto del enlace
    fetch("../php/operaciones/reportes.php")
      .then((response) => response.text())
      .then((html) => {
        document.getElementById("content-area").innerHTML = html;

      })
      .catch((error) => {
        console.error("Error al cargar el contenido:", error);
      });
  });
