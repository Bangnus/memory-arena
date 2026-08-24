@echo off
title Memory Arena - Dev Mode
color 0a

echo ===================================================
echo             MEMORY ARENA - DEV LAUNCHER            
echo ===================================================
echo [1/3] Syncing Local Database (SQLite)...
cd apps\backend
call npx prisma db push --skip-generate
cd ..\..

echo [2/3] Starting Backend in Dev Mode...
start "Memory Arena Backend (Dev)" cmd /k "cd apps\backend && npm run start:dev"

echo [3/3] Starting Frontend in Dev Mode...
start "Memory Arena Frontend (Dev)" cmd /k "cd apps\frontend && npm run dev"

echo.
echo Opening browser...
timeout /t 3 /nobreak >nul
start http://localhost:3001

echo Dev environment started!
