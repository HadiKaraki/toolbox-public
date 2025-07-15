// utils/ffmpeg.ts
import path from 'path';
import ffmpeg from 'fluent-ffmpeg';
import { fileURLToPath } from 'node:url';
import { app } from 'electron';
import { FfprobeData } from 'fluent-ffmpeg';

// Type Definitions
type ImageFormat = 'png' | 'jpg' | 'jpeg' | 'bmp' | 'webp' | 'tiff' | 'ico' | 'ppm' | 'svg' | 'pgm' | 'tga' | 'avif' | 'gif';
type VideoFormat = 'mp4' | 'mkv' | 'webm' | 'mov' | 'avi' | 'flv' | 'ogg';
type AudioFormat = 'mp3' | 'wav' | 'ogg' | 'flac' | 'm4a' | 'aac' | 'opus' | 'alac';

interface CodecConfig {
  videoCodec: string;
  audioCodec: string;
}

interface AudioCodecConfig {
  codec: string;
  outputOptions: string[];
}

// Type Guards
function isImageFormat(format: string): format is ImageFormat {
  const imageFormats: ImageFormat[] = ['png', 'jpg', 'jpeg', 'bmp', 'webp', 'tiff', 'ico', 'ppm', 'svg', 'pgm', 'tga', 'avif', 'gif'];
  return imageFormats.includes(format as ImageFormat);
}

function isVideoFormat(format: string): format is VideoFormat {
  const videoFormats: VideoFormat[] = ['mp4', 'mkv', 'webm', 'mov', 'avi', 'flv', 'ogg'];
  return videoFormats.includes(format as VideoFormat);
}

function isAudioFormat(format: string): format is AudioFormat {
  const audioFormats: AudioFormat[] = ['mp3', 'wav', 'ogg', 'flac', 'm4a', 'aac', 'opus', 'alac'];
  return audioFormats.includes(format as AudioFormat);
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Initialize FFmpeg
function getFfprobePath() {
  if (!app.isPackaged) {
    // DEVELOPMENT: Absolute path to node_modules
    return path.join(
      __dirname,
      '../node_modules/@ffprobe-installer/win32-x64/ffprobe.exe'
    );
  } else {
    // PRODUCTION: Unpacked binary
    return path.join(process.resourcesPath, 'ffprobe', 'ffprobe.exe');
  }
}

ffmpeg.setFfprobePath(getFfprobePath());

/**
 * Get the format name of a file using FFprobe
 * @param filePath Path to the file
 * @returns Promise resolving to the format name string
 */
const getFormatName = async (filePath: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err: Error | null, data: FfprobeData) => {
      if (err) return reject(err);
      if (!data.format?.format_name) {
        return reject(new Error('Could not determine file format'));
      }
      resolve(data.format.format_name);
    });
  });
};

/**
 * Get the primary image format from format string
 * @param filePath Path to the image file
 * @returns Promise resolving to the detected ImageFormat
 * @throws Error if format cannot be determined or is unsupported
 */
export const getFormatNameForImages = async (filePath: string): Promise<ImageFormat> => {
  const formatName = await getFormatName(filePath);
  const primaryFormat = pickPrimaryImageFormat(formatName);
  
  if (!isImageFormat(primaryFormat)) {
    throw new Error(`Unsupported image format: ${primaryFormat}`);
  }
  
  return primaryFormat;
};

/**
 * Get the primary video format from format string
 * @param filePath Path to the video file
 * @returns Promise resolving to the detected VideoFormat
 * @throws Error if format cannot be determined or is unsupported
 */
export const getFormatNameForVideos = async (filePath: string): Promise<VideoFormat> => {
  const formatName = await getFormatName(filePath);
  const primaryFormat = pickPrimaryVideoFormat(formatName);
  
  if (!isVideoFormat(primaryFormat)) {
    throw new Error(`Unsupported video format: ${primaryFormat}`);
  }
  
  return primaryFormat;
};

export const getCompressionOptionsForNoise = (noiseValue: number) => {
    // Set bounds to prevent extremes
    const clampedNoise = Math.max(0, Math.min(noiseValue, 100));
  
    // Interpolate CRF: low noise → 25, high noise → 35
    const crf = 25 + ((clampedNoise / 100) * 10); // 25 → 35
    const roundedCrf = Math.round(crf);
  
    // Interpolate bitrate: low noise → 4Mbps, high noise → 1Mbps
    const maxBitrate = 4000 - ((clampedNoise / 100) * 3000); // 4000 kbps → 1000 kbps
    const roundedBitrate = Math.round(maxBitrate);
  
    // Choose preset based on noise level
    let preset;
    if (clampedNoise < 20) preset = 'fast';
    else if (clampedNoise < 60) preset = 'slow';
    else preset = 'veryslow';
  
    return {
        crf: roundedCrf,
        bitrateKbps: roundedBitrate,
        preset
    };
}

/**
 * Get the primary audio format from format string
 * @param filePath Path to the audio file
 * @returns Promise resolving to the detected AudioFormat
 * @throws Error if format cannot be determined or is unsupported
 */
export const getFormatNameForAudios = async (filePath: string): Promise<AudioFormat> => {
  const formatName = await getFormatName(filePath);
  const primaryFormat = pickPrimaryAudioFormat(formatName);
  
  if (!isAudioFormat(primaryFormat)) {
    throw new Error(`Unsupported audio format: ${primaryFormat}`);
  }
  
  return primaryFormat;
};

