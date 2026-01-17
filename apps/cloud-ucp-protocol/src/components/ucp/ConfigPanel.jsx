import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Settings, Save, Plus, Trash2, Star, Eye, EyeOff, Lock, Unlock, ChevronDown, ChevronUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';

const AI_PROVIDERS = [
  { name: 'OpenAI', models: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo'], endpoint: 'https://api.openai.com/v1' },
  { name: 'Anthropic', models: ['claude-3-5-sonnet-20241022', 'claude-3-5-haiku-20241022', 'claude-3-opus-20240229'], endpoint: 'https://api.anthropic.com/v1' },
  { name: 'Google Gemini', models: ['gemini-2.0-flash-exp', 'gemini-1.5-pro', 'gemini-1.5-flash'], endpoint: 'https://generativelanguage.googleapis.com/v1' },
  { name: 'Cohere', models: ['command-r-plus', 'command-r', 'command'], endpoint: 'https://api.cohere.ai/v1' },
  { name: 'Mistral AI', models: ['mistral-large-latest', 'mistral-medium-latest', 'mistral-small-latest'], endpoint: 'https://api.mistral.ai/v1' },
  { name: 'Local LM Studio', models: ['Qwen2.5-VL-7B-Instruct-GGUF', 'local-model'], endpoint: 'http://100.119.81.65:1234/v1' },
  { name: 'Ollama', models: ['llama3.2', 'llama3.1', 'mistral', 'codellama', 'phi3', 'gemma2'], endpoint: 'http://localhost:11434/api/chat' },
  { name: 'Open WebUI', models: ['llama3.2', 'llama3.1', 'mistral', 'codellama'], endpoint: 'http://localhost:3000/api/chat/completions' },
  { name: 'AnythingLLM', models: ['ucp-workspace'], endpoint: 'http://localhost:3001/api' },
  { name: 'Text Generation WebUI', models: ['local-model'], endpoint: 'http://localhost:5000/v1/chat/completions' },
  { name: 'vLLM', models: ['local-model'], endpoint: 'http://localhost:8000/v1/chat/completions' },
  { name: 'LocalAI', models: ['gpt-3.5-turbo', 'llama3'], endpoint: 'http://localhost:8080/v1/chat/completions' },
  { name: 'GPT4All', models: ['gpt4all-model'], endpoint: 'http://localhost:4891/v1/chat/completions' },
  { name: 'Jan', models: ['local-model'], endpoint: 'http://localhost:1337/v1/chat/completions' },
  { name: 'Kobold', models: ['local-model'], endpoint: 'http://localhost:5001/api/v1/generate' },
  { name: 'Custom OpenAI-Compatible', models: ['custom-model'], endpoint: 'http://localhost:8080/v1/chat/completions' }
];

export default function ConfigPanel({ config, onSave, isLocked, onToggleLock }) {
  const [localConfig, setLocalConfig] = useState(config);
  const [showAddProvider, setShowAddProvider] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [newProvider, setNewProvider] = useState({
    provider_name: 'OpenAI',
    api_key: '',
    model_name: 'gpt-3.5-turbo',
    api_endpoint: 'https://api.openai.com/v1',
    is_active: true,
    is_default: false
  });
  const [showKeys, setShowKeys] = useState({});

  const queryClient = useQueryClient();

  const { data: providers, isLoading } = useQuery({
    queryKey: ['apiProviders'],
    queryFn: () => base44.entities.ApiProvider.list(),
    initialData: []
  });

  const defaultProvider = providers.find(p => p.is_default) || providers[0];

  const addProviderMutation = useMutation({
    mutationFn: (provider) => base44.entities.ApiProvider.create(provider),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['apiProviders'] });
      setShowAddProvider(false);
      setNewProvider({
        provider_name: 'OpenAI',
        api_key: '',
        model_name: 'gpt-3.5-turbo',
        api_endpoint: 'https://api.openai.com/v1',
        is_active: true,
        is_default: false
      });
    }
  });

  const deleteProviderMutation = useMutation({
    mutationFn: (id) => base44.entities.ApiProvider.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['apiProviders'] });
    }
  });

  const setDefaultProviderMutation = useMutation({
    mutationFn: async (providerId) => {
      // First, unset all other defaults
      await Promise.all(
        providers.map(p => 
          base44.entities.ApiProvider.update(p.id, { is_default: p.id === providerId })
        )
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['apiProviders'] });
    }
  });

  const handleSave = () => {
    onSave(localConfig);
  };

  const handleProviderChange = (field) => {
    const selectedProvider = AI_PROVIDERS.find(p => p.name === field);
    setNewProvider({
      ...newProvider,
      provider_name: field,
      api_endpoint: selectedProvider?.endpoint || '',
      model_name: selectedProvider?.models[0] || ''
    });
  };

  const toggleKeyVisibility = (providerId) => {
    setShowKeys(prev => ({ ...prev, [providerId]: !prev[providerId] }));
  };

  return (
    <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700 shadow-xl sticky top-6">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-white text-lg">
            <Settings className="w-5 h-5 text-slate-400" />
            Configuration
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={onToggleLock}
              className={`h-8 px-2 ${isLocked ? 'text-amber-400' : 'text-slate-400'}`}
            >
              {isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-8 px-2 text-slate-400"
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          </div>
        </div>
        
        {/* Compact view when collapsed */}
        {!isExpanded && (
          <div className="mt-2 text-xs text-slate-400">
            {defaultProvider ? (
              <div className="flex items-center gap-2">
                <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 text-xs">
                  {defaultProvider.provider_name}
                </Badge>
                <span className="text-slate-500">•</span>
                <span>{defaultProvider.model_name}</span>
                {isLocked && <Lock className="w-3 h-3 text-amber-400 ml-auto" />}
              </div>
            ) : (
              <span>No provider configured</span>
            )}
          </div>
        )}
      </CardHeader>
      
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
      <CardContent className="space-y-6 pt-4">
        {/* AI Providers Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-slate-300 font-semibold">AI Providers</Label>
            <Button
              size="sm"
              onClick={() => setShowAddProvider(!showAddProvider)}
              className="bg-slate-700 hover:bg-slate-600 text-white h-8"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add
            </Button>
          </div>

          <AnimatePresence>
            {showAddProvider && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-3 p-4 bg-slate-900/50 rounded-lg border border-slate-700"
              >
                <div>
                  <Label className="text-slate-400 text-xs">Provider</Label>
                  <Select
                    value={newProvider.provider_name}
                    onValueChange={handleProviderChange}
                  >
                    <SelectTrigger className="bg-slate-800 border-slate-600 text-slate-100 mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {AI_PROVIDERS.map(provider => (
                        <SelectItem key={provider.name} value={provider.name}>
                          {provider.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {newProvider.provider_name !== 'Local LM Studio' && (
                  <div>
                    <Label className="text-slate-400 text-xs">API Key</Label>
                    <Input
                      type="password"
                      value={newProvider.api_key}
                      onChange={(e) => setNewProvider({ ...newProvider, api_key: e.target.value })}
                      className="bg-slate-800 border-slate-600 text-slate-100 mt-1"
                      placeholder="Enter API key..."
                    />
                  </div>
                )}

                <div>
                  <Label className="text-slate-400 text-xs">Model</Label>
                  <Select
                    value={newProvider.model_name}
                    onValueChange={(value) => setNewProvider({ ...newProvider, model_name: value })}
                  >
                    <SelectTrigger className="bg-slate-800 border-slate-600 text-slate-100 mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {AI_PROVIDERS.find(p => p.name === newProvider.provider_name)?.models.map(model => (
                        <SelectItem key={model} value={model}>
                          {model}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => addProviderMutation.mutate(newProvider)}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    disabled={!newProvider.api_key && newProvider.provider_name !== 'Local LM Studio'}
                  >
                    Save Provider
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowAddProvider(false)}
                    className="bg-slate-800 border-slate-600 text-slate-300"
                  >
                    Cancel
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Provider List */}
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {providers.length === 0 ? (
              <div className="text-center py-6 text-slate-500 text-sm">
                <p>No AI providers configured</p>
                <p className="text-xs mt-1">Add your first provider to get started</p>
              </div>
            ) : (
              providers.map(provider => (
                <div
                  key={provider.id}
                  className="p-3 bg-slate-900/50 rounded-lg border border-slate-700 hover:border-slate-600 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-slate-200">{provider.provider_name}</span>
                      {provider.is_default && (
                        <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 h-5">
                          <Star className="w-3 h-3 mr-1 fill-amber-300" />
                          Default
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => setDefaultProviderMutation.mutate(provider.id)}
                        className="h-7 w-7 text-slate-400 hover:text-amber-400"
                        disabled={provider.is_default}
                      >
                        <Star className="w-3 h-3" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => deleteProviderMutation.mutate(provider.id)}
                        className="h-7 w-7 text-slate-400 hover:text-red-400"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-1 text-xs">
                    <div className="flex items-center justify-between text-slate-400">
                      <span>Model:</span>
                      <span className="text-slate-300 font-mono">{provider.model_name}</span>
                    </div>
                    {provider.api_key && (
                      <div className="flex items-center justify-between text-slate-400">
                        <span>API Key:</span>
                        <div className="flex items-center gap-2">
                          <span className="text-slate-300 font-mono">
                            {showKeys[provider.id] 
                              ? provider.api_key 
                              : '••••••••••••••••'}
                          </span>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => toggleKeyVisibility(provider.id)}
                            className="h-5 w-5 text-slate-400 hover:text-slate-200"
                          >
                            {showKeys[provider.id] ? (
                              <EyeOff className="w-3 h-3" />
                            ) : (
                              <Eye className="w-3 h-3" />
                            )}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* General Settings */}
        <div className="pt-4 border-t border-slate-700 space-y-4">
          <Label className="text-slate-300 font-semibold">General Settings</Label>
          
          <div>
            <Label className="text-slate-400 text-xs">System Prompt</Label>
            <Textarea
              value={localConfig.systemPrompt}
              onChange={(e) => setLocalConfig({ ...localConfig, systemPrompt: e.target.value })}
              rows={3}
              className="bg-slate-900/50 border-slate-600 text-slate-100 mt-1 text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-slate-400 text-xs">Temperature</Label>
              <Input
                type="number"
                step="0.1"
                min="0"
                max="2"
                value={localConfig.temperature}
                onChange={(e) => setLocalConfig({ ...localConfig, temperature: parseFloat(e.target.value) })}
                className="bg-slate-900/50 border-slate-600 text-slate-100 mt-1"
              />
            </div>
            <div>
              <Label className="text-slate-400 text-xs">Max Tokens</Label>
              <Input
                type="number"
                step="64"
                min="64"
                value={localConfig.maxTokens}
                onChange={(e) => setLocalConfig({ ...localConfig, maxTokens: parseInt(e.target.value) })}
                className="bg-slate-900/50 border-slate-600 text-slate-100 mt-1"
              />
            </div>
          </div>

          <Button
            onClick={() => {
              handleSave();
              onToggleLock();
              setIsExpanded(false);
            }}
            className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white"
          >
            <Lock className="w-4 h-4 mr-2" />
            Save & Lock Settings
          </Button>
          </div>
          </CardContent>
            </motion.div>
          )}
          </AnimatePresence>
          </Card>
          );
          }