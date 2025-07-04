import { ipcMain, IpcMainInvokeEvent } from 'electron';
import ffmpeg from '../ffmpegConfig';
import { ffmpegManager } from '../ffmpegManager';
import { getFormatVideoAndAudioCodecs, getMuxersOfVideos } from '../getMetadataFfprobe';

type VideoFormat = 'mp4' | 'mkv' | 'webm' | 'mov' | 'avi' | 'flv' | 'ogg';

interface VideoConvertingArgs {
  taskId: string;
  inputPath: string;
  outputPath: string;
  duration: number;
  videoFormat: VideoFormat;
}

export async function convertVideo(
  event: IpcMainInvokeEvent,
  { taskId, inputPath, outputPath, duration, videoFormat }: VideoConvertingArgs
): Promise<string> {
  try {
    const { videoCodec, audioCodec } = getFormatVideoAndAudioCodecs(videoFormat)
    const muxer = getMuxersOfVideos(videoFormat);

    const outputOptions: string[] = [];
    if (['mp4','mov'].includes(videoFormat)) {
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
        .videoCodec(videoCodec)
        .audioCodec(audioCodec)
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


    return 'Video converting complete';
  } catch (error) {
    throw new Error(`Processing failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export function convertVideoHandler(): void {
  ipcMain.handle('video-converting', async (event, args: VideoConvertingArgs) => {
    try {
      const result = await convertVideo(event, args);
      return { success: true, message: result };
    } catch (error) {
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Unknown error occurred' 
      };
    }
  });
}