import ToolCard from "../../components/ToolCard";

export default function VideoTools() {
  const tools = [
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

  return (
    <div className="min-h-screen">
      {/* Decorative background elements */}
      {/* <div className="absolute inset-0 overflow-hidden opacity-10">
        <div className="absolute top-0 left-0 w-32 h-32 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/2 w-32 h-32 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
      </div> */}

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

        {/* Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto gap-6">
          {tools.map((tool, index) => (
            <ToolCard 
              key={index}
              icon={tool.icon}
              title={tool.name}
              description={tool.description}
              path={tool.path}
            />
          ))}
        </div>
      </div>
    </div>
  );
};