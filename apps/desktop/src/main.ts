import { app, BrowserWindow, shell, dialog } from 'electron';
import { ChildProcess, spawn, exec } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
import * as net from 'net';

/** Port configuration */
const BACKEND_PORT = 3000;
const FRONTEND_PORT = 3001;

/** Paths for bundled resources (production) vs dev */
const IS_DEV = !app.isPackaged;

let mainWindow: BrowserWindow | null = null;
let backendProcess: ChildProcess | null = null;
let frontendProcess: ChildProcess | null = null;

let logFilePath = '';

function initLogger() {
  try {
    const userData = app.getPath('userData');
    if (!fs.existsSync(userData)) {
      fs.mkdirSync(userData, { recursive: true });
    }
    logFilePath = path.join(userData, 'server.log');
    fs.writeFileSync(logFilePath, `=== Memory Arena Server Log [${new Date().toISOString()}] ===\nApp Version: ${app.getVersion()}\nExec Path: ${process.execPath}\nUserData: ${userData}\n\n`);
  } catch (e) {
    console.error('Failed to initialize server.log:', e);
  }
}

function writeLog(prefix: string, msg: string) {
  if (!logFilePath) return;
  const line = `[${new Date().toISOString()}] ${prefix} ${msg}\n`;
  try {
    fs.appendFileSync(logFilePath, line);
  } catch (e) { }
}


// Ensure single application instance to prevent multiple instances clashing on port 3000/3001
const gotSingleInstanceLock = app.requestSingleInstanceLock();
if (!gotSingleInstanceLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
}

/**
 * Resolve resource paths depending on dev vs packaged mode.
 */
function getResourcePath(subPath: string): string {
  if (IS_DEV) {
    return path.resolve(__dirname, '..', '..', subPath);
  }
  return path.join(process.resourcesPath, subPath);
}

/**
 * Check if a TCP port is free, properly waiting for it to close if we bound to it.
 */
function checkPortFree(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.once('error', () => resolve(false));
    server.once('listening', () => {
      server.close(() => {
        resolve(true); // Wait until socket is completely closed before resolving
      });
    });
    server.listen(port, '0.0.0.0');
  });
}

/**
 * Forcefully kill any process on the port and wait until the port is truly free.
 */
async function ensurePortFree(port: number, timeoutMs: number = 5000): Promise<void> {
  if (process.platform === 'win32') {
    try {
      const stdout = await new Promise<string>((resolve) => {
        exec(`netstat -ano | findstr :${port}`, (err, out) => resolve(out || ''));
      });
      const lines = stdout.trim().split('\n');
      const pids = new Set<string>();
      for (const line of lines) {
        const parts = line.trim().split(/\s+/);
        const pid = parts[parts.length - 1];
        if (line.includes('LISTENING') && pid && pid !== '0' && pid !== String(process.pid)) {
          pids.add(pid);
        }
      }
      if (pids.size > 0) {
        console.log(`[Desktop] Found stale processes on port ${port}: PID ${Array.from(pids).join(', ')}. Killing...`);
        const killCommands = Array.from(pids).map((pid) => `taskkill /F /T /PID ${pid}`).join(' & ');
        await new Promise<void>((resolve) => {
          exec(killCommands, () => resolve());
        });
      }
    } catch (e) {
      console.error(`[Desktop] Failed to clean port ${port}:`, e);
    }
  }

  // Poll until the port is actually free
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const isFree = await checkPortFree(port);
    if (isFree) return;
    await new Promise((r) => setTimeout(r, 500));
  }

  throw new Error(`Port ${port} is currently locked by another application. Please close the application using port ${port} and try again.`);
}

/**
 * Wait for a port to become available (server started).
 */
function waitForPort(port: number, timeoutMs: number = 30000): Promise<void> {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    const check = () => {
      if (Date.now() - start > timeoutMs) {
        return reject(new Error(`Port ${port} did not become available within ${timeoutMs}ms`));
      }

      const socket = new net.Socket();
      let hasFinished = false;

      const finish = (success: boolean) => {
        if (hasFinished) return;
        hasFinished = true;
        socket.destroy();
        if (success) {
          resolve();
        } else {
          setTimeout(check, 500);
        }
      };

      socket.setTimeout(2000);
      socket.once('connect', () => finish(true));
      socket.once('error', () => finish(false));
      socket.once('timeout', () => finish(false));

      socket.connect(port, '127.0.0.1');
    };

    check();
  });
}

