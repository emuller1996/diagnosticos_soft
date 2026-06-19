import axios from 'axios';
import { offlineStore } from '../db/offlineDb';

export const syncService = {
  async syncPendingData() {
    const pendingRecords = await offlineStore.getAllPending();
    
    if (pendingRecords.length === 0) return { synced: 0, total: 0 };

    let syncedCount = 0;
    const total = pendingRecords.length;

    for (const record of pendingRecords) {
      try {
        // Use the payload and endpoint stored in the queue
        // We use the same axios instance as the other services
        await axios.post(record.endpoint, record.payload);
        
        // If successful, remove from queue
        await offlineStore.removeFromQueue(record.id);
        syncedCount++;
      } catch (error) {
        console.error(`Failed to sync record ${record.id}:`, error);
        // If it's a 4xx error (client error), we might want to remove it to avoid 
        // poisoning the queue, but for now, we'll only remove on success (2xx).
        // If it's a network error, we stop processing the queue to avoid repeated failures.
        if (!error.response) {
          break; 
        }
      }
    }

    return { synced: syncedCount, total };
  },

  initAutoSync() {
    window.addEventListener('online', async () => {
      console.log('Network connection restored. Starting synchronization...');
      try {
        await this.syncPendingData();
      } catch (err) {
        console.error('Auto-sync failed:', err);
      }
    });
  }
};