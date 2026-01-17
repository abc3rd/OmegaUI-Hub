import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, 
  ChevronDown, 
  CheckCircle, 
  Plus,
  Trash2,
  DollarSign
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SettingsRepo, initDB } from './UCPDatabase';

const DEFAULT_MODELS = [
  { name: 'gpt-4o-mini', inputPrice: 0.00015, outputPrice: 0.0006 },
  { name: 'gpt-4o', inputPrice: 0.0025, outputPrice: 0.01 },
  { name: 'gpt-4-turbo', inputPrice: 0.01, outputPrice: 0.03 },
  { name: 'claude-3-haiku', inputPrice: 0.00025, outputPrice: 0.00125 },
  { name: 'claude-3-sonnet', inputPrice: 0.003, outputPrice: 0.015 },
  { name: 'claude-3-opus', inputPrice: 0.015, outputPrice: 0.075 }
];

export default function TokenModelSelector({ onModelChange, compact = false }) {
  const [models, setModels] = useState(DEFAULT_MODELS);
  const [selectedModel, setSelectedModel] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [showCustom, setShowCustom] = useState(false);
  const [customModel, setCustomModel] = useState({ name: '', inputPrice: '', outputPrice: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    await initDB();
    
    // Load current selection
    const modelName = await SettingsRepo.get('modelName', 'gpt-4o-mini');
    const inputPrice = await SettingsRepo.get('inputPrice', 0.00015);
    const outputPrice = await SettingsRepo.get('outputPrice', 0.0006);
    
    // Load custom models
    const customModels = await SettingsRepo.get('customModels', []);
    if (customModels.length > 0) {
      setModels([...DEFAULT_MODELS, ...customModels]);
    }
    
    // Find or create selected model
    const found = models.find(m => m.name === modelName);
    setSelectedModel(found || { name: modelName, inputPrice, outputPrice });
    
    setLoading(false);
  };

  const handleSelectModel = async (model) => {
    setSelectedModel(model);
    setIsOpen(false);
    
    await SettingsRepo.set('modelName', model.name);
    await SettingsRepo.set('inputPrice', model.inputPrice);
    await SettingsRepo.set('outputPrice', model.outputPrice);
    
    if (onModelChange) {
      onModelChange(model);
    }
  };

  const handleAddCustomModel = async () => {
    if (!customModel.name || !customModel.inputPrice || !customModel.outputPrice) return;
    
    const newModel = {
      name: customModel.name,
      inputPrice: parseFloat(customModel.inputPrice),
      outputPrice: parseFloat(customModel.outputPrice),
      custom: true
    };
    
    const updatedModels = [...models, newModel];
    setModels(updatedModels);
    
    // Save custom models
    const customModels = updatedModels.filter(m => m.custom);
    await SettingsRepo.set('customModels', customModels);
    
    // Select the new model
    await handleSelectModel(newModel);
    
    setCustomModel({ name: '', inputPrice: '', outputPrice: '' });
    setShowCustom(false);
  };

  const handleDeleteCustomModel = async (modelName) => {
    const updatedModels = models.filter(m => m.name !== modelName);
    setModels(updatedModels);
    
    const customModels = updatedModels.filter(m => m.custom);
    await SettingsRepo.set('customModels', customModels);
    
    // If deleted the selected model, switch to default
    if (selectedModel?.name === modelName) {
      await handleSelectModel(DEFAULT_MODELS[0]);
    }
  };

  if (loading) {
    return (
      <div className="h-10 bg-slate-800 rounded-lg animate-pulse" />
    );
  }

  if (compact) {
    return (
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm hover:border-slate-600 transition-colors"
        >
          <Brain className="w-4 h-4 text-violet-400" />
          <span className="text-white">{selectedModel?.name}</span>
          <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full left-0 mt-2 w-64 bg-slate-800 border border-slate-700 rounded-xl shadow-xl z-50 overflow-hidden"
            >
              <div className="max-h-64 overflow-y-auto">
                {models.map((model) => (
                  <button
                    key={model.name}
                    onClick={() => handleSelectModel(model)}
                    className={`w-full px-4 py-3 flex items-center justify-between hover:bg-slate-700/50 transition-colors ${
                      selectedModel?.name === model.name ? 'bg-violet-500/20' : ''
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {selectedModel?.name === model.name && (
                        <CheckCircle className="w-4 h-4 text-violet-400" />
                      )}
                      <span className="text-white text-sm">{model.name}</span>
                      {model.custom && (
                        <span className="text-xs text-violet-400 px-1.5 py-0.5 bg-violet-500/20 rounded">custom</span>
                      )}
                    </div>
                    <span className="text-xs text-slate-400">
                      ${model.inputPrice}/${model.outputPrice}
                    </span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-violet-500/20 rounded-lg">
            <Brain className="w-5 h-5 text-violet-400" />
          </div>
          <div>
            <h3 className="font-semibold text-white">Token Cost Model</h3>
            <p className="text-sm text-slate-400">Select or add custom pricing</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowCustom(!showCustom)}
          className="text-violet-400 hover:text-violet-300"
        >
          <Plus className="w-4 h-4 mr-1" />
          Add Model
        </Button>
      </div>

      {/* Current Selection */}
      {selectedModel && (
        <div className="bg-violet-500/10 border border-violet-500/30 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-violet-400" />
              <span className="font-medium text-white">{selectedModel.name}</span>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <span className="text-slate-400">
                <DollarSign className="w-3 h-3 inline" />{selectedModel.inputPrice}/1K in
              </span>
              <span className="text-slate-400">
                <DollarSign className="w-3 h-3 inline" />{selectedModel.outputPrice}/1K out
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Add Custom Model Form */}
      <AnimatePresence>
        {showCustom && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mb-4 overflow-hidden"
          >
            <div className="bg-slate-900/50 rounded-lg p-4 space-y-3">
              <Input
                placeholder="Model name (e.g., my-custom-model)"
                value={customModel.name}
                onChange={(e) => setCustomModel(prev => ({ ...prev, name: e.target.value }))}
                className="bg-slate-800 border-slate-700 text-white"
              />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Input Price ($/1K tokens)</label>
                  <Input
                    type="number"
                    step="0.0001"
                    placeholder="0.00015"
                    value={customModel.inputPrice}
                    onChange={(e) => setCustomModel(prev => ({ ...prev, inputPrice: e.target.value }))}
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Output Price ($/1K tokens)</label>
                  <Input
                    type="number"
                    step="0.0001"
                    placeholder="0.0006"
                    value={customModel.outputPrice}
                    onChange={(e) => setCustomModel(prev => ({ ...prev, outputPrice: e.target.value }))}
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>
              </div>
              <Button
                onClick={handleAddCustomModel}
                disabled={!customModel.name || !customModel.inputPrice || !customModel.outputPrice}
                className="w-full bg-violet-500 hover:bg-violet-600"
              >
                Add Custom Model
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Model List */}
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {models.map((model) => (
          <button
            key={model.name}
            onClick={() => handleSelectModel(model)}
            className={`w-full p-3 rounded-lg border flex items-center justify-between transition-all ${
              selectedModel?.name === model.name
                ? 'bg-violet-500/10 border-violet-500/50'
                : 'bg-slate-900/50 border-slate-700/50 hover:border-slate-600'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="font-medium text-white">{model.name}</span>
              {model.custom && (
                <span className="text-xs text-violet-400 px-1.5 py-0.5 bg-violet-500/20 rounded">custom</span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-400">
                ${model.inputPrice} / ${model.outputPrice}
              </span>
              {model.custom && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteCustomModel(model.name);
                  }}
                  className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}