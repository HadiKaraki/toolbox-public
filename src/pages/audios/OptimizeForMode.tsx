import { useEffect, useState } from "react";
import AudioDisplay from "../../components/AudioDisplay";
import AudioSubmitBtn from "../../components/AudioSubmitBtn";
import BackToAudioTools from "../../components/BackToAudioTools";
import { useAudioContext } from "../../contexts/AudioContext";
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';

export default function OptimizeForMode() {
    const { audioFile, setAudioFile, audioMetadata, setAudioMetadata } = useAudioContext();
    const [audioURL, setAudioURL] = useState(undefined);
    const [mode, setMode] = useState("standard");
    const [error, setError] = useState<string | null>(null);
    const [progress, setProgress] = useState<number>(0);
    const [taskId, setTaskId] = useState<string | null>(null);
    const [completedMsg, setCompletedMsg] = useState<string | null>(null);
    const [cancelMsg, setCancelMsg] = useState<string | null>(null);

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
        setTaskId(newTaskId);
        setProgress(0);
        setCompletedMsg(null);
        setCancelMsg(null)
        setError(null);

        try {
            const arrayBuffer = await audioFile.arrayBuffer();
            const extension = audioFile.name.split('.').pop() || '.mp4';
            const tempResult = await window.electronAPI.createTempFile(arrayBuffer, extension);

            if (!tempResult.success || !tempResult.path) {
                throw new Error(tempResult.message || 'Failed to create temp file');
            }

            const originalName = audioFile.name.replace(/\.[^/.]+$/, "");
            const outputFilename = `${originalName}_optimized.${extension}`;
            const outputPath = await window.electronAPI.showSaveDialog(outputFilename);

            if (!outputPath) {
                throw new Error('Save canceled by user');
            }

            const result = await window.electronAPI.optimizeAudioForMode({
                inputPath: tempResult.path,
                outputPath,
                taskId: newTaskId,
                duration: audioMetadata.duration,
                mode
            });

            if (result.success) {
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
        } finally {
            setProgress(0);
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
            <BackToAudioTools
                title={"Audio Optimizer"}
                description={"Optimize between different modes (Podcast, studio, etc.)"}
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
                                 <div className="space-y-4">
                                    <FormControl>
                                        <label className="dark:text-gray-400">Pre-made modes</label>
                                        <RadioGroup
                                            row
                                            aria-labelledby="demo-row-radio-buttons-group-label"
                                            name="row-radio-buttons-group"
                                            className="dark:text-gray-400"
                                            sx={{mt: 1}}
                                        >
                                            <FormControlLabel checked={mode === "standard"} onChange={(e) => setMode((e.target as HTMLInputElement).value)} value="standard" disabled={!audioFile} control={<Radio />} label="🎧 Standard Compatibility" />
                                            <FormControlLabel checked={mode === "podcast"} onChange={(e) => setMode((e.target as HTMLInputElement).value)} value="podcast" disabled={!audioFile} control={<Radio />} label="🎙️ Podcast Mode" />
                                            <FormControlLabel checked={mode === "phone"} onChange={(e) => setMode((e.target as HTMLInputElement).value)} value="phone" disabled={!audioFile} control={<Radio />} label="📞 Phone / Voice Assistant" />
                                            <FormControlLabel checked={mode === "studio"} onChange={(e) => setMode((e.target as HTMLInputElement).value)} value="studio" disabled={!audioFile} control={<Radio />} label="🖥️ Studio Quality (Lossless)" />
                                        </RadioGroup>
                                    </FormControl>
                                </div>
                            </div>
                        </div>

                        {/* Process Button */}
                        <AudioSubmitBtn
                            progressTitle="Optimizing audio..."
                            btnTitle="Optimize Audio & Save"
                            completedMsg={completedMsg}
                            error={error}
                            cancelMsg={cancelMsg}
                            setCancelMsg={setCancelMsg}
                            handleCancel={handleCancel}
                            handleProcessing={handleProcessing}
                            audioFile={audioFile}
                            progress={progress}
                            taskId={taskId}
                            setTaskId={setTaskId}
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
                                        <strong>Standard Compatibility</strong> – Common for music players and web browsers.
                                    </span>
                                </li>
                                <li className="flex items-start">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mt-0.5 mr-1.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span>
                                        <strong>Podcast Mode</strong> – Smaller file, single voice channel, good for voice clarity.
                                    </span>
                                </li>
                                <li className="flex items-start">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mt-0.5 mr-1.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span>
                                        <strong>Phone / Voice Assistant</strong> – Mimics telephone audio – good for stylized sound or compatibility.
                                    </span>
                                </li>
                                <li className="flex items-start">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mt-0.5 mr-1.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span>
                                        <strong>Studio Quality (Lossless)</strong> – High-quality export, editing-ready.
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