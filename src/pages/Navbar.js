import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  IconButton,
  Box,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Divider,
  Typography,
  ListItemIcon,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import MenuIcon from '@mui/icons-material/Menu';
import PeopleIcon from '@mui/icons-material/People';
import ContactPageIcon from '@mui/icons-material/ContactPage';
import PaymentIcon from '@mui/icons-material/Payment';
import AssessmentIcon from '@mui/icons-material/Assessment';
import HomeIcon from '@mui/icons-material/Home';
import FingerprintIcon from '@mui/icons-material/Fingerprint';
import StorageIcon from '@mui/icons-material/Storage';
import { createTheme, ThemeProvider } from '@mui/material/styles';

const drawerWidth = 210; // กำหนดความกว้างของ Drawer

const handleLogout = () => {
  window.location.href = '/Login';
};

function Navbar() {
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  if (location.pathname === '/Login' || location.pathname === '/Register') {
    return null;
  }

  const toggleDrawer = () => {
    setDrawerOpen((prev) => !prev); // สลับค่า true/false
  };

  const menuItems = [
    { text: 'หน้าหลัก', path: '/Home', icon: <HomeIcon sx={{ color: "white" }} /> },
    { text: 'เพิ่มผู้ใช้งาน', path: '/add-member', icon: <PeopleIcon sx={{ color: "white" }} /> },
    { text: 'ลงทะเบียนลายนิ้วมือ', path: '/add-finger', icon: <FingerprintIcon sx={{ color: "white" }} /> },
    { text: 'จัดการข้อมูล', path: '/memberlist', icon: <ContactPageIcon sx={{ color: "white" }} /> },
    { text: 'บันทึกชำระเงิน', path: '/payment', icon: <PaymentIcon sx={{ color: "white" }} /> },
    { text: 'สรุปยอด', path: '/summary', icon: <AssessmentIcon sx={{ color: "white" }} /> },
    { text: 'รายงาน', path: '/reports', icon: <StorageIcon sx={{ color: "white" }} /> },
  ];

  const customTheme = createTheme({
    typography: {
      fontFamily: '"Kanit", sans-serif',
    },
  });

  return (
    <ThemeProvider theme={customTheme}>
      <Box sx={{ display: "flex" }}>
        {/* Navbar */}
        <AppBar
          position="fixed"
          sx={{
            background: "linear-gradient(to right, rgb(27, 129, 181), rgb(30, 135, 188))",
            width: drawerOpen && !isMobile ? `calc(100% - ${drawerWidth}px)` : "100%",
            transition: "width 0.3s ease",
            zIndex: theme.zIndex.drawer + 1,
          }}
        >
          <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <IconButton sx={{ color: "white" }} edge="start" onClick={toggleDrawer}>
                <MenuIcon />
              </IconButton>
              <Typography variant="h6" sx={{ marginLeft: 2 }}>
                GYM Management
              </Typography>
            </Box>
            <IconButton sx={{ color: "white" }} onClick={handleLogout}>
              <ExitToAppIcon />
            </IconButton>
          </Toolbar>
        </AppBar>

        {/* Drawer (Sidebar) */}
        <Drawer
          variant={isMobile ? "temporary" : "persistent"}
          anchor="left"
          open={drawerOpen}
          onClose={toggleDrawer}
          sx={{
            width: drawerOpen ? drawerWidth : 0,
            flexShrink: 0,
            "& .MuiDrawer-paper": {
              width: drawerWidth,
              background: "linear-gradient(to right,rgba(3, 154, 229, 0.8), rgb(30, 135, 188))",
              padding: 1,
              height: "100%",
              maxWidth: "40hw",
              boxSizing: "border-box",
              transition: "width 0.3s ease",
            },
          }}
        >
          <Box role="presentation">
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center"}}>
          <img src="/images/logo.png" alt="Login icon" width="60" height="60" />
          </Box>
           <Divider sx={{ height: 2, backgroundColor: "white" }} />
            <List sx={{ padding: 0, marginTop: 2 }}>
              {menuItems.map((item) => (
                <ListItem
                  component={Link}
                  to={item.path}
                  key={item.text}
                  sx={{
                    "&:hover": {
                      backgroundColor: "rgba(22, 83, 120, 0.75)",
                      borderRadius: "8px",
                      transition: "background-color 0.3s ease, transform 0.2s",
                      transform: "scale(1.05)",
                    },
                    padding: "10px 10px",
                    borderRadius: "8px",
                    textDecoration: "none",
                    display: "flex",
                    alignItems: "center",
                    color: "white",
                    cursor: "pointer",
                  }}
                  onClick={toggleDrawer} // คลิกเมนูเพื่อปิด Drawer
                >
                  <ListItemIcon sx={{ minWidth: "40px" }}>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.text} sx={{ fontSize: "1.1rem" }} />
                </ListItem>
              ))}
            </List>
            <br />
            <Divider sx={{ height: 2, backgroundColor: "white" }}/>
            <Box sx={{ position: "absolute", bottom: 0, width: "80%", padding: 1 }}>
              <Typography variant="body2" align="center" sx={{ color: "white" }}>
                GYM Management ©
              </Typography>
            </Box>
          </Box>
        </Drawer>

        {/* Main Content (Shift right when drawer is open) */}
        <Box
          sx={{
            marginTop: "64px",
            flexGrow: 1,
            paddingLeft: drawerOpen && !isMobile ? `${drawerWidth}px` : 0,
            transition: "padding-left 0.3s ease",
          }}
        />
      </Box>
    </ThemeProvider>
  );
}

export default Navbar;