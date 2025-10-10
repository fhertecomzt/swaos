<?php
// validaciones.php

function validarDatosTienda($data, $dbh, $esEdicion = false, $id = null)
{
  $errores = [];

  // Validar campos requeridos
  $requiredFields = [
    "nombre",
    "representante",
    "rfc",
    "domicilio",
    "noexterior",
    "colonia",
    "ciudad",
    "estado",
    "cpostal",
    "email",
    "telefono"
  ];

  foreach ($requiredFields as $field) {
    if (!isset($data[$field]) || trim($data[$field]) === '') {
      $errores[] = "El campo '{$field}' es obligatorio y no puede estar vacío o contener solo espacios.";
    }
  }

  // Sanitización y validaciones adicionales
  $data = array_map('trim', $data);
  $data = array_map('htmlspecialchars', $data);

  // Validar correo electrónico
  if (!empty($data['email']) && !filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
    $errores[] = "El correo electrónico no tiene un formato válido.";
  }

  // Validar código postal (5 dígitos)
  if (!empty($data['cpostal']) && (!ctype_digit($data['cpostal']) || strlen($data['cpostal']) !== 5)) {
    $errores[] = "El código postal debe contener exactamente 5 dígitos.";
  }

  // Validar teléfono (mínimo 10 dígitos)
  if (!empty($data['telefono']) && (!ctype_digit($data['telefono']) || strlen($data['telefono']) < 10)) {
    $errores[] = "El teléfono debe contener al menos 10 dígitos.";
  }

  // Validar que el nombre de la tienda no sea duplicado
  if (!empty($data['nombre'])) {
    $query = "SELECT COUNT(*) FROM talleres WHERE nombre_t = ?";
    $params = [$data['nombre_t']];

    if ($esEdicion) {
      $query .= " AND editar-id != ?";
      $params[] = $id;
    }

    $stmt = $dbh->prepare($query);
    $stmt->execute($params);
    $existeNombre = $stmt->fetchColumn();

    if ($existeNombre > 0) {
      $errores[] = "El nombre de la tienda ya existe. Por favor, elige otro.";
    }
  }

  return $errores;
}
