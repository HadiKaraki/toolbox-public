import { useEffect, useState } from "react";
import { useVideoContext } from "../../contexts/VideoContext";
import VideoDisplay from "../../components/VideoDisplay";
import VideoSubmitBtn from "../../components/VideoSubmitBtn";
import BackToVideoTools from "../../components/BackToVideoTools";

export default function RemoveAudioVideo() {
    const { videoFile, setVideoFile } = useVideoContext();
    const [videoURL, setVideoURL] = useState(undefined);
    // const videoRef = useRef(null);
    const [videoMetadata, setVideoMetadata] = useState({duration: 0, width: 0, height: 0, format: 'mp4', size: '0'});
    const [error, setError] = useState<string | null>(null);
    const [progress, setProgress] = useState<number>(0);
    const [taskId, setTaskId] = useState<string | null>(null);
    const [completedMsg, setCompletedMsg] = useState<string | null>(null);
    const [cancelMsg, setCancelMsg] = useState<string | null>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

        const video = document.createElement('video');
        video.src = URL.createObjectURL(videoFile);
        
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
          URL.revokeObjectURL(video.src);
        };
    }, [videoFile]);

    // progress tacking
    useEffect(() => {
      const progressHandler = (id: string, progress: number) => {
        if (id === taskId) setProgress(progress);
        console.log("inside progress handler", progress)
      };
      window.electronAPI.onProgress(progressHandler);
      return () => {
        window.electronAPI.removeProgressListener();
      };
    }, [taskId]);

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

   const handleProcessing = async () => {
      if (!videoFile) return;
      
      const newTaskId = Math.random().toString(36).substring(2, 15);
      setTaskId(newTaskId);
      setProgress(0);

      try {
        const arrayBuffer = await videoFile.arrayBuffer();
        const extension = videoFile.name.split('.').pop() || '.mp4';
        const tempResult = await window.electronAPI.createTempFile(arrayBuffer, extension);
        
        if (!tempResult.success || !tempResult.path) {
          throw new Error(tempResult.message || 'Failed to create temp file');
        }

        const originalName = videoFile.name.replace(/\.[^/.]+$/, "");
        const outputFilename = `${originalName}_no_audio.${extension}`;
        const outputPath = await window.electronAPI.showSaveDialog(outputFilename);
        
        if (!outputPath) {
          throw new Error('Save canceled by user');
        }

        const result = await window.electronAPI.removeAudioVideo({
            inputPath: tempResult.path,
            outputPath,
            taskId: newTaskId,
            duration: videoMetadata.duration
        });

        if (result.success) {
            setCompletedMsg(result.message);
        } else {
            throw new Error(result.message);
        }
      } catch (err) {
          setError(err instanceof Error ? err.message : 'Processing failed');
      }
    };

    const handleCancel = async () => {
        if (!taskId) return;
        const { success } = await window.electronAPI.cancelProcessing(taskId);
        if (success) {
          setCancelMsg('Processing cancelled');
        }
        else {
          setCancelMsg('Error canceling');
        }
    };
            
    return (
        <div className="container lg:mt-5 mx-auto px-4 py-8 min-w-5xl max-w-6xl">
        {/* Header Section */}
          <BackToVideoTools
            title={"Audio Remover"}
            description={"Remove the audio from videos"}
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
              <h2 className="text-xl dark:text-white font-semibold mb-4 text-gray-700">Remove Audio</h2>

                {/* Process Button */}
                <VideoSubmitBtn
                    progressTitle="Removing..."
                    btnTitle="Remove Audio & Save"
                    completedMsg={completedMsg}
                    error={error}
                    cancelMsg={cancelMsg}
                    setCancelMsg={setCancelMsg}
                    handleCancel={handleCancel}
                    handleProcessing={handleProcessing}
                    videoFile={videoFile}
                    progress={progress}
                    taskId={taskId}
                    setTaskId={setTaskId}
                />
            </div>
          </div>
        </div>
    );
}