import { ChangeEvent, useEffect, useState } from "react";
import AudioDisplay from "../../components/AudioDisplay";
import { useProgressContext } from "../../contexts/ProgressContext";
import AudioSubmitBtn from "../../components/AudioSubmitBtn";
import BackToAudioTools from "../../components/BackToAudioTools";
import { useAudioContext } from "../../contexts/AudioContext";

export default function TrimAudio() {
    const { audioFile, setAudioFile, audioMetadata, setAudioMetadata } = useAudioContext();
    const [audioURL, setAudioURL] = useState<string | undefined>(undefined);
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

    const currentTaskId = getTaskIdByName("Trimming Audio");
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
        };

        audio.addEventListener('loadedmetadata', handleLoadedMetadata);

        return () => {
            audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
            URL.revokeObjectURL(url);
        };
    }, [audioFile]);

    useEffect(() => {
        const start = hhmmssToSeconds(startTime);
        const end = hhmmssToSeconds(endTime);

        if (startTime === '' && endTime === '') {
            setError('');
        } else if (start >= end) {
          setError('Start time must be less than end time.');
          setStartGreaterThanEnd(true);
        } else if (end > audioMetadata.duration) {
          setError(`End time exceeds audio duration (${secondsToHHMMSS(audioMetadata.duration)}).`);
          setStartGreaterThanEnd(true);
        } else {
          setError('');
          setStartGreaterThanEnd(false);
        }
    }, [startTime, endTime, audioMetadata.duration]);

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
      if (startGreaterThanEnd) return;
      
      const newTaskId = Math.random().toString(36).substring(2, 15);
      addTask(newTaskId, "Trimming Audio", '/audio/trim');
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
        const outputFilename = `${originalName}_trimmed.${extension}`;
        const outputPath = await window.electronAPI.showSaveDialog(outputFilename);
        
        if (!outputPath) {
          removeTask(newTaskId);
          throw new Error('Save canceled by user');
        }

        const result = await window.electronAPI.trimAudio({
            inputPath: tempResult.path,
            outputPath,
            taskId: newTaskId,
            duration: audioMetadata.duration,
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
        const taskId = getTaskIdByName("Trimming Audio");
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
            
    return (
        <div className="container lg:mt-5 mx-auto px-4 py-8 xl:min-w-5xl max-w-6xl">
        {/* Header Section */}
          <BackToAudioTools
            title={"Audio Trimmer"}
            description={"Cut audio files to specific durations"}
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
              <h2 className="text-xl dark:text-white font-semibold mb-4 text-gray-700">Start and end time</h2>
              
              <div className="space-y-6">
                <div className="space-y-4">
                    <div className="space-y-4">
                      <div>
                        <label className="block dark:text-gray-400 text-sm font-medium mb-2">Start Time (hh:mm:ss)</label>
                        <input
                            type="text"
                            value={startTime}
                            disabled={!audioFile}
                            onChange={(e) => handleTimeInput(e, setStartTime)}
                            placeholder="HH:MM:SS"
                            className={`border px-1 py-1 rounded w-full ${!audioFile ? 'border-gray-300 text-gray-300 dark:text-gray-400 dark:border-gray-600' : 'border-gray-400 dark:text-gray-200'}`}
                        />
                    </div>
                    <div>
                        <label className="block dark:text-gray-400 text-sm font-medium mb-2">End Time (hh:mm:ss)</label>
                        <label className={`block text-sm dark:text-gray-400 font-light mb-2 ${!audioFile ? 'hidden' : ''}`}>Audio Duration: {secondsToHHMMSS(audioMetadata.duration)}</label>
                        <input
                            type="text"
                            value={endTime}
                            disabled={!audioFile}
                            onChange={(e) => handleTimeInput(e, setEndTime)}
                            placeholder="HH:MM:SS"
                            className={`border px-1 py-1 rounded w-full ${!audioFile ? 'border-gray-300 text-gray-300 dark:text-gray-400 dark:border-gray-600' : 'border-gray-400 dark:text-gray-200'}`}
                        />
                    </div>
                  </div>
                </div>

                {/* Process Button */}
                <AudioSubmitBtn
                    progressTitle="Trimming audio..."
                    btnTitle="Trim Audio & Save"
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
              </div>
            </div>
          </div>
        </div>
    );
}