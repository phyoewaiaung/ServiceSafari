<?php

namespace App\Http\Controllers;

use Firebase\JWT\JWT;
use Firebase\JWT\Key;

class AuthController
{
    private string $secretKey;

    public function __construct()
    {
        $this->secretKey = $_ENV['JWT_SECRET'] ?? 'your-secret-key';
    }

    public function register()
    {
        try {
            $input = json_decode(file_get_contents('php://input'), true);
            
            // Validate input
            if (!isset($input['name']) || !isset($input['email']) || !isset($input['password'])) {
                http_response_code(400);
                echo json_encode(['error' => 'Missing required fields']);
                return;
            }

            // Simulate user creation (in real app, save to database)
            $user = [
                'id' => rand(1, 1000),
                'name' => $input['name'],
                'email' => $input['email'],
                'created_at' => date('Y-m-d H:i:s')
            ];

            // Generate JWT token
            $payload = [
                'iss' => 'auth-service',
                'sub' => $user['id'],
                'iat' => time(),
                'exp' => time() + 3600, // 1 hour
                'user' => $user
            ];

            $jwt = JWT::encode($payload, $this->secretKey, 'HS256');

            echo json_encode([
                'message' => 'User registered successfully',
                'user' => $user,
                'token' => $jwt
            ]);

        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Registration failed: ' . $e->getMessage()]);
        }
    }

    public function login()
    {
        try {
            $input = json_decode(file_get_contents('php://input'), true);
            
            // Validate input
            if (!isset($input['email']) || !isset($input['password'])) {
                http_response_code(400);
                echo json_encode(['error' => 'Email and password required']);
                return;
            }

            // Simulate user authentication (in real app, check database)
            if ($input['email'] === 'test@example.com' && $input['password'] === 'password') {
                $user = [
                    'id' => 1,
                    'name' => 'Test User',
                    'email' => 'test@example.com'
                ];

                // Generate JWT token
                $payload = [
                    'iss' => 'auth-service',
                    'sub' => $user['id'],
                    'iat' => time(),
                    'exp' => time() + 3600,
                    'user' => $user
                ];

                $jwt = JWT::encode($payload, $this->secretKey, 'HS256');

                echo json_encode([
                    'message' => 'Login successful',
                    'user' => $user,
                    'token' => $jwt
                ]);
            } else {
                http_response_code(401);
                echo json_encode(['error' => 'Invalid credentials']);
            }

        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Login failed: ' . $e->getMessage()]);
        }
    }

    public function profile()
    {
        try {
            // Get Authorization header
            $headers = getallheaders();
            $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';

            if (!$authHeader) {
                http_response_code(401);
                echo json_encode(['error' => 'Authorization header required']);
                return;
            }

            // Extract token from "Bearer <token>"
            $token = str_replace('Bearer ', '', $authHeader);

            // Decode JWT
            $decoded = JWT::decode($token, new Key($this->secretKey, 'HS256'));

            echo json_encode([
                'message' => 'Profile retrieved successfully',
                'user' => $decoded->user
            ]);

        } catch (Exception $e) {
            http_response_code(401);
            echo json_encode(['error' => 'Invalid token: ' . $e->getMessage()]);
        }
    }

    public function health()
    {
        echo json_encode([
            'status' => 'OK',
            'service' => 'Authentication Service',
            'timestamp' => date('Y-m-d H:i:s'),
            'version' => '1.0.0'
        ]);
    }
}
