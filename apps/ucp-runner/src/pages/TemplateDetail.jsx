import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  FileCode,
  Play,
  Trash2,
  Copy,
  CheckCircle,
  Hash,
  Clock,
  RefreshCw,
  Coins,
  Target,
  AlertTriangle,
  Zap,
  Tag,
  Package
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TemplateRepo, PacketRepo, initDB } from '@/components/ucp/UCPDatabase';
import { Badge } from '@/components/ui/badge';

export default function TemplateDetail() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const templateId = urlParams.get('templateId');

  const [template, setTemplate] = useState(null);
  const [linkedPackets, setLinkedPackets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadTemplate();
  }, [templateId]);

  const loadTemplate = async () => {
    await initDB();
    const tpl = await TemplateRepo.get(templateId);
    setTemplate(tpl);
    
    // Load packets using this template
    const allPackets = await PacketRepo.listRecent(100);
    const linked = allPackets.filter(pkt => pkt.templateId === templateId);
    setLinkedPackets(linked);
    
    setLoading(false);
  };

  const handleCopyJson = async () => {
    await navigator.clipboard.writeText(template.packetJson);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDelete = async () => {
    await TemplateRepo.delete(templateId);
    navigate(createPageUrl('Home'));
  };

  const handleCreatePacket = async () => {
    setCreating(true);
    
    let packetData;
    try {
      packetData = JSON.parse(template.packetJson);
      packetData.id = `pkt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      packetData.templateId = template.id;
      if (packetData.meta) {
        packetData.meta.compiledFrom = template.name;
      }
    } catch (e) {
      setCreating(false);
      return;
    }
    
    await PacketRepo.insert(packetData);
    await TemplateRepo.incrementReuseCount(template.id);
    
    setCreating(false);
    navigate(createPageUrl(`PacketDetail?packetId=${packetData.id}`));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
        >
          <FileCode className="w-8 h-8 text-violet-400" />
        </motion.div>
      </div>
    );
  }

  if (!template) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 flex flex-col items-center justify-center p-4">
        <FileCode className="w-16 h-16 text-slate-600 mb-4" />
        <h2 className="text-xl font-semibold text-white mb-2">Template Not Found</h2>
        <Link to={createPageUrl('Home')}>
          <Button className="bg-cyan-500 hover:bg-cyan-600">Go Home</Button>
        </Link>
      </div>
    );
  }

  const totalBaseline = template.baselinePromptTokens + template.baselineCompletionTokens;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-xl border-b border-slate-800">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to={createPageUrl('Home')}>
                <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-bold text-white truncate">{template.name}</h1>
                <p className="text-sm text-slate-400">Template Details</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowDeleteConfirm(true)}
              className="text-slate-400 hover:text-rose-400"
            >
              <Trash2 className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Template Info */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-slate-400 text-sm">
                <Hash className="w-4 h-4" />
                <span>Template ID</span>
              </div>
              <p className="font-mono text-white text-sm">{template.id}</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-slate-400 text-sm">
                <RefreshCw className="w-4 h-4" />
                <span>Reuse Count</span>
              </div>
              <p className="text-white font-semibold">{template.reuseCount || 0}x</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-slate-400 text-sm">
                <Clock className="w-4 h-4" />
                <span>Created</span>
              </div>
              <p className="text-white text-sm">
                {new Date(template.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-slate-400 text-sm">
                <Clock className="w-4 h-4" />
                <span>Last Used</span>
              </div>
              <p className="text-white text-sm">
                {template.lastUsedAt ? new Date(template.lastUsedAt).toLocaleDateString() : 'Never'}
              </p>
            </div>
          </div>
        </div>

        {/* Category & Tags */}
        {(template.category || (template.tags && template.tags.length > 0)) && (
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Tag className="w-5 h-5 text-cyan-400" />
              <h2 className="font-semibold text-white">Category & Tags</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {template.category && (
                <span className="px-3 py-1 bg-violet-500/20 text-violet-400 rounded-full text-sm">
                  {template.category}
                </span>
              )}
              {template.tags?.map((tag, i) => (
                <span key={i} className="px-3 py-1 bg-cyan-500/20 text-cyan-400 rounded-full text-sm">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Intent */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Target className="w-5 h-5 text-violet-400" />
            <h2 className="font-semibold text-white">Intent</h2>
          </div>
          <p className="text-slate-300">{template.intent}</p>
        </div>

        {/* Linked Packets */}
        {linkedPackets.length > 0 && (
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Package className="w-5 h-5 text-cyan-400" />
              <h2 className="font-semibold text-white">Packets Using This Template ({linkedPackets.length})</h2>
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {linkedPackets.map((pkt) => (
                <Link 
                  key={pkt.id} 
                  to={createPageUrl(`PacketDetail?packetId=${pkt.id}`)}
                  className="block p-3 bg-slate-900/50 rounded-lg hover:bg-slate-900 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">{pkt.name || pkt.id}</p>
                      <p className="text-xs text-slate-500">
                        Created {new Date(pkt.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    {pkt.lastStatus && (
                      <span className={`px-2 py-1 text-xs rounded ${
                        pkt.lastStatus === 'SUCCESS' 
                          ? 'bg-emerald-500/20 text-emerald-400' 
                          : 'bg-rose-500/20 text-rose-400'
                      }`}>
                        {pkt.lastStatus}
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Token Baseline */}
        <div className="bg-violet-500/10 border border-violet-500/30 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Coins className="w-5 h-5 text-violet-400" />
            <h2 className="font-semibold text-white">Baseline Token Cost</h2>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-slate-900/50 rounded-lg p-3">
              <p className="text-xs text-slate-400">Prompt Tokens</p>
              <p className="text-xl font-bold text-white">{template.baselinePromptTokens}</p>
            </div>
            <div className="bg-slate-900/50 rounded-lg p-3">
              <p className="text-xs text-slate-400">Completion Tokens</p>
              <p className="text-xl font-bold text-white">{template.baselineCompletionTokens}</p>
            </div>
            <div className="bg-emerald-500/20 rounded-lg p-3">
              <p className="text-xs text-slate-400">Total Saved/Run</p>
              <p className="text-xl font-bold text-emerald-400">{totalBaseline}</p>
            </div>
          </div>
          <p className="text-sm text-slate-400 mt-4">
            Each cache HIT saves {totalBaseline} tokens by avoiding LLM compilation.
          </p>
        </div>

        {/* Packet JSON */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FileCode className="w-5 h-5 text-cyan-400" />
              <h2 className="font-semibold text-white">Packet JSON</h2>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopyJson}
              className="text-slate-400 hover:text-white"
            >
              {copied ? <CheckCircle className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
              {copied ? 'Copied!' : 'Copy'}
            </Button>
          </div>
          <pre className="text-xs text-slate-300 bg-slate-900 rounded-lg p-4 overflow-x-auto max-h-64">
            {template.packetJson}
          </pre>
        </div>

        {/* Create Packet Button */}
        <Button
          onClick={handleCreatePacket}
          disabled={creating}
          className="w-full bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white font-semibold py-6 text-lg"
        >
          <Zap className="w-5 h-5 mr-2" />
          {creating ? 'Creating...' : 'Create Packet from Template'}
        </Button>
      </main>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={() => setShowDeleteConfirm(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-slate-800 border border-slate-700 rounded-xl p-6 max-w-sm w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-rose-500/20 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-rose-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">Delete Template?</h3>
            </div>
            <p className="text-slate-400 mb-6">
              This will permanently delete this template and cannot be undone.
            </p>
            <div className="flex gap-3">
              <Button
                variant="ghost"
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 text-slate-400"
              >
                Cancel
              </Button>
              <Button
                onClick={handleDelete}
                className="flex-1 bg-rose-500 hover:bg-rose-600 text-white"
              >
                Delete
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}