# apps/desktop - AGENTS.md

## Purpose
Electron wrapper that packages Memory Arena as a standalone Windows desktop application.

## Architecture
- `src/main.ts` — Electron main process: spawns backend + frontend, creates BrowserWindow
- `src/preload.ts` — Context bridge for renderer
- `build/icon.ico` — Windows app icon (converted from frontend icon.png)
- `release/` — Output directory for built installers (gitignored)

## Key Behaviors
- Spawns NestJS backend on port 3000 as child process
- Spawns Next.js frontend on port 3001 as child process
- Waits for both ports before showing the window
- Clean shutdown kills all child processes
- Database file is copied to user data directory on first run

## Build
```bash
npm run dist:win
```

## Development
```bash
npm run dev
```
Requires backend and frontend to be pre-built (`npm run build` in each).
