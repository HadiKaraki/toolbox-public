import { useCallback, useState } from 'react';
import MobileNavLink from './MobileNavLink';
import NavLink from './NavLink';
import { useSelector, useDispatch } from 'react-redux';
import { toggleTheme } from '../redux/slices/themeSlice';
import { useLayoutEffect } from 'react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const theme = useSelector((state: { theme: { mode: any; }; }) => state.theme.mode);
  const dispatch = useDispatch();

  useLayoutEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme])

  const onClick = useCallback(() => {
    dispatch(toggleTheme());
  }, [dispatch]);

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg dark:from-gray-900 dark:to-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <NavLink to="/">
                <span className="text-white font-bold text-xl flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 10h16v8a2 2 0 01-2 2H6a2 2 0 01-2-2v-8z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 10V6h6v4" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14h4" />
                </svg>
                  ToolBox Pro
                </span>
              </NavLink>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:block ml-10">
              
            </div>
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:block">
            <div className="flex space-x-4">
                <NavLink to="/image/tools" icon="image">
                  Images
                </NavLink>
                <NavLink to="/video/tools" icon="video">
                  Videos
                </NavLink>
                <NavLink to="/audio/tools" icon="audio">
                  Audios
                </NavLink>
                <NavLink to="/update">
                  Update
                </NavLink>
                <NavLink to="/download">
                  Download
                </NavLink>
                {/* <NavLink to="/more/tools" icon="dots">
                  More Tools
                </NavLink> */}
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
              </div>
            {/* <button className="bg-white text-blue-600 px-4 py-1 rounded-md text-sm font-medium hover:bg-gray-100 transition-all duration-200">
              Upgrade
            </button> */}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-white hover:text-white hover:bg-blue-700 focus:outline-none transition duration-150 ease-in-out"
            >
              <svg
                className={`${isOpen ? 'hidden' : 'block'} h-6 w-6`}
                stroke="currentColor"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
              <svg
                className={`${isOpen ? 'block' : 'hidden'} h-6 w-6`}
                stroke="currentColor"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className={`${isOpen ? 'block' : 'hidden'} md:hidden`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          <MobileNavLink to="/image/tools" icon="image">
            Images
          </MobileNavLink>
          <MobileNavLink to="/video/tools" icon="video">
            Videos
          </MobileNavLink>
          <MobileNavLink to="/audio/tools" icon="audio">
            Audios
          </MobileNavLink>
          <button onClick={onClick} className="text-white hover:bg-blue-700 hover:cursor-pointer px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center">
            {theme === 'light' ? (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m8.485-8.485h1M3.515 12.515h1m12.02-6.364l.707.707M5.757 18.243l.707.707m12.02 0l-.707.707M5.757 5.757l-.707.707M12 7a5 5 0 100 10 5 5 0 000-10z" />
                </svg>
                <span className='ml-3'>Light</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12.79A9 9 0 1111.21 3a7 7 0 0010.02 9.79z" />
                </svg>
                <span className='ml-3'>Dark</span>
              </>
            )}
          </button>
          {/* <MobileNavLink to="/more/tools" icon="dots">
            More Tools
          </MobileNavLink> */}
          {/* <div className="mt-4 pt-4 border-t border-blue-500">
            <button className="block w-full text-left bg-white text-blue-600 px-3 py-2 rounded-md text-base font-medium">
              Upgrade
            </button>
          </div> */}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;