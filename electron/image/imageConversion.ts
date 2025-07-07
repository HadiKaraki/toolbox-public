import { ipcMain } from 'electron';
import ffmpeg from '../ffmpegConfig';
import { getMuxersOfImages } from '../getMetadataFfprobe';

interface ConversionAdjustmentArgs {
  inputPath: string;
  outputPath: string;
  format: string;
}

interface ProcessingResult {
  success: boolean;
  message: string;
}

export async function convertImage({ inputPath, outputPath, format }: ConversionAdjustmentArgs): Promise<string> {
  try {
    const muxer = getMuxersOfImages(format);

    await new Promise<void>((resolve, reject) => {
      ffmpeg(inputPath)
        .outputFormat(muxer)
        .output(outputPath)
        .on('start', cmd => console.log('FFmpeg command:', cmd))
        // .on('stderr', line => console.log('FFmpeg stderr:', line))
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

    return 'Image conversion complete';
  } catch (error) {
    throw new Error(`FFmpeg processing failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export function imageConversionHandler(): void {
  ipcMain.handle('image-conversion', async (_event, args: ConversionAdjustmentArgs): Promise<ProcessingResult> => {
    try {
      const result = await convertImage(args);
      return { success: true, message: result };
    } catch (error) {
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Unknown error occurred' 
      };
    }
  });
}