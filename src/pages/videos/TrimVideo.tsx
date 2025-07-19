import { ChangeEvent, useEffect, useState } from "react";
import { useVideoContext } from "../../contexts/VideoContext";
import { useProgressContext } from "../../contexts/ProgressContext";
import VideoDisplay from "../../components/VideoDisplay";
import VideoSubmitBtn from "../../components/VideoSubmitBtn";
import BackToVideoTools from "../../components/BackToVideoTools";

export default function TrimVideo() {
    const { videoFile, setVideoFile, videoMetadata, setVideoMetadata } = useVideoContext();
    const [videoURL, setVideoURL] = useState<string | undefined>(undefined);
    // const videoRef = useRef(null);
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [startGreaterThanEnd, setStartGreaterThanEnd] = useState(false);
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

    const currentTaskId = getTaskIdByName("Trimming Video");
    const currentTask = currentTaskId ? tasks[currentTaskId] : null;
    const progress = currentTask?.progress || 0;

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        setVideoFile(file);
      }
    };

    function hhmmssToSeconds(hhmmss: string) {
        const parts = hhmmss.split(':').map(Number).reverse();
        const [s = 0, m = 0, h = 0] = parts;
        return h * 3600 + m * 60 + s;
    }
    
    function secondsToHHMMSS(seconds: number) {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = Math.floor(seconds % 60);
        return [h, m, s].map(unit => String(unit).padStart(2, '0')).join(':');
    }

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

    useEffect(() => {
        const start = hhmmssToSeconds(startTime);
        const end = hhmmssToSeconds(endTime);
      
        if (startTime === '' && endTime === '') {
            setError('');
        } else if(start >= end) {
            setError('Start time must be less than end time.');
            setStartGreaterThanEnd(true);
        } else if (end > videoMetadata.duration) {
            setError(`End time exceeds video duration (${secondsToHHMMSS(videoMetadata.duration)}).`);
            setStartGreaterThanEnd(true);
        } else {
            setError('');
            setStartGreaterThanEnd(false);
        }
    }, [startTime, endTime, videoMetadata.duration]);

    const handleRemoveVideo = () => {
        setVideoFile(null);
        setVideoURL(undefined);
        setVideoMetadata({duration: 0, width: 0, height: 0, format: 'mp4', size: '0'});
        // if (videoRef.current) {
        //   videoRef.current.pause();
        //   videoRef.current.removeAttribute('src');
        //   videoRef.current.load();
        // }
    };

    const handleGetDifferenceSeconds = () => {
        const startInSeconds = hhmmssToSeconds(startTime)
        const endInSeconds = hhmmssToSeconds(endTime);
        return endInSeconds - startInSeconds;
    }

    const formatTime = (value: string) => {
        // Remove all non-digit characters
        const cleaned = value.replace(/\D/g, '').slice(0, 6); // max 6 digits (hhmmss)
      
        let formatted = '';
        if (cleaned.length <= 2) {
          formatted = cleaned;
        } else if (cleaned.length <= 4) {
          formatted = `${cleaned.slice(0, 2)}:${cleaned.slice(2)}`;
        } else {
          formatted = `${cleaned.slice(0, 2)}:${cleaned.slice(2, 4)}:${cleaned.slice(4)}`;
        }
        return formatted;
    };
      
    const handleTimeInput = (e: ChangeEvent<HTMLInputElement>, setter: any) => {
        const value = e.target.value;
        const formatted = formatTime(value);
        setter(formatted);
    };

   const handleProcessing = async () => {
      if (!videoFile) return;
      if (startGreaterThanEnd) return;

      const newTaskId = Math.random().toString(36).substring(2, 15);
      addTask(newTaskId, "Trimming Video", '/video/trim');
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
        const outputFilename = `${originalName}_trimmed.${extension}`;
        const outputPath = await window.electronAPI.showSaveDialog(outputFilename);
        
        if (!outputPath) {
          removeTask(newTaskId);
          throw new Error('Save canceled by user');
        }

        const result = await window.electronAPI.trimVideo({
            inputPath: tempResult.path,
            outputPath,
            taskId: newTaskId,
            duration: videoMetadata.duration,
            startTime,
            endTime: handleGetDifferenceSeconds()
        });

        if (result.success) {
            removeTask(newTaskId);
            setCompletedMsg(result.message);
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
        const taskId = getTaskIdByName("Trimming Video");
        if (!taskId) return;
        
        const { success } = await window.electronAPI.cancelProcessing(taskId);
        if (success) {
            setCancelMsg('Processing cancelled');
            removeTask(taskId);
            updateProgress(taskId, 0);
        } else {
            setCancelMsg('Error canceling');
        }
    };
            
    return (
        <div className="container lg:mt-5 mx-auto px-4 py-8 xl:min-w-5xl max-w-6xl">
        {/* Header Section */}
          <BackToVideoTools
            title={"Video Trimmer"}
            description={"Cut videos to specific durations"}
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
              <h2 className="text-xl dark:text-white font-semibold mb-4 text-gray-700">Start and end times</h2>
              
              <div className="space-y-6">
                <div className="space-y-4">
                    <div className="space-y-4">
                        <div>
                            <label className="block dark:text-gray-400 text-sm font-medium mb-2">Start Time (hh:mm:ss)</label>
                            <input
                                type="text"
                                value={startTime}
                                disabled={!videoFile}
                                onChange={(e) => handleTimeInput(e, setStartTime)}
                                placeholder="HH:MM:SS"
                                className={`border px-1 py-1 rounded w-full ${!videoFile ? 'border-gray-300 text-gray-300 dark:text-gray-400 dark:border-gray-600' : 'border-gray-400 dark:text-gray-200'}`}
                            />
                        </div>
                        <div>
                            <label className="block dark:text-gray-400 text-sm font-medium mb-2">End Time (hh:mm:ss)</label>
                            <label className={`block text-sm dark:text-gray-400 font-light mb-2 ${!videoFile ? 'hidden' : ''}`}>Video Duration: {secondsToHHMMSS(videoMetadata.duration)}</label>
                            <input
                                type="text"
                                value={endTime}
                                disabled={!videoFile}
                                onChange={(e) => handleTimeInput(e, setEndTime)}
                                placeholder="HH:MM:SS"
                                className={`border px-1 py-1 rounded w-full ${!videoFile ? 'border-gray-300 text-gray-300 dark:text-gray-400 dark:border-gray-600' : 'border-gray-400 dark:text-gray-200'}`}
                            />
                        </div>
                    </div>
                </div>

                {/* Process Button */}
                <VideoSubmitBtn
                    progressTitle={"Trimming video ..."}
                    btnTitle={"Trim Video & Download"}
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
              </div>
            </div>
          </div>
        </div>
    );
}