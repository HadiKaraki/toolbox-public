import sharp from 'sharp';
import { ipcMain } from 'electron';

interface CompressionAdjustmentArgs {
  inputPath: string;
  outputPath: string;
  quality: number;
}

export async function compressImage({ inputPath, outputPath, quality }: CompressionAdjustmentArgs): Promise<string> {
  try {
    const metadata = await sharp(inputPath).metadata();
    const inputFormat = metadata.format;

    const transformer = sharp(inputPath)
      .resize(1024) // Optional resize (adjust as needed)
      .on('error', (err) => {
        throw err;
      });

    // Set output format and compression
    switch (inputFormat) {
      case 'jpeg':
      case 'jpg':
        transformer.jpeg({ quality: quality ?? 80 }); // Default: 80
        break;
      case 'png':
        transformer.png({ quality: quality ?? 90 }); // quality acts as compression level
        break;
      case 'webp':
        transformer.webp({ quality: quality ?? 80 });
        break;
      case 'avif':
        transformer.avif({ quality: quality ?? 50 }); // Lower default due to AVIF's efficiency
        break;
      default:
        throw new Error(`Unsupported format: ${inputFormat}`);
    }
    transformer.toFile(outputPath)
    
    return 'Image compression complete';
  } catch (error) {
    throw new Error(`Sharp processing failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export function imageCompressionHandler() {
  ipcMain.handle('image-compression', async (_event, args) => {
    try {
      const result = await compressImage(args);
      return { success: true, message: result };
    } catch (error) {
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Unknown error occurred' 
      };
    }
  });
}