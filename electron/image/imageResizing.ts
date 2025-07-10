import sharp from 'sharp';
import { ipcMain } from 'electron';

type Fit = "cover" | "contain" | "fill" | "inside" | "outside";

interface AdjustmentArgs {
    inputPath: string;
    outputPath: string;
    brightness: number;
    height: number;
    width: number;
    fit: Fit;
}

export async function resizeImage({ inputPath, outputPath, height, width, fit }: AdjustmentArgs): Promise<string> {
  try {
    await sharp(inputPath)
         .resize({
            width,
            height,
            fit
        })
        .toFile(outputPath);
    
    return 'Image resizing complete';
  } catch (error) {
    throw new Error(`Sharp processing failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export function imageResizingHandler() {
  ipcMain.handle('image-resize', async (_event, args) => {
    try {
      const result = await resizeImage(args);
      return { success: true, message: result };
    } catch (error) {
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Unknown error occurred' 
      };
    }
  });
}