/**
 * Start the NestJS backend server.
 */
async function startBackend(): Promise<void> {
  await ensurePortFree(BACKEND_PORT, 5000);

  console.log('[Desktop] Starting NestJS backend...');

  if (IS_DEV) {
    // In dev mode, run from the backend directory
    const backendDir = path.resolve(__dirname, '..', '..', 'backend');
    backendProcess = spawn('node', ['-e', `
      process.chdir('${backendDir.replace(/\\/g, '/')}');
      require('${backendDir.replace(/\\/g, '/')}/dist/src/main.js');
    `], {
      env: {
        ...process.env,
        PORT: String(BACKEND_PORT),
        DATABASE_URL: `file:${path.resolve(backendDir, 'data', 'memory_arena.db').replace(/\\/g, '/')}`,
        NODE_ENV: 'development',
      },
      stdio: ['ignore', 'pipe', 'pipe'],
    });
  } else {
    // In production, use bundled resources
    const backendDist = getResourcePath('backend');
    const backendNodeModules = getResourcePath('backend-node_modules');
    const backendPrisma = getResourcePath('backend-prisma');
    const dataDir = getResourcePath('backend-data');

    // Ensure data directory exists (writable copy in userData)
    const userDataDir = path.join(app.getPath('userData'), 'data');
    if (!fs.existsSync(userDataDir)) {
      fs.mkdirSync(userDataDir, { recursive: true });
    }

    // Copy database if doesn't exist in user data
    const dbTarget = path.join(userDataDir, 'memory_arena.db');
    if (!fs.existsSync(dbTarget)) {
      const dbSource = path.join(dataDir, 'memory_arena.db');
      if (fs.existsSync(dbSource)) {
        fs.copyFileSync(dbSource, dbTarget);
      }
    }

    backendProcess = spawn(process.execPath, [
      path.join(backendDist, 'src', 'main.js'),
    ], {
      env: {
        ...process.env,
        ELECTRON_RUN_AS_NODE: '1',
        PORT: String(BACKEND_PORT),
        DATABASE_URL: `file:${dbTarget.replace(/\\/g, '/')}`,
        NODE_MODULES_PATH: backendNodeModules,
        NODE_PATH: backendNodeModules,
        PRISMA_SCHEMA_PATH: path.join(backendPrisma, 'schema.prisma'),
        NODE_ENV: 'production',
      },
      cwd: backendDist,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
  }

  const recentBackendLogs: string[] = [];

  const addLog = (text: string, isErr: boolean) => {
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    for (const line of lines) {
      if (isErr) console.error(`[Backend ERR] ${line}`);
      else console.log(`[Backend] ${line}`);

      writeLog(isErr ? '[Backend ERR]' : '[Backend]', line);

      recentBackendLogs.push(line);
      if (recentBackendLogs.length > 20) recentBackendLogs.shift();
    }
  };

  if (backendProcess?.stdout) {
    backendProcess.stdout.on('data', (data: Buffer) => {
      addLog(data.toString(), false);
    });
  }
  if (backendProcess?.stderr) {
    backendProcess.stderr.on('data', (data: Buffer) => {
      addLog(data.toString(), true);
    });
  }

  let backendExitedEarly = false;
  let backendExitCode: number | null = null;
  backendProcess?.on('exit', (code) => {
    writeLog('[Desktop]', `Backend exited with code ${code}`);
    console.log(`[Desktop] Backend exited with code ${code}`);
    backendExitedEarly = true;
    backendExitCode = code;
    backendProcess = null;
  });
  backendProcess?.on('error', (err) => {
    writeLog('[Desktop ERR]', `Backend spawn error: ${err.message}`);
    console.error(`[Desktop] Backend spawn error:`, err);
    backendExitedEarly = true;
    addLog(`Spawn Error: ${err.message}`, true);
  });

  try {
    await waitForPort(BACKEND_PORT, 30000);
    writeLog('[Desktop]', 'Backend is ready.');
    console.log('[Desktop] Backend is ready.');
  } catch (err) {
    const details = recentBackendLogs.length > 0 ? `\n\nRecent Logs:\n${recentBackendLogs.join('\n')}` : `\n\nProcess exited with code ${backendExitCode}`;
    throw new Error(`${err instanceof Error ? err.message : 'Port 3000 did not start'}.${details}\n\nPlease check server.log at: ${logFilePath}`);
  }
}

/**
 * Start the Next.js frontend server.
 */
async function startFrontend(): Promise<void> {
  // Ensure the port is entirely free before spawning, kill zombies if needed
  await ensurePortFree(FRONTEND_PORT, 5000);

  console.log('[Desktop] Starting Next.js frontend...');

  if (IS_DEV) {
    const frontendDir = path.resolve(__dirname, '..', '..', 'frontend');
    const nextBin = path.resolve(frontendDir, 'node_modules', '.bin', 'next');
    frontendProcess = spawn(nextBin, ['start', '-p', String(FRONTEND_PORT)], {
      cwd: frontendDir,
      env: {
        ...process.env,
        NODE_ENV: 'production',
        NEXT_PUBLIC_API_URL: `http://localhost:${BACKEND_PORT}`,
        NEXT_PUBLIC_WS_URL: `http://localhost:${BACKEND_PORT}`,
        NEXT_PUBLIC_AUTH_GATEWAY_URL: process.env.NEXT_PUBLIC_AUTH_GATEWAY_URL || 'https://memory-arena-auth-gateway.vercel.app',
      },
      stdio: ['ignore', 'pipe', 'pipe'],
      shell: true,
    });
  } else {
    const standaloneDir = getResourcePath('frontend-standalone');
    const frontendNodeModules = getResourcePath('frontend-node_modules');
    const backendNodeModules = getResourcePath('backend-node_modules');
    const serverJsNested = path.join(standaloneDir, 'apps', 'frontend', 'server.js');
    const serverJsFlat = path.join(standaloneDir, 'server.js');
    const serverJs = fs.existsSync(serverJsNested) ? serverJsNested : serverJsFlat;
    const serverCwd = path.dirname(serverJs);

    const nodePaths = [
      frontendNodeModules,
      path.join(standaloneDir, 'node_modules'),
      path.join(standaloneDir, 'apps', 'frontend', 'node_modules'),
      backendNodeModules,
    ].join(path.delimiter);

    frontendProcess = spawn(process.execPath, [serverJs], {
      cwd: serverCwd,
      env: {
        ...process.env,
        ELECTRON_RUN_AS_NODE: '1',
        PORT: String(FRONTEND_PORT),
        HOSTNAME: '127.0.0.1',
        NODE_ENV: 'production',
        NODE_PATH: nodePaths,
        NEXT_PUBLIC_API_URL: `http://localhost:${BACKEND_PORT}`,
        NEXT_PUBLIC_WS_URL: `http://localhost:${BACKEND_PORT}`,
        NEXT_PUBLIC_AUTH_GATEWAY_URL: process.env.NEXT_PUBLIC_AUTH_GATEWAY_URL || 'https://memory-arena-auth-gateway.vercel.app',
      },
      stdio: ['ignore', 'pipe', 'pipe'],
    });
  }

  const recentFrontendLogs: string[] = [];

  const addFrontendLog = (text: string, isErr: boolean) => {
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    for (const line of lines) {
      if (isErr) console.error(`[Frontend ERR] ${line}`);
      else console.log(`[Frontend] ${line}`);

      writeLog(isErr ? '[Frontend ERR]' : '[Frontend]', line);

      recentFrontendLogs.push(line);
      if (recentFrontendLogs.length > 20) recentFrontendLogs.shift();
    }
  };

  if (frontendProcess?.stdout) {
    frontendProcess.stdout.on('data', (data: Buffer) => {
      addFrontendLog(data.toString(), false);
    });
  }
  if (frontendProcess?.stderr) {
    frontendProcess.stderr.on('data', (data: Buffer) => {
      addFrontendLog(data.toString(), true);
    });
  }

  let frontendExitedEarly = false;
  let frontendExitCode: number | null = null;
  frontendProcess?.on('exit', (code) => {
    writeLog('[Desktop]', `Frontend exited with code ${code}`);
    console.log(`[Desktop] Frontend exited with code ${code}`);
    frontendExitedEarly = true;
    frontendExitCode = code;
    frontendProcess = null;
  });
  frontendProcess?.on('error', (err) => {
    writeLog('[Desktop ERR]', `Frontend spawn error: ${err.message}`);
    console.error(`[Desktop] Frontend spawn error:`, err);
    frontendExitedEarly = true;
    addFrontendLog(`Spawn Error: ${err.message}`, true);
  });

  try {
    await waitForPort(FRONTEND_PORT, 30000);
    writeLog('[Desktop]', 'Frontend is ready.');
    console.log('[Desktop] Frontend is ready.');
  } catch (err) {
    const details = recentFrontendLogs.length > 0 ? `\n\nRecent Logs:\n${recentFrontendLogs.join('\n')}` : `\n\nProcess exited with code ${frontendExitCode}`;
    throw new Error(`${err instanceof Error ? err.message : 'Port 3001 did not start'}.${details}\n\nPlease check server.log at: ${logFilePath}`);
  }
}

/**
 * Create the main application window.
 */
function createWindow(): void {
  const iconPath = IS_DEV
    ? path.resolve(__dirname, '..', 'build', 'icon.ico')
    : path.join(process.resourcesPath, '..', 'build', 'icon.ico');

  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 700,
    icon: fs.existsSync(iconPath) ? iconPath : undefined,
    title: 'Memory Arena',
    backgroundColor: '#0F172A',
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // Show window when ready to avoid white flash
  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
    mainWindow?.focus();
  });

  mainWindow.loadURL(`http://localhost:${FRONTEND_PORT}`);

  // Open external links in default browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http')) {
      shell.openExternal(url);
    }
    return { action: 'deny' };
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Remove menu bar for clean game look
  mainWindow.setMenuBarVisibility(false);
}

