const pass = document.getElementById("pass"),
  icon = document.querySelector(".bx");

// Ocultar el icono inicialmente
// icon.style.display = "none";

// Mostrar el icono cuando el usuario comience a escribir
pass.addEventListener("input", () => {
  if (pass.value.length > 0) {
    icon.style.display = "inline"; // Muestra el ícono
  } else {
    icon.style.display = "none"; // Oculta el ícono si el campo está vacío
  }
});

// Mostrar la contraseña al presionar el ícono
icon.addEventListener("mousedown", () => {
  pass.type = "text";
  icon.classList.remove("fa-eye");
  icon.classList.add("fa-eye-slash");
  icon.style.color = "red";
});

// Ocultar la contraseña al soltar el clic o salir del ícono
const hidePassword = () => {
  pass.type = "password";
  icon.classList.add("fa-eye");
  icon.classList.remove("fa-eye-slash");
  icon.style.color = "black";
};

icon.addEventListener("mouseup", hidePassword);
icon.addEventListener("mouseleave", hidePassword);
