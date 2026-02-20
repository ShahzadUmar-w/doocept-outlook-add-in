import React, { useEffect, useState, useMemo } from 'react';
import {
  Box, Typography, Button, Divider, Dialog, DialogActions,
  DialogContent, DialogTitle, IconButton, Slide, FormControlLabel,
  styled, Switch, Snackbar, Alert, Container
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import HeaderAppBar from '../Header/HeaderAppBar';
import LoaderApp from '../../Loader/Loader';
import { useTheme } from '../../styles/TheemProvider';
import { uploadToDoccept } from '../../Services/UploadFiles';
import toast from 'react-hot-toast';
import { getFolderProperties } from '../../Services/GetFolderProperties';

interface AppProps {
  setUploadRedy: (value: boolean) => void;
  files: File[];
  folderUuid: string;
  folderPath: string;
}

const UploadPage: React.FC<AppProps> = ({ setUploadRedy, files, folderUuid, folderPath }) => {
  const { theme } = useTheme();
  const navigate = useNavigate();

  // --- States ---
  const [loader, setLoader] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const [fileName, setFileName] = useState("Email Item");
  const [onlyAttachments, setOnlyAttachments] = useState(false);

  // Toast State
  const [snack, setSnack] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info' | 'warning'
  });

  // --- Theme Configuration ---
  const themeStyles = useMemo(() => {
    const isDark = theme === 'dark';
    const isGray = theme === 'lightgray';
    return {
      bg: isDark ? '#303030' : isGray ? '#F0F0F0' : '#FFFFFF',
      text: isDark ? '#FFFFFF' : '#424242',
      cardBg: isDark ? '#424242' : '#FFFFFF',
      shadow: isDark ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.1)',
    };
  }, [theme]);

  useEffect(() => {
    const subject = Office.context.mailbox.item.subject;
    if (subject) setFileName(subject);
  }, []);

  // --- Core Logic ---

  const handleShowSnack = (msg: string, sev: 'success' | 'error' | 'warning') => {
    setSnack({ open: true, message: msg, severity: sev });
  };

  const uploadAllFiles = async () => {
    setLoader(true);
    try {
      // Loop through files and upload
      const folderpermitions=await getFolderProperties(folderUuid)
      // console.log("folderpermitions",folderpermitions)
      // console.log("folderpermitions.permissions",folderpermitions.permissions)

      if(folderpermitions.permissions && folderpermitions.permissions>1){
  for (const file of files) {
        await uploadToDoccept(file, folderPath, folderUuid , (data,err)=>{
if(data ){
toast.success(`Uploaded: ${file.name}`);
}
if(err ){
toast.error(`Upload failed: ${file.name}` + (err.message ? ` - ${err.message}` : ''));
}

        });
      }
      }else{
      handleShowSnack("You dont have permitions to upload these files to this folder", "error");
      }
    
      
      setUploaded(true);
      handleShowSnack("All items uploaded successfully! 🚀", "success");
    } catch (err: any) {
      console.error("Upload process error:", err);
      // 'err.message' ab hamari service se clean XML error laayega
      handleShowSnack(err.message || "Server Error", "error");
    } finally {
      setLoader(false);
    }
  };

  const truncateFileName = (name: string, len = 30) => 
    name.length > len ? name.substring(0, len) + "..." : name;

  return (
    <Box sx={{ backgroundColor: themeStyles.bg, color: themeStyles.text, minHeight: '100vh' }}>
      <HeaderAppBar Is_Login_Screen={false} />
      {loader && <LoaderApp />}

      <Container maxWidth="xs" sx={{ pt: 4 }}>
        <Slide in direction="up">
          <Box sx={{
            p: 3,
            borderRadius: 4,
            backgroundColor: themeStyles.cardBg,
            boxShadow: `0 8px 32px ${themeStyles.shadow}`,
            textAlign: 'center'
          }}>
            <Typography variant="h5" sx={{ fontWeight: 800, mb: 2 }}>Upload to Doccept</Typography>
            
            <Typography variant="body2" sx={{ mb: 3, opacity: 0.8 }}>
              Uploading to: <b>{folderPath}</b>
            </Typography>

            <Divider />

            {/* File Preview */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', my: 3, gap: 2 }}>
              <img src={require('../../../../../assets/Outlook.png')} alt="icon" style={{ width: 45 }} />
              <Typography sx={{ fontWeight: 'bold' }}>
                {truncateFileName(fileName)}
              </Typography>
            </Box>

            {uploaded ? (
              <Box sx={{ mt: 2, p: 2, bgcolor: '#f7f7f7', borderRadius: 2 }}>
                <Button fullWidth variant="contained" sx={{ mt: 2 }} onClick={() => setUploadRedy(false)}>
                  Back to Folders
                </Button>
              </Box>
            ) : (
              <>
                <FormControlLabel
                  control={<MaterialUISwitch checked={onlyAttachments} onChange={(e) => setOnlyAttachments(e.target.checked)} />}
                  label="Attachments Only"
                  sx={{ my: 2 }}
                />

                <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                  <Button 
                    fullWidth 
                    variant="outlined" 
                    onClick={() => setUploadRedy(false)}
                    sx={{ borderRadius: '12px', textTransform: 'none' }}
                  >
                    Cancel
                  </Button>
                  <Button 
                    fullWidth 
                    variant="contained" 
                    onClick={uploadAllFiles}
                    sx={{ 
                      borderRadius: '12px', 
                      textTransform: 'none',
                      background: 'linear-gradient(45deg, #ff416c, #ff4b2b)',
                      fontWeight: 'bold'
                    }}
                  >
                    Upload Now
                  </Button>
                </Box>
              </>
            )}
          </Box>
        </Slide>
      </Container>

      {/* Modern MUI Toast */}
      <Snackbar
        open={snack.open}
        autoHideDuration={6000}
        onClose={() => setSnack({ ...snack, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
            severity={snack.severity} 
            variant="filled" 
            onClose={() => setSnack({ ...snack, open: false })}
            sx={{ width: '100%', borderRadius: '10px' }}
        >
          {snack.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

// --- Custom Styled Components ---

const MaterialUISwitch = styled(Switch)(({ }) => ({
  width: 62, height: 34, padding: 7,
  '& .MuiSwitch-switchBase': {
    margin: 1, padding: 0, transform: 'translateX(6px)',
    '&.Mui-checked': {
      color: '#fff', transform: 'translateX(22px)',
      '& + .MuiSwitch-track': { opacity: 1, backgroundColor: '#aab4be' },
    },
  },
  '& .MuiSwitch-thumb': {
    backgroundColor: '#007fff', width: 32, height: 32,
  },
  '& .MuiSwitch-track': { opacity: 1, backgroundColor: '#aab4be', borderRadius: 20 },
}));

export default UploadPage;