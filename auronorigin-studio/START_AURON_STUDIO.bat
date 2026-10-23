@echo off
chcp 65001 >nul
title AuronOrigin YouTube Video Studio
cd /d "%~dp0"

echo ==========================================================
echo   AURONORIGIN YOUTUBE VIDEO STUDIO
echo   Powered by Arena API ^& Arena Router (coding-router-preview)
echo ==========================================================

if not exist ".venv\Scripts\python.exe" (
    echo [1/3] Erstelle Python-Umgebung...
    python -m venv .venv
    call .venv\Scripts\pip.exe install --upgrade pip
    call .venv\Scripts\pip.exe install -r requirements.txt
)

where npm >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    if not exist "node_modules\onnxruntime-web\dist" (
        echo [2/3] Lade WebAssembly-Komponenten fuer lokale Sprachsynthese...
        call npm install --no-audit --no-fund
    )
)

echo [3/3] Starte AuronOrigin Studio auf http://localhost:8000 ...
start "" "http://localhost:8000"
call .venv\Scripts\python.exe -m uvicorn backend.app:app --host 0.0.0.0 --port 8000
pause
