import { autoUpdater } from 'electron-updater';
import { app, BrowserWindow, ipcMain, dialog } from 'electron';

export function setupAutoUpdater() {
  autoUpdater.autoDownload = false; // Let user decide to download
  autoUpdater.autoInstallOnAppQuit = true; // Auto install on quit if downloaded
  autoUpdater.allowDowngrade = false;

  // Check for updates
  ipcMain.handle('check-for-updates', async () => {
    try {
      const result = await autoUpdater.checkForUpdates();

      // If the update is not actually newer, rely on the event instead
      if (result?.updateInfo?.version === app.getVersion()) {
        return {
          available: false,
          isLatest: true,
          currentVersion: app.getVersion()
        };
      }

      return {
        available: true,
        version: result?.updateInfo.version,
        releaseNotes: result?.updateInfo.releaseNotes,
        isLatest: false
      };

    } catch (error) {
      return {
        available: false,
        error: error instanceof Error ? error.message : String(error),
        isLatest: true
      };
    }
  });

  // Download updates
  ipcMain.handle('download-update', async () => {
    try {
       // First verify there's actually an update available
      const checkResult = await autoUpdater.checkForUpdates();
      if (checkResult?.updateInfo.version === app.getVersion()) {
        throw new Error('No update available to download');
      }

      await autoUpdater.downloadUpdate();
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        isLatest: true
      };
    }
  });

  // Install update
  ipcMain.handle('quit-and-install', () => {
    autoUpdater.quitAndInstall();
  });

  // Progress events
  autoUpdater.on('download-progress', (progress) => {
    const windows = BrowserWindow.getAllWindows();
    windows.forEach(window => {
      window.webContents.send('update-download-progress', progress);
    });
  });

  // Add this block for the update ready dialog
  autoUpdater.on('update-downloaded', (info) => {
    const windows = BrowserWindow.getAllWindows();
    windows.forEach(window => {
      // Send to renderer (optional)
      window.webContents.send('update-downloaded', {
        version: info.version
      });
      
      // Show native dialog
      dialog.showMessageBox(window, {
        type: 'info',
        buttons: ['Restart Now', 'Later'],
        title: 'Update Ready',
        message: `Version ${info.version} has been downloaded.`,
        detail: 'Restart the application to apply the updates.',
        cancelId: 1 // Index of 'Later' button
      }).then(({ response }) => {
        if (response === 0) { // 'Restart Now' clicked
          autoUpdater.quitAndInstall();
        }
      });
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