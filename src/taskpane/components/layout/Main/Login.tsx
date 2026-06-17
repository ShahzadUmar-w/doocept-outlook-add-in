// export default Login;
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prettier/prettier */
/* eslint-disable no-undef */
import React, { useState, useEffect, useCallback } from 'react';
import {
  TextField,
  Button,
  Box,
  Container,
  Checkbox,
  FormControlLabel,
  Slide,
  Zoom,
  Snackbar,
  Alert,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import LoaderApp from '../../Loader/Loader';
import { useTheme } from '../../styles/TheemProvider';
import HeaderAppBar from '../Header/HeaderAppBar';
import toast from 'react-hot-toast';

const Login = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [savePassword, setSavePassword] = useState(false);
  const [loader, setLoader] = useState(false);
  const [AccessLink, setAccessLink] = useState('');
  const { theme } = useTheme();

  const [snack, setSnack] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error" | "warning" | "info",
  });

  // --- Core Login Function (Used by both Manual and Auto Login) ---
  const performLogin = useCallback(async (uId: string, pass: string, link: string, isAuto: boolean) => {
    // If auto-logging in, don't show success snackbar to keep it seamless
    setLoader(true);
    try {
      const credentials = btoa(`${uId}:${pass}`);
      const loginHeaders = { Authorization: `Basic ${credentials}` };

      // Keeping your OPTIONS method as requested
      const loginResponse = await fetch(
        `${link}/doccept/services/login/loginService/login`,
        {
          method: "OPTIONS", 
          headers: loginHeaders,
          credentials: "include",
        }
      );

      if (!loginResponse.ok) {
        if (loginResponse.status === 401) throw new Error("Invalid username or password");
        throw new Error(`Login failed: ${loginResponse.status}`);
      }

      if (!isAuto) {
        toast.success( "Login successful " );
      }

      // Move to Home
      setTimeout(() => {
        navigate("/home");
      }, isAuto ? 100 : 800);

    } catch (err: any) {
      console.error("Login Error:", err);
      // If auto-login fails (e.g. password changed), show the login form
      if (!isAuto) {
        setSnack({ open: true, message: err.message || "Login failed", severity: "error" });
      }
    } finally {
      setLoader(false);
    }
  }, [navigate]);

  // --- 1. LOAD DATA & TRIGGER AUTO-LOGIN ---
  useEffect(() => {
    const savedUserId = localStorage.getItem('userId');
    const savedPass = localStorage.getItem('pass');
    const AccessLinkStored = localStorage.getItem('AccessLink');
    const rememberMe = localStorage.getItem('rememberMe') === 'true';

    if (AccessLinkStored) setAccessLink(AccessLinkStored);
    
    if (rememberMe && savedUserId && savedPass && AccessLinkStored) {
      setUserId(savedUserId);
      setPassword(savedPass);
      setSavePassword(true);
      
      // TRIGGER AUTO LOGIN:
      performLogin(savedUserId, savedPass, AccessLinkStored, true);
    }
  }, [performLogin]);

  // --- 2. MANUAL LOGIN HANDLER ---
  const handleManualLogin = () => {
    if (!userId || !password || !AccessLink) {
        setSnack({ open: true, message: "Please fill all fields", severity: "warning" });
        return;
    }
 sessionStorage.setItem("userId", userId);
  sessionStorage.setItem("pass", password);
  sessionStorage.setItem("AccessLink", AccessLink);
    // Save/Clear credentials logic
    if (savePassword) {
      localStorage.setItem("userId", userId);
      localStorage.setItem("pass", password);
      localStorage.setItem("AccessLink", AccessLink);
      localStorage.setItem("rememberMe", "true");
    } else {
      localStorage.setItem("rememberMe", "false");
      localStorage.removeItem("pass"); // Security: don't keep pass if not requested
    }

    performLogin(userId, password, AccessLink, false);
  };

  const getBackgroundColor = () => (theme === 'dark' ? '#303030' : theme === 'lightgray' ? '#F0F0F0' : '#FFFFFF');
  const getTextColor = () => (theme === 'dark' ? '#FFFFFF' : theme === 'lightgray' ? '#424242' : '#000000');

  return (
    <>
      <HeaderAppBar Is_Login_Screen={true} />
      <Container maxWidth="xs" sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '92vh', backgroundColor: getBackgroundColor() }}>
        {loader && <LoaderApp />}

        <Zoom in style={{ transitionDelay: '100ms' }}>
          <Box sx={{ marginBottom: 4 }}>
            <img src={require(`../../../../../assets/${theme === 'dark' ? 'DarkTheemeLogo.png' : 'LightTheemeLogo.png'}`)} alt="Logo" style={{ width: '150px' }} />
          </Box>
        </Zoom>

        <Slide direction="up" in style={{ transitionDelay: '200ms' }}>
          <Box component="form" sx={{ width: '100%' }}>
             <TextField
              label="Access Link"
              fullWidth
              variant="standard"
              value={AccessLink}
              onChange={(e) => setAccessLink(e.target.value)}
              sx={{ mb: 2 }}
              InputProps={{ style: { color: getTextColor() } }}
              InputLabelProps={{ style: { color: getTextColor() } }}
            />

            <TextField
              label="User ID"
              fullWidth
              variant="standard"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              sx={{ mb: 2 }}
              InputProps={{ style: { color: getTextColor() } }}
              InputLabelProps={{ style: { color: getTextColor() } }}
            />

            <TextField
              label="Password"
              type="password"
              fullWidth
              variant="standard"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              sx={{ mb: 2 }}
              InputProps={{ style: { color: getTextColor() } }}
              InputLabelProps={{ style: { color: getTextColor() } }}
            />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={savePassword}
                    onChange={(e) => setSavePassword(e.target.checked)}
                    sx={{ color: getTextColor(), '&.Mui-checked': { color: '#ec1764' } }}
                  />
                }
                label="Save Password"
                sx={{ color: getTextColor() }}
              />
            </Box>

            <Button
              variant="contained"
              fullWidth
              size="large"
              onClick={handleManualLogin}
              sx={{ borderRadius: '30px', background: '#ec1764', color: '#fff', py: 1.5, textTransform: 'none' }}
              disabled={loader}
            >
              {loader ? "Authenticating..." : "Sign In"}
            </Button>
          </Box>
        </Slide>

        <Snackbar open={snack.open} autoHideDuration={3000} onClose={() => setSnack({ ...snack, open: false })}>
          <Alert severity={snack.severity} sx={{ width: "100%" }}>{snack.message}</Alert>
        </Snackbar>
      </Container>
    </>
  );
};

export default Login;