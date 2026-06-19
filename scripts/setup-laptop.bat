@echo off
chcp 65001 >nul 2>&1
title AI Portfolio - Laptop Setup
color 0B

echo.
echo  ========================================
echo   AI Portfolio - Laptop Setup
echo  ========================================
echo.
echo  GitHub clone/pull, npm install, Google Drive MCP
echo.

powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0setup-laptop.ps1" %*
set EXITCODE=%ERRORLEVEL%

echo.
if %EXITCODE% NEQ 0 (
    echo  [ERROR] Setup failed. See messages above.
    echo  Guide: docs\Laptop-Setup-Guide.md
) else (
    echo  [DONE] Setup finished.
    echo  Open this folder in Cursor and enable google-drive MCP.
)

echo.
pause
exit /b %EXITCODE%
