// IndexedDB Database using Dexie-like pattern with native IndexedDB
const DB_NAME = 'UCPRunnerDB';
const DB_VERSION = 2;

let db = null;

export const initDB = () => {
  return new Promise((resolve, reject) => {
    if (db) {
      resolve(db);
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const database = event.target.result;

      // Packets table
      if (!database.objectStoreNames.contains('packets')) {
        const packetsStore = database.createObjectStore('packets', { keyPath: 'id' });
        packetsStore.createIndex('createdAt', 'createdAt', { unique: false });
      }

      // Receipts table
      if (!database.objectStoreNames.contains('receipts')) {
        const receiptsStore = database.createObjectStore('receipts', { keyPath: 'id' });
        receiptsStore.createIndex('packetId', 'packetId', { unique: false });
        receiptsStore.createIndex('createdAt', 'createdAt', { unique: false });
      }

      // Key-Value store
      if (!database.objectStoreNames.contains('kv_store')) {
        database.createObjectStore('kv_store', { keyPath: 'key' });
      }

      // Settings store
      if (!database.objectStoreNames.contains('settings')) {
        database.createObjectStore('settings', { keyPath: 'key' });
      }

      // Templates table
      if (!database.objectStoreNames.contains('templates')) {
        const templatesStore = database.createObjectStore('templates', { keyPath: 'id' });
        templatesStore.createIndex('createdAt', 'createdAt', { unique: false });
        templatesStore.createIndex('lastUsedAt', 'lastUsedAt', { unique: false });
        templatesStore.createIndex('intent', 'intent', { unique: false });
      }

      // API Keys table
      if (!database.objectStoreNames.contains('api_keys')) {
        const apiKeysStore = database.createObjectStore('api_keys', { keyPath: 'id' });
        apiKeysStore.createIndex('createdAt', 'createdAt', { unique: false });
        apiKeysStore.createIndex('status', 'status', { unique: false });
      }
    };
  });
};

