document.addEventListener("DOMContentLoaded", function () {
  const bdark = document.querySelector("#btndarkmode");
  const icon = bdark.querySelector("i"); // Icono dentro del botón
  const title = document.querySelector(".darkmode_title"); // Texto "Modo oscuro"
  const contentArea = document.querySelector("#content-area"); // Área donde se carga el contenido dinámico

  const elements = [
    document.querySelector(".navbar"),
    document.querySelector(".main--content"),
    document.querySelector(".header--wrapper"),
    document.querySelector(".header--title"),
    document.querySelector(".darkmode_title"),
    document.querySelector(".darkmodebtn i"),
    contentArea, // Se asegura de aplicar el modo oscuro al contenedor dinámico
  ];

  // Cargar estado inicial
  loadDarkMode();

  // Evento al hacer clic en el botón de modo oscuro
  bdark.addEventListener("click", function () {
    document.body.classList.toggle("darkmode"); // Alternar modo oscuro
    const isDark = document.body.classList.contains("darkmode"); // Revisar estado actual

    elements.forEach((el) => el?.classList.toggle("darkmode")); // Aplicar a los elementos

    updateIcon(isDark); // Cambia el icono según el estado
    updateText(isDark); // Cambia el texto
    storeDarkMode(isDark); // Guarda el estado en localStorage
  });

  function loadDarkMode() {
    const darkmode = localStorage.getItem("darkmode") === "true"; // Obtener el estado guardado

    if (darkmode) {
      document.body.classList.add("darkmode");
      elements.forEach((el) => el?.classList.add("darkmode"));
      updateIcon(true);
      updateText(true);
    } else {
      document.body.classList.remove("darkmode");
      elements.forEach((el) => el?.classList.remove("darkmode"));
      updateIcon(false);
      updateText(false);
    }
  }

  function storeDarkMode(value) {
    localStorage.setItem("darkmode", value);
  }

  function updateIcon(isDark) {
    if (isDark) {
      icon.classList.remove("fa-moon");
      icon.classList.add("fa-sun");
    } else {
      icon.classList.remove("fa-sun");
      icon.classList.add("fa-moon");
    }
  }

  function updateText(isDark) {
    title.textContent = isDark ? "Modo oscuro" : "Modo claro";
  }
});
