// electron/ffmpegConfig.ts
import path from 'path';
import { fileURLToPath } from 'node:url';
import ffmpeg from 'fluent-ffmpeg';
import { app } from 'electron';

// Get the __dirname equivalent in ESM
const __dirname = path.dirname(fileURLToPath(import.meta.url));
// console.log("__dirname", __dirname)

// Get the correct FFmpeg path (ESM-compatible)
function getFfmpegPath() {
  if (!app.isPackaged) {
    // DEVELOPMENT: Use absolute path to node_modules
    return path.join(
      __dirname,
      '../node_modules/@ffmpeg-installer/win32-x64/ffmpeg.exe'
    );
  } else {
    // PRODUCTION: Use unpacked binary in resources
    return path.join(process.resourcesPath, 'ffmpeg', 'ffmpeg.exe');
  }
}

// Verify paths exist (throws error if missing)
import fs from 'fs';
if (!fs.existsSync(getFfmpegPath())) throw new Error(`FFmpeg not found at ${getFfmpegPath()}`);

// Configure FFmpeg
ffmpeg.setFfmpegPath(getFfmpegPath());

// Debug logs
// console.log('FFmpeg Path:', getFfmpegPath());

export default ffmpeg;