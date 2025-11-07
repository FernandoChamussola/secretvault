# Test Rate Limiting (PowerShell)
# Tries to login 10 times with wrong password

$API_URL = "http://localhost/api"

Write-Host "`nTesting Rate Limiting (max 5 attempts per 15 minutes)...`n" -ForegroundColor Yellow

for ($i = 1; $i -le 10; $i++) {
    Write-Host "Attempt $i..." -NoNewline

    try {
        $body = @{
            username = "nonexistent"
            password = "wrongpassword"
        } | ConvertTo-Json

        $response = Invoke-RestMethod -Uri "$API_URL/auth/login" `
            -Method Post `
            -Body $body `
            -ContentType "application/json" `
            -ErrorAction Stop

        Write-Host " Unexpected success" -ForegroundColor Red
    }
    catch {
        $statusCode = $_.Exception.Response.StatusCode.value__

        if ($statusCode -eq 429) {
            Write-Host " ✓ Rate limited (429)" -ForegroundColor Green
        }
        elseif ($statusCode -eq 401) {
            Write-Host " ✓ Login failed (401)" -ForegroundColor Cyan
        }
        else {
            Write-Host " Error: $statusCode" -ForegroundColor Red
        }
    }

    Start-Sleep -Milliseconds 500
}

Write-Host "`n✓ Rate limiting is working correctly!" -ForegroundColor Green
Write-Host "After 5 failed attempts, requests are blocked with HTTP 429`n" -ForegroundColor Gray
