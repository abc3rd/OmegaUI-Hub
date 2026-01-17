import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Key, Plus, Trash2, Copy, CheckCircle, Eye, EyeOff, 
  Shield, Clock, AlertTriangle, RefreshCw, Settings,
  Zap, Globe, Database, Brain
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { initDB } from '@/components/ucp/UCPDatabase';

// API Key Repository
const ApiKeyRepo = {
  async insert(key) {
    const database = await initDB();
    return new Promise((resolve, reject) => {
      const tx = database.transaction('api_keys', 'readwrite');
      const store = tx.objectStore('api_keys');
      const request = store.put(key);
      request.onsuccess = () => resolve(key);
      request.onerror = () => reject(request.error);
    });
  },

  async listAll() {
    const database = await initDB();
    return new Promise((resolve, reject) => {
      const tx = database.transaction('api_keys', 'readonly');
      const store = tx.objectStore('api_keys');
      const request = store.getAll();
      request.onsuccess = () => {
        const results = request.result.sort((a, b) => b.createdAt - a.createdAt);
        resolve(results);
      };
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

  async getByKeyHash(keyHash) {
    const keys = await this.listAll();
    return keys.find(k => k.keyHash === keyHash);
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

  async delete(id) {
    const database = await initDB();
    return new Promise((resolve, reject) => {
      const tx = database.transaction('api_keys', 'readwrite');
      const store = tx.objectStore('api_keys');
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
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

// HMAC-SHA256 implementation
async function generateHMAC(message, secret) {
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

// Generate secure random key
function generateApiKey() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const prefix = 'ucp_';
  let key = '';
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  for (let i = 0; i < 32; i++) {
    key += chars[array[i] % chars.length];
  }
  return prefix + key;
}

// Hash API key for storage
async function hashApiKey(key) {
  const encoder = new TextEncoder();
  const data = encoder.encode(key);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0')).join('');
}

const PERMISSIONS = [
  { id: 'execute', name: 'Execute Packets', icon: Zap, description: 'Run UCP packets' },
  { id: 'read', name: 'Read Data', icon: Eye, description: 'View packets and receipts' },
  { id: 'http', name: 'HTTP Operations', icon: Globe, description: 'Make HTTP requests' },
  { id: 'storage', name: 'Storage Operations', icon: Database, description: 'Local storage access' },
  { id: 'llm', name: 'LLM Operations', icon: Brain, description: 'AI/LLM invocations' }
];

export default function ApiKeyManager() {
  const [keys, setKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newKey, setNewKey] = useState(null);
  const [copied, setCopied] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [editingKey, setEditingKey] = useState(null);
  
  // New key form
  const [keyName, setKeyName] = useState('');
  const [keyPermissions, setKeyPermissions] = useState(['execute', 'read']);
  const [rateLimit, setRateLimit] = useState(100);
  const [expiresIn, setExpiresIn] = useState('never');

  useEffect(() => {
    loadKeys();
  }, []);

  const loadKeys = async () => {
    setLoading(true);
    await initDB();
    const allKeys = await ApiKeyRepo.listAll();
    setKeys(allKeys);
    setLoading(false);
  };

  const handleCreateKey = async () => {
    const rawKey = generateApiKey();
    const keyHash = await hashApiKey(rawKey);
    
    const expirationMap = {
      'never': null,
      '7d': Date.now() + 7 * 24 * 60 * 60 * 1000,
      '30d': Date.now() + 30 * 24 * 60 * 60 * 1000,
      '90d': Date.now() + 90 * 24 * 60 * 60 * 1000
    };

    const keyRecord = {
      id: `key_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: keyName || 'Unnamed Key',
      keyPrefix: rawKey.substring(0, 12) + '...',
      keyHash,
      permissions: keyPermissions,
      rateLimit: parseInt(rateLimit),
      rateLimitPeriod: 'hour',
      usageCount: 0,
      status: 'active',
      expiresAt: expirationMap[expiresIn],
      createdAt: Date.now(),
      lastUsedAt: null
    };

    await ApiKeyRepo.insert(keyRecord);
    setNewKey({ ...keyRecord, fullKey: rawKey });
    setShowCreate(false);
    setKeyName('');
    setKeyPermissions(['execute', 'read']);
    setRateLimit(100);
    setExpiresIn('never');
    await loadKeys();
  };

  const handleRevokeKey = async (id) => {
    await ApiKeyRepo.update(id, { status: 'revoked' });
    setShowDeleteConfirm(null);
    await loadKeys();
  };

  const handleDeleteKey = async (id) => {
    await ApiKeyRepo.delete(id);
    setShowDeleteConfirm(null);
    await loadKeys();
  };

  const handleCopy = async (text, id) => {
    await navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const togglePermission = (perm) => {
    if (keyPermissions.includes(perm)) {
      setKeyPermissions(keyPermissions.filter(p => p !== perm));
    } else {
      setKeyPermissions([...keyPermissions, perm]);
    }
  };

  const isExpired = (key) => key.expiresAt && Date.now() > key.expiresAt;

  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-500/20 rounded-lg">
            <Key className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h2 className="font-semibold text-white">API Keys</h2>
            <p className="text-sm text-slate-400">Manage programmatic access to UCP</p>
          </div>
        </div>
        <Button
          onClick={() => setShowCreate(true)}
          className="bg-amber-500 hover:bg-amber-600"
          size="sm"
        >
          <Plus className="w-4 h-4 mr-1" />
          New Key
        </Button>
      </div>

      {/* New Key Created Banner */}
      <AnimatePresence>
        {newKey && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4"
          >
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
                <span className="font-medium text-emerald-400">API Key Created</span>
              </div>
              <p className="text-sm text-slate-300 mb-3">
                Copy this key now. You won't be able to see it again!
              </p>
              <div className="flex gap-2">
                <Input
                  value={newKey.fullKey}
                  readOnly
                  className="flex-1 font-mono text-sm bg-slate-900 border-slate-700 text-white"
                />
                <Button
                  onClick={() => handleCopy(newKey.fullKey, 'new')}
                  variant="outline"
                  className="border-emerald-500 text-emerald-400"
                >
                  {copied === 'new' ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
              <Button
                onClick={() => setNewKey(null)}
                variant="ghost"
                size="sm"
                className="mt-3 text-slate-400"
              >
                Dismiss
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Key Modal */}
      <AnimatePresence>
        {showCreate && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 overflow-hidden"
          >
            <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4 space-y-4">
              <h3 className="font-medium text-white">Create New API Key</h3>
              
              <div>
                <label className="text-sm text-slate-400 block mb-1">Key Name</label>
                <Input
                  value={keyName}
                  onChange={(e) => setKeyName(e.target.value)}
                  placeholder="e.g., Production Server"
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>

              <div>
                <label className="text-sm text-slate-400 block mb-2">Permissions</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {PERMISSIONS.map(perm => {
                    const Icon = perm.icon;
                    const isSelected = keyPermissions.includes(perm.id);
                    return (
                      <button
                        key={perm.id}
                        onClick={() => togglePermission(perm.id)}
                        className={`p-2 rounded-lg border text-left transition-colors ${
                          isSelected
                            ? 'bg-amber-500/20 border-amber-500/50 text-amber-400'
                            : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-600'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4" />
                          <span className="text-sm">{perm.name}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-slate-400 block mb-1">Rate Limit (per hour)</label>
                  <Input
                    type="number"
                    value={rateLimit}
                    onChange={(e) => setRateLimit(e.target.value)}
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>
                <div>
                  <label className="text-sm text-slate-400 block mb-1">Expires</label>
                  <select
                    value={expiresIn}
                    onChange={(e) => setExpiresIn(e.target.value)}
                    className="w-full h-10 px-3 rounded-md bg-slate-800 border border-slate-700 text-white"
                  >
                    <option value="never">Never</option>
                    <option value="7d">7 Days</option>
                    <option value="30d">30 Days</option>
                    <option value="90d">90 Days</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  onClick={handleCreateKey}
                  className="bg-amber-500 hover:bg-amber-600"
                >
                  Generate Key
                </Button>
                <Button
                  onClick={() => setShowCreate(false)}
                  variant="ghost"
                  className="text-slate-400"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Keys List */}
      {loading ? (
        <div className="space-y-2">
          {[1, 2].map(i => (
            <div key={i} className="bg-slate-900/50 rounded-lg p-3 animate-pulse">
              <div className="h-4 bg-slate-700 rounded w-1/3" />
            </div>
          ))}
        </div>
      ) : keys.length === 0 ? (
        <div className="text-center py-8 text-slate-500">
          <Key className="w-10 h-10 mx-auto mb-2 opacity-50" />
          <p>No API keys yet</p>
          <p className="text-sm">Create one to enable programmatic access</p>
        </div>
      ) : (
        <div className="space-y-2">
          {keys.map(key => (
            <motion.div
              key={key.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`bg-slate-900/50 border rounded-lg p-3 ${
                key.status === 'revoked' ? 'border-rose-500/30 opacity-60' :
                isExpired(key) ? 'border-amber-500/30' :
                'border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-white">{key.name}</span>
                    {key.status === 'revoked' && (
                      <span className="px-2 py-0.5 bg-rose-500/20 text-rose-400 text-xs rounded">Revoked</span>
                    )}
                    {key.status === 'active' && isExpired(key) && (
                      <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 text-xs rounded">Expired</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                    <span className="font-mono">{key.keyPrefix}</span>
                    <span>•</span>
                    <span>{key.usageCount || 0} uses</span>
                    <span>•</span>
                    <span>{key.rateLimit}/hr limit</span>
                    {key.lastUsedAt && (
                      <>
                        <span>•</span>
                        <span>Last: {new Date(key.lastUsedAt).toLocaleDateString()}</span>
                      </>
                    )}
                  </div>
                  <div className="flex gap-1 mt-2">
                    {key.permissions?.map(p => (
                      <span key={p} className="px-1.5 py-0.5 bg-slate-700/50 text-slate-400 text-xs rounded">
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="flex gap-1">
                  {key.status === 'active' && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowDeleteConfirm(key.id)}
                      className="text-slate-400 hover:text-rose-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>

              {/* Delete/Revoke Confirmation */}
              <AnimatePresence>
                {showDeleteConfirm === key.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-3 pt-3 border-t border-slate-700"
                  >
                    <div className="flex items-center gap-2 text-amber-400 mb-2">
                      <AlertTriangle className="w-4 h-4" />
                      <span className="text-sm">Revoke this API key?</span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleRevokeKey(key.id)}
                        className="bg-rose-500 hover:bg-rose-600"
                      >
                        Revoke
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteKey(key.id)}
                        className="text-slate-400"
                      >
                        Delete Permanently
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setShowDeleteConfirm(null)}
                        className="text-slate-400"
                      >
                        Cancel
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      )}

      {/* HMAC Usage Guide */}
      <div className="mt-4 p-3 bg-slate-900/50 border border-slate-700 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <Shield className="w-4 h-4 text-cyan-400" />
          <span className="text-sm font-medium text-white">HMAC Authentication</span>
        </div>
        <p className="text-xs text-slate-400 mb-2">
          Sign your UCP packets with HMAC-SHA256 for secure API access:
        </p>
        <pre className="text-xs text-slate-500 bg-slate-800 rounded p-2 overflow-x-auto">
{`// Generate signature
signature = HMAC-SHA256(packet_json, api_key)

// Include in packet header
X-UCP-Signature: {signature}
X-UCP-Key-Prefix: ucp_XXXX...`}
        </pre>
      </div>
    </div>
  );
}

// Export utilities for use in execution engine
export { ApiKeyRepo, generateHMAC, hashApiKey };