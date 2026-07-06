<?php
header('Content-Type: application/json; charset=utf-8');
require_once '../config_keys.php';

// 1. TU LLAVE MAESTRA DE GEMINI (Cámbiala por tu API Key real)
$api_key = api_key;

// 2. RECIBIR EL TEXTO DEL USUARIO
$texto_usuario = $_POST['texto_ia'] ?? '';

if (empty($texto_usuario)) {
    echo json_encode(['error' => 'Por favor, escribe qué reporte necesitas.']);
    exit;
}

// 3. CONTEXTO PARA LA IA (Le decimos en qué día estamos para que sepa calcular "este mes", "ayer", etc.)
$fecha_hoy = date('Y-m-d'); // Ejemplo: 2026-03-24
$prompt_sistema = "Eres un asistente experto en bases de datos para un sistema POS llamado SWAOS. Hoy es $fecha_hoy. 
El usuario te dará una orden en lenguaje natural. Tu única tarea es extraer las fechas y convertirlas a formato YYYY-MM-DD.
Debes devolver ÚNICAMENTE un objeto JSON válido con las claves: 'fecha_inicio', 'fecha_fin' y 'buscar' (si menciona un nombre o folio).
Ejemplo: Si dice 'ventas de febrero', devuelves {\"fecha_inicio\": \"2026-02-01\", \"fecha_fin\": \"2026-02-28\", \"buscar\": \"\"}.
No devuelvas texto, solo el JSON.";

// 4. PREPARAR LA PETICIÓN A GEMINI
$url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" . $api_key;

$data = [
    "systemInstruction" => [
        "parts" => [["text" => $prompt_sistema]]
    ],
    "contents" => [
        ["parts" => [["text" => $texto_usuario]]]
    ],
    "generationConfig" => [
        "response_mime_type" => "application/json", // Forzamos a que solo devuelva JSON
        "temperature" => 0.1 // Temperatura baja para que sea muy preciso y matemático
    ]
];

// 5. ENVIAR A GEMINI USANDO cURL
$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));

$respuesta = curl_exec($ch);
curl_close($ch);

// 6. PROCESAR Y DEVOLVER A TU SISTEMA SWAOS
$json_respuesta = json_decode($respuesta, true);

if (isset($json_respuesta['candidates'][0]['content']['parts'][0]['text'])) {
    $texto_limpio = $json_respuesta['candidates'][0]['content']['parts'][0]['text'];
    // El texto_limpio ya es un JSON gracias a la instrucción que le dimos a Gemini
    echo $texto_limpio;
} else {
    // Si Google falla, le pedimos a PHP que nos muestre exactamente qué dijo Google
    $error_google = $json_respuesta['error']['message'] ?? 'Respuesta inesperada de la IA.';
    echo json_encode(['error' => 'Rechazado por Google: ' . $error_google]);
}