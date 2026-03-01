<?php
session_start();
require "../conexion.php";

if (!isset($_GET['id'])) {
    die("Error: No se especificó una orden.");
}

$id_orden = intval($_GET['id']);

// Consultamos todos los datos de esta orden
$sql = "SELECT o.id_orden, o.creado_servicio, c.nombre_cliente, c.papellido_cliente, c.tel_cliente,
               e.nombre_equipo, o.modelo, o.falla, o.costo_servicio, o.anticipo_servicio, o.saldo_servicio,
               o.token_hash
        FROM ordenesservicio o
        JOIN clientes c ON o.id_cliente = c.id_cliente
        JOIN equipos e ON o.id_equipo = e.id_equipo
        WHERE o.id_orden = ?";
$stmt = $dbh->prepare($sql);
$stmt->execute([$id_orden]);
$orden = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$orden) {
    die("Error: Orden no encontrada.");
}

// Nombre del taller desde la sesión
$nombre_taller = $_SESSION['nombre_t'] ?? 'Mi Taller de Reparación';
?>
<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <title>Ticket Orden #<?php echo $orden['id_orden']; ?></title>
    <style>
        /* CSS ESPECÍFICO PARA IMPRESORA TÉRMICA (80mm) */
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: 'Courier New', Courier, monospace;
        }

        body {
            background: #f0f0f0;
            display: flex;
            justify-content: center;
            padding: 20px;
        }

        /* Ancho estándar de ticketera de 80mm
        .ticket {
            background: #fff;
            width: 80mm;
            /* Ancho estándar de ticketera 
            padding: 5mm;
            color: #000;
            font-size: 12px;
            box-shadow: 0 0 5px rgba(0, 0, 0, 0.2);
        }
        */
        /* Ancho estándar de ticketera de 58mm*/
        .ticket {
            background: #fff;
            /* Cambiamos a 55mm para dejar un pequeño margen de seguridad en el rollo de 58mm */
            width: 55mm;
            padding: 2mm;
            /* Reducimos un poco el padding */
            color: #000;
            font-size: 11px;
            /* Letra un puntito más pequeña para que quepa bien */
            box-shadow: 0 0 5px rgba(0, 0, 0, 0.2);
            margin: 0 auto;
            /* Centramos el ticket en la pantalla */
        }

        .centrado {
            text-align: center;
        }

        .negrita {
            font-weight: bold;
        }

        .separador {
            border-top: 1px dashed #000;
            margin: 5px 0;
        }

        .titulo {
            font-size: 16px;
            margin-bottom: 5px;
            text-transform: uppercase;
        }

        .datos-fila {
            display: flex;
            justify-content: space-between;
            margin-bottom: 3px;
        }

        .qr-code {
            width: 100px;
            height: 100px;
            margin: 10px auto;
            display: block;
        }

        .condiciones {
            font-size: 10px;
            text-align: justify;
            margin-top: 10px;
        }

        /* Cuando se mande a imprimir, quitamos el fondo gris y la sombra */
        @media print {
            body {
                background: none;
                padding: 0;
            }

            .ticket {
                box-shadow: none;
                width: 100%;
            }
        }
    </style>
</head>

<body>

    <div class="ticket">
        <div class="centrado">
            <h1 class="titulo"><?php echo htmlspecialchars($nombre_taller); ?></h1>
            <p>TICKET DE RECEPCIÓN</p>
            <p>Folio: <span class="negrita">#<?php echo $orden['id_orden']; ?></span></p>
            <p>Fecha: <?php echo date('d/m/Y H:i', strtotime($orden['creado_servicio'])); ?></p>
        </div>

        <div class="separador"></div>

        <p class="negrita">DATOS DEL CLIENTE</p>
        <p>Nombre: <?php echo htmlspecialchars($orden['nombre_cliente'] . ' ' . $orden['papellido_cliente']); ?></p>
        <p>Tel: <?php echo htmlspecialchars($orden['tel_cliente']); ?></p>

        <div class="separador"></div>

        <p class="negrita">DATOS DEL EQUIPO</p>
        <p>Equipo: <?php echo htmlspecialchars($orden['nombre_equipo'] . ' ' . $orden['modelo']); ?></p>
        <p>Falla: <?php echo htmlspecialchars($orden['falla']); ?></p>

        <div class="separador"></div>

        <div class="datos-fila">
            <span>Costo Total:</span>
            <span class="negrita">$<?php echo number_format($orden['costo_servicio'], 2); ?></span>
        </div>
        <div class="datos-fila">
            <span>Anticipo:</span>
            <span>-$<?php echo number_format($orden['anticipo_servicio'], 2); ?></span>
        </div>
        <div class="separador"></div>
        <div class="datos-fila" style="font-size: 14px;">
            <span class="negrita">SALDO A PAGAR:</span>
            <span class="negrita">$<?php echo number_format($orden['saldo_servicio'], 2); ?></span>
        </div>

        <div class="separador"></div>

        <div class="centrado">
            <p>Escanea para rastrear tu equipo:</p>
            <!-- Para impresoras de 80mm
            <img class="qr-code" src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=<http://localhost/swaos/track.php?t=<?php echo $orden['token_hash']; ?>" alt="Código QR" style="width: 80px; height: 80px;"> -->

            <!-- Para impresoras de 58mm -->
            <img class="qr-code" src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=https://swaos.rf.gd/track.php?t=<?php echo $orden['token_hash']; ?>" alt="Código QR" style="width: 80px; height: 80px;">
        </div>

        <div class="condiciones">
            <p class="negrita centrado">TÉRMINOS Y CONDICIONES</p>
            <p>1. Es indispensable presentar este ticket para recoger su equipo.</p>
            <p>2. Después de 30 días de notificado, no nos hacemos responsables por equipos abandonados.</p>
            <p>3. Todo diagnóstico no aceptado causa honorarios de revisión.</p>
        </div>

        <div class="centrado" style="margin-top: 15px;">
            <p>¡Gracias por su preferencia!</p>
        </div>
    </div>

    <script>
        window.onload = function() {
            window.print();
        }
    </script>

</body>

</html>