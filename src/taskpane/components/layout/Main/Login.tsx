// /* eslint-disable @typescript-eslint/no-unused-vars */
// /* eslint-disable prettier/prettier */
// /* eslint-disable no-undef */
// import React, { useState, useEffect } from 'react';
// import {
//   TextField,
//   Button,
//   Box,
//   Container,
//   Link,
//   Checkbox,
//   FormControlLabel,
//   Slide,
//   Zoom,
//   Snackbar,
//   Alert,
// } from '@mui/material';
// import { useNavigate } from 'react-router-dom';
// import LoaderApp from '../../Loader/Loader';
// import { useTheme } from '../../styles/TheemProvider';
// import HeaderAppBar from '../Header/HeaderAppBar';

// const Login = () => {
//   const navigate = useNavigate();
//   // ✅ accessLink state remove kar di gayi hai
//   const [userId, setUserId] = useState('');
//   const [password, setPassword] = useState('');
//   const [savePassword, setSavePassword] = useState(false);
//   const [loader, setLoader] = useState(false);
//   const [Is_Login_Screen, setIs_Login_Screen] = useState(true);
//   const [AccessLink, setAccessLink] = useState('');

//   const { theme } = useTheme();

//   const [snack, setSnack] = useState({
//     open: false,
//     message: "",
//     severity: "success" as "success" | "error" | "warning" | "info",
//   });

//   // ✅ Load saved credentials on mount (accessLink hata diya gaya)
//   useEffect(() => {
//     const savedUserId = localStorage.getItem('userId');
//     const savedPass = localStorage.getItem('pass');
//     const AccessLinkStored = localStorage.getItem('AccessLink');

//     if (savedUserId) setUserId(savedUserId);
//     if (AccessLinkStored) setAccessLink(AccessLinkStored);
//     if (savedPass) {
//         setPassword(savedPass);
//         setSavePassword(true); // Agar data mil jaye toh checkbox tick kar dein
//     }
//   }, []);

//    useEffect(() => {
//     localStorage.setItem('AccessLink', AccessLink);
//   }, [AccessLink]);

//   const handleLogin = async () => {
//     if (!userId || !password) {
//         setSnack({ open: true, message: "Please fill all fields", severity: "warning" });
//         return;
//     }
//     setLoader(true);

//     try {
//       const myHeaders = new Headers();
//       myHeaders.append("Content-Type", "application/json");

//       const raw = JSON.stringify({
//         username: userId,
//         password: password,
//       });

//       // 1. AUTH CALL (OPTIONS check)
//       await fetch(
//         `${AccessLink}/doccept/services/login/loginService/onAuthSuccess`,
//         {
//           method: "OPTIONS",
//           headers: myHeaders,
//           body: raw,
//           credentials: "include",
//         }
//       );

//       // 2. BASIC AUTH LOGIN
//       const credentials = btoa(`${userId}:${password}`);
      // const loginHeaders = {
      //   Authorization: `Basic ${credentials}`,
      // };

//       // NOTE: Agar "OPTIONS" se login nahi ho raha, toh yahan "POST" try karein
//       const loginResponse = await fetch(
//         `${AccessLink}/doccept/services/login/loginService/login`,
//         {
//           method: "OPTIONS", 
//           headers: loginHeaders,
//           credentials: "include",
//         }
//       );

//       if (!loginResponse.ok) {
//         if (loginResponse.status === 401) throw new Error("Invalid username or password");
//         throw new Error(`Login failed: ${loginResponse.status}`);
//       }
//   localStorage.setItem("userId", userId);
//         localStorage.setItem("pass", password);
//       // ✅ SUCCESS: Data Save Logic
//       if (savePassword) {
//         localStorage.setItem("userId", userId);
//         localStorage.setItem("pass", password);
//       } else {
//           localStorage.setItem("userId", userId);
//         localStorage.setItem("pass", password);
//       }

//       setSnack({
//         open: true,
//         message: "Login successful 🚀",
//         severity: "success",
//       });

//       setTimeout(() => {
//         navigate("/home");
//       }, 800);

//     } catch (err: any) {
//       console.error("Login Error:", err);
//       setSnack({
//         open: true,
//         message: err.message || "Login failed",
//         severity: "error",
//       });
//     } finally {
//       setLoader(false);
//     }
//   };

