import ToolCard from '../../components/ToolCard';
// import '../../css/ImageTools.css'

export default function ImageTools() {
  const tools = [
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
    },
    // {
    //   name: 'Edge Detection',
    //   path: '/image/edge_detection',
    //   description: 'Highlight edges and contours in images',
    //   icon: '🔍',
    // },
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
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-4">
            Image Editing Toolkit
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Transform your images with professional-grade editing tools. 
            Enhance, modify, and optimize your visuals in just a few clicks.
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