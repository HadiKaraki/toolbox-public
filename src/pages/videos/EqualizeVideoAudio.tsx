import { useEffect, useState } from "react";
import { useVideoContext } from "../../contexts/VideoContext";
import { useProgressContext } from "../../contexts/ProgressContext";
import VideoDisplay from "../../components/VideoDisplay";
import VideoSubmitBtn from "../../components/VideoSubmitBtn";
import BackToVideoTools from "../../components/BackToVideoTools";
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';

export default function EqualizeVideoAudio() {
    const { videoFile, setVideoFile, videoMetadata, setVideoMetadata } = useVideoContext();
    const [videoURL, setVideoURL] = useState(undefined);
    // const videoRef = useRef(null);
    const [equalizeMode, setEqualizeMode] = useState('');
    const [frequency, setFrequency] = useState(1000);
    const [bandwidth, setBandwidth] = useState(500);
    const [gain, setGain] = useState(0);
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

    const currentTaskId = getTaskIdByName("Equalizing Video Audio");
    const currentTask = currentTaskId ? tasks[currentTaskId] : null;
    const progress = currentTask?.progress || 0;

    const handleEqualizeMode = (value: string) => {
        switch (value) {
        case 'BassBoost':
            setFrequency(100);
            setBandwidth(200);
            setGain(8)
            break;
        case 'VocalBoost':
            setFrequency(3000);
            setBandwidth(1000);
            setGain(6)
            break;
        case 'TrebleBoost':
            setFrequency(10000);
            setBandwidth(2000);
            setGain(6)
            break;
        case 'NoiseReduction':
            setFrequency(10000);
            setBandwidth(2000);
            setGain(-6)
            break;
    
        default:
            setFrequency(100);
            setBandwidth(500);
            setGain(0)
            break;
        }
    }

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

    useEffect(() => {
        if (frequency === 100 && bandwidth === 200 && gain === 8) {
           setEqualizeMode("BassBoost");
        } else if (frequency === 3000 && bandwidth === 1000 && gain == 6) {
            setEqualizeMode("VocalBoost");
        } else if (frequency === 10000 && bandwidth === 2000 && gain === 6) {
            setEqualizeMode("TrebleBoost");
        } else if (frequency === 10000 && bandwidth === 2000 && gain === -6) {
            setEqualizeMode("NoiseReduction");
        } else {
            setEqualizeMode('');
        }
    }, [frequency, bandwidth, gain]);

   const handleProcessing = async () => {
        if (!videoFile) return;
        
        const newTaskId = Math.random().toString(36).substring(2, 15);
        addTask(newTaskId, "Equalizing Video Audio", '/video/equalizer');
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
        const outputFilename = `${originalName}_equalized.${extension}`;
        const outputPath = await window.electronAPI.showSaveDialog(outputFilename);
        
        if (!outputPath) {
            removeTask(newTaskId);
            throw new Error('Save canceled by user');
        }

        const result = await window.electronAPI.equalizeVideoAudio({
            inputPath: tempResult.path,
            outputPath,
            taskId: newTaskId,
            duration: videoMetadata.duration,
            frequency,
            bandwidth,
            gain,
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
        const taskId = getTaskIdByName("Equalizing Video Audio");
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
        <div className="container lg:mt-5 mx-auto px-4 py-8 min-w-5xl max-w-6xl">
        {/* Header Section */}
          <BackToVideoTools
              title={"Video Audio Equalizer"}
              description={"Adjust frequency bands for better sound"}
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
              <h2 className="text-xl dark:text-white font-semibold mb-4 text-gray-700">Processing Settings</h2>
              
              <div className="space-y-6">
                <div className="space-y-4">
                    <FormControl>
                        <label className="dark:text-gray-400">Equalizing Modes</label>
                        <RadioGroup
                            row
                            aria-labelledby="demo-row-radio-buttons-group-label"
                            name="row-radio-buttons-group"
                            sx={{mt: 1}}
                            className="dark:text-gray-400"
                        >
                            <FormControlLabel checked={equalizeMode === "BassBoost"} onChange={(e) => handleEqualizeMode((e.target as HTMLInputElement).value)} value="BassBoost" disabled={!videoFile} control={<Radio />} label="Bass Boost" />
                            <FormControlLabel checked={equalizeMode === "VocalBoost"} onChange={(e) => handleEqualizeMode((e.target as HTMLInputElement).value)} value="VocalBoost" disabled={!videoFile} control={<Radio />} label="Vocal Boost" />
                            <FormControlLabel checked={equalizeMode === "TrebleBoost"} onChange={(e) => handleEqualizeMode((e.target as HTMLInputElement).value)} value="TrebleBoost" disabled={!videoFile} control={<Radio />} label="Treble Boost" />
                            <FormControlLabel checked={equalizeMode === "NoiseReduction"} onChange={(e) => handleEqualizeMode((e.target as HTMLInputElement).value)} value="NoiseReduction" disabled={!videoFile} control={<Radio />} label="Noise Reduction" />
                        </RadioGroup>
                    </FormControl>
                </div>
                <div className="space-y-4">
                    <div>
                        <div className="flex justify-between">
                            <label htmlFor="brightnessRange" className="block dark:text-gray-400 text-sm font-bold text-gray-700">
                                Frequency Value
                            </label>
                            <span className="text-sm dark:text-gray-400 font-semibold text-blue-600">
                                {frequency} Hz
                            </span>
                        </div>
                        <input
                            id="borderWidthRange"
                            type="range"
                            min="20"
                            max="16000"
                            step="10"
                            value={frequency}
                            onChange={(e) => setFrequency(parseInt(e.target.value))}
                            disabled={!videoFile}
                            className="w-full h-2 dark:text-gray-400 bg-gray-200 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                            <span className="dark:text-gray-400">Min</span>
                            <span className="dark:text-gray-400">Max</span>
                        </div>
                    </div>

                    {/* GAIN */}
                    <div className="mt-5">
                        <div className="flex justify-between">
                            <label htmlFor="brightnessRange" className="block dark:text-gray-400 text-sm font-bold text-gray-700">
                                Bandwidth Value
                            </label>
                            <span className="text-sm dark:text-gray-400 font-semibold text-blue-600">
                                {(bandwidth).toFixed(0)} Hz
                            </span>
                        </div>
                        <input
                            id="borderWidthRange"
                            type="range"
                            min="100"
                            max="2000"
                            step="10"
                            value={bandwidth}
                            onChange={(e) => setBandwidth(parseInt(e.target.value))}
                            disabled={!videoFile}
                            className="w-full h-2 dark:text-gray-400 bg-gray-200 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                            <span className="dark:text-gray-400">Min</span>
                            <span className="dark:text-gray-400">Max</span>
                        </div>
                    </div>

                    {/* BANDWIDTH */}
                    <div className="mt-5">
                        <div className="flex justify-between">
                            <label htmlFor="brightnessRange" className="block dark:text-gray-400 text-sm font-bold text-gray-700">
                                Gain Value
                            </label>
                            <span className="text-sm dark:text-gray-400 font-semibold text-blue-600">
                                {gain} dB
                            </span>
                        </div>
                        <input
                            id="borderWidthRange"
                            type="range"
                            min="-12"
                            max="12"
                            step="0.1"
                            value={gain}
                            onChange={(e) => setGain(parseInt(e.target.value))}
                            disabled={!videoFile}
                            className="w-full h-2 dark:text-gray-400 bg-gray-200 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                            <span className="dark:text-gray-400">Min</span>
                            <span className="dark:text-gray-400">Max</span>
                        </div>
                    </div>
                </div>

                {/* Process Button */}
                <VideoSubmitBtn
                    progressTitle={"Equalizing audio..."}
                    btnTitle={"Equalize Audio & Save"}
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
                    <h3 className="text-sm font-medium dark:text-white text-blue-800 mb-2">Videos's audio Equalizer Tips</h3>
                    <ul className="text-xs dark:text-gray-300 text-blue-700 space-y-2">
                        <li className="flex items-start">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mt-0.5 mr-1.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span><strong>Bass Boost</strong> – Enhances low frequencies for deeper sound (e.g. <code>f=100 g=8</code>)</span>
                        </li>
                        <li className="flex items-start">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mt-0.5 mr-1.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span><strong>Vocal Boost</strong> – Accentuates voice clarity around 3kHz (e.g. <code>f=3000 g=6</code>)</span>
                        </li>
                        <li className="flex items-start">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mt-0.5 mr-1.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span><strong>Treble Boost</strong> – Adds clarity and brightness (e.g. <code>f=10000 g=6</code>)</span>
                        </li>
                        <li className="flex items-start">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mt-0.5 mr-1.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span><strong>Noise Reduction</strong> – Reduce hiss or high-frequency noise by lowering treble (e.g. <code>f=10000 g=-6</code>)</span>
                        </li>
                    </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
    );
}