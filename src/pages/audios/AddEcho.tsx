import { useEffect, useState } from "react";
import AudioDisplay from "../../components/AudioDisplay";
import { useProgressContext } from "../../contexts/ProgressContext";
import AudioSubmitBtn from "../../components/AudioSubmitBtn";
import BackToAudioTools from "../../components/BackToAudioTools";
import { useAudioContext } from "../../contexts/AudioContext";
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';

export default function AddEcho() {
    const { audioFile, setAudioFile, audioMetadata, setAudioMetadata } = useAudioContext();
    const [audioURL, setAudioURL] = useState<string | undefined>(undefined);
    const [echoMode, setEchoMode] = useState('light');
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

    const currentTaskId = getTaskIdByName("Adding Echo Audio");
    const currentTask = currentTaskId ? tasks[currentTaskId] : null;
    const progress = currentTask?.progress || 0;

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            // Validate audio file type more robustly
            if (!file.type.startsWith('audio/') && !['mp3', 'wav', 'ogg', 'flac', 'm4a'].some(ext => file.name.endsWith(`.${ext}`))) {
            setError('Please select an audio file');
            return;
            }
            setAudioFile(file);
        }
    };

    const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const file = e.dataTransfer.files[0];
            // Same validation as above
            if (!file.type.startsWith('audio/') && !['mp3', 'wav', 'ogg', 'flac', 'm4a'].some(ext => file.name.endsWith(`.${ext}`))) {
            setError('Please drop an audio file');
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

    const handleRemoveAudio = () => {
        setAudioFile(null);
        setAudioURL(undefined);
        setAudioMetadata({name: '', duration: 0, format: 'mp4', size: '0'});
    };

   const handleProcessing = async () => {
      if (!audioFile) return;
      
      const newTaskId = Math.random().toString(36).substring(2, 15);
      addTask(newTaskId, "Adding Echo Audio", '/audio/echo');
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
        const outputFilename = `${originalName}_echo.${extension}`;
        const outputPath = await window.electronAPI.showSaveDialog(outputFilename);
        
        if (!outputPath) {
          removeTask(newTaskId);
          throw new Error('Save canceled by user');
        }

        const result = await window.electronAPI.addEchoAudio({
            inputPath: tempResult.path,
            outputPath,
            taskId: newTaskId,
            duration: audioMetadata.duration,
            echoMode
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
        const taskId = getTaskIdByName("Adding Echo Audio");
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
          <BackToAudioTools
            title={"Echo Adder"}
            description={"Apply echo/reverb effects"}
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
              <h2 className="text-xl dark:text-white font-semibold mb-4 text-gray-700">Premade Echo Modes</h2>
              
              <div className="space-y-6">
                <div className="space-y-4">
                    <div className="space-y-4">
                        <FormControl>
                            <label className="dark:text-gray-400">Echo Modes</label>
                            <RadioGroup
                                row
                                aria-labelledby="demo-row-radio-buttons-group-label"
                                name="row-radio-buttons-group"
                                sx={{mt: 1}}
                                className="dark:text-gray-400"
                            >
                                <FormControlLabel checked={echoMode === "light"} onChange={(e) => setEchoMode((e.target as HTMLInputElement).value)} value="light" disabled={!audioFile} control={<Radio />} label="Light Echo" />
                                <FormControlLabel checked={echoMode === "medium"} onChange={(e) => setEchoMode((e.target as HTMLInputElement).value)} value="medium" disabled={!audioFile} control={<Radio />} label="Medium Echo" />
                                <FormControlLabel checked={echoMode === "strong"} onChange={(e) => setEchoMode((e.target as HTMLInputElement).value)} value="strong" disabled={!audioFile} control={<Radio />} label="Strong Echo" />
                                <FormControlLabel checked={echoMode === "spacey"} onChange={(e) => setEchoMode((e.target as HTMLInputElement).value)} value="spacey" disabled={!audioFile} control={<Radio />} label="Spacey Echo" />
                            </RadioGroup>
                        </FormControl>
                    </div>
                </div>

                {/* Process Button */}
                <AudioSubmitBtn
                    progressTitle="Adding echo..."
                    btnTitle="Add Echo & Save"
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
                                <strong>Light</strong> – Subtle and clean. Great for casual voice or slight room effect.
                            </span>
                        </li>
                        <li className="flex items-start">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mt-0.5 mr-1.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span>
                                <strong>Medium</strong> – Balanced and smooth. Good for podcasts and music backgrounds.
                            </span>
                        </li>
                        <li className="flex items-start">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mt-0.5 mr-1.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span>
                                <strong>Strong</strong> – Bold and noticeable. Use for dramatic or stylized effects.
                            </span>
                        </li>
                        <li className="flex items-start">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mt-0.5 mr-1.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span>
                                <strong>Spacey</strong> – Dreamy and distant. Great for ambient or sci-fi sounds.
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