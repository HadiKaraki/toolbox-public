import React, { createContext, useState, useContext, ReactNode } from 'react';

type AudioData = {
  name: string,
  duration: number,
  format: string,
  size: string
}

interface AudioContextType {
  audioFile: File | null;
  setAudioFile: (file: File | null) => void;
  audioMetadata: AudioData;
  setAudioMetadata: React.Dispatch<React.SetStateAction<AudioData>>;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

interface AudioProviderProps {
  children: ReactNode;
}

export const AudioProvider: React.FC<AudioProviderProps> = ({ children }) => {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioMetadata, setAudioMetadata] = useState<AudioData>({
      name: '', duration: 0, format: 'mp4', size: '0'
  });

  return (
    <AudioContext.Provider value={{ audioFile, setAudioFile, audioMetadata, setAudioMetadata }}>
      {children}
    </AudioContext.Provider>
  );
};

export const useAudioContext = (): AudioContextType => {
  const context = useContext(AudioContext);
  if (context === undefined) {
    throw new Error('useAudioContext must be used within a AudioProvider');
  }
  return context;
};