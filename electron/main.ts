import { app, BrowserWindow, dialog, ipcMain,  } from 'electron'
import { fileURLToPath } from 'node:url'
import { ffmpegManager } from './ffmpegManager';
import path from 'node:path'
import fs from 'fs/promises'; // Using promises API for cleaner async code

const __dirname = path.dirname(fileURLToPath(import.meta.url))

process.env.APP_ROOT = path.join(__dirname, '..')

export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, 'public') : RENDERER_DIST

let win: BrowserWindow | null;

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

app.whenReady().then(async() => {
  const { imageBrightnessHandler } = await import('./image/imageBrightness.ts');
  const { imageBlurringHandler } = await import('./image/imageBlurring.ts');
  const { imageSaturationHandler } = await import('./image/imageSaturation.ts');
  const { imageSharpnessHandler } = await import('./image/imageSharpening.ts');
  const { imageCompressionHandler } = await import('./image/imageCompression.ts');
  const { imageNoiseHandler } = await import('./image/imageNoise.ts');
  const { imageConversionHandler } = await import('./image/imageConversion.ts');
  const { imageGrayscaleHandler } = await import('./image/imageGrayscale.ts');
  const { imageResizingHandler } = await import('./image/imageResizing.ts');
  const { imageBorderHandler } = await import('./image/imageBorder.ts');
  // import { imagePixelatingHandler } from './image/imagePixelation.ts';
  // VIDEOS
  const { changeFpsHandler } = await import('./video/videoChangeFps.ts');
  const { compressVideoHandler } = await import('./video/videoCompressing.ts');
  const { convertVideoHandler } = await import('./video/videoConversion.ts');
  const { videoEqualizerHandler } = await import('./video/videoEqualizer.ts');
   const { videoQualityHandler } = await import('./video/videoQuality.ts');
  const { extractAudioHandler } = await import('./video/videoExtractAudio.ts');
  const { videoPlaybackHandler } = await import('./video/videoPlaybackSpeed.ts');
  const { trimVideoHandler } = await import('./video/videoTrimming.ts');
  const { videoVolumeHandler } = await import('./video/videoVolumeAdjust.ts');
  const { videoStabilizationHandler } = await import('./video/videoStabilization.ts');
  const { videoPitchHandler } = await import('./video/videoPitch.ts');
  const { videoAudioRemovingHandler } = await import('./video/videoRemoveAudio.ts');
  const { videoNoiseHandler } = await import('./video/videoNoise.ts');
  // AUDIOS
  const { audioPitchHandler } = await import('./audio/audioPitch.ts');
  const { audioVolumeHandler } = await import('./audio/audioVolume.ts');
  const { audioSpeedHandler } = await import('./audio/audioSpeed.ts');
  const { audioOptimizeHandle } = await import('./audio/audioOptimization.ts');
  const { audioEqualizerHandler } = await import('./audio/audioEqualizer.ts');
  const { audioNormalizingHandler } = await import('./audio/audioNormalize.ts');
  const { audioReverseHandler } = await import('./audio/audioReversing.ts');
  const { audioConvertingHandler } = await import('./audio/audioConverting.ts');
  const { audioEchoHandler } = await import('./audio/audioEcho.ts');
  const { audioFadingHandler } = await import('./audio/audioFading.ts');
  const { audioSpectrogramHandler } = await import('./audio/audioSpectrogram.ts');
  const { audioSilenceRemoverHandler } = await import('./audio/audioSilenceRemover.ts');
  // OTHER
  const { setupAutoUpdater } = await import('./autoUpdater');

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
  // imagePixelatingHandler();
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
  videoQualityHandler();
  videoPitchHandler();
  videoAudioRemovingHandler();
  videoNoiseHandler();
  // AUDIOS
  audioPitchHandler();
  audioVolumeHandler();
  audioSpeedHandler();
  audioOptimizeHandle();
  audioEqualizerHandler();
  audioNormalizingHandler();
  audioReverseHandler();
  audioConvertingHandler();
  audioEchoHandler();
  audioFadingHandler();
  audioSpectrogramHandler();
  audioSilenceRemoverHandler();
  // OTHER
  setupAutoUpdater();

  createWindow();
});


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