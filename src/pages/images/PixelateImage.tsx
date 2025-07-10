import { useState, useRef, useEffect } from "react";
import { useImageContext } from '../../contexts/ImageContext';
import ImageDisplay from '../../components/ImageDisplay';
import ImageSubmitBtn from "../../components/ImageSubmitBtn";
import BackToImageTools from "../../components/BackToImageTools";

export default function PixelateImage() {
    const { imageFile, setImageFile } = useImageContext();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [pixelate, setPixelate] = useState(0);
    const [lowResolution, setLowResolution] = useState(false);
    const [nearestNeighbor, setNearestNeighbor] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [completedMsg, setCompletedMsg] = useState<string | null>(null);
    const [previewMode, setPreviewMode] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);

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

        ctx.drawImage(img, 0, 0, width, height);
      };
    }, [imageFile, pixelate, previewMode]);

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
        const arrayBuffer = await imageFile.arrayBuffer();
        const extension = imageFile.name.split('.').pop() || '.png';
        const tempResult = await window.electronAPI.createTempFile(arrayBuffer, extension);
        
        if (!tempResult.success || !tempResult.path) {
          throw new Error(tempResult.message || 'Failed to create temp file');
        }

        const originalName = imageFile.name.replace(/\.[^/.]+$/, "");
        const outputFilename = `${originalName}_pixelated.${extension}`;
        const outputPath = await window.electronAPI.showSaveDialog(outputFilename);
        
        if (!outputPath) {
          throw new Error('Save canceled by user');
        }

        const result = await window.electronAPI.pixelateImage({
          inputPath: tempResult.path,
          outputPath,
          pixelate,
          lowResolution,
          nearestNeighbor,
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
            title={"Pixelate Image"}
            description={"Apply Pixelate effect to your images"}
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
              isPreviewed={false}
          />
          {/* Controls Section */}
          <div className="bg-white rounded-lg dark:bg-gray-800 dark:border-gray-700 shadow-md p-6 border border-gray-200">
            <h2 className="text-xl font-semibold dark:text-white mb-4 text-gray-700">Pixelate Settings</h2>
            
            <div className="space-y-6">
              <div>
                <div className="flex justify-between mb-2">
                  <label htmlFor="pixelateRange" className="block dark:text-gray-400 text-sm font-medium text-gray-700">
                    Pixelate Intensity
                  </label>
                  <span className="text-sm dark:text-gray-400 font-semibold text-blue-600">{pixelate}px</span>
                </div>
                <input
                    id="pixelateRange"
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    value={pixelate}
                    onChange={(e) => setPixelate(parseInt(e.target.value))}
                    disabled={!imageFile}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Min</span>
                  <span>Max</span>
                </div>
                <div className="flex mt-2">
                    <div className="mr-4">
                        <label className="mr-1 hover:cursor-pointer text-black dark:text-white" htmlFor="lowResolution">Low Resolution</label>
                        <input id="lowResolution" onChange={() => setLowResolution(!lowResolution)} type="checkbox" checked={lowResolution}/>
                    </div>
                    <div>
                        <label className="mr-1 hover:cursor-pointer text-black dark:text-white" htmlFor="nearestNeighbor">Nearest-Neighbor Scaling </label>
                        <input id="nearestNeighbor" onChange={() => setNearestNeighbor(!nearestNeighbor)} type="checkbox" checked={nearestNeighbor}/>
                    </div>
                </div>
              </div>

              <ImageSubmitBtn
                   btnTitle={"Pixelate Image & Save"}
                  handleProcessing={handleProcessing}
                  imageFile={imageFile}
                  completedMsg={completedMsg}
                  error={error}
                  isProcessing={isProcessing}
              />

              {/* Tips Section */}
              <div className="bg-blue-50 dark:bg-gray-900/60 p-4 rounded-lg">
                <h3 className="text-sm dark:text-white font-medium text-blue-800 mb-2">Pixelate Adjustment Tips</h3>
                <ul className="text-xs dark:text-gray-300 text-blue-700 space-y-1">
                    <li className="flex items-start">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mt-0.5 mr-1.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span><strong>10–30px</strong> - Subtle (e.g., anonymize faces)</span>
                        </li>
                        <li className="flex items-start">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mt-0.5 mr-1.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span><strong>40–70px</strong> - Retro/video game effect</span>
                        </li>
                        <li className="flex items-start">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mt-0.5 mr-1.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span><strong>80–100px</strong> - Abstract/minimalist art</span>
                        </li>
                        <li className="flex items-start">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mt-0.5 mr-1.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Enable <strong>Nearest-Neighbor Scaling</strong> for sharp pixels (no blur)</span>
                        </li>
                        <li className="flex items-start">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mt-0.5 mr-1.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Enable <strong>Low Resolution</strong> (e.g., 64x64) for 8-bit style</span>
                        </li>
                    </ul>
                </div>
            </div>
          </div>
        </div>
      </div>
    );
}