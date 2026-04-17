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
  IconButton,
  useTheme,
  useMediaQuery,
  CssBaseline
} from '@mui/material';
import { 
  Dashboard as DashboardIcon, 
  Assignment as ProjectIcon, 
  Menu as MenuIcon, 
  Logout as LogoutIcon
} from '@mui/icons-material';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';

const drawerWidth = 260;

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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [open, setOpen] = useState(!isMobile); // Closed by default on mobile
  const navigate = useNavigate();
  const location = useLocation();

  const toggleDrawer = () => setOpen(!open);
  const handleCloseDrawer = () => {
    if (isMobile) setOpen(false);
  };

  const handleNavigation = (path) => {
    navigate(path);
    handleCloseDrawer();
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      
      {/* AppBar */}
      <AppBar 
        position="fixed" 
        sx={{ 
          zIndex: (theme) => theme.zIndex.drawer + 1,
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton
              color="inherit"
              edge="start"
              onClick={toggleDrawer}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
            <Typography 
              variant="h6" 
              noWrap 
              component="div" 
              sx={{ 
                fontWeight: 600, 
                letterSpacing: '-0.5px',
                display: { xs: 'none', sm: 'block' } 
              }}
            >
              Diagnósticos Soft
            </Typography>
            <Typography 
              variant="h6" 
              noWrap 
              component="div" 
              sx={{ 
                fontWeight: 600, 
                display: { xs: 'block', sm: 'none' } 
              }}
            >
              DS
            </Typography>
          </Box>
          
          <IconButton color="inherit" onClick={onLogout} title="Cerrar Sesión">
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Sidebar */}
      <Drawer
        variant={isMobile ? "temporary" : "permanent"}
        open={open}
        onClose={handleCloseDrawer}
        sx={{
          width: isMobile ? drawerWidth : (open ? drawerWidth : 70),
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { 
            width: isMobile ? drawerWidth : (open ? drawerWidth : 70), 
            boxSizing: 'border-box',
            transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            overflowX: 'hidden',
            borderRight: '1px solid',
            borderColor: 'divider',
            backgroundColor: (theme) => theme.palette.background.paper,
          },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto', py: 2 }}>
          <List sx={{ px: 1 }}>
            {MENU_ITEMS.map((item) => (
              <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
                <ListItemButton 
                  onClick={() => handleNavigation(item.path)}
                  selected={location.pathname === item.path}
                  sx={{
                    borderRadius: '8px',
                    '&.Mui-selected': {
                      backgroundColor: (theme) => theme.palette.primary.main + '20', // Light primary bg
                      color: (theme) => theme.palette.primary.main,
                      '&:hover': {
                        backgroundColor: (theme) => theme.palette.primary.main + '30',
                      },
                      '& .MuiListItemIcon-root': {
                        color: (theme) => theme.palette.primary.main,
                      }
                    }
                  }}
                >
                  <ListItemIcon sx={{ 
                    minWidth: !isMobile && !open ? 0 : 40, 
                    justifyContent: 'center',
                    color: 'inherit'
                  }}>
                    {item.icon}
                  </ListItemIcon>
                  { (open || isMobile) && <ListItemText primary={item.text} sx={{ ml: !open ? 0 : 1 }} />}
                </ListItemButton>
              </ListItem>
            ))}
          </List>
          <Divider sx={{ my: 2, mx: 2 }} />
        </Box>
      </Drawer>

      {/* Main Content Area */}
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          p: { xs: 2, sm: 3 }, 
          transition: 'margin 0.3s ease',
          minHeight: '100vh',
          backgroundColor: (theme) => theme.palette.background.default
        }}
      >
        <Toolbar />
        <Box sx={{ 
          mt: 2, 
          maxWidth: '1400px', 
          mx: 'auto',
          width: '100%' 
        }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default DashboardLayout;