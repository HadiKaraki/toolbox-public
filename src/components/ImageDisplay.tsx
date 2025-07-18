import { useRef } from 'react';

interface ImageDisplayProps {
    handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleDrop: (e: React.DragEvent<HTMLDivElement>) => void;
    handleRemoveImage: () => void;
    setPreviewMode: (mode: boolean) => void;
    previewMode: boolean;
    isProcessing: boolean;
    imageFile: File | null;
    canvasRef: React.RefObject<HTMLCanvasElement>;
    isPreviewed: boolean;
  }

  export default function ImageDisplay({ 
    handleFileChange, 
    handleDrop,
    handleRemoveImage, 
    setPreviewMode, 
    previewMode,
    isProcessing,
    imageFile,
    canvasRef,
    isPreviewed
  }: ImageDisplayProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
    };

    const handleClick = () => {
      if (fileInputRef.current) {
        fileInputRef.current.click();
      }
    };

    return (
      <div className="bg-white rounded-lg dark:bg-gray-800 dark:border-gray-700 shadow-md p-6 border border-gray-200">
        <h2 className="text-xl font-semibold dark:text-white mb-4 text-gray-700">Image Preview</h2>
        
        <div className="flex flex-col items-center justify-center">
          {!imageFile ? (
            <div 
              className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg w-full h-64 flex flex-col items-center justify-center cursor-pointer transition-colors hover:border-blue-400"
              onClick={handleClick}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >
              <svg className="w-12 h-12 text-gray-400 dark:text-gray-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path>
              </svg>
              <p className="text-gray-500 dark:text-gray-400 mb-2">Drag & drop an image here</p>
              <p className="text-gray-500 dark:text-gray-400 mb-4">or</p>
              <button 
                className="text-white py-2 px-4 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 dark:from-gray-700 dark:to-gray-600 hover:cursor-pointer dark:hover:from-gray-700 dark:hover:to-gray-700"
              >
                Browse Files
              </button>
              <input 
                type="file" 
                ref={fileInputRef}
                className="hidden" 
                accept="image/*" 
                onChange={handleFileChange}
              />
            </div>
          ) : (
            <div className="w-full">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium dark:text-gray-300 text-gray-700">
                  {imageFile.name}
                </h3>
                <button
                    onClick={handleRemoveImage}
                    disabled={isProcessing}
                    className={`text-red-600 hover:text-red-800 ${isProcessing ? 'text-red-900 hover:text-red-900' : ''} flex items-center text-sm font-medium`}
                    >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Remove Image
                </button>
              </div>
              
              <div className="relative border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                <canvas 
                  ref={canvasRef} 
                  className="w-full h-auto max-h-[400px] object-contain bg-gray-100 dark:bg-gray-900"
                />
              </div>
              
              <div className="mt-4 flex items-center" style={{display: isPreviewed ? 'block' : 'none'}}>
                <label className="flex items-center cursor-pointer">
                  <div className="relative">
                    <input 
                      type="checkbox" 
                      className="sr-only" 
                      checked={previewMode}
                      onChange={(e) => setPreviewMode(e.target.checked)}
                    />
                    <div className={`block w-14 h-8 rounded-full ${previewMode ? 'bg-blue-600' : 'bg-gray-600'}`}></div>
                    <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition ${previewMode ? 'transform translate-x-6' : ''}`}></div>
                  </div>
                  <div className="ml-3 text-gray-700 font-medium dark:text-gray-300">
                    Preview Mode
                  </div>
                </label>
              </div>
            </div>
          )}
        </div>
      </div>
    );
}