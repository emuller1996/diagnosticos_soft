import React, { useState } from 'react';
import { 
  Box, 
  CssBaseline, 
  Toolbar, 
  Typography, 
  Drawer, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText, 
  Divider, 
  AppBar, 
  IconButton, 
  Avatar, 
  Menu, 
  MenuItem, 
  Grid, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
} from '@mui/material';
import { 
  Menu as MenuIcon, 
  Dashboard as DashboardIcon, 
  Person as PersonIcon, 
  Settings as SettingsIcon, 
  Logout as LogoutIcon,
  People,
  TrendingUp,
  NotificationsActive,
  ChevronLeft
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const drawerWidth = 240;

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [open, setOpen] = useState(true); // For mini-drawer toggle on desktop
  const [anchorEl, setAnchorEl] = useState(null);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { text: 'Inicio', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'Perfil', icon: <PersonIcon />, path: '/dashboard/profile' },
    { text: 'Configuración', icon: <SettingsIcon />, path: '/dashboard/settings' },
  ];

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Toolbar sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 2 }}>
        <Typography variant="h6" fontWeight="bold" color="primary">
          DiagSoft
        </Typography>
      </Toolbar>
      <Divider />
      <List sx={{ flexGrow: 1 }}>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton onClick={() => navigate(item.path)}>
              <ListItemIcon color="primary">{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />
      <List>
        <ListItem disablePadding>
          <ListItemButton onClick={handleLogout}>
            <ListItemIcon color="error"><LogoutIcon /></ListItemIcon>
            <ListItemText primary="Cerrar Sesión" />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      
      {/* Topbar */}
      <AppBar 
        position="fixed" 
        sx={{ 
          zIndex: (theme) => theme.zIndex.drawer + 1, 
          backgroundColor: 'white', 
          color: 'text.primary',
          boxShadow: '0px 2px 4px -1px rgba(0,0,0,0.05)'
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 500 }}>
            Panel de Control
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" sx={{ display: { xs: 'none', sm: 'block' }, mr: 1 }}>
              Hola, {user?.name}
            </Typography>
            <IconButton onClick={handleMenuOpen} color="inherit">
              <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                {user?.name?.charAt(0).toUpperCase()}
              </Avatar>
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
              <MenuItem onClick={handleMenuClose}><PersonIcon sx={{ mr: 1 }} fontSize="small" /> Perfil</MenuItem>
              <MenuItem onClick={handleMenuClose}><SettingsIcon sx={{ mr: 1 }} fontSize="small" /> Ajustes</MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
                <LogoutIcon sx={{ mr: 1 }} fontSize="small" /> Salir
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Sidebar */}
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        {/* Mobile Drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawerContent}
        </Drawer>
        
        {/* Desktop Drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              borderRight: '1px solid #e2e8f0'
            },
          }}
          open
        >
          {drawerContent}
        </Drawer>
      </Box>

      {/* Main Content */}
      <Box
        component="main"
        sx={{ 
          flexGrow: 1, 
          p: 3, 
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          minHeight: '100vh',
          backgroundColor: '#f8fafc' 
        }}
      >
        <Toolbar /> {/* Spacer for AppBar */}
        
        <Box mb={4}>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            ¡Bienvenido, {user?.name}! 👋
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Aquí tienes un resumen de lo que sucede en tu plataforma hoy.
          </Typography>
        </Box>

        {/* Stats Cards */}
        <Grid container spacing={3} mb={4}>
          {[
            { title: 'Usuarios Totales', value: '1,250', icon: <People color="primary" />, color: '#eff6ff' },
            { title: 'Ventas Mensuales', value: '$12,400', icon: <TrendingUp color="success" />, color: '#f0fdf4' },
            { title: 'Notificaciones', value: '18', icon: <NotificationsActive color="warning" />, color: '#fffbeb' },
          ].map((stat, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 3, 
                  borderRadius: 3, 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 2,
                  border: '1px solid #e2e8f0',
                  backgroundColor: stat.color
                }}
              >
                <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                  {stat.icon}
                </Box>
                <Box>
                  <Typography variant="body2" color="textSecondary" fontWeight="medium">
                    {stat.title}
                  </Typography>
                  <Typography variant="h5" fontWeight="bold">
                    {stat.value}
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>

        {/* Recent Activity Table */}
        <Typography variant="h6" fontWeight="bold" mb={2}>
          Actividad Reciente
        </Typography>
        <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)', border: '1px solid #e2e8f0' }}>
          <Table>
            <TableHead sx={{ backgroundColor: '#f1f5f9' }}>
              <TableRow>
                <TableCell fontWeight="bold">Usuario</TableCell>
                <TableCell fontWeight="bold">Acción</TableCell>
                <TableCell fontWeight="bold">Fecha</TableCell>
                <TableCell fontWeight="bold" align="right">Estado</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {[
                { user: 'Admin User', action: 'Actualizó configuración', date: 'Hace 2 min', status: 'Completado' },
                { user: 'Maria Lopez', action: 'Sube nuevo reporte', date: 'Hace 15 min', status: 'Pendiente' },
                { user: 'Juan Perez', action: 'Inició sesión', date: 'Hace 1 hora', status: 'Completado' },
                { user: 'Soporte Tech', action: 'Cerró ticket #452', date: 'Hace 3 horas', status: 'Completado' },
              ].map((row, index) => (
                <TableRow key={index} hover>
                  <TableCell>{row.user}</TableCell>
                  <TableCell>{row.action}</TableCell>
                  <TableCell>{row.date}</TableCell>
                  <TableCell align="right">
                    <Box 
                      component="span" 
                      sx={{ 
                        px: 1.5, 
                        py: 0.5, 
                        borderRadius: 1, 
                        fontSize: '0.75rem', 
                        fontWeight: 'bold',
                        backgroundColor: row.status === 'Completado' ? '#dcfce7' : '#fef9c3',
                        color: row.status === 'Completado' ? '#166534' : '#854d0e',
                      }}
                    >
                      {row.status}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Box>
  );
};

export default Dashboard;