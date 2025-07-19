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

export default function AudioEqualizer() {
    const { audioFile, setAudioFile, audioMetadata, setAudioMetadata } = useAudioContext();
    const [audioURL, setAudioURL] = useState<string | undefined>(undefined);
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

    const currentTaskId = getTaskIdByName("Equalizing Audio");
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
        addTask(newTaskId, "Equalizing Audio", '/audio/equalize');
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
            const outputFilename = `${originalName}_equalized.${extension}`;
            const outputPath = await window.electronAPI.showSaveDialog(outputFilename);

            if (!outputPath) {
                removeTask(newTaskId);
                throw new Error('Save canceled by user');
            }

            const result = await window.electronAPI.equalizeAudio({
                inputPath: tempResult.path,
                outputPath,
                taskId: newTaskId,
                duration: audioMetadata.duration,
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
        const taskId = getTaskIdByName("Equalizing Audio");
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
                title={"Audio Equalizer"}
                description={"Equalize volume levels across the file using pre-built modes or manually"}
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
                    <h2 className="text-xl dark:text-white font-semibold mb-4 text-gray-700">Optimizing Modes</h2>

                    <div className="space-y-6">
                        <div className="space-y-4">
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
                                        <FormControlLabel checked={equalizeMode === "BassBoost"} onChange={(e) => handleEqualizeMode((e.target as HTMLInputElement).value)} value="BassBoost" disabled={!audioFile} control={<Radio />} label="Bass Boost" />
                                        <FormControlLabel checked={equalizeMode === "VocalBoost"} onChange={(e) => handleEqualizeMode((e.target as HTMLInputElement).value)} value="VocalBoost" disabled={!audioFile} control={<Radio />} label="Vocal Boost" />
                                        <FormControlLabel checked={equalizeMode === "TrebleBoost"} onChange={(e) => handleEqualizeMode((e.target as HTMLInputElement).value)} value="TrebleBoost" disabled={!audioFile} control={<Radio />} label="Treble Boost" />
                                        <FormControlLabel checked={equalizeMode === "NoiseReduction"} onChange={(e) => handleEqualizeMode((e.target as HTMLInputElement).value)} value="NoiseReduction" disabled={!audioFile} control={<Radio />} label="Noise Reduction" />
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
                                        disabled={!audioFile}
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
                                        disabled={!audioFile}
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
                                        disabled={!audioFile}
                                        className="w-full h-2 dark:text-gray-400 bg-gray-200 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
                                    />
                                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                                        <span className="dark:text-gray-400">Min</span>
                                        <span className="dark:text-gray-400">Max</span>
                                    </div>
                                </div>
                            </div>

                            {/* Process Button */}
                            <AudioSubmitBtn
                                progressTitle="Equalizing audio..."
                                btnTitle="Equalize Audio & Save"
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

                        {/* Tips Section */}
                        <div className="bg-blue-50 dark:bg-gray-900/60 p-4 rounded-lg">
                            <h3 className="text-sm font-medium dark:text-white text-blue-800 mb-2">Audio Equalizer Tips</h3>
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