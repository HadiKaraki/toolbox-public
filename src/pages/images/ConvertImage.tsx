import { useState, useRef, useEffect } from "react";
import { useImageContext } from '../../contexts/ImageContext';
import ImageDisplay from '../../components/ImageDisplay';
import ImageSubmitBtn from "../../components/ImageSubmitBtn";
import BackToImageTools from "../../components/BackToImageTools";

export default function ConvertImage() {
    const { imageFile, setImageFile } = useImageContext();
    const [format, setFormat] = useState('png');
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [error, setError] = useState<string | null>(null);
    const [completedMsg, setCompletedMsg] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [previewMode, setPreviewMode] = useState(true);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        setImageFile(file);
      }
    };

    const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        const file = e.dataTransfer.files[0];
        if (!file.type.startsWith('image/')) {
          setError('Please drop an image file');
          return;
        }
        
        setImageFile(file);
      }
    };

    useEffect(() => {
      if (!imageFile || !canvasRef.current) return;

      const img = new Image();
      img.src = URL.createObjectURL(imageFile);
      img.onload = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        const maxWidth = 800;
        const maxHeight = 600;
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = (maxWidth / width) * height;
          width = maxWidth;
        }
        if (height > maxHeight) {
          width = (maxHeight / height) * width;
          height = maxHeight;
        }

        canvas.width = width;
        canvas.height = height;

        ctx.drawImage(img, 0, 0, width, height);
      };

      return () => {
        URL.revokeObjectURL(img.src);
      };
    }, [imageFile, format, previewMode]);

    const handleRemoveImage = () => {
      setImageFile(null);
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        ctx?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
    };

    const handleProcessing = async () => {
      if (!imageFile) return;
      
      setIsProcessing(true);
      setError(null);
      setCompletedMsg(null);

      try {
        // 1. Create temp file
        const arrayBuffer = await imageFile.arrayBuffer();
        const extension = imageFile.name.split('.').pop() || '.png';
        const tempResult = await window.electronAPI.createTempFile(arrayBuffer, extension);
        
        if (!tempResult.success || !tempResult.path) {
          throw new Error(tempResult.message || 'Failed to create temp file');
        }

        // 2. Get save path
        const originalName = imageFile.name.replace(/\.[^/.]+$/, "");
        const outputFilename = `${originalName}.${format}`;
        const outputPath = await window.electronAPI.showSaveDialog(outputFilename);
        
        if (!outputPath) {
          throw new Error('Save canceled by user');
        }

        // 3. Process image
        const result = await window.electronAPI.convertImage({
          inputPath: tempResult.path,
          outputPath,
          format
        });

        if (result.success) {
          setCompletedMsg(result.message);
        } else {
          throw new Error(result.message);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Processing failed');
      } finally {
        setIsProcessing(false);
      }
    };

    const formats = [
      "jpeg", "png", "webp", "bmp", "tiff", "svg", "avif", "ico",
      "tga", "ppm", "pgm", "pbm", "pnm", "heif"
    ];

    return (
      <div className="container lg:mt-5 mx-auto px-4 py-8 max-w-5xl">
        {/* Header Section */}
        <BackToImageTools
            title={"Convert Image"}
            description={"Convert between PNG, JPG, WebP etc."}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload & Preview Section */}
          <ImageDisplay
            handleFileChange={handleFileChange}
            handleDrop={handleDrop}
            handleRemoveImage={handleRemoveImage}
            setPreviewMode={setPreviewMode}
            previewMode={previewMode}
            imageFile={imageFile}
            canvasRef={canvasRef}
          />
          
          {/* Controls Section */}
          <div className="bg-white rounded-lg dark:bg-gray-800 dark:border-gray-700 shadow-md p-6 border border-gray-200">
            <h2 className="text-xl font-semibold mb-4 text-gray-700 dark:text-white">Image Formats</h2>
          
            <div className="space-y-6">
              <div className="space-y-4">
                  <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">
                          Choose Image Format
                      </label>
                      <select
                          value={format}
                          onChange={(e) => setFormat(e.target.value)}
                          className="w-full border bg-white dark:bg-black dark:text-white text-black border-gray-300 rounded-md p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                          {formats.map((format) => (
                            <option key={format} value={format}>
                              {format.toUpperCase()}
                            </option>
                          ))}
                      </select>
                  </div>
              </div>

              <ImageSubmitBtn
                  btnTitle={"Convert Image & Save"}
                  handleProcessing={handleProcessing}
                  imageFile={imageFile}
                  completedMsg={completedMsg}
                  error={error}
                  isProcessing={isProcessing}
              />

              {/* Tips Section */}
              <div className="bg-blue-50 p-4 dark:bg-gray-900/60 rounded-lg">
                <h3 className="text-sm font-medium text-blue-800 dark:text-white mb-2">Quality Adjustment Tips</h3>
                <ul className="text-xs text-blue-700 dark:text-white space-y-2">
                    <li className="flex items-start">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mt-0.5 mr-1.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span><strong>JPEG</strong> – Great for photos and web use, with small file sizes</span>
                    </li>
                    <li className="flex items-start">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mt-0.5 mr-1.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span><strong>PNG</strong> – Ideal for transparent images and sharp graphics</span>
                    </li>
                    <li className="flex items-start">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mt-0.5 mr-1.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span><strong>WEBP</strong> – Modern format offering high quality with small size</span>
                    </li>
                    <li className="flex items-start">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mt-0.5 mr-1.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span><strong>BMP</strong> – Uncompressed format, rarely used due to large size</span>
                    </li>
                    <li className="flex items-start">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mt-0.5 mr-1.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span><strong>TIFF</strong> – High-quality format used in printing and scanning</span>
                    </li>
                    <li className="flex items-start">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mt-0.5 mr-1.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span><strong>ICO</strong> – Icon format used for favicons and Windows icons</span>
                    </li>
                    <li className="flex items-start">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mt-0.5 mr-1.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span><strong>AVIF</strong> – Cutting-edge format with better compression than WEBP</span>
                    </li>
                    <li className="flex items-start">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mt-0.5 mr-1.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span><strong>SVG</strong> – Vector format perfect for logos and sharp graphics at any size</span>
                    </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
}