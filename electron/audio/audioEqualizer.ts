import { ipcMain, IpcMainInvokeEvent } from 'electron';
import ffmpeg from '../ffmpegConfig';
import { ffmpegManager } from '../ffmpegManager';
import { getFormatNameForAudios, getMuxersOfAudios } from '../getMetadataFfprobe';

interface EqualizerArgumentsArgs {
  taskId: string;
  inputPath: string;
  outputPath: string;
  duration: number;
  frequency: number;
  bandwidth: number;
  gain: number;
}

export async function equalizeAudio(
  event: IpcMainInvokeEvent,
  { taskId, inputPath, outputPath, duration, frequency, bandwidth, gain }: EqualizerArgumentsArgs
): Promise<string> {
  try {
    const audioFilter = `equalizer=f=${frequency}:width_type=h:width=${bandwidth}:g=${gain}`;

    const format = await getFormatNameForAudios(inputPath);
    const muxer = getMuxersOfAudios(format);

    await new Promise<void>((resolve, reject) => {
      const command = ffmpeg(inputPath)
        .audioFilters(audioFilter)
        .outputFormat(muxer)
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


    return 'Audio equalizing complete';
  } catch (error) {
    throw new Error(`Processing failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export function audioEqualizerHandler(): void {
  ipcMain.handle('audio-equalize', async (event, args: EqualizerArgumentsArgs) => {
    try {
      const result = await equalizeAudio(event, args);
      return { success: true, message: result };
    } catch (error) {
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Unknown error occurred' 
      };
    }
  });
}