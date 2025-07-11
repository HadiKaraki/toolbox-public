import { useState, useRef, useEffect } from "react";
import { useImageContext } from '../../contexts/ImageContext';
import ImageDisplay from '../../components/ImageDisplay';
import ImageSubmitBtn from "../../components/ImageSubmitBtn";
import BackToImageTools from "../../components/BackToImageTools";
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';

export default function ResizeImage() {
    const { imageFile, setImageFile } = useImageContext();
    const [height, setHeight] = useState(0);
    const [width, setWidth] = useState(0);
    const [fit, setFit] = useState('cover');
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
        setHeight(height);
        setWidth(width);

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
    }, [imageFile, previewMode]);

    const handleRemoveImage = () => {
      setImageFile(null);
      setWidth(0);
      setHeight(0);
      setFit("cover");
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        ctx?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
    };

    const handleProcessing = async () => {
      if (!imageFile) return;
      if (height < 24 && width < 24) {
        setError("Min width & height is 24px");
        return;
      } else if (height < 24 && width > 24) {
        setError("Min height is 24px");
        return;
      } 
      else if (height > 24 && width < 24) {
        setError("Min wdith is 24px");
        return;
      }
      
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
        const outputFilename = `${originalName}_resized.${extension}`;
        const outputPath = await window.electronAPI.showSaveDialog(outputFilename);
        
        if (!outputPath) {
          throw new Error('Save canceled by user');
        }

        const result = await window.electronAPI.resizeImage({
          inputPath: tempResult.path,
          outputPath,
          height,
          width,
          fit
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

    const handleHeightChange = (value: number) => {
        if (!value) value = 24;
        if (value > 4000) {
            setHeight(4000);
        } else {
            setHeight(value);
        }
    };

    const handleWidthChange = (value: number) => {
        if (!value) value = 24;
        if (value > 6000) {
            setWidth(6000);
        } else {
            setWidth(value);
        }
    }

    return (
      <div className="container lg:mt-5 mx-auto px-4 py-8 min-w-5xl max-w-6xl max-w-6xl">
        {/* Header Section */}
        <BackToImageTools
          title={"Resize Image"}
          description={"Resize images in pixels with fitting options"}
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
            <h2 className="text-xl font-semibold dark:text-white mb-4 text-gray-700">Resizing Settings</h2>
            
            <div className="space-y-6">
              <div>
                <div className="flex justify-between mb-2">
                  <label htmlFor="blurRange" className="block text-sm font-medium dark:text-gray-400 text-gray-700">
                    Height in pixels
                  </label>
                </div>
                <input
                    id="imgHeight"
                    min={24}
                    max={4000}
                    step={1}
                    type="number"
                    value={height}
                    onChange={(e) => handleHeightChange(parseInt(e.target.value))}
                    disabled={!imageFile}
                    className={`border px-1 py-1 rounded w-full ${!imageFile ? 'border-gray-300 text-gray-300 dark:text-gray-400 dark:border-gray-600' : 'border-gray-400 dark:text-gray-200'}`}
                />
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
                  <span>Max: 4000px</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <label htmlFor="blurRange" className="block text-sm font-medium dark:text-gray-400 text-gray-700">
                    Width in pixels
                  </label>
                </div>
                <input
                    id="imgWidth"
                    type="number"
                    min={24}
                    max={6000}
                    step={1}
                    value={width}
                    onChange={(e) => handleWidthChange(parseInt(e.target.value))}
                    disabled={!imageFile}
                    className={`border px-1 py-1 rounded w-full ${!imageFile ? 'border-gray-300 text-gray-300 dark:text-gray-400 dark:border-gray-600' : 'border-gray-400 dark:text-gray-200'}`}
                />
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
                  <span>Max: 6000px</span>
                </div>
              </div>

              <FormControl>
                <label className="dark:text-white text-black">Pre-made modes</label>
                <RadioGroup
                    row
                    aria-labelledby="demo-row-radio-buttons-group-label"
                    name="row-radio-buttons-group"
                    className="text-black dark:text-white"
                    sx={{mt: 1}}
                >
                    {["cover", "contain", "fill", "inside", "outside"].map((val) => (
                        <FormControlLabel
                            key={val}
                            checked={fit === val}
                            onChange={(e) => setFit((e.target as HTMLInputElement).value)}
                            value={val}
                            disabled={!imageFile}
                            control={<Radio />}
                            label={val.charAt(0).toUpperCase() + val.slice(1)}
                            className="mr-4"
                        />
                    ))}
                </RadioGroup>
              </FormControl>

              <ImageSubmitBtn
                  btnTitle={"Resize Image & Save"}
                  handleProcessing={handleProcessing}
                  imageFile={imageFile}
                  completedMsg={completedMsg}
                  error={error}
                  isProcessing={isProcessing}
              />

              {/* Tips Section */}
              <div className="bg-blue-50 p-4 dark:bg-gray-900/60 rounded-lg">
                <h3 className="text-sm font-medium text-blue-800 mb-2 dark:text-white">Fit Types</h3>
                <ul className="text-xs text-blue-700 space-y-1 dark:text-gray-300">
                    <li className="flex items-start">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mt-0.5 mr-1.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span><strong>Cover</strong> – Fill the box and crop excess (default)</span>
                    </li>
                    <li className="flex items-start">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mt-0.5 mr-1.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span><strong>Contain</strong> – Fit inside box with padding if needed</span>
                    </li>
                    <li className="flex items-start">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mt-0.5 mr-1.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span><strong>Fill</strong> – Stretch to fill box exactly (no aspect ratio)</span>
                    </li>
                    <li className="flex items-start">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mt-0.5 mr-1.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span><strong>Inside</strong> – Scale down to fit inside box, no upscaling</span>
                    </li>
                    <li className="flex items-start">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mt-0.5 mr-1.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span><strong>Outside</strong> – Scale up/down to cover box, no cropping</span>
                    </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
}