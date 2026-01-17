import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

export default function OAuthCallback() {
  const [status, setStatus] = useState('processing');
  const [message, setMessage] = useState('Establishing secure connection...');

  useEffect(() => {
    const handleCallback = async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');
      const error = params.get('error');
      const state = params.get('state'); // Contains provider info

      if (error) {
        setStatus('error');
        setMessage('Authorization was denied or cancelled.');
        return;
      }

      if (!code) {
        setStatus('error');
        setMessage('No authorization code received.');
        return;
      }

      try {
        const redirect_uri = `${window.location.origin}${window.location.pathname}`;
        
        const response = await base44.functions.invoke('googleDriveAuth', {
          action: 'exchange_code',
          code,
          redirect_uri
        });

        if (response.data.success) {
          setStatus('success');
          setMessage('Google Drive connected successfully!');
          
          // Redirect to dashboard after 2 seconds
          setTimeout(() => {
            window.location.href = createPageUrl('Dashboard');
          }, 2000);
        } else {
          setStatus('error');
          setMessage(response.data.error || 'Failed to connect.');
        }
      } catch (err) {
        setStatus('error');
        setMessage(err.message || 'Connection failed.');
      }
    };

    handleCallback();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-8 max-w-md w-full text-center"
      >
        <div className="mb-6">
          {status === 'processing' && (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            >
              <Loader2 className="w-16 h-16 text-[#00d4ff] mx-auto" />
            </motion.div>
          )}
          {status === 'success' && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
            >
              <CheckCircle className="w-16 h-16 text-[#00ff88] mx-auto" />
            </motion.div>
          )}
          {status === 'error' && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
            >
              <XCircle className="w-16 h-16 text-[#ff0055] mx-auto" />
            </motion.div>
          )}
        </div>

        <h2 className="text-xl font-bold text-white mb-2">
          {status === 'processing' && 'Connecting...'}
          {status === 'success' && 'Connection Established'}
          {status === 'error' && 'Connection Failed'}
        </h2>
        
        <p className="text-slate-400 text-sm font-mono">{message}</p>

        {status === 'error' && (
          <button
            onClick={() => window.location.href = createPageUrl('Dashboard')}
            className="mt-6 px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors"
          >
            Return to Dashboard
          </button>
        )}

        {status === 'success' && (
          <p className="mt-4 text-xs text-slate-500">Redirecting to dashboard...</p>
        )}
      </motion.div>
    </div>
  );
}