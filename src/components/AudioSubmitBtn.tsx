import { CircularProgress, Box } from '@mui/material';
import React from 'react';

interface AudioSubmitBtnProps {
  progressTitle: string;
  btnTitle: string;
  completedMsg: string | null;
  error: string | null;
  cancelMsg: string | null;
  setCancelMsg: (msg: string | null) => void;
  handleCancel: (taskId: string | null, setTaskId: (id: string | null) => void, setCancelMsg: (msg: string | null) => void) => void;
  handleProcessing: () => void;
  audioFile: File | null;
  progress: number;
  taskId: string | null;
  setTaskId: (id: string | null) => void;
}

const AudioSubmitBtn: React.FC<AudioSubmitBtnProps> = ({
  progressTitle,
  btnTitle,
  completedMsg,
  error,
  cancelMsg,
  setCancelMsg,
  handleCancel,
  handleProcessing,
  audioFile,
  progress,
  taskId,
  setTaskId
}) => {
  return (
    <div className="pt-4 border-t border-gray-200">
      {completedMsg && <span className="text-green-500 font-bold block">{completedMsg}</span>}
      {error && <span className="text-red-600 font-bold block">{error}</span>}
      {cancelMsg && <span className="text-orange-400 font-bold block">{cancelMsg}</span>}

      {/* CANCEL BTN */}
      {progress === 0 && (
        <button
          onClick={() => handleCancel(taskId, setTaskId, setCancelMsg)}
          className="w-full mt-3 flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-black bg-red-500 hover:bg-red-600 hover:cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
        >
          Cancel
        </button>
      )}

      {/* MAIN START BUTTON */}
      <button
          onClick={handleProcessing}
          disabled={!audioFile || progress > 0}
          className={`w-full text-white dark:bg-black dark:text-white dark:hover:bg-gray-600 flex mt-3 justify-center items-center py-3 px-4 rounded-md shadow-sm text-sm font-medium bg-blue-600 transition-colors ${
            !audioFile || progress > 0
            ? 'dark:bg-gray-700 bg-gray-300 dark:text-gray-600 cursor-not-allowed' 
            : 'bg-gradient-to-r hover:bg-blue-700 from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 dark:from-gray-700 dark:to-gray-600 hover:cursor-pointer dark:hover:from-gray-700 dark:hover:to-gray-700'}
          }`}
        >
        
        {/* START TITLE */}
        {progress === 0 && (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" className="-ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072M12 18.364a7 7 0 010-12.728M8.464 15.536a5 5 0 010-7.072" />
            </svg>
            {btnTitle}
          </>
        )}

        {/* PROGRESS INFO */}
        {progress > 0 && (
          <Box sx={{ position: 'relative', display: 'inline-flex'}}>
              <CircularProgress className="mr-4 mt-0" variant="determinate" size="2rem" sx={{ color: '#ffffff' }} value={progress} />
              <Box
                  sx={{
                  top: 0,
                  left: 0,
                  bottom: 0,
                  right: 0,
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  }}
              >
                  <span className="mr-2">{progressTitle}</span>
                  {`${Math.round(progress)}%`}
              </Box>
          </Box>
        )}
      </button>
    </div>
  );
};

export default AudioSubmitBtn;