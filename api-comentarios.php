<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *'); // Permitir tu dominio
header('Access-Control-Allow-Methods: POST, GET');

// ============================================
// CONFIGURACIÓN SEGURA - EDITAR ESTO
// ============================================
$config = [
    'huggingface' => [
        'api_key' => 'TU_CLAVE_HF_NUEVA_AQUI', // Crear nueva en hf.co/settings/tokens
        'model_url' => 'https://api-inference.huggingface.co/models/pysentimiento/robertuito-sentiment-analysis'
    ],
    'supabase' => [
        'url' => 'https://vuqrdulufxvvufhlsxqx.supabase.co',
        'anon_key' => 'sb_publishable_hDJqmkRa4pTk-CXnnY61tA__6Y6HGYM' // Generar nueva en Supabase
    ]
];

// ============================================
// 1. ANALIZAR SENTIMIENTO CON HUGGING FACE
// ============================================
function analizarSentimiento($texto, $config) {
    $ch = curl_init($config['huggingface']['model_url']);
    
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST => true,
        CURLOPT_HTTPHEADER => [
            'Authorization: Bearer ' . $config['huggingface']['api_key'],
            'Content-Type: application/json'
        ],
        CURLOPT_POSTFIELDS => json_encode(['inputs' => $texto])
    ]);
    
    $response = curl_exec($ch);
    curl_close($ch);
    
    $data = json_decode($response, true);
    return $data[0]['label'] ?? 'NEUTRAL';
}

// ============================================
// 2. GUARDAR EN SUPABASE
// ============================================
function guardarEnSupabase($datos, $config) {
    $ch = curl_init($config['supabase']['url'] . '/rest/v1/comentarios');
    
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST => true,
        CURLOPT_HTTPHEADER => [
            'apikey: ' . $config['supabase']['anon_key'],
            'Authorization: Bearer ' . $config['supabase']['anon_key'],
            'Content-Type: application/json',
            'Prefer: return=minimal'
        ],
        CURLOPT_POSTFIELDS => json_encode($datos)
    ]);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    return $httpCode === 201;
}

// ============================================
// 3. OBTENER COMENTARIOS DE SUPABASE
// ============================================
function obtenerComentarios($config) {
    $ch = curl_init($config['supabase']['url'] . '/rest/v1/comentarios?select=nombre,comentario,valoracion,fecha,sentimiento&order=fecha.desc');
    
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPHEADER => [
            'apikey: ' . $config['supabase']['anon_key'],
            'Authorization: Bearer ' . $config['supabase']['anon_key']
        ]
    ]);
    
    $response = curl_exec($ch);
    curl_close($ch);
    
    return json_decode($response, true) ?: [];
}

// ============================================
// MANEJAR PETICIONES
// ============================================
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'POST') {
    // ENVIAR NUEVO COMENTARIO
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($input['nombre'], $input['comentario'], $input['valoracion'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Datos incompletos']);
        exit;
    }
    
    // 1. Analizar sentimiento
    $sentimiento = analizarSentimiento($input['comentario'], $config);
    
    // 2. Guardar en Supabase
    $datosGuardar = [
        'nombre' => $input['nombre'],
        'comentario' => $input['comentario'],
        'valoracion' => (int)$input['valoracion'],
        'sentimiento' => $sentimiento,
        'fecha' => date('Y-m-d H:i:s')
    ];
    
    if (guardarEnSupabase($datosGuardar, $config)) {
        echo json_encode([
            'success' => true,
            'message' => 'Comentario guardado y analizado',
            'sentimiento' => $sentimiento
        ]);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Error al guardar']);
    }
    
} elseif ($method === 'GET') {
    // OBTENER COMENTARIOS
    $comentarios = obtenerComentarios($config);
    echo json_encode($comentarios);
    
} else {
    http_response_code(405);
    echo json_encode(['error' => 'Método no permitido']);
}
?>