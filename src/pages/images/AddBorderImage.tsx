import { useState, useRef, useEffect } from "react";
import { useImageContext } from '../../contexts/ImageContext';
import ImageDisplay from '../../components/ImageDisplay';
import ImageSubmitBtn from "../../components/ImageSubmitBtn";
import BackToImageTools from "../../components/BackToImageTools";

export default function AddBorderImage() {
    const { imageFile, setImageFile } = useImageContext();
    const [borderWidth, setBorderWidth] = useState(1);
    const [borderColor, setBorderColor] = useState('#000000');
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

    const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newColor = e.target.value;
        setBorderColor(newColor);
        // onChange(borderWidth, newColor);
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
    
        // Draw image first
        ctx.drawImage(img, 0, 0, width, height);
    
        // Then draw the border
        if (previewMode && borderWidth > 0) {
          ctx.lineWidth = borderWidth;
          ctx.strokeStyle = borderColor;
    
          ctx.strokeRect(
            borderWidth / 2,
            borderWidth / 2,
            canvas.width - borderWidth,
            canvas.height - borderWidth
          );
        }
      };
    
      return () => {
        URL.revokeObjectURL(img.src);
      };
    }, [imageFile, previewMode, borderWidth, borderColor]);   

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
        const outputFilename = `${originalName}_bordered.${extension}`;
        const outputPath = await window.electronAPI.showSaveDialog(outputFilename);
        
        if (!outputPath) {
          throw new Error('Save canceled by user');
        }

        // 3. Process image
        const result = await window.electronAPI.addBorder({
          inputPath: tempResult.path,
          outputPath,
          borderWidth,
          borderColor
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
          title={"Add Border"}
          description={"Apply borders with varying thickness and colors"}
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
            <h2 className="text-xl font-semibold dark:text-white mb-4 text-gray-700">Add Border</h2>
            
            <div className="space-y-6">
              <div>
                  <div className="flex justify-between mb-2">
                    <label htmlFor="brightnessRange" className="block dark:text-gray-400 text-sm font-medium text-gray-700">
                      Border Thickness
                    </label>
                    <span className="text-sm dark:text-gray-400 font-semibold text-blue-600">{borderWidth}px</span>
                  </div>
                  <input
                      id="borderWidthRange"
                      type="range"
                      min="1"
                      max="10"
                      step="1"
                      value={borderWidth}
                      onChange={(e) => setBorderWidth(parseInt(e.target.value))}
                      disabled={!imageFile}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Min</span>
                    <span>Max</span>
                  </div>
              </div>
              <div>
                  <div className="flex justify-between mb-2">
                    <label htmlFor="brightnessRange" className="block text-sm font-medium dark:text-gray-400 text-gray-700">
                      Border Color
                    </label>
                    <span className="text-sm font-semibold dark:text-gray-400 text-blue-600">{borderColor}</span>
                  </div>
                  <input
                    type="color"
                    value={borderColor}
                    className="w-full"
                    onChange={handleColorChange}
                  />
              </div>

              <ImageSubmitBtn
                  btnTitle={"Add Border & Save"}
                  handleProcessing={handleProcessing}
                  imageFile={imageFile}
                  completedMsg={completedMsg}
                  error={error}
                  isProcessing={isProcessing}
              />
            </div>
          </div>
        </div>
      </div>
    );
}