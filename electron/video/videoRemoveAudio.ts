import { ipcMain, IpcMainInvokeEvent } from 'electron';
import ffmpeg from '../ffmpegConfig';
import { ffmpegManager } from '../ffmpegManager';
import { getFormatNameForVideos, getMuxersOfVideos } from '../getMetadataFfprobe';

interface AdjustmentArgs {
  taskId: string;
  inputPath: string;
  outputPath: string;
  duration: number;
}

export async function removeAudio(
  event: IpcMainInvokeEvent,
  { taskId, inputPath, outputPath, duration }: AdjustmentArgs
): Promise<string> {
  try {
    const format = await getFormatNameForVideos(inputPath);
    const muxer = getMuxersOfVideos(format);

    const outputOptions: string[] = [];
    if (['mp4','mov'].includes(format)) {
        outputOptions.push(
        '-movflags', 'frag_keyframe+empty_moov+default_base_moof+faststart'
        );
    } else {
        outputOptions.push(
        '-max_muxing_queue_size', '9999'
        );
    }

    await new Promise<void>((resolve, reject) => {
      const command = ffmpeg(inputPath)
        .noAudio()
        .outputOptions(outputOptions)
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


    return 'Audio removing complete';
  } catch (error) {
    throw new Error(`Processing failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export function videoAudioRemovingHandler(): void {
  ipcMain.handle('video-remove-audio', async (event, args: AdjustmentArgs) => {
    try {
      const result = await removeAudio(event, args);
      return { success: true, message: result };
    } catch (error) {
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Unknown error occurred' 
      };
    }
  });
}