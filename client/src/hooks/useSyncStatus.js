import { useState, useEffect } from 'react';
import { offlineStore } from '../db/offlineDb';

export const useSyncStatus = () => {
  const [pendingCount, setPendingCount] = useState(0);

  const updatePendingCount = async () => {
    const count = await offlineStore.getQueueCount();
    setPendingCount(count);
  };

  useEffect(() => {
    updatePendingCount();
    
    // Poll for changes every 30 seconds to keep the UI updated
    const interval = setInterval(updatePendingCount, 30000);
    
    // Also update when connection changes
    window.addEventListener('online', updatePendingCount);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('online', updatePendingCount);
    };
  }, []);

  return {
    pendingCount,
    updatePendingCount
  };
};