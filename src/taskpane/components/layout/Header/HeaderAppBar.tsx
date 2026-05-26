// /* eslint-disable @typescript-eslint/no-unused-vars */
// /* eslint-disable no-undef */
// /* eslint-disable prettier/prettier */
// // /* eslint-disable @typescript-eslint/no-unused-vars */
// // /* eslint-disable prettier/prettier */
// // /* eslint-disable no-undef */
// // import * as React from 'react';
// // import AppBar from '@mui/material/AppBar';
// // import Box from '@mui/material/Box';
// // import Toolbar from '@mui/material/Toolbar';
// // import Typography from '@mui/material/Typography';
// // import IconButton from '@mui/material/IconButton';
// // import AccountCircle from '@mui/icons-material/AccountCircle';
// // import MenuItem from '@mui/material/MenuItem';
// // import Menu from '@mui/material/Menu';
// // import { useNavigate } from 'react-router-dom';

// // export default function HeaderAppBar() {
// //   const [auth, setAuth] = React.useState(true);
// //   const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

// //   const navigate = useNavigate(); // For navigation after confirmation

// //   const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
// //     setAuth(event.target.checked);
// //   };

// //   const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
// //     setAnchorEl(event.currentTarget);
// //   };

// //   const handleClose = () => {
// //     setAnchorEl(null);
// //   };

// //   const handleBack = () => {
// //     navigate('/');
// //   };
// //   return (
// //     <Box sx={{ flexGrow: 1 }} style={{display:'flex', justifyContent:'center'}}>
// //       <AppBar position="static" style={{background:'rgb(255 255 255)', color:'#c81355', borderRadius:'27px', width:'100%', boxShadow:'none'}}>
// //         <Toolbar>
// //           <Typography variant="h6" component="div" sx={{ flexGrow: 1, display:'flex'}}>
// //         <img src={require('../../../../../assets/Logo.png')} alt="Logo" style={{width:'100px', height:'auto'}}/>
// //           </Typography>
// //           {auth && (
// //             <div>
// //               <IconButton
// //                 size="large"
// //                 aria-label="account of current user"
// //                 aria-controls="menu-appbar"
// //                 aria-haspopup="true"
// //                 onClick={handleMenu}
// //                 color="inherit"
// //               >
// //                 <AccountCircle />
// //               </IconButton>
// //               <Menu
// //                 id="menu-appbar"
// //                 anchorEl={anchorEl}
// //                 anchorOrigin={{
// //                   vertical: 'top',
// //                   horizontal: 'right',
// //                 }}
// //                 keepMounted
// //                 transformOrigin={{
// //                   vertical: 'top',
// //                   horizontal: 'right',
// //                 }}
// //                 open={Boolean(anchorEl)}
// //                 onClose={handleClose}
// //               >
// //                 <MenuItem onClick={handleBack}>Log Out</MenuItem>
               
// //               </Menu>
// //             </div>
// //           )}
// //         </Toolbar>
// //       </AppBar>
// //     </Box>
// //   );
// // }


// import * as React from 'react';
// import AppBar from '@mui/material/AppBar';
// import Box from '@mui/material/Box';
// import Toolbar from '@mui/material/Toolbar';
// import Typography from '@mui/material/Typography';
// import IconButton from '@mui/material/IconButton';
// import AccountCircle from '@mui/icons-material/AccountCircle';
// import PaletteIcon from '@mui/icons-material/Palette';
// import MenuItem from '@mui/material/MenuItem';
// import Menu from '@mui/material/Menu';
// import { useNavigate } from 'react-router-dom';

// export default function HeaderAppBar() {
//   const [auth, setAuth] = React.useState(true);
//   const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
//   const [anchorElTheme, setAnchorElTheme] = React.useState<null | HTMLElement>(null);
//   const [theme, setTheme] = React.useState("white");

//   const navigate = useNavigate();

//   const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
//     setAnchorEl(event.currentTarget);
//   };

//   const handleClose = () => {
//     setAnchorEl(null);
//   };

