import apiClient from './apiClient';
import { offlineStore } from '../db/offlineDb';
import { authService, isTokenExpired } from './authService';

const uploadQueuedPhotos = async (recordId, photos = []) => {
  for (const photo of photos) {
    const fd = new FormData();
    fd.append('file', photo.blob, photo.name);
    fd.append('observaciones', photo.observaciones || '');
    await apiClient.post(
      `/caracterizacion-pesca/${recordId}/anexo-foto`,
      fd,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
  }
};

export const syncService = {
  async syncPendingData() {
    const pendingRecords = await offlineStore.getAllPending();

    if (pendingRecords.length === 0) return { synced: 0, total: 0 };

    // No enviar de forma anónima: se requiere sesión válida para atribuir
    // quién registró cada ficha. Si no hay login, se avisa con needsAuth.
    const user = authService.getUser();
    const token = authService.getToken();
    if (!user?.email || !token || isTokenExpired(token)) {
      return { synced: 0, total: pendingRecords.length, needsAuth: true };
    }

    let syncedCount = 0;
    const total = pendingRecords.length;

    for (const record of pendingRecords) {
      try {
        // Atribuir al usuario autenticado sin sobreescribir uno ya presente.
        const payload = { registradoPor: user.email, ...record.payload };
        // Use apiClient (baseURL = VITE_API_URL + JWT interceptor), NOT bare axios.
        if (record.type === 'UPDATE') {
          await apiClient.put(record.endpoint, payload);
        } else {
          const res = await apiClient.post(record.endpoint, payload);
          // Upload any photos that were captured while offline.
          if (record.photos?.length) {
            const newId = res.data?.id;
            if (newId) {
              await uploadQueuedPhotos(newId, record.photos);
            }
          }
        }

        // Only remove from the queue once data AND photos were sent.
        await offlineStore.removeFromQueue(record.id);
        syncedCount++;
      } catch (error) {
        console.error(`Failed to sync record ${record.id}:`, error);
        // Network error (no response): stop and retry the whole queue later.
        if (!error.response) {
          break;
        }
        // Server responded with an error (4xx/5xx): skip this record but keep
        // processing the rest of the queue.
      }
    }

    return { synced: syncedCount, total };
  },

  // Try to flush the queue on startup if we already have connectivity
  // (the 'online' event won't fire if we were never offline this session).
  async syncIfPending() {
    if (!navigator.onLine) return;
    try {
      await this.syncPendingData();
    } catch (err) {
      console.error('Startup sync failed:', err);
    }
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
