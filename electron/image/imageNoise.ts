import { ipcMain } from 'electron';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import { getFormatNameForImages, getMuxersOfImages } from '../getMetadataFfprobe';

// Set FFmpeg path
ffmpeg.setFfmpegPath(ffmpegInstaller.path);

interface NoiseAdjustmentArgs {
  inputPath: string;
  outputPath: string;
  noise: number;
}

interface ProcessingResult {
  success: boolean;
  message: string;
}

export async function addNoise({ inputPath, outputPath, noise }: NoiseAdjustmentArgs): Promise<string> {
  try {
    const format = await getFormatNameForImages(inputPath);
    const muxer = getMuxersOfImages(format);

    await new Promise<void>((resolve, reject) => {
      ffmpeg(inputPath)
        .inputOptions('-framerate 1')
        .videoFilters(`noise=alls=${noise}:allf=t`)
        .outputFormat(muxer)
        .output(outputPath)
        .on('end', (stderr: string | null) => {
          if (stderr) {
            reject(new Error(stderr));
            return;
          }
          resolve();
        })
        .on('error', (err: Error) => reject(err))
        .run();
    });

    return 'Noise adding complete';
  } catch (error) {
    throw new Error(`FFmpeg processing failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export function imageNoiseHandler(): void {
  ipcMain.handle('image-noising', async (_event, args: NoiseAdjustmentArgs): Promise<ProcessingResult> => {
    try {
      const result = await addNoise(args);
      return { success: true, message: result };
    } catch (error) {
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Unknown error occurred' 
      };
    }
  });
}