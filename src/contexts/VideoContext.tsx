import React, { createContext, useState, useContext, ReactNode } from 'react';

type VideoData = {
  duration: number,
  width: number,
  height: number,
  format: string,
  size: string
}

interface VideoContextType {
  videoFile: File | null;
  setVideoFile: (file: File | null) => void;
  videoMetadata: VideoData;
  setVideoMetadata: React.Dispatch<React.SetStateAction<VideoData>>;
}

const VideoContext = createContext<VideoContextType | undefined>(undefined);

interface VideoProviderProps {
  children: ReactNode;
}

export const VideoProvider: React.FC<VideoProviderProps> = ({ children }) => {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoMetadata, setVideoMetadata] = useState<VideoData>({
    duration: 0,
    width: 0,
    height: 0,
    format: 'mp4',
    size: '0'
  });

  return (
    <VideoContext.Provider value={{ videoFile, setVideoFile, videoMetadata, setVideoMetadata }}>
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