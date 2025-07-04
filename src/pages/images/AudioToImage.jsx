import { useState, useRef, useEffect } from "react";
import { useImageContext } from '../../contexts/ImageContext';
import { handleAudioToImage } from '../../utils/images/handleAudioToImage';
import { handleCancelProcessing } from '../../utils/handleCancelProcessing';
import ImageSubmitBtn from "../../components/ImageSubmitBtn";
import BackToImageTools from "../../components/BackToImageTools";
import ImageDisplay from "../../components/ImageDisplay";

export default function AudioToImage() {
    const { imageFile, setImageFile } = useImageContext();
    const [audioFile, setAudioFile] = useState(null);
    const canvasRef = useRef(null);
    const [error, setError] = useState(null);
    const [completedMsg, setCompletedMsg] = useState(null);
    const [abortController, setAbortController] = useState(null);
    const [cancelMsg, setCancelMsg] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [taskId, setTaskId] = useState(null);

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
          const file = e.target.files[0];
          setImageFile(file);
          setImageURL(URL.createObjectURL(file));
        }
    };

    const handleAudioFileChange = (e) => {
        setError(null);
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (!file.type.startsWith('audio/') && file.type !== 'application/octet-stream') {
                setError('Please select an audio file (MP3, WAV)');
                return;
            }
            setAudioFile(file);
        }
    };

    useEffect(() => {
        if (!imageFile || !canvasRef.current) return;

        const img = new Image();
        const url = URL.createObjectURL(imageFile);
        img.src = url;

        img.onload = () => {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            
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
            URL.revokeObjectURL(url);
        };
    }, [imageFile]);

    const handleRemoveImage = () => {
        setImageFile(null);
        if (canvasRef.current) {
            const ctx = canvasRef.current.getContext('2d');
            ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        }
    };

    const handleRemoveAudio = () => {
        setAudioFile(null);
    };

    const handleProcessing = async () => {
        if (!imageFile || !audioFile) return;
        try {
            await handleAudioToImage(
                imageFile,
                audioFile,
                setUploadProgress,
                setCompletedMsg,
                setError,
                setCancelMsg,
                setAbortController,
                setTaskId
            );
        } catch (error) {
            console.error('Adding audio failed:', error);
            alert('Adding audio failed. Please try again.');
        }
    };

    const handleCancelUpload = () => {
        if (abortController) {
            abortController.abort();
            setAbortController(null); 
        }
    };

    return (
        <div className="container lg:mt-5 mx-auto px-4 py-8 max-w-5xl">
            {/* Header Section */}
            <BackToImageTools
                title={"Add Audio Image"}
                description={"Add audio to still images"}
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Image Upload Section */}
                <ImageDisplay
                    handleFileChange={handleFileChange}
                    handleRemoveImage={handleRemoveImage}
                    // setPreviewMode={setPreviewMode}
                    // previewMode={previewMode}
                    imageFile={imageFile}
                    canvasRef={canvasRef}
                    hidePreview={true}
                    uploadProgress={uploadProgress}
                />
                {/* Audio Upload Section */}
                <div className="bg-white dark:bg-gray-800 dark:border-gray-700 rounded-lg shadow-md p-6 border border-gray-200">
                    <h2 className="text-xl font-semibold mb-4 dark:text-white text-gray-700">Add Audio</h2>
                    
                    <div className="space-y-6">
                        <div>
                            {!audioFile ? (
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer">
                                    <label className="flex flex-col items-center justify-center space-y-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                                        </svg>
                                        <span className="text-gray-600 dark:text-white">Click to upload or drag and drop</span>
                                        <span className="text-sm text-gray-500 dark:text-gray-400">Max file size: 20MB. For best performance, use compressed formats like MP3, AAC, or OGG.</span>
                                        <input 
                                            type="file" 
                                            accept=".mp3,.wav,.aac,.ogg,.flac,.m4a,.opus,.alac,.aiff,.amr,.wma"
                                            onChange={handleAudioFileChange} 
                                            className="hidden" 
                                        />
                                    </label>
                                </div>
                            ) : (
                                <div className="p-4 bg-gray-100 dark:bg-black rounded-lg">
                                    <div className="flex justify-between items-center">
                                        <span className="font-medium truncate text-black dark:text-white">{audioFile.name}</span>
                                        <button 
                                            onClick={handleRemoveAudio}
                                            className="text-red-600 hover:text-red-800"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <ImageSubmitBtn
                            btnTitle={"Add Audio & Download"}
                            handleCancelProcessing={handleCancelProcessing}
                            handleProcessing={handleProcessing}
                            handleCancelUpload={handleCancelUpload}
                            imageFile={imageFile}
                            completedMsg={completedMsg}
                            error={error}
                            cancelMsg={cancelMsg}
                            uploadProgress={uploadProgress}
                            taskId={taskId}
                            setTaskId={setTaskId}
                            setCancelMsg={setCancelMsg}
                            setUploadProgress={setUploadProgress}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}