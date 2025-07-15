import { ipcMain, IpcMainInvokeEvent } from 'electron';
import ffmpeg from '../ffmpegConfig';
import { ffmpegManager } from '../ffmpegManager';

interface SpectrogramArgs {
  taskId: string;
  inputPath: string;
  outputPath: string;
  duration: number;
}

export async function audioSpectrogram(
  event: IpcMainInvokeEvent,
  { taskId, inputPath, outputPath, duration }: SpectrogramArgs
): Promise<string> {
  try {

    await new Promise<void>((resolve, reject) => {
      const command = ffmpeg(inputPath)
        .outputOptions([
            '-lavfi showspectrumpic=s=1024x512:color=rainbow',
            '-frames:v 1'
        ])
        .outputFormat('mjpeg')
        .output(outputPath)
        .on('progress', (progress) => {
          const [h, m, s] = progress.timemark.split(':').map(parseFloat);
          const seconds = h * 3600 + m * 60 + s;
          if (seconds >= 0) {
            const percent = Math.min(100, (seconds / duration) * 100);
            event.sender.send('ffmpeg-progress', { 
              taskId,
              progress: percent
            });
          }
        })
        .on('start', cmd => console.log('FFmpeg command:', cmd))
        .on('stderr', line => console.log('FFmpeg stderr:', line))
        .on('end', () => {
          ffmpegManager.cancelProcess(taskId);
          resolve();
        })
        .on('error', (err: Error) => {
          ffmpegManager.cancelProcess(taskId);
          reject(err);
        });

      ffmpegManager.addProcess(taskId, command);
      command.run(); 
    });


    return 'Audio normalization complete';
  } catch (error) {
    throw new Error(`Processing failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export function audioSpectrogramHandler(): void {
  ipcMain.handle('audio-spectrogram', async (event, args: SpectrogramArgs) => {
    try {
      const result = await audioSpectrogram(event, args);
      return { success: true, message: result };
    } catch (error) {
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Unknown error occurred' 
      };
    }
  });
}