// Packet Repository
export const PacketRepo = {
  async insert(packet) {
    const database = await initDB();
    return new Promise((resolve, reject) => {
      const tx = database.transaction('packets', 'readwrite');
      const store = tx.objectStore('packets');
      const record = {
        id: packet.id,
        json: JSON.stringify(packet),
        name: packet.meta?.name || packet.id,
        templateId: packet.templateId || null,
        createdAt: Date.now(),
        lastRunAt: null,
        lastStatus: null
      };
      const request = store.put(record);
      request.onsuccess = () => resolve(record);
      request.onerror = () => reject(request.error);
    });
  },

  async get(id) {
    const database = await initDB();
    return new Promise((resolve, reject) => {
      const tx = database.transaction('packets', 'readonly');
      const store = tx.objectStore('packets');
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  },

  async listRecent(limit = 20) {
    const database = await initDB();
    return new Promise((resolve, reject) => {
      const tx = database.transaction('packets', 'readonly');
      const store = tx.objectStore('packets');
      const request = store.getAll();
      request.onsuccess = () => {
        const results = request.result
          .sort((a, b) => b.createdAt - a.createdAt)
          .slice(0, limit);
        resolve(results);
      };
      request.onerror = () => reject(request.error);
    });
  },

  async updateLastRun(id, status) {
    const database = await initDB();
    return new Promise((resolve, reject) => {
      const tx = database.transaction('packets', 'readwrite');
      const store = tx.objectStore('packets');
      const getRequest = store.get(id);
      getRequest.onsuccess = () => {
        const record = getRequest.result;
        if (record) {
          record.lastRunAt = Date.now();
          record.lastStatus = status;
          const putRequest = store.put(record);
          putRequest.onsuccess = () => resolve(record);
          putRequest.onerror = () => reject(putRequest.error);
        } else {
          reject(new Error('Packet not found'));
        }
      };
      getRequest.onerror = () => reject(getRequest.error);
    });
  },

  async delete(id) {
    const database = await initDB();
    return new Promise((resolve, reject) => {
      const tx = database.transaction('packets', 'readwrite');
      const store = tx.objectStore('packets');
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
};

// Receipt Repository
export const ReceiptRepo = {
  async insert(receipt) {
    const database = await initDB();
    return new Promise((resolve, reject) => {
      const tx = database.transaction('receipts', 'readwrite');
      const store = tx.objectStore('receipts');
      const record = {
        id: receipt.receiptId,
        packetId: receipt.packetId,
        json: JSON.stringify(receipt),
        createdAt: Date.now(),
        status: receipt.status
      };
      const request = store.put(record);
      request.onsuccess = () => resolve(record);
      request.onerror = () => reject(request.error);
    });
  },

  async get(id) {
    const database = await initDB();
    return new Promise((resolve, reject) => {
      const tx = database.transaction('receipts', 'readonly');
      const store = tx.objectStore('receipts');
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  },

  async listRecent(limit = 10) {
    const database = await initDB();
    return new Promise((resolve, reject) => {
      const tx = database.transaction('receipts', 'readonly');
      const store = tx.objectStore('receipts');
      const request = store.getAll();
      request.onsuccess = () => {
        const results = request.result
          .sort((a, b) => b.createdAt - a.createdAt)
          .slice(0, limit);
        resolve(results);
      };
      request.onerror = () => reject(request.error);
    });
  },

  async listForPacket(packetId) {
    const database = await initDB();
    return new Promise((resolve, reject) => {
      const tx = database.transaction('receipts', 'readonly');
      const store = tx.objectStore('receipts');
      const index = store.index('packetId');
      const request = index.getAll(packetId);
      request.onsuccess = () => {
        const results = request.result.sort((a, b) => b.createdAt - a.createdAt);
        resolve(results);
      };
      request.onerror = () => reject(request.error);
    });
  }
};

// Key-Value Repository
export const KvRepo = {
  async put(key, value) {
    const database = await initDB();
    return new Promise((resolve, reject) => {
      const tx = database.transaction('kv_store', 'readwrite');
      const store = tx.objectStore('kv_store');
      const record = { key, value, updatedAt: Date.now() };
      const request = store.put(record);
      request.onsuccess = () => resolve({ ok: true });
      request.onerror = () => reject(request.error);
    });
  },

  async get(key) {
    const database = await initDB();
    return new Promise((resolve, reject) => {
      const tx = database.transaction('kv_store', 'readonly');
      const store = tx.objectStore('kv_store');
      const request = store.get(key);
      request.onsuccess = () => {
        if (request.result) {
          resolve({ value: request.result.value });
        } else {
          reject(new Error(`Key not found: ${key}`));
        }
      };
      request.onerror = () => reject(request.error);
    });
  }
};

// Settings Repository
export const SettingsRepo = {
  async get(key, defaultValue = null) {
    const database = await initDB();
    return new Promise((resolve) => {
      const tx = database.transaction('settings', 'readonly');
      const store = tx.objectStore('settings');
      const request = store.get(key);
      request.onsuccess = () => {
        resolve(request.result?.value ?? defaultValue);
      };
      request.onerror = () => resolve(defaultValue);
    });
  },

  async set(key, value) {
    const database = await initDB();
    return new Promise((resolve, reject) => {
      const tx = database.transaction('settings', 'readwrite');
      const store = tx.objectStore('settings');
      const request = store.put({ key, value });
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
};

// Template Repository
export const TemplateRepo = {
  async insert(template) {
    const database = await initDB();
    return new Promise((resolve, reject) => {
      const tx = database.transaction('templates', 'readwrite');
      const store = tx.objectStore('templates');
      const record = {
        id: template.id,
        name: template.name,
        intent: template.intent,
        packetJson: template.packetJson,
        embeddingHint: template.embeddingHint || null,
        baselinePromptTokens: template.baselinePromptTokens || 500,
        baselineCompletionTokens: template.baselineCompletionTokens || 200,
        category: template.category || 'General',
        tags: template.tags || [],
        createdAt: Date.now(),
        lastUsedAt: null,
        reuseCount: 0
      };
      const request = store.put(record);
      request.onsuccess = () => resolve(record);
      request.onerror = () => reject(request.error);
    });
  },

  async get(id) {
    const database = await initDB();
    return new Promise((resolve, reject) => {
      const tx = database.transaction('templates', 'readonly');
      const store = tx.objectStore('templates');
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  },

  async listAll() {
    const database = await initDB();
    return new Promise((resolve, reject) => {
      const tx = database.transaction('templates', 'readonly');
      const store = tx.objectStore('templates');
      const request = store.getAll();
      request.onsuccess = () => {
        const results = request.result.sort((a, b) => b.createdAt - a.createdAt);
        resolve(results);
      };
      request.onerror = () => reject(request.error);
    });
  },

  async update(id, updates) {
    const database = await initDB();
    return new Promise((resolve, reject) => {
      const tx = database.transaction('templates', 'readwrite');
      const store = tx.objectStore('templates');
      const getRequest = store.get(id);
      getRequest.onsuccess = () => {
        const record = getRequest.result;
        if (record) {
          Object.assign(record, updates);
          const putRequest = store.put(record);
          putRequest.onsuccess = () => resolve(record);
          putRequest.onerror = () => reject(putRequest.error);
        } else {
          reject(new Error('Template not found'));
        }
      };
      getRequest.onerror = () => reject(getRequest.error);
    });
  },

  async incrementReuseCount(id) {
    const database = await initDB();
    return new Promise((resolve, reject) => {
      const tx = database.transaction('templates', 'readwrite');
      const store = tx.objectStore('templates');
      const getRequest = store.get(id);
      getRequest.onsuccess = () => {
        const record = getRequest.result;
        if (record) {
          record.reuseCount = (record.reuseCount || 0) + 1;
          record.lastUsedAt = Date.now();
          const putRequest = store.put(record);
          putRequest.onsuccess = () => resolve(record);
          putRequest.onerror = () => reject(putRequest.error);
        } else {
          reject(new Error('Template not found'));
        }
      };
      getRequest.onerror = () => reject(getRequest.error);
    });
  },

  async delete(id) {
    const database = await initDB();
    return new Promise((resolve, reject) => {
      const tx = database.transaction('templates', 'readwrite');
      const store = tx.objectStore('templates');
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
};

export default { initDB, PacketRepo, ReceiptRepo, KvRepo, SettingsRepo, TemplateRepo };