//   const handleThemeMenu = (event: React.MouseEvent<HTMLElement>) => {
//     setAnchorElTheme(event.currentTarget);
//   };

//   const handleThemeClose = () => {
//     setAnchorElTheme(null);
//   };

//   const handleThemeChange = (selectedTheme: string) => {
//     setTheme(selectedTheme);
//     handleThemeClose();
//   };

//   const handleBack = () => {
//     navigate('/');
//   };

//   // Type the style as React.CSSProperties so that all CSS properties are allowed
//   let appBarStyle: React.CSSProperties = { 
//     borderRadius: '27px', 
//     width: '100%', 
//     boxShadow: 'none'
//   };

//   if (theme === "white") {
//     appBarStyle = { ...appBarStyle, backgroundColor: 'rgb(255,255,255)', color: '#c81355' };
//   } else if (theme === "lightGrey") {
//     appBarStyle = { ...appBarStyle, backgroundColor: '#f5f5f5', color: '#c81355' };
//   } else if (theme === "dark") {
//     appBarStyle = { ...appBarStyle, backgroundColor: '#424242', color: '#ffffff' };
//   }

//   return (
//     <Box sx={{ flexGrow: 1 }} style={{ display: 'flex', justifyContent: 'center' }}>
//       <AppBar position="static" style={appBarStyle}>
//         <Toolbar>
//           <Typography variant="h6" component="div" sx={{ flexGrow: 1, display: 'flex' }}>
//             <img 
//               src={require('../../../../../assets/Logo.png')} 
//               alt="Logo" 
//               style={{ width: '100px', height: 'auto' }} 
//             />
//           </Typography>
//           {auth && (
//             <div>
//               {/* Theme changer button */}
//               <IconButton
//                 size="large"
//                 aria-label="select theme"
//                 aria-controls="menu-theme"
//                 aria-haspopup="true"
//                 onClick={handleThemeMenu}
//                 color="inherit"
//               >
//                 <PaletteIcon />
//               </IconButton>
//               <Menu
//                 id="menu-theme"
//                 anchorEl={anchorElTheme}
//                 anchorOrigin={{
//                   vertical: 'top',
//                   horizontal: 'right',
//                 }}
//                 keepMounted
//                 transformOrigin={{
//                   vertical: 'top',
//                   horizontal: 'right',
//                 }}
//                 open={Boolean(anchorElTheme)}
//                 onClose={handleThemeClose}
//               >
//                 <MenuItem onClick={() => handleThemeChange("white")}>White</MenuItem>
//                 <MenuItem onClick={() => handleThemeChange("lightGrey")}>Light Grey</MenuItem>
//                 <MenuItem onClick={() => handleThemeChange("dark")}>Dark</MenuItem>
//               </Menu>
//               {/* Account menu */}
//               <IconButton
//                 size="large"
//                 aria-label="account of current user"
//                 aria-controls="menu-appbar"
//                 aria-haspopup="true"
//                 onClick={handleMenu}
//                 color="inherit"
//               >
//                 <AccountCircle />
//               </IconButton>
//               <Menu
//                 id="menu-appbar"
//                 anchorEl={anchorEl}
//                 anchorOrigin={{
//                   vertical: 'top',
//                   horizontal: 'right',
//                 }}
//                 keepMounted
//                 transformOrigin={{
//                   vertical: 'top',
//                   horizontal: 'right',
//                 }}
//                 open={Boolean(anchorEl)}
//                 onClose={handleClose}
//               >
//                 <MenuItem onClick={handleBack}>Log Out</MenuItem>
//               </Menu>
//             </div>
//           )}
//         </Toolbar>
//       </AppBar>
//     </Box>
//   );
// }

import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import AccountCircle from "@mui/icons-material/AccountCircle";
import PaletteIcon from "@mui/icons-material/Palette";
import MenuItem from "@mui/material/MenuItem";
import Menu from "@mui/material/Menu";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../styles/TheemProvider";
import { DarkMode, LightMode } from "@mui/icons-material";
import { ListItemIcon, ListItemText } from "@mui/material";

