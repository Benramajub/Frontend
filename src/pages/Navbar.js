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
} from '@mui/material';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import MenuIcon from '@mui/icons-material/Menu';
import PeopleIcon from '@mui/icons-material/People';
import PaymentIcon from '@mui/icons-material/Payment';
import AssessmentIcon from '@mui/icons-material/Assessment';
import HomeIcon from '@mui/icons-material/Home';

const handleLogout = () => {
  window.location.href = '/login';
};

function Navbar() {
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);

  // ตรวจสอบว่าเส้นทางปัจจุบันคือ '/login' หรือไม่
  if (location.pathname === '/login') {
    return null; // ไม่แสดง Navbar
  }

  const toggleDrawer = (open) => () => {
    setDrawerOpen(open);
  };

  const menuItems = [
    { text: 'Home', path: '/home', icon: <HomeIcon /> },
    { text: 'Members', path: '/members', icon: <PeopleIcon /> },
    { text: 'Add Member', path: '/add-member', icon: <PeopleIcon /> },
    { text: 'Payment', path: '/payment', icon: <PaymentIcon /> },
    { text: 'Summary', path: '/summary', icon: <AssessmentIcon /> },
    { text: 'goodss', path: '/goodss', icon: <AssessmentIcon /> },
  ];

  return (
    <>
      <AppBar position="static" sx={{ backgroundColor: '#3f51b5' }}> {/* เปลี่ยนสีพื้นหลังที่นี่ */}
        <Toolbar>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton edge="start" color="inherit" onClick={toggleDrawer(true)}>
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" sx={{ marginLeft: 1 }}>
              GYM Management {/* ข้อความที่เพิ่มเข้าไป */}
            </Typography>
          </Box>
          <Box sx={{ flexGrow: 1 }} />
          <IconButton color="inherit" onClick={handleLogout}>
            <ExitToAppIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Drawer anchor="left" open={drawerOpen} onClose={toggleDrawer(false)}>
        <Box
          sx={{ width: 250 }}
          role="presentation"
          onClick={toggleDrawer(false)}
          onKeyDown={toggleDrawer(false)}
        >
          <Typography variant="h6" sx={{ padding: 2 }}>
            Menu
          </Typography>
          <Divider />
          <List>
            {menuItems.map((item) => (
              <ListItem button component={Link} to={item.path} key={item.text}>
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} sx={{ color: 'black' }} />
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
    </>
  );
}

export default Navbar;