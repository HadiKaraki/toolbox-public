import { useState, useEffect } from 'react';
import { DownloadCloud, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';

interface UpdateInfo {
  available: boolean;
  version?: string;
  releaseNotes?: string;
  error?: string;
  isLatest?: boolean;
}

interface DownloadProgress {
  percent: number;
}

const sanitizeHTML = (html: string) => {
  return html.replace(/<script.*?>.*?<\/script>/gi, '');
};

const UpdateManager = () => {
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
  const [isChecking, setIsChecking] = useState<boolean>(true);
  const [downloadProgress, setDownloadProgress] = useState<number>(0);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);

  useEffect(() => {
    const checkUpdates = async () => {
      setIsChecking(true);
      setUpdateInfo(null);
      try {
        const result = await window.electronAPI.checkForUpdates();
        console.log(result)
        setUpdateInfo(result);
      } catch (error) {
        setUpdateInfo({
          available: false,
          error: error instanceof Error ? error.message : 'Failed to check for updates',
          isLatest: true
        });
      } finally {
        setIsChecking(false);
      }
    };

    checkUpdates();

    const progressHandler = (progress: DownloadProgress) => {
      setDownloadProgress(progress.percent);
    };

    const downloadedHandler = (info: UpdateInfo) => {
      setUpdateInfo(prev => ({
        ...prev,
        available: false,
        isLatest: true,
        version: info.version
      }));
    };

    const errorHandler = (error: UpdateError) => {
      setUpdateInfo(prev => ({
        ...prev,
        available: false,
        error: error.message,
        isLatest: true
      }));
    };

    // Setup listeners
    window.electronAPI.onUpdateDownloadProgress(progressHandler);
    window.electronAPI.onUpdateDownloaded(downloadedHandler);
    window.electronAPI.onUpdateError(errorHandler);

    return () => {
      // Cleanup listeners
      window.electronAPI.removeUpdateListeners();
    };
  }, []);

  const handleDownload = async () => {
    setIsDownloading(true);
    setIsChecking(false);
    try {
      const result = await window.electronAPI.downloadUpdate();
      if (!result.success) {
        throw new Error(result.error || 'Download failed');
      }
    } catch (error) {
      setUpdateInfo(prev => ({
        ...prev,
        available: false,
        error: error instanceof Error ? error.message : 'Download failed',
        isLatest: true
      } as UpdateInfo));
    } finally {
      setIsDownloading(false);
    }
  };

  const renderReleaseNotes = (notes?: string) => {
    if (!notes) return "No release notes available.";
    const sanitized = sanitizeHTML(notes);
    return <div dangerouslySetInnerHTML={{ __html: sanitized }} />;
  };

  // Loading state
  if (isChecking) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mb-6"></div>
        <h2 className="text-2xl font-semibold mb-2 text-gray-900 dark:text-white">
          Checking for Updates
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Looking for the latest version of Media Tools Pro...
        </p>
      </div>
    );
  }

  // Error state - but check if it's actually just "already up to date"
  if (updateInfo && updateInfo.error && !isChecking) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <AlertCircle className="w-16 h-16 text-red-500 mb-6" />
        <h2 className="text-2xl font-semibold mb-2 text-gray-900 dark:text-white">
          Update Check Failed
        </h2>
        <p className="text-gray-700 dark:text-gray-300 max-w-md mb-6">
          {updateInfo.error}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  // No updates available or already latest version
  if (!isChecking && updateInfo && (!updateInfo.available || updateInfo.isLatest)) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <CheckCircle2 className="w-16 h-16 text-green-500 mb-6" />
        <h2 className="text-2xl font-semibold mb-2 text-gray-900 dark:text-white">
          You're Up to Date
        </h2>
        <p className="text-gray-700 dark:text-gray-300 mb-6">
          Media Tools Pro is running the latest version.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2 border border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
        >
          Check Again
        </button>
      </div>
    );
  }

  // Update available
  if (updateInfo && updateInfo.available && !updateInfo.isLatest) {
    return (
      <div className="min-w-2xl max-w-2xl mt-34 mx-auto p-6">
        <div className="flex items-start gap-4 p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm mb-6">
          <RefreshCw className="w-10 h-10 text-blue-500 mt-1 flex-shrink-0" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              Update Available
            </h1>
            <p className="text-lg text-black dark:text-gray-300">
              Version {updateInfo.version} is ready to download
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Release Notes
          </h2>
          <div className="bg-gray-50 dark:bg-gray-700/50 p-4 text-black dark:text-gray-300 rounded-lg border-l-4 border-blue-500 overflow-auto prose dark:prose-invert max-w-none">
            {renderReleaseNotes(updateInfo.releaseNotes)}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          {isDownloading ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="relative w-6 h-6">
                  <div className="absolute inset-0 rounded-full border-2 border-blue-200"></div>
                  <div 
                    className="absolute inset-0 rounded-full border-2 border-blue-500 border-t-transparent"
                    style={{ transform: `rotate(${downloadProgress * 3.6}deg)` }}
                  ></div>
                </div>
                <span className="text-gray-700 dark:text-gray-300">Downloading update...</span>
              </div>

              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full" 
                  style={{ width: `${downloadProgress}%` }}
                ></div>
              </div>

              <p className="text-right text-sm text-gray-500 dark:text-gray-400">
                {Math.round(downloadProgress)}% complete
              </p>
            </div>
          ) : (
            <button
              onClick={handleDownload}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
              disabled={isDownloading}
            >
              <DownloadCloud className="w-5 h-5" />
              Download Update
            </button>
          )}
        </div>
      </div>
    );
  }
};

export default UpdateManager;