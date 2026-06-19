# Google Drive MCP 초기 설정 스크립트
# Usage:
#   .\scripts\setup-google-drive-mcp.ps1
#   .\scripts\setup-google-drive-mcp.ps1 -CredentialsPath "$HOME\Downloads\client_secret_XXX.json"
#   .\scripts\setup-google-drive-mcp.ps1 -Auth

param(
    [string]$CredentialsPath = "",
    [switch]$Auth
)

$ConfigDir = Join-Path $env:APPDATA "mcp-server-google-drive"
$OAuthFile = Join-Path $ConfigDir "oauth-credentials.json"
$TokenFile = Join-Path $ConfigDir "tokens.json"

Write-Host "=== Google Drive MCP Setup ===" -ForegroundColor Cyan
Write-Host "Config directory: $ConfigDir"

New-Item -ItemType Directory -Force -Path $ConfigDir | Out-Null

if ($CredentialsPath -ne "") {
    if (-not (Test-Path $CredentialsPath)) {
        Write-Error "Credentials file not found: $CredentialsPath"
        exit 1
    }
    Copy-Item -Path $CredentialsPath -Destination $OAuthFile -Force
    Write-Host "Credentials copied to: $OAuthFile" -ForegroundColor Green
}

if (-not (Test-Path $OAuthFile)) {
    Write-Host ""
    Write-Host "OAuth credentials not found yet." -ForegroundColor Yellow
    Write-Host "1. Google Cloud Console -> Credentials -> OAuth Desktop client -> Download JSON"
    Write-Host "2. Re-run with:"
    Write-Host '   .\scripts\setup-google-drive-mcp.ps1 -CredentialsPath "$HOME\Downloads\client_secret_XXX.json"'
    Write-Host ""
    Write-Host "Or manually place the file at:"
    Write-Host "   $OAuthFile"
}

if ($Auth -or ((Test-Path $OAuthFile) -and -not (Test-Path $TokenFile))) {
    if (-not (Test-Path $OAuthFile)) {
        Write-Error "Run with -CredentialsPath first, then -Auth"
        exit 1
    }
    Write-Host ""
    Write-Host "Starting OAuth flow (browser will open)..." -ForegroundColor Cyan
    $env:GDRIVE_MCP_OAUTH_PATH = $OAuthFile
    $env:GDRIVE_MCP_TOKEN_PATH = $TokenFile
    npx -y @ibarcarty/mcp-server-google-drive auth
}

Write-Host ""
Write-Host "Status:" -ForegroundColor Cyan
Write-Host "  OAuth credentials: $(if (Test-Path $OAuthFile) { 'OK' } else { 'MISSING' })"
Write-Host "  Access tokens:     $(if (Test-Path $TokenFile) { 'OK' } else { 'MISSING - run with -Auth' })"
Write-Host "  MCP config:        D:\New Steve\AI Portfolio\.cursor\mcp.json"
Write-Host ""
Write-Host "Next: Reload Cursor window, then check Settings -> Tools & MCP -> google-drive"
