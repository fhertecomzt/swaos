<?php
session_start();
require '../conexion.php';
header('Content-Type: application/json');

try {
  // GUARDIA DE SEGURIDAD
  $id_taller_sesion = $_SESSION['taller_id'] ?? 1;

  // Buscamos todas las citas filtrando por la sucursal actual
  $sql = "SELECT c.*, cli.nombre_cliente, cli.papellido_cliente, cli.tel_cliente 
            FROM citas c 
            LEFT JOIN clientes cli ON c.id_cliente = cli.id_cliente 
            WHERE c.estatus != 'Cancelada' AND c.id_taller = ?"; // <-- EL CANDADO

  // Cambiamos query() por prepare() y execute() por seguridad
  $stmt = $dbh->prepare($sql);
  $stmt->execute([$id_taller_sesion]);
  $citas = $stmt->fetchAll(PDO::FETCH_ASSOC);

  $eventos = [];

  $llave_secreta = "SWAOS_S3CR3T_2026_!#"; // La misma llave maestra de tu sistema

  foreach ($citas as $cita) {
    // Armamos un título limpio para el calendario
    $nombre = !empty($cita['nombre_cliente']) ? $cita['nombre_cliente'] . ' ' . $cita['papellido_cliente'] : 'Cliente Express';
    $titulo = $cita['tipo_cita'] . ' - ' . $nombre;

    // Generamos el token único para esta cita
    $token_cita = hash('sha256', $cita['id_cita'] . $llave_secreta);

    // Construimos UN SOLO bloque exacto que FullCalendar necesita
    $eventos[] = [
      'id' => $cita['id_cita'],
      'title' => $titulo,
      'start' => $cita['fecha_inicio'],
      'end' => $cita['fecha_fin'],
      'color' => $cita['color_evento'],
      'extendedProps' => [
        'id_cliente' => $cita['id_cliente'], 
        'cliente' => $nombre,
        'telefono' => $cita['tel_cliente'] ?? '',
        'tipo' => $cita['tipo_cita'],
        'motivo' => $cita['motivo'],
        'direccion' => $cita['direccion_visita'],
        'estatus' => $cita['estatus'],
        'token' => $token_cita, // Token enviado con éxito
        'nombre_empresa' => $_SESSION['nombre_t'] ?? 'Taller de computadoras'
      ]
    ];
  }

  // Imprimimos la lista limpia y terminamos
  echo json_encode($eventos);
} catch (Exception $e) {
  echo json_encode(['error' => 'Error al cargar citas: ' . $e->getMessage()]);
}
