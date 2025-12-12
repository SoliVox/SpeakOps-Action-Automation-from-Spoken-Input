# SpeakOps API Test Script
# Run this after server is started: node src/server.js

$BASE_URL = "http://localhost:3000"
$API_KEY = "test_secret_key"

Write-Host "`n=== Testing Health Endpoint ===" -ForegroundColor Cyan
try {
    $health = Invoke-RestMethod -Uri "$BASE_URL/health" -Method Get -UseBasicParsing
    Write-Host "✓ Health check passed:" -ForegroundColor Green
    $health | ConvertTo-Json
} catch {
    Write-Host "✗ Health check failed: $_" -ForegroundColor Red
}

Write-Host "`n=== Testing Auth (should fail with 401) ===" -ForegroundColor Cyan
try {
    Invoke-RestMethod -Uri "$BASE_URL/api/speakspace-action" -Method Post `
        -ContentType "application/json" `
        -Body '{"prompt":"test","note_id":"123","timestamp":"2025-12-09T14:22:33Z"}' `
        -UseBasicParsing -ErrorAction Stop
    Write-Host "✗ Should have returned 401" -ForegroundColor Red
} catch {
    if ($_.Exception.Response.StatusCode -eq 401) {
        Write-Host "✓ Auth rejection works (401)" -ForegroundColor Green
    } else {
        Write-Host "✗ Unexpected error: $_" -ForegroundColor Red
    }
}

Write-Host "`n=== Testing Valid Request ===" -ForegroundColor Cyan
try {
    $result = Invoke-RestMethod -Uri "$BASE_URL/api/speakspace-action" -Method Post `
        -Headers @{"Authorization"="Bearer $API_KEY"} `
        -ContentType "application/json" `
        -Body '{"prompt":"Convert this note to a blog post","note_id":"abc123","timestamp":"2025-12-09T14:22:33Z"}' `
        -UseBasicParsing
    Write-Host "✓ Valid request succeeded:" -ForegroundColor Green
    $result | ConvertTo-Json
} catch {
    Write-Host "✗ Valid request failed: $_" -ForegroundColor Red
}

Write-Host "`n=== Testing Invalid Payload (missing fields) ===" -ForegroundColor Cyan
try {
    Invoke-RestMethod -Uri "$BASE_URL/api/speakspace-action" -Method Post `
        -Headers @{"Authorization"="Bearer $API_KEY"} `
        -ContentType "application/json" `
        -Body '{"prompt":"only prompt"}' `
        -UseBasicParsing -ErrorAction Stop
    Write-Host "✗ Should have returned 400" -ForegroundColor Red
} catch {
    if ($_.Exception.Response.StatusCode -eq 400) {
        Write-Host "✓ Validation works (400)" -ForegroundColor Green
    } else {
        Write-Host "✗ Unexpected error: $_" -ForegroundColor Red
    }
}

Write-Host "`n=== Tests Complete ===" -ForegroundColor Cyan
