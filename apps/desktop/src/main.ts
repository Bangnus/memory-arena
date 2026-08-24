import { app, BrowserWindow, shell, dialog } from 'electron';
import { ChildProcess, fork, spawn } from 'child_process';
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
 * Check if a TCP port is already in use.
 */
function isPortInUse(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.once('error', () => resolve(true));
    server.once('listening', () => {
      server.close();
      resolve(false);
    });
    server.listen(port, '127.0.0.1');
  });
}

/**
 * Wait for a port to become available (server started).
 */
function waitForPort(port: number, timeoutMs: number = 30000): Promise<void> {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    const check = () => {
      const socket = new net.Socket();
      socket.setTimeout(500);
      socket.once('connect', () => {
        socket.destroy();
        resolve();
      });
      socket.once('error', () => {
        socket.destroy();
        if (Date.now() - start > timeoutMs) {
          reject(new Error(`Port ${port} did not become available within ${timeoutMs}ms`));
        } else {
          setTimeout(check, 300);
        }
      });
      socket.once('timeout', () => {
        socket.destroy();
        setTimeout(check, 300);
      });
      socket.connect(port, '127.0.0.1');
    };
    check();
  });
}

/**
 * Start the NestJS backend server.
 */
async function startBackend(): Promise<void> {
  const portBusy = await isPortInUse(BACKEND_PORT);
  if (portBusy) {
    console.log(`[Desktop] Backend port ${BACKEND_PORT} already in use, skipping spawn.`);
    return;
  }

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

  if (backendProcess?.stdout) {
    backendProcess.stdout.on('data', (data: Buffer) => {
      console.log(`[Backend] ${data.toString().trim()}`);
    });
  }
  if (backendProcess?.stderr) {
    backendProcess.stderr.on('data', (data: Buffer) => {
      const errText = data.toString().trim();
      console.error(`[Backend ERR] ${errText}`);
      recentBackendLogs.push(errText);
      if (recentBackendLogs.length > 8) recentBackendLogs.shift();
    });
  }

  let backendExitedEarly = false;
  let backendExitCode: number | null = null;
  backendProcess?.on('exit', (code) => {
    console.log(`[Desktop] Backend exited with code ${code}`);
    backendExitedEarly = true;
    backendExitCode = code;
    backendProcess = null;
  });

  try {
    await waitForPort(BACKEND_PORT, 30000);
    console.log('[Desktop] Backend is ready.');
  } catch (err) {
    if (backendExitedEarly || recentBackendLogs.length > 0) {
      const details = recentBackendLogs.length > 0 ? `\n\nError output:\n${recentBackendLogs.join('\n')}` : `\n\nProcess exited with code ${backendExitCode}`;
      throw new Error(`Port ${BACKEND_PORT} did not start.${details}`);
    }
    throw err;
  }
}

/**
 * Start the Next.js frontend server.
 */
async function startFrontend(): Promise<void> {
  const portBusy = await isPortInUse(FRONTEND_PORT);
  if (portBusy) {
    console.log(`[Desktop] Frontend port ${FRONTEND_PORT} already in use, skipping spawn.`);
    return;
  }

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

  if (frontendProcess?.stdout) {
    frontendProcess.stdout.on('data', (data: Buffer) => {
      console.log(`[Frontend] ${data.toString().trim()}`);
    });
  }
  if (frontendProcess?.stderr) {
    frontendProcess.stderr.on('data', (data: Buffer) => {
      const errText = data.toString().trim();
      console.error(`[Frontend ERR] ${errText}`);
      recentFrontendLogs.push(errText);
      if (recentFrontendLogs.length > 8) recentFrontendLogs.shift();
    });
  }

  let frontendExitedEarly = false;
  let frontendExitCode: number | null = null;
  frontendProcess?.on('exit', (code) => {
    console.log(`[Desktop] Frontend exited with code ${code}`);
    frontendExitedEarly = true;
    frontendExitCode = code;
    frontendProcess = null;
  });

  try {
    await waitForPort(FRONTEND_PORT, 30000);
    console.log('[Desktop] Frontend is ready.');
  } catch (err) {
    if (frontendExitedEarly || recentFrontendLogs.length > 0) {
      const details = recentFrontendLogs.length > 0 ? `\n\nError output:\n${recentFrontendLogs.join('\n')}` : `\n\nProcess exited with code ${frontendExitCode}`;
      throw new Error(`Port ${FRONTEND_PORT} did not start.${details}`);
    }
    throw err;
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
 * Kill all child processes on shutdown.
 */
function killChildProcesses(): void {
  if (frontendProcess && !frontendProcess.killed) {
    console.log('[Desktop] Stopping frontend...');
    frontendProcess.kill('SIGTERM');
    frontendProcess = null;
  }
  if (backendProcess && !backendProcess.killed) {
    console.log('[Desktop] Stopping backend...');
    backendProcess.kill('SIGTERM');
    backendProcess = null;
  }
}

/**
 * Application entry point.
 */
app.whenReady().then(async () => {
  try {
    await startBackend();
    await startFrontend();
    createWindow();
  } catch (error) {
    console.error('[Desktop] Startup failed:', error);
    dialog.showErrorBox(
      'Memory Arena - Startup Error',
      `Failed to start the game servers.\n\n${error instanceof Error ? error.message : String(error)}\n\nPlease try restarting the application.`
    );
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
