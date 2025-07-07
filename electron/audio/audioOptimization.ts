import { ipcMain, IpcMainInvokeEvent } from 'electron';
import ffmpeg from '../ffmpegConfig';
import { ffmpegManager } from '../ffmpegManager';
import { getFormatNameForAudios, getMuxersOfAudios } from '../getMetadataFfprobe';

type ModeName = 'standard' | 'podcast' | 'phone' | 'studio';

interface OptimizeAudioArgs {
  taskId: string;
  inputPath: string;
  outputPath: string;
  duration: number;
  mode: ModeName;
}

export async function optimizeAudio(
  event: IpcMainInvokeEvent,
  { taskId, inputPath, outputPath, duration, mode }: OptimizeAudioArgs
): Promise<string> {
  try {

    const modes = {
        standard: {
            sample_fmts: 's16',
            sample_rates: 44100,
            channel_layouts: 'stereo',
        },
        podcast: {
            sample_fmts: 's16',
            sample_rates: 48000,
            channel_layouts: 'mono',
        },
        phone: {
            sample_fmts: 'u8',
            sample_rates: 8000,
            channel_layouts: 'mono',
        },
        studio: {
            sample_fmts: 's32',
            sample_rates: 96000,
            channel_layouts: 'stereo',
        }
    };

    function buildAudioFilterFromMode(modeName: ModeName) {
        const config = modes[modeName];
        if (!config) {
            throw new Error(`Invalid optimize mode: ${modeName}`);
        }
      
        const { sample_fmts, sample_rates, channel_layouts } = config;
        return `aformat=sample_fmts=${sample_fmts}:sample_rates=${sample_rates}:channel_layouts=${channel_layouts}`;
    }

    const audioFilter = buildAudioFilterFromMode(mode);

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


    return 'Audio optimization complete';
  } catch (error) {
    throw new Error(`Processing failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export function audioOptimizeHandle(): void {
  ipcMain.handle('audio-optimize', async (event, args: OptimizeAudioArgs) => {
    try {
      const result = await optimizeAudio(event, args);
      return { success: true, message: result };
    } catch (error) {
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Unknown error occurred' 
      };
    }
  });
}