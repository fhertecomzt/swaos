document.addEventListener("DOMContentLoaded", () => {
  const menuToggle = document.getElementById("menu-toggle");
  const navbar = document.querySelector(".navbar"); // <--- Seleccionamos toda la barra
  const submenuLinks = document.querySelectorAll(".has-submenu > a"); 
  const allMenuLinks = document.querySelectorAll(".menu a.nav-link"); 
  const body = document.body;

  // 1. ABRIR / CERRAR MENÚ (Botón Hamburguesa)
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
          if (otherSubmenu && otherSubmenu.classList.contains("show") && otherSubmenu !== submenu) {
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
            "language": {
                "url": "//cdn.datatables.net/plug-ins/1.13.6/i18n/es-ES.json"
            },
            "pageLength": 8,
            "order": [[ 0, "desc" ]], // Ordena por la primera columna de mayor a menor
            "dom": 'rtip',            // Oculta los controles feos por defecto
            "scrollY": "60vh",        // Encabezados fijos nativos
            "scrollCollapse": true
        });

        // Conectamos TU caja de búsqueda personalizada
        $(idBuscador).off('keyup').on('keyup', function() {
            tabla.search(this.value).draw();
        });

        // Conectamos TU selector de cantidades personalizado
        $(idSelectorCantidad).off('change').on('change', function() {
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
if (document.getElementById("tiendas-link")) {
  document.getElementById("tiendas-link").addEventListener("click", function (event) {
    event.preventDefault();
    fetch("tiendas.php")
      .then((response) => response.text())
      .then((html) => {
        document.getElementById("content-area").innerHTML = html;
        // INICIALIZAMOS DATATABLES AQUÍ:
        inicializarTablaGenerica('#tabla-tiendas', '#buscarbox', '#cantidad-registros');
      })
      .catch((error) => console.error("Error al cargar el contenido:", error));
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
    { id: "crear-nombre", tipo: "texto", min: 3, mensaje: "El nombre del taller debe tener al menos 3 caracteres." },
    { id: "crear-razonsocial", tipo: "texto", min: 3, mensaje: "La razón social debe tener al menos 3 caracteres." },
    { id: "crear-rfc", tipo: "texto", min: 12, mensaje: "El RFC debe tener al menos 12 caracteres." },
    { id: "crear-calle", tipo: "texto", min: 3, mensaje: "La calle debe tener al menos 3 caracteres." },
    { id: "crear-noexterior", tipo: "numero", minVal: 1, mensaje: "El número exterior debe ser mayor a 0." },
    { id: "estado", tipo: "select", mensaje: "Debes seleccionar un estado." },
    { id: "municipio", tipo: "select", mensaje: "Debes seleccionar un municipio." },
    { id: "colonia", tipo: "select", mensaje: "Debes seleccionar una colonia." },
    { id: "crear-email", tipo: "email", mensaje: "Debes ingresar un correo electrónico válido." },
    { id: "crear-telefono", tipo: "texto", min: 10, mensaje: "El teléfono debe tener al menos 10 dígitos." }
  ];

  const errores = [];
  let primerCampoConError = null;

  reglasValidacion.forEach(regla => {
    const elemento = document.getElementById(regla.id);
    if (!elemento) return;

    let valor = elemento.value.trim();
    let esValido = true;
    
    elemento.addEventListener(regla.tipo === "select" ? "change" : "input", function() {
        this.classList.remove("input-error");
    });

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
    Swal.fire({
      title: "Faltan datos",
      html: `<ul style="text-align: left; font-size: 14px; color: #d33;">${errores.join("")}</ul>`,
      icon: "warning",
      confirmButtonColor: '#3085d6',
      confirmButtonText: 'Entendido'
    });
    if (primerCampoConError) primerCampoConError.focus();
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

// =========================================================================
// EDITAR TIENDA/TALLER
// =========================================================================
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
                "id", "nombre", "razonsocial", "rfc", "calle",
                "noexterior", "nointerior", "telefono", "email", "estatus",
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

              cargarYSeleccionarUbicacionEditar(idEstadoDB, idMunicipioDB, idColoniaDB, cpDB);

              abrirModal("editar-modal");
            }
          } else {
            Swal.fire("Error", data.message || "No se pudo cargar el taller.", "error");
          }
        })
        .catch((error) => {
          console.error("Error al obtener taller:", error);
          Swal.fire("Error", "Ocurrió un problema al obtener los datos.", "error");
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
    { id: "editar-nombre", tipo: "texto", min: 3, mensaje: "El nombre del taller debe tener al menos 3 caracteres." },
    { id: "editar-razonsocial", tipo: "texto", min: 3, mensaje: "La razón social debe tener al menos 3 caracteres." },
    { id: "editar-rfc", tipo: "texto", min: 12, mensaje: "El RFC debe tener al menos 12 caracteres." },
    { id: "editar-calle", tipo: "texto", min: 3, mensaje: "La calle debe tener al menos 3 caracteres." },
    { id: "editar-noexterior", tipo: "numero", minVal: 1, mensaje: "El número exterior debe ser mayor a 0." },
    { id: "editar-estado", tipo: "select", mensaje: "Debes seleccionar un estado." },
    { id: "editar-municipio", tipo: "select", mensaje: "Debes seleccionar un municipio." },
    { id: "editar-colonia", tipo: "select", mensaje: "Debes seleccionar una colonia." },
    { id: "editar-email", tipo: "email", mensaje: "Debes ingresar un correo electrónico válido." },
    { id: "editar-telefono", tipo: "texto", min: 10, mensaje: "El teléfono debe tener al menos 10 dígitos." }
  ];

  const errores = [];
  let primerCampoConError = null;

  reglasValidacion.forEach(regla => {
    const elemento = document.getElementById(regla.id);
    if (!elemento) return;

    let valor = elemento.value.trim();
    let esValido = true;
    
    elemento.addEventListener(regla.tipo === "select" ? "change" : "input", function() {
        this.classList.remove("input-error");
    });

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
    Swal.fire({
      title: "Faltan datos",
      html: `<ul style="text-align: left; font-size: 14px; color: #d33;">${errores.join("")}</ul>`,
      icon: "warning",
      confirmButtonColor: '#3085d6',
      confirmButtonText: 'Entendido'
    });
    if (primerCampoConError) primerCampoConError.focus();
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
        Swal.fire("Atención", data.message || "Ocurrió un problema.", "warning");
      }
    })
    .catch((error) => {
      console.error("Error al actualizar taller:", error);
      Swal.fire("Error", "Ocurrió un problema al procesar la solicitud.", "error");
    });
}

// =========================================================================
// ELIMINAR TIENDA/TALLER
// =========================================================================
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
                text: data.message || "El taller se ha eliminado correctamente.",
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
              Swal.fire("Error", data.message || "No se pudo eliminar el registro.", "error");
            }
          })
          .catch((error) => {
            Swal.fire("Error", "Hubo un problema al procesar tu solicitud.", "error");
            console.error("Error al eliminar:", error);
          });
      }
    });
  }
});

