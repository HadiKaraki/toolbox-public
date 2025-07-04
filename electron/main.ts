import { app, BrowserWindow, dialog, ipcMain, Menu } from 'electron'
// import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import { ffmpegManager } from './ffmpegManager';
import path from 'node:path'
import { setupAutoUpdater } from './autoUpdater';
import fs from 'fs/promises'; // Using promises API for cleaner async code

// IMAGES
import { imageBrightnessHandler } from './image/imageBrightness.ts'
import { imageBlurringHandler } from './image/imageBlurring.ts'
import { imageSaturationHandler } from './image/imageSaturation.ts'
import { imageSharpnessHandler } from './image/imageSharpening.ts'
import { imageCompressionHandler } from './image/imageCompression.ts';
import { imageNoiseHandler } from './image/imageNoise.ts';
import { imageConversionHandler } from './image/imageConversion.ts';
import { imageGrayscaleHandler } from './image/imageGrayscale.ts';
// VIDEOS
import { changeFpsHandler } from './video/videoChangeFps.ts';
import { compressVideoHandler } from './video/videoCompressing.ts';
import { convertVideoHandler } from './video/videoConversion.ts';
import { videoEqualizerHandler } from './video/videoEqualizer.ts';
import { extractAudioHandler } from './video/videoExtractAudio.ts';
import { videoPlaybackHandler } from './video/videoPlaybackSpeed.ts';
import { trimVideoHandler } from './video/videoTrimming.ts';
import { videoVolumeHandler } from './video/videoVolumeAdjust.ts';
import { videoStabilizationHandler } from './video/videoStabilization.ts';

// const require = createRequire(import.meta.url)
const __dirname = path.dirname(fileURLToPath(import.meta.url))

process.env.APP_ROOT = path.join(__dirname, '..')

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, 'public') : RENDERER_DIST

let win: BrowserWindow | null

const isProduction = process.env.NODE_ENV === 'production';

function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, 'electron-vite.svg'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
      devTools: !isProduction // Enable devTools only in development
    },
  })

  // Test active push message to Renderer-process.
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', (new Date).toLocaleString())
  })

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
  } else {
    // win.loadFile('dist/index.html')
    win.loadFile(path.join(RENDERER_DIST, 'index.html'))
  }

  if (isProduction) {
    // Remove menu completely in production
    Menu.setApplicationMenu(null);
  } else {
    // Keep developer tools available in development
    win.webContents.openDevTools();
  }

  return win;
}

// let updateWindow: BrowserWindow | null = null;

// function createUpdaterWindow(): BrowserWindow {
//   const win = new BrowserWindow({
//     width: 400,
//     height: 300,
//     show: false, // Don't show immediately
//     webPreferences: {
//       preload: path.join(__dirname, 'preload.mjs'),
//       nodeIntegration: false,
//       contextIsolation: true
//     },
//     modal: true, // Make it modal to main window
//     parent: BrowserWindow.getFocusedWindow() || undefined,
//     skipTaskbar: true // Don't show in taskbar
//   });

//   // Load your updater UI
//   if (process.env.VITE_DEV_SERVER_URL) {
//     win.loadURL(`${process.env.VITE_DEV_SERVER_URL}/updater.html`);
//   } else {
//     win.loadFile(path.join(__dirname, '../renderer/updater.html'));
//   }

//   win.on('ready-to-show', () => win?.show());
//   win.on('closed', () => { updateWindow = null; });

//   return win;
// }

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    win = null
  }
})

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

app.setPath('userData', path.join(app.getPath('appData'), 'ToolboxPro'));

app.whenReady().then(() => {
  createWindow();
});

// Processing Handles

// Worker codes from main toolbox web app
// IMAGES:
imageBrightnessHandler();
imageBlurringHandler();
imageSaturationHandler();
imageSharpnessHandler();
imageCompressionHandler();
imageNoiseHandler();
imageConversionHandler();
imageGrayscaleHandler();
// VIDEOS
changeFpsHandler();
convertVideoHandler();
compressVideoHandler();
videoEqualizerHandler();
videoPlaybackHandler();
extractAudioHandler();
trimVideoHandler();
videoVolumeHandler();
videoStabilizationHandler();

// OTHER
setupAutoUpdater();

ipcMain.handle('cancel-processing', (_, taskId: string) => {
  return { success: ffmpegManager.cancelProcess(taskId) };
});

ipcMain.handle('dialog:openFile', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openFile']
  })
  return result;
});

// ipcMain.handle('show-update-window', async () => {
//   // Only create updaterWindow if you need a separate window
//   updateWindow = createUpdaterWindow();
//   setupAutoUpdater(updateWindow);
// });

// the _ in event means “I know there is a parameter here but I don’t use it”, to ignore the warnings.
ipcMain.handle('create-temp-file', async (_event, { data, extension }) => {
  try {
    // Get system temp directory
    const tempDir = app.getPath('temp');
    
    // Create unique filename with timestamp
    const tempFileName = `temp-image-${Date.now()}${extension.startsWith('.') ? extension : `.${extension}`}`;
    const tempPath = path.join(tempDir, tempFileName);
    
    // Write the file buffer to temp location
    await fs.writeFile(tempPath, Buffer.from(data));
    
    return { 
      success: true, 
      path: tempPath 
    };
  } catch (error) {
    console.error('Error creating temp file:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Unknown error creating temp file' 
    };
  }
});

ipcMain.handle('show-save-dialog', async (_event, defaultName) => {
  const { filePath } = await dialog.showSaveDialog({
    title: 'Save Processed Image',
    defaultPath: defaultName,
    filters: [
      { name: 'Images', extensions: ['png', 'jpg', 'jpeg', 'webp'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  });
  return filePath; // will be undefined if user cancels
});

// For file saving
// ipcMain.handle('save-image-dialog', async (_, defaultFilename) => {
//   const { filePath } = await dialog.showSaveDialog({
//       title: 'Save Processed Image',
//       defaultPath: defaultFilename,
//       filters: [
//         { name: 'Images', extensions: ['png', 'jpg', 'jpeg', 'webp'] }
//       ]
//   });
//   return filePath;
// });