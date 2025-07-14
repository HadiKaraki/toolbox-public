import { useSelector, useDispatch } from 'react-redux';
import { toggleTheme } from '../redux/slices/themeSlice';
import { useCallback } from 'react';
import { useLayoutEffect } from 'react';
import { Link } from 'react-router-dom';

const toolCategories = [
    {
        id: 'image',
        name: 'Image Tools',
        icon: '🖼️',
        description: 'Powerful tools for editing, converting, and enhancing images',
    },
    {
        id: 'video',
        name: 'Video Tools',
        icon: '🎬',
        description: 'Edit, convert, and enhance your video files',
    },
    {
        id: 'audio',
        name: 'Audio Tools',
        icon: '🎵',
        description: 'Edit, convert, and enhance your audio files',
    }
];

const SideBar = () => {
    const theme = useSelector((state: { theme: { mode: any; }; }) => state.theme.mode);
    const dispatch = useDispatch();

    useLayoutEffect(() => {
        document.documentElement.classList.toggle('dark', theme === 'dark');
    }, [theme])

    const onClick = useCallback(() => {
        dispatch(toggleTheme());
    }, [dispatch]);

    return (
        <div className="w-64 bg-gradient-to-r from-blue-600 to-purple-600 py-5 px-4 border-r dark:from-gray-900 dark:to-gray-800 border-gray-200 dark:border-gray-700">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-gray-900 dark:to-gray-800 py-5 px-4">
                <h1 className="text-xl text-white dark:text-gray-300 transition-colors font-semibold flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 10h16v8a2 2 0 01-2 2H6a2 2 0 01-2-2v-8z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 10V6h6v4" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14h4" />
                    </svg>
                    Toolbox Pro
                </h1>
            </div>
            <nav className="py-4">
                <Link 
                    key={"home-page"}
                    to="/"
                    className="flex border-b text-white hover:text-black border-gray-400 dark:border-gray-700 items-center px-4 py-5 dark:hover:text-white dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                    <span className="text-xl mr-3">🧰</span>
                    <span className="font-medium">Home Page</span>
                </Link>
                {toolCategories.map(category => (
                    <Link 
                        key={category.id}
                        to={`/${category.id}/tools`}
                        className="flex border-b text-white hover:text-black border-gray-400 dark:border-gray-700 items-center px-4 py-5 dark:hover:text-white dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                        <span className="text-xl mr-3">{category.icon}</span>
                        <span className="font-medium">{category.name}</span>
                    </Link>
                ))}
                <Link 
                    key={"favorites-page"}
                    to="/favorites"
                    className="flex border-b text-white hover:text-black border-gray-400 dark:border-gray-700 items-center px-4 py-5 dark:hover:text-white dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                    <span className="text-xl mr-3">❤️</span>
                    <span className="font-medium">Favoite Tools</span>
                </Link>
                <Link 
                    key={"update-link"}
                    to='/update'
                    className="flex border-b text-white hover:text-black border-gray-400 dark:border-gray-700 items-center px-4 py-5 dark:hover:text-white dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                    <span className="text-xl mr-3">⬇️</span>
                    <span className="font-medium">Update</span>
                </Link>
                <button 
                    onClick={onClick} 
                    className="flex border-b w-full hover:text-black text-white hover:cursor-pointer border-gray-400 dark:border-gray-700 items-center px-4 py-5 dark:hover:text-white dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                    {theme === 'light' ? (
                        <>
                        <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12.79A9 9 0 1111.21 3a7 7 0 0010.02 9.79z" />
                        </svg>
                        <span className="ml-2 font-medium">
                            Dark
                        </span>
                        </>
                    ) : (
                        <>
                        <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m8.485-8.485h1M3.515 12.515h1m12.02-6.364l.707.707M5.757 18.243l.707.707m12.02 0l-.707.707M5.757 5.757l-.707.707M12 7a5 5 0 100 10 5 5 0 000-10z" />
                        </svg>
                        <span className="ml-2 font-medium">
                            Light
                        </span>
                        </>
                    )}
                </button>
            </nav>
        </div>
    )
}

export default SideBar;