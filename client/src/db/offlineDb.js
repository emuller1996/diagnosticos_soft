import Dexie from 'dexie';

export const db = new Dexie('DiagnosticosDB');

// Define the schema
db.version(1).stores({
  syncQueue: '++id, type, timestamp' 
});

export const offlineStore = {
  async addToQueue(type, payload, endpoint) {
    return await db.syncQueue.add({
      type,
      payload,
      endpoint,
      timestamp: Date.now()
    });
  },

  async getAllPending() {
    return await db.syncQueue.orderBy('timestamp').toArray();
  },

  async removeFromQueue(id) {
    return await db.syncQueue.delete(id);
  },

  async clearQueue() {
    return await db.syncQueue.clear();
  },

  async getQueueCount() {
    return await db.syncQueue.count();
  }
};