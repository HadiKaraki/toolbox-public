import { ipcMain, IpcMainInvokeEvent } from 'electron';
import ffmpeg from '../ffmpegConfig';
import { ffmpegManager } from '../ffmpegManager';
import { getFormatNameForVideos, getMuxersOfVideos } from '../getMetadataFfprobe';

interface PlaybackSpeedArgs {
  taskId: string;
  inputPath: string;
  outputPath: string;
  duration: number;
  playbackSpeed: number;
}

export async function adjustPlaybackSpeed(
  event: IpcMainInvokeEvent,
  { taskId, inputPath, outputPath, duration, playbackSpeed }: PlaybackSpeedArgs
): Promise<string> {
  try {
    const format = await getFormatNameForVideos(inputPath);
    const muxer = getMuxersOfVideos(format);

    let videoFilters = '';
    let audioFilters = '';

    switch (playbackSpeed) {
        case 0.25:
            videoFilters = 'setpts=4.0*PTS';
            audioFilters = 'atempo=0.75';
          break;
        case 0.5:
            videoFilters = 'setpts=2.0*PTS';
            audioFilters = 'atempo=0.5';
            break;
        case 0.75:
            videoFilters = 'setpts=1.3333*PTS';
            audioFilters = 'atempo=0.25';
            break;
        case 1.25:
            videoFilters = 'setpts=0.8*PTS';
          audioFilters = 'atempo=1.25';
          break;
        case 1.5:
            videoFilters = 'setpts=0.6667*PTS';
            audioFilters = 'atempo=1.5';
          break;
        case 2:
            videoFilters = 'setpts=0.5*PTS';
            audioFilters = 'atempo=2.0';
            break;
        case 3:
            videoFilters = 'setpts=0.3333*PTS';
            audioFilters = 'atempo=2.0,atempo=1.5';
            break;
        case 4:
            videoFilters = 'setpts=0.25*PTS';
            audioFilters = 'atempo=2.0,atempo=2.0';
            break;
        default:
          // Statements executed when none of the cases match the expression (not necessary)
    }

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
        .videoFilters(videoFilters)
        .audioFilters(audioFilters)
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


    return 'Playback speed adjustment complete';
  } catch (error) {
    throw new Error(`Processing failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export function videoPlaybackHandler(): void {
  ipcMain.handle('video-playback', async (event, args: PlaybackSpeedArgs) => {
    try {
      const result = await adjustPlaybackSpeed(event, args);
      return { success: true, message: result };
    } catch (error) {
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Unknown error occurred' 
      };
    }
  });
}