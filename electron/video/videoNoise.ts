import { ipcMain, IpcMainInvokeEvent } from 'electron';
import ffmpeg from '../ffmpegConfig';
import { ffmpegManager } from '../ffmpegManager';
import { getFormatNameForVideos, getMuxersOfVideos, getCompressionOptionsForNoise } from '../getMetadataFfprobe';

interface AdjustmentArgs {
  taskId: string;
  inputPath: string;
  outputPath: string;
  duration: number;
  noise: number;
}

export async function videoNoise(
  event: IpcMainInvokeEvent,
  { taskId, inputPath, outputPath, duration, noise }: AdjustmentArgs
): Promise<string> {
  try {
    const format = await getFormatNameForVideos(inputPath);
    const muxer = getMuxersOfVideos(format);
    const { bitrateKbps, crf, preset } = getCompressionOptionsForNoise(noise);

    const outputOptions = [
        `-b:v ${bitrateKbps}k`,               // Set average video bitrate
        `-maxrate ${bitrateKbps + 500}k`,           // Max bitrate for rate control
        `-bufsize ${bitrateKbps * 2}k`,           // Buffer size for rate control
        `-preset ${preset}`,
        `-crf ${crf}`,
        '-movflags frag_keyframe+empty_moov+default_base_moof+faststart'
    ]

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
        .videoFilters(`noise=alls=${noise}:allf=t`)
        .outputOptions(outputOptions)
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


    return 'Noise adding complete';
  } catch (error) {
    throw new Error(`Processing failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export function videoNoiseHandler(): void {
  ipcMain.handle('video-noise', async (event, args: AdjustmentArgs) => {
    try {
      const result = await videoNoise(event, args);
      return { success: true, message: result };
    } catch (error) {
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Unknown error occurred' 
      };
    }
  });
}