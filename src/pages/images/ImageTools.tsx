import { useState } from 'react';
import ToolCard from '../../components/ToolCard';

export default function ImageTools() {
  const allTools = [
     {
      name: 'Resize Image',
      path: '/image/resize',
      description: 'Resize images in pixels with fitting options',
      icon: '📐',
    },
    {
      name: 'Compress Image',
      path: '/image/compress',
      description: 'Reduce image file size without quality loss',
      icon: '📦',
    },
    {
      name: 'Convert Image Format',
      path: '/image/convert',
      description: 'Convert between PNG, JPG, WebP etc.',
      icon: '🔄'
    },
    {
      name: 'Add Audio To Image',
      path: '/image/audio-to-image',
      description: 'Add audio to still images',
      icon: '🎧'
    },
    {
      name: 'Sharpen Image',
      path: '/image/sharpen',
      description: 'Enhance image details by increasing sharpness',
      icon: '🗡️',
    },    
    {
      name: 'Blur Image',
      path: '/image/blur',
      description: 'Apply Gaussian blur to your images',
      icon: '🔮',
    },
    {
      name: 'Adjust Brightness',
      path: '/image/brightness',
      description: 'Modify image brightness levels',
      icon: '☀️',
    },
    {
      name: 'Saturation',
      path: '/image/saturation',
      description: 'Modify saturation level',
      icon: '🎨',
    },
    {
      name: 'Grayscale',
      path: '/image/grayscale',
      description: 'Convert images to black and white',
      icon: '⚫',
    },
    {
      name: 'Add Border',
      path: '/image/border',
      description: 'Add border to images',
      icon: '🔲',
    },
    {
      name: 'Pixelate Image',
      path: '/image/pixelate',
      description: 'Create pixelated or mosaic effects on images',
      icon: '🧩',
    },
    {
      name: 'Add Noise',
      path: '/image/noise',
      description: 'Apply grain or noise effects to images',
      icon: '🎲',
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
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-4">
            Image Editing Toolkit
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
            placeholder="Search image tools..."
            className="w-full px-4 py-2 border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 min-w-7xl mx-auto gap-6">
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