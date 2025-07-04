import { useState, useRef, useEffect } from "react";
import { useImageContext } from '../../contexts/ImageContext';
import { Link } from "react-router-dom";
import { handleUploadWatermark } from '../../utils/images/handleUploadWatermark';

export default function WatermarkImage() {
    const { imageFile, setImageFile } = useImageContext();
    const [image2File, setImage2File] = useState(null);
    const canvasRef1 = useRef(null);
    const canvasRef2 = useRef(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState(null);

    const handleImage1FileChange = (e) => {
        setError(null);
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (!file.type.startsWith('image/')) {
                setError('Please select an image file (JPEG, PNG)');
                return;
            }
            setImageFile(file);
        }
    };

    const handleImage2FileChange = (e) => {
        setError(null);
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (!file.type.startsWith('image/')) {
                setError('Please select an image file (JPEG, PNG)');
                return;
            }
            setImage2File(file);
        }
    };

    useEffect(() => {
        if (!imageFile || !canvasRef1.current) return;

        const img = new Image();
        const url = URL.createObjectURL(imageFile);
        img.src = url;

        img.onload = () => {
            const canvas = canvasRef1.current;
            const ctx = canvas.getContext('2d');
            
            const maxWidth = 800;
            const maxHeight = 600;
            let width = img.width;
            let height = img.height;

            if (width > maxWidth) {
                height = (maxWidth / width) * height;
                width = maxWidth;
            }
            if (height > maxHeight) {
                width = (maxHeight / height) * width;
                height = maxHeight;
            }

            canvas.width = width;
            canvas.height = height;
            ctx.drawImage(img, 0, 0, width, height);
        };

        return () => {
            URL.revokeObjectURL(url);
        };
    }, [imageFile]);

    useEffect(() => {
        if (!imageFile || !canvasRef2.current) return;

        const img = new Image();
        const url = URL.createObjectURL(imageFile);
        img.src = url;

        img.onload = () => {
            const canvas = canvasRef2.current;
            const ctx = canvas.getContext('2d');
            
            const maxWidth = 800;
            const maxHeight = 600;
            let width = img.width;
            let height = img.height;

            if (width > maxWidth) {
                height = (maxWidth / width) * height;
                width = maxWidth;
            }
            if (height > maxHeight) {
                width = (maxHeight / height) * width;
                height = maxHeight;
            }

            canvas.width = width;
            canvas.height = height;
            ctx.drawImage(img, 0, 0, width, height);
        };

        return () => {
            URL.revokeObjectURL(url);
        };
    }, [image2File]);

    const handleRemoveImage = () => {
        setImageFile(null);
        if (canvasRef1.current) {
            const ctx = canvasRef1.current.getContext('2d');
            ctx.clearRect(0, 0, canvasRef1.current.width, canvasRef1.current.height);
        }
    };

    const handleRemoveWatermark = () => {
        setImage2File(null);
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            {/* Header Section */}
            <div className="mb-8">
                <Link 
                    to="/image/tools" 
                    className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                    </svg>
                    Back to Image Tools
                </Link>
                <h1 className="text-3xl font-bold mt-2 text-gray-800">Add Watermark to Image</h1>
                {error && <div className="mt-2 text-red-600">{error}</div>}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Image Upload Section */}
                <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                    <h2 className="text-xl font-semibold mb-4 text-gray-700">Upload Image</h2>
                    
                    {!imageFile ? (
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer">
                            <label className="flex flex-col items-center justify-center space-y-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <span className="text-gray-600">Click to upload or drag and drop</span>
                                <span className="text-sm text-gray-500">JPG, PNG up to 10MB</span>
                                <input 
                                    type="file" 
                                    accept="image/*" 
                                    onChange={handleImage1FileChange} 
                                    className="hidden" 
                                />
                            </label>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="relative bg-gray-100 rounded-lg overflow-hidden flex justify-center items-center">
                                <canvas 
                                    ref={canvasRef1} 
                                    className="max-w-full max-h-96 object-contain"
                                />
                            </div>
                            
                            <div className="flex justify-between">
                                <button
                                    onClick={handleRemoveImage}
                                    className="text-red-600 hover:text-red-800 flex items-center text-sm font-medium"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                    Remove Image
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Watermark Upload Section */}
                <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                    <h2 className="text-xl font-semibold mb-4 text-gray-700">Add Watermark</h2>
                    
                    <div className="space-y-6">
                        <div>
                            {!image2File ? (
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer">
                                    <label className="flex flex-col items-center justify-center space-y-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        <span className="text-gray-600">Click to upload or drag and drop</span>
                                        <span className="text-sm text-gray-500">JPG, PNG up to 10MB</span>
                                        <input 
                                            type="file" 
                                            accept="image/*" 
                                            onChange={handleImage2FileChange} 
                                            className="hidden" 
                                        />
                                    </label>
                                </div>
                            ) : (
                            <div className="space-y-4">
                                <div className="relative bg-gray-100 rounded-lg overflow-hidden flex justify-center items-center">
                                    <canvas 
                                        ref={canvasRef2} 
                                        className="max-w-full max-h-96 object-contain"
                                    />
                                </div>
                                
                                <div className="flex justify-between">
                                    <button
                                        onClick={handleRemoveWatermark}
                                        className="text-red-600 hover:text-red-800 flex items-center text-sm font-medium"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                        Remove Watermark
                                    </button>
                                </div>
                            </div>
                            )}
                        </div>

                        <div className="pt-4 border-t border-gray-200">
                            <button
                                onClick={() => handleUploadWatermark(imageFile, image2File, setIsProcessing, setError)}
                                disabled={!imageFile || !image2File || isProcessing}
                                className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors ${
                                    (!imageFile || !image2File || isProcessing) ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                            >
                                {isProcessing ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="-ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                        </svg>
                                        Add Watermark & Download
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}