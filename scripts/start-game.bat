@echo off
title Memory Arena Game Launcher
color 0b

cd /d "%~dp0.."

echo ===================================================
echo             MEMORY ARENA - GAME LAUNCHER           
echo ===================================================
echo [1/3] Syncing Local Database (SQLite Zero-Config)...
cd apps\backend
call npx prisma db push
cd /d "%~dp0.."

echo [2/3] Starting Local Game Engine (NestJS)...
start "Memory Arena Backend" cmd /k "cd /d \"%~dp0..\\apps\\backend\" && npm run start:dev"

echo [3/3] Starting Game Interface (Next.js)...
start "Memory Arena Frontend" cmd /k "cd /d \"%~dp0..\\apps\\frontend\" && npm run dev"

echo.
echo Waiting for game services to initialize...
timeout /t 4 /nobreak >nul

echo.
echo Launching Memory Arena Game Screen...
start http://localhost:3001

echo ===================================================
echo Game is running at http://localhost:3001
echo To stop the game, close this window or press Ctrl+C.
echo ===================================================
pause
