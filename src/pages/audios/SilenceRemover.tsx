import { useEffect, useState } from "react";
import AudioDisplay from "../../components/AudioDisplay";
import { useProgressContext } from "../../contexts/ProgressContext";
import AudioSubmitBtn from "../../components/AudioSubmitBtn";
import BackToAudioTools from "../../components/BackToAudioTools";
import { useAudioContext } from "../../contexts/AudioContext";

export default function SilenceRemover() {
    const { audioFile, setAudioFile, audioMetadata, setAudioMetadata } = useAudioContext();
    const [audioURL, setAudioURL] = useState(undefined);
    const [period, setPeriod] = useState(1);
    const [silenceDuration, setSilenceDuration] = useState(0.5);
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

    const currentTaskId = getTaskIdByName("Removing Audio Silence");
    const currentTask = currentTaskId ? tasks[currentTaskId] : null;
    const progress = currentTask?.progress || 0;

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        setAudioFile(file);
      }
    };

    const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        const file = e.dataTransfer.files[0];
        if (!file.type.startsWith('audio/')) {
          setError('Please drop a audio file');
          return;
        }
        
        setAudioFile(file);
      }
    };

    function getBaseFileName(filename: string) {
        return filename.replace(/\.[^/.]+$/, '');
    }

    useEffect(() => {
        if (!audioFile) return;

        const audio = document.createElement('audio');
        audio.src = URL.createObjectURL(audioFile);
        
        audio.onloadedmetadata = () => {
            setAudioMetadata({
                name: getBaseFileName(audioFile.name),
                duration: Math.round(audio.duration),
                format: audioFile.type.split('/')[1]?.toUpperCase() || 'UNKNOWN',
                size: (audioFile.size / (1024 * 1024)).toFixed(1) + 'MB'
            });
        };

        return () => {
          URL.revokeObjectURL(audio.src);
        };
    }, [audioFile]);

    const handleRemoveAudio = () => {
        setAudioFile(null);
        setAudioURL(undefined);
        setAudioMetadata({name: '', duration: 0, format: 'mp4', size: '0'});
        // if (audioRef.current) {
        //   audioRef.current.pause();
        //   audioRef.current.removeAttribute('src');
        //   audioRef.current.load();
        // }
    };

   const handleProcessing = async () => {
      if (!audioFile) return;
      
      const newTaskId = Math.random().toString(36).substring(2, 15);
      addTask(newTaskId, "Removing Audio Silence", '/audio/silence-remover');
      setCompletedMsg(null);
      setCancelMsg(null);
      setError(null);

      try {
        const arrayBuffer = await audioFile.arrayBuffer();
        const extension = audioFile.name.split('.').pop() || '.mp4';
        const tempResult = await window.electronAPI.createTempFile(arrayBuffer, extension);
        
        if (!tempResult.success || !tempResult.path) {
          throw new Error(tempResult.message || 'Failed to create temp file');
        }

        const originalName = audioFile.name.replace(/\.[^/.]+$/, "");
        const outputFilename = `${originalName}_silence_removed.${extension}`;
        const outputPath = await window.electronAPI.showSaveDialog(outputFilename);
        
        if (!outputPath) {
          removeTask(newTaskId);
          throw new Error('Save canceled by user');
        }

        const result = await window.electronAPI.silenceRemover({
            inputPath: tempResult.path,
            outputPath,
            taskId: newTaskId,
            duration: audioMetadata.duration,
            period,
            silenceDuration
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
        const taskId = getTaskIdByName("Removing Audio Silence");
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
        <div className="container lg:mt-5 mx-auto px-4 py-8 min-w-5xl max-w-6xl">
        {/* Header Section */}
          <BackToAudioTools
            title={"Silence Remover"}
            description={"Automatically detect and remove silent parts"}
          />
      
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Upload & Preview Section */}
            <AudioDisplay
                handleFileChange={handleFileChange}
                handleRemoveAudio={handleRemoveAudio}
                progress={progress}
                handleDrop={handleDrop}
                audioFile={audioFile}
                audioMetadata={audioMetadata}
                audioURL={audioURL}
            />
            {/* Controls Section */}
            <div className="bg-white dark:bg-gray-800 dark:border-gray-700 rounded-lg shadow-md p-6 border border-gray-200">
                <h2 className="text-xl dark:text-white font-semibold mb-4 text-gray-700">Silence detecting settings</h2>
                <div className="space-y-4">
                    <div>
                        <div className="flex justify-between mb-2">
                            <label htmlFor="brightnessRange" className="block dark:text-gray-400 text-sm font-medium text-gray-700">
                                Period
                            </label>
                            <span className="text-sm dark:text-gray-400 font-semibold text-blue-600">
                                {period}
                            </span>
                        </div>
                        <input
                            id="periodRange"
                            type="range"
                            min="1"
                            max="5"
                            step="1"
                            value={period}
                            onChange={(e) => setPeriod(parseFloat(e.target.value))}
                            disabled={!audioFile}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                            <span>Min</span>
                            <span>Max</span>
                        </div>
                    </div>
                    <div>
                        <div className="flex justify-between mb-2">
                            <label htmlFor="brightnessRange" className="block dark:text-gray-400 text-sm font-medium text-gray-700">
                                Silence Duration
                            </label>
                            <span className="text-sm dark:text-gray-400 font-semibold text-blue-600">
                                {silenceDuration.toFixed(1)}s
                            </span>
                        </div>
                        <input
                            id="periodRange"
                            type="range"
                            min="0.1"
                            max="2"
                            step="0.1"
                            value={silenceDuration}
                            onChange={(e) => setSilenceDuration(parseFloat(e.target.value))}
                            disabled={!audioFile}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                            <span>Min</span>
                            <span>Max</span>
                        </div>
                    </div>
                </div>
                {/* Process Button */}
                <AudioSubmitBtn
                    btnTitle={"Remove Silence & Download"}
                    progressTitle={"Removing silence..."}
                    completedMsg={completedMsg}
                    error={error}
                    cancelMsg={cancelMsg}
                    setCancelMsg={setCancelMsg}
                    handleCancel={handleCancel}
                    handleProcessing={handleProcessing}
                    audioFile={audioFile}
                    progress={progress}
                    taskId={currentTaskId}
                />

                <div className="bg-blue-50 dark:bg-gray-900/60 p-4 rounded-lg">
                    <h3 className="text-sm dark:text-white font-medium text-blue-800 mb-2">Audio Conversion Tips</h3>
                    <ul className="text-xs dark:text-gray-300 text-blue-700 space-y-2">
                        <li className="flex items-start">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mt-0.5 mr-1.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span>
                                <strong>Period</strong> is the number of times silence of a certain duration must occur before it's removed.
                            </span>
                        </li>
                        <li className="flex items-start">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mt-0.5 mr-1.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span>
                                <strong>Silence Duration</strong> is the minimum length of each silence segment (in seconds) to count as one period.
                            </span>
                        </li>
                        <li className="flex items-start">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mt-0.5 mr-1.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span>
                                For example, with audio like <code>[ silence 0.6s ][ sound 0.1s ][ silence 0.6s ]</code>:
                                <ul className="ml-4 dark:text-gray-300 list-disc text-[11px] mt-1 space-y-1 text-blue-700">
                                    <li><strong>Period=1, Silence Duration=1</strong> – Does <em>not</em> remove, because there's no single 1s silence.</li>
                                    <li><strong>Period=2, Silence Duration=0.5</strong> – Works! It detects two 0.5s silent periods.</li>
                                </ul>
                            </span>
                        </li>
                    </ul>
                </div>
            </div>
          </div>
        </div>
    );
}