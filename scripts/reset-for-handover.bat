@echo off
setlocal
title StudioFlow V2 - Reset for Handover

echo ========================================================
echo   StudioFlow V2 - Reset for Handover
echo   Removes test data so the studio starts clean:
echo   Job Order 00001, receipt OR-000001, queue #001.
echo   A backup is made first. Close the server (run.bat) before running this.
echo ========================================================

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js 22.13 or newer is required to run this script.
    pause
    exit /b 1
)

node "%~dp0reset-for-handover.cjs" %*
echo.
pause
