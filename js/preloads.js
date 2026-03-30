// ==========================================
// CONTROL DEL PRELOADER GLOBAL
// ==========================================
window.mostrarPreloader = function () {
  const preloader = document.getElementById("swaos-preloader");
  if (preloader) {
    // Quitamos la clase que lo oculta (ajusta el nombre si usas otra)
    preloader.classList.remove("fade-out", "oculto");

    // Forzamos a que se vea de nuevo
    preloader.style.display = "flex";
    preloader.style.opacity = "1";
    preloader.style.pointerEvents = "all"; // Bloquea clics por detrás
  }
};

window.ocultarPreloader = function () {
  const preloader = document.getElementById("swaos-preloader");
  if (preloader) {
    // Le volvemos a poner tu clase de desvanecimiento
    preloader.classList.add("fade-out"); // O la clase que usaste en ad.php

    // Esperamos medio segundo a que termine la animación para apagarlo del todo
    setTimeout(() => {
      preloader.style.display = "none";
    }, 10);
  }
};
