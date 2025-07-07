import { useState } from 'react';
import ToolCard from '../../components/ToolCard';

export default function AudioTools() {
  const allTools = [
    {
        "name": "Trim Audio",
        "path": "/audio/trim",
        "description": "Cut audio files to specific durations",
        "icon": "✂️"
    },
    {
        "name": "Volume Adjust",
        "path": "/audio/volume",
        "description": "Increase or decrease audio volume",
        "icon": "🔊"
    },
    {
        "name": "Change Speed",
        "path": "/audio/speed",
        "description": "Alter playback speed without pitch change",
        "icon": "⏩"
    },
    {
        "name": "Reverse Audio",
        "path": "/audio/reverse",
        "description": "Play audio backwards",
        "icon": "⏪"
    },
    {
        "name": "Convert Format",
        "path": "/audio/convert",
        "description": "Change between audio formats (MP3, WAV, etc.)",
        "icon": "🔄"
    },
    {
        "name": "Silence Remover",
        "path": "/audio/silence-remover",
        "description": "Automatically detect and remove silent parts",
        "icon": "🔈"
    },
    {
        "name": "Optimize For Certain Modes",
        "path": "/audio/optimize",
        "description": "Optimize between different modes (Podcast, studio, etc.)",
        "icon": "🎚️"
    },
    {
        "name": "Change Pitch",
        "path": "/audio/pitch",
        "description": "Modify audio pitch without speed change",
        "icon": "🎼"
    },
    {
        "name": "Spectrogram",
        "path": "/audio/spectrogram",
        "description": "Generate visual frequency analysis",
        "icon": "📊"
    },
    {
        "name": "Equalizer",
        "path": "/audio/equalizer",
        "description": "Adjust frequency bands for better sound",
        "icon": "🎛️"
    },
    {
        "name": "Add Echo",
        "path": "/audio/echo",
        "description": "Apply echo/reverb effects",
        "icon": "🏔️"
    },
    {
        "name": "Normalize Audio",
        "path": "/audio/normalize",
        "description": "Equalize volume levels across the file",
        "icon": "⚖️"
    },
    {
        "name": "Fade In/Out",
        "path": "/audio/fade",
        "description": "Add smooth fade effects to audio",
        "icon": "🎵"
    },
  ];

  const [searchTerm, setSearchTerm] = useState('');
      
  const filteredTools = allTools.filter(tool => 
    tool.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    tool.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-12 relative">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-4">
            Audio Editing Toolkit
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Transform your images with professional-grade editing tools. 
            Enhance, modify, and optimize your visuals in just a few clicks.
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8 max-w-2xl mx-auto">
          <input
            type="text"
            placeholder="Search audio tools..."
            className="w-full px-4 py-2 border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        {/* Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto gap-6">
          {filteredTools.map((tool, index) => (
            <ToolCard 
              key={index}
              icon={tool.icon}
              title={tool.name}
              description={tool.description}
              path={tool.path}
            />
          ))}
        </div>
        
        {filteredTools.length === 0 &&
          <h1 className='text-center text-3xl font-bold dark:text-white'>No tools found</h1>
        }
      </div>
    </div>
  );
};