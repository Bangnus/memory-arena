# Memory Arena Game Launcher for PowerShell
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "            MEMORY ARENA - GAME LAUNCHER           " -ForegroundColor Cyan
Write-Host "===================================================" -ForegroundColor Cyan

$rootDir = $PSScriptRoot
if (-not $rootDir) { $rootDir = (Get-Location).Path }

Write-Host "[1/3] Database Ready (SQLite Zero-Config)..." -ForegroundColor Green

Write-Host "[2/3] Starting Backend (NestJS on Port 3000)..." -ForegroundColor Yellow
Start-Process -FilePath "cmd.exe" -ArgumentList "/k title Backend && cd /d `"$rootDir\apps\backend`" && npm.cmd run start:dev"

Write-Host "[3/3] Starting Frontend (Next.js on Port 3001)..." -ForegroundColor Yellow
Start-Process -FilePath "cmd.exe" -ArgumentList "/k title Frontend && cd /d `"$rootDir\apps\frontend`" && npm.cmd run dev"

Write-Host ""
Write-Host "Opening game screen at http://localhost:3001 in 4 seconds..." -ForegroundColor Cyan
Start-Sleep -Seconds 4

Start-Process "http://localhost:3001"

Write-Host ""
Write-Host "Game is running at http://localhost:3001" -ForegroundColor Green
Write-Host "To stop the game, close the Backend and Frontend command windows." -ForegroundColor Gray
