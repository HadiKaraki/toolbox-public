import React, { createContext, useState, useContext, useEffect, ReactNode, useCallback } from 'react';

interface TaskProgress {
    name: string;
    progress: number;
    pageLink: string;
}

interface ProgressContextType {
    tasks: Record<string, TaskProgress>;  // { [taskId]: { name, progress, pageLink } }
    addTask: (taskId: string, name: string, pageLink: string) => void;
    updateProgress: (taskId: string, progress: number) => void;
    removeTask: (taskId: string) => void;
    getTaskIdByName: (name: string) => string | null;
    getTaskById: (taskId: string) => TaskProgress | null;
}

const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

interface ProgressProviderProps {
    children: ReactNode;
}

export const ProgressProvider: React.FC<ProgressProviderProps> = ({ children }) => {
    const [tasks, setTasks] = useState<Record<string, TaskProgress>>({});

    const addTask = useCallback((taskId: string, name: string, pageLink: string) => {
        setTasks(prev => ({
            ...prev,
            [taskId]: {
                name,
                progress: 0,
                pageLink
            }
        }));
    }, []);

    const updateProgress = useCallback((taskId: string, progress: number) => {
        setTasks(prev => {
            if (prev[taskId]) {
                return {
                    ...prev,
                    [taskId]: {
                        ...prev[taskId],
                        progress
                    }
                };
            }
            return prev;
        });
    }, []);

    const removeTask = useCallback((taskId: string) => {
        setTasks(prev => {
            const newTasks = { ...prev };
            delete newTasks[taskId];
            return newTasks;
        });
    }, []);

    const getTaskById = useCallback((taskId: string): TaskProgress | null => {
        return tasks[taskId] || null;
    }, [tasks]);

    const getTaskIdByName = useCallback((name: string): string | null => {
        const found = Object.entries(tasks).find(([_, task]) => task.name === name);
        return found ? found[0] : null;
    }, [tasks]);

    // Handle progress updates from electronAPI
    useEffect(() => {
        const progressHandler = (taskId: string, progress: number) => {
            updateProgress(taskId, progress);
        };
        
        window.electronAPI.onProgress(progressHandler);
        return () => {
            window.electronAPI.removeProgressListener();
        };
    }, [updateProgress]);

    return (
        <ProgressContext.Provider value={{ 
            tasks,
            addTask,
            updateProgress,
            removeTask,
            getTaskById,
            getTaskIdByName
        }}>
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