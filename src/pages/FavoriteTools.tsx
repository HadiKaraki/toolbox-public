import { useSelector } from 'react-redux';
import ToolCard from '../components/ToolCard';
import { useState } from 'react';

// Define the Tool type to match what your favorites array holds
interface Tool {
  icon: string;
  title: string;
  description: string;
  path: string;
}

// Define the shape of your slice state
interface FavoritesState {
  favorites: Tool[];
}

export default function FavoriteTools() {
  const favorites = useSelector(
    (state: { favorites: FavoritesState }) => state.favorites.favorites
  );
  const [searchTerm, setSearchTerm] = useState('');
    
  const filteredTools = favorites.filter(tool =>
    tool.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    tool.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (favorites.length === 0) { 
    return (
        <div className="not-found flex flex-col items-center justify-center mt-30 mb-20">
            <h1 className="text-3xl sm:text-4xl font-bold bg-clip-text text-black dark:text-white">
                No Favorites Currently
            </h1>
        </div>
    );
  }

  return (
    <div className='flex flex-col min-h-screen container mx-auto px-4 py-12 relative'>
         <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-4">
                Favoite Tools
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Easily access your most used tools in this page
            </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8 min-w-2xl mx-auto">
          <input
            type="text"
            placeholder="Search favorite tools..."
            className="w-full px-4 py-2 border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 min-w-7xl mx-auto gap-6">
            {filteredTools.map((tool) => (
                <ToolCard
                    key={tool.title}
                    icon={tool.icon}
                    title={tool.title}
                    description={tool.description}
                    path={tool.path}
                />
            ))}
        </div>
    </div>
    );
};