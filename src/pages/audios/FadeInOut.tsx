import { ChangeEvent, useEffect, useState } from "react";
import AudioDisplay from "../../components/AudioDisplay";
import { useProgressContext } from "../../contexts/ProgressContext";
import AudioSubmitBtn from "../../components/AudioSubmitBtn";
import BackToAudioTools from "../../components/BackToAudioTools";
import { useAudioContext } from "../../contexts/AudioContext";

export default function FadeInOut() {
    const { audioFile, setAudioFile, audioMetadata, setAudioMetadata } = useAudioContext();
    const [audioURL, setAudioURL] = useState<string | undefined>(undefined);
    const [fadeInStartTime, setFadeInStartTime] = useState('');
    const [fadeInDuration, setFadeInDuration] = useState('');
    const [fadeOutStartTime, setFadeOutStartTime] = useState('');
    const [fadeOutDuration, setFadeOutDuration] = useState('');
    const [audioDuration, setAudioDuration] = useState(0);
    const [timingErrors, setTimingErrors] = useState(false);
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

    const currentTaskId = getTaskIdByName("Fading Audio");
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

    function getBaseFileName(filename: string) {
        return filename.replace(/\.[^/.]+$/, '');
    }

    useEffect(() => {
        if (!audioFile) return;

        const url = URL.createObjectURL(audioFile);
        setAudioURL(url);

        const audio = document.createElement('audio');
        audio.src = url;
        
        // More reliable metadata loading
        const handleLoadedMetadata = () => {
            setAudioMetadata({
                name: getBaseFileName(audioFile.name),
                duration: Math.round(audio.duration),
                format: audioFile.type.split('/')[1]?.toUpperCase() || 
                        audioFile.name.split('.').pop()?.toUpperCase() || 
                        'UNKNOWN',
                size: (audioFile.size / (1024 * 1024)).toFixed(2)
            });
            setAudioDuration(audio.duration)
        };

        audio.addEventListener('loadedmetadata', handleLoadedMetadata);

        return () => {
            audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
            URL.revokeObjectURL(url);
        };
    }, [audioFile]);

    useEffect(() => {
        const fadeInStart = hhmmssToSeconds(fadeInStartTime);
        const fadeInDurationSeconds = hhmmssToSeconds(fadeInDuration);

        const fadeOutStart = hhmmssToSeconds(fadeOutStartTime);
        const fadeOutDurationSeconds = hhmmssToSeconds(fadeOutDuration);

        if (fadeInStart > audioDuration) {
            setError(`Fade in start time exceeds audio duration (${secondsToHHMMSS(audioDuration)}).`);
            setTimingErrors(true);
        } else if (fadeInDurationSeconds > audioDuration) {
            setError(`Fade in duration exceeds audio duration (${secondsToHHMMSS(audioDuration)}).`);
            setTimingErrors(true);
        } else if (fadeInStart > fadeOutStart) {
            setError("Fade in start time exceeds fade out start time");
            setTimingErrors(true);
        } else if (fadeInStart + fadeInDurationSeconds > fadeOutStart) {
            setError("Fade in duration exceeds fade out start time");
            setTimingErrors(true);
        } else if (fadeOutDurationSeconds > audioDuration) {
            setError(`Fade out duration exceeds audio duration (${secondsToHHMMSS(audioDuration)}).`);
            setTimingErrors(true);
        } else if (fadeOutStart + fadeInDurationSeconds > audioDuration) {
            setError(`Fade out duration exceeds audio duration (${secondsToHHMMSS(audioDuration)}).`);
            setTimingErrors(true)
        } else {
            setError('');
            setTimingErrors(false);
        }

    }, [fadeInStartTime, fadeOutStartTime, fadeInDuration, fadeOutDuration, audioDuration]);

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
      if (timingErrors) return;
      
      const newTaskId = Math.random().toString(36).substring(2, 15);
      addTask(newTaskId, "Fading Audio", '/audio/fade');
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
        const outputFilename = `${originalName}_faded.${extension}`;
        const outputPath = await window.electronAPI.showSaveDialog(outputFilename);
        
        if (!outputPath) {
          removeTask(newTaskId);
          throw new Error('Save canceled by user');
        }

        const result = await window.electronAPI.fadeAudio({
            inputPath: tempResult.path,
            outputPath,
            taskId: newTaskId,
            duration: audioMetadata.duration,
            fadeInStartTime: hhmmssToSeconds(fadeInStartTime),
            fadeInDuration: hhmmssToSeconds(fadeInDuration),
            fadeOutStartTime: hhmmssToSeconds(fadeOutStartTime),
            fadeOutDuration: hhmmssToSeconds(fadeOutDuration)
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
        const taskId = getTaskIdByName("Fading Audio");
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

    const formatTime = (value: string) => {
        const cleaned = value.replace(/\D/g, '').slice(0, 6);
      
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
            
    return (
        <div className="container lg:mt-5 mx-auto px-4 py-8 xl:min-w-5xl max-w-6xl">
        {/* Header Section */}
          <BackToAudioTools
            title={"Fade In And Out"}
            description={"Add smooth fade effects to audio"}
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
              <h2 className="text-xl dark:text-white font-semibold mb-4 text-gray-700">Fade in and out timings</h2>
              
              <div className="space-y-6">
                <div className="space-y-4">
                    <div className="flex flex-col lg:flex-row justify-between">
                        <div>
                            <label className="block dark:text-gray-400 text-sm font-medium mb-2">Fade in start time (hh:mm:ss)</label>
                            <input
                                value={fadeInStartTime}
                                disabled={!audioFile}
                                onChange={(e) => handleTimeInput(e, setFadeInStartTime)}
                                className={`border px-1 py-1 rounded w-full ${!audioFile ? 'border-gray-300 text-gray-300 dark:text-gray-400 dark:border-gray-600' : 'border-gray-400 dark:text-gray-200'}`}
                                placeholder="HH:MM:SS"
                            />
                        </div>
                        <div>
                            <label className="block dark:text-gray-400 text-sm font-medium mb-2">Duration (In seconds)</label>
                            <input
                                type="text"
                                value={fadeInDuration}
                                disabled={!audioFile}
                                onChange={(e) => setFadeInDuration(e.target.value)}
                                placeholder="HH:MM:SS"
                                className={`border px-1 py-1 rounded w-full ${!audioFile ? 'border-gray-300 text-gray-300 dark:text-gray-400 dark:border-gray-600' : 'border-gray-400 dark:text-gray-200'}`}
                            />
                        </div>
                    </div>
                    <div className="flex flex-col lg:flex-row justify-between mt-8 lg:mt-0">
                        <div>
                            <label className="block dark:text-gray-400 text-sm font-medium mb-2">Fade out start time (hh:mm:ss)</label>
                            <input
                                type="text"
                                value={fadeOutStartTime}
                                disabled={!audioFile}
                                onChange={(e) => handleTimeInput(e, setFadeOutStartTime)}
                                placeholder="HH:MM:SS"
                                className={`border px-1 py-1 rounded w-full ${!audioFile ? 'border-gray-300 text-gray-300 dark:text-gray-400 dark:border-gray-600' : 'border-gray-400 dark:text-gray-200'}`}
                            />
                        </div>
                        <div>
                            <label className="block dark:text-gray-400 text-sm font-medium mb-2">Duration (In seconds)</label>
                            <input
                                type="text"
                                value={fadeOutDuration}
                                disabled={!audioFile}
                                onChange={(e) => setFadeOutDuration(e.target.value)}
                                placeholder="HH:MM:SS"
                                className={`border px-1 py-1 rounded w-full ${!audioFile ? 'border-gray-300 text-gray-300 dark:text-gray-400 dark:border-gray-600' : 'border-gray-400 dark:text-gray-200'}`}
                            />
                        </div>
                    </div>
                    <label className={`block dark:text-gray-400 text-sm font-light mb-2 ${!audioFile ? 'hidden' : ''}`}>Audio Duration: {secondsToHHMMSS(audioDuration)}</label>
                </div>

                {/* Process Button */}
                <AudioSubmitBtn
                    progressTitle="Fading audio..."
                    btnTitle="Fade Audio & Save"
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
      
                {/* Tips Section */}
                <div className="bg-blue-50 dark:bg-gray-900/60 p-4 rounded-lg">
                    <h3 className="text-sm dark:text-white font-medium text-blue-800 mb-2">Audio Conversion Tips</h3>
                    <ul className="text-xs dark:text-gray-300 text-blue-700 space-y-2">
                        <li className="flex items-start">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mt-0.5 mr-1.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span>
                                <strong>Fade In</strong> – Gradually increases the volume at the beginning. Use to avoid abrupt starts.
                            </span>
                        </li>
                        <li className="flex items-start">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mt-0.5 mr-1.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span>
                                <strong>Fade Out</strong> – Gradually decreases the volume at the end. Perfect for a smooth ending.
                            </span>
                        </li>
                        <li className="flex items-start">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mt-0.5 mr-1.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span>
                                <strong>Duration</strong> – Controls how long the fade lasts (e.g. <code>d=3</code> is 3 seconds).
                            </span>
                        </li>
                        <li className="flex items-start">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mt-0.5 mr-1.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span>
                                <strong>Start Time</strong> – For fade-out, define when the fade starts (e.g. <code>st=10</code> starts at 10s).
                            </span>
                        </li>
                    </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
    );
}