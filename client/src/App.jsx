import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import { SyncStatus } from './components/SyncStatus';
import { useSyncStatus } from './hooks/useSyncStatus';
import DashboardLayout from './components/layout/DashboardLayout';
import CaracterizacionPescaPage from './pages/caracterizacion-pesca/CaracterizacionPescaPage';
import FormCaraterizacionPescaPage from './pages/caracterizacion-pesca/nuevo/FormCaraterizacionPesca';

// We will implement these in the next steps
import Login from './pages/Login';
import Register from './pages/Register';
import AuthenticatedApp from './components/layout/AuthenticatedApp';

// Layout público (sin ProtectedRoute) para las páginas de pesca accesibles offline.
function PublicDashboardLayout() {
  const { logout } = useAuth();
  return <DashboardLayout onLogout={logout} />;
}

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2563eb', // A professional blue
    },
    secondary: {
      main: '#7c3aed', // A professional purple
    },
    background: {
      default: '#f8fafc',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
});

function App() {
  const { pendingCount, updatePendingCount } = useSyncStatus();

  return (
    <AuthProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <SyncStatus pendingCount={pendingCount} onSyncComplete={updatePendingCount} />
          <Routes>
           <Route path="/login" element={<Login />} />
           <Route path="/register" element={<Register />} />

           {/* Rutas públicas accesibles sin sesión (uso offline en campo) */}
           <Route element={<PublicDashboardLayout />}>
             <Route path="/dashboard/caracterizacion-pesca" element={<CaracterizacionPescaPage />} />
             <Route path="/dashboard/caracterizacion-pesca/nuevo" element={<FormCaraterizacionPescaPage />} />
           </Route>

           <Route
             path="/*"
             element={
               <ProtectedRoute>
                 <AuthenticatedApp />
               </ProtectedRoute>
             }
           />
         </Routes>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;