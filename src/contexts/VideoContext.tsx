import React, { createContext, useState, useContext, ReactNode } from 'react';

interface VideoContextType {
  videoFile: File | null;
  setVideoFile: (file: File | null) => void;
}

const VideoContext = createContext<VideoContextType | undefined>(undefined);

interface VideoProviderProps {
  children: ReactNode;
}

export const VideoProvider: React.FC<VideoProviderProps> = ({ children }) => {
  const [videoFile, setVideoFile] = useState<File | null>(null);

  return (
    <VideoContext.Provider value={{ videoFile, setVideoFile }}>
      {children}
    </VideoContext.Provider>
  );
};

export const useVideoContext = (): VideoContextType => {
  const context = useContext(VideoContext);
  if (context === undefined) {
    throw new Error('useVideoContext must be used within a VideoProvider');
  }
  return context;
};