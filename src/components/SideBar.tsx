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
        <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <Link to={"/"} className="text-xl dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors font-semibold flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 10h16v8a2 2 0 01-2 2H6a2 2 0 01-2-2v-8z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 10V6h6v4" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14h4" />
                    </svg>
                    Media Tools
                </Link>
            </div>
            <nav className="py-4">
                <Link 
                    key={"home-page"}
                    to="/"
                    className="flex items-center px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                    <span className="text-xl mr-3">🧰</span>
                    <span className="font-medium">Home Page</span>
                </Link>
                {toolCategories.map(category => (
                <Link 
                    key={category.id}
                    to={`/${category.id}/tools`}
                    className="flex items-center px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                    <span className="text-xl mr-3">{category.icon}</span>
                    <span className="font-medium">{category.name}</span>
                </Link>
                ))}
                <Link 
                    key={"favorites-page"}
                    to="/favorites"
                    className="flex items-center px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                    <span className="text-xl mr-3">❤️</span>
                    <span className="font-medium">Favoite Tools</span>
                </Link>
                <Link 
                    key={"update-link"}
                    to='/update'
                    className="flex items-center px-4 py-3 font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                    <span className="text-xl mr-3">⬇️</span>
                    <span className="font-medium">Update</span>
                </Link>
                <button onClick={onClick} className="text-white hover:bg-blue-700 hover:cursor-pointer px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center">
                  {theme === 'light' ? (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m8.485-8.485h1M3.515 12.515h1m12.02-6.364l.707.707M5.757 18.243l.707.707m12.02 0l-.707.707M5.757 5.757l-.707.707M12 7a5 5 0 100 10 5 5 0 000-10z" />
                      </svg>
                      <span className='ml-2'>Light</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12.79A9 9 0 1111.21 3a7 7 0 0010.02 9.79z" />
                      </svg>
                      <span className='ml-2'>Dark</span>
                    </>
                  )}
                </button>
            </nav>
        </div>
    )
}

export default SideBar;