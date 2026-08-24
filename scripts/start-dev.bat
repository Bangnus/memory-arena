@echo off
title Memory Arena - Dev Mode
color 0a

cd /d "%~dp0.."

echo ===================================================
echo             MEMORY ARENA - DEV LAUNCHER            
echo ===================================================
echo [1/3] Syncing Local Database (SQLite)...
cd apps\backend
call npx prisma db push
cd /d "%~dp0.."

echo [2/3] Starting Backend in Dev Mode...
start "Memory Arena Backend (Dev)" cmd /k "cd /d \"%~dp0..\\apps\\backend\" && npm run start:dev"

echo [3/3] Starting Frontend in Dev Mode...
start "Memory Arena Frontend (Dev)" cmd /k "cd /d \"%~dp0..\\apps\\frontend\" && npm run dev"

echo.
echo Opening browser...
timeout /t 4 /nobreak >nul
start http://localhost:3001

echo Dev environment started!
