@echo off
title Memory Arena Game Launcher
color 0b

echo ===================================================
echo             MEMORY ARENA - GAME LAUNCHER           
echo ===================================================
echo [1/3] Syncing Local Database (SQLite Zero-Config)...
cd apps\backend
call npx prisma db push --skip-generate
cd ..\..

echo [2/3] Starting Local Game Engine (NestJS)...
start "Memory Arena Backend" /min cmd /c "cd apps\backend && npm run start:prod"

echo [3/3] Starting Game Interface (Next.js)...
start "Memory Arena Frontend" /min cmd /c "cd apps\frontend && npm run start"

echo.
echo Waiting for game services to initialize...
timeout /t 3 /nobreak >nul

echo.
echo Launching Memory Arena Game Screen...
start http://localhost:3001

echo ===================================================
echo Game is running at http://localhost:3001
echo To stop the game, close this window or press Ctrl+C.
echo ===================================================
pause
