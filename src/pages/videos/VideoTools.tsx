import { useState } from "react";
import ToolCard from "../../components/ToolCard";

export default function VideoTools() {
  const allTools = [
    {
      name: 'Compress Video',
      path: '/video/compress',
      description: 'Reduce video file size without quality loss',
      icon: '📦',
    },
    {
      name: 'Convert Video Format',
      path: '/video/convert',
      description: 'Convert between MP4, AVI, MOV, MKV',
      icon: '🎬'
    },
    {
      "name": "Trim Video",
      "path": "/video/trim",
      "description": "Cut videos to specific durations",
      "icon": "✂️"
    },
    {
      "name": "Volume Adjust",
      "path": "/video/volume",
      "description": "Increase or decrease video volume",
      "icon": "🔊"
    },
    {
      name: 'Extract Audio',
      path: '/video/extract-audio',
      description: 'Convert video to audio (MP3, WAV, etc.)',
      icon: '🎵',
    },
    {
      "name": "Equalizer",
      "path": "/video/equalizer",
      "description": "Adjust frequency bands for better sound",
      "icon": "🎛️"
    },
    {
      "name": "Change Pitch",
      "path": "/video/pitch",
      "description": "Modify video pitch without speed change",
      "icon": "🎼"
    },
    {
      name: 'Remove Audio',
      path: '/video/remove-audio',
      description: 'Create silent video',
      icon: '🔇',
    },
    {
      name: 'Modify Quality',
      path: '/video/quality',
      description: 'Modify the quality of the video (Low, Medium, High)',
      icon: '💎',
    },
    {
      name: 'Change Frame Rate',
      path: '/video/frame-rate',
      description: 'Adjust frames per second (FPS)',
      icon: '🎞️',
    },
    {
      name: 'Change Playback Speed',
      path: '/video/playback-speed',
      description: 'Slow down or speed up video',
      icon: '⏩',
    },
    {
      name: 'Add Noise',
      path: '/video/add-noise',
      description: 'Introduce visual grain',
      icon: '🎲',
    },
    {
      name: 'Stabilize Video',
      path: '/video/stabilize',
      description: 'Fix shaky footage',
      icon: '📍',
    },
    {
      "name": "Show Motion Vectors",
      "path": "/video/motion-vectors",
      "description": "Visualize how video frames move with arrows",
      "icon": "🎯"
    }    
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
          <h1 className="text-4xl font-bold dark:text-white text-gray-800 mb-4">
            Video Processing Toolbox
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Professional video editing tools for conversion, enhancement, 
            and transformation of your media files.
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8 max-w-2xl mx-auto">
          <input
            type="text"
            placeholder="Search video tools..."
            className="w-full px-4 py-2 border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 min-w-7xl max-w-7xl mx-auto gap-6">
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