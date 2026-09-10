# LAND2BIZ dev launcher — starts the FastAPI backend (port 8000) and Next.js web app (port 3001).
# Usage:  powershell -ExecutionPolicy Bypass -File scripts\start_dev.ps1

$root = Split-Path -Parent $PSScriptRoot

Write-Host "Starting API backend on http://127.0.0.1:8000 ..." -ForegroundColor Cyan
Start-Process -WorkingDirectory "$root\apps\api" -FilePath "venv\Scripts\python.exe" `
  -ArgumentList "-m", "uvicorn", "app.main:app", "--port", "8000"

Write-Host "Starting web app on http://localhost:3001 ..." -ForegroundColor Cyan
Start-Process -WorkingDirectory "$root\apps\web" -FilePath "cmd.exe" `
  -ArgumentList "/c", "npm run dev"

Write-Host ""
Write-Host "API  -> http://127.0.0.1:8000/health"    -ForegroundColor Green
Write-Host "Web  -> http://localhost:3001"           -ForegroundColor Green
Write-Host "Close the two spawned windows to stop both servers."
