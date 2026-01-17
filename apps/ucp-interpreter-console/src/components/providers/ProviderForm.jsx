import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Eye, EyeOff, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function ProviderForm({
  open,
  onOpenChange,
  provider = null,
  onSave,
  isSaving = false
}) {
  const [formData, setFormData] = useState({
    name: '',
    provider_type: 'OPENAI_COMPAT',
    base_url: '',
    api_key: '',
    default_model: 'gpt-3.5-turbo',
    context_window: 4096,
    max_tokens_default: 1024,
    cost_per_1k_input: 0,
    cost_per_1k_output: 0,
    is_default: false
  });
  const [showApiKey, setShowApiKey] = useState(false);

  useEffect(() => {
    if (provider) {
      setFormData({
        name: provider.name || '',
        provider_type: provider.provider_type || 'OPENAI_COMPAT',
        base_url: provider.base_url || '',
        api_key: '', // Never pre-fill API key
        default_model: provider.default_model || 'gpt-3.5-turbo',
        context_window: provider.context_window || 4096,
        max_tokens_default: provider.max_tokens_default || 1024,
        cost_per_1k_input: provider.cost_per_1k_input || 0,
        cost_per_1k_output: provider.cost_per_1k_output || 0,
        is_default: provider.is_default || false
      });
    } else {
      setFormData({
        name: '',
        provider_type: 'OPENAI_COMPAT',
        base_url: '',
        api_key: '',
        default_model: 'gpt-3.5-turbo',
        context_window: 4096,
        max_tokens_default: 1024,
        cost_per_1k_input: 0,
        cost_per_1k_output: 0,
        is_default: false
      });
    }
    setShowApiKey(false);
  }, [provider, open]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const presetConfigs = {
    'OPENAI_COMPAT': {
      base_url: 'https://api.openai.com',
      default_model: 'gpt-3.5-turbo',
      context_window: 4096,
      cost_per_1k_input: 0.0015,
      cost_per_1k_output: 0.002
    },
    'LM_STUDIO': {
      base_url: 'http://localhost:1234',
      default_model: 'local-model',
      context_window: 4096,
      cost_per_1k_input: 0,
      cost_per_1k_output: 0
    }
  };

  const handleProviderTypeChange = (type) => {
    setFormData(prev => ({
      ...prev,
      provider_type: type,
      ...presetConfigs[type]
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{provider ? 'Edit Provider' : 'Add Provider'}</DialogTitle>
          <DialogDescription>
            Configure an AI provider endpoint for the UCP interpreter
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Provider Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="My OpenAI Provider"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="provider_type">Provider Type</Label>
            <Select 
              value={formData.provider_type} 
              onValueChange={handleProviderTypeChange}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="OPENAI_COMPAT">OpenAI Compatible</SelectItem>
                <SelectItem value="LM_STUDIO">LM Studio (Local)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="base_url">Base URL</Label>
            <Input
              id="base_url"
              value={formData.base_url}
              onChange={(e) => setFormData(prev => ({ ...prev, base_url: e.target.value }))}
              placeholder="https://api.openai.com"
              required
            />
            <p className="text-xs text-slate-500">
              The base URL for API requests (without /v1/chat/completions)
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="api_key">API Key</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="w-4 h-4 text-slate-400" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs text-xs">
                      API keys are encrypted before storage and never exposed to the browser.
                      {provider?.has_api_key && ' Leave blank to keep existing key.'}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="relative">
              <Input
                id="api_key"
                type={showApiKey ? 'text' : 'password'}
                value={formData.api_key}
                onChange={(e) => setFormData(prev => ({ ...prev, api_key: e.target.value }))}
                placeholder={provider?.has_api_key ? '••••••••••••' : 'sk-...'}
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                onClick={() => setShowApiKey(!showApiKey)}
              >
                {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="default_model">Default Model</Label>
              <Input
                id="default_model"
                value={formData.default_model}
                onChange={(e) => setFormData(prev => ({ ...prev, default_model: e.target.value }))}
                placeholder="gpt-3.5-turbo"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="context_window">Context Window</Label>
              <Input
                id="context_window"
                type="number"
                value={formData.context_window}
                onChange={(e) => setFormData(prev => ({ ...prev, context_window: parseInt(e.target.value) || 4096 }))}
                min={512}
                max={128000}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cost_input">Cost per 1K Input</Label>
              <Input
                id="cost_input"
                type="number"
                step="0.0001"
                value={formData.cost_per_1k_input}
                onChange={(e) => setFormData(prev => ({ ...prev, cost_per_1k_input: parseFloat(e.target.value) || 0 }))}
                min={0}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cost_output">Cost per 1K Output</Label>
              <Input
                id="cost_output"
                type="number"
                step="0.0001"
                value={formData.cost_per_1k_output}
                onChange={(e) => setFormData(prev => ({ ...prev, cost_per_1k_output: parseFloat(e.target.value) || 0 }))}
                min={0}
              />
            </div>
          </div>

          <div className="flex items-center justify-between py-2">
            <div className="space-y-0.5">
              <Label htmlFor="is_default">Set as Default</Label>
              <p className="text-xs text-slate-500">Use this provider by default</p>
            </div>
            <Switch
              id="is_default"
              checked={formData.is_default}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_default: checked }))}
            />
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? 'Saving...' : (provider ? 'Update' : 'Create')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}