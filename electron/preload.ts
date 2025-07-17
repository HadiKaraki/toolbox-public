import { ipcRenderer, contextBridge } from 'electron'

interface DownloadProgress {
  percent: number;
}
// --------- Expose some API to the Renderer process ---------
contextBridge.exposeInMainWorld('electronAPI', {
  on(...args: Parameters<typeof ipcRenderer.on>) {
    const [channel, listener] = args
    return ipcRenderer.on(channel, (event, ...args) => listener(event, ...args))
  },
  off(...args: Parameters<typeof ipcRenderer.off>) {
    const [channel, ...omit] = args
    return ipcRenderer.off(channel, ...omit)
  },
  send(...args: Parameters<typeof ipcRenderer.send>) {
    const [channel, ...omit] = args
    return ipcRenderer.send(channel, ...omit)
  },
  invoke(...args: Parameters<typeof ipcRenderer.invoke>) {
    const [channel, ...omit] = args
    return ipcRenderer.invoke(channel, ...omit)
  },

  // You can expose other APTs you need here.
  
  // IMAGES:
  // the image-brightness handle will be inside the worker files (imageBrightness.ts)
  // the names of those (adjustBrightness etc.) should be names the same as vite-env.d.ts
  adjustBrightness: (args: any) => ipcRenderer.invoke('image-brightness', args),
  blurImage: (args: any) => ipcRenderer.invoke('image-blurring', args),
  modifySaturation: (args: any) => ipcRenderer.invoke('image-saturation', args),
  sharpenImage: (args: any) => ipcRenderer.invoke('image-sharpness', args),
  adjustGrayscale: (args: any) => ipcRenderer.invoke('image-grayscale', args),
  compressImage: (args: any) => ipcRenderer.invoke('image-compression', args),
  convertImage: (args: any) => ipcRenderer.invoke('image-conversion', args),
  noiseImage: (args: any) => ipcRenderer.invoke('image-noising', args),
  resizeImage: (args: any) => ipcRenderer.invoke('image-resize', args),
  addBorder: (args: any) => ipcRenderer.invoke('image-border', args),
  // VIDEOS
  adjustVideoVolume: (args: any) => ipcRenderer.invoke('video-volume', args),
  adjustFps: (args: any) => ipcRenderer.invoke('video-fps', args),
  compressVideo: (args: any) => ipcRenderer.invoke('video-compressing', args),
  convertVideo: (args: any) => ipcRenderer.invoke('video-converting', args),
  extractVideoAudio: (args: any) => ipcRenderer.invoke('video-audio-extracting', args),
  equalizeVideoAudio: (args: any) => ipcRenderer.invoke('video-equalizer', args),
  removeAudioVideo: (args: any) => ipcRenderer.invoke('video-remove-audio', args),
  trimVideo: (args: any) => ipcRenderer.invoke('video-trimming', args),
  modifyVideoPitch: (args: any) => ipcRenderer.invoke('video-pitch', args),
  stabilizeVideo: (args: any) => ipcRenderer.invoke('video-stabilize', args),
  playbackSpeedVideo: (args: any) => ipcRenderer.invoke('video-playback', args),
  modifyVideoQuality: (args: any) => ipcRenderer.invoke('video-quality', args),
  noiseVideo: (args: any) => ipcRenderer.invoke('video-noise', args),
  // AUDIO
  modifyAudioPitch: (args: any) => ipcRenderer.invoke('audio-pitch', args),
  adjustAudioVolume: (args: any) => ipcRenderer.invoke('audio-volume', args),
  playbackSpeedAudio: (args: any) => ipcRenderer.invoke('audio-speed', args),
  optimizeAudioForMode: (args: any) => ipcRenderer.invoke('audio-optimize', args),
  equalizeAudio: (args: any) => ipcRenderer.invoke('audio-equalize', args),
  normalizeAudio: (args: any) => ipcRenderer.invoke('audio-normalize', args),
  trimAudio: (args: any) => ipcRenderer.invoke('audio-trimming', args),
  reverseAudio: (args: any) => ipcRenderer.invoke('audio-reverse', args),
  convertAudio: (args: any) => ipcRenderer.invoke('audio-convert', args),
  fadeAudio: (args: any) => ipcRenderer.invoke('audio-fading', args),
  addEchoAudio: (args: any) => ipcRenderer.invoke('audio-echo', args),
  generateSpectrogram: (args: any) => ipcRenderer.invoke('audio-spectrogram', args),
  silenceRemover: (args: any) => ipcRenderer.invoke('audio-silence-remover', args),

  // REST:
  createTempFile: (data: ArrayBuffer, extension: string) => 
    ipcRenderer.invoke('create-temp-file', { data, extension }),

  showSaveDialog: (defaultFilename: string) => 
    ipcRenderer.invoke('show-save-dialog', defaultFilename),

  // onProgress: (callback: (taskId: string, progress: number) => void) => {
  //   ipcRenderer.on('ffmpeg-progress', (_, { taskId, progress }) => callback(taskId, progress));
  // }

  onProgress: (callback: (taskId: string, progress: number) => void) => {
    ipcRenderer.on('ffmpeg-progress', (_: any, data: { taskId: string; progress: number }) => {
      callback(data.taskId, data.progress)
    })
  },
  removeProgressListener: () => ipcRenderer.removeAllListeners('ffmpeg-progress'),
  cancelProcessing: (taskId: string) => ipcRenderer.invoke('cancel-processing', taskId),

  // AUTO UPDATES
  checkForUpdates: () => ipcRenderer.invoke('check-for-updates'),
  // showUpdateWindow: () => ipcRenderer.invoke('show-update-window'),
  downloadUpdate: () => ipcRenderer.invoke('download-update'),
  quitAndInstall: () => ipcRenderer.invoke('quit-and-install'),
  onUpdateDownloadProgress: (callback: (progress: DownloadProgress) => void) => {
    ipcRenderer.on('update-download-progress', (_, progress) => callback(progress));
  },
  onUpdateDownloaded: (callback: (info: { version: string }) => void) => {
    ipcRenderer.on('update-downloaded', (_, info) => callback(info));
  },
  onUpdateError: (callback: (error: { message: string, stack?: string }) => void) => {
    ipcRenderer.on('update-error', (_, error) => callback(error));
  },
  removeUpdateListeners: () => {
    ipcRenderer.removeAllListeners('update-download-progress');
    ipcRenderer.removeAllListeners('update-downloaded');
    ipcRenderer.removeAllListeners('update-error');
  }
})