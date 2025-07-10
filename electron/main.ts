import { app, BrowserWindow, dialog, ipcMain,  } from 'electron'
import { fileURLToPath } from 'node:url'
import { ffmpegManager } from './ffmpegManager';
import ffmpegPath from '@ffmpeg-installer/ffmpeg';
import ffprobePath from '@ffprobe-installer/ffprobe';
import fluentFfmpeg from 'fluent-ffmpeg';
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
import { imageResizingHandler } from './image/imageResizing.ts';
import { imageBorderHandler } from './image/imageBorder.ts';
import { imagePixelatingHandler } from './image/imagePixelation.ts';
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
// AUDIOS
import { audioPitchHandler } from './audio/audioPitch.ts';
import { audioVolumeHandler } from './audio/audioVolume.ts';
import { audioSpeedHandler } from './audio/audioSpeed.ts';
import { audioOptimizeHandle } from './audio/audioOptimization.ts';
import { audioNormalizingHandler } from './audio/audioNormalize.ts';
import { audioReverseHandler } from './audio/audioReversing.ts';
import { audioConvertingHandler } from './audio/audioConverting.ts';
import { audioEchoHandler } from './audio/audioEcho.ts';
import { audioFadingHandler } from './audio/audioFading.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url))

process.env.APP_ROOT = path.join(__dirname, '..')

export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, 'public') : RENDERER_DIST

function configureFfmpeg() {
  if (process.env.NODE_ENV === 'development') {
    fluentFfmpeg.setFfmpegPath(ffmpegPath.path);
    fluentFfmpeg.setFfprobePath(ffprobePath.path);
  } else {
    fluentFfmpeg.setFfmpegPath(
      path.join(process.resourcesPath, 'ffmpeg', 'ffmpeg.exe')
    );
    fluentFfmpeg.setFfprobePath(
      path.join(process.resourcesPath, 'ffprobe', 'ffprobe.exe')
    );
  }
}

let win: BrowserWindow | null;

configureFfmpeg();

function createWindow() {
  win = new BrowserWindow({
    // icon: path.join(process.env.VITE_PUBLIC, 'electron-vite.svg'),
    icon: path.join(process.env.VITE_PUBLIC, 'toolbox-icon-nobg.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs')
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

  // Menu.setApplicationMenu(null);

  return win;
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') { // darwin is macos
    app.quit()
    win = null
  }
})

app.on('activate', () => {
  // On OS X (macos) it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

// (?) set default installation path to /User/<name>/AppData/...
app.setPath('userData', path.join(app.getPath('appData'), 'ToolboxPro'));

app.whenReady().then(() => {
  createWindow();
});

// IMAGES:
imageBrightnessHandler();
imageBlurringHandler();
imageSaturationHandler();
imageSharpnessHandler();
imageCompressionHandler();
imageNoiseHandler();
imageConversionHandler();
imageGrayscaleHandler();
imageResizingHandler();
imageBorderHandler();
imagePixelatingHandler();
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
// AUDIOS
audioPitchHandler();
audioVolumeHandler();
audioSpeedHandler();
audioOptimizeHandle();
audioNormalizingHandler();
audioReverseHandler();
audioConvertingHandler();
audioEchoHandler();
audioFadingHandler();
// OTHER
setupAutoUpdater();

ipcMain.handle('cancel-processing', (_, taskId: string) => {
  return { success: ffmpegManager.cancelProcess(taskId) };
});

// ipcMain.handle('dialog:openFile', async () => {
//   const result = await dialog.showOpenDialog({
//     properties: ['openFile']
//   })
//   return result;
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
    title: 'Save Processed File',
    defaultPath: defaultName,
    filters: [
      { name: 'Images', extensions: ['png', 'jpg', 'jpeg', 'bmp', 'webp', 'tiff', 'ico', 'ppm', 'svg', 'pgm', 'tga', 'avif', 'gif'] },
      { name: 'Videos', extensions: ['mp4', 'mkv', 'webm', 'mov', 'avi', 'flv', 'ogg'] },
      { name: 'Audios', extensions: ['mp3', 'wav', 'ogg', 'flac', 'm4a', 'aac', 'opus', 'alac'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  });
  return filePath; // will be undefined if user cancels
});