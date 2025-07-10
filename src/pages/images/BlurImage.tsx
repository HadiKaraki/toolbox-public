import { useState, useRef, useEffect } from "react";
import { useImageContext } from '../../contexts/ImageContext';
import ImageDisplay from '../../components/ImageDisplay';
import ImageSubmitBtn from "../../components/ImageSubmitBtn";
import BackToImageTools from "../../components/BackToImageTools";

export default function BlurImage() {
    const { imageFile, setImageFile } = useImageContext();
    const [sigma, setSigma] = useState(0);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [error, setError] = useState<string | null>(null);
    const [completedMsg, setCompletedMsg] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [previewMode, setPreviewMode] = useState(true);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        setImageFile(file);
        
        // Also read the file as array buffer for processing
        // const arrayBuffer = await file.arrayBuffer();
        // const buffer = Buffer.from(arrayBuffer);
        
        // Send to main process to get image data
        // const imageData = await ipcRenderer.invoke('get-image-data', buffer);
        // if (imageData) {
        //   setOriginalImageData(imageData);
        // }
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
        
        // const arrayBuffer = await file.arrayBuffer();
        // const buffer = Buffer.from(arrayBuffer);
        // const imageData = await ipcRenderer.invoke('get-image-data', buffer);
        // if (imageData) {
        //   setOriginalImageData(imageData);
        // }
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

        ctx.filter = previewMode ? `blur(${sigma}px)` : 'none';
        ctx.drawImage(img, 0, 0, width, height);
      };

      return () => {
        URL.revokeObjectURL(img.src);
      };
    }, [imageFile, sigma, previewMode]);

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
        const outputFilename = `${originalName}_blurred.${extension}`;
        const outputPath = await window.electronAPI.showSaveDialog(outputFilename);
        
        if (!outputPath) {
          throw new Error('Save canceled by user');
        }

        // 3. Process image
        const result = await window.electronAPI.blurImage({
          inputPath: tempResult.path,
          outputPath,
          blur: sigma + 1
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
      <div className="container lg:mt-5 mx-auto px-4 py-8 min-w-5xl">
        {/* Header Section */}
        <BackToImageTools
          title={"Blurring Image"}
          description={"Adjust the blurring of your images"}
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
            isPreviewed={true}
          />
          
          {/* Controls Section */}
          <div className="bg-white rounded-lg dark:bg-gray-800 dark:border-gray-700 shadow-md p-6 border border-gray-200">
            <h2 className="text-xl font-semibold dark:text-white mb-4 text-gray-700">Blurring Settings</h2>
            
            <div className="space-y-6">
              <div>
                <div className="flex justify-between mb-2">
                  <label htmlFor="blurRange" className="block text-sm font-medium dark:text-gray-400 text-gray-700">
                    Blur Intensity
                  </label>
                  <span className="text-sm font-semibold dark:text-gray-400 text-blue-600">{sigma}px</span>
                </div>
                <input
                    id="blurRange"
                    type="range"
                    min="0.1"
                    max="5"
                    step="0.1"
                    value={sigma}
                    onChange={(e) => setSigma(parseFloat(e.target.value))}
                    disabled={!imageFile}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Min</span>
                  <span>Max</span>
                </div>
              </div>

              <ImageSubmitBtn
                  btnTitle={"Blur Image & Save"}
                  handleProcessing={handleProcessing}
                  imageFile={imageFile}
                  completedMsg={completedMsg}
                  error={error}
                  isProcessing={isProcessing}
              />

              {/* Tips Section */}
              <div className="bg-blue-50 p-4 dark:bg-gray-900/60 rounded-lg">
                <h3 className="text-sm font-medium text-blue-800 mb-2 dark:text-white">Tips</h3>
                <ul className="text-xs text-blue-700 space-y-1 dark:text-gray-300">
                    <li className="flex items-start">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mt-0.5 mr-1.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Toggle preview to compare original and blurred versions</span>
                    </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
}