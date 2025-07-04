import sharp from 'sharp';
import { ipcMain } from 'electron';

interface BlurringAdjustmentArgs {
  inputPath: string;
  outputPath: string;
  sigma: number;
}

export async function blurImage({ inputPath, outputPath, sigma }: BlurringAdjustmentArgs): Promise<string> {
  try {
    await sharp(inputPath)
      .blur(sigma)
      .toFile(outputPath);
    
    return 'Image blurring complete';
  } catch (error) {
    throw new Error(`Sharp processing failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/* Registers IPC handlers for image processing */
export function imageBlurringHandler() {
  ipcMain.handle('image-blurring', async (_event, args) => {
    try {
      const result = await blurImage(args);
      return { success: true, message: result };
    } catch (error) {
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Unknown error occurred' 
      };
    }
  });
}