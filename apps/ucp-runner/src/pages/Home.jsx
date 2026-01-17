import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { 
  Package, 
  Plus, 
  Download, 
  FileText, 
  Zap,
  RefreshCw,
  Inbox,
  Sparkles,
  FileCode,
  Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PacketRepo, ReceiptRepo, SettingsRepo, TemplateRepo, initDB } from '@/components/ucp/UCPDatabase';
import { getDemoTemplates } from '@/components/ucp/DemoTemplates';
import { getDemoPackets } from '@/components/ucp/DemoPackets';
import PacketCard from '@/components/ucp/PacketCard';
import ReceiptCard from '@/components/ucp/ReceiptCard';
import DemoScriptPanel from '@/components/ucp/DemoScriptPanel';

export default function Home() {
  const [packets, setPackets] = useState([]);
  const [receipts, setReceipts] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [templateSearch, setTemplateSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingDemo, setLoadingDemo] = useState(false);

  const loadData = async () => {
    setLoading(true);
    await initDB();
    
    // Load templates, create demo templates if none exist
    let templatesData = await TemplateRepo.listAll();
    if (templatesData.length === 0) {
      const demos = getDemoTemplates();
      for (const tpl of demos) {
        await TemplateRepo.insert(tpl);
      }
      templatesData = await TemplateRepo.listAll();
    }
    
    const [packetsData, receiptsData] = await Promise.all([
      PacketRepo.listRecent(10),
      ReceiptRepo.listRecent(5)
    ]);
    setPackets(packetsData);
    setReceipts(receiptsData);
    setTemplates(templatesData);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleLoadDemoPack = async () => {
    setLoadingDemo(true);
    const demoEndpoint = await SettingsRepo.get('demoEndpoint', 'https://httpbin.org/post');
    const demoPackets = getDemoPackets(demoEndpoint);
    
    for (const packet of demoPackets) {
      await PacketRepo.insert(packet);
    }
    
    await loadData();
    setLoadingDemo(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-xl border-b border-slate-800">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-cyan-500 to-teal-500 rounded-xl">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">UCP Runner</h1>
                <p className="text-xs text-slate-400">Omega UI, LLC</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={loadData}
                className="text-slate-400 hover:text-white"
              >
                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              </Button>
              <Link to={createPageUrl('Analytics')}>
                <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                  Analytics
                </Button>
              </Link>
              <Link to={createPageUrl('Settings')}>
                <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                  Settings
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Demo Script Panel */}
        <DemoScriptPanel />

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Link to={createPageUrl('CommandBuilder')} className="block">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="h-full bg-gradient-to-br from-violet-500/20 to-purple-500/20 border border-violet-500/30 rounded-xl p-4 hover:border-violet-400/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-violet-500/20 rounded-lg">
                  <Sparkles className="w-5 h-5 text-violet-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Commands</h3>
                  <p className="text-sm text-slate-400">Build UCP</p>
                </div>
              </div>
            </motion.div>
          </Link>

          <Link to={createPageUrl('Import')} className="block">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="h-full bg-gradient-to-br from-cyan-500/20 to-teal-500/20 border border-cyan-500/30 rounded-xl p-4 hover:border-cyan-400/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-cyan-500/20 rounded-lg">
                  <Plus className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Import</h3>
                  <p className="text-sm text-slate-400">Paste JSON</p>
                </div>
              </div>
            </motion.div>
          </Link>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleLoadDemoPack}
            disabled={loadingDemo}
            className="h-full bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-xl p-4 hover:border-amber-400/50 transition-colors text-left disabled:opacity-50"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-500/20 rounded-lg">
                <Download className={`w-5 h-5 text-amber-400 ${loadingDemo ? 'animate-pulse' : ''}`} />
              </div>
              <div>
                <h3 className="font-semibold text-white">Demo</h3>
                <p className="text-sm text-slate-400">Load Packets</p>
              </div>
            </div>
          </motion.button>
        </div>

        {/* Templates Library */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FileCode className="w-5 h-5 text-violet-400" />
              <h2 className="text-lg font-semibold text-white">Templates</h2>
              <span className="text-sm text-slate-500">({templates.length})</span>
            </div>
            <Link to={createPageUrl('TemplateLibrary')}>
              <Button variant="ghost" size="sm" className="text-violet-400 hover:text-violet-300">
                View All
              </Button>
            </Link>
          </div>

          {templates.length === 0 ? (
            <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6 text-center">
              <p className="text-slate-500 text-sm">No templates yet. Load the demo pack to get started.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {templates.slice(0, 3).map((template) => (
                <Link key={template.id} to={createPageUrl(`TemplateDetail?templateId=${template.id}`)}>
                  <motion.div
                    whileHover={{ scale: 1.01 }}
                    className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 hover:border-violet-500/30 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-violet-500/20 rounded-lg">
                        <FileCode className="w-4 h-4 text-violet-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-white truncate">{template.name}</p>
                        <p className="text-xs text-slate-400 truncate">{template.intent}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-slate-500">{template.reuseCount || 0}x reused</p>
                        <p className="text-xs text-emerald-400">
                          {template.baselinePromptTokens + template.baselineCompletionTokens} tokens saved/run
                        </p>
                      </div>
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Recent Packets */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Package className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg font-semibold text-white">Recent Packets</h2>
            <span className="text-sm text-slate-500">({packets.length})</span>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-slate-800/50 rounded-xl p-4 animate-pulse">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-slate-700 rounded-lg" />
                    <div className="flex-1">
                      <div className="h-4 bg-slate-700 rounded w-1/3 mb-2" />
                      <div className="h-3 bg-slate-700 rounded w-1/2" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : packets.length === 0 ? (
            <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-8 text-center">
              <Inbox className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400">No packets yet</p>
              <p className="text-sm text-slate-500 mt-1">
                Import a packet or load the demo pack to get started
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {packets.map((packet, index) => (
                <PacketCard key={packet.id} packet={packet} index={index} />
              ))}
            </div>
          )}
        </section>

        {/* Recent Receipts */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-5 h-5 text-slate-400" />
            <h2 className="text-lg font-semibold text-white">Recent Receipts</h2>
            <span className="text-sm text-slate-500">({receipts.length})</span>
          </div>

          {receipts.length === 0 ? (
            <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6 text-center">
              <p className="text-slate-500 text-sm">No receipts yet. Run a packet to generate one.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {receipts.map((receipt, index) => (
                <ReceiptCard key={receipt.id} receipt={receipt} index={index} />
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="max-w-4xl mx-auto px-4 py-8 text-center border-t border-slate-800 mt-8">
        <p className="text-slate-500 text-sm">
          Powered by UCP – Patent Pending
        </p>
        <p className="text-slate-600 text-xs mt-1">
          © {new Date().getFullYear()} Omega UI, LLC
        </p>
      </footer>
    </div>
  );
}