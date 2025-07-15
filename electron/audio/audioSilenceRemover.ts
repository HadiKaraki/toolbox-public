import { ipcMain, IpcMainInvokeEvent } from 'electron';
import ffmpeg from '../ffmpegConfig';
import { ffmpegManager } from '../ffmpegManager';
import { getFormatNameForAudios, getMuxersOfAudios } from '../getMetadataFfprobe';

interface AdjustmentArgs {
  taskId: string;
  inputPath: string;
  outputPath: string;
  duration: number;
  period: number;
  silenceDuration: number;
}

export async function removeSilence(
  event: IpcMainInvokeEvent,
  { taskId, inputPath, outputPath, duration, period , silenceDuration }: AdjustmentArgs
): Promise<string> {

try {
    const format = await getFormatNameForAudios(inputPath);
    const muxer = getMuxersOfAudios(format);

    await new Promise<void>((resolve, reject) => {
    const command = ffmpeg(inputPath)
        .audioFilters(`silenceremove=start_periods=${period}:start_threshold=-50dB:start_duration=${silenceDuration}`)
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

    return 'Echo adding complete';
  } catch (error) {
    throw new Error(`Processing failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export function audioSilenceRemoverHandler(): void {
  ipcMain.handle('audio-silence-remover', async (event, args: AdjustmentArgs) => {
    try {
      const result = await removeSilence(event, args);
      return { success: true, message: result };
    } catch (error) {
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Unknown error occurred' 
      };
    }
  });
}