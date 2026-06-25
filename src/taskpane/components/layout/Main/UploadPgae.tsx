import React, { useEffect, useState, useMemo } from 'react';
import {
  Box, Typography, Button, Divider, IconButton, Slide, FormControlLabel,
  styled, Switch, Snackbar, Alert, Paper, Avatar, alpha
} from '@mui/material';
import { 
  CloudUpload, FolderOpen, Description, Close, 
  CheckCircle, Attachment, West
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import HeaderAppBar from '../Header/HeaderAppBar';
import LoaderApp from '../../Loader/Loader';
import { useTheme } from '../../styles/TheemProvider';
import { uploadToDoccept } from '../../Services/UploadFiles';
import toast from 'react-hot-toast';
import { getFolderProperties } from '../../Services/GetFolderProperties';

// --- Modern iOS Style Switch ---
const ModernSwitch = styled(Switch)(({ }) => ({
  width: 42, height: 26, padding: 0,
  '& .MuiSwitch-switchBase': {
    padding: 0, margin: 2, transitionDuration: '300ms',
    '&.Mui-checked': {
      transform: 'translateX(16px)', color: '#fff',
      '& + .MuiSwitch-track': { backgroundColor: '#4f46e5', opacity: 1, border: 0 },
    },
  },
  '& .MuiSwitch-thumb': { boxSizing: 'border-box', width: 22, height: 22 },
  '& .MuiSwitch-track': { borderRadius: 13, backgroundColor: '#39393D', opacity: 1 },
}));

interface AppProps {
  setUploadRedy: (value: boolean) => void;
  files: File[];
  folderUuid: string;
  folderPath: string;
}

const UploadPage: React.FC<AppProps> = ({ setUploadRedy, files, folderUuid, folderPath }) => {
  const { theme } = useTheme();
  const [loader, setLoader] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const [fileName, setFileName] = useState("Email Item");
  const [onlyAttachments, setOnlyAttachments] = useState(false);

  const [snack, setSnack] = useState({
    open: false, message: '', severity: 'success' as 'success' | 'error' | 'info' | 'warning'
  });

  const isDark = theme === 'dark';
  const accentColor = '#c81355'; // Indigo

  useEffect(() => {
    const subject = Office.context.mailbox.item.subject;
    if (subject) setFileName(subject);
  }, []);

  const handleShowSnack = (msg: string, sev: 'success' | 'error' | 'warning') => {
    setSnack({ open: true, message: msg, severity: sev });
  };

const uploadAllFiles = async () => {
  setLoader(true);

  let hasError = false;
  let successCount = 0;

  try {
    const folderpermitions = await getFolderProperties(folderUuid);

    if (!folderpermitions.permissions || folderpermitions.permissions <= 1) {
      handleShowSnack("No upload permissions for this folder.", "error");
      return;
    }

    const filesToUpload = onlyAttachments
      ? files.filter(
          (f) => !(f as any).isMainEmail && !(f as any).isInline
        )
      : files;

    if (filesToUpload.length === 0) {
      handleShowSnack("No attachments found.", "warning");
      return;
    }

    for (const file of filesToUpload) {
      await new Promise<void>((resolve) => {
        let handled = false;

        uploadToDoccept(
          file,
          folderPath,
          folderUuid,
          (__data: any, err: any) => {
            console.log("Upload Callback:", {
              file: file.name,
              data: __data,
              error: err,
            });

            // Callback agar dobara fire ho to ignore
            if (handled) return;

            // Empty/intermediate callback ignore karo
            if (!err && !__data) return;

            handled = true;

            if (err) {
              hasError = true;

              const message =
                err?.message?.trim() || `Failed: ${file.name}`;

              toast.error(message);

              console.error(
                `Upload error for ${file.name}:`,
                err
              );
            } else {
              successCount++;

              toast.success(
                `Uploaded: ${file.name}`
              );
            }

            resolve();
          }
        );
      });
    }

    if (!hasError && successCount > 0) {
      setUploaded(true);
      handleShowSnack(
        "All items uploaded successfully!",
        "success"
      );
    } else if (hasError && successCount > 0) {
      handleShowSnack(
        `Uploaded ${successCount} files, but some failed.`,
        "warning"
      );
    } else {
      handleShowSnack(
        "Upload failed. Please check the errors.",
        "error"
      );
    }
  } catch (err: any) {
    console.error(err);

    handleShowSnack(
      err?.message || "An unexpected error occurred",
      "error"
    );
  } finally {
    setLoader(false);
  }
};

  return (
    <Box sx={{ 
      backgroundColor: isDark ? '#121212' : '#f4f6f9', 
      minHeight: '100vh', 
      // width: '320px', // Exact Taskpane Width
      margin: '0 auto',
      overflowX: 'hidden'
    }}>
      <HeaderAppBar Is_Login_Screen={false} />
      {loader && <LoaderApp />}

      <Box sx={{ p: 2 }}>
        <Slide in direction="up">
          <Box>
            {/* Header Info */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
              <IconButton size="small" onClick={() => setUploadRedy(false)} sx={{ color: isDark ? '#bbb' : '#666' }}>
                <West fontSize="small" />
              </IconButton>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: isDark ? '#fff' : '#1a1a1a' }}>
                Confirm Upload
              </Typography>
            </Box>

            {/* Destination Card */}
            <Paper elevation={0} sx={{ 
              p: 1.5, mb: 2.5, borderRadius: 3, 
              backgroundColor: isDark ? alpha(accentColor, 0.1) : '#fff',
              border: `1px solid ${isDark ? alpha(accentColor, 0.2) : '#e0e0e0'}`,
              display: 'flex', alignItems: 'center', gap: 1.5
            }}>
              <FolderOpen sx={{ color: accentColor }} />
              <Box sx={{ overflow: 'hidden' }}>
                <Typography variant="caption" sx={{ color: accentColor, fontWeight: 800, display: 'block', lineHeight: 1 }}>
                  DESTINATION
                </Typography>
                <Typography variant="body2" noWrap sx={{ fontWeight: 600, color: isDark ? '#eee' : '#444' }}>
                  {folderPath}
                </Typography>
              </Box>
            </Paper>

            {!uploaded ? (
              <>
                {/* File Preview Card */}
                <Paper elevation={0} sx={{ 
                  p: 3, mb: 3, borderRadius: 4, textAlign: 'center',
                  backgroundColor: isDark ? '#1e1e1e' : '#fff',
                  border: `1px solid ${isDark ? '#333' : '#eee'}`,
                }}>
                  <Avatar sx={{ 
                    bgcolor: alpha(accentColor, 0.1), width: 60, height: 60, mx: 'auto', mb: 2 
                  }}>
                    <Description sx={{ color: accentColor, fontSize: 35 }} />
                  </Avatar>
                  <Typography variant="body2" sx={{ fontWeight: 700, mb: 0.5, color: isDark ? '#fff' : '#333' }}>
                    {fileName.length > 25 ? fileName.substring(0, 22) + '...' : fileName}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                    {files.length} items total
                  </Typography>
                </Paper>

                {/* Attachments Toggle */}
                <Box sx={{ 
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
                  px: 1, py: 1, mb: 3, borderRadius: 2, bgcolor: isDark ? '#1e1e1e' : alpha(accentColor, 0.02)
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Attachment sx={{ fontSize: 20, color: accentColor }} />
                    <Typography variant="body2" sx={{ fontWeight: 600, color: isDark ? '#ccc' : '#555' }}>
                      Only Attachments
                    </Typography>
                  </Box>
                  <ModernSwitch 
                    checked={onlyAttachments} 
                    onChange={(e: any) => setOnlyAttachments(e.target.checked)} 
                  />
                </Box>

                {/* Bottom Buttons */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  <Button 
                    fullWidth variant="contained" 
                    onClick={uploadAllFiles}
                    startIcon={<CloudUpload />}
                    sx={{ 
                      borderRadius: '12px', py: 1.5, textTransform: 'none', fontWeight: 800,
                      background: `linear-gradient(135deg, ${accentColor} 0%, #c81355 100%)`,
                      boxShadow: `0 8px 20px ${alpha(accentColor, 0.3)}`
                    }}
                  >
                    Upload Now
                  </Button>
                  <Button 
                    fullWidth variant="text" 
                    onClick={() => setUploadRedy(false)}
                    sx={{ textTransform: 'none', color: 'text.secondary', fontWeight: 600 }}
                  >
                    Cancel
                  </Button>
                </Box>
              </>
            ) : (
              /* Success State */
              <Box sx={{ textAlign: 'center', py: 5 }}>
                <CheckCircle sx={{ color: '#10b981', fontSize: 70, mb: 2 }} />
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>All Set!</Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 4, px: 2 }}>
                  Successfully uploaded to Doccept.
                </Typography>
                <Button 
                  fullWidth variant="outlined" 
                  onClick={() => setUploadRedy(false)}
                  sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 700 ,color: accentColor, borderColor: accentColor}}
                >
                  Return to Folders
                </Button>
              </Box>
            )}
          </Box>
        </Slide>
      </Box>

      {/* Snackbar */}
      <Snackbar
        open={snack.open}
        autoHideDuration={4000}
        onClose={() => setSnack({ ...snack, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          severity={snack.severity} 
          variant="filled" 
          sx={{ width: '100%', borderRadius: '10px', fontSize: '0.8rem' }}
        >
          {snack.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default UploadPage;