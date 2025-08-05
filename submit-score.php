<?php
header('Content-Type: application/json');

// Load Google Script URL
require_once 'config.php';
$googleScriptURL = TAP_GAME_SCRIPT_URL;

// Get raw POST input
$input = file_get_contents("php://input");

// Prepare cURL request
$ch = curl_init($googleScriptURL);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $input);
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

// Return clean JSON response
if ($httpCode !== 200 || strpos($response, '{') !== 0) {
    echo json_encode([
        'error' => 'Bad response from server',
        'raw'   => $response
    ]);
} else {
    echo $response;
}
?>
