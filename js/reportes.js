// FUNCIÓN MAESTRA DE REPORTES 
function generarReporte() {
  const tipo = document.getElementById("tipo_reporte").value;
  const fechaInicio = document.getElementById("fecha_inicio").value;
  const fechaFin = document.getElementById("fecha_fin").value;
  const contenedor = document.getElementById("contenedor-tabla-reporte");

  // Destruimos la tabla vieja para que DataTables no enloquezca
  if ($.fn.DataTable.isDataTable("#tabla-dinamica")) {
    $("#tabla-dinamica").DataTable().destroy();
  }
  //Alerta fechas
  if (fechaInicio > fechaFin) {
    Swal.fire({
      icon: "warning",
      title: "Rango inválido",
      text: "La Fecha de Inicio no puede ser mayor a la Fecha de Fin.",
      confirmButtonColor: "#0094fd",
    });
    return;
  }

  contenedor.innerHTML =
    '<p style="text-align:center; padding: 20px;"><i class="fa-solid fa-spinner fa-spin fa-2x"></i><br>Generando reporte...</p>';

  fetch("../php/cruds/procesar_reportes.php", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      tipo_reporte: tipo,
      fecha_inicio: fechaInicio,
      fecha_fin: fechaFin,
    }),
  })
    .then((response) => {
      if (!response.ok) throw new Error("Falla HTTP en PHP");
      return response.json();
    })
    .then((data) => {
      if (!data.success) {
        contenedor.innerHTML = `<p style="color:red; text-align:center;">Error: ${data.message}</p>`;
        return;
      }

      // Actualizamos los KPIs (Esto ya te estaba funcionando perfecto)
      document.getElementById("kpi_registros").innerText = data.registros;
      document.getElementById("kpi_total").innerText = data.total;

      if (data.registros === 0) {
        contenedor.innerHTML =
          '<p style="text-align:center; padding: 20px;">No se encontraron registros en este periodo.</p>';
        return;
      }

      // CONSTRUIR CABECERA DE LA TABLA
      let tablaHTML = `<table id="tabla-dinamica" class="display" style="width:100%"><thead><tr>`;

      if (tipo === "ordenes") {
        tablaHTML += `<th>Folio</th><th>Fecha</th><th>Cliente</th><th>Equipo</th><th>Estatus</th><th>Costo</th>`;
      } else if (tipo === "ventas") {
        tablaHTML += `<th>Ticket</th><th>Fecha</th><th>Cliente</th><th>Método de Pago</th><th>Total</th>`;
      } else if (tipo === "inventario") {
        tablaHTML += `<th>Código</th><th>Producto</th><th>Costo</th><th>Precio Venta</th><th>Stock Sistema</th>`;
      } else if (tipo === "conteo") {
        tablaHTML += `<th>Código</th><th>Producto</th><th>Ubicación / Anaquel</th><th>Conteo Físico Real</th><th>Notas / Estado</th>`;
      } else if (tipo === "caja") {
        tablaHTML += `<th>Fecha</th><th>Cajero / Usuario</th><th>Método de Pago</th><th>No. Transacciones</th><th>Total Ingresado</th>`;
      }

      tablaHTML += `</tr></thead><tbody>`;

      // LLENAR EL CUERPO DE LA TABLA
      data.data.forEach((fila) => {
        tablaHTML += `<tr>`;
        if (tipo === "ordenes") {
          tablaHTML += `<td><b>${fila.folio}</b></td>
                                  <td>${fila.fecha}</td>
                                  <td>${fila.cliente}</td>
                                  <td>${fila.equipo}</td>
                                  <td>${fila.estatus}</td>
                                  <td>${fila.costo}</td>`;
        } else if (tipo === "ventas") {
          tablaHTML += `<td style="color: #28a745;"><b>${fila.folio}</b></td>
                                  <td>${fila.fecha}</td>
                                  <td>${fila.cliente}</td>
                                  <td><span class="badge" style="background:#eee; padding:5px; border-radius:5px;">${fila.metodo}</span></td>
                                  <td><b>${fila.total}</b></td>`;
        } else if (tipo === "inventario") {
          let colorStock =
            fila.stock <= 5
              ? "color: #dc3545; font-weight: bold;"
              : "color: #198754; font-weight: bold;";
          tablaHTML += `<td><i class="fa-solid fa-barcode"></i> ${fila.codigo}</td>
                                  <td>${fila.producto}</td>
                                  <td>${fila.costo}</td>
                                  <td>${fila.venta}</td>
                                  <td style="${colorStock}; font-size: 16px;">${fila.stock}</td>`;
        } else if (tipo === "conteo") {
          tablaHTML += `<td><i class="fa-solid fa-barcode"></i> ${fila.codigo}</td>
                                  <td>${fila.producto}</td>
                                  <td style="border-bottom: 1px solid #ccc;"></td>
                                  <td style="border-bottom: 1px solid #ccc;"></td>
                                  <td style="border-bottom: 1px solid #ccc;"></td>`;
        } else if (tipo === "caja") {
          let colorMetodo = fila.metodo.toLowerCase().includes("tarjeta")
            ? "bg-primary text-white"
            : fila.metodo.toLowerCase().includes("transferencia")
              ? "bg-info text-white"
              : "bg-success text-white";

          tablaHTML += `<td><b>${fila.fecha}</b></td>
                                  <td><i class="fa-solid fa-user-tie text-muted"></i> ${fila.cajero}</td>
                                  <td><span class="badge ${colorMetodo}" style="padding:6px; border-radius:5px;">${fila.metodo}</span></td>
                                  <td style="text-align:center;">${fila.transacciones}</td>
                                  <td style="color: #28a745; font-size: 16px;"><b>${fila.total}</b></td>`;
        }
        tablaHTML += `</tr>`;
      });

      tablaHTML += `</tbody></table>`;
      contenedor.innerHTML = tablaHTML;

      // INYECTAR DATATABLES Y BOTONES DE IMPRESIÓN
      $("#tabla-dinamica").DataTable({
        destroy: true,
        language: {
          url: "https://cdn.datatables.net/plug-ins/1.13.6/i18n/es-ES.json",
        },
        // DISEÑO COMPACTO CON PAGINADOR
        pageLength: 5, // Mostramos solo 5 registros por página
        lengthMenu: [
          [5, 10, 25, 50, -1],
          [5, 10, 25, 50, "Todos"],
        ], // Menú para que el usuario pueda elegir ver más si lo desea
        ordering: true,
        dom: "Bfrtip",
        buttons: [
          {
            extend: "print",
            text: '<i class="fa-solid fa-print"></i> Imprimir',
            title: NOMBRE_TALLER_JS + " - Reporte de " + tipo.toUpperCase(),
            messageTop: "Periodo analizado: " + fechaInicio + " al " + fechaFin,
          },
          {
            extend: "pdfHtml5",
            text: '<i class="fa-solid fa-file-pdf" style="color:red;"></i> PDF',
            title: NOMBRE_TALLER_JS + " - Reporte de " + tipo.toUpperCase(),
            messageTop: "Periodo analizado: " + fechaInicio + " al " + fechaFin,
          },
          {
            extend: "excelHtml5",
            text: '<i class="fa-solid fa-file-excel" style="color:green;"></i> Excel',
            title: NOMBRE_TALLER_JS + " - Reporte de " + tipo.toUpperCase(),
            messageTop: "Periodo analizado: " + fechaInicio + " al " + fechaFin,
          },
        ],
      });
    })
    .catch((error) => {
      // Esto nos dirá exactamente la falla cuando cargue los reportes
      console.error("Error crítico atrapado por JS:", error);
      contenedor.innerHTML =
        '<p style="color:red; text-align:center;">Falla de renderizado. Revisa la consola (Presiona F12).</p>';
    });
}
