// src/components/ImageSubmitBtn.tsx
interface ImageSubmitBtnProps {
  btnTitle: string;
  handleProcessing: () => void;
  imageFile: File | null;
  completedMsg: string | null;
  error: string | null;
  isProcessing: boolean;
}

export default function ImageSubmitBtn({
  btnTitle,
  handleProcessing,
  imageFile,
  completedMsg,
  error,
  isProcessing
}: ImageSubmitBtnProps) {
  return (
    <div className="pt-4">
      <button
        onClick={handleProcessing}
        disabled={!imageFile || isProcessing}
        className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-all duration-200 shadow-md
          ${!imageFile || isProcessing 
            ? 'bg-gray-400 cursor-not-allowed' 
            : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'}
        `}
      >
        {isProcessing ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processing...
          </span>
        ) : (
          btnTitle
        )}
      </button>
      
      {completedMsg && (
        <div className="mt-4 p-3 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg">
          {completedMsg}
        </div>
      )}
      
      {error && (
        <div className="mt-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg">
          {error}
        </div>
      )}
    </div>
  );
}