import { useState, useRef, useEffect, useCallback } from "react";
import { useImageContext } from '../../contexts/ImageContext';
import ImageDisplay from '../../components/ImageDisplay';
import ImageSubmitBtn from "../../components/ImageSubmitBtn";
import BackToImageTools from "../../components/BackToImageTools";

export default function GrayscaleImage() {
    const { imageFile, setImageFile } = useImageContext();
    const [grayscale, setGrayscale] = useState(0);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [error, setError] = useState<string | null>(null);
    const [completedMsg, setCompletedMsg] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [previewMode, setPreviewMode] = useState(true);

    const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        setImageFile(file);
      }
    }, []);

    const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        const file = e.dataTransfer.files[0];
        if (!file.type.startsWith('image/')) {
          setError('Please drop an image file');
          return;
        }
        
        setImageFile(file);
      }
    }, []);

    // Load image into canvas when file or brightness changes
    useEffect(() => {
      if (!imageFile || !canvasRef.current) return;

      const img = new Image();
      img.src = URL.createObjectURL(imageFile);
      img.onload = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        // Set canvas size to image size (with max constraints)
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

        ctx.filter = previewMode ? `grayscale(${grayscale})` : 'none';
        ctx.drawImage(img, 0, 0, width, height);
      };

      return () => {
        URL.revokeObjectURL(img.src);
      };
    }, [imageFile, grayscale, previewMode]);

    const handleRemoveImage = useCallback(() => {
      setImageFile(null);
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        ctx?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
    }, []);

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
        const outputFilename = `${originalName}_grayed.${extension}`;
        const outputPath = await window.electronAPI.showSaveDialog(outputFilename);
        
        if (!outputPath) {
          throw new Error('Save canceled by user');
        }

        // 3. Process image
        const result = await window.electronAPI.adjustGrayscale({
          inputPath: tempResult.path,
          outputPath,
          grayscale
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

    return (
      <div className="container lg:mt-5 mx-auto px-4 py-8 xl:min-w-5xl max-w-6xl">
        {/* Header Section */}
        <BackToImageTools
          title={"Grayscale Image"}
          description={"Adjust the grayscale of your images"}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload & Preview Section */}
          <ImageDisplay
            handleFileChange={handleFileChange}
            handleDrop={handleDrop}
            handleRemoveImage={handleRemoveImage}
            setPreviewMode={setPreviewMode}
            isProcessing={isProcessing}
            previewMode={previewMode}
            imageFile={imageFile}
            canvasRef={canvasRef}
            isPreviewed={true}
          />
          
          {/* Controls Section */}
          <div className="bg-white rounded-lg dark:bg-gray-800 dark:border-gray-700 shadow-md p-6 border border-gray-200">
            <h2 className="text-xl font-semibold dark:text-white mb-4 text-gray-700">Grayscale Settings</h2>
            
            <div className="space-y-6">
              <div>
                <div className="flex justify-between mb-2">
                  <label htmlFor="grayscaleRange" className="block dark:text-gray-400 text-sm font-medium text-gray-700">
                    Grayscale Intensity
                  </label>
                  <span className="text-sm dark:text-gray-400 font-semibold text-blue-600">{grayscale}px</span>
                </div>
                <input
                    id="grayscaleRange"
                    type="range"
                    min="0.1"
                    max="1"
                    step="0.1"
                    value={grayscale}
                    onChange={(e) => setGrayscale(parseFloat(e.target.value))}
                    disabled={!imageFile}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Min</span>
                  <span>Max</span>
                </div>
              </div>

              <ImageSubmitBtn
                  btnTitle={"Adjust Grayscale & Save"}
                  handleProcessing={handleProcessing}
                  imageFile={imageFile}
                  completedMsg={completedMsg}
                  error={error}
                  isProcessing={isProcessing}
              />

              {/* Tips Section */}
              <div className="bg-blue-50 p-4 dark:bg-gray-900/60 rounded-lg">
                  <h3 className="text-sm font-medium dark:text-white text-blue-800 mb-2">Grayscale Adjustment Tips</h3>
                  <ul className="text-xs dark:text-gray-300 text-blue-700 space-y-1">
                      <li className="flex items-start">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mt-0.5 mr-1.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span><strong>0</strong> - Original image (no change)</span>
                      </li>
                      <li className="flex items-start">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mt-0.5 mr-1.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span><strong>0.5</strong> - Partial gray</span>
                      </li>
                      <li className="flex items-start">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mt-0.5 mr-1.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span><strong>1</strong> - Full gray</span>
                      </li>
                      <li className="flex items-start">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mt-0.5 mr-1.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span>Use <strong>small increments (0.1-0.2)</strong> for precise adjustments</span>
                      </li>
                      <li className="flex items-start">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mt-0.5 mr-1.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span>Toggle <strong>Preview Mode</strong> to compare before/after results</span>
                      </li>
                  </ul>
                </div>
            </div>
          </div>
        </div>
      </div>
    );
}