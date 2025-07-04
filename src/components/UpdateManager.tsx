import { useState, useEffect } from 'react';
import { Button, CircularProgress, Box, Typography } from '@mui/material';

const UpdateManager = () => {
  const [updateInfo, setUpdateInfo] = useState<{
    available: boolean;
    version?: string;
    releaseNotes?: string;
    error?: string;
  } | null>(null);

  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    const checkUpdates = async () => {
      const result = await window.electronAPI.checkForUpdates();
      setUpdateInfo(result);
    };

    checkUpdates();

    window.electronAPI.onUpdateDownloadProgress((progress) => {
      setDownloadProgress(progress.percent);
    });

    return () => {
      window.electronAPI.onUpdateDownloadProgress(() => {});
    };
  }, []);

  const handleDownload = async () => {
    setIsDownloading(true);
    const result = await window.electronAPI.downloadUpdate();
    if (result.success) {
      setIsDownloading(false);
    } else {
      setUpdateInfo(prev => {
        if (!prev) {
            return { available: false, error: result.error };
        }
        return { ...prev, error: result.error };
      });
      setIsDownloading(false);
    }
  };

  if (!updateInfo) return null;

  if (updateInfo.error) {
    return <Typography color="error">Update check failed: {updateInfo.error}</Typography>;
  }

  if (!updateInfo.available) {
    return <Typography>You're using the latest version</Typography>;
  }

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6">Update Available: v{updateInfo.version}</Typography>
      {updateInfo.releaseNotes && (
        <Typography variant="body2" sx={{ my: 2 }}>
          {updateInfo.releaseNotes}
        </Typography>
      )}

      {isDownloading ? (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <CircularProgress variant="determinate" value={downloadProgress} />
          <Typography>{Math.round(downloadProgress)}% downloaded</Typography>
        </Box>
      ) : (
        <Button variant="contained" onClick={handleDownload}>
          Download Update
        </Button>
      )}

      {downloadProgress >= 100 && (
        <Button
          variant="contained"
          color="success"
          sx={{ mt: 2 }}
          onClick={() => window.electronAPI.quitAndInstall()}
        >
          Restart to Install Update
        </Button>
      )}
    </Box>
  );
};

export default UpdateManager;