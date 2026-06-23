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

    // Update immediately when the offline queue changes (enqueue / sync).
    window.addEventListener('offline-queue-changed', updatePendingCount);

    return () => {
      clearInterval(interval);
      window.removeEventListener('online', updatePendingCount);
      window.removeEventListener('offline-queue-changed', updatePendingCount);
    };
  }, []);

  return {
    pendingCount,
    updatePendingCount
  };
};