import { HashRouter, Route, Routes } from 'react-router-dom'
import './App.css'
import Home from "./pages/Home";
import Layout from './components/Layout';
import BrightnessImage from './pages/images/BrightnessImage';
import BlurImage from './pages/images/BlurImage';
import ImageTools from './pages/images/ImageTools';
import GrayscaleImage from './pages/images/GrayscaleImage';
import CompressImage from './pages/images/CompressImage';
import NoiseImage from './pages/images/NoiseImage';
import SharpenImage from './pages/images/SharpenImage';
import AddBorderImage from './pages/images/AddBorderImage';
import AudioToImage from './pages/images/AudioToImage';
import ResizeImage from './pages/images/ResizeImage';
import SaturationImage from './pages/images/SaturationImage';
import ConvertImage from './pages/images/ConvertImage';
import PixelateImage from './pages/images/PixelateImage';
import VideoTools from './pages/videos/VideoTools';
import UpdateManager from './pages/UpdateManager';
import ChangeFps from './pages/videos/ChangeFps';
import AdjustVideoVolume from './pages/videos/AdjustVideoVolume';
import CompressVideo from './pages/videos/CompressVideo';
import ExtractAudioVideo from './pages/videos/ExtractAudioVideo';
import ConvertVideo from './pages/videos/ConvertVideo';
import EqualizeVideoAudio from './pages/videos/EqualizeVideoAudio';
import RemoveAudioVideo from './pages/videos/RemoveAudioVideo';
import TrimVideo from './pages/videos/TrimVideo';
import ModifyVideoPitch from './pages/videos/ModifyVideoPitch';
import PlaybackSpeedVideo from './pages/videos/PlaybackSpeedVideo';
import StabilizeVideo from './pages/videos/StabilizeVideo';
import ModifyQualityVideo from './pages/videos/ModifyQualityVideo';
import AudioTools from './pages/audios/AudioTools';
import AdjustAudioVolume from './pages/audios/AdjustAudioVolume';
import AudioPlaybackSpeed from './pages/audios/AudioPlaybackSpeed';
import ReverseAudio from './pages/audios/ReverseAudio';
import ConvertAudio from './pages/audios/ConvertAudio';
import ModifyAudioPitch from './pages/audios/ModifyAudioPitch';
import OptimizeForMode from './pages/audios/OptimizeForMode';
import AudioEqualizer from './pages/audios/AudioEqualizer';
import NormalizeAudio from './pages/audios/NormalizeAudio';
import DownloadPage from './pages/DownloadPage';
import TrimAudio from './pages/audios/TrimAudio';
import FavoriteTools from './pages/FavoriteTools';
import AddEcho from './pages/audios/AddEcho';
import AddNoiseVideo from './pages/videos/AddNoiseVideo';
import FadeInOut from './pages/audios/FadeInOut';

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/download" element={<DownloadPage />} />
          
          {/* Images */}
          <Route path="/image/tools" element={<ImageTools />} />
          <Route path="/image/resize" element={<ResizeImage />} />
          <Route path="/image/brightness" element={<BrightnessImage />} />
          <Route path="/image/blur" element={<BlurImage />} />
          <Route path="/image/grayscale" element={<GrayscaleImage />} />
          <Route path="/image/compress" element={<CompressImage />} />
          <Route path="/image/noise" element={<NoiseImage />} />
          <Route path="/image/saturation" element={<SaturationImage />} />
          <Route path="/image/convert" element={<ConvertImage />} />
          <Route path="/image/sharpen" element={<SharpenImage />} />
          <Route path="/image/border" element={<AddBorderImage />} />
          <Route path="/image/pixelate" element={<PixelateImage />} />
          <Route path="/image/audio-to-image" element={<AudioToImage />} />

          {/* Videos */}
          <Route path="/video/tools" element={<VideoTools />} />
          <Route path="/video/frame-rate" element={<ChangeFps />} />
          <Route path="/video/volume" element={<AdjustVideoVolume />} />
          <Route path="/video/compress" element={<CompressVideo />} />
          <Route path="/video/extract-audio" element={<ExtractAudioVideo />} />
          <Route path="/video/convert" element={<ConvertVideo />} />
          <Route path="/video/equalizer" element={<EqualizeVideoAudio />} />
          <Route path="/video/remove-audio" element={<RemoveAudioVideo />} />
          <Route path="/video/trim" element={<TrimVideo />} />
          <Route path="/video/pitch" element={<ModifyVideoPitch />} />
          <Route path="/video/playback-speed" element={<PlaybackSpeedVideo />} />
          <Route path="/video/stabilize" element={<StabilizeVideo />} />
          <Route path="/video/quality" element={<ModifyQualityVideo />} />
          <Route path="/video/add-noise" element={<AddNoiseVideo />} />

          {/* Audios */}
          <Route path="/audio/tools" element={<AudioTools />} />
          <Route path="/audio/volume" element={<AdjustAudioVolume />} />
          <Route path="/audio/speed" element={<AudioPlaybackSpeed />} />
          <Route path="/audio/reverse" element={<ReverseAudio />} />
          <Route path="/audio/convert" element={<ConvertAudio />} />
          <Route path="/audio/pitch" element={<ModifyAudioPitch />} />
          <Route path="/audio/optimize" element={<OptimizeForMode />} />
          <Route path="/audio/equalizer" element={<AudioEqualizer />} />
          <Route path="/audio/normalize" element={<NormalizeAudio />} />
          <Route path="/audio/trim" element={<TrimAudio />} />
          <Route path="/audio/fade" element={<FadeInOut />} />
          <Route path="/audio/echo" element={<AddEcho />} />

          {/* Other */}
          <Route path="/update" element={<UpdateManager />} />
          <Route path="/favorites" element={<FavoriteTools />} />

          {/* fallback */}
          <Route path="*" element={<Home />} />
        </Route>
      </Routes>
    </HashRouter>
  )
}

export default App;