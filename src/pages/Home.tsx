import ToolCard from '../components/ToolCard';
import { Link } from 'react-router-dom';

export default function Home() {
  const toolCategories = [
    {
      id: 'image',
      name: 'Image Tools',
      icon: '🖼️',
      description: 'Powerful tools for editing, converting, and enhancing images',
      tools: [
        {
          title: 'Compress Image',
          path: '/image/compress',
          description: 'Reduce image file size without quality loss',
          icon: '📦',
        },
        {
          title: 'Blur Image',
          path: '/image/blur',
          description: 'Apply Gaussian blur to your images',
          icon: '🔮',
        },
        {
          title: 'Adjust Brightness',
          path: '/image/brightness',
          description: 'Modify image brightness levels',
          icon: '☀️',
        },
        {
          title: 'Saturation',
          path: '/image/saturation',
          description: 'Modify saturation level',
          icon: '🎨',
        },
        {
          title: 'Grayscale',
          path: '/image/grayscale',
          description: 'Convert images to black and white',
          icon: '⚫',
        },
        {
          title: 'Add Border',
          path: '/image/border',
          description: 'Add border to images',
          icon: '🔲',
        },
      ]
    },
    {
      id: 'video',
      name: 'Video Tools',
      icon: '🎬',
      description: 'Edit, convert, and enhance your video files',
      tools: [
        {
          title: 'Compress Video',
          path: '/video/compress',
          description: 'Reduce video file size without quality loss',
          icon: '📦',
        },
        {
          title: 'Convert Video Format',
          path: '/video/convert',
          description: 'Convert between MP4, AVI, MOV, MKV',
          icon: '🎬'
        },
        {
          title: 'Extract Audio',
          path: '/video/extract-audio',
          description: 'Convert video to audio (MP3, WAV, etc.)',
          icon: '🎵',
        },
        {
          title: 'Remove Audio',
          path: '/video/remove-audio',
          description: 'Create silent video',
          icon: '🔇',
        },
        {
          title: 'Modify Quality',
          path: '/video/quality',
          description: 'Modify the quality of the video (Low, Medium, High)',
          icon: '💎',
        },
        {
          title: 'Change Playback Speed',
          path: '/video/playback-speed',
          description: 'Slow down or speed up video',
          icon: '⏩',
        },
      ]
    },
    {
      id: 'audio',
      name: 'Audio Tools',
      icon: '🎵',
      description: 'Edit, convert, and enhance your audio files',
      tools: [
        {
          "title": "Convert Format",
          "path": "/audio/convert",
          "description": "Change between audio formats (MP3, WAV, etc.)",
          "icon": "🔄"
        },
        {
          "title": "Trim Audio",
          "path": "/audio/trim",
          "description": "Cut audio files to specific durations",
          "icon": "✂️"
        },
        {
          "title": "Change Pitch",
          "path": "/audio/pitch",
          "description": "Modify audio pitch without speed change",
          "icon": "🎼"
      },
      {
          "title": "Volume Adjust",
          "path": "/audio/volume",
          "description": "Increase or decrease audio volume",
          "icon": "🔊"
        },
        {
          "title": "Change Speed",
          "path": "/audio/speed",
          "description": "Alter playback speed without pitch change",
          "icon": "⏩"
        },
        {
          "title": "Equalizer",
          "path": "/audio/equalizer",
          "description": "Adjust frequency bands for better sound",
          "icon": "🎛️"
      },
      ]
    }
  ];

  return (
      <div className="flex flex-col min-h-screen">
       {/* Category Navigation */}
        <div className="max-w-7xl mt-16 flex flex-col mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-center text-3xl dark:text-white md:text-4xl font-bold leading-tight mb-6">Media Tools Directory</h1>
          <div className="flex flex-wrap justify-center gap-2 md:gap-4">
            {toolCategories.map(category => (
              <Link
                key={category.id}
                to={`/${category.id}/tools`}
                className="flex items-center dark:bg-gray-700 dark:border-gray-800 bg-white px-3 py-1 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 border border-gray-200"
              >
                <span className="text-2xl mr-2">{category.icon}</span>
                <span className="font-medium dark:text-white text-gray-800">{category.name}</span>
              </Link>
            ))}
          </div>
        </div>
        
        {/* Tools by Category */}
        <div className="min-w-7xl max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
          {toolCategories.map(category => (
            <section 
              key={category.id} 
              id={category.id}
              className="mb-16 scroll-mt-24"
            >
              <div className="flex items-center mb-6">
                <div className="text-4xl mr-4">{category.icon}</div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{category.name}</h2>
                  <p className="text-gray-600 dark:text-gray-400">{category.description}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {category.tools.map((tool, index) => (
                  <ToolCard 
                    key={index}
                    icon={tool.icon}
                    title={tool.title}
                    description={tool.description}
                    path={tool.path}
                  />
                ))}
              </div>
              <div className="text-center mt-12">
                  <Link 
                    to={`../${category.id}/tools`}
                    className="inline-flex dark:text-cyan-600 items-center text-purple-600 font-semibold text-lg hover:text-purple-800 transition-colors duration-200"
                  >
                    Browse All Tools
                    <svg className="w-5 h-5 ml-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </Link>
                </div>
            </section>
          ))}
        </div>
      </div>
  );
};