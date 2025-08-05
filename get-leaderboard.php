<?php
header('Content-Type: application/json');

// Load script URL from config
require_once 'config.php';

$googleScriptURL = TAP_GAME_SCRIPT_URL;

// Fetch leaderboard data
$response = file_get_contents($googleScriptURL);

// Output response or fallback
echo $response ?: json_encode([]);
?>
