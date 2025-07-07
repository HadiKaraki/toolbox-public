import { ipcMain, IpcMainInvokeEvent } from 'electron';
import ffmpeg from '../ffmpegConfig';
import { ffmpegManager } from '../ffmpegManager';
import { getFormatNameForAudios, getMuxersOfAudios } from '../getMetadataFfprobe';

type EchoModes = 'light' | 'medium' | 'strong' | 'spacey';

interface AdjustmentArgs {
  taskId: string;
  inputPath: string;
  outputPath: string;
  duration: number;
  echoMode: EchoModes;
}

export async function addEcho(
  event: IpcMainInvokeEvent,
  { taskId, inputPath, outputPath, duration, echoMode }: AdjustmentArgs
): Promise<string> {
  try {
    const echoModes = {
        light: {
          inGain: 0.6,
          outGain: 0.5,
          delays: [500],
          decays: [0.3]
        },
        medium: {
          inGain: 0.7,
          outGain: 0.7,
          delays: [600, 1200],
          decays: [0.4, 0.3]
        },
        strong: {
          inGain: 0.8,
          outGain: 0.8,
          delays: [700, 1400],
          decays: [0.5, 0.4]
        },
        spacey: {
          inGain: 0.9,
          outGain: 0.9,
          delays: [1000, 1800, 2500],
          decays: [0.6, 0.5, 0.4]
        }
    };

    function buildAEchoFilterFromMode(modeName: EchoModes) {
        const config = echoModes[modeName];
        if (!config) {
            throw new Error(`Invalid echo mode: ${modeName}`);
        }
      
        const { inGain, outGain, delays, decays } = config;
        return `aecho=${inGain}:${outGain}:${delays.join('|')}:${decays.join('|')}`;
    }

    const echoFilter = buildAEchoFilterFromMode(echoMode);

    const format = await getFormatNameForAudios(inputPath);
    const muxer = getMuxersOfAudios(format);

    await new Promise<void>((resolve, reject) => {
      const command = ffmpeg(inputPath)
        .audioFilters(echoFilter)
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


    return 'Echo adding complete';
  } catch (error) {
    throw new Error(`Processing failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export function audioEchoHandler(): void {
  ipcMain.handle('audio-echo', async (event, args: AdjustmentArgs) => {
    try {
      const result = await addEcho(event, args);
      return { success: true, message: result };
    } catch (error) {
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Unknown error occurred' 
      };
    }
  });
}