interface AppProps {
  Is_Login_Screen: any;
}

const HeaderAppBar: React.FC<AppProps> = ({ Is_Login_Screen }) => {
  const { theme, setTheme } = useTheme();

  const [anchorEl, setAnchorEl] =
    React.useState<null | HTMLElement>(null);

  const [anchorElTheme, setAnchorElTheme] =
    React.useState<null | HTMLElement>(null);

  const navigate = useNavigate();

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleThemeMenu = (
    event: React.MouseEvent<HTMLElement>
  ) => {
    setAnchorElTheme(event.currentTarget);
  };

  const handleThemeClose = () => {
    setAnchorElTheme(null);
  };

  const handleThemeChange = (selectedTheme: string) => {
    setTheme(selectedTheme);

    // save theme permanently
    localStorage.setItem("appTheme", selectedTheme);

    handleThemeClose();
  };

  const handleBack = () => {
    navigate("/");
  };

  React.useEffect(() => {
    const savedTheme = localStorage.getItem("appTheme");

    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  let appBarStyle: React.CSSProperties = {
    width: "100%",
    boxShadow: "none",
    transition: "all 0.3s ease",
  };

  if (theme === "white") {
    appBarStyle = {
      ...appBarStyle,
      backgroundColor: "whitesmoke",
      color: "#c81355",
    };
  } else if (theme === "lightGrey") {
    appBarStyle = {
      ...appBarStyle,
      backgroundColor: "#f5f5f5",
      color: "#c81355",
    };
  } else if (theme === "dark") {
    appBarStyle = {
      ...appBarStyle,
      backgroundColor: "#424242",
      color: "#ffffff",
    };
  }

  return (
    <Box
      sx={{ flexGrow: 1 }}
      style={{
        display: "flex",
        justifyContent: "center",
        padding: "0px",
      }}
    >
      <AppBar position="static" style={appBarStyle}>
        <Toolbar>
          <Typography
            variant="h6"
            component="div"
            sx={{
              flexGrow: 1,
              display: "flex",
            }}
          >
            <Box
              sx={{
                textAlign: "center",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <img
                src={require(`../../../../../assets/${
                  theme === "dark"
                    ? "DarkTheemeLogo.png"
                    : "LightTheemeLogo.png"
                }`)}
                alt="Logo"
                style={{
                  width: "125px",
                  height: "auto",
                }}
              />
            </Box>
          </Typography>

          {/* Theme Button ALWAYS Visible */}
          <IconButton
            size="large"
            aria-label="select theme"
            aria-controls="menu-theme"
            aria-haspopup="true"
            onClick={handleThemeMenu}
            color="inherit"
          >
            <PaletteIcon />
          </IconButton>

          {/* Theme Menu */}
          <Menu
            id="menu-theme"
            anchorEl={anchorElTheme}
            open={Boolean(anchorElTheme)}
            onClose={handleThemeClose}
            keepMounted
            anchorOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
          >
            <MenuItem
              onClick={() => handleThemeChange("white")}
            >
              <ListItemIcon>
                <LightMode fontSize="small" />
              </ListItemIcon>

              <ListItemText primary="Light Theme" />
            </MenuItem>

            <MenuItem
              onClick={() => handleThemeChange("dark")}
            >
              <ListItemIcon>
                <DarkMode fontSize="small" />
              </ListItemIcon>

              <ListItemText primary="Dark Theme" />
            </MenuItem>
          </Menu>

          {/* Account Menu Only After Login */}
          {!Is_Login_Screen && (
            <>
              <IconButton
                size="large"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleMenu}
                color="inherit"
              >
                <AccountCircle />
              </IconButton>

              <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
                keepMounted
                transformOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
                open={Boolean(anchorEl)}
                onClose={handleClose}
              >
                <MenuItem onClick={handleBack}>
                  Log Out
                </MenuItem>
              </Menu>
            </>
          )}
        </Toolbar>
      </AppBar>
    </Box>
  );
};

export default HeaderAppBar;