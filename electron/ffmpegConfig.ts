// electron/ffmpegConfig.ts
import ffmpeg from 'fluent-ffmpeg';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';

// This will only run once when imported
ffmpeg.setFfmpegPath(ffmpegInstaller.path);

export default ffmpeg;