import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.js'
import './index.css'
import { ImageProvider } from './contexts/ImageContext.js';
import { VideoProvider } from './contexts/VideoContext.js';
import { AudioProvider } from './contexts/AudioContext.js'
import { Provider } from 'react-redux';
import { store, persistor } from './redux/store';
import { PersistGate } from 'redux-persist/integration/react';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <PersistGate loading={<div className="text-white text-center mt-20">Loading...</div>} persistor={persistor}>
        <ImageProvider>
          <VideoProvider>
            <AudioProvider>
              <App />
            </AudioProvider>
          </VideoProvider>
        </ImageProvider>
      </PersistGate>
    </Provider>
  </React.StrictMode>
)

// Use contextBridge
// window.ipcRenderer.on('main-process-message', (_event, message) => {
//   console.log(message)
// })
