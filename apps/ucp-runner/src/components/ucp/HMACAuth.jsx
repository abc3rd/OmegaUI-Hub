// HMAC Authentication utilities for UCP packets
import { initDB } from '@/components/ucp/UCPDatabase';

// API Key Repository (duplicated here for import flexibility)
const ApiKeyRepo = {
  async listAll() {
    const database = await initDB();
    return new Promise((resolve, reject) => {
      const tx = database.transaction('api_keys', 'readonly');
      const store = tx.objectStore('api_keys');
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  },

  async get(id) {
    const database = await initDB();
    return new Promise((resolve, reject) => {
      const tx = database.transaction('api_keys', 'readonly');
      const store = tx.objectStore('api_keys');
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  },

  async update(id, updates) {
    const database = await initDB();
    return new Promise((resolve, reject) => {
      const tx = database.transaction('api_keys', 'readwrite');
      const store = tx.objectStore('api_keys');
      const getRequest = store.get(id);
      getRequest.onsuccess = () => {
        const record = getRequest.result;
        if (record) {
          Object.assign(record, updates);
          const putRequest = store.put(record);
          putRequest.onsuccess = () => resolve(record);
          putRequest.onerror = () => reject(putRequest.error);
        } else {
          reject(new Error('API key not found'));
        }
      };
      getRequest.onerror = () => reject(getRequest.error);
    });
  },

  async incrementUsage(id) {
    const key = await this.get(id);
    if (key) {
      return this.update(id, {
        usageCount: (key.usageCount || 0) + 1,
        lastUsedAt: Date.now()
      });
    }
  }
};

// Generate HMAC-SHA256 signature
export async function generateHMAC(message, secret) {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const msgData = encoder.encode(message);
  
  const cryptoKey = await crypto.subtle.importKey(
    'raw', keyData, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  
  const signature = await crypto.subtle.sign('HMAC', cryptoKey, msgData);
  return Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0')).join('');
}

// Verify HMAC signature
export async function verifyHMAC(message, signature, secret) {
  const expectedSignature = await generateHMAC(message, secret);
  return signature === expectedSignature;
}

// Hash API key for storage comparison
export async function hashApiKey(key) {
  const encoder = new TextEncoder();
  const data = encoder.encode(key);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0')).join('');
}

// Validate API key and check permissions/rate limits
export async function validateApiKey(apiKey, requiredPermissions = []) {
  if (!apiKey || !apiKey.startsWith('ucp_')) {
    return { valid: false, error: 'Invalid API key format' };
  }

  const keyHash = await hashApiKey(apiKey);
  const allKeys = await ApiKeyRepo.listAll();
  const keyRecord = allKeys.find(k => k.keyHash === keyHash);

  if (!keyRecord) {
    return { valid: false, error: 'API key not found' };
  }

  // Check if revoked
  if (keyRecord.status === 'revoked') {
    return { valid: false, error: 'API key has been revoked' };
  }

  // Check expiration
  if (keyRecord.expiresAt && Date.now() > keyRecord.expiresAt) {
    return { valid: false, error: 'API key has expired' };
  }

  // Check rate limits (simple hourly check)
  const oneHourAgo = Date.now() - 60 * 60 * 1000;
  if (keyRecord.lastUsedAt && keyRecord.lastUsedAt > oneHourAgo) {
    // In a real implementation, you'd track usage count per hour
    // For now, we'll just check against the total usage as a simplified version
    if (keyRecord.usageCount >= keyRecord.rateLimit * 24) { // Rough daily limit
      return { valid: false, error: 'Rate limit exceeded' };
    }
  }

  // Check permissions
  const missingPermissions = requiredPermissions.filter(
    perm => !keyRecord.permissions?.includes(perm)
  );
  
  if (missingPermissions.length > 0) {
    return { 
      valid: false, 
      error: `Missing permissions: ${missingPermissions.join(', ')}` 
    };
  }

  // Increment usage
  await ApiKeyRepo.incrementUsage(keyRecord.id);

  return { 
    valid: true, 
    key: keyRecord,
    permissions: keyRecord.permissions
  };
}

// Sign a UCP packet
export async function signPacket(packetData, apiKey) {
  const packetJson = typeof packetData === 'string' 
    ? packetData 
    : JSON.stringify(packetData);
  
  const signature = await generateHMAC(packetJson, apiKey);
  const keyPrefix = apiKey.substring(0, 12) + '...';
  
  return {
    signature,
    keyPrefix,
    timestamp: Date.now()
  };
}

// Verify a signed packet
export async function verifySignedPacket(packetData, signature, apiKey) {
  const packetJson = typeof packetData === 'string' 
    ? packetData 
    : JSON.stringify(packetData);
  
  return await verifyHMAC(packetJson, signature, apiKey);
}

// Get required permissions for a packet based on its operations
export function getRequiredPermissions(packetData) {
  const permissions = new Set(['execute']);
  
  const checkOps = (ops) => {
    if (!ops) return;
    
    ops.forEach(op => {
      if (op.op) {
        const namespace = op.op.split('.')[0];
        if (namespace === 'http') permissions.add('http');
        if (namespace === 'local') permissions.add('storage');
        if (namespace === 'llm') permissions.add('llm');
      }
      
      // Check nested operations
      if (op.then) checkOps(op.then);
      if (op.else) checkOps(op.else);
      if (op.ops) checkOps(op.ops);
      if (op.catch) checkOps(op.catch);
      if (op.finally) checkOps(op.finally);
    });
  };
  
  checkOps(packetData.ops);
  
  return Array.from(permissions);
}

export default { 
  generateHMAC, 
  verifyHMAC, 
  hashApiKey, 
  validateApiKey, 
  signPacket, 
  verifySignedPacket,
  getRequiredPermissions
};