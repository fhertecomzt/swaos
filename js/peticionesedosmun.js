const cbxEstado = document.getElementById("estado");
const cbxMunicipio = document.getElementById("municipio");
const cbxColonia = document.getElementById("colonia");
const cbxCP = document.getElementById("codigo_postal");

cbxEstado.addEventListener("change", getMunicipios);
cbxMunicipio.addEventListener("change", getColonias);
cbxColonia.addEventListener("change", getCodigoPostal);

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

function getMunicipios() {
  let estado = cbxEstado.value;
  if (!estado) return;

  let url = "../funciones/getMunicipios.php";
  let formData = new FormData();
  formData.append("estado", estado);

  fetchAndSetdata(url, formData, cbxMunicipio);
}

function getColonias() {
  let municipio = cbxMunicipio.value;
  if (!municipio) return;
  let url = "../funciones/getColonias.php";
  let formData = new FormData();
  formData.append("municipio", municipio); // Enviar el ID del municipio
  fetchAndSetdata(url, formData, cbxColonia);
}

function getCodigoPostal() {
  // Limpiamos los resultados anteriores
  cbxCP.innerHTML = "<option value=''>Seleccionar</option>";

  let colonia = cbxColonia.value;
  if (!colonia) return;

  let url = "../funciones/getCodigoPostal.php"; // Ruta al script de PHP creado
  let formData = new FormData();
  formData.append("colonia", colonia); // Enviar el ID de la Colonia

  // Usar la función genérica para hacer el fetch y llenar el select del CP
  fetchAndSetdata(url, formData, cbxCP).catch((err) =>
    console.error("Error cargando Código Postal:", err)
  );
}
