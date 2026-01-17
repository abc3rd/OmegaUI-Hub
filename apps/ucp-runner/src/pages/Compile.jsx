import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Sparkles,
  Search,
  FileCode,
  Plus,
  Link as LinkIcon,
  CheckCircle,
  AlertCircle,
  Zap,
  Target,
  Database,
  ArrowRight,
  Copy
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { TemplateRepo, PacketRepo, SettingsRepo, initDB } from '@/components/ucp/UCPDatabase';
import { findMatchingTemplates } from '@/components/ucp/TemplateMatcher';
import { getDemoTemplates } from '@/components/ucp/DemoTemplates';

export default function Compile() {
  const navigate = useNavigate();
  const [intent, setIntent] = useState('');
  const [templates, setTemplates] = useState([]);
  const [matches, setMatches] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [mode, setMode] = useState('search'); // 'search' | 'new'
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    packetJson: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [baselineSettings, setBaselineSettings] = useState({
    baselinePromptTokens: 500,
    baselineCompletionTokens: 200
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (intent.length > 2 && templates.length > 0) {
      const results = findMatchingTemplates(intent, templates);
      setMatches(results);
    } else {
      setMatches([]);
    }
  }, [intent, templates]);

  const loadData = async () => {
    setLoading(true);
    await initDB();
    
    // Load templates
    let allTemplates = await TemplateRepo.listAll();
    
    // If no templates, load demo templates
    if (allTemplates.length === 0) {
      const demos = getDemoTemplates();
      for (const tpl of demos) {
        await TemplateRepo.insert(tpl);
      }
      allTemplates = await TemplateRepo.listAll();
    }
    
    setTemplates(allTemplates);
    
    // Load baseline settings
    const promptTokens = await SettingsRepo.get('baselinePromptTokens', 500);
    const completionTokens = await SettingsRepo.get('baselineCompletionTokens', 200);
    setBaselineSettings({ baselinePromptTokens: promptTokens, baselineCompletionTokens: completionTokens });
    
    setLoading(false);
  };

  const handleSelectTemplate = (template) => {
    setSelectedTemplate(template);
    setMode('search');
  };

  const handleCreateFromTemplate = async () => {
    if (!selectedTemplate) return;
    
    setSaving(true);
    setError(null);
    
    // Parse packet JSON and create a new packet instance
    let packetData;
    try {
      packetData = JSON.parse(selectedTemplate.packetJson);
      packetData.id = `pkt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      packetData.templateId = selectedTemplate.id;
      if (packetData.meta) {
        packetData.meta.compiledFrom = selectedTemplate.name;
      }
    } catch (e) {
      setError('Invalid packet JSON in template');
      setSaving(false);
      return;
    }
    
    // Save packet
    await PacketRepo.insert(packetData);
    
    // Update template usage
    await TemplateRepo.incrementReuseCount(selectedTemplate.id);
    
    setSaving(false);
    
    // Navigate to packet detail
    navigate(createPageUrl(`PacketDetail?packetId=${packetData.id}`));
  };

  const handleCreateNewTemplate = async () => {
    if (!newTemplate.name || !newTemplate.packetJson) {
      setError('Please provide template name and packet JSON');
      return;
    }
    
    setSaving(true);
    setError(null);
    
    // Validate JSON
    try {
      JSON.parse(newTemplate.packetJson);
    } catch (e) {
      setError('Invalid JSON format');
      setSaving(false);
      return;
    }
    
    const templateId = `tpl_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    await TemplateRepo.insert({
      id: templateId,
      name: newTemplate.name,
      intent: intent,
      packetJson: newTemplate.packetJson,
      embeddingHint: intent,
      baselinePromptTokens: baselineSettings.baselinePromptTokens,
      baselineCompletionTokens: baselineSettings.baselineCompletionTokens
    });
    
    setSaving(false);
    
    // Navigate to template detail
    navigate(createPageUrl(`TemplateDetail?templateId=${templateId}`));
  };

  const getScoreColor = (score) => {
    if (score >= 70) return 'text-emerald-400 bg-emerald-500/20';
    if (score >= 40) return 'text-amber-400 bg-amber-500/20';
    return 'text-slate-400 bg-slate-500/20';
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
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-violet-500 to-purple-500 rounded-xl">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Compile</h1>
                <p className="text-sm text-slate-400">Match intent to templates</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Intent Input */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
          <label className="flex items-center gap-2 text-white font-medium mb-3">
            <Target className="w-5 h-5 text-violet-400" />
            What do you want to accomplish?
          </label>
          <Textarea
            value={intent}
            onChange={(e) => setIntent(e.target.value)}
            placeholder="Describe your intent... e.g., 'Capture a lead and send notification'"
            className="bg-slate-900 border-slate-700 text-white min-h-[100px]"
          />
        </div>

        {/* Mode Toggle */}
        <div className="flex gap-3">
          <Button
            variant={mode === 'search' ? 'default' : 'outline'}
            onClick={() => setMode('search')}
            className={mode === 'search' ? 'bg-violet-500 hover:bg-violet-600' : 'border-slate-600'}
          >
            <Search className="w-4 h-4 mr-2" />
            Match Existing Template
          </Button>
          <Button
            variant={mode === 'new' ? 'default' : 'outline'}
            onClick={() => setMode('new')}
            className={mode === 'new' ? 'bg-violet-500 hover:bg-violet-600' : 'border-slate-600'}
          >
            <Plus className="w-4 h-4 mr-2" />
            Create New Template
          </Button>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-rose-400" />
            <p className="text-rose-300">{error}</p>
          </div>
        )}

        {/* Search Mode - Template Matches */}
        {mode === 'search' && (
          <>
            {/* Matches */}
            {matches.length > 0 ? (
              <div className="space-y-3">
                <h3 className="text-white font-medium flex items-center gap-2">
                  <Database className="w-4 h-4 text-violet-400" />
                  Template Matches ({matches.length})
                </h3>
                {matches.map(({ template, score }) => (
                  <motion.button
                    key={template.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={() => handleSelectTemplate(template)}
                    className={`w-full p-4 rounded-xl border text-left transition-all ${
                      selectedTemplate?.id === template.id
                        ? 'bg-violet-500/20 border-violet-500/50'
                        : 'bg-slate-800/50 border-slate-700/50 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <FileCode className="w-4 h-4 text-cyan-400" />
                          <span className="font-medium text-white">{template.name}</span>
                          {selectedTemplate?.id === template.id && (
                            <CheckCircle className="w-4 h-4 text-violet-400" />
                          )}
                        </div>
                        <p className="text-sm text-slate-400 line-clamp-2">{template.intent}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                          <span>Reused {template.reuseCount || 0}x</span>
                          <span>Baseline: {template.baselinePromptTokens + template.baselineCompletionTokens} tokens</span>
                        </div>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(score)}`}>
                        {score}%
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            ) : intent.length > 2 ? (
              <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6 text-center">
                <Search className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400">No matching templates found</p>
                <p className="text-sm text-slate-500 mt-1">Try different keywords or create a new template</p>
              </div>
            ) : null}

            {/* Selected Template Action */}
            {selectedTemplate && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-violet-500/20 to-purple-500/20 border border-violet-500/30 rounded-xl p-5"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <LinkIcon className="w-5 h-5 text-violet-400" />
                    <span className="font-medium text-white">Cache HIT</span>
                  </div>
                  <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-sm rounded-full">
                    Will save ~{selectedTemplate.baselinePromptTokens + selectedTemplate.baselineCompletionTokens} tokens
                  </span>
                </div>
                <p className="text-slate-300 text-sm mb-4">
                  Using template "{selectedTemplate.name}" will avoid LLM compilation and save tokens.
                </p>
                <Button
                  onClick={handleCreateFromTemplate}
                  disabled={saving}
                  className="w-full bg-violet-500 hover:bg-violet-600"
                >
                  {saving ? (
                    <>Creating...</>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 mr-2" />
                      Create Packet from Template
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </motion.div>
            )}

            {/* All Templates */}
            {templates.length > 0 && !intent && (
              <div className="space-y-3">
                <h3 className="text-white font-medium">All Templates ({templates.length})</h3>
                {templates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => handleSelectTemplate(template)}
                    className={`w-full p-4 rounded-xl border text-left transition-all ${
                      selectedTemplate?.id === template.id
                        ? 'bg-violet-500/20 border-violet-500/50'
                        : 'bg-slate-800/50 border-slate-700/50 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <FileCode className="w-5 h-5 text-cyan-400" />
                      <div className="flex-1">
                        <p className="font-medium text-white">{template.name}</p>
                        <p className="text-sm text-slate-400 truncate">{template.intent}</p>
                      </div>
                      <span className="text-xs text-slate-500">{template.reuseCount || 0}x reused</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </>
        )}

        {/* New Template Mode */}
        {mode === 'new' && (
          <div className="space-y-4">
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-400 mt-0.5" />
              <div>
                <p className="text-amber-300 font-medium">Cache MISS</p>
                <p className="text-sm text-amber-200/70">
                  Creating a new template. First run will not have token savings, but subsequent runs will.
                </p>
              </div>
            </div>

            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5 space-y-4">
              <div>
                <label className="text-white text-sm font-medium mb-2 block">Template Name</label>
                <Input
                  value={newTemplate.name}
                  onChange={(e) => setNewTemplate(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Lead Capture Workflow"
                  className="bg-slate-900 border-slate-700 text-white"
                />
              </div>

              <div>
                <label className="text-white text-sm font-medium mb-2 block">Packet JSON</label>
                <Textarea
                  value={newTemplate.packetJson}
                  onChange={(e) => setNewTemplate(prev => ({ ...prev, packetJson: e.target.value }))}
                  placeholder="Paste your UCP packet JSON here..."
                  className="bg-slate-900 border-slate-700 text-white font-mono text-sm min-h-[200px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-400 text-xs mb-1 block">Baseline Prompt Tokens</label>
                  <p className="text-white font-medium">{baselineSettings.baselinePromptTokens}</p>
                </div>
                <div>
                  <label className="text-slate-400 text-xs mb-1 block">Baseline Completion Tokens</label>
                  <p className="text-white font-medium">{baselineSettings.baselineCompletionTokens}</p>
                </div>
              </div>

              <Button
                onClick={handleCreateNewTemplate}
                disabled={saving || !newTemplate.name || !newTemplate.packetJson}
                className="w-full bg-violet-500 hover:bg-violet-600"
              >
                {saving ? 'Creating...' : 'Create Template'}
              </Button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="max-w-4xl mx-auto px-4 py-8 text-center border-t border-slate-800 mt-8">
        <p className="text-slate-500 text-sm">
          Powered by UCP – Patent Pending
        </p>
      </footer>
    </div>
  );
}