/**
 * Kill all child processes forcefully using taskkill on Windows.
 */
function killChildProcesses(): void {
  if (frontendProcess?.pid) {
    console.log('[Desktop] Stopping frontend process tree...');
    try {
      if (process.platform === 'win32') {
        exec(`taskkill /F /T /PID ${frontendProcess.pid}`, () => { });
      } else {
        frontendProcess.kill('SIGKILL');
      }
    } catch { }
    frontendProcess = null;
  }
  if (backendProcess?.pid) {
    console.log('[Desktop] Stopping backend process tree...');
    try {
      if (process.platform === 'win32') {
        exec(`taskkill /F /T /PID ${backendProcess.pid}`, () => { });
      } else {
        backendProcess.kill('SIGKILL');
      }
    } catch { }
    backendProcess = null;
  }
}

/**
 * Application entry point.
 */
app.whenReady().then(async () => {
  initLogger();
  writeLog('[Desktop]', `App ready. Platform: ${process.platform}, Arch: ${process.arch}, IS_DEV: ${IS_DEV}`);
  if (!gotSingleInstanceLock) return;

  try {
    await startBackend();
    await startFrontend();
    createWindow();
  } catch (error) {
    const errMsg = error instanceof Error ? error.stack || error.message : String(error);
    writeLog('[Desktop CRITICAL]', `Startup failed: ${errMsg}`);
    console.error('[Desktop] Startup failed:', error);
    dialog.showErrorBox(
      'Memory Arena - Startup Error',
      `Failed to start the game servers.\n\n${error instanceof Error ? error.message : String(error)}\n\nPlease try restarting the application.`
    );
    killChildProcesses();
    app.quit();
  }
});

app.on('window-all-closed', () => {
  killChildProcesses();
  app.quit();
});

app.on('before-quit', () => {
  killChildProcesses();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

