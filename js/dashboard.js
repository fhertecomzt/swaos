document.addEventListener("DOMContentLoaded", function () {
  let intervaloDashboard = null;
  let actualizandoDashboard = false; // Bandera para controlar la actualización

  function actualizarDashboard() {
    if (actualizandoDashboard) {
      return; // Si ya estamos actualizando, no hacer nada
    }
    actualizandoDashboard = true;
    fetch("../php/funciones/api_dashboard.php")
      .then((response) => response.json())
      .then((data) => {
        let cardElements = document.querySelectorAll(".card .card-numeros");
        if (cardElements.length >= 3) {
          cardElements[0].textContent = data.opendientes;
          cardElements[1].textContent = data.olistas;
          cardElements[2].textContent = data.productos;
          cardElements[3].textContent = data.clientes;
          cardElements[4].textContent = data.proveedores;
          cardElements[5].textContent = data.ventas;
        }
      })
      .catch((error) => console.error("Error al obtener los datos:", error))
      .finally(() => {
        actualizandoDashboard = false; // Resetear la bandera después de la petición
      });
  }

  const observer = new MutationObserver(() => {
    let dashboard = document.querySelector("#dashboard");
    if (dashboard) {
      actualizarDashboard(); // Llamar a actualizarDashboard cuando el dashboard se encuentra
      if (!intervaloDashboard) {
        intervaloDashboard = setInterval(actualizarDashboard, 10000);//Cada 10 segundos
      }
    } else {
      if (intervaloDashboard) {
        clearInterval(intervaloDashboard);
        intervaloDashboard = null;
      }
    }
  });

  observer.observe(document.getElementById("content-area"), {
    childList: true,
    subtree: true,
  });

  // **Delegación de eventos para abrir páginas al hacer clic en una card**
  document
    .getElementById("content-area")
    .addEventListener("click", function (event) {
      let card = event.target.closest(".card");
      if (card && card.getAttribute("data-page")) {
        let page = card.getAttribute("data-page");
        fetch(page)
          .then((response) => response.text())
          .then((data) => {
            document.getElementById("content-area").innerHTML = data;
          })
          .catch((error) => console.error("Error al cargar la página:", error));
      }
    });
});
