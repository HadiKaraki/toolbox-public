import { useState, useRef, useEffect } from "react";
import { useImageContext } from '../../contexts/ImageContext';
import ImageDisplay from '../../components/ImageDisplay';
import ImageSubmitBtn from "../../components/ImageSubmitBtn";
import BackToImageTools from "../../components/BackToImageTools";
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';

export default function SharpenImage() {
    const { imageFile, setImageFile } = useImageContext();
    const [mode, setMode] = useState('balanced');
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
    }, [imageFile, mode, previewMode]);

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
        const outputFilename = `${originalName}_sharpened.${extension}`;
        const outputPath = await window.electronAPI.showSaveDialog(outputFilename);
        
        if (!outputPath) {
          throw new Error('Save canceled by user');
        }

        // 3. Process image
        const result = await window.electronAPI.sharpenImage({
          inputPath: tempResult.path,
          outputPath,
          mode
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
            title={"Sharpen Image"}
            description={"Enhance image details by increasing sharpness"}
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
              <h2 className="text-xl font-semibold mb-4 text-gray-700 dark:text-white">Sharpen Settings</h2>
              
              <div className="space-y-6">
                <FormControl>
                    <label className="dark:text-white text-black">Pre-made modes</label>
                    <RadioGroup
                        row
                        aria-labelledby="demo-row-radio-buttons-group-label"
                        name="row-radio-buttons-group"
                        className="text-black dark:text-white"
                        sx={{mt: 1}}
                    >
                        {["soft", "balanced", "strong"].map((val) => (
                          <FormControlLabel
                            key={val}
                            checked={mode === val}
                            onChange={(e) => setMode((e.target as HTMLInputElement).value)}
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
                    btnTitle={"Sharpen Image & Save"}
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
                        <span><strong>Soft</strong> - Slight detail enhancement</span>
                      </li>
                      <li className="flex items-start">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mt-0.5 mr-1.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span><strong>Balanced</strong> - Clear and crisp without overprocessing</span>
                      </li>
                      <li className="flex items-start">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mt-0.5 mr-1.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span><strong>Strong</strong> - High sharpness, may reveal noise or artifacts</span>
                      </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
    );
}