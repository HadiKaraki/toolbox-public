import { ipcMain, IpcMainInvokeEvent } from 'electron';
import ffmpeg from '../ffmpegConfig';
import { ffmpegManager } from '../ffmpegManager';
import { getFormatNameForAudios, getMuxersOfAudios } from '../getMetadataFfprobe';

interface PitchAdjustmentArgs {
  taskId: string;
  inputPath: string;
  outputPath: string;
  duration: number;
  pitch: number;
}

export async function modifyPitch(
  event: IpcMainInvokeEvent,
  { taskId, inputPath, outputPath, duration, pitch }: PitchAdjustmentArgs
): Promise<string> {
  try {
    const format = await getFormatNameForAudios(inputPath);
    const muxer = getMuxersOfAudios(format);

    await new Promise<void>((resolve, reject) => {
      const command = ffmpeg(inputPath)
        .audioFilters(`asetrate=44100*${pitch},atempo=1/${pitch},aresample=44100`)
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


    return 'Pitch modification complete';
  } catch (error) {
    throw new Error(`Processing failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export function audioPitchHandler(): void {
  ipcMain.handle('audio-pitch', async (event, args: PitchAdjustmentArgs) => {
    try {
      const result = await modifyPitch(event, args);
      return { success: true, message: result };
    } catch (error) {
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Unknown error occurred' 
      };
    }
  });
}