import sharp from 'sharp';
import { ipcMain } from 'electron';

interface SharpParams {
  sigma: number;
  flat: number;
  jagged: number;
}

// Define valid modes as a type
type SharpenMode = 'soft' | 'balanced' | 'strong';

const SHARPEN_PRESETS: Record<SharpenMode, SharpParams> = {
  soft: { sigma: 0.5, flat: 1, jagged: 1 },
  balanced: { sigma: 1.5, flat: 1.5, jagged: 2 },
  strong: { sigma: 2.5, flat: 2, jagged: 3 }
};

interface SharpnessAdjustmentArgs {
  inputPath: string;
  outputPath: string;
  mode: SharpenMode; // Constrained to valid values
}

export async function adjustSharpness({ inputPath, outputPath, mode }: SharpnessAdjustmentArgs): Promise<string> {
  try {
    await sharp(inputPath)
      .sharpen(SHARPEN_PRESETS[mode])
      .toFile(outputPath);
    
    return 'Sharpness adjustment complete';
  } catch (error) {
    throw new Error(`Sharp processing failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export function imageSharpnessHandler() {
  ipcMain.handle('image-sharpness', async (_event, args) => {
    try {
      const result = await adjustSharpness(args);
      return { success: true, message: result };
    } catch (error) {
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Unknown error occurred' 
      };
    }
  });
}