/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string;
  // Add other env variables here...
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface DownloadProgress {
  percent: number;
  bytesPerSecond: number;
  total: number;
  transferred: number;
}

interface UpdateInfo {
  available: boolean;
  isLatest: boolean;
  version: string;
}

interface UpdateError {
  message: string;
  stack?: string;
}

// Add this Electron API declaration:
interface Window {
  electronAPI: {
    // IMAGES
    resizeImage: (args: {
      inputPath: string;
      outputPath: string;
      height: number;
      width: number;
      fit: string;
    }) => Promise<{ success: boolean; message: string }>;

    adjustBrightness: (args: { 
      inputPath: string;
      outputPath: string;
      brightness: number;
    }) => Promise<{ success: boolean; message: string }>;
    
    blurImage: (args: {
      inputPath: string;
      outputPath: string;
      sigma: number;
    }) => Promise<{ success: boolean; message: string }>;

    adjustGrayscale: (args: {
      inputPath: string;
      outputPath: string;
      grayscale: number;
    }) => Promise<{ success: boolean; message: string }>;

    addBorder: (args: {
      inputPath: string;
      outputPath: string;
      borderWidth: number;
      borderColor: string;
    }) => Promise<{ success: boolean; message: string }>;

    compressImage: (args: {
      inputPath: string;
      outputPath: string;
      quality: number;
    }) => Promise<{ success: boolean; message: string }>;

    noiseImage: (args: {
      inputPath: string;
      outputPath: string;
      noise: number;
    }) => Promise<{ success: boolean; message: string }>;

    modifySaturation: (args: {
      inputPath: string;
      outputPath: string;
      saturation: number;
    }) => Promise<{ success: boolean; message: string }>;

    convertImage: (args: {
      inputPath: string;
      outputPath: string;
      format: string;
    }) => Promise<{ success: boolean; message: string }>;

    sharpenImage: (args: {
      inputPath: string;
      outputPath: string;
      mode: string;
    }) => Promise<{ success: boolean; message: string }>;

    pixelateImage: (args: {
      inputPath: string;
      outputPath: string;
      pixelate: number;
      lowResolution: boolean;
      nearestNeighbor: boolean;
    }) => Promise<{ success: boolean; message: string }>;

    addAudioToImage: (args: {
      inputPath: string;
      outputPath: string;
      audioFilePath: string;
      audioDuration: number;
    }) => Promise<{ success: boolean; message: string }>;
  
    // VIDEOS
    adjustVideoVolume: (args: {
      inputPath: string;
      outputPath: string;
      taskId: string;
      duration: number;
      volume: number;
    }) => Promise<{ success: boolean; message: string }>;

    convertVideo: (args: {
      inputPath: string;
      outputPath: string;
      taskId: string;
      duration: number;
      videoFormat: string;
    }) => Promise<{ success: boolean; message: string }>;

    adjustFps: (args: {
      inputPath: string;
      outputPath: string;
      taskId: string;
      duration: number;
      fps: number;
    }) => Promise<{ success: boolean; message: string }>;

    compressVideo: (args: {
      inputPath: string;
      outputPath: string;
      taskId: string;
      duration: number;
      crf: number;
    }) => Promise<{ success: boolean; message: string }>;

    extractVideoAudio: (args: {
      inputPath: string;
      outputPath: string;
      taskId: string;
      duration: number;
      audioFormat: string;
      audioQuality: number;
    }) => Promise<{ success: boolean; message: string }>;

    equalizeVideoAudio: (args: {
      inputPath: string;
      outputPath: string;
      taskId: string;
      duration: number;
      frequency: number;
      bandwidth: number;
      gain: number;
    }) => Promise<{ success: boolean; message: string }>;

    removeAudioVideo: (args: {
      inputPath: string;
      outputPath: string;
      taskId: string;
      duration: number
    }) => Promise<{ success: boolean; message: string }>;

    trimVideo: (args: {
      inputPath: string;
      outputPath: string;
      taskId: string;
      duration: number;
      startTime: string;
      endTime: number;
    }) => Promise<{ success: boolean; message: string }>;

    noiseVideo: (args: {
      inputPath: string;
      outputPath: string;
      taskId: string;
      duration: number;
      noise: number;
    }) => Promise<{ success: boolean; message: string }>;

    modifyVideoPitch: (args: {
      inputPath: string;
      outputPath: string;
      taskId: string;
      duration: number;
      pitch: number;
    }) => Promise<{ success: boolean; message: string }>;

    playbackSpeedVideo: (args: {
      inputPath: string;
      outputPath: string;
      taskId: string;
      duration: number;
      playbackSpeed: number;
    }) => Promise<{ success: boolean; message: string }>;

    stabilizeVideo: (args: {
      inputPath: string;
      outputPath: string;
      taskId: string;
      duration: number;
    }) => Promise<{ success: boolean; message: string }>;

    modifyVideoQuality: (args: {
      inputPath: string;
      outputPath: string;
      taskId: string;
      duration: number;
      crf: number;
    }) => Promise<{ success: boolean; message: string }>;

    // AUDIO
    adjustAudioVolume: (args: {
      inputPath: string;
      outputPath: string;
      taskId: string;
      duration: number;
      volume: number;
    }) => Promise<{ success: boolean; message: string }>;

    playbackSpeedAudio: (args: {
      inputPath: string;
      outputPath: string;
      taskId: string;
      duration: number;
      playbackSpeed: number;
    }) => Promise<{ success: boolean; message: string }>;

    reverseAudio: (args: {
      inputPath: string;
      outputPath: string;
      taskId: string;
      duration: number;
    }) => Promise<{ success: boolean; message: string }>;

    convertAudio: (args: {
      inputPath: string;
      outputPath: string;
      taskId: string;
      duration: number;
      format: string;
    }) => Promise<{ success: boolean; message: string }>;

    modifyAudioPitch: (args: {
      inputPath: string;
      outputPath: string;
      taskId: string;
      duration: number;
      pitch: number;
    }) => Promise<{ success: boolean; message: string }>;

    generateSpectrogram: (args: {
      inputPath: string;
      outputPath: string;
      taskId: string;
      duration: number;
    }) => Promise<{ success: boolean; message: string }>;

    optimizeAudioForMode: (args: {
      inputPath: string;
      outputPath: string;
      taskId: string;
      duration: number;
      mode: string;
    }) => Promise<{ success: boolean; message: string }>;

    equalizeAudio: (args: {
      inputPath: string;
      outputPath: string;
      taskId: string;
      duration: number;
      frequency: number;
      bandwidth: number;
      gain: number;
    }) => Promise<{ success: boolean; message: string }>;

    silenceRemover: (args: {
      inputPath: string;
      outputPath: string;
      taskId: string;
      duration: number;
      period: number;
      silenceDuration: number;
    }) => Promise<{ success: boolean; message: string }>;

    normalizeAudio: (args: {
      inputPath: string;
      outputPath: string;
      taskId: string;
      duration: number;
    }) => Promise<{ success: boolean; message: string }>;

    addEchoAudio: (args: {
      inputPath: string;
      outputPath: string;
      taskId: string;
      duration: number;
      echoMode: string;
    }) => Promise<{ success: boolean; message: string }>;

    fadeAudio: (args: {
      inputPath: string;
      outputPath: string;
      taskId: string;
      duration: number;
      fadeInStartTime: number;
      fadeInDuration: number;
      fadeOutStartTime: number;
      fadeOutDuration: number;
    }) => Promise<{ success: boolean; message: string }>;

    trimAudio: (args: {
      inputPath: string;
      outputPath: string;
      taskId: string;
      duration: number;
      startTime: string;
      endTime: number;
    }) => Promise<{ success: boolean; message: string }>;

    // OTHER
    showSaveDialog: (defaultName: string) => Promise<string | undefined>;
    createTempFile: (data: ArrayBuffer, extension: string) => Promise<{
      success: boolean;
      path?: string;
      message?: string;
    }>;

    // Progress management
    onProgress: (callback: (taskId: string, progress: number) => void) => void;
    removeProgressListener: () => void;
    cancelProcessing: (taskId: string) => Promise<{ success: boolean; message?: string }>;

    // AUTO UPDATES
    // Check Promise values from autoUpdater.ts
    checkForUpdates: () => Promise<{
      available: boolean;
      version?: string;
      releaseNotes?: string;
      error?: string;
      isChecking: boolean;
      isLatest?: boolean;
    }>;
    downloadUpdate: () => Promise<{
      success: boolean;
      error?: string;
      isLatest?: boolean;
    }>;
    quitAndInstall: () => void;
    onUpdateDownloadProgress: (callback: (progress: DownloadProgress) => void) => void;
    onUpdateDownloaded: (callback: (info: UpdateInfo) => void) => void;
    onUpdateError: (callback: (error: UpdateError) => void) => void;
    removeUpdateListeners: () => void;
  };
}