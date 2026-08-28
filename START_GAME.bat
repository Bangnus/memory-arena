@echo off
title Memory Arena Game Launcher (Production)
color 0b

echo ===================================================
echo        MEMORY ARENA - GAME LAUNCHER (PROD)           
echo ===================================================
cd /d "%~dp0"

echo [1/3] Database Ready (SQLite Zero-Config)...

echo [2/3] Starting Backend (Production on Port 3000)...
start "Backend" /d "%~dp0apps\backend" cmd.exe /k "npm.cmd run start:prod"

echo [3/3] Starting Frontend (Production on Port 3001)...
start "Frontend" /d "%~dp0apps\frontend" cmd.exe /k "npm.cmd run start"

echo.
echo ===================================================
echo Services starting! Opening browser in 4 seconds...
echo ===================================================
timeout /t 4 /nobreak >nul

start http://localhost:3001

echo.
echo Game interface opened at http://localhost:3001
echo To stop the game, close the terminal windows.
