// MOTOR DEL DASHBOARD Y CARDS
document.addEventListener("DOMContentLoaded", function () {
  let intervaloDashboard = null;
  let actualizandoDashboard = false;

  // Función para traer los números frescos de la base de datos
  function actualizarDashboard() {
    if (actualizandoDashboard) return;

    actualizandoDashboard = true;
    fetch("../php/funciones/api_dashboard.php")
      .then((response) => response.json())
      .then((data) => {
        if (data.error) {
          console.error("Error del servidor:", data.error);
          return;
        }

        // 1. ACTUALIZAR LAS TARJETAS (Con IDs blindados)
        let elPendientes = document.getElementById("dash-pendientes");
        let elListas = document.getElementById("dash-listas");
        let elProductos = document.getElementById("dash-productos");
        let elClientes = document.getElementById("dash-clientes");
        let elProveedores = document.getElementById("dash-proveedores");
        let elVentas = document.getElementById("dash-ventas");

        if (elPendientes) elPendientes.textContent = data.opendientes || 0;
        if (elListas) elListas.textContent = data.olistas || 0;
        if (elProductos) elProductos.textContent = data.productos || 0;
        if (elClientes) elClientes.textContent = data.clientes || 0;
        if (elProveedores) elProveedores.textContent = data.proveedores || 0;
        if (elVentas) {
          // Le damos formato de moneda (Ej: $1,500.00)
          let ventasFormateadas = parseFloat(data.ventas).toLocaleString(
            "es-MX",
            {
              style: "currency",
              currency: "MXN",
            },
          );
          elVentas.textContent = ventasFormateadas;
        }

        // 2. DIBUJAR LA GRÁFICA DE DONA

        let canvasElement = document.getElementById("miGraficaEquipos");
        if (canvasElement && data.grafica) {
          let etiquetas = data.grafica.map((item) => item.estado);
          let valores = data.grafica.map((item) => item.total);

          // ¿La gráfica existe en memoria Y su canvas es exactamente el que estamos viendo en pantalla?
          if (
            window.miGraficaInstancia &&
            window.miGraficaInstancia.ctx.canvas === canvasElement
          ) {
            // Sí, sigue siendo la misma. Solo actualizamos los datos (Animación suave)
            window.miGraficaInstancia.data.labels = etiquetas;
            window.miGraficaInstancia.data.datasets[0].data = valores;
            window.miGraficaInstancia.update();
          } else {
            // No, regresamos de otra pestaña. El canvas es nuevo.
            // Destruimos a la gráfica "fantasma" que se quedó en la memoria RAM
            if (window.miGraficaInstancia) {
              window.miGraficaInstancia.destroy();
            }

            // Y creamos una gráfica totalmente nueva
            window.miGraficaInstancia = new Chart(
              canvasElement.getContext("2d"),
              {
                type: "doughnut",
                data: {
                  labels: etiquetas,
                  datasets: [
                    {
                      data: valores,
                      backgroundColor: [
                        "#ff9d2f",
                        "#2ecc71",
                        "#3498db",
                        "#9b59b6",
                        "#e74c3c",
                        "#34495e",
                      ],
                      borderWidth: 0,
                      hoverOffset: 10,
                    },
                  ],
                },
                options: {
                  responsive: true,
                  maintainAspectRatio: false,
                  cutout: "70%",
                  plugins: { legend: { position: "right" } },
                },
              },
            );
          }
        }

        // 3. LLENAR LA TABLA DE ÚLTIMAS ÓRDENES
        let tbody = document.getElementById("tabla-ultimas-ordenes");
        if (tbody && data.ultimas_ordenes) {
          tbody.innerHTML = ""; // Limpiamos la tabla

          if (data.ultimas_ordenes.length === 0) {
            tbody.innerHTML =
              '<tr><td colspan="3" style="text-align:center;">No hay órdenes recientes</td></tr>';
          } else {
            data.ultimas_ordenes.forEach((orden) => {
              // Agregamos la clase, el destino y el número de orden como filtro
              let fila = `<tr class="fila-orden-reciente" data-menu-link="ordenes-link" data-filtro="${orden.id_orden}">
                        <td><strong style="color: #007bff;">#${orden.id_orden}</strong></td>
                        <td>${orden.cliente}</td>
                        <td style="font-weight:bold; color:#555;">${orden.estado}</td>
                    </tr>`;
              tbody.innerHTML += fila;
            });
          }
        }
      })
      .catch((error) =>
        console.error("Error al obtener datos del dashboard:", error),
      )
      .finally(() => {
        actualizandoDashboard = false;
      });
  }

  const contentArea = document.getElementById("content-area");

  if (contentArea) {
    // Vigila cuándo entra y sale el dashboard de la pantalla
    const observer = new MutationObserver((mutationsList) => {
      let dashboardRecienInyectado = false;

      for (let mutation of mutationsList) {
        if (mutation.type === "childList") {
          // Revisar si en este exacto momento se insertó el contenedor #dashboard
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === 1) {
              if (node.id === "dashboard" || node.querySelector("#dashboard")) {
                dashboardRecienInyectado = true;
              }

              //  Revisar si hay nota secreta y ejecutar el modal ---
              let accionPendiente = sessionStorage.getItem("autoAbrirModal");
              if (accionPendiente) {
                // Buscamos el botón en la nueva pantalla que acaba de cargar
                let botonParaAbrir = document.getElementById(accionPendiente);

                if (botonParaAbrir) {
                  // Le damos medio segundo de respiro para que termine de armar la tabla antes de abrir el modal
                  setTimeout(() => {
                    botonParaAbrir.click();
                  }, 400);
                  // Borramos la nota para que no se siga abriendo a cada rato
                  sessionStorage.removeItem("autoAbrirModal");
                }
              }
            }
          });
        }
      }

      // Si das clic a "Inicio" y el dashboard se inyectó, ¡Forzamos actualización inmediata!
      if (dashboardRecienInyectado) {
        actualizarDashboard();

        // Aseguramos que el cronómetro siga corriendo cada 10 seg
        if (!intervaloDashboard) {
          intervaloDashboard = setInterval(actualizarDashboard, 10000);
        }
      }

      // Si cambiaste de módulo y el dashboard desapareció, apagamos el motor
      if (!document.querySelector("#dashboard")) {
        if (intervaloDashboard) {
          clearInterval(intervaloDashboard);
          intervaloDashboard = null;
        }
      }
    });

    // Encendemos el observador
    observer.observe(contentArea, { childList: true, subtree: true });

    // Delegación de clic para simular clics en el menú lateral (Tarjetas y Botones)
    contentArea.addEventListener("click", function (event) {
      // Ahora buscamos si el clic fue en una tarjeta (.card) O en un botón (.btn-accion) ultimas orden reciente
      let elementoClickeado = event.target.closest(
        ".card, .btn-accion, .fila-orden-reciente",
      );

      if (
        elementoClickeado &&
        elementoClickeado.getAttribute("data-menu-link")
      ) {
        let linkId = elementoClickeado.getAttribute("data-menu-link");
        let menuLink = document.getElementById(linkId);

        // --- TRUCO UX: Dejar nota secreta para abrir el modal ---
        if (elementoClickeado.classList.contains("btn-nueva-orden")) {
          sessionStorage.setItem("autoAbrirModal", "btn-crear-orden");
        } else if (elementoClickeado.classList.contains("btn-nuevo-cliente")) {
          sessionStorage.setItem("autoAbrirModal", "btn-crear-cliente");
        }

        // Guardar el filtro en la memoria temporal (Si es que tiene uno)
        let filtro = elementoClickeado.getAttribute("data-filtro");
        if (filtro) {
          sessionStorage.setItem("filtroDashboard", filtro);
        } else {
          sessionStorage.removeItem("filtroDashboard");
        }

        // Hacemos el clic virtual en el menú lateral
        if (menuLink) {
          menuLink.click();
        } else {
          console.warn(
            "El enlace del menú con ID '" + linkId + "' no existe aún.",
          );
        }
      }
    });
  }
});
