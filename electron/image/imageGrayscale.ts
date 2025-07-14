import { ipcMain } from 'electron';
import ffmpeg from '../ffmpegConfig';
// import { getFormatNameForImages, getMuxersOfImages } from '../getMetadataFfprobe';

interface GrayscaleAdjustmentArgs {
  inputPath: string;
  outputPath: string;
  grayscale: number;
}

interface ProcessingResult {
  success: boolean;
  message: string;
}

export async function adjustGrayscale({ inputPath, outputPath, grayscale }: GrayscaleAdjustmentArgs): Promise<string> {
  try {
    // const format = await getFormatNameForImages(inputPath);
    // const muxer = getMuxersOfImages(format);

    const grayscaleForffmpeg = 1 - grayscale; // grayscale value of ffmpeg is opposite of css

    await new Promise<void>((resolve, reject) => {
      ffmpeg(inputPath)
        .inputOptions('-framerate 1')
        .videoFilters(`hue=s=${grayscaleForffmpeg}`)
        .outputFormat("mjpeg")
        .output(outputPath)
        .on('start', (commandLine) => {
                    console.log('FFmpeg command:', commandLine);
                })
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

    return 'Grayscale adjustment complete';
  } catch (error) {
    throw new Error(`FFmpeg processing failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export function imageGrayscaleHandler(): void {
  ipcMain.handle('image-grayscale', async (_event, args: GrayscaleAdjustmentArgs): Promise<ProcessingResult> => {
    try {
      const result = await adjustGrayscale(args);
      return { success: true, message: result };
    } catch (error) {
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Unknown error occurred' 
      };
    }
  });
}