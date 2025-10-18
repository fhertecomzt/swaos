
// Event Delegation: Escuchamos un solo evento 'change' en todo el documento.
document.addEventListener("change", function (e) {
  const targetId = e.target.id;
  const targetElement = e.target;

  // Verificamos cuál de nuestros elementos disparó el evento.
  switch (targetId) {
    case "estado":
      getMunicipios(targetElement);
      // Al cambiar Estado, reseteamos Municipio, Colonia y CP.
      document.getElementById("municipio").innerHTML =
        "<option value=''>Seleccionar</option>";
      document.getElementById("colonia").innerHTML =
        "<option value=''>Seleccionar</option>";
      document.getElementById("codigo_postal").value = "";
      break;

    case "municipio":
      getColonias(targetElement);
      // Al cambiar Municipio, reseteamos Colonia y CP.
      document.getElementById("colonia").innerHTML =
        "<option value=''>Seleccionar</option>";
      document.getElementById("codigo_postal").value = "";
      break;

    case "colonia":
      getCodigoPostal(targetElement);
      // Al cambiar Colonia, limpiamos el CP antes de llenarlo.
      document.getElementById("codigo_postal").value = "";
      break;
  }
});

function fetchAndSetdata(url, formData, targetElement) {
  return fetch(url, {
    method: "POST",
    body: formData,
  })
    .then((response) => response.json())
    .then((data) => {
      // Limpiamos los resultados anteriores
      targetElement.innerHTML = "<option value=''>Seleccionar</option>";

      data.forEach((mun) => {
        const option = document.createElement("option");
        option.value = mun.id;
        option.textContent = mun.nombre;
        targetElement.appendChild(option);
      });
    })
    .catch((err) => console.error("Error cargando municipios:", err));
}

// Recibe el elemento que disparó el cambio (el SELECT de Estado)
function getMunicipios(targetSelect) {
  let estado = targetSelect.value; // Obtenemos el valor del elemento que cambió
  if (!estado) return;

  let url = "funciones/getMunicipios.php";
  let formData = new FormData();
  formData.append("estado", estado);

  // Pasamos el SELECT de Municipio como elemento objetivo a llenar
  const cbxMunicipio = document.getElementById("municipio");
  fetchAndSetdata(url, formData, cbxMunicipio);
}

// Recibe el elemento que disparó el cambio (el SELECT de Municipio)
function getColonias(targetSelect) {
  let municipio = targetSelect.value;
  if (!municipio) return;

  let url = "funciones/getColonias.php"; // <--- Asegúrate que esta URL es correcta
  let formData = new FormData();
  formData.append("municipio", municipio);

  // Pasamos el SELECT de Colonia como elemento objetivo a llenar
  const cbxColonia = document.getElementById("colonia");
  fetchAndSetdata(url, formData, cbxColonia);
}

// Recibe el elemento que disparó el cambio (el SELECT de Colonia)
function getCodigoPostal(targetSelect) {
    const inputCP = document.getElementById("codigo_postal");
    inputCP.value = ""; // Limpiamos el input del CP antes de la solicitud

    let colonia = targetSelect.value;
    if (!colonia) return;

    let url = "funciones/getCodigoPostal.php"; // La ruta del script PHP
    let formData = new FormData();
    formData.append("colonia", colonia); // Enviamos el ID de la Colonia

    // Hacemos el fetch para obtener el CP
    fetch(url, {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.codigo_postal) {
          inputCP.value = data.codigo_postal;
        }
      })
      .catch((err) => console.error("Error cargando Código Postal:", err));
}
