import { useSelector } from 'react-redux';
import ToolCard from '../components/ToolCard';

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

  if (favorites.length === 0) { 
    return (
        <div className="not-found flex flex-col items-center justify-center mt-20 mb-20">
            <h1 className="text-4xl sm:text-5xl font-bold bg-clip-text text-black dark:text-white">
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
                {/* Transform your images with professional-grade editing tools. 
                Enhance, modify, and optimize your visuals in just a few clicks. */}
            </p>
        </div>

         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 min-w-7xl mx-auto gap-6">
            {favorites.map((tool) => (
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