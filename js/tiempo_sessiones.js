// Configuración de tiempos (en milisegundos)
const TIEMPO_INACTIVIDAD = 30 * 60 * 1000; // 30 minutos totales
const TIEMPO_ADVERTENCIA = 60 * 1000; // Mostrar alerta 60 segundos antes de cerrar
// const TIEMPO_INACTIVIDAD = 60 * 1000; // 60 segundos total
// const TIEMPO_ADVERTENCIA = 15 * 1000; // Alerta a los 15 segundos
const TIEMPO_ESPERA_ALERTA = TIEMPO_INACTIVIDAD - TIEMPO_ADVERTENCIA;

let timerInactividad;
let alertaVisible = false; // Bandera para saber si el SweetAlert está abierto

document.addEventListener("DOMContentLoaded", () => {
  iniciarTemporizador();

  // Eventos que reinician el temporizador (solo si no hay alerta visible)
  const eventos = ["mousemove", "keypress", "click", "scroll"];
  eventos.forEach((evento) => {
    document.addEventListener(evento, () => {
      if (!alertaVisible) {
        reiniciarTemporizador();
      }
    });
  });
});

function iniciarTemporizador() {
  // Limpiamos cualquier timer previo
  if (timerInactividad) clearTimeout(timerInactividad);

  // Programamos la aparición de la alerta
  timerInactividad = setTimeout(() => {
    mostrarAlertaCierre();
  }, TIEMPO_ESPERA_ALERTA);
}

function reiniciarTemporizador() {
  // Solo reiniciamos si la alerta NO está en pantalla
  if (!alertaVisible) {
    iniciarTemporizador();
  }
}

function mostrarAlertaCierre() {
  alertaVisible = true; // Bloqueamos los reinicios por movimiento de mouse

  let tiempoRestante = TIEMPO_ADVERTENCIA / 1000; // Convertir a segundos para mostrar

  Swal.fire({
    title: "Tu sesión está por caducar",
    html: `Cerrando sesión en <b>${tiempoRestante}</b> segundos por inactividad.`,
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Mantener sesión",
    cancelButtonText: "Cerrar ahora",
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    timer: TIEMPO_ADVERTENCIA,
    timerProgressBar: true,
    allowOutsideClick: false, // Evita que den clic fuera para cerrar
    allowEscapeKey: false,
    didOpen: () => {
      const b = Swal.getHtmlContainer().querySelector("b");
      // Actualizar el contador cada segundo visualmente
      timerInterval = setInterval(() => {
        tiempoRestante--;
        if (b) {
          b.textContent = tiempoRestante;
        }
      }, 1000);
    },
    willClose: () => {
      clearInterval(timerInterval); // Limpiar el intervalo visual al cerrar
    },
  }).then((result) => {
    /*
      Manejo de resultados:
      1. Si confirma (Botón Azul): Reinicia sesión.
      2. Si el timer se acaba (dismiss === timer): Cierra sesión.
      3. Si cancela (Botón Rojo): Cierra sesión.
    */
    if (result.isConfirmed) {
      alertaVisible = false;
      iniciarTemporizador();
      // Opcional: Hacer un fetch pequeño al servidor para renovar la cookie de PHP
      fetch("verificar_sesion.php");

      Swal.fire({
        title: "Sesión extendida",
        text: "Puedes continuar trabajando.",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
    } else if (
      result.dismiss === Swal.DismissReason.timer ||
      result.dismiss === Swal.DismissReason.cancel
    ) {
      cerrarSesion();
    }
  });
}

function cerrarSesion() {
  window.location.href = "logout.php"; // Asegúrate que esta ruta sea correcta
}
