document.addEventListener("DOMContentLoaded", () => {
  // =========================================================
  // 1. CONTROL DEL MENÚ HAMBURGUESA PARA MÓVILES
  // =========================================================
  const menuToggle = document.getElementById("mobile-menu");
  const navLinksContainer = document.getElementById("nav-links");

  if (menuToggle && navLinksContainer) {
    const iconoMenu = menuToggle.querySelector("i");

    // Abrir / Cerrar al tocar el icono
    menuToggle.addEventListener("click", () => {
      navLinksContainer.classList.toggle("nav-active");

      // Cambiamos el icono de Hamburguesa (☰) a una Tachita (X)
      if (navLinksContainer.classList.contains("nav-active")) {
        iconoMenu.classList.remove("fa-bars");
        iconoMenu.classList.add("fa-xmark");
      } else {
        iconoMenu.classList.remove("fa-xmark");
        iconoMenu.classList.add("fa-bars");
      }
    });

    // Cerrar el menú automáticamente al tocar cualquier opción en celular
    const todosLosLinks = navLinksContainer.querySelectorAll("a");
    todosLosLinks.forEach((link) => {
      link.addEventListener("click", () => {
        if (window.innerWidth <= 850) {
          navLinksContainer.classList.remove("nav-active");
          if (iconoMenu) {
            iconoMenu.classList.remove("fa-xmark");
            iconoMenu.classList.add("fa-bars");
          }
        }
      });
    });
  }

  // =========================================================
  // 2. INTERACTIVIDAD EN TARJETAS DE LÍNEA DE TIEMPO (SWAOS)
  // =========================================================
  const timelineCards = document.querySelectorAll(".timeline-card");

  if (timelineCards.length > 0) {
    timelineCards.forEach((card) => {
      card.addEventListener("click", function () {
        // Removemos la clase active de todas las tarjetas
        timelineCards.forEach((c) => c.classList.remove("active"));
        // Encendemos la tarjeta tocada
        this.classList.add("active");
      });
    });
  }

  // =========================================================
  // 3. CONTROL INTELIGENTE DE MENÚ ACTIVO (LÍNEA AMARILLA)
  // =========================================================
  const navLinks = document.querySelectorAll(".nav-links a");
  const secciones = document.querySelectorAll(".seccion-pantalla, #contacto");
  let clicEnMenu = false;
  let timerClic;

  if (navLinks.length > 0 && secciones.length > 0) {
    // A) Al hacer clic, encendemos la línea y pausamos el observador 1 segundo
    navLinks.forEach((link) => {
      link.addEventListener("click", function () {
        clicEnMenu = true;
        clearTimeout(timerClic);

        navLinks.forEach((l) => l.classList.remove("active"));
        this.classList.add("active");

        timerClic = setTimeout(() => {
          clicEnMenu = false;
        }, 1000); // 1 segundo mientras termina el scroll suave
      });
    });

    // B) Observador automático: Detecta qué sección ocupa el centro de la pantalla
    const opcionesObservador = {
      root: null,
      rootMargin: "-30% 0px -30% 0px", // Se activa cuando la sección toca el 40% central
      threshold: 0,
    };

    const observador = new IntersectionObserver((entradas) => {
      if (clicEnMenu) return; // Si el usuario acaba de hacer clic, no interrumpir

      entradas.forEach((entrada) => {
        if (entrada.isIntersecting) {
          const idSeccion = entrada.target.getAttribute("id");

          navLinks.forEach((link) => {
            link.classList.remove("active");
            if (link.getAttribute("href") === `#${idSeccion}`) {
              link.classList.add("active");
            }
          });
        }
      });
    }, opcionesObservador);

    // Poner a vigilar todas las secciones
    secciones.forEach((seccion) => observador.observe(seccion));
  }
});
