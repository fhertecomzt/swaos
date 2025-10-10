<?php

//Obtener registros*******************************************
function obtenerRegistros($dbh, $tabla, $campos = "*", $orden = "id DESC", $campoId = "id", $registrosPorPagina = 10, $pagina = 1)
{
  // Evita SQL Injection verificando que el nombre de la tabla sea válido
  $tablasPermitidas = ['talleres', 'roles', 'productos', 'categorias', 'marcas', 'tiposervicios', 'estadosservicios',  'metodosdepagos', 'impuestos', 'clientes', 'proveedores'];
  if (!in_array($tabla, $tablasPermitidas)) {
    return []; // Evita consultas en tablas no permitidas
  }

  // Calcular el OFFSET para la paginación
  $offset = ($pagina - 1) * $registrosPorPagina;

  // Consulta SQL con LIMIT y OFFSET para paginación
  $sql = "SELECT $campos FROM $tabla ORDER BY $campoId $orden LIMIT :limit OFFSET :offset";
  $stmt = $dbh->prepare($sql);

  // Bind de los parámetros para evitar SQL Injection
  $stmt->bindParam(':limit', $registrosPorPagina, PDO::PARAM_INT);
  $stmt->bindParam(':offset', $offset, PDO::PARAM_INT);

  $stmt->execute();
  $registros = $stmt->fetchAll(PDO::FETCH_ASSOC);

  return $registros;
}

// Función adicional para obtener el total de registros
function obtenerTotalRegistros($dbh, $tabla)
{
  $sql = "SELECT COUNT(*) FROM $tabla";
  $stmt = $dbh->prepare($sql);
  $stmt->execute();
  return $stmt->fetchColumn();
}

function obtenerUsuarios($dbh)
{
  $stmt = $dbh->prepare("SELECT u.id_usuario, u.usuario, u.nombre, u.p_appellido, u.s_appellido, u.imagen, u.estatus, r.nom_rol, t.nombre_t
        FROM usuarios u
        JOIN roles r ON u.id_rol = r.id_rol
        JOIN talleres t ON u.taller_id = t.id_taller
        WHERE r.nom_rol != 'superusuario' ORDER BY u.id_usuario ASC");
  $stmt->execute();
  return $stmt->fetchAll(PDO::FETCH_ASSOC);
}

function obtenerUsuariosSup($dbh)
{
  $stmt = $dbh->prepare("SELECT u.idusuario, u.usuario, u.nombre, u.appaterno, u.apmaterno, u.imagen, u.comision, u.estatus, r.nomrol, t.nomtienda
        FROM usuarios u
        JOIN roles r ON u.idrol = r.idrol
        JOIN tiendas t ON u.sucursales_id = t.idtienda
        WHERE r.nomrol = 'SISTEMAS' ORDER BY u.idusuario ASC");
  $stmt->execute();
  return $stmt->fetchAll(PDO::FETCH_ASSOC);
  $stmt->execute();
}

function obtenerProductosStock($dbh, $tabla, $campos, $orden, $campoId, $estatus = '')
{
  $idTienda = $_SESSION['idtienda']; // sesión de tienda iniciada

  $sql = "SELECT $campos, invsuc.stock
            FROM $tabla p
            LEFT JOIN inventario_sucursal invsuc ON p.idproducto = invsuc.idproducto AND invsuc.idtienda = :idtienda";

  $whereClauses = [];
  $params = [':idtienda' => $idTienda];

  if ($estatus === 'activo') {
    $whereClauses[] = 'p.estatus = 0';
  } elseif ($estatus === 'inactivo') {
    $whereClauses[] = 'p.estatus = 1';
  }

  if (!empty($whereClauses)) {
    $sql .= " WHERE " . implode(" AND ", $whereClauses);
  }

  $sql .= " ORDER BY $campoId $orden";

  $stmt = $dbh->prepare($sql);
  foreach ($params as $key => &$val) {
    $stmt->bindParam($key, $val);
  }
  $stmt->execute();
  return $stmt->fetchAll(PDO::FETCH_ASSOC);
}

function obtenerIdInventario($dbh, $id_producto, $id_tienda)
{
  if (empty($id_producto) || empty($id_tienda)) {
    throw new Exception("idproducto e idtienda son requeridos.");
  }

  // Convertir a los tipos de datos esperados (ajusta según tu DB)
  $id_producto = is_numeric($id_producto) ? intval($id_producto) : strval($id_producto);
  $id_tienda = strval($id_tienda);

  $stmt = $dbh->prepare("SELECT idinventario FROM inventario_sucursal WHERE idproducto = ? AND idtienda = ?");
  $stmt->execute([$id_producto, $id_tienda]);
  $resultado = $stmt->fetch(PDO::FETCH_ASSOC);

  if ($resultado) {
    return $resultado["idinventario"];
  } else {
    throw new Exception("No se encontró el inventario para el producto $id_producto en la tienda $id_tienda");
  }
}

function existeInventario($dbh, $id_producto, $id_tienda)
{
  $stmt = $dbh->prepare("SELECT COUNT(*) FROM inventario_sucursal WHERE idproducto = ? AND idtienda = ?");
  $stmt->execute([$id_producto, $id_tienda]);
  return (bool) $stmt->fetchColumn();
}
