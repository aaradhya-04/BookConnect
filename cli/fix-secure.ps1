# Quick script to trust the certificate and make site show "Secure"
# Run this in PowerShell (as Administrator for best results)

$cerPath = "$PSScriptRoot\..\certs\localhost.cer"

Write-Host "Trusting localhost certificate to remove 'Not Secure' warning..."
Write-Host ""

if (-not (Test-Path $cerPath)) {
    Write-Host "ERROR: CER file not found!"
    Write-Host "   Location: $cerPath"
    Write-Host ""
    Write-Host "   Please submit a review first to generate the certificate."
    exit 1
}

Write-Host "Found CER file: $cerPath"
Write-Host ""

# Try CurrentUser Root (no admin needed)
Write-Host "Adding to CurrentUser Trusted Root..."
try {
    Import-Certificate -FilePath $cerPath -CertStoreLocation Cert:\CurrentUser\Root -ErrorAction Stop | Out-Null
    Write-Host "SUCCESS! Certificate trusted in CurrentUser Root"
    Write-Host ""
    Write-Host "Next steps:"
    Write-Host "   1. Restart your server"
    Write-Host "   2. Close ALL browser windows completely"
    Write-Host "   3. Open browser and visit: https://localhost:3000"
    Write-Host "   4. You should see 'Secure' (padlock icon)"
    exit 0
} catch {
    Write-Host "WARNING: Could not add to CurrentUser Root: $_"
    Write-Host ""
}

# Try LocalMachine Root (requires admin)
Write-Host "Trying LocalMachine Root (requires Administrator)..."
try {
    Import-Certificate -FilePath $cerPath -CertStoreLocation Cert:\LocalMachine\Root -ErrorAction Stop | Out-Null
    Write-Host "SUCCESS! Certificate trusted in LocalMachine Root"
    Write-Host ""
    Write-Host "Next steps:"
    Write-Host "   1. Restart your server"
    Write-Host "   2. Close ALL browser windows completely"
    Write-Host "   3. Open browser and visit: https://localhost:3000"
    Write-Host "   4. You should see 'Secure' (padlock icon)"
    exit 0
} catch {
    Write-Host "ERROR: Could not add to LocalMachine Root: $_"
    Write-Host ""
    Write-Host "Please run PowerShell as Administrator and try again,"
    Write-Host "or manually install the certificate by double-clicking:"
    Write-Host "   $cerPath"
    exit 1
}

