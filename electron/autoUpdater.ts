import { autoUpdater } from 'electron-updater';
import { BrowserWindow, ipcMain } from 'electron';

export function setupAutoUpdater() {

  autoUpdater.autoDownload = false; // Let user decide to download
  autoUpdater.autoInstallOnAppQuit = true; // Auto install on quit if downloaded

  // Check for updates
  ipcMain.handle('check-for-updates', async () => {
    try {
      const result = await autoUpdater.checkForUpdates();
      return {
        available: true,
        version: result?.updateInfo.version,
        releaseNotes: result?.updateInfo.releaseNotes
      };
    } catch (error) {
      return { available: false, error: error instanceof Error ? error.message : String(error) };
    }
  });

  // Download updates
  ipcMain.handle('download-update', async () => {
    try {
      await autoUpdater.downloadUpdate();
      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
  });

  // Install update
  ipcMain.handle('quit-and-install', () => {
    autoUpdater.quitAndInstall();
  });

  // Progress events
  autoUpdater.on('download-progress', (progress) => {
    // Send to all windows (or you can target specific window)
    const windows = BrowserWindow.getAllWindows();
    windows.forEach(window => {
      window.webContents.send('update-download-progress', progress);
    });
  });

  autoUpdater.on('error', (error) => {
    const windows = BrowserWindow.getAllWindows();
    windows.forEach(window => {
      window.webContents.send('update-error', {
        message: error.message,
        stack: error.stack
      });
    });
  });
}