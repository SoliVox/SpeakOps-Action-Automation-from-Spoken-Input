# Test Deployment Script
$baseUrl = "https://speakops-action-automation-from-spoken.onrender.com"

Write-Host ""
Write-Host "=== Testing Deployment ===" -ForegroundColor Cyan

# Test 1: Health Check
Write-Host ""
Write-Host "1. Testing Health Endpoint..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "$baseUrl/health"
    Write-Host "Health: $($health.status)" -ForegroundColor Green
} catch {
    Write-Host "Health check failed" -ForegroundColor Red
}

# Test 2: Metrics
Write-Host ""
Write-Host "2. Testing Metrics Endpoint..." -ForegroundColor Yellow
try {
    $metrics = Invoke-RestMethod -Uri "$baseUrl/metrics"
    Write-Host "Metrics accessible" -ForegroundColor Green
} catch {
    Write-Host "Metrics failed" -ForegroundColor Red
}

# Test 3: API Endpoint
Write-Host ""
Write-Host "3. Testing API Endpoint..." -ForegroundColor Yellow
$headers = @{
    "Content-Type" = "application/json"
    "Authorization" = "Bearer demo_secret_key_12345"
    "X-Workflow-Type" = "blog_post"
}

$body = @{
    prompt = "Write a short blog post about AI"
    note_id = "test_123"
    timestamp = "2025-12-12T10:30:00Z"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/speakspace-action" -Method Post -Headers $headers -Body $body
    Write-Host "API Response received" -ForegroundColor Green
    Write-Host "Response:" -ForegroundColor Cyan
    $response | ConvertTo-Json -Depth 3
} catch {
    Write-Host "API call failed" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== Test Complete ===" -ForegroundColor Cyan
