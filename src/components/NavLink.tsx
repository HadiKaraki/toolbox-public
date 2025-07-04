import { Link } from "react-router-dom";
import { ReactNode } from "react";

type IconType = "image" | "video" | "audio" | "dots" | null;

interface NavLinkProps {
  to: string;
  icon?: IconType;
  children: ReactNode;
}

const NavLink = ({ to, icon = null, children }: NavLinkProps) => {
    const icons: Record<Exclude<IconType, null>, JSX.Element> = {
      image: (
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      video: (
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      ),
      audio: (
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l-4 4H3v4h2l4 4zm7.5-7a3.5 3.5 0 010 7m0-14a3.5 3.5 0 010 7" />
        </svg>
      ),
      dots: (
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
        </svg>
      )
    };
  
    return (
      <Link
        to={to}
        className="text-white hover:bg-blue-700 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center"
      >
        {icon && icons[icon]}
        {children}
      </Link>
    );
};

export default NavLink;