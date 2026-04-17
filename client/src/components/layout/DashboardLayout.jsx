import React, { useState } from 'react';
import { 
  Box, 
  Drawer, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText, 
  Typography, 
  AppBar, 
  Toolbar, 
  Divider,
  IconButton
} from '@mui/material';
import { 
  Dashboard as DashboardIcon, 
  Assignment as ProjectIcon, 
  Menu as MenuIcon, 
  Logout as LogoutIcon,
  ChevronLeft as ChevronLeftIcon
} from '@mui/icons-material';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';

const drawerWidth = 240;

const MENU_ITEMS = [
  { 
    text: 'Dashboard', 
    icon: <DashboardIcon />, 
    path: '/dashboard' 
  },
  { 
    text: 'Proyectos', 
    icon: <ProjectIcon />, 
    path: '/dashboard/proyectos' 
  },
];

const DashboardLayout = ({ onLogout }) => {
  const [open, setOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const toggleDrawer = () => setOpen(!open);

  return (
    <Box sx={{ display: 'flex' }}>
      {/* AppBar */}
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={toggleDrawer}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Diagnósticos Soft
          </Typography>
          <IconButton color="inherit" onClick={onLogout}>
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Sidebar */}
      <Drawer
        variant="permanent"
        open={open}
        sx={{
          width: open ? drawerWidth : 60,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { 
            width: open ? drawerWidth : 60, 
            boxSizing: 'border-box',
            transition: 'width 0.3s ease',
            overflowX: 'hidden'
          },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto' }}>
          <List>
            {MENU_ITEMS.map((item) => (
              <ListItem key={item.text} disablePadding>
                <ListItemButton 
                  onClick={() => navigate(item.path)}
                  selected={location.pathname === item.path}
                >
                  <ListItemIcon sx={{ minWidth: open ? 40 : 0 }}>
                    {item.icon}
                  </ListItemIcon>
                  {open && <ListItemText primary={item.text} />}
                </ListItemButton>
              </ListItem>
            ))}
          </List>
          <Divider />
        </Box>
      </Drawer>

      {/* Main Content Area */}
      <Box component="main" sx={{ flexGrow: 1, p: 3, transition: 'margin 0.3s ease' }}>
        <Toolbar />
        <Box sx={{ mt: 2 }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default DashboardLayout;