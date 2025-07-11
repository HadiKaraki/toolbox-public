import { useEffect, useState } from "react";
import { useVideoContext } from "../../contexts/VideoContext";
import VideoDisplay from "../../components/VideoDisplay";
import VideoSubmitBtn from "../../components/VideoSubmitBtn";
import BackToVideoTools from "../../components/BackToVideoTools";

export default function CompressVideo() {
    const { videoFile, setVideoFile } = useVideoContext();
    const [videoURL, setVideoURL] = useState(undefined);
    // const videoRef = useRef(null);
    const [crf, setCrf] = useState(30);
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
        const outputFilename = `${originalName}_compressed.${extension}`;
        const outputPath = await window.electronAPI.showSaveDialog(outputFilename);
        
        if (!outputPath) {
          throw new Error('Save canceled by user');
        }

        const result = await window.electronAPI.compressVideo({
            inputPath: tempResult.path,
            outputPath,
            taskId: newTaskId,
            duration: videoMetadata.duration,
            crf
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
        <div className="container lg:mt-5 mx-auto px-4 py-8 max-w-5xl max-w-6xl">
        {/* Header Section */}
          <BackToVideoTools
            title={"Video Compressor"}
            description={"Compress videos to different formats"}
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
              <h2 className="text-xl font-semibold dark:text-white mb-4 text-gray-700">Video Quality Modes</h2>
              
              <div className="space-y-6">
                <div className="space-y-4">
                    <div className="space-y-4">
                        <div>
                            <label className="block dark:text-gray-400 text-sm font-medium text-gray-700 mb-2">
                                Video Quality
                            </label>
                            <select
                                value={crf}
                                onChange={(e) => setCrf(parseInt(e.target.value))}
                                className="w-full dark:text-white dark:bg-black border border-gray-300 rounded-md p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value={30}>Lightly Compressed (High Quality)</option>
                                <option value={31}>Medium Compression (Balanced)</option>
                                <option value={40}>Heavily Compressed (Smaller Size)</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Process Button */}
                <VideoSubmitBtn
                    progressTitle={"Compressing Video..."}
                    btnTitle={"Compress Video & Save"}
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
      
                {/* Tips Section */}
                <div className="bg-blue-50 dark:bg-gray-900/60 p-4 rounded-lg">
                    <h3 className="text-sm dark:text-white font-medium text-blue-800 mb-2">Video Compressing Tips</h3>
                    <ul className="text-xs dark:text-gray-300 text-blue-700 space-y-2">
                        <li className="flex items-start">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mt-0.5 mr-1.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span><strong>Light Compression</strong> – Slight reduction in size with minimal loss in visual quality</span>
                        </li>
                        <li className="flex items-start">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mt-0.5 mr-1.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span><strong>Medium Compression</strong> – Balanced quality and size; great for online uploads</span>
                        </li>
                        <li className="flex items-start">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mt-0.5 mr-1.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span><strong>Heavy Compression</strong> – Maximum size reduction, but may cause visible quality loss or blockiness</span>
                        </li>
                        {/* <li className="flex items-start">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mt-0.5 mr-1.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span>Best compression results are achieved using modern codecs like <strong>H.264</strong> or <strong>H.265</strong></span>
                        </li> */}
                    </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
    );
}