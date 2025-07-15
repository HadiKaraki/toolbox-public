import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';

interface ProgressContextType {
    pageLink: string| null;
    setPageLink: React.Dispatch<React.SetStateAction<string | null>>;
    taskId: string | null;
    setTaskId: React.Dispatch<React.SetStateAction<string | null>>;
    name: string | null;
    setName: React.Dispatch<React.SetStateAction<string | null>>;
    progress: number;
    setProgress: React.Dispatch<React.SetStateAction<number>>;
}

const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

interface ProgressProviderProps {
    children: ReactNode;
}

export const ProgressProvider: React.FC<ProgressProviderProps> = ({ children }) => {
    const [pageLink, setPageLink] = useState<string | null>(null);
    const [taskId, setTaskId] = useState<string | null>(null);
    const [name, setName] = useState<string | null>(null);
    const [progress, setProgress] = useState<number>(0);

    // progress tacking
    useEffect(() => {
        const progressHandler = (id: string, progress: number) => {
            if (id === taskId) setProgress(progress);
        };
        window.electronAPI.onProgress(progressHandler);
        return () => {
            window.electronAPI.removeProgressListener();
        };
    }, [taskId]);
 
    return (
        <ProgressContext.Provider value={{ pageLink, setPageLink, taskId, setTaskId, name, setName, progress, setProgress }}>
        {children}
        </ProgressContext.Provider>
    );
    };

export const useProgressContext = (): ProgressContextType => {
    const context = useContext(ProgressContext);
    if (context === undefined) {
        throw new Error('useProgressContext must be used within a ProgressProvider');
    }
    return context;
};