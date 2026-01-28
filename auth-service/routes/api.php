<?php

use App\Http\Controllers\AuthController;

// Enable CORS headers
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

$controller = new AuthController();

// API Routes
$request_uri = $_SERVER['REQUEST_URI'];
$request_method = $_SERVER['REQUEST_METHOD'];

// Remove query string from URI
$path = parse_url($request_uri, PHP_URL_PATH);

// Route matching
switch ($path) {
    case '/api/auth/register':
        if ($request_method === 'POST') {
            $controller->register();
        } else {
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed']);
        }
        break;

    case '/api/auth/login':
        if ($request_method === 'POST') {
            $controller->login();
        } else {
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed']);
        }
        break;

    case '/api/auth/profile':
        if ($request_method === 'GET') {
            $controller->profile();
        } else {
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed']);
        }
        break;

    case '/health':
        if ($request_method === 'GET') {
            $controller->health();
        } else {
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed']);
        }
        break;

    default:
        http_response_code(404);
        echo json_encode([
            'error' => 'Route not found',
            'available_routes' => [
                'POST /api/auth/register',
                'POST /api/auth/login', 
                'GET /api/auth/profile',
                'GET /health'
            ]
        ]);
        break;
}
