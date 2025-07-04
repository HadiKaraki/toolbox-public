import React, { createContext, useState, useContext, ReactNode } from 'react';

interface AudioContextType {
  audioFile: File | null;
  setAudioFile: (file: File | null) => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

interface AudioProviderProps {
  children: ReactNode;
}

export const AudioProvider: React.FC<AudioProviderProps> = ({ children }) => {
  const [audioFile, setAudioFile] = useState<File | null>(null);

  return (
    <AudioContext.Provider value={{ audioFile, setAudioFile }}>
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