//   // Theme helpers
//   const getBackgroundColor = () => (theme === 'dark' ? '#303030' : theme === 'lightgray' ? '#F0F0F0' : '#FFFFFF');
//   const getTextColor = () => (theme === 'dark' ? '#FFFFFF' : theme === 'lightgray' ? '#424242' : '#000000');
//   const getTextFieldBackgroundColor = () => (theme === 'dark' ? '#424242' : '#FFFFFF');
//   const getTextFieldBorderColor = () => (theme === 'dark' ? '#616161' : '#BDBDBD');

//   return (
//     <>
//       <HeaderAppBar Is_Login_Screen={Is_Login_Screen} />
//       <Container
//         maxWidth="xs"
//         sx={{
//           display: 'flex',
//           flexDirection: 'column',
//           alignItems: 'center',
//           justifyContent: 'center',
//           height: '92vh',
//           backgroundColor: getBackgroundColor(),
//           color: getTextColor(),
//         }}
//       >
//         {loader && <LoaderApp />}

//         <Zoom in style={{ transitionDelay: '100ms' }}>
//           <Box sx={{ marginBottom: 4, textAlign: 'center' }}>
//             <img
//               src={require(`../../../../../assets/${theme === 'dark' ? 'DarkTheemeLogo.png' : 'LightTheemeLogo.png'}`)}
//               alt="Logo"
//               style={{ width: '150px', height: 'auto' }}
//             />
//           </Box>
//         </Zoom>

//         <Slide direction="up" in style={{ transitionDelay: '200ms' }}>
//           <Box component="form" noValidate sx={{ width: '100%' }}>
//             {/* ✅ Link wala TextField remove kar diya gaya hai */}
//              <TextField
//               label="Access Link"
//               fullWidth
//               variant="standard"
//               value={AccessLink}
//               onChange={(e) => setAccessLink(e.target.value)}
//               InputProps={{ style: { color: getTextColor() } }}
//               InputLabelProps={{ style: { color: getTextColor() } }}
//               sx={{ mb: 2 }}
//             />

//             <TextField
//               label="User ID"
//               fullWidth
//               variant="standard"
//               value={userId}
//               onChange={(e) => setUserId(e.target.value)}
//               InputProps={{ style: { color: getTextColor() } }}
//               InputLabelProps={{ style: { color: getTextColor() } }}
//               sx={{ mb: 2 }}
//             />

//             <TextField
//               label="Password"
//               type="password"
//               fullWidth
//               variant="standard"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               InputProps={{ style: { color: getTextColor() } }}
//               InputLabelProps={{ style: { color: getTextColor() } }}
//               sx={{ mb: 2 }}
//             />

//             <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
//               <FormControlLabel
//                 control={
//                   <Checkbox
//                     checked={savePassword}
//                     onChange={(e) => setSavePassword(e.target.checked)}
//                     sx={{
//                       color: getTextColor(),
//                       '&.Mui-checked': { color: '#ec1764' },
//                     }}
//                   />
//                 }
//                 label="Save Password"
//                 sx={{ color: getTextColor(), fontSize: 'smaller' }}
//               />
//               <Link href="#" variant="body2" sx={{ color: '#ec1764', fontWeight: 'bold', fontSize: 'smaller' }}>
//                 Forgot Password?
//               </Link>
//             </Box>

//             <Button
//               variant="contained"
//               fullWidth
//               size="large"
//               onClick={handleLogin}
//               sx={{
//                 borderRadius: '30px',
//                 background: '#ec1764',
//                 color: '#fff',
//                 fontWeight: 'bold',
//                 py: 1.5,
//                 textTransform: 'none',
//                 '&:hover': { background: '#c81355' },
//               }}
//               disabled={loader}
//             >
//               {loader ? "Signing In..." : "Sign In"}
//             </Button>
//           </Box>
//         </Slide>

//         <Snackbar
//           open={snack.open}
//           autoHideDuration={3000}
//           onClose={() => setSnack({ ...snack, open: false })}
//           anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
//         >
//           <Alert severity={snack.severity} sx={{ width: "100%", fontWeight: "bold" }}>
//             {snack.message}
//           </Alert>
//         </Snackbar>
//       </Container>
//     </>
//   );
// };

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
        setSnack({ open: true, message: "Login successful 🚀", severity: "success" });
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