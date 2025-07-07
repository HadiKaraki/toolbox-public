import { ipcMain, IpcMainInvokeEvent } from 'electron';
import ffmpeg from '../ffmpegConfig';
import { ffmpegManager } from '../ffmpegManager';
import { getFormatNameForAudios, getMuxersOfAudios } from '../getMetadataFfprobe';

interface ArgumentArgs {
  taskId: string;
  inputPath: string;
  outputPath: string;
  duration: number;
  fadeInStartTime: number;
  fadeInDuration: number;
  fadeOutStartTime: number;
  fadeOutDuration: number;
}

export async function fadeAudio(
  event: IpcMainInvokeEvent,
  { taskId, inputPath, outputPath, duration, fadeInStartTime, fadeInDuration, fadeOutStartTime, fadeOutDuration, }: ArgumentArgs
): Promise<string> {
  try {

    const format = await getFormatNameForAudios(inputPath);
    const muxer = getMuxersOfAudios(format);

    await new Promise<void>((resolve, reject) => {
      const command = ffmpeg(inputPath)
        .audioFilters(`afade=t=in:ss=${fadeInStartTime}:d=${fadeInDuration}`) // ss = start time, d = duration (both in seconds)
        .audioFilters(`afade=t=out:st=${fadeOutStartTime}:d=${fadeOutDuration}`)
        .outputFormat(muxer)
        .output(outputPath)
        .on('progress', (progress) => {
          const [h, m, s] = progress.timemark.split(':').map(parseFloat);
          const seconds = h * 3600 + m * 60 + s;
          if (seconds >= 0) {
            const percent = Math.min(100, (seconds / duration) * 100);
            event.sender.send('ffmpeg-progress', { percent });
          }
        })
        // .on('start', cmd => console.log('FFmpeg command:', cmd))
        // .on('stderr', line => console.log('FFmpeg stderr:', line))
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


    return 'Audio fading complete';
  } catch (error) {
    throw new Error(`Processing failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export function audioFadingHandler(): void {
  ipcMain.handle('audio-equalize', async (event, args: ArgumentArgs) => {
    try {
      const result = await fadeAudio(event, args);
      return { success: true, message: result };
    } catch (error) {
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Unknown error occurred' 
      };
    }
  });
}