// =========================================================================
// LÓGICA PARA SELECTS ANIDADOS (ESTADO, MUNICIPIO, COLONIA)
// =========================================================================
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

async function cargarMunicipios(idEstado, idSelectMunicipio, idSelectColonia, idInputCP) {
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
    cargarMunicipios(event.target.value, "municipio", "colonia", "codigo_postal");
  }
  if (event.target.id === "municipio") {
    cargarColonias(event.target.value, "colonia", "codigo_postal");
  }
  if (event.target.id === "colonia") {
    cargarCP(event.target.value, "codigo_postal");
  }

  if (event.target.id === "editar-estado") {
    cargarMunicipios(event.target.value, "editar-municipio", "editar-colonia", "editar-codigo_postal");
  }
  if (event.target.id === "editar-municipio") {
    cargarColonias(event.target.value, "editar-colonia", "editar-codigo_postal");
  }
  if (event.target.id === "editar-colonia") {
    cargarCP(event.target.value, "editar-codigo_postal");
  }
});

async function cargarYSeleccionarUbicacionEditar(idEstadoDB, idMunicipioDB, idColoniaDB, cpDB) {
  const selectEstado = document.getElementById("editar-estado");
  const selectMunicipio = document.getElementById("editar-municipio");
  const selectColonia = document.getElementById("editar-colonia");
  const inputCP = document.getElementById("editar-codigo_postal");

  //  Seleccionamos el Estado
  selectEstado.value = idEstadoDB;

  //  Cargamos municipios (esperamos a que termine) y seleccionamos
  await cargarMunicipios(idEstadoDB, "editar-municipio", "editar-colonia", "editar-codigo_postal");
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

  // 1. reglas para TODOS los campos en un solo lugar
  const reglasValidacion = [
    // Textos
    { id: "crear-codebar", tipo: "texto", min: 3, mensaje: "El código de barras debe tener al menos 3 caracteres." },
    { id: "crear-producto", tipo: "texto", min: 3, mensaje: "El nombre del producto debe tener al menos 3 caracteres." },
    { id: "crear-descprod", tipo: "texto", min: 3, mensaje: "La descripción debe tener al menos 3 caracteres." },
    
    // Selects (Listas desplegables)
    { id: "crear-categoria", tipo: "select", mensaje: "Debes seleccionar una Categoría." },
    { id: "crear-marca", tipo: "select", mensaje: "Debes seleccionar una Marca." },
    { id: "crear-proveedor", tipo: "select", mensaje: "Debes seleccionar un Proveedor." },
    { id: "crear-umedida", tipo: "select", mensaje: "Debes seleccionar una Unidad de Medida." },
    { id: "crear-impuesto", tipo: "select", mensaje: "Debes seleccionar un Impuesto." },
    
    // Números (Costos y Precios)
    { id: "crear-costo_compra", tipo: "numero", minVal: 0.01, mensaje: "El costo de compra debe ser mayor a $0." },
    { id: "crear-ganancia", tipo: "numero", minVal: 0, mensaje: "El porcentaje de ganancia no puede ser negativo." },
    // { id: "crear-precio1", tipo: "numero", minVal: 0.01, mensaje: "El precio final debe ser mayor a $0 (calcula el costo y ganancia)." },
    { id: "crear-stock_minimo", tipo: "numero", minVal: 0, mensaje: "El stock mínimo no puede ser negativo." }
  ];

  const errores = [];
  let primerCampoConError = null;

  // 2. El "Motor" que revisa cada regla automáticamente
  reglasValidacion.forEach(regla => {
    const elemento = document.getElementById(regla.id);
    if (!elemento) return; // Si el campo no existe en el HTML, lo ignora

    let valor = elemento.value.trim();
    let esValido = true;

    // A) borde rojo desaparezca cuando el usuario corrija el error
    if (regla.tipo === "select") {
        // Los selects usan 'change' cuando eliges una opción
        elemento.addEventListener("change", function() {
            if (this.value.trim() !== "") this.classList.remove("input-error");
        });
    } else {
        // Los inputs de texto/número usan 'input' cuando escribes
        elemento.addEventListener("input", function() {
            this.classList.remove("input-error");
        });
    }

    // B) Evaluar si el campo pasa la prueba
    if (regla.tipo === "texto") {
        if (valor.length < regla.min) esValido = false;
    } else if (regla.tipo === "select") {
        if (valor === "") esValido = false;
    } else if (regla.tipo === "numero") {
        let num = parseFloat(valor);
        if (isNaN(num) || num < regla.minVal) esValido = false;
    }

    // C) Aplicar el estilo rojo y guardar el mensaje si falló
    if (!esValido) {
        errores.push(`<li>${regla.mensaje}</li>`); // Lo guardamos como elemento de lista HTML
        elemento.classList.add("input-error");
        
        // Guardamos el primer elemento que falló para hacerle "focus" al final
        if (!primerCampoConError) primerCampoConError = elemento; 
    } else {
        elemento.classList.remove("input-error"); // Por si estaba rojo de un error anterior
    }
  });

  // 3. Si se encontraron errores, mostrar la alerta estructurada
  if (errores.length > 0) {
    Swal.fire({
      title: "Faltan datos",
      // Unimos todos los errores en una lista <ul> para que se vea ordenado
      html: `<ul style="text-align: left; font-size: 14px; color: #d33;">${errores.join("")}</ul>`,
      icon: "warning",
      confirmButtonColor: '#3085d6',
      confirmButtonText: 'Entendido' // Usamos un botón para que el usuario pueda leer la lista con calma
    });
    
    // Movemos la pantalla y el cursor al primer campo que le faltó llenar
    if (primerCampoConError) primerCampoConError.focus();
    return; // Detenemos el envío
  }

  // 4. Si pasa las validaciones visuales, verificamos duplicados en la BD
  const codebar = document.getElementById("crear-codebar").value.trim();
  const producto = document.getElementById("crear-producto").value.trim();

  verificarDuplicadoProducto(codebar, producto)
    .then((esDuplicado) => {
      if (esDuplicado) {
        return; // Detener la ejecución si hay duplicados (tu función ya lanza su propia alerta)
      }
      // 5. ¡Todo perfecto! Enviamos el formulario al servidor
      procesarFormularioProducto(event, "crear");
    })
    .catch((error) => {
      console.error("Error al verificar duplicados:", error);
      Swal.fire("Error", "Ocurrió un problema al validar el producto en la base de datos.", "error");
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
// =========================================================================
// 1. VALIDACIÓN PROFESIONAL DEL FORMULARIO DE EDICIÓN PRODUCTO
// =========================================================================
async function validarFormularioEdicionProducto(formulario) {
  
  // 1. Definimos las reglas exactas para los campos de EDICIÓN (id empieza con "editar-")
  const reglasValidacion = [
    // Textos
    { id: "editar-codebar", tipo: "texto", min: 3, mensaje: "El código de barras debe tener al menos 3 caracteres." },
    { id: "editar-producto", tipo: "texto", min: 3, mensaje: "El nombre del producto debe tener al menos 3 caracteres." },
    { id: "editar-descprod", tipo: "texto", min: 3, mensaje: "La descripción debe tener al menos 3 caracteres." },
    
    // Selects (Listas desplegables)
    { id: "editar-categoria", tipo: "select", mensaje: "Debes seleccionar una Categoría." },
    { id: "editar-marca", tipo: "select", mensaje: "Debes seleccionar una Marca." },
    { id: "editar-proveedor", tipo: "select", mensaje: "Debes seleccionar un Proveedor." },
    { id: "editar-umedida", tipo: "select", mensaje: "Debes seleccionar una Unidad de Medida." },
    { id: "editar-impuesto", tipo: "select", mensaje: "Debes seleccionar un Impuesto." },
    
    // Números (Costos y Precios)
    { id: "editar-costo_compra", tipo: "numero", minVal: 0.01, mensaje: "El costo de compra debe ser mayor a $0." },
    { id: "editar-ganancia", tipo: "numero", minVal: 0, mensaje: "El porcentaje de ganancia no puede ser negativo." },
    { id: "editar-stock_minimo", tipo: "numero", minVal: 0, mensaje: "El stock mínimo no puede ser negativo." }
  ];

  const errores = [];
  let primerCampoConError = null;

  // 2. El "Motor" que revisa cada regla automáticamente
  reglasValidacion.forEach(regla => {
    const elemento = document.getElementById(regla.id);
    if (!elemento) return; // Si no lo encuentra, lo salta para no romper el código

    let valor = elemento.value.trim();
    let esValido = true;

    // A) Programar que el borde rojo desaparezca al corregir
    if (regla.tipo === "select") {
        elemento.addEventListener("change", function() {
            if (this.value.trim() !== "") this.classList.remove("input-error");
        });
    } else {
        elemento.addEventListener("input", function() {
            this.classList.remove("input-error");
        });
    }

    // B) Evaluar si el campo pasa la prueba
    if (regla.tipo === "texto") {
        if (valor.length < regla.min) esValido = false;
    } else if (regla.tipo === "select") {
        if (valor === "") esValido = false;
    } else if (regla.tipo === "numero") {
        let num = parseFloat(valor);
        if (isNaN(num) || num < regla.minVal) esValido = false;
    }

    // C) Aplicar el estilo rojo y guardar el mensaje si falló
    if (!esValido) {
        errores.push(`<li>${regla.mensaje}</li>`);
        elemento.classList.add("input-error");
        if (!primerCampoConError) primerCampoConError = elemento; 
    } else {
        elemento.classList.remove("input-error");
    }
  });

  // 3. Si hay errores visuales, mostramos la alerta y detenemos todo
  if (errores.length > 0) {
    Swal.fire({
      title: "Faltan datos",
      html: `<ul style="text-align: left; font-size: 14px; color: #d33;">${errores.join("")}</ul>`,
      icon: "warning",
      confirmButtonColor: '#3085d6',
      confirmButtonText: 'Entendido'
    });
    
    if (primerCampoConError) primerCampoConError.focus();
    return; 
  }

  // 4. Validar duplicados en la Base de Datos (Backend)
  const productoInput = document.getElementById("editar-producto");
  const codebarInput = document.getElementById("editar-codebar");
  const idInput = document.getElementById("editar-idproducto");

  if (!productoInput || !idInput || !codebarInput) return;

  const producto = productoInput.value.trim();
  const codebar = codebarInput.value.trim();
  const id = idInput.value;

  try {
    // Primero revisamos si el nombre ya lo tiene otro producto
    const esNombreDuplicado = await verificarDuplicadoEditarProducto(producto, id);
    if (esNombreDuplicado) return; // Se detiene porque ya saltó la alerta de duplicado

    // Luego revisamos si el código de barras ya lo tiene otro
    const esCodebarDuplicado = await verificarDuplicadoEditarCodebar(codebar, id);
    if (esCodebarDuplicado) return; // Se detiene

  } catch (error) {
    console.error("Error validando duplicados:", error);
    return;
  }

  // 5. ¡Paso todas las validaciones! Enviamos al servidor
  enviarFormularioEdicionProducto(formulario);
}

// 2. Enviar formulario de edición Producto (AQUÍ SÍ EXISTE 'data')
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
                text: data.message || "El registro se ha eliminado correctamente.",
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
              Swal.fire("Error", data.message || "No se pudo eliminar el registro.", "error");
            }
          })
          .catch((error) => {
            Swal.fire("Error", "Hubo un problema al procesar tu solicitud.", "error");
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
    inicializarTablaGenerica('#tabla-categorias', '#buscarboxcat', '#cantidad-registros');

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

// CREAR CATEGORÍA (Validación Profesional y Procesamiento) ******************************************
function validarFormularioCat(event) {
  event.preventDefault();

  const reglasValidacion = [
    { id: "crear-cat", tipo: "texto", min: 3, mensaje: "La categoría debe tener al menos 3 caracteres." },
    { id: "crear-desc_cat", tipo: "texto", min: 3, mensaje: "La descripción debe tener al menos 3 caracteres." }
  ];

  const errores = [];
  let primerCampoConError = null;

  reglasValidacion.forEach(regla => {
    const elemento = document.getElementById(regla.id);
    if (!elemento) return;

    let valor = elemento.value.trim();
    
    elemento.addEventListener("input", function() {
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
    Swal.fire({
      title: "Faltan datos",
      html: `<ul style="text-align: left; font-size: 14px; color: #d33;">${errores.join("")}</ul>`,
      icon: "warning",
      confirmButtonColor: '#3085d6',
      confirmButtonText: 'Entendido'
    });
    if (primerCampoConError) primerCampoConError.focus();
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
        Swal.fire({ title: "Error", text: data.message || "Ocurrió un problema.", icon: "error" });
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      Swal.fire({ title: "Error", text: "Ocurrió un error inesperado.", icon: "error" });
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
    { id: "editar-cat", tipo: "texto", min: 3, mensaje: "La categoría debe tener al menos 3 caracteres." },
    { id: "editar-desc_cat", tipo: "texto", min: 3, mensaje: "La descripción debe tener al menos 3 caracteres." }
  ];

  const errores = [];
  let primerCampoConError = null;

  reglasValidacion.forEach(regla => {
    const elemento = document.getElementById(regla.id);
    if (!elemento) return;

    let valor = elemento.value.trim();
    
    elemento.addEventListener("input", function() {
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
    Swal.fire({
      title: "Faltan datos",
      html: `<ul style="text-align: left; font-size: 14px; color: #d33;">${errores.join("")}</ul>`,
      icon: "warning",
      confirmButtonColor: '#3085d6',
      confirmButtonText: 'Entendido'
    });
    if (primerCampoConError) primerCampoConError.focus();
    return;
  }

  const catInput = document.getElementById("editar-cat");
  const idInput = document.getElementById("editar-idcat");
  if (!catInput || !idInput) return;

  try {
    const esDuplicado = await verificarDuplicadoEditarCat(catInput.value.trim(), idInput.value);
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
        // Si tu función de cerrar modal se llama cerrarModalCat, asegúrate de que diga eso:
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
            inicializarTablaGenerica('#tabla-marcas', '#buscarboxmarca', '#cantidad-registros');
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
    { id: "crear-marca", tipo: "texto", min: 3, mensaje: "La marca debe tener al menos 3 caracteres." },
    { id: "crear-desc_marca", tipo: "texto", min: 3, mensaje: "La descripción debe tener al menos 3 caracteres." }
  ];

  const errores = [];
  let primerCampoConError = null;

  reglasValidacion.forEach(regla => {
    const elemento = document.getElementById(regla.id);
    if (!elemento) return;

    let valor = elemento.value.trim();
    
    elemento.addEventListener("input", function() {
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
    Swal.fire({
      title: "Faltan datos",
      html: `<ul style="text-align: left; font-size: 14px; color: #d33;">${errores.join("")}</ul>`,
      icon: "warning",
      confirmButtonColor: '#3085d6',
      confirmButtonText: 'Entendido'
    });
    if (primerCampoConError) primerCampoConError.focus();
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
        Swal.fire({ title: "Error", text: data.message || "Ocurrió un problema.", icon: "error" });
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      Swal.fire({ title: "Error", text: "Ocurrió un error inesperado.", icon: "error" });
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
    { id: "editar-marca", tipo: "texto", min: 3, mensaje: "La marca debe tener al menos 3 caracteres." },
    { id: "editar-desc_marca", tipo: "texto", min: 3, mensaje: "La descripción debe tener al menos 3 caracteres." }
  ];

  const errores = [];
  let primerCampoConError = null;

  reglasValidacion.forEach(regla => {
    const elemento = document.getElementById(regla.id);
    if (!elemento) return;

    let valor = elemento.value.trim();
    
    elemento.addEventListener("input", function() {
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
    Swal.fire({
      title: "Faltan datos",
      html: `<ul style="text-align: left; font-size: 14px; color: #d33;">${errores.join("")}</ul>`,
      icon: "warning",
      confirmButtonColor: '#3085d6',
      confirmButtonText: 'Entendido'
    });
    if (primerCampoConError) primerCampoConError.focus();
    return;
  }

  const marcaInput = document.getElementById("editar-marca");
  const idInput = document.getElementById("editar-idmarca");
  if (!marcaInput || !idInput) return;

  try {
    const esDuplicado = await verificarDuplicadoEditarMarca(marcaInput.value.trim(), idInput.value);
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
    inicializarTablaGenerica('#tabla-tiposervicios', '#buscarboxTiposervicios', '#cantidad-registros');

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
    { id: "crear-tiposervicios", tipo: "texto", min: 3, mensaje: "El tipo de servicios debe tener al menos 3 caracteres." },
    { id: "crear-desc_tiposervicios", tipo: "texto", min: 3, mensaje: "La descripción debe tener al menos 3 caracteres." }
  ];

  const errores = [];
  let primerCampoConError = null;

  reglasValidacion.forEach(regla => {
    const elemento = document.getElementById(regla.id);
    if (!elemento) return;

    let valor = elemento.value.trim();
    
    elemento.addEventListener("input", function() {
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
    Swal.fire({
      title: "Faltan datos",
      html: `<ul style="text-align: left; font-size: 14px; color: #d33;">${errores.join("")}</ul>`,
      icon: "warning",
      confirmButtonColor: '#3085d6',
      confirmButtonText: 'Entendido'
    });
    if (primerCampoConError) primerCampoConError.focus();
    return;
  }

  const tiposervicios = document.getElementById("crear-tiposervicios").value.trim();
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
        Swal.fire({ title: "Error", text: data.message || "Ocurrió un problema.", icon: "error" });
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      Swal.fire({ title: "Error", text: "Ocurrió un error inesperado.", icon: "error" });
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
  // 1. Escuchar clic en el botón de editar
  document.addEventListener("click", function (event) {
    if (event.target.classList.contains("editarTiposervicio")) {
      const id = event.target.dataset.id;

      fetch(`cruds/obtener_tiposervicios.php?id=${id}`)
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            const formularioTiposervicios = document.getElementById("form-editarTiposervicio");
            if (formularioTiposervicios) {
              const campos = ["idtiposervicio", "tiposervicio", "desc_servicio", "estatus"];
              
              campos.forEach((campo) => {
                const input = formularioTiposervicios[`editar-${campo}`];
                if(input){
                    input.value = data.tiposervicios[campo] || "";
                }
              });
              abrirModalTiposervicios("editar-modalTiposervicio");
            }
          } else {
            Swal.fire("Error", data.message || "No se pudo cargar el tipo de servicio.", "error");
          }
        })
        .catch((error) => {
          console.error("Error al obtener el Tipo de servicio:", error);
          Swal.fire("Error", "Ocurrió un problema al obtener los datos.", "error");
        });
    }
  });

  // 2. Escuchar el submit del formulario de edición
  document.body.addEventListener("submit", function (event) {
    if (event.target && event.target.id === "form-editarTiposervicio") {
      event.preventDefault(); 
      validarFormularioEdicionTiposervicio(event.target);
    }
  });
});

// 3. Verificar duplicado al editar
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

// 4. Validación del Motor de Reglas
async function validarFormularioEdicionTiposervicio(formulario) {
  // Los IDs aquí ya coinciden exactamente con tu HTML
  const reglasValidacion = [
    { id: "editar-tiposervicio", tipo: "texto", min: 3, mensaje: "El tipo de servicio debe tener al menos 3 caracteres." },
    { id: "editar-desc_servicio", tipo: "texto", min: 3, mensaje: "La descripción debe tener al menos 3 caracteres." }
  ];

  const errores = [];
  let primerCampoConError = null;

  reglasValidacion.forEach(regla => {
    const elemento = document.getElementById(regla.id);
    if (!elemento) return;

    let valor = elemento.value.trim();
    
    elemento.addEventListener("input", function() {
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
    Swal.fire({
      title: "Faltan datos",
      html: `<ul style="text-align: left; font-size: 14px; color: #d33;">${errores.join("")}</ul>`,
      icon: "warning",
      confirmButtonColor: '#3085d6',
      confirmButtonText: 'Entendido'
    });
    if (primerCampoConError) primerCampoConError.focus();
    return;
  }

  // IDs corregidos para buscar en el DOM
  const tiposerviciosInput = document.getElementById("editar-tiposervicio");
  const idInput = document.getElementById("editar-idtiposervicio");
  
  if (!tiposerviciosInput || !idInput) return;

  try {
    const esDuplicado = await verificarDuplicadoEditarTiposervicio(tiposerviciosInput.value.trim(), idInput.value);
    // Cambiamos el nombre de la función aquí para que no llame a Categorías
    if (!esDuplicado) enviarFormularioEdicionTiposervicio(formulario); 
  } catch (error) {
    console.error("Error al verificar duplicado:", error);
  }
}

// 5. Enviar a la Base de Datos
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
        inicializarTablaGenerica('#tabla-estadoservicio', '#buscarboxEstadoservicios', '#cantidad-registros');

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
    { id: "crear-estadoservicio", tipo: "texto", min: 3, mensaje: "El estado de servicio debe tener al menos 3 caracteres." },
    { id: "crear-desc_estadoservicio", tipo: "texto", min: 3, mensaje: "La descripción debe tener al menos 3 caracteres." }
  ];

  const errores = [];
  let primerCampoConError = null;

  reglasValidacion.forEach(regla => {
    const elemento = document.getElementById(regla.id);
    if (!elemento) return;

    let valor = elemento.value.trim();
    
    elemento.addEventListener("input", function() {
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
    Swal.fire({
      title: "Faltan datos",
      html: `<ul style="text-align: left; font-size: 14px; color: #d33;">${errores.join("")}</ul>`,
      icon: "warning",
      confirmButtonColor: '#3085d6',
      confirmButtonText: 'Entendido'
    });
    if (primerCampoConError) primerCampoConError.focus();
    return;
  }

  const estadoservicio = document.getElementById("crear-estadoservicio").value.trim();
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
        Swal.fire({ title: "Error", text: data.message || "Ocurrió un problema.", icon: "error" });
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      Swal.fire({ title: "Error", text: "Ocurrió un error inesperado.", icon: "error" });
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
        //mostrarAlerta("error", "Error", "El nombre del estado de servicio ya existe.");
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
            const formularioEstadoservicios = document.getElementById("form-editarEstadoservicio",);
            if (formularioEstadoservicios) {
              const campos = ["idestadoservicio","estadoservicio","desc_servicio","estatus",];
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
    { id: "editar-estadoservicio", tipo: "texto", min: 3, mensaje: "El estado de servicio debe tener al menos 3 caracteres." },
    { id: "editar-desc_servicio", tipo: "texto", min: 3, mensaje: "La descripción debe tener al menos 3 caracteres." }
  ];

  const errores = [];
  let primerCampoConError = null;

  reglasValidacion.forEach(regla => {
    const elemento = document.getElementById(regla.id);
    if (!elemento) return;

    let valor = elemento.value.trim();
    
    elemento.addEventListener("input", function() {
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
    Swal.fire({
      title: "Faltan datos",
      html: `<ul style="text-align: left; font-size: 14px; color: #d33;">${errores.join("")}</ul>`,
      icon: "warning",
      confirmButtonColor: '#3085d6',
      confirmButtonText: 'Entendido'
    });
    if (primerCampoConError) primerCampoConError.focus();
    return;
  }

  const estadoservicioInput = document.getElementById("editar-estadoservicio");
  const idInput = document.getElementById("editar-idestadoservicio");
  if (!estadoservicioInput || !idInput) return;

  try {
    const esDuplicado = await verificarDuplicadoEditarEstadoservicio(estadoservicioInput.value.trim(), idInput.value);
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

            inicializarTablaGenerica('#tabla-mpagos', '#buscarboxmpago', '#cantidad-registros');

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
    { id: "crear-mpago", tipo: "texto", min: 3, mensaje: "El método de pago debe tener al menos 3 caracteres." },
    { id: "crear-desc_mpago", tipo: "texto", min: 3, mensaje: "La descripción debe tener al menos 3 caracteres." }
  ];

  const errores = [];
  let primerCampoConError = null;

  reglasValidacion.forEach(regla => {
    const elemento = document.getElementById(regla.id);
    if (!elemento) return;

    let valor = elemento.value.trim();
    
    elemento.addEventListener("input", function() {
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
    Swal.fire({
      title: "Faltan datos",
      html: `<ul style="text-align: left; font-size: 14px; color: #d33;">${errores.join("")}</ul>`,
      icon: "warning",
      confirmButtonColor: '#3085d6',
      confirmButtonText: 'Entendido'
    });
    if (primerCampoConError) primerCampoConError.focus();
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
        Swal.fire({ title: "Error", text: data.message || "Ocurrió un problema.", icon: "error" });
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      Swal.fire({ title: "Error", text: "Ocurrió un error inesperado.", icon: "error" });
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
    { id: "editar-mpago", tipo: "texto", min: 3, mensaje: "El método de pago debe tener al menos 3 caracteres." },
    { id: "editar-desc_mpago", tipo: "texto", min: 3, mensaje: "La descripción debe tener al menos 3 caracteres." }
  ];

  const errores = [];
  let primerCampoConError = null;

  reglasValidacion.forEach(regla => {
    const elemento = document.getElementById(regla.id);
    if (!elemento) return;

    let valor = elemento.value.trim();
    
    elemento.addEventListener("input", function() {
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
    Swal.fire({
      title: "Faltan datos",
      html: `<ul style="text-align: left; font-size: 14px; color: #d33;">${errores.join("")}</ul>`,
      icon: "warning",
      confirmButtonColor: '#3085d6',
      confirmButtonText: 'Entendido'
    });
    if (primerCampoConError) primerCampoConError.focus();
    return;
  }

  const mpagoInput = document.getElementById("editar-mpago");
  const idInput = document.getElementById("editar-idmpago");
  if (!mpagoInput || !idInput) return;

  try {
    const esDuplicado = await verificarDuplicadoEditarMpago(mpagoInput.value.trim(), idInput.value);
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
            inicializarTablaGenerica('#tabla-impuestos', '#buscarboximpuesto', '#cantidad-registros');

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

  // 1. Definimos las reglas (¡Adiós descripción, hola número!)
  const reglasValidacion = [
    { id: "crear-impuesto", tipo: "texto", min: 3, mensaje: "El nombre del impuesto debe tener al menos 3 caracteres." },
    { id: "crear-tasa", tipo: "numero", minVal: 0, mensaje: "La tasa debe ser un número mayor o igual a 0." }
  ];

  const errores = [];
  let primerCampoConError = null;

  // 2. Recorremos las reglas
  reglasValidacion.forEach(regla => {
    const elemento = document.getElementById(regla.id);
    if (!elemento) return;

    let valor = elemento.value.trim();
    let esValido = true; // Asumimos que es válido hasta demostrar lo contrario
    
    elemento.addEventListener("input", function() {
        this.classList.remove("input-error");
    });

    // 3. Evaluamos según el tipo de campo
    if (regla.tipo === "texto") {
        if (valor.length < regla.min) esValido = false;
    } else if (regla.tipo === "numero") {
        let num = parseFloat(valor);
        // Es inválido si está vacío, si no es un número (isNaN) o si es menor a 0
        if (valor === "" || isNaN(num) || num < regla.minVal) esValido = false;
    }

    // 4. Aplicamos los estilos de error
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
      confirmButtonColor: '#3085d6',
      confirmButtonText: 'Entendido'
    });
    if (primerCampoConError) primerCampoConError.focus();
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
        Swal.fire({ title: "Error", text: data.message || "Ocurrió un problema.", icon: "error" });
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      Swal.fire({ title: "Error", text: "Ocurrió un error inesperado.", icon: "error" });
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
            const formularioImpuesto = document.getElementById("form-editarImpuesto");
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
            Swal.fire("Error", data.message || "No se pudo cargar el campo.", "error");
          }
        })
        .catch((error) => {
          console.error("Error al obtener el campo:", error);
          Swal.fire("Error", "Ocurrió un problema al obtener los datos.", "error");
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

// Validación Profesional del Formulario
async function validarFormularioEdicionImpuesto(formulario) {
  const reglasValidacion = [
    { id: "editar-impuesto", tipo: "texto", min: 3, mensaje: "El impuesto debe tener al menos 3 caracteres." },
    { id: "editar-tasa", tipo: "numero", minVal: 0, mensaje: "La tasa debe ser un número mayor o igual a 0." }
  ];

  const errores = [];
  let primerCampoConError = null;

  reglasValidacion.forEach(regla => {
    const elemento = document.getElementById(regla.id);
    if (!elemento) return;

    let valor = elemento.value.trim();
    let esValido = true;
    
    elemento.addEventListener("input", function() {
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
    Swal.fire({
      title: "Faltan datos",
      html: `<ul style="text-align: left; font-size: 14px; color: #d33;">${errores.join("")}</ul>`,
      icon: "warning",
      confirmButtonColor: '#3085d6',
      confirmButtonText: 'Entendido'
    });
    if (primerCampoConError) primerCampoConError.focus();
    return;
  }

  const impuestoInput = document.getElementById("editar-impuesto");
  const idInput = document.getElementById("editar-idimpuesto");
  if (!impuestoInput || !idInput) return;

  try {
    const esDuplicado = await verificarDuplicadoEditarImpuesto(impuestoInput.value.trim(), idInput.value);
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

    inicializarTablaGenerica('#tabla-proveedores', '#buscarboxproveedor', '#cantidad-registros');

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
    { id: "crear-proveedor", tipo: "texto", min: 3, mensaje: "El nombre debe tener al menos 3 caracteres." },
    { id: "crear-papellido", tipo: "texto", min: 3, mensaje: "El primer apellido debe tener al menos 3 caracteres." },
    { id: "crear-sapellido", tipo: "texto", min: 3, mensaje: "El segundo apellido debe tener al menos 3 caracteres." },
    { id: "crear-contacto", tipo: "texto", min: 3, mensaje: "La empresa debe tener al menos 3 caracteres." },
    { id: "crear-rfc", tipo: "texto", min: 12, mensaje: "El RFC debe tener al menos 12 caracteres." },
    { id: "crear-telefono", tipo: "texto", min: 10, mensaje: "El teléfono debe tener exactamente 10 dígitos." },
    { id: "crear-email", tipo: "email", mensaje: "Debes ingresar un correo electrónico válido (ej. pedro@correo.com)." }
  ];

  const errores = [];
  let primerCampoConError = null;

  // Evaluamos cada regla
  reglasValidacion.forEach(regla => {
    const elemento = document.getElementById(regla.id);
    if (!elemento) return;

    let valor = elemento.value.trim();
    let esValido = true;
    
    elemento.addEventListener("input", function() {
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
    Swal.fire({
      title: "Faltan datos",
      html: `<ul style="text-align: left; font-size: 14px; color: #d33;">${errores.join("")}</ul>`,
      icon: "warning",
      confirmButtonColor: '#3085d6',
      confirmButtonText: 'Entendido'
    });
    if (primerCampoConError) primerCampoConError.focus();
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
        Swal.fire({ title: "Error", text: data.message || "Ocurrió un problema.", icon: "error" });
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      Swal.fire({ title: "Error", text: "Ocurrió un error inesperado.", icon: "error" });
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
          const formularioProveedor = document.getElementById("form-editarProveedor");
          if (formularioProveedor) {
            const campos = [
              "idproveedor", "proveedor", "papellido", "sapellido", 
              "contacto", "rfc", "telefono", "email", "estatus"
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
          Swal.fire("Error", data.message || "No se pudo cargar el proveedor.", "error");
        }
      })
      .catch((error) => {
        console.error("Error al obtener el campo:", error);
        Swal.fire("Error", "Ocurrió un problema al obtener los datos.", "error");
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

// Validación Profesional del Formulario
async function validarFormularioEdicionProveedor(formulario) {
  // Motor de reglas (Soporta Textos y Emails)
  const reglasValidacion = [
    { id: "editar-proveedor", tipo: "texto", min: 3, mensaje: "El nombre debe tener al menos 3 caracteres." },
    { id: "editar-papellido", tipo: "texto", min: 3, mensaje: "El primer apellido debe tener al menos 3 caracteres." },
    { id: "editar-sapellido", tipo: "texto", min: 3, mensaje: "El segundo apellido debe tener al menos 3 caracteres." },
    { id: "editar-contacto", tipo: "texto", min: 3, mensaje: "La empresa debe tener al menos 3 caracteres." },
    { id: "editar-rfc", tipo: "texto", min: 12, mensaje: "El RFC debe tener al menos 12 caracteres." },
    { id: "editar-telefono", tipo: "texto", min: 10, mensaje: "El teléfono debe tener exactamente 10 dígitos." },
    { id: "editar-email", tipo: "email", mensaje: "Debes ingresar un correo electrónico válido." }
  ];

  const errores = [];
  let primerCampoConError = null;

  reglasValidacion.forEach(regla => {
    const elemento = document.getElementById(regla.id);
    if (!elemento) return;

    let valor = elemento.value.trim();
    let esValido = true;
    
    elemento.addEventListener("input", function() {
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
    Swal.fire({
      title: "Faltan datos",
      html: `<ul style="text-align: left; font-size: 14px; color: #d33;">${errores.join("")}</ul>`,
      icon: "warning",
      confirmButtonColor: '#3085d6',
      confirmButtonText: 'Entendido'
    });
    if (primerCampoConError) primerCampoConError.focus();
    return;
  }

  const proveedorInput = document.getElementById("editar-proveedor");
  const idInput = document.getElementById("editar-idproveedor");
  if (!proveedorInput || !idInput) return;

  try {
    const esDuplicado = await verificarDuplicadoEditarProveedor(proveedorInput.value.trim(), idInput.value);
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
              Swal.fire({
                title: "¡Eliminado!",
                text: data.message || "El registro se ha eliminado correctamente.",
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

// Llamar Ordenes de servicio *************************************************
document.getElementById("ordenes-link").addEventListener("click", function (event) {
    event.preventDefault();
    fetch("catalogos/ordenes.php")
      .then((response) => response.text())
      .then((html) => {
        document.getElementById("content-area").innerHTML = html;

        //filtros y busqueda
        inicializarTablaGenerica('#tabla-ordenes', '#buscarboxorden', '#cantidad-registros');

        // Revisamos si el Dashboard nos dejó un mensaje secreto
        let filtroGuardado = sessionStorage.getItem("filtroDashboard");
        
        if (filtroGuardado) {
            // Le damos 200 milisegundos a DataTables para que termine de construirse
            setTimeout(() => {
                let cajaBusqueda = $("#buscarboxorden"); 
                
                if (cajaBusqueda.length > 0) {
                    cajaBusqueda.val(filtroGuardado); // Escribimos la palabra
                    cajaBusqueda.trigger("input").trigger("keyup"); // Filtramos
                    
                    // --- LA MAGIA UX: Botón dinámico de "Ver Todas" ---
                    // Verificamos que el botón no exista ya, para no duplicarlo
                    if ($("#btn-limpiar-dashboard").length === 0) {
                        // Creamos un botón gris elegante
                        let btnLimpiar = $("<button id='btn-limpiar-dashboard' class='boton' style='margin-left: 50px; background-color: #204eda;'>Ver Todas</button>");
                        
                        // Lo pegamos justo después de la caja de búsqueda
                        cajaBusqueda.after(btnLimpiar);
                        
                        // Le damos la orden de qué hacer al hacerle clic
                        btnLimpiar.on("click", function() {
                            cajaBusqueda.val("").trigger("input").trigger("keyup"); // Limpia el buscador y refresca la tabla
                            $(this).remove(); // El botón se autodestruye para no estorbar
                        });
                    }
                }
                
                // Borramos el mensaje de la memoria
                sessionStorage.removeItem("filtroDashboard"); 
            }, 200); 
        }
      })
      .catch((error) => console.error("Error al cargar contenido:", error));
});


// BUSCADOR DE CLIENTES (AUTOCOMPLETE)
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

// Selección de Cliente 
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


// FUNCIONES DE UTILIDAD (GLOBALES)
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
// LÓGICA DE CÁMARA WEB
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

    // CREAR ORDEN (INCLUYE FOTOS WEBCAM)
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

  fetch("cruds/cargar_ordenes.php?limit=8&offset=0")
    .then((response) => response.json())
    .then((data) => {
      actualizarTablaOrdenes(data);
    })
    .catch((error) => console.error("Error al cargar ordenes:", error));
}

//Llamar editar ordenes 
// Función para calcular el saldo en el modal de editar
function calcularSaldoEdit() {
    const costo = parseFloat(document.getElementById('edit-costo').value) || 0;
    const anticipoAcumulado = parseFloat(document.getElementById('edit-anticipo').value) || 0;
    const nuevoAbono = parseFloat(document.getElementById('edit-nuevo-abono').value) || 0;
    
    // El saldo es el costo menos lo que ya había dado, menos lo que está dando ahorita
    let saldoFinal = costo - (anticipoAcumulado + nuevoAbono);
    
    // Evitamos que el saldo sea negativo visualmente
    if (saldoFinal < 0) saldoFinal = 0; 
    
    document.getElementById('edit-saldo').value = saldoFinal.toFixed(2);
}

//  ABRIR EL MODAL Y TRAER DATOS
document.addEventListener('click', function(e) {
    if (e.target && e.target.classList.contains('editarOrden')) {
        const idOrden = e.target.getAttribute('data-id');

        // Mostramos cargando con SweetAlert
        Swal.fire({ title: 'Cargando datos...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

        fetch(`cruds/obtener_orden.php?id=${idOrden}`)
        .then(res => res.json())
        .then(data => {
            Swal.close();
            if(data.success) {
                // Llenamos el formulario con los datos de la base de datos
                document.getElementById('edit-id-orden').value = data.orden.id_orden;
                document.getElementById('edit-folio-text').textContent = data.orden.id_orden;
                document.getElementById('edit-estado').value = data.orden.id_estado_servicio;
                document.getElementById('edit-falla').value = data.orden.falla;
                document.getElementById('edit-diagnostico').value = data.orden.diagnostico;
                document.getElementById('edit-costo').value = data.orden.costo_servicio;
                document.getElementById('edit-anticipo').value = data.orden.anticipo_servicio || 0;
                document.getElementById('edit-nuevo-abono').value = '0';

                calcularSaldoEdit(); // Calculamos para que se vea rojo el saldo

                const formEditar = document.getElementById('form-editarOrden');
                    formEditar.dataset.estadoOrig = data.orden.id_estado_servicio;
                    // Usamos || '' por si el diagnóstico viene vacío (null) de la BD
                    formEditar.dataset.diagOrig = data.orden.diagnostico || ''; 
                    formEditar.dataset.costoOrig = parseFloat(data.orden.costo_servicio).toFixed(2);
                
                // Abrimos el modal
                abrirModalOrden('editar-modalOrden');
            } else {
                Swal.fire('Error', data.message, 'error');
            }
        })
        .catch(err => {
            Swal.close();
            console.error(err);
            Swal.fire('Error', 'No se pudo conectar con el servidor.', 'error');
        });
    }
});

// ENVIAR LOS DATOS ACTUALIZADOS AL SERVIDOR
document.addEventListener("submit", function (e) {
  if (e.target && e.target.id === "form-editarOrden") {
 e.preventDefault();
        
        const form = e.target; // Nuestro formulario
        // NUEVA VALIDACIÓN: ¿HUBO CAMBIOS ?
        // 1. Extraemos los valores actuales de las cajas
        const estadoActual = document.getElementById('edit-estado').value;
        const diagActual = document.getElementById('edit-diagnostico').value.trim();
        const costoActual = parseFloat(document.getElementById('edit-costo').value || 0).toFixed(2);
        const nuevoAbono = parseFloat(document.getElementById('edit-nuevo-abono').value) || 0;

        // 2. Comparamos los actuales contra la "fotografía" que guardamos
        if (estadoActual === form.dataset.estadoOrig && 
            diagActual === form.dataset.diagOrig && 
            costoActual === form.dataset.costoOrig && 
            nuevoAbono === 0) { // Si el abono es 0, tampoco hubo pago
            
            // Lanzamos alerta informativa y detenemos todo el proceso
            Swal.fire({
                icon: 'info',
                title: 'Sin cambios',
                text: 'No has modificado ningún dato ni ingresado un nuevo abono.',
                icon: "warning",
                showConfirmButton: false,
                timer: 2000,
                timerProgressBar: true,
            });
            return; 
        }

    const formData = new FormData(e.target);

    Swal.fire({
      title: "Guardando cambios...",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    // Vamos al PHP del Paso 3
    fetch("cruds/procesar_editar_orden.php", { method: "POST", body: formData })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          cerrarModalOrden("editar-modalOrden");

  Swal.fire({
            icon: "success", // Cambiamos a success porque todo salió bien
            title: "¡Actualizado!",
            text: data.message,
            showConfirmButton: false,
            timer: 2000,           
            timerProgressBar: true    
        }).then(() => {
            // Esto se va a ejecutar automáticamente cuando los 2 segundos terminen
            if (document.getElementById("ordenes-link")) {
                document.getElementById("ordenes-link").click();
            }
        });
        } else {
          Swal.fire("Error", data.message, "error");
        }
      })
      .catch((err) => {
        console.error(err);
        Swal.fire("Error", "Ocurrió un problema en la red.", "error");
      });
  }
});
// LÓGICA PARA ELIMINAR (CANCELAR) ÓRDENES
document.addEventListener('click', function(e) {
    // Detectamos si el clic fue en el botón rojo
    const btnEliminar = e.target.closest('.eliminarOrden');
    
    if (btnEliminar) {
        const idOrden = btnEliminar.getAttribute('data-id');

        Swal.fire({
            title: '¿Estás seguro?',
            text: "La orden #" + idOrden + " será cancelada. No se borrará del historial.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Sí, cancelar orden',
            cancelButtonText: 'No, regresar'
        }).then((result) => {
            if (result.isConfirmed) {
                // Pantalla de carga
                Swal.fire({ title: 'Procesando...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

                // Petición Fetch hacia tu nuevo PHP
                fetch('cruds/procesar_eliminar_orden.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: 'id_orden=' + idOrden
                })
                .then(res => res.json())
                .then(data => {
                    if(data.success) {
                        // Mensaje de éxito
                        Swal.fire('¡Cancelada!', data.message, 'success', ).then(() => {
                            // Recargamos la tabla automáticamente simulando un clic en el menú
                            if(document.getElementById("ordenes-link")) {
                                document.getElementById("ordenes-link").click(); 
                            }
                        });
                    } else {
                        Swal.fire('Error', data.message, 'error');
                    }
                })
                .catch(err => {
                    console.error(err);
                    Swal.fire('Error', 'Fallo de conexión con el servidor.', 'error');
                });
            }
        });
    }
});

// LÓGICA PARA ENVIAR WHATSAPP DESDE LA TABLA
function enviarWhatsOrden(telefono, folio, cliente, saldo, estado, taller) {
    // 1. Limpiamos el teléfono
    let tel = telefono.replace(/\D/g, '');
    if (tel.length === 10) {
        tel = '52' + tel;
    }

    // 2. Construimos el mensaje de texto limpio
    let mensaje = `¡Hola ${cliente}! Te contactamos de *${taller}*.\n\n`;
    mensaje += `Te informamos que tu orden de servicio con *Folio #${folio}* se encuentra actualmente en estado: *${estado.toUpperCase()}*.\n\n`;

    // 3. Condicionamos el texto del saldo
    let saldoNum = parseFloat(saldo);
    if (saldoNum > 0) {
        mensaje += `*Saldo pendiente:* $${saldoNum.toFixed(2)}\n\n`;
    } else {
        mensaje += `*Saldo:* Equipo pagado en su totalidad.\n\n`;
    }

    mensaje += `Si tienes alguna duda, responde a este mensaje. ¡Gracias por tu preferencia!`;

    // 4. Codificamos el texto para la URL
    let textoCodificado = encodeURIComponent(mensaje);

    // 5. Abrimos WhatsApp
    window.open(`https://wa.me/${tel}?text=${textoCodificado}`, '_blank');
}
// LÓGICA PARA IMPRIMIR DESDE LA TABLA
function imprimirTicket(idOrden) {
    // Abre una ventana pequeña de 400x600 pixeles
    window.open(`cruds/imprimir_ticket.php?id=${idOrden}`, 'Ticket', 'width=400,height=600');
}
// LÓGICA PARA VER EL QR RÁPIDO EN PANTALLA
function verQrOrden(token) {
    // 1. Construimos la URL completa que el cliente va a visitar
    const urlRastreo = `http://localhost/swaos/track.php?t=${token}`;
    
    // 2. Generamos la imagen del QR usando la API gratuita (tamaño grande para pantallas)
    const urlImagenQR = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(urlRastreo)}`;

    // 3. Lanzamos el SweetAlert con la imagen incrustada
    Swal.fire({
        title: 'Código de Rastreo',
        text: 'Pide al cliente que escanee este código con su cámara.',
        imageUrl: urlImagenQR,
        imageWidth: 250,
        imageHeight: 250,
        imageAlt: 'Código QR de Rastreo',
        confirmButtonText: 'Cerrar',
        confirmButtonColor: '#34495e'
    });
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
