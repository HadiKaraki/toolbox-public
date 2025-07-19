import { useEffect, useState } from "react";
import { useVideoContext } from "../../contexts/VideoContext";
import { useProgressContext } from "../../contexts/ProgressContext";
import VideoDisplay from "../../components/VideoDisplay";
import VideoSubmitBtn from "../../components/VideoSubmitBtn";
import BackToVideoTools from "../../components/BackToVideoTools";

export default function ChangeFps() {
    const { videoFile, setVideoFile, videoMetadata, setVideoMetadata } = useVideoContext();
    const [videoURL, setVideoURL] = useState<string | undefined>(undefined);
    const [fps, setFps] = useState(30);
    const [error, setError] = useState<string | null>(null);
    const [completedMsg, setCompletedMsg] = useState<string | null>(null);
    const [cancelMsg, setCancelMsg] = useState<string | null>(null);
    const { 
        tasks, 
        addTask, 
        removeTask, 
        getTaskIdByName,
        updateProgress
    } = useProgressContext();

    // Get the current task ID and progress
    const currentTaskId = getTaskIdByName("Changing FPS");
    const currentTask = currentTaskId ? tasks[currentTaskId] : null;
    const progress = currentTask?.progress || 0;

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      e.stopPropagation();
      if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        setVideoFile(file);
      }
    };

    const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        const file = e.dataTransfer.files[0];
        if (!file.type.startsWith('video/')) {
          setError('Please drop a video file');
          return;
        }
        
        setVideoFile(file);
      }
    };

    // Load video metadata when file changes
    useEffect(() => {
        if (!videoFile) return;

        const url = URL.createObjectURL(videoFile);
        setVideoURL(url);

        const video = document.createElement('video');
        video.src = url;
        
        video.onloadedmetadata = () => {
          setVideoMetadata({
              duration: Math.round(video.duration),
              width: video.videoWidth,
              height: video.videoHeight,
              format: videoFile.type.split('/')[1].toUpperCase(),
              size: (videoFile.size / (1024 * 1024)).toFixed(1)
          });
        };

        return () => {
          URL.revokeObjectURL(url);
        };
    }, [videoFile]);

    const handleRemoveVideo = () => {
        setVideoFile(null);
        setVideoURL(undefined);
        setVideoMetadata({duration: 0, width: 0, height: 0, format: 'mp4', size: '0'});
    };

    const handleProcessing = async () => {
        if (!videoFile) return;
        
        const newTaskId = Math.random().toString(36).substring(2, 15);
        addTask(newTaskId, "Changing FPS", '/video/frame-rate');
        setCompletedMsg(null);
        setCancelMsg(null);
        setError(null);

        try {
            const arrayBuffer = await videoFile.arrayBuffer();
            const extension = videoFile.name.split('.').pop() || '.mp4';
            const tempResult = await window.electronAPI.createTempFile(arrayBuffer, extension);
            
            if (!tempResult.success || !tempResult.path) {
                throw new Error(tempResult.message || 'Failed to create temp file');
            }

            const originalName = videoFile.name.replace(/\.[^/.]+$/, "");
            const outputFilename = `${originalName}_fps.${extension}`;
            const outputPath = await window.electronAPI.showSaveDialog(outputFilename);
            
            if (!outputPath) {
                removeTask(newTaskId);
                throw new Error('Save canceled by user');
            }

            const result = await window.electronAPI.adjustFps({
                inputPath: tempResult.path,
                outputPath,
                taskId: newTaskId,
                duration: videoMetadata.duration,
                fps
            });

            if (result.success) {
                setCompletedMsg(result.message);
                // Only remove task if you won't need to display completion status
                removeTask(newTaskId);
            } else {
                if (result.message === "Processing failed: ffmpeg was killed with signal SIGTERM") {
                    setCancelMsg("Processing cancelled");
                } else {
                    setError(result.message);
                    throw new Error(result.message);
                }
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Processing failed');
            if (newTaskId) removeTask(newTaskId);
        }
    };

    const handleCancel = async () => {
        const taskId = getTaskIdByName("Changing FPS");
        if (!taskId) return;
        
        const { success } = await window.electronAPI.cancelProcessing(taskId);
        if (success) {
            setCancelMsg('Processing cancelled');
            removeTask(taskId);
            updateProgress(taskId, 0); // Reset progress on cancel
        } else {
            setCancelMsg('Error canceling');
        }
    };
            
    return (
        <div className="container lg:mt-5 mx-auto px-4 py-8 xl:min-w-5xl max-w-6xl">
        {/* Header Section */}
          <BackToVideoTools
              title={"Frame Rate Modifier"}
              description={"Modify the frame rate of a video"}
          />
      
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Upload & Preview Section */}
            <VideoDisplay
                handleFileChange={handleFileChange}
                handleRemoveVideo={handleRemoveVideo}
                progress={progress}
                handleDrop={handleDrop}
                videoFile={videoFile}
                videoMetadata={videoMetadata}
                videoURL={videoURL}
            />
            {/* Controls Section */}
            <div className="bg-white dark:bg-gray-800 dark:border-gray-700 rounded-lg shadow-md p-6 border border-gray-200">
              <h2 className="text-xl dark:text-white font-semibold mb-4 text-gray-700">Frame Rates</h2>
              
              <div className="space-y-6">
                <div className="space-y-4">
                    <div className="space-y-4">
                        <div>
                            <label className="block dark:text-gray-400 text-sm font-medium text-gray-700 mb-2">
                                Frame ranges
                            </label>
                            <span className="text-sm dark:text-gray-400 font-semibold text-blue-600">{fps} /sec</span>
                            <input
                                id="fpsRange"
                                type="range"
                                min="1"
                                max="60"
                                step="1"
                                value={fps}
                                onChange={(e) => setFps(parseInt(e.target.value))}
                                disabled={!videoFile}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
                            />
                            <div className="flex justify-between text-xs text-gray-500 mt-1">
                                <span className="dark:text-gray-400">Min</span>
                                <span className="dark:text-gray-400">Max</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Process Button */}
                <VideoSubmitBtn
                    progressTitle="Changing fps..."
                    btnTitle="Change FPS & Save"
                    completedMsg={completedMsg}
                    error={error}
                    cancelMsg={cancelMsg}
                    setCancelMsg={setCancelMsg}
                    handleCancel={handleCancel}
                    handleProcessing={handleProcessing}
                    videoFile={videoFile}
                    progress={progress}
                    taskId={currentTaskId}
                />
      
                {/* Tips Section */}
                <div className="bg-blue-50 dark:bg-gray-900/60 p-4 rounded-lg">
                    <h3 className="text-sm dark:text-white font-medium text-blue-800 mb-2">Frame Rates Tips</h3>
                    <ul className="text-xs dark:text-gray-300 text-blue-700 space-y-2">
                        <li className="flex items-start">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mt-0.5 mr-1.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span><strong>1–10 FPS</strong> – Useful for time-lapses, surveillance, or stylized choppy effects</span>
                        </li>
                        <li className="flex items-start">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mt-0.5 mr-1.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span><strong>15–30 FPS</strong> – Common for standard video playback and web videos</span>
                        </li>
                        <li className="flex items-start">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mt-0.5 mr-1.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span><strong>60 FPS</strong> – Smooth motion great for gaming, action scenes, or slow motion playback</span>
                        </li>
                        <li className="flex items-start">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mt-0.5 mr-1.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span>Higher FPS values can increase video file size and processing time</span>
                        </li>
                    </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
    );
}