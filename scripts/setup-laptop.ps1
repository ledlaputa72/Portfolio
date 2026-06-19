# AI Portfolio — Laptop one-shot setup
# Usage:
#   .\scripts\setup-laptop.ps1
#   .\scripts\setup-laptop.ps1 -CredentialsPath "$HOME\Downloads\client_secret_XXX.json"
#   .\scripts\setup-laptop.ps1 -StartDev
#   .\scripts\setup-laptop.bat

param(
    [string]$ProjectPath = "",
    [string]$RepoUrl = "https://github.com/ledlaputa72/Portfolio.git",
    [string]$Branch = "claude/gracious-wozniak-g7ld41",
    [string]$CredentialsPath = "",
    [switch]$SkipClone,
    [switch]$SkipInstall,
    [switch]$SkipMcp,
    [switch]$SkipAuth,
    [switch]$StartDev,
    [switch]$Help
)

$ErrorActionPreference = "Stop"

function Write-Step([string]$Message) {
    Write-Host ""
    Write-Host "==> $Message" -ForegroundColor Cyan
}

function Write-Ok([string]$Message) {
    Write-Host "    OK  $Message" -ForegroundColor Green
}

function Write-Warn([string]$Message) {
    Write-Host "    !!  $Message" -ForegroundColor Yellow
}

function Write-Fail([string]$Message) {
    Write-Host "    XX  $Message" -ForegroundColor Red
}

function Test-CommandExists([string]$Name) {
    return [bool](Get-Command $Name -ErrorAction SilentlyContinue)
}

