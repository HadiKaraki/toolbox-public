/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string;
  // Add other env variables here...
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Add this Electron API declaration:
interface Window {
  electronAPI: {
    // IMAGES
    adjustBrightness: (args: { 
      inputPath: string;
      outputPath: string;
      brightness: number;
    }) => Promise<{ success: boolean; message: string }>;
    
    blurImage: (args: {
      inputPath: string;
      outputPath: string;
      blur: number;
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

    addNoise: (args: {
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

    // OTHER
    createTempFile: (data: ArrayBuffer, extension: string) => Promise<{
      success: boolean;
      path?: string;
      message?: string;
    }>;

    onProgress: (callback: (taskId: string, progress: number) => void) => void;
    removeProgressListener: () => void;
    startProcessing: (args: { taskId: string; inputPath: string; outputPath: string }) => Promise<{ success: boolean; message?: string }>;
    cancelProcessing: (taskId: string) => Promise<{ success: boolean; message?: string }>;

    // AUTO UPDATES
    // Check Promise values from autoUpdater.ts
    checkForUpdates: () => Promise<{available: boolean; version?: string, releaseNotes?: string; error?: string}>;
    // showUpdateWindow: () => void;
    downloadUpdate: () => Promise<{success: boolean; error?: string}>;
    quitAndInstall: () => void;
    onUpdateDownloadProgress: (callback: (progress: any) => void) => void;

    showSaveDialog: (defaultName: string) => Promise<string | undefined>;
  };
}