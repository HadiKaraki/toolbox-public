import { ipcMain, IpcMainInvokeEvent } from 'electron';
import ffmpeg from '../ffmpegConfig';
import { ffmpegManager } from '../ffmpegManager';
import { getFormatNameForVideos, getMuxersOfVideos } from '../getMetadataFfprobe';

interface FPSAdjustmentArgs {
  taskId: string;
  inputPath: string;
  outputPath: string;
  duration: number;
  fps: number;
}

export async function adjustFps(
  event: IpcMainInvokeEvent,
  { taskId, inputPath, outputPath, duration, fps }: FPSAdjustmentArgs
): Promise<string> {
  try {
    const format = await getFormatNameForVideos(inputPath);
    const muxer = getMuxersOfVideos(format);

    const outputOptions = [
      '-pix_fmt', 'yuv420p',
      '-max_muxing_queue_size', '2048',
      '-crf', '23', '-preset', 'faster',
      '-b:a', '128k',
      '-r', `${fps}`
    ];

    if (['mp4', 'mov'].includes(format)) {
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
        .inputOptions([
          '-probesize', '50M',
          '-analyzeduration', '100M'
        ])
        .outputOptions(outputOptions)
        .outputFormat(muxer)
        .output(outputPath)
        .on('progress', (progress) => {
          const [h, m, s] = progress.timemark.split(':').map(parseFloat);
          const seconds = h * 3600 + m * 60 + s;
          if (seconds >= 0) {
            const percent = Math.min(100, (seconds / duration) * 100);
            event.sender.send('ffmpeg-progress', { 
              taskId,  // Include the taskId here
              progress: percent  // Changed from 'percent' to 'progress' to match your frontend
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


    return 'FPS modification complete';
  } catch (error) {
    throw new Error(`Processing failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export function changeFpsHandler(): void {
  ipcMain.handle('video-fps', async (event, args: FPSAdjustmentArgs) => {
    try {
      const result = await adjustFps(event, args);
      return { success: true, message: result };
    } catch (error) {
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Unknown error occurred' 
      };
    }
  });
}