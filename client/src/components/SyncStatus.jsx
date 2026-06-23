import React from 'react';
import { Chip, Tooltip, Box } from '@mui/material';
import { Sync, Login as LoginIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { syncService } from '../services/syncService';
import { useAuth } from '../context/AuthContext';

export const SyncStatus = ({ pendingCount, onSyncComplete }) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  if (pendingCount === 0) return null;

  // Hay fichas pendientes pero no hay sesión: para enviarlas (y registrar
  // quién las subió) primero hay que iniciar sesión.
  const needsLogin = !isAuthenticated;

  const handleClick = async () => {
    if (needsLogin) {
      navigate('/login');
      return;
    }
    try {
      const result = await syncService.syncPendingData();
      if (result?.needsAuth) {
        navigate('/login');
        return;
      }
      if (onSyncComplete) onSyncComplete();
    } catch (error) {
      console.error('Manual sync failed', error);
    }
  };

  return (
    <Box sx={{ position: 'fixed', bottom: 20, right: 20, zIndex: 1000 }}>
      <Tooltip
        title={
          needsLogin
            ? 'Inicie sesión para enviar las fichas guardadas'
            : 'Haga clic para sincronizar ahora'
        }
      >
        <Chip
          icon={
            needsLogin ? (
              <LoginIcon />
            ) : (
              <Sync sx={{ animation: 'spin 2s linear infinite', '@keyframes spin': { '100%': { transform: 'rotate(360deg)' } } }} />
            )
          }
          label={
            needsLogin
              ? `${pendingCount} sin enviar · Inicie sesión`
              : `${pendingCount} cambios pendientes`
          }
          color="warning"
          onClick={handleClick}
          sx={{ cursor: 'pointer', fontWeight: 'bold' }}
        />
      </Tooltip>
    </Box>
  );
};
