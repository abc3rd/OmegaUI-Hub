import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Zap, Sparkles } from 'lucide-react';

import PromptOptimizer from '../components/ucp/PromptOptimizer';
import FileProcessor from '../components/ucp/FileProcessor';
import FileTransferHistory from '../components/ucp/FileTransferHistory';
import ConfigPanel from '../components/ucp/ConfigPanel';
import RequestHistory from '../components/ucp/RequestHistory';
import LocalAISetup from '../components/ucp/LocalAISetup';

export default function UcpTranslator() {
  const [config, setConfig] = useState({
    apiKey: '',
    temperature: 0.7,
    maxTokens: 1024,
    systemPrompt: 'You are an AI assistant that understands UCP. Execute the instruction on the data provided between [DATA:START] and [DATA:END].'
  });
  const [isLocked, setIsLocked] = useState(false);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    const user = await base44.auth.me();
    if (user?.ucp_config) {
      setConfig(user.ucp_config);
    }
    if (user?.ucp_locked) {
      setIsLocked(user.ucp_locked);
    }
  };

  const saveConfig = async (newConfig) => {
    setConfig(newConfig);
    await base44.auth.updateMe({ ucp_config: newConfig });
  };
  
  const toggleLock = async () => {
    const newLocked = !isLocked;
    setIsLocked(newLocked);
    await base44.auth.updateMe({ ucp_locked: newLocked });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950">
      {/* Animated background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <header className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-2xl">
              <Zap className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-5xl font-bold text-white mb-3">
            Universal Command Protocol
          </h1>
          <h2 className="text-2xl font-semibold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
            Reduce Token Usage by up to 70%
          </h2>
          <p className="text-slate-400 mt-4 max-w-2xl mx-auto">
            Transform verbose prompts into efficient UCP commands. Save tokens, reduce costs, and maintain accuracy.
          </p>
        </header>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <PromptOptimizer config={config} />
            <FileProcessor />
            <FileTransferHistory />
            <LocalAISetup />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <ConfigPanel config={config} onSave={saveConfig} isLocked={isLocked} onToggleLock={toggleLock} />
            <RequestHistory />
          </div>
        </div>
      </div>
    </div>
  );
}