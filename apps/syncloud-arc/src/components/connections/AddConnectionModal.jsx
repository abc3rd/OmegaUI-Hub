import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, Loader2, AlertTriangle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { base44 } from '@/api/base44Client';

const providers = [
  { id: 'google_drive', name: 'Google Drive', icon: '🔵', description: 'Connect your Google Drive account', enabled: true },
  { id: 'onedrive', name: 'Microsoft OneDrive', icon: '🔷', description: 'Sync with OneDrive storage', enabled: false },
  { id: 'dropbox', name: 'Dropbox', icon: '📦', description: 'Connect Dropbox storage', enabled: false },
  { id: 'icloud', name: 'Apple iCloud', icon: '☁️', description: 'Access iCloud Drive files', enabled: false },
  { id: 'mega', name: 'MEGA', icon: '🔴', description: 'Secure cloud from MEGA', enabled: false },
  { id: 'box', name: 'Box', icon: '📁', description: 'Enterprise cloud storage', enabled: false },
];

export default function AddConnectionModal({ isOpen, onClose, onSuccess }) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState(null);

  const handleSelectProvider = async (provider) => {
    if (!provider.enabled) {
      setError(`${provider.name} integration coming soon.`);
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      if (provider.id === 'google_drive') {
        const redirect_uri = `${window.location.origin}/OAuthCallback`;
        
        const response = await base44.functions.invoke('googleDriveAuth', {
          action: 'get_auth_url',
          redirect_uri
        });

        if (response.data.auth_url) {
          window.location.href = response.data.auth_url;
        } else {
          setError('Failed to generate authorization URL.');
          setIsConnecting(false);
        }
      }
    } catch (err) {
      setError(err.message || 'Connection failed.');
      setIsConnecting(false);
    }
  };

  const handleClose = () => {
    setError(null);
    setIsConnecting(false);
    onClose?.();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-800">
            <div>
              <h2 className="text-lg font-semibold text-white">Connect Cloud Storage</h2>
              <p className="text-sm text-slate-500">Select a provider to sync with Arc Vault</p>
            </div>
            <button onClick={handleClose} className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3 bg-[#ea00ea]/10 border border-[#ea00ea]/30 rounded-lg flex items-center gap-3"
              >
                <AlertTriangle className="w-5 h-5 text-[#ea00ea]" />
                <p className="text-sm text-[#ea00ea]">{error}</p>
              </motion.div>
            )}

            {isConnecting ? (
              <div className="py-12 text-center">
                <Loader2 className="w-12 h-12 text-[#00d4ff] mx-auto animate-spin mb-4" />
                <p className="text-white font-medium">Redirecting to authorization...</p>
                <p className="text-sm text-slate-500 mt-1">Please wait</p>
              </div>
            ) : (
              <div className="space-y-3">
                {providers.map((provider) => (
                  <motion.button
                    key={provider.id}
                    whileHover={{ scale: provider.enabled ? 1.01 : 1 }}
                    whileTap={{ scale: provider.enabled ? 0.99 : 1 }}
                    onClick={() => handleSelectProvider(provider)}
                    className={`w-full flex items-center gap-4 p-4 border rounded-xl transition-colors group ${
                      provider.enabled 
                        ? 'bg-slate-800/50 hover:bg-slate-800 border-slate-700 hover:border-slate-600' 
                        : 'bg-slate-900/50 border-slate-800 opacity-50 cursor-not-allowed'
                    }`}
                  >
                    <span className="text-2xl">{provider.icon}</span>
                    <div className="flex-1 text-left">
                      <p className="font-medium text-white">{provider.name}</p>
                      <p className="text-xs text-slate-500">
                        {provider.enabled ? provider.description : 'Coming soon'}
                      </p>
                    </div>
                    {provider.enabled && (
                      <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-slate-400 transition-colors" />
                    )}
                  </motion.button>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}