/**
 * Get the appropriate muxer for an image format
 * @param format The image format string
 * @returns The muxer string
 */
export const getMuxersOfImages = (format: string): string => {
  const formatMap: Record<ImageFormat, string> = {
    png: 'image2',
    jpg: 'image2',
    jpeg: 'image2',
    bmp: 'image2',
    webp: 'image2',
    tiff: 'image2',
    ico: 'image2',
    ppm: 'image2',
    svg: 'image2',
    pgm: 'image2',
    tga: 'image2',
    avif: 'image2',
    gif: 'gif'
  };

  const preferredOrder = Object.keys(formatMap) as ImageFormat[];
  const selected = preferredOrder.find(f => format.includes(f)) || format.split(',')[0];
  return formatMap[selected as ImageFormat] || 'image2';
};

/**
 * Get the appropriate muxer for a video format
 * @param format The video format
 * @returns The muxer string
 */
export const getMuxersOfVideos = (format: VideoFormat): string => {
  const muxers: Record<VideoFormat, string> = {
    mp4: 'mp4',
    mkv: 'matroska',
    webm: 'webm',
    mov: 'mov',
    avi: 'avi',
    flv: 'flv',
    ogg: 'ogg'
  };
  return muxers[format];
};

/**
 * Get the appropriate muxer for an audio format
 * @param format The audio format
 * @returns The muxer string
 */
export const getMuxersOfAudios = (format: AudioFormat): string => {
  const muxers: Record<AudioFormat, string> = {
    mp3: 'mp3',
    wav: 'wav',
    ogg: 'ogg',
    flac: 'flac',
    m4a: 'mp4',
    aac: 'adts',
    opus: 'opus',
    alac: 'mp4'
  };
  return muxers[format];
};

/**
 * Get recommended video and audio codecs for a video format
 * @param format The video format
 * @returns CodecConfig with video and audio codecs
 */
export const getFormatVideoAndAudioCodecs = (format: VideoFormat): CodecConfig => {
  const formatToCodecs: Record<VideoFormat, CodecConfig> = {
    mp4: { videoCodec: 'libx264', audioCodec: 'aac' },
    avi: { videoCodec: 'libx264', audioCodec: 'libmp3lame' },
    mov: { videoCodec: 'libx264', audioCodec: 'aac' },
    mkv: { videoCodec: 'libx264', audioCodec: 'libopus' },
    webm: { videoCodec: 'libvpx-vp9', audioCodec: 'libopus' },
    flv: { videoCodec: 'flv', audioCodec: 'aac' },
    ogg: { videoCodec: 'libtheora', audioCodec: 'libvorbis' }
  };
  return formatToCodecs[format];
};

/**
 * Get recommended audio codec and output options
 * @param format The audio format
 * @returns AudioCodecConfig with codec and output options
 */
export const getCodecsOfAudios = (format: AudioFormat): AudioCodecConfig => {
  const audioFormatConfig: Record<AudioFormat, AudioCodecConfig> = {
    mp3: { codec: 'libmp3lame', outputOptions: ['-b:a 192k'] },
    wav: { codec: 'pcm_s16le', outputOptions: [] },
    ogg: { codec: 'libvorbis', outputOptions: ['-qscale:a 5'] },
    flac: { codec: 'flac', outputOptions: [] },
    m4a: { codec: 'aac', outputOptions: ['-b:a 192k'] },
    opus: { codec: 'libopus', outputOptions: ['-b:a 96k'] },
    alac: { codec: 'alac', outputOptions: [] },
    aac: { codec: 'aac', outputOptions: ['-b:a 192k'] }
  };
  return audioFormatConfig[format];
};

/**
 * Detect the audio codec from a file
 * @param filePath Path to the audio file
 * @returns Promise resolving to the codec name or null if not found
 */
export const getAudioCodecFromFile = async (filePath: string): Promise<string | null> => {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err: Error | null, data: FfprobeData) => {
      if (err) return reject(err);
      const audioStream = data.streams?.find(s => s.codec_type === 'audio');
      resolve(audioStream?.codec_name || null);
    });
  });
};

// Helper functions for picking primary formats
function pickPrimaryImageFormat(formatNameString: string): string {
  const preferredOrder: ImageFormat[] = ['png', 'jpg', 'jpeg', 'webp', 'gif', 'bmp', 'tiff'];
  return pickPrimaryFormat(formatNameString, preferredOrder);
}

function pickPrimaryVideoFormat(formatNameString: string): string {
  const preferredOrder: VideoFormat[] = ['mp4', 'mov', 'mkv', 'webm', 'avi', 'flv'];
  return pickPrimaryFormat(formatNameString, preferredOrder);
}

function pickPrimaryAudioFormat(formatNameString: string): string {
  const preferredOrder: AudioFormat[] = ['mp3', 'wav', 'ogg', 'm4a', 'aac', 'flac'];
  return pickPrimaryFormat(formatNameString, preferredOrder);
}

function pickPrimaryFormat(formatNameString: string, preferredOrder: string[]): string {
  const formatList = formatNameString.split(',');
  return preferredOrder.find(fmt => formatList.includes(fmt)) || formatList[0];
}