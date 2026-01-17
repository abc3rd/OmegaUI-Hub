import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft,
  FileText,
  Languages,
  Code,
  HelpCircle,
  BarChart3,
  RefreshCw,
  ListOrdered,
  Zap,
  ChevronRight,
  Play,
  Save
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { UCP_COMMAND_TYPES, generateCommandPacket } from '@/components/ucp/CommandTemplates';
import { PacketRepo, initDB } from '@/components/ucp/UCPDatabase';
import QRCodeGenerator from '@/components/ucp/QRCodeGenerator';

const ICONS = {
  FileText,
  Languages,
  Code,
  HelpCircle,
  BarChart3,
  RefreshCw,
  ListOrdered
};

const COLORS = {
  cyan: 'from-cyan-500 to-cyan-600',
  violet: 'from-violet-500 to-violet-600',
  emerald: 'from-emerald-500 to-emerald-600',
  amber: 'from-amber-500 to-amber-600',
  blue: 'from-blue-500 to-blue-600',
  rose: 'from-rose-500 to-rose-600',
  teal: 'from-teal-500 to-teal-600'
};

export default function CommandBuilder() {
  const navigate = useNavigate();
  const [selectedCommand, setSelectedCommand] = useState(null);
  const [input, setInput] = useState('');
  const [customArgs, setCustomArgs] = useState({});
  const [generatedPacket, setGeneratedPacket] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleSelectCommand = (cmdId) => {
    setSelectedCommand(cmdId);
    setCustomArgs({ ...UCP_COMMAND_TYPES[cmdId].defaultArgs });
    setGeneratedPacket(null);
  };

  const handleGenerate = () => {
    const packet = generateCommandPacket(selectedCommand, input, customArgs);
    setGeneratedPacket(packet);
  };

  const handleSaveAndRun = async () => {
    if (!generatedPacket) return;
    
    setSaving(true);
    await initDB();
    await PacketRepo.insert(generatedPacket);
    setSaving(false);
    
    navigate(createPageUrl(`Run?packetId=${generatedPacket.id}`));
  };

  const handleSave = async () => {
    if (!generatedPacket) return;
    
    setSaving(true);
    await initDB();
    await PacketRepo.insert(generatedPacket);
    setSaving(false);
    
    navigate(createPageUrl(`PacketDetail?packetId=${generatedPacket.id}`));
  };

  const cmd = selectedCommand ? UCP_COMMAND_TYPES[selectedCommand] : null;
  const Icon = cmd ? ICONS[cmd.icon] : null;

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
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Command Builder</h1>
                <p className="text-sm text-slate-400">Create UCP commands</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Command Type Selection */}
        <section>
          <h2 className="text-lg font-semibold text-white mb-4">Select Command Type</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.values(UCP_COMMAND_TYPES).map((cmdType) => {
              const CmdIcon = ICONS[cmdType.icon];
              const isSelected = selectedCommand === cmdType.id;
              return (
                <motion.button
                  key={cmdType.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSelectCommand(cmdType.id)}
                  className={`p-4 rounded-xl border transition-all text-left ${
                    isSelected
                      ? `bg-gradient-to-br ${COLORS[cmdType.color]} border-transparent`
                      : 'bg-slate-800/50 border-slate-700/50 hover:border-slate-600'
                  }`}
                >
                  <CmdIcon className={`w-6 h-6 mb-2 ${isSelected ? 'text-white' : `text-${cmdType.color}-400`}`} />
                  <p className={`font-semibold ${isSelected ? 'text-white' : 'text-white'}`}>{cmdType.name}</p>
                  <p className={`text-xs mt-1 ${isSelected ? 'text-white/70' : 'text-slate-400'}`}>{cmdType.description}</p>
                </motion.button>
              );
            })}
          </div>
        </section>

        {/* Command Configuration */}
        <AnimatePresence mode="wait">
          {selectedCommand && (
            <motion.section
              key={selectedCommand}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              <div className={`bg-${cmd.color}-500/10 border border-${cmd.color}-500/30 rounded-xl p-5`}>
                <div className="flex items-center gap-3 mb-4">
                  <Icon className={`w-6 h-6 text-${cmd.color}-400`} />
                  <div>
                    <h3 className="font-semibold text-white">{cmd.name} Command</h3>
                    <p className="text-sm text-slate-400">{cmd.description}</p>
                  </div>
                </div>

                {/* Input */}
                <div className="mb-4">
                  <label className="block text-sm text-slate-300 mb-2">Input Text</label>
                  <Textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={`Enter text to ${cmd.name.toLowerCase()}...`}
                    className="bg-slate-900 border-slate-700 text-white min-h-24"
                  />
                </div>

                {/* Command-specific options */}
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(cmd.defaultArgs).map(([key, defaultVal]) => (
                    <div key={key}>
                      <label className="block text-sm text-slate-300 mb-1 capitalize">{key.replace('_', ' ')}</label>
                      {typeof defaultVal === 'boolean' ? (
                        <button
                          onClick={() => setCustomArgs(prev => ({ ...prev, [key]: !prev[key] }))}
                          className={`w-full p-2 rounded-lg border text-left ${
                            customArgs[key] 
                              ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400'
                              : 'bg-slate-800 border-slate-700 text-slate-400'
                          }`}
                        >
                          {customArgs[key] ? 'Yes' : 'No'}
                        </button>
                      ) : (
                        <Input
                          value={customArgs[key] || defaultVal}
                          onChange={(e) => setCustomArgs(prev => ({ ...prev, [key]: e.target.value }))}
                          className="bg-slate-900 border-slate-700 text-white"
                        />
                      )}
                    </div>
                  ))}
                </div>

                {/* Generate Button */}
                <Button
                  onClick={handleGenerate}
                  disabled={!input.trim()}
                  className={`w-full mt-4 bg-gradient-to-r ${COLORS[cmd.color]} text-white`}
                >
                  Generate UCP Packet
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* Generated Packet */}
        <AnimatePresence>
          {generatedPacket && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
                <h3 className="font-semibold text-white mb-3">Generated Packet</h3>
                <pre className="text-xs text-slate-300 bg-slate-900 rounded-lg p-4 overflow-x-auto max-h-48">
                  {JSON.stringify(generatedPacket, null, 2)}
                </pre>
              </div>

              {/* QR Code */}
              <QRCodeGenerator data={generatedPacket} title={`${cmd.name} Command`} />

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  variant="outline"
                  className="border-slate-600 text-slate-300 py-6"
                >
                  <Save className="w-5 h-5 mr-2" />
                  Save Packet
                </Button>
                <Button
                  onClick={handleSaveAndRun}
                  disabled={saving}
                  className="bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 py-6"
                >
                  <Play className="w-5 h-5 mr-2" />
                  Save & Run
                </Button>
              </div>
            </motion.section>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}