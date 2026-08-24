@echo off
title Memory Arena Game Launcher
color 0b

echo ===================================================
echo             MEMORY ARENA - GAME LAUNCHER           
echo ===================================================
cd /d "%~dp0"

echo [1/3] Database Ready (SQLite Zero-Config)...

echo [2/3] Starting Backend (NestJS on Port 3000)...
start "Memory Arena Backend" cmd.exe /k "title Backend && cd /d \"%~dp0apps\backend\" && npm.cmd run start:dev"

echo [3/3] Starting Frontend (Next.js on Port 3001)...
start "Memory Arena Frontend" cmd.exe /k "title Frontend && cd /d \"%~dp0apps\frontend\" && npm.cmd run dev"

echo.
echo ===================================================
echo Services starting! Opening browser in 4 seconds...
echo ===================================================
timeout /t 4 /nobreak >nul

start http://localhost:3001

echo.
echo Game interface opened at http://localhost:3001
echo To stop the game, close the terminal windows.
