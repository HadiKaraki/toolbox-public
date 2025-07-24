import React, { useRef } from 'react';

interface AudioMetadata {
  duration?: number;
  format: string;
  size: string;
}

interface AudioDisplayProps {
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleRemoveAudio: () => void;
  handleDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  progress: number;
  audioFile: File | null;
  audioMetadata: AudioMetadata | null;
  audioURL: string | undefined;
}

const AudioDisplay: React.FC<AudioDisplayProps> = ({
  handleFileChange,
  handleRemoveAudio,
  progress,
  handleDrop,
  audioFile,
  audioMetadata,
  audioURL,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (fileInputRef.current) {
      fileInputRef.current.value = ''; // Reset input
      fileInputRef.current.click();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
      <h2 className="text-xl font-semibold mb-4 text-gray-700 dark:text-white">Source Audio</h2>
      
      {!audioFile ? (
        <div 
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          <label className="flex flex-col items-center justify-center space-y-2 cursor-pointer">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
            </svg>
            <span className="text-gray-600 dark:text-white">Click to upload or drag and drop</span>
            <p className="text-gray-500 dark:text-gray-400 mb-4">or</p>
            <button
              type='button'
              onClick={handleClick}
              className="text-white py-2 px-4 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 dark:from-gray-700 dark:to-gray-600 hover:cursor-pointer dark:hover:from-gray-700 dark:hover:to-gray-700"
            >
              Browse Files
            </button>
            <span className="text-sm text-gray-500 dark:text-gray-400">MP3, WAV, AAC, OGG, FLAC, etc.</span>
            <input 
              type="file"
              onChange={handleFileChange}
              ref={fileInputRef}
              accept=".mp3,.wav,.aac,.ogg,.flac,.m4a,.opus,.alac,.aiff,.amr,.wma"
              className="hidden"
            />
          </label>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="relative bg-gray-100 rounded-lg overflow-hidden p-4">
            <audio 
              controls
              className="w-full"
              src={audioURL}
              onError={(e) => console.error('Audio playback error:', e)}
            />
          </div>
          
          <div className="flex justify-between items-center">
            <button
              onClick={handleRemoveAudio}
              disabled={progress > 0}
              className={`text-red-600 hover:text-red-800 ${progress > 0 ? 'opacity-50 cursor-not-allowed' : ''} flex items-center text-sm font-medium`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Remove Audio
            </button>

            {audioMetadata && (
              <div className="text-sm text-gray-600 space-x-4 flex">
                <span className="dark:text-gray-400">Size: {(parseFloat(audioMetadata.size)).toFixed(3)} MB</span>
                <span className="dark:text-gray-400">Format: {audioMetadata.format}</span>
                {audioMetadata.duration && (
                  <span className="dark:text-gray-400">
                    Duration: {Math.floor(audioMetadata.duration / 60)}:{Math.floor(audioMetadata.duration % 60).toString().padStart(2, '0')}
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

export default React.memo(AudioDisplay);