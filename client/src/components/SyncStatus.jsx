import React from 'react';
import { Chip, Tooltip, Box } from '@mui/material';
import { CloudOff, CloudUpload, Sync } from '@mui/icons-material';
import { syncService } from '../services/syncService';

export const SyncStatus = ({ pendingCount, onSyncComplete }) => {
  if (pendingCount === 0) return null;

  const handleManualSync = async () => {
    try {
      await syncService.syncPendingData();
      if (onSyncComplete) onSyncComplete();
    } catch (error) {
      console.error('Manual sync failed', error);
    }
  };

  return (
    <Box sx={{ position: 'fixed', bottom: 20, right: 20, zIndex: 1000 }}>
      <Tooltip title="Haga clic para sincronizar ahora">
        <Chip 
          icon={<Sync sx={{ animation: 'spin 2s linear infinite', '@keyframes spin': { '100%': { transform: 'rotate(360deg)' } } }} />} 
          label={`${pendingCount} cambios pendientes`} 
          color="warning" 
          onClick={handleManualSync}
          sx={{ cursor: 'pointer', fontWeight: 'bold' }}
        />
      </Tooltip>
    </Box>
  );
};