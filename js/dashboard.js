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

        // ACTUALIZAR LAS TARJETAS (Con IDs blindados)
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

        // TARJETAS FINANCIERAS (Con formato de Moneda)
        let elVentasTotales = document.getElementById("dash-ventas-totales");
        let elEfectivoCaja = document.getElementById("dash-efectivo-caja");
        let elIngresosBanco = document.getElementById("dash-ingresos-banco");

        if (elVentasTotales) {
          elVentasTotales.textContent = parseFloat(
            data.ventas_totales,
          ).toLocaleString("es-MX", { style: "currency", currency: "MXN" });
        }
        if (elEfectivoCaja) {
          elEfectivoCaja.textContent = parseFloat(
            data.efectivo_caja,
          ).toLocaleString("es-MX", { style: "currency", currency: "MXN" });
        }
        if (elIngresosBanco) {
          elIngresosBanco.textContent = parseFloat(
            data.ingresos_banco,
          ).toLocaleString("es-MX", { style: "currency", currency: "MXN" });
        }
        // DIBUJAR LA GRÁFICA DE DONA CON COLORES INTELIGENTES
        let canvasElement = document.getElementById("miGraficaEquipos");
        if (canvasElement && data.grafica) {
          let etiquetas = data.grafica.map((item) => item.estado);
          let valores = data.grafica.map((item) => item.total);

          // Lógica para asignar el color correcto según el nombre del estado
          let coloresInteligentes = etiquetas.map((estado) => {
            let est = estado.toLowerCase();
            if (est.includes("entregado")) return "#198754"; // Verde éxito
            if (est.includes("cancelado")) return "#dc3545"; // Rojo peligro
            if (est.includes("terminado")) return "#0dcaf0"; // Cyan / Azul claro
            if (
              est.includes("revisión") ||
              est.includes("revision") ||
              est.includes("pendiente")
            )
              return "#ffc107"; // Amarillo alerta
            return "#6c757d"; // Gris por defecto
          });

          if (
            window.miGraficaInstancia &&
            window.miGraficaInstancia.ctx.canvas === canvasElement
          ) {
            window.miGraficaInstancia.data.labels = etiquetas;
            window.miGraficaInstancia.data.datasets[0].data = valores;
            window.miGraficaInstancia.data.datasets[0].backgroundColor =
              coloresInteligentes; // Actualizamos colores
            window.miGraficaInstancia.update();
          } else {
            if (window.miGraficaInstancia) window.miGraficaInstancia.destroy();

            window.miGraficaInstancia = new Chart(
              canvasElement.getContext("2d"),
              {
                type: "doughnut",
                data: {
                  labels: etiquetas,
                  datasets: [
                    {
                      data: valores,
                      backgroundColor: coloresInteligentes, // Usamos nuestros colores asignados
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

        // LLENAR LA TABLA DE ÚLTIMAS ÓRDENES CON BADGES
        let tbody = document.getElementById("tabla-ultimas-ordenes");
        if (tbody && data.ultimas_ordenes) {
          tbody.innerHTML = "";

          if (data.ultimas_ordenes.length === 0) {
            tbody.innerHTML =
              '<tr><td colspan="3" style="text-align:center;">No hay órdenes recientes</td></tr>';
          } else {
            data.ultimas_ordenes.forEach((orden) => {
              // Lógica para el badge (Etiqueta visual)
              let estadoStr = orden.estado.toUpperCase();
              let badgeHtml = "";

              if (estadoStr.includes("ENTREGADO")) {
                badgeHtml = `<span style="background: #d1e7dd; color: #0f5132; padding: 3px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;"><i class="fa-solid fa-check-circle"></i> ${orden.estado}</span>`;
              } else if (estadoStr.includes("CANCELADO")) {
                badgeHtml = `<span style="background: #f8d7da; color: #842029; padding: 3px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;"><i class="fa-solid fa-ban"></i> ${orden.estado}</span>`;
              } else {
                badgeHtml = `<span style="background: #cff4fc; color: #055160; padding: 3px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;"><i class="fa-solid fa-spinner"></i> ${orden.estado}</span>`;
              }

              let fila = `<tr class="fila-orden-reciente" data-menu-link="ordenes-link" data-filtro="${orden.id_orden}" style="cursor: pointer; transition: 0.2s;">
                        <td style="vertical-align: middle;"><strong style="color: #0d6efd;">#${orden.id_orden}</strong></td>
                        <td style="vertical-align: middle;">${orden.cliente}</td>
                        <td style="vertical-align: middle;">${badgeHtml}</td>
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

        // UX: Dejar nota secreta para abrir el modal
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
