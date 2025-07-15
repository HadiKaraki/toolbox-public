import { Link } from "react-router-dom";

interface DataTypes {
    title: string,
    description: string
}

const BackToAudioTools = ({title, description}: DataTypes) => {
    return (
        <div className="mb-8">
            <Link 
                to="/audio/tools" 
                className="inline-flex text-xl items-center dark:text-cyan-600 text-blue-600 hover:text-blue-800 transition-colors"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
                Back to Audio Tools
            </Link>
            <h1 className="text-3xl font-bold mt-2 text-gray-800 dark:text-white">{title}</h1>
            <p className="text-gray-600 mt-1 dark:text-gray-400">{description}</p>
        </div>
    )
}

export default BackToAudioTools;