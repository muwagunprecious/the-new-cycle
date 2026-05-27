# PowerShell script to test QoreID verification for OPay account 8144065785
$envFile = "C:\Users\TINGO-AI-010\Documents\Go-cycle\.env"
$lines = Get-Content $envFile
$clientId = ($lines | Where-Object { $_ -match '^QOREID_CLIENT_ID' }) -replace 'QOREID_CLIENT_ID\s*=\s*','' | ForEach-Object { $_.Trim() }
$secretKey = ($lines | Where-Object { $_ -match '^QOREID_SECRET_KEY' }) -replace 'QOREID_SECRET_KEY\s*=\s*','' | ForEach-Object { $_.Trim() }

# Get token
$tokenResponse = Invoke-RestMethod -Method Post -Uri "https://api.qoreid.com/token" -Headers @{'Content-Type'='application/json'} -Body (@{clientId=$clientId; secret=$secretKey} | ConvertTo-Json)
$accessToken = $tokenResponse.accessToken

# Verify OPay account
$accountNumber = "8144065785"
$bankCode = "100004"
$verifyResponse = Invoke-RestMethod -Method Post -Uri "https://api.qoreid.com/v1/ng/identities/nuban" -Headers @{'Authorization'="Bearer $accessToken"; 'Content-Type'='application/json'} -Body (@{accountNumber=$accountNumber; bankCode=$bankCode} | ConvertTo-Json)

$verifyResponse | ConvertTo-Json -Depth 5