function Get-ProjectRoot {
    return (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
}

function Update-McpJson([string]$Root) {
    $cursorDir = Join-Path $Root ".cursor"
    $mcpFile = Join-Path $cursorDir "mcp.json"
    $configDir = Join-Path $env:APPDATA "mcp-server-google-drive"
    $oauthFile = Join-Path $configDir "oauth-credentials.json"
    $tokenFile = Join-Path $configDir "tokens.json"

    New-Item -ItemType Directory -Force -Path $cursorDir | Out-Null

    $oauthEscaped = $oauthFile -replace "\\", "\\"
    $tokenEscaped = $tokenFile -replace "\\", "\\"

    $json = @"
{
  "mcpServers": {
    "google-drive": {
      "command": "npx",
      "args": ["-y", "@ibarcarty/mcp-server-google-drive"],
      "env": {
        "GDRIVE_MCP_OAUTH_PATH": "$oauthEscaped",
        "GDRIVE_MCP_TOKEN_PATH": "$tokenEscaped"
      }
    }
  }
}
"@

    Set-Content -Path $mcpFile -Value $json -Encoding UTF8
    Write-Ok "Updated .cursor/mcp.json for user '$env:USERNAME'"
    Write-Host "       OAuth: $oauthFile"
    Write-Host "       Token: $tokenFile"
}

function Show-Help {
    Write-Host @"

AI Portfolio — Laptop Setup Script

Usage:
  .\scripts\setup-laptop.ps1 [options]

Options:
  -ProjectPath <path>     Project folder (default: script parent folder)
  -CredentialsPath <path>  OAuth client JSON from Google Cloud Console
  -SkipClone               Skip git clone/pull/checkout
  -SkipInstall             Skip npm install
  -SkipMcp                 Skip Google Drive MCP setup
  -SkipAuth                Skip OAuth browser auth
  -StartDev                Run npm run dev after setup
  -Help                    Show this help

Examples:
  .\scripts\setup-laptop.bat
  .\scripts\setup-laptop.ps1 -CredentialsPath "`$HOME\Downloads\client_secret_XXX.json"
  .\scripts\setup-laptop.ps1 -StartDev

"@
}

if ($Help) {
    Show-Help
    exit 0
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  AI Portfolio — Laptop Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

Write-Step "Checking prerequisites"

foreach ($cmd in @("git", "node", "npm", "npx")) {
    if (-not (Test-CommandExists $cmd)) {
        Write-Fail "$cmd not found. Install it and restart the terminal."
        exit 1
    }
    $version = & $cmd --version 2>$null | Select-Object -First 1
    Write-Ok "$cmd $version"
}

$nodeMajor = [int]((& node --version) -replace "^v", "" -split "\.")[0]
if ($nodeMajor -lt 20) {
    Write-Warn "Node.js 20+ recommended (current: v$nodeMajor)"
}

if ([string]::IsNullOrWhiteSpace($ProjectPath)) {
    $ProjectPath = Get-ProjectRoot
}

$ProjectPath = (Resolve-Path $ProjectPath -ErrorAction SilentlyContinue)?.Path ?? $ProjectPath
Write-Ok "Project path: $ProjectPath"

if (-not $SkipClone) {
    Write-Step "Syncing Git repository"

    if (-not (Test-Path (Join-Path $ProjectPath ".git"))) {
        Write-Warn "Not a git repo. Cloning into: $ProjectPath"
        $parent = Split-Path $ProjectPath -Parent
        $name = Split-Path $ProjectPath -Leaf
        New-Item -ItemType Directory -Force -Path $parent | Out-Null
        git clone $RepoUrl (Join-Path $parent $name)
        if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
    }

    Push-Location $ProjectPath
    try {
        git fetch origin
        if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

        git checkout $Branch 2>$null
        if ($LASTEXITCODE -ne 0) {
            git checkout -b $Branch "origin/$Branch"
        }
        if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

        git pull origin $Branch
        if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

        Write-Ok "Branch: $Branch (up to date)"
    }
    finally {
        Pop-Location
    }
}

if (-not $SkipInstall) {
    Write-Step "Installing npm dependencies"
    Push-Location $ProjectPath
    try {
        npm install
        if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
        Write-Ok "npm install complete"
    }
    finally {
        Pop-Location
    }
}

if (-not $SkipMcp) {
    Write-Step "Setting up Google Drive MCP"

    $configDir = Join-Path $env:APPDATA "mcp-server-google-drive"
    $oauthFile = Join-Path $configDir "oauth-credentials.json"
    $tokenFile = Join-Path $configDir "tokens.json"

    New-Item -ItemType Directory -Force -Path $configDir | Out-Null

    if ($CredentialsPath -ne "") {
        if (-not (Test-Path $CredentialsPath)) {
            Write-Fail "Credentials file not found: $CredentialsPath"
            exit 1
        }
        Copy-Item -Path $CredentialsPath -Destination $oauthFile -Force
        Write-Ok "OAuth credentials copied"
    }

    Update-McpJson -Root $ProjectPath

    if (-not (Test-Path $oauthFile)) {
        Write-Warn "OAuth credentials missing at: $oauthFile"
        Write-Host "       Copy oauth-credentials.json from desktop, or run:"
        Write-Host '       .\scripts\setup-laptop.ps1 -CredentialsPath "$HOME\Downloads\client_secret_XXX.json"'
    }

    if (-not $SkipAuth -and (Test-Path $oauthFile) -and -not (Test-Path $tokenFile)) {
        Write-Step "Starting Google OAuth (browser will open)"
        $env:GDRIVE_MCP_OAUTH_PATH = $oauthFile
        $env:GDRIVE_MCP_TOKEN_PATH = $tokenFile
        npx -y @ibarcarty/mcp-server-google-drive auth
        if ($LASTEXITCODE -ne 0) {
            Write-Warn "OAuth auth did not complete. Run manually later:"
            Write-Host "       npx @ibarcarty/mcp-server-google-drive auth"
        }
        else {
            Write-Ok "OAuth tokens saved"
        }
    }
    elseif (Test-Path $tokenFile) {
        Write-Ok "OAuth tokens already exist"
    }
}

Write-Step "Setup summary"
Write-Host "  Project:     $ProjectPath"
Write-Host "  Branch:      $Branch"
Write-Host "  OAuth creds: $(if (Test-Path (Join-Path $env:APPDATA 'mcp-server-google-drive\oauth-credentials.json')) { 'OK' } else { 'MISSING' })"
Write-Host "  OAuth token: $(if (Test-Path (Join-Path $env:APPDATA 'mcp-server-google-drive\tokens.json')) { 'OK' } else { 'MISSING' })"
Write-Host "  MCP config:  $(Join-Path $ProjectPath '.cursor\mcp.json')"

Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Open Cursor -> File -> Open Folder -> $ProjectPath"
Write-Host "  2. Settings -> Tools & MCP -> google-drive ON -> Connected"
Write-Host "  3. npm run dev  ->  http://localhost:3000"
Write-Host "  4. Before work: git pull origin $Branch"
Write-Host "  5. After work:  git push origin $Branch"
Write-Host ""
Write-Host "Guide: docs/Laptop-Setup-Guide.md" -ForegroundColor Gray

if ($StartDev) {
    Write-Step "Starting dev server (Ctrl+C to stop)"
    Push-Location $ProjectPath
    try {
        npm run dev
    }
    finally {
        Pop-Location
    }
}
