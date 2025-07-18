import { ipcMain } from 'electron';
import ffmpeg from '../ffmpegConfig';

interface AdjustmentArgs {
  inputPath: string;
  outputPath: string;
  audioFilePath: string;
  audioDuration: number;
}

interface ProcessingResult {
  success: boolean;
  message: string;
}

export async function addAudio({ inputPath, outputPath, audioFilePath, audioDuration }: AdjustmentArgs): Promise<string> {
  try {

    await new Promise<void>((resolve, reject) => {
      ffmpeg(inputPath)
        .inputOptions([
            '-loop 1',
            '-framerate 1'
        ])
        .input(audioFilePath)
        .videoFilters('scale=trunc(iw/2)*2:trunc(ih/2)*2')
        .outputOptions([
            '-c:v libx264',
            '-tune stillimage',
            '-pix_fmt yuv420p',
            '-c:a aac',
            '-b:a 192k',
            '-preset veryfast',
            `-t ${audioDuration}`,
            '-shortest', // Instead of explicitly setting -t ${audioDuration}, you can let ffmpeg stop when the shortest stream (the audio). (currently has some problems)
            '-f mp4'
        ])
        .outputFormat('mp4')
        .output(outputPath)
        // .on('start', (commandLine) => {
        //             console.log('FFmpeg command:', commandLine);
        //         })
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

    return 'Audio adding complete';
  } catch (error) {
    throw new Error(`FFmpeg processing failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export function imageAudioHandler(): void {
  ipcMain.handle('image-audio', async (_event, args: AdjustmentArgs): Promise<ProcessingResult> => {
    try {
      const result = await addAudio(args);
      return { success: true, message: result };
    } catch (error) {
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Unknown error occurred' 
      };
    }
  });
}