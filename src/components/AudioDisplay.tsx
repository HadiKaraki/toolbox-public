import React from 'react';

interface AudioMetadata {
  name: string;
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

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-gray-600 dark:text-white">Click to upload or drag and drop</span>
            <span className="text-sm text-gray-500 dark:text-gray-400">For best performance, use compressed formats like MP3, AAC, or OGG.</span>
            <input
                type="file" 
                // dont allow mp4; those formats are supported by ffmpeg
                accept=".mp3,.wav,.aac,.ogg,.flac,.m4a,.opus,.alac,.aiff,.amr,.wma"
                onChange={handleFileChange} 
                className="hidden"
            />
          </label>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="relative bg-gray-100 rounded-lg overflow-hidden">
            <audio controls className="w-48">
                <source src={audioURL} type={audioFile.type} />
                Your browser does not support the audio element.
            </audio>
          </div>
          
          <div className="flex justify-between items-center">
            <button
              onClick={handleRemoveAudio}
              disabled={progress > 0}
              className='text-red-600 hover:text-red-800 flex items-center text-sm font-medium'
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Remove Audio
            </button>

            {audioMetadata && (
              <div className="text-sm text-gray-600 space-x-4 flex">
                <span className="dark:text-gray-400">Size: {(parseFloat(audioMetadata.size)).toFixed(3)} MB</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AudioDisplay;