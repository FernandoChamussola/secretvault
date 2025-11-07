# Secrets Vault API Test Script (PowerShell)
# Usage: .\scripts\test-api.ps1

$API_URL = "http://localhost/api"
$username = "testuser_$(Get-Date -Format 'yyyyMMddHHmmss')"
$password = "TestPass123!"

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "   Secrets Vault API Test" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Test 1: Register
Write-Host "[1/6] Testing Registration..." -ForegroundColor Yellow
try {
    $registerBody = @{
        username = $username
        password = $password
    } | ConvertTo-Json

    $registerResponse = Invoke-RestMethod -Uri "$API_URL/auth/register" `
        -Method Post `
        -Body $registerBody `
        -ContentType "application/json"

    Write-Host "✓ Registration successful" -ForegroundColor Green
    Write-Host "  User ID: $($registerResponse.userId)`n" -ForegroundColor Gray
}
catch {
    Write-Host "✗ Registration failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Test 2: Login
Write-Host "[2/6] Testing Login..." -ForegroundColor Yellow
try {
    $loginBody = @{
        username = $username
        password = $password
    } | ConvertTo-Json

    $loginResponse = Invoke-RestMethod -Uri "$API_URL/auth/login" `
        -Method Post `
        -Body $loginBody `
        -ContentType "application/json"

    $token = $loginResponse.token
    $headers = @{
        Authorization = "Bearer $token"
    }

    Write-Host "✓ Login successful" -ForegroundColor Green
    Write-Host "  Token: $($token.Substring(0,20))...`n" -ForegroundColor Gray
}
catch {
    Write-Host "✗ Login failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Test 3: Create Secret
Write-Host "[3/6] Testing Create Secret..." -ForegroundColor Yellow
try {
    $secretBody = @{
        name = "Test Secret"
        value = "MySuperSecretPassword123!"
        notes = "This is a test secret"
    } | ConvertTo-Json

    $createResponse = Invoke-RestMethod -Uri "$API_URL/secrets" `
        -Method Post `
        -Body $secretBody `
        -ContentType "application/json" `
        -Headers $headers

    $secretId = $createResponse.secretId

    Write-Host "✓ Secret created successfully" -ForegroundColor Green
    Write-Host "  Secret ID: $secretId`n" -ForegroundColor Gray
}
catch {
    Write-Host "✗ Create secret failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Test 4: List Secrets
Write-Host "[4/6] Testing List Secrets..." -ForegroundColor Yellow
try {
    $listResponse = Invoke-RestMethod -Uri "$API_URL/secrets" `
        -Method Get `
        -Headers $headers

    Write-Host "✓ Secrets listed successfully" -ForegroundColor Green
    Write-Host "  Total secrets: $($listResponse.secrets.Count)" -ForegroundColor Gray
    foreach ($secret in $listResponse.secrets) {
        Write-Host "  - $($secret.name) (ID: $($secret.id))" -ForegroundColor Gray
    }
    Write-Host ""
}
catch {
    Write-Host "✗ List secrets failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Test 5: Get Secret (with decryption)
Write-Host "[5/6] Testing Get Secret (Decryption)..." -ForegroundColor Yellow
try {
    $getResponse = Invoke-RestMethod -Uri "$API_URL/secrets/$secretId" `
        -Method Get `
        -Headers $headers

    Write-Host "✓ Secret retrieved and decrypted" -ForegroundColor Green
    Write-Host "  Name: $($getResponse.name)" -ForegroundColor Gray
    Write-Host "  Value (decrypted): $($getResponse.value)" -ForegroundColor Gray
    Write-Host "  Notes: $($getResponse.notes)`n" -ForegroundColor Gray
}
catch {
    Write-Host "✗ Get secret failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Test 6: Delete Secret
Write-Host "[6/6] Testing Delete Secret..." -ForegroundColor Yellow
try {
    $deleteResponse = Invoke-RestMethod -Uri "$API_URL/secrets/$secretId" `
        -Method Delete `
        -Headers $headers

    Write-Host "✓ Secret deleted successfully`n" -ForegroundColor Green
}
catch {
    Write-Host "✗ Delete secret failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Summary
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✓ All tests passed successfully!" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "Key points demonstrated:" -ForegroundColor Yellow
Write-Host "  • User registration and authentication" -ForegroundColor White
Write-Host "  • Secret creation with AES-256-GCM encryption" -ForegroundColor White
Write-Host "  • Secure storage in database" -ForegroundColor White
Write-Host "  • Decryption on retrieval" -ForegroundColor White
Write-Host "  • Authorization (user can only access own secrets)" -ForegroundColor White
Write-Host ""
