import sharp from 'sharp';
import { ipcMain } from 'electron';

interface BrightnessAdjustmentArgs {
  inputPath: string;
  outputPath: string;
  brightness: number;
}

export async function adjustBrightness({ inputPath, outputPath, brightness = 1.0 }: BrightnessAdjustmentArgs): Promise<string> {
  try {
    await sharp(inputPath)
      .modulate({
        brightness: brightness
      })
      .toFile(outputPath);
    
    return 'Brightness adjustment complete';
  } catch (error) {
    throw new Error(`Sharp processing failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/* Registers IPC handlers for image processing */
export function imageBrightnessHandler() {
  ipcMain.handle('image-brightness', async (_event, args) => {
    try {
      const result = await adjustBrightness(args);
      return { success: true, message: result };
    } catch (error) {
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Unknown error occurred' 
      };
    }
  });
}