// import { ipcMain } from 'electron';
// import ffmpeg from '../ffmpegConfig';
// // import { getFormatNameForImages, getMuxersOfImages } from '../getMetadataFfprobe';

// interface AdjustmentArgs {
//     inputPath: string;
//     outputPath: string;
//     grayscale: number;
//     pixelate: number;
//     lowResolution: boolean;
//     nearestNeighbor: boolean;
// }

// interface ProcessingResult {
//   success: boolean;
//   message: string;
// }

// export async function pixelateImage({ inputPath, outputPath, pixelate, lowResolution, nearestNeighbor }: AdjustmentArgs): Promise<string> {
//   try {
//     // const format = await getFormatNameForImages(inputPath);
//     // const muxer = getMuxersOfImages(format);

//     // let pixelSize = parseInt(pixelate, 10);
    
//     // Optional: cap to 100 so you don't scale down to <1px
//     // let pixelSize = Math.min(pixelSize, 100);
//     let pixelSize = pixelate;

//     // Build ffmpeg filters
//     const filters = [];
//     if (lowResolution) {
//       // first shrink everything to 64×64
//       filters.push('scale=64:64:flags=neighbor');
//     }
//     // the core pixelation: shrink then expand by pixelSize
//     if (nearestNeighbor) {
//       filters.push(`scale=iw/${pixelSize}:ih/${pixelSize}:flags=neighbor`);
//       filters.push(`scale=iw*${pixelSize}:ih*${pixelSize}:flags=neighbor`);
//     } else {
//       // if they don’t want NN, let ffmpeg choose (it’ll default to bicubic)
//       filters.push(`scale=iw/${pixelSize}:ih/${pixelSize}`);
//       filters.push(`scale=iw*${pixelSize}:ih*${pixelSize}`);
//     }

//     await new Promise<void>((resolve, reject) => {
//       ffmpeg(inputPath)
//         .inputOptions('-framerate 1')
//         .videoFilters(filters)
//         .outputFormat("mjpeg")
//         .output(outputPath)
//         .on('end', (stderr: string | null) => {
//           if (stderr) {
//             reject(new Error(stderr));
//             return;
//           }
//           resolve();
//         })
//         .on('error', (err: Error) => reject(err))
//         .run();
//     });

//     return 'Grayscale adjustment complete';
//   } catch (error) {
//     throw new Error(`FFmpeg processing failed: ${error instanceof Error ? error.message : String(error)}`);
//   }
// }

// export function imagePixelatingHandler(): void {
//   ipcMain.handle('image-grayscale', async (_event, args: AdjustmentArgs): Promise<ProcessingResult> => {
//     try {
//       const result = await pixelateImage(args);
//       return { success: true, message: result };
//     } catch (error) {
//       return { 
//         success: false, 
//         message: error instanceof Error ? error.message : 'Unknown error occurred' 
//       };
//     }
//   });
// }