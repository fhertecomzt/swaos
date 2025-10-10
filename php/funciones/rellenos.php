<?php
// Rellenamos la lista de roles "Superusuario"
$consulta_rolesfull = $dbh->prepare("SELECT * FROM roles WHERE estatus_rol = 0 AND id_rol = 1");
$consulta_rolesfull->execute();

$lista_rolesfull = []; // Inicializa como un array

while ($rolfull = $consulta_rolesfull->fetch(PDO::FETCH_ASSOC)) {
  $lista_rolesfull[] = $rolfull; // Agrega cada rol al array
}

// Rellenamos la lista de roles excluyendo "Superusuario"
$consulta_roles = $dbh->prepare("SELECT id_rol, nom_rol FROM roles WHERE estatus_rol = 0 AND nom_rol != 'superusuario'");
$consulta_roles->execute();

$lista_roles = []; // Inicializa como un array

while ($rol = $consulta_roles->fetch(PDO::FETCH_ASSOC)) {
  $lista_roles[] = $rol; // Agrega cada rol al array
}

// Rellenamos la lista de tiendas
$consulta_tiendas = $dbh->prepare("SELECT * FROM talleres WHERE estatus_t = 0");
$consulta_tiendas->execute();
$lista_tiendas = []; // Inicializa como un array

while ($tienda = $consulta_tiendas->fetch(PDO::FETCH_ASSOC)) {
  $lista_tiendas[] = $tienda; // Agrega cada sucursal al array
}
