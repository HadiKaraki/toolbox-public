// src/contexts/ImageContext.tsx
import React, { createContext, useState, useContext, ReactNode } from 'react';

// Define the shape of the context value
interface ImageContextValue {
  imageFile: File | null;
  setImageFile: (file: File | null) => void;
}

// Create context with default value
const ImageContext = createContext<ImageContextValue | undefined>(undefined);

// Define props for the provider
interface ImageProviderProps {
  children: ReactNode;
}

export const ImageProvider: React.FC<ImageProviderProps> = ({ children }) => {
  const [imageFile, setImageFile] = useState<File | null>(null);

  // Create the context value
  const value: ImageContextValue = {
    imageFile,
    setImageFile
  };

  return (
    <ImageContext.Provider value={value}>
      {children}
    </ImageContext.Provider>
  );
};

// Custom hook to use the context
export const useImageContext = (): ImageContextValue => {
  const context = useContext(ImageContext);
  if (context === undefined) {
    throw new Error('useImageContext must be used within an ImageProvider');
  }
  return context;
};