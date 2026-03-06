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

        let cardElements = document.querySelectorAll(
          "#dashboard-cards .card-numeros",
        );
        if (cardElements.length >= 6) {
          cardElements[0].textContent = data.opendientes || 0;
          cardElements[1].textContent = data.olistas || 0;
          cardElements[2].textContent = data.productos || 0;
          cardElements[3].textContent = data.clientes || 0;
          cardElements[4].textContent = data.proveedores || 0;
          cardElements[5].textContent = data.ventas || 0;
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

    // Delegación de clic para simular clics en el menú lateral
    contentArea.addEventListener("click", function (event) {
      let card = event.target.closest(".card");
      if (card && card.getAttribute("data-menu-link")) {
        let linkId = card.getAttribute("data-menu-link");
        let menuLink = document.getElementById(linkId);

        //  Guardar el filtro en la memoria temporal ---
        let filtro = card.getAttribute("data-filtro");
        if (filtro) {
          sessionStorage.setItem("filtroDashboard", filtro);
        } else {
          sessionStorage.removeItem("filtroDashboard"); // Limpiar si no hay filtro
        }

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
