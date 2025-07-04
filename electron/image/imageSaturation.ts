import sharp from 'sharp';
import { ipcMain } from 'electron';

interface SaturationAdjustmentArgs {
  inputPath: string;
  outputPath: string;
  saturation: number;
}

export async function adjustSaturation({ inputPath, outputPath, saturation }: SaturationAdjustmentArgs): Promise<string> {
  try {
    await sharp(inputPath)
      .modulate({
        saturation
      })
      .toFile(outputPath);
    
    return 'Image saturation complete';
  } catch (error) {
    throw new Error(`Sharp processing failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export function imageSaturationHandler() {
  ipcMain.handle('image-saturation', async (_event, args) => {
    try {
      const result = await adjustSaturation(args);
      return { success: true, message: result };
    } catch (error) {
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Unknown error occurred' 
      };
    }
  });
}