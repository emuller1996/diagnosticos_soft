import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// We will implement these in the next steps
import Login from './pages/Login';
import Register from './pages/Register';
import AuthenticatedApp from './components/layout/AuthenticatedApp';

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
  return (
    <AuthProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
         <Routes>
           <Route path="/login" element={<Login />} />
           <Route path="/register" element={<Register />} />
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