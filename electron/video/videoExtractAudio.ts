import { ipcMain, IpcMainInvokeEvent } from 'electron';
import ffmpeg from '../ffmpegConfig';
import { ffmpegManager } from '../ffmpegManager';
import { getCodecsOfAudios, getMuxersOfAudios } from '../getMetadataFfprobe';

type AudioFormat = 'mp3' | 'wav' | 'ogg' | 'flac' | 'm4a' | 'aac' | 'opus' | 'alac';

interface ExtractAudioArgs {
  taskId: string;
  inputPath: string;
  outputPath: string;
  duration: number;
  audioFormat: AudioFormat;
  audioQuality: number;
}

export async function extractVideoAudio(
  event: IpcMainInvokeEvent,
  { taskId, inputPath, outputPath, duration, audioFormat, audioQuality }: ExtractAudioArgs
): Promise<string> {
  try {
    const { codec, outputOptions } = getCodecsOfAudios(audioFormat);
    const muxer = getMuxersOfAudios(audioFormat);

    await new Promise<void>((resolve, reject) => {
      const command = ffmpeg(inputPath)
        .noVideo()
        .audioBitrate(audioQuality)
        .audioCodec(codec)
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


    return 'Audio extracting complete';
  } catch (error) {
    throw new Error(`Processing failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export function extractAudioHandler(): void {
  ipcMain.handle('video-audio-extracting', async (event, args: ExtractAudioArgs) => {
    try {
      const result = await extractVideoAudio(event, args);
      return { success: true, message: result };
    } catch (error) {
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Unknown error occurred' 
      };
    }
  });
}