import Dexie from 'dexie';

export const db = new Dexie('DiagnosticosDB');

// Define the schema
db.version(1).stores({
  syncQueue: '++id, type, timestamp' 
});

const notifyQueueChanged = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('offline-queue-changed'));
  }
};

export const offlineStore = {
  async addToQueue(type, payload, endpoint, photos = []) {
    const id = await db.syncQueue.add({
      type,
      payload,
      endpoint,
      photos,
      timestamp: Date.now()
    });
    notifyQueueChanged();
    return id;
  },

  async getAllPending() {
    return await db.syncQueue.orderBy('timestamp').toArray();
  },

  async removeFromQueue(id) {
    const result = await db.syncQueue.delete(id);
    notifyQueueChanged();
    return result;
  },

  async clearQueue() {
    const result = await db.syncQueue.clear();
    notifyQueueChanged();
    return result;
  },

  async getQueueCount() {
    return await db.syncQueue.count();
  }
};