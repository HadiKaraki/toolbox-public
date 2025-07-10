import { useState, useEffect } from 'react';
import { Button, CircularProgress, Box, Typography, useTheme } from '@mui/material';
import { CloudDownload, Update, CheckCircle, Error, RestartAlt } from '@mui/icons-material';

const UpdateManager = () => {
  const [updateInfo, setUpdateInfo] = useState<{
    available: boolean;
    version?: string;
    releaseNotes?: string;
    error?: string;
  } | null>(null);

  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const theme = useTheme();

  useEffect(() => {
    const checkUpdates = async () => {
      // Simulate API call with delay
      setTimeout(() => {
        setUpdateInfo({
          available: true,
          version: "1.2.0",
          releaseNotes: "• Added dark mode support\n• Improved performance by 30%\n• Fixed image export issues\n• Added new video filters\n• Enhanced security features"
        });
      }, 1500);
    };

    checkUpdates();

    // Simulate download progress
    if (isDownloading) {
      const interval = setInterval(() => {
        setDownloadProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 5;
        });
      }, 300);
      return () => clearInterval(interval);
    }
  }, [isDownloading]);

  const handleDownload = async () => {
    setIsDownloading(true);
  };

  const handleRestart = () => {
    // In a real app, this would trigger the update installation
    alert("Update would install and restart the application");
  };

  // Loading state
  if (!updateInfo) {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '100%',
        p: 3,
        textAlign: 'center'
      }}>
        <CircularProgress size={60} thickness={3} sx={{ mb: 3 }} />
        <Typography variant="h6" sx={{ mb: 1 }}>Checking for Updates</Typography>
        <Typography variant="body2" color="text.secondary">
          Looking for the latest version of Media Tools Pro...
        </Typography>
      </Box>
    );
  }

  // Error state
  if (updateInfo.error) {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '100%',
        p: 3,
        textAlign: 'center'
      }}>
        <Error sx={{ fontSize: 60, color: 'error.main', mb: 2 }} />
        <Typography variant="h6" sx={{ mb: 1 }}>Update Check Failed</Typography>
        <Typography variant="body1" sx={{ mb: 2, maxWidth: 400 }}>
          {updateInfo.error || "Could not connect to the update server. Please check your internet connection."}
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={() => window.location.reload()}
          sx={{ mt: 2 }}
        >
          Retry
        </Button>
      </Box>
    );
  }

  // No updates available
  if (!updateInfo.available) {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '100%',
        p: 3,
        textAlign: 'center'
      }}>
        <CheckCircle sx={{ fontSize: 60, color: 'success.main', mb: 2 }} />
        <Typography variant="h6" sx={{ mb: 1 }}>You're Up to Date</Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          Media Tools Pro is running the latest version.
        </Typography>
        <Button 
          variant="outlined" 
          color="primary" 
          onClick={() => window.location.reload()}
          sx={{ mt: 2 }}
        >
          Check Again
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      // height: '100%',
      mt: 10,
      p: 3,
      backgroundColor: theme.palette.mode === 'dark' ? '#121212' : '#f5f7ff'
    }}>
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        mb: 3,
        p: 2,
        borderRadius: 2,
        backgroundColor: theme.palette.mode === 'dark' ? '#1e1e1e' : '#ffffff',
        boxShadow: theme.shadows[1]
      }}>
        <Update sx={{ 
          fontSize: 40, 
          color: 'primary.main', 
          mr: 2 
        }} />
        <div>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Update Available
          </Typography>
          <Typography variant="body1">
            Version {updateInfo.version} is ready to download
          </Typography>
        </div>
      </Box>
      
      <Box sx={{ 
        flex: 1, 
        p: 3,
        mb: 3,
        borderRadius: 2,
        backgroundColor: theme.palette.mode === 'dark' ? '#1e1e1e' : '#ffffff',
        boxShadow: theme.shadows[1],
        overflowY: 'auto'
      }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 500 }}>
          Release Notes
        </Typography>
        <Box component="pre" sx={{ 
          fontFamily: 'inherit', 
          whiteSpace: 'pre-wrap',
          backgroundColor: theme.palette.mode === 'dark' ? '#252525' : '#f8f9ff',
          p: 2,
          borderRadius: 1,
          borderLeft: `3px solid ${theme.palette.primary.main}`
        }}>
          {updateInfo.releaseNotes}
        </Box>
      </Box>
      
      <Box sx={{ 
        p: 3,
        borderRadius: 2,
        backgroundColor: theme.palette.mode === 'dark' ? '#1e1e1e' : '#ffffff',
        boxShadow: theme.shadows[1]
      }}>
        {isDownloading ? (
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <CircularProgress 
                variant="determinate" 
                value={downloadProgress} 
                size={24} 
                thickness={6}
                sx={{ mr: 2 }} 
              />
              <Typography variant="body1">
                Downloading update...
              </Typography>
            </Box>
            
            <Box sx={{ width: '100%', height: 8, borderRadius: 4, backgroundColor: theme.palette.action.hover, mb: 2 }}>
              <Box 
                sx={{ 
                  height: '100%', 
                  borderRadius: 4, 
                  backgroundColor: 'primary.main',
                  width: `${downloadProgress}%`,
                  transition: 'width 0.3s ease'
                }} 
              />
            </Box>
            
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'right' }}>
              {Math.round(downloadProgress)}% complete
            </Typography>
          </Box>
        ) : (
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleDownload}
            startIcon={<CloudDownload />}
            fullWidth
            size="large"
            sx={{ py: 1.5, fontWeight: 600 }}
          >
            Download Update
          </Button>
        )}

        {downloadProgress >= 100 && (
          <Button
            variant="contained"
            color="success"
            onClick={handleRestart}
            startIcon={<RestartAlt />}
            fullWidth
            size="large"
            sx={{ mt: 2, py: 1.5, fontWeight: 600 }}
          >
            Restart & Install Update
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default UpdateManager;