import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Settings as SettingsIcon,
  Globe,
  Bell,
  BellOff,
  CheckCircle,
  Info,
  Zap,
  Shield,
  ExternalLink,
  Coins,
  DollarSign
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SettingsRepo, initDB } from '@/components/ucp/UCPDatabase';
import TokenModelSelector from '@/components/ucp/TokenModelSelector';
import ApiKeyManager from '@/components/ucp/ApiKeyManager';

export default function Settings() {
  const [demoEndpoint, setDemoEndpoint] = useState('https://httpbin.org/post');
  const [notificationStatus, setNotificationStatus] = useState('default');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  
  // Token Cost Model
  const [tokenModel, setTokenModel] = useState({
    modelName: 'gpt-4o-mini',
    inputPrice: 0.00015,
    outputPrice: 0.0006,
    baselinePromptTokens: 500,
    baselineCompletionTokens: 200
  });
  const [savingTokenModel, setSavingTokenModel] = useState(false);
  const [savedTokenModel, setSavedTokenModel] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      await initDB();
      const endpoint = await SettingsRepo.get('demoEndpoint', 'https://httpbin.org/post');
      setDemoEndpoint(endpoint);

      // Load token model settings
      const modelName = await SettingsRepo.get('modelName', 'gpt-4o-mini');
      const inputPrice = await SettingsRepo.get('inputPrice', 0.00015);
      const outputPrice = await SettingsRepo.get('outputPrice', 0.0006);
      const baselinePromptTokens = await SettingsRepo.get('baselinePromptTokens', 500);
      const baselineCompletionTokens = await SettingsRepo.get('baselineCompletionTokens', 200);
      
      setTokenModel({
        modelName,
        inputPrice,
        outputPrice,
        baselinePromptTokens,
        baselineCompletionTokens
      });

      if ('Notification' in window) {
        setNotificationStatus(Notification.permission);
      } else {
        setNotificationStatus('unsupported');
      }
    };
    loadSettings();
  }, []);

  const handleSaveEndpoint = async () => {
    setSaving(true);
    await SettingsRepo.set('demoEndpoint', demoEndpoint);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setNotificationStatus(permission);
    }
  };

  const handleSaveTokenModel = async () => {
    setSavingTokenModel(true);
    await SettingsRepo.set('modelName', tokenModel.modelName);
    await SettingsRepo.set('inputPrice', parseFloat(tokenModel.inputPrice));
    await SettingsRepo.set('outputPrice', parseFloat(tokenModel.outputPrice));
    await SettingsRepo.set('baselinePromptTokens', parseInt(tokenModel.baselinePromptTokens));
    await SettingsRepo.set('baselineCompletionTokens', parseInt(tokenModel.baselineCompletionTokens));
    setSavingTokenModel(false);
    setSavedTokenModel(true);
    setTimeout(() => setSavedTokenModel(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-xl border-b border-slate-800">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link to={createPageUrl('Home')}>
              <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold text-white">Settings</h1>
              <p className="text-sm text-slate-400">Configure UCP Runner</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Demo Endpoint */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-cyan-500/20 rounded-lg">
              <Globe className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h2 className="font-semibold text-white">Demo Endpoint</h2>
              <p className="text-sm text-slate-400">URL used for HTTP demo packets</p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <Input
              value={demoEndpoint}
              onChange={(e) => setDemoEndpoint(e.target.value)}
              placeholder="https://example.com/webhook"
              className="flex-1 bg-slate-900 border-slate-700 text-white"
            />
            <Button
              onClick={handleSaveEndpoint}
              disabled={saving}
              className={saved ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-cyan-500 hover:bg-cyan-600'}
            >
              {saved ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Saved
                </>
              ) : (
                'Save'
              )}
            </Button>
          </div>

          <p className="text-xs text-slate-500 mt-3">
            Recommended: Use{' '}
            <a 
              href="https://httpbin.org" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-cyan-400 hover:underline"
            >
              httpbin.org
            </a>
            {' '}for testing or{' '}
            <a 
              href="https://webhook.site" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-cyan-400 hover:underline"
            >
              webhook.site
            </a>
            {' '}for inspecting requests
          </p>
        </div>

        {/* Token Cost Model - Full Selector */}
        <TokenModelSelector />

        {/* API Key Management */}
        <ApiKeyManager />

        {/* Notification Permission */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${
                notificationStatus === 'granted' ? 'bg-emerald-500/20' : 'bg-amber-500/20'
              }`}>
                {notificationStatus === 'granted' ? (
                  <Bell className="w-5 h-5 text-emerald-400" />
                ) : (
                  <BellOff className="w-5 h-5 text-amber-400" />
                )}
              </div>
              <div>
                <h2 className="font-semibold text-white">Notifications</h2>
                <p className="text-sm text-slate-400">
                  {notificationStatus === 'granted' && 'Notifications enabled'}
                  {notificationStatus === 'denied' && 'Notifications blocked'}
                  {notificationStatus === 'default' && 'Permission not requested'}
                  {notificationStatus === 'unsupported' && 'Not supported in this browser'}
                </p>
              </div>
            </div>

            {notificationStatus === 'default' && (
              <Button
                onClick={requestNotificationPermission}
                variant="outline"
                className="border-slate-600 text-slate-300"
              >
                Enable
              </Button>
            )}

            {notificationStatus === 'granted' && (
              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-sm rounded-full">
                Enabled
              </span>
            )}

            {notificationStatus === 'denied' && (
              <span className="px-3 py-1 bg-rose-500/20 text-rose-400 text-sm rounded-full">
                Blocked
              </span>
            )}
          </div>

          {notificationStatus === 'denied' && (
            <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg flex items-start gap-2">
              <Info className="w-4 h-4 text-amber-400 mt-0.5" />
              <p className="text-sm text-amber-300">
                Notifications are blocked. To enable, click the lock icon in your browser's address bar and allow notifications.
              </p>
            </div>
          )}
        </div>

        {/* About Section */}
        <div className="bg-gradient-to-br from-cyan-500/10 to-teal-500/10 border border-cyan-500/20 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-gradient-to-br from-cyan-500 to-teal-500 rounded-lg">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-semibold text-white">UCP Runner</h2>
              <p className="text-sm text-slate-400">Version 1.0.0</p>
            </div>
          </div>

          <p className="text-slate-300 text-sm mb-4">
            UCP Runner is a reference implementation of the Universal Command Protocol (UCP), 
            enabling deterministic, auditable command execution with cryptographic verification.
          </p>

          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <Shield className="w-4 h-4 text-cyan-400" />
              <span>Cryptographic receipt hashing (SHA-256)</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <CheckCircle className="w-4 h-4 text-cyan-400" />
              <span>Deterministic execution engine</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <Globe className="w-4 h-4 text-cyan-400" />
              <span>HTTP, Storage & Notification drivers</span>
            </div>
          </div>
        </div>

        {/* Documentation */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
          <h3 className="font-semibold text-white mb-4">Quick Start</h3>
          <div className="space-y-3 text-sm text-slate-300">
            <p><strong>1. Import a Packet:</strong> Paste valid UCP JSON or use the demo pack.</p>
            <p><strong>2. Review:</strong> Check required permissions and operation list.</p>
            <p><strong>3. Execute:</strong> Run the packet and watch live execution logs.</p>
            <p><strong>4. Verify:</strong> Receipt contains hashes for cryptographic verification.</p>
            <p><strong>5. Share:</strong> Export or share receipts as proof of execution.</p>
          </div>
        </div>

        {/* PWA Install Hint */}
        <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-5 text-center">
          <h3 className="font-semibold text-white mb-2">Install as App</h3>
          <p className="text-sm text-slate-400 mb-3">
            Add UCP Runner to your home screen for quick access and offline support.
          </p>
          <p className="text-xs text-slate-500">
            Use your browser's "Add to Home Screen" or "Install App" option
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-4xl mx-auto px-4 py-8 text-center border-t border-slate-800 mt-8">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Zap className="w-4 h-4 text-cyan-400" />
          <span className="text-slate-300 font-medium">Powered by UCP</span>
        </div>
        <p className="text-slate-500 text-sm">Patent Pending</p>
        <p className="text-slate-600 text-xs mt-2">
          © {new Date().getFullYear()} Omega UI, LLC. All rights reserved.
        </p>
      </footer>
    </div>
  );
}