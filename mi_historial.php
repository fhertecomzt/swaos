<?php
// Incluimos el nuevo verificador de sesión y tiempo
require 'php/verificar_sesion_cliente.php';
require 'php/conexion.php';

$id_cliente = $_SESSION['id_cliente_portal'];
$nombre_cliente = $_SESSION['nombre_cliente_portal'];
$papellido_cliente = $_SESSION['papellido_cliente_portal'];


try {
  // EXTRAER EL HISTORIAL DE ÓRDENES DEL CLIENTE
  $sqlOrdenes = "SELECT o.id_orden, o.fecha_entrega_estimada, o.costo_servicio, o.token_hash,
                          IFNULL(e.nombre_equipo, 'Equipo') as nombre_equipo, 
                          IFNULL(m.nom_marca, '') as nom_marca, 
                          IFNULL(es.estado_servicio, 'Desconocido') as estado
                   FROM ordenesservicio o
                   LEFT JOIN equipos e ON o.id_equipo = e.id_equipo
                   LEFT JOIN marcas m ON o.id_marca = m.id_marca
                   LEFT JOIN estadosservicios es ON o.id_estado_servicio = es.id_estado_servicio
                   WHERE o.id_cliente = ?
                   ORDER BY o.id_orden DESC";

  $stmt = $dbh->prepare($sqlOrdenes);
  $stmt->execute([$id_cliente]);
  $ordenes = $stmt->fetchAll(PDO::FETCH_ASSOC);

  // MATEMÁTICAS PARA EL RESUMEN
  $total_gastado = 0;
  $ordenes_activas = 0;

  foreach ($ordenes as $ord) {
    $estado = strtolower($ord['estado']);

    // Sumamos el dinero solo si NO está cancelada
    if (strpos($estado, 'cancelado') === false) {
      $total_gastado += floatval($ord['costo_servicio']);
    }

    // Es una Orden Activa solo si NO está Entregada y NO está Cancelada
    if (strpos($estado, 'entregado') === false && strpos($estado, 'cancelado') === false) {
      $ordenes_activas++;
    }
  }
} catch (PDOException $e) {
  die("Error de conexión: " . $e->getMessage());
}
?>

<!DOCTYPE html>
<html lang="es">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Mi Historial | SWAOS</title>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
  <link rel="stylesheet" href="https://cdn.datatables.net/1.13.6/css/jquery.dataTables.min.css">
  <link rel="icon" type="image/x-icon" href="imgs/favicon/favicon.ico">

  <style>
    body {
      font-family: 'Arial', sans-serif;
      background-color: #e2e8f0;
      /* Un gris-azulado más profundo y relajante */
      margin: 0;
      padding: 20px;
      color: #333;
    }

    .container {
      max-width: 1000px;
      margin: 0 auto;
    }

    /* Header del Portal con un toque Premium */
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: linear-gradient(135deg, #0d6efd 0%, #00d2ff 100%);
      /* Degradado Azul */
      padding: 20px 25px;
      border-radius: 12px;
      box-shadow: 0 4px 15px rgba(13, 110, 253, 0.2);
      margin-bottom: 25px;
    }

    .header h2 {
      margin: 0;
      color: #ffffff;
      font-size: 1.6rem;
      text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
    }

    .btn-logout {
      background: rgba(255, 255, 255, 0.2);
      color: white;
      text-decoration: none;
      padding: 8px 15px;
      border-radius: 6px;
      font-weight: bold;
      font-size: 14px;
      transition: 0.3s;
      border: 1px solid rgba(255, 255, 255, 0.4);
    }

    .btn-logout:hover {
      background: #dc3545;
      border-color: #dc3545;
    }

    /* Tarjetas de Resumen */
    .cards-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin-bottom: 25px;
    }

    .card {
      background: white;
      padding: 20px;
      border-radius: 12px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
      /* Sombra más suave */
      display: flex;
      align-items: center;
      gap: 15px;
      border-bottom: 4px solid #007bff;
      /* Cambiamos el borde al fondo para más sutileza */
    }

    .card i {
      font-size: 35px;
      color: #007bff;
      opacity: 0.8;
    }

    .card-info h3 {
      margin: 0;
      font-size: 24px;
      color: #333;
    }

    .card-info p {
      margin: 0;
      font-size: 13px;
      color: #777;
      text-transform: uppercase;
      font-weight: bold;
    }

    /* Tabla de Historial */
    .tabla-container {
      background: white;
      padding: 20px;
      border-radius: 12px;
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
      overflow-x: auto;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      min-width: 600px;
    }

    th,
    td {
      padding: 12px;
      text-align: left;
      border-bottom: 1px solid #eee;
      font-size: 14px;
    }

    th {
      color: #555;
      font-weight: bold;
      background-color: #f8f9fa;
    }

    .badge {
      padding: 4px 10px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: bold;
    }

    .badge-success {
      background: #d1e7dd;
      color: #0f5132;
    }

    .badge-warning {
      background: #fff3cd;
      color: #856404;
    }

    .badge-danger {
      background: #f8d7da;
      color: #842029;
    }

    .btn-ver {
      background: #17a2b8;
      color: white;
      padding: 5px 10px;
      border-radius: 5px;
      text-decoration: none;
      font-size: 12px;
      font-weight: bold;
    }

    .btn-ver:hover {
      background: #138496;
    }
  </style>
