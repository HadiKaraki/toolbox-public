import React, { useRef } from 'react';

interface VideoMetadata {
  duration?: number;
  width: number;
  height: number;
  format: string;
  size: string;
  posterUrl?: string; // Added for potential poster image
}

interface VideoDisplayProps {
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleRemoveVideo: () => void;
  handleDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  progress: number;
  videoFile: File | null;
  videoMetadata: VideoMetadata | null;
  videoURL: string | undefined;
}

const VideoDisplay: React.FC<VideoDisplayProps> = ({
  handleFileChange,
  handleRemoveVideo,
  progress,
  handleDrop,
  videoFile,
  videoMetadata,
  videoURL,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (fileInputRef.current) {
      fileInputRef.current.value = ''; // Reset input to allow selecting same file again
      fileInputRef.current.click();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
      <h2 className="text-xl font-semibold mb-4 text-gray-700 dark:text-white">Source Video</h2>
      
      {!videoFile ? (
        <div 
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={handleClick}
        >
          <label className="flex flex-col items-center justify-center space-y-2 cursor-pointer">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-gray-600 dark:text-white">Click to upload or drag and drop</span>
            <p className="text-gray-500 dark:text-gray-400 mb-4">or</p>
            <button 
              className="text-white py-2 px-4 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 dark:from-gray-700 dark:to-gray-600 hover:cursor-pointer dark:hover:from-gray-700 dark:hover:to-gray-700"
              onClick={handleClick} // Added onClick to the button
            >
              Browse Files
            </button>
            <span className="text-sm text-gray-500 dark:text-gray-400">MP4, MOV, AVI etc.</span>
            <input 
              type="file"
              onChange={handleFileChange}
              ref={fileInputRef}
              accept="video/*"
              className="hidden"
            />
          </label>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="relative bg-gray-100 rounded-lg overflow-hidden">
            <video 
              controls
              className="w-full h-auto max-h-[500px]" // Added responsive height
              preload="metadata"
              poster={videoMetadata?.posterUrl} // Optional poster image
              src={videoURL}
            />
          </div>
          
          <div className="flex justify-between items-center">
            <button
              onClick={handleRemoveVideo}
              disabled={progress > 0}
              className={`text-red-600 hover:text-red-800 ${progress > 0 ? 'opacity-50 cursor-not-allowed' : ''} flex items-center text-sm font-medium`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Remove Video
            </button>

            {videoMetadata && (
              <div className="text-sm text-gray-600 space-x-4 flex">
                <span className="dark:text-gray-400">Size: {parseFloat(videoMetadata.size).toFixed(2)} MB</span>
                <span className="dark:text-gray-400">Resolution: {videoMetadata.width}x{videoMetadata.height}</span>
                {videoMetadata.duration && (
                  <span className="dark:text-gray-400">
                    Duration: {Math.floor(videoMetadata.duration / 60)}:
                    {(videoMetadata.duration % 60).toString().padStart(2, '0')}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoDisplay;