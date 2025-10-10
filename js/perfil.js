document.addEventListener("click", function (event) {
  const dropdownBtn = event.target.closest(".perfil-btn");
  const dropdown = document.getElementById("perfilDropdown");

  // Clic en el botón de perfil
  if (dropdownBtn) {
    dropdown.style.display =
      dropdown.style.display === "block" ? "none" : "block";
    return;
  }

  // Clic fuera del dropdown
  if (!event.target.closest(".perfil-dropdown")) {
    dropdown.style.display = "none";
  }
});
