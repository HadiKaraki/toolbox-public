import ffmpeg from '../ffmpegConfig';
// import { getFormatNameForImages, getMuxersOfImages } from '../getMetadataFfprobe';
import { ipcMain } from 'electron';

interface AdjustmentArgs {
  inputPath: string;
  outputPath: string;
  borderWidth: number;
  borderColor: string;
}

export async function addBorder({ inputPath, outputPath, borderWidth, borderColor }: AdjustmentArgs): Promise<string> {
    function generatePadFilter(borderWidth: number, borderColor: string) {
        const borderPx = borderWidth;
        const padWidth = `iw+${borderPx * 4.5}`;
        const padHeight = `ih+${borderPx * 4.5}`;
        const xOffset = borderPx * 2.5;
        const yOffset = borderPx * 2.5;
        
        return `pad=${padWidth}:${padHeight}:${xOffset}:${yOffset}:color=${borderColor}`;
    }

    const filter = generatePadFilter(borderWidth, borderColor);
    try {
        // const format = await getFormatNameForImages(inputPath);
        // const muxer = getMuxersOfImages(format);
    
        await new Promise<void>((resolve, reject) => {
          ffmpeg(inputPath)
            .inputOptions('-framerate 1')
            .videoFilters(filter)
            .outputFormat('mjpeg')
            .output(outputPath)
            .on('end', (stderr: string | null) => {
              if (stderr) {
                reject(new Error(stderr));
                return;
              }
              resolve();
            })
            .on('error', (err: Error) => reject(err))
            .run();
        });
    
        return 'Border adding complete';
      } catch (error) {
        throw new Error(`FFmpeg processing failed: ${error instanceof Error ? error.message : String(error)}`);
    }
}

export function imageBorderHandler() {
  ipcMain.handle('image-border', async (_event, args) => {
    try {
      const result = await addBorder(args);
      return { success: true, message: result };
    } catch (error) {
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Unknown error occurred' 
      };
    }
  });
}