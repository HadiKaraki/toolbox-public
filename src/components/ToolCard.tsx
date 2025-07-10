// src/components/ToolCard.tsx
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addToFavorites, removeFromFavorites } from "../redux/slices/favoritesSlice";
import { useState, useEffect } from "react";
import { RootState } from "../redux/store"; // You'll need to define your RootState type

interface ToolCardProps {
  icon: string;
  title: string;
  description: string;
  path: string;
}

const ToolCard = ({ icon, title, description, path }: ToolCardProps) => {
  const dispatch = useDispatch();
  const favorites = useSelector((state: RootState) => state.favorites.favorites);
  const [addedToFav, setAddedToFav] = useState(false);

  const tool = { icon, title, description, path };

  useEffect(() => {
    const found = favorites.find(t => t.title === title);
    setAddedToFav(!!found);
  }, [favorites, title]);

  const handleAddToFavorites = (e: React.MouseEvent) => {
    e.preventDefault();
    dispatch(addToFavorites(tool));
    setAddedToFav(true);
  };

  const handleRemoveFromFavorites = (e: React.MouseEvent) => {
    e.preventDefault();
    dispatch(removeFromFavorites(tool.title));
    setAddedToFav(false);
  };

  return (
    <Link
      to={path}
      className="group dark:bg-gray-800 dark:border-gray-700 dark:hover:border-cyan-400/50 bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300 hover:border-purple-100 hover:-translate-y-1 relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-16 h-16 bg-purple-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform rotate-45 translate-x-8 -translate-y-8"></div>
      
      <div className="relative">
        <div className="flex justify-between items-start">
          <div className="text-4xl mb-4 transition-transform duration-300 group-hover:scale-105">
            {icon}
          </div>
          <button 
            onClick={addedToFav ? handleRemoveFromFavorites : handleAddToFavorites}
            className="text-xl hover:text-2xl hover:cursor-pointer"
            aria-label={addedToFav ? "Remove from favorites" : "Add to favorites"}
          >
            {addedToFav ? '❤️' : '🤍'}
          </button>
        </div>
        <h2 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">
          {title}
        </h2>
        <p className="text-gray-600 mb-4 dark:text-white">{description}</p>
        <div className="mt-4 pt-4 border-t border-gray-100 group-hover:border-purple-200 transition-colors duration-300">
          <span className="text-purple-600 font-medium flex items-center dark:text-cyan-600">
            Use Tool
            <svg 
              className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1"
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="2" 
                d="M14 5l7 7m0 0l-7 7m7-7H3"
              />
            </svg>
          </span>
        </div>
      </div>
    </Link>
  );
};

export default ToolCard;