</head>

<body>

  <div class="container">
    <div class="header">
      <h2><i class="fa-solid fa-user-check"></i> Hola, <?php echo htmlspecialchars($nombre_cliente); ?> <?php echo htmlspecialchars($papellido_cliente); ?></h2>
      <a href="logout_portal.php" class="btn-logout"><i class="fa-solid fa-right-from-bracket"></i> Salir</a>
    </div>

    <div class="cards-grid">
      <div class="card" style="border-left-color: #28a745;">
        <i class="fa-solid fa-sack-dollar" style="color: #28a745;"></i>
        <div class="card-info">
          <h3>$<?php echo number_format($total_gastado, 2); ?></h3>
          <p>Inversión Total</p>
        </div>
      </div>
      <div class="card" style="border-left-color: #007bff;">
        <i class="fa-solid fa-laptop-medical" style="color: #007bff;"></i>
        <div class="card-info">
          <h3><?php echo count($ordenes); ?></h3>
          <p>Equipos Registrados</p>
        </div>
      </div>
      <div class="card" style="border-left-color: #ffc107;">
        <i class="fa-solid fa-clock-rotate-left" style="color: #ffc107;"></i>
        <div class="card-info">
          <h3><?php echo $ordenes_activas; ?></h3>
          <p>Órdenes Activas</p>
        </div>
      </div>
    </div>

    <div class="tabla-container">
      <h3 style="margin-top:0; color:#333;"><i class="fa-solid fa-list-check"></i> Historial de Servicios</h3>
      <table id="tabla-historial">
        <thead>
          <tr>
            <th>Folio</th>
            <th>Equipo</th>
            <th>Estado</th>
            <th>Costo</th>
            <th>Acción</th>
          </tr>
        </thead>
        <tbody>
          <?php if (count($ordenes) === 0): ?>
            <tr>
              <td colspan="5" style="text-align:center;">Aún no tienes historial de servicios con nosotros.</td>
            </tr>
          <?php else: ?>
            <?php foreach ($ordenes as $ord):
              $estadoStr = strtoupper($ord['estado']);
              $badgeClass = 'badge-warning'; // Por defecto pendiente/revisión
              if (strpos($estadoStr, 'ENTREGADO') !== false) $badgeClass = 'badge-success';
              if (strpos($estadoStr, 'CANCELADO') !== false) $badgeClass = 'badge-danger';
            ?>
              <tr>
                <td style="color:#007bff; font-weight:bold;">#<?php echo $ord['id_orden']; ?></td>
                <td><?php echo htmlspecialchars($ord['nombre_equipo'] . ' ' . $ord['nom_marca']); ?></td>
                <td><span class="badge <?php echo $badgeClass; ?>"><?php echo $estadoStr; ?></span></td>
                <td>$<?php echo number_format($ord['costo_servicio'], 2); ?></td>
                <td>
                  <a href="track.php?t=<?php echo $ord['token_hash']; ?>" class="btn-ver" target="_blank">Ver Detalles <i class="fa-solid fa-arrow-up-right-from-square"></i></a>
                </td>
              </tr>
            <?php endforeach; ?>
          <?php endif; ?>
        </tbody>
      </table>
    </div>
  </div>

  <script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
  <script src="https://cdn.datatables.net/1.13.6/js/jquery.dataTables.min.js"></script>
  <script>
    $(document).ready(function() {
      $('#tabla-historial').DataTable({
        "language": {
          "url": "https://cdn.datatables.net/plug-ins/1.13.6/i18n/es-ES.json"
        },
        "pageLength": 10, // Mostrar 10 registros por página
        "ordering": false, // Apagamos el ordenamiento automático para respetar el de tu SQL (los más nuevos primero)
        "lengthChange": false // Oculta el selector de "Mostrar X registros" para que se vea más limpio
      });
    });
  </script>
  <script>
    let vigilanteInactividad = function() {
      let tiempo;
      // 5 minutos en milisegundos (300 segundos * 1000)
      const limiteMilisegundos = 300000;

      // Función que expulsa al usuario
      function expulsarAutomaticamente() {
        // Hacemos que JS cierre la sesión llamando a un archivo que limpie todo 
        // o redirigiendo directo si confiamos en el PHP.
        // Lo más seguro es redirigir a tu logout_portal.php con un aviso
        window.location.href = 'logout_portal.php?motivo=inactividad';
      }

      // Función que reinicia el reloj cada vez que hay actividad
      function reiniciarReloj() {
        clearTimeout(tiempo);
        tiempo = setTimeout(expulsarAutomaticamente, limiteMilisegundos);
      }

      // Eventos que reinician el reloj (Movimiento de ratón, clics, teclado, pantalla táctil)
      window.onload = reiniciarReloj;
      document.onmousemove = reiniciarReloj;
      document.onclick = reiniciarReloj;
      document.onkeypress = reiniciarReloj;
      document.ontouchstart = reiniciarReloj; // ¡Importante para celulares!
      document.onscroll = reiniciarReloj;
    };

    // Encendemos al vigilante
    vigilanteInactividad();
  </script>
</body>

</html>