<?php
//Includes
include "../conexion.php";
include "../funciones/funciones.php";

//$estados = obtenerRegistros($dbh, "estados", "id, nombre", "ASC", "id");
$estados = obtenerEstados($dbh);

?>

<!DOCTYPE html>
<html lang="es">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Selects Anidados</title>
</head>

<body>
  <h2>Selects anidados</h2>
  <form action="" method="POST">

    <p>
      <label for="estado">Estado</label>
      <select name="nombre" id="estado">
        <option value="">Seleccionar</option>
        <?php foreach ($estados as $row) : ?>
          <option value="<?php echo $row['id']; ?>"><?php echo $row['nombre']; ?></option>
        <?php endforeach; ?>
      </select>
    </p>

    <p>
      <label for="municipio">Municipio</label>
      <select name="municipio" id="municipio">
        <option value="">Seleccionar</option>
      </select>
    </p>

    <p>
      <label for="colonia">Colonia</label>
      <select name="colonia" id="colonia">
        <option value="">Seleccionar</option>
      </select>
    </p>

    <p>
      <label for="codigo_postal">Código Postal</label>
      <input type="text" name="codigo_postal" id="codigo_postal" readonly>
    </p>

  </form>

  <script src="../../js/peticionesedosmun.js"></script>
</body>

</html>