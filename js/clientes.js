// INICIALIZAR Y CARGAR MÓDULO DE CLIENTES
document
  .getElementById("clientes-link")
  .addEventListener("click", function (event) {
    event.preventDefault();
    fetch("catalogos/clientes.php")
      .then((response) => response.text())
      .then((html) => {
        document.getElementById("content-area").innerHTML = html;
        // INICIALIZAMOS DATATABLES AQUÍ:
        inicializarTablaGenerica(
          "#tabla-clientes",
          "#buscarboxcliente",
          "#cantidad-registros",
        );
      })
      .catch((error) => {
        console.error("Error al cargar el contenido:", error);
      });
  });

function abrirModalCliente(id) {
  document.getElementById(id).style.display = "flex";
}

function cerrarModalCliente(id) {
  document.getElementById(id).style.display = "none";
}

// CREAR CLIENTE
function validarFormularioCliente(event) {
  event.preventDefault();

  const reglasValidacion = [
    {
      id: "crear-cliente",
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
      mensaje: "El teléfono debe tener exactamente 10 dígitos.",
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

  const cliente = document.getElementById("crear-cliente").value.trim();
  const papellido = document.getElementById("crear-papellido").value.trim();
  const sapellido = document.getElementById("crear-sapellido").value.trim();

  verificarDuplicadoCliente(cliente, papellido, sapellido).then(
    (esDuplicado) => {
      if (!esDuplicado) procesarFormularioCliente(event, "crear");
    },
  );
}

function procesarFormularioCliente(event, tipo) {
  event.preventDefault();
  const formData = new FormData(event.target);

  fetch(`cruds/procesar_${tipo}_cliente.php`, {
    method: "POST",
    body: formData,
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        cerrarModalCliente(tipo + "-modalCliente");
        event.target.reset();

        Swal.fire({
          title: "¡Éxito!",
          text: data.message || "Cliente guardado correctamente.",
          icon: "success",
          showConfirmButton: false,
          timer: 1500,
          timerProgressBar: true,
        }).then(() => {
          if (document.getElementById("clientes-link")) {
            document.getElementById("clientes-link").click(); // RECARGA LIMPIA DATATABLES
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

function verificarDuplicadoCliente(cliente, papellido, sapellido) {
  return fetch("cruds/verificar_nombre_cliente.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ cliente, papellido, sapellido }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.existe) {
        Swal.fire({
          title: "Atención",
          text: "Ya existe un cliente con este nombre y apellidos.",
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

// EDITAR CLIENTE
document.addEventListener("DOMContentLoaded", function () {
  document.addEventListener("click", function (event) {
    if (event.target.classList.contains("editarCliente")) {
      const id = event.target.dataset.id;

      fetch(`cruds/obtener_cliente.php?id=${id}`)
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            const formularioCliente =
              document.getElementById("form-editarCliente");
            if (formularioCliente) {
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

              campos.forEach((campo) => {
                const input = formularioCliente[`editar-${campo}`];
                if (input) {
                  input.value = data.cliente[campo] || "";
                }
              });

              // Llamada a tu función de ubicaciones
              const idEstadoDB = data.cliente.estado;
              const idMunicipioDB = data.cliente.municipio;
              const idColoniaDB = data.cliente.colonia;
              const cpDB = data.cliente.codigo_postal;
              if (typeof cargarYSeleccionarUbicacionEditar === "function") {
                cargarYSeleccionarUbicacionEditar(
                  idEstadoDB,
                  idMunicipioDB,
                  idColoniaDB,
                  cpDB,
                );
              }

              abrirModalCliente("editar-modalCliente");
            }
          } else {
            Swal.fire(
              "Error",
              data.message || "No se pudo cargar el cliente.",
              "error",
            );
          }
        })
        .catch((error) => {
          console.error("Error al obtener cliente:", error);
          Swal.fire(
            "Error",
            "Ocurrió un problema al obtener los datos.",
            "error",
          );
        });
    }
  });

  document.body.addEventListener("submit", function (event) {
    if (event.target && event.target.id === "form-editarCliente") {
      event.preventDefault();
      validarFormularioEdicionCliente(event.target);
    }
  });
});

function verificarDuplicadoEditarCliente(
  cliente,
  papellido,
  sapellido,
  id = 0,
) {
  return fetch("cruds/verificar_nombre_cliente.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ cliente, papellido, sapellido, id }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.existe) {
        Swal.fire({
          title: "Atención",
          text: data.message || "El nombre del cliente ya existe.",
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

async function validarFormularioEdicionCliente(formulario) {
  const reglasValidacion = [
    {
      id: "editar-cliente",
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
      mensaje: "El teléfono debe tener exactamente 10 dígitos.",
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

  const idInput = document.getElementById("editar-idcliente");
  const clienteInput = document.getElementById("editar-cliente");
  const papellido = document.getElementById("editar-papellido").value.trim();
  const sapellido = document.getElementById("editar-sapellido").value.trim();

  if (!clienteInput || !idInput) return;

  try {
    const esDuplicado = await verificarDuplicadoEditarCliente(
      clienteInput.value.trim(),
      papellido,
      sapellido,
      idInput.value,
    );
    if (!esDuplicado) enviarFormularioEdicionCliente(formulario);
  } catch (error) {
    console.error("Error al verificar duplicado:", error);
  }
}

function enviarFormularioEdicionCliente(formulario) {
  if (!formulario) return;
  const formData = new FormData(formulario);

  fetch("cruds/editar_cliente.php", {
    method: "POST",
    body: formData,
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        Swal.fire({
          title: "¡Actualizado!",
          text: data.message || "El cliente ha sido actualizado correctamente.",
          icon: "success",
          showConfirmButton: false,
          timer: 1500,
          timerProgressBar: true,
        }).then(() => {
          if (document.getElementById("clientes-link")) {
            document.getElementById("clientes-link").click(); // RECARGA LIMPIA DATATABLES
          }
        });
        cerrarModalCliente("editar-modalCliente");
      } else {
        Swal.fire({
          title: "¡Atención!",
          text: data.message || "No se realizaron cambios en el registro.",
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

// ELIMINAR CLIENTE
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
        fetch(`cruds/eliminar_cliente.php?id=${id}`, { method: "POST" })
          .then((response) => response.json())
          .then((data) => {
            if (data.success) {
              Swal.fire({
                title: "¡Eliminado!",
                text:
                  data.message ||
                  "El registro ha sido eliminado correctamente.",
                icon: "success",
                showConfirmButton: false,
                timer: 1500,
                timerProgressBar: true,
              }).then(() => {
                if (document.getElementById("clientes-link")) {
                  document.getElementById("clientes-link").click(); // RECARGA LIMPIA
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
            console.error("Error al eliminar:", error);
            Swal.fire(
              "Error",
              "Hubo un problema al procesar tu solicitud.",
              "error",
            );
          });
      }
    });
  }
});

// VER EXPEDIENTE 360 DEL CLIENTE
document.addEventListener("click", function (event) {
  // Usamos closest() por si el usuario le da clic al ícono <i> dentro del botón
  const botonExpediente = event.target.closest(".verExpediente");

  if (botonExpediente) {
    const id = botonExpediente.dataset.id;

    // Abrimos el Modal
    abrirModalCliente("expediente-modalCliente");

    // Reseteamos los campos a "Cargando..." 
    document.getElementById("exp-nombre").innerText = "Cargando...";
    document.getElementById("exp-telefono").innerText = "...";
    document.getElementById("exp-email").innerText = "...";
    document.getElementById("exp-direccion").innerText = "...";
    document.getElementById("exp-total-gastado").innerText = "$0.00";
    document.getElementById("exp-total-ordenes").innerText = "0";
    document.getElementById("exp-total-canceladas").innerText = "0";
    document.getElementById("exp-tabla-ordenes").innerHTML =
      '<tr><td colspan="6" style="text-align: center;">Buscando historial en la base de datos <i class="fa-solid fa-spinner fa-spin"></i></td></tr>';

    // Hacemos la llamada al "Cerebro" (PHP) que crearemos a continuación
    fetch(`cruds/obtener_expediente.php?id=${id}`)
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          // PINTAR EL PERFIL Y BOTÓN DE WHATSAPP
          document.getElementById("exp-nombre").innerText = data.cliente.nombre;
          document.getElementById("exp-telefono").innerText =
            data.cliente.telefono;
          document.getElementById("exp-email").innerText = data.cliente.email;
          document.getElementById("exp-direccion").innerText =
            data.cliente.direccion;

          // Lógica inteligente para el botón de WhatsApp
          let btnWa = document.getElementById("exp-btn-whatsapp");
          let telLimpio = data.cliente.telefono.replace(/\D/g, ""); // Quitamos espacios o guiones

          if (telLimpio.length >= 10) {
            btnWa.style.display = "block";
            btnWa.onclick = function () {
              // Asumimos lada +52 (México). Cambia el 52 si estás en otro país.
              window.open(`https://wa.me/52${telLimpio}`, "_blank");
            };
          } else {
            btnWa.style.display = "none"; // Ocultar si no hay número válido
          }

          // PINTAR LAS MATEMÁTICAS (LTV)
          let gastadoFormateado = parseFloat(
            data.estadisticas.total_gastado,
          ).toLocaleString("es-MX", { style: "currency", currency: "MXN" });
          document.getElementById("exp-total-gastado").innerText =
            gastadoFormateado;
          document.getElementById("exp-total-ordenes").innerText =
            data.estadisticas.total_ordenes;
          document.getElementById("exp-total-canceladas").innerText =
            data.estadisticas.total_canceladas;

          // PINTAR LA TABLA DE HISTORIAL
          let tbody = document.getElementById("exp-tabla-ordenes");
          tbody.innerHTML = ""; // Limpiamos el mensaje de "Buscando..."

          if (data.ordenes.length === 0) {
            tbody.innerHTML =
              '<tr><td colspan="6" style="text-align: center; padding: 15px; color: #666;">Este cliente es nuevo, aún no tiene equipos ni órdenes registradas.</td></tr>';
          } else {
            data.ordenes.forEach((ord) => {
              // Reutilizamos la lógica de las etiquetas de colores del Dashboard
              let estadoStr = ord.estado.toUpperCase();
              let badgeHtml = "";

              if (estadoStr.includes("ENTREGADO")) {
                badgeHtml = `<span style="background: #d1e7dd; color: #0f5132; padding: 3px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">${ord.estado}</span>`;
              } else if (estadoStr.includes("CANCELADO")) {
                badgeHtml = `<span style="background: #f8d7da; color: #842029; padding: 3px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">${ord.estado}</span>`;
              } else {
                badgeHtml = `<span style="background: #cff4fc; color: #055160; padding: 3px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">${ord.estado}</span>`;
              }

              // Formatear el costo
              let costoFormateado = parseFloat(ord.costo).toLocaleString(
                "es-MX",
                {
                  style: "currency",
                  currency: "MXN",
                },
              );

              // Crear la fila
              let fila = `<tr style="border-bottom: 1px solid #eee;">
                        <td style="color: #0d6efd; font-weight: bold; padding: 8px;">#${ord.folio}</td>
                        <td style="padding: 8px;">${ord.fecha}</td>
                        <td style="padding: 8px; font-weight: 500;">${ord.equipo}</td>
                        <td style="padding: 8px; color: #555;">${ord.falla}</td>
                        <td style="padding: 8px;">${badgeHtml}</td>
                        <td style="padding: 8px; font-weight: bold; text-align: right;">${costoFormateado}</td>
                    </tr>`;

              tbody.innerHTML += fila;
            });
          }
        } else {
          Swal.fire(
            "Error",
            data.message || "No se pudo cargar el expediente.",
            "error",
          );
        }
      })
      .catch((error) => {
        console.error("Error al obtener expediente:", error);
      });
  }
});
