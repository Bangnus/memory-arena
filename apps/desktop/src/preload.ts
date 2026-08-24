import { contextBridge } from 'electron';

/**
 * Preload script for Electron.
 * Exposes a minimal API to the renderer process via contextBridge.
 * Currently only provides app version info.
 */
contextBridge.exposeInMainWorld('desktopApp', {
  /** Returns the app version string */
  getVersion: (): string => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const pkg = require('../../package.json');
    return pkg.version || '1.0.0';
  },
  /** Whether running inside the desktop app */
  isDesktop: true,
});
