import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { cn } from '@/lib/utils';
import { Plus, Server, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

import ProviderCard from '@/components/providers/ProviderCard';
import ProviderForm from '@/components/providers/ProviderForm';

export default function Providers() {
  const [providers, setProviders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingProvider, setEditingProvider] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [testingId, setTestingId] = useState(null);
  const [testResults, setTestResults] = useState({});

  useEffect(() => {
    loadProviders();
  }, []);

  const loadProviders = async () => {
    setIsLoading(true);
    try {
      const result = await base44.functions.invoke('providerConfig', { action: 'list' });
      if (result.data.success) {
        setProviders(result.data.configs);
      }
    } catch (err) {
      toast.error('Failed to load providers');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (formData) => {
    setIsSaving(true);
    try {
      const action = editingProvider ? 'update' : 'create';
      const result = await base44.functions.invoke('providerConfig', {
        action,
        configId: editingProvider?.id,
        ...formData
      });

      if (result.data.success) {
        toast.success(editingProvider ? 'Provider updated' : 'Provider created');
        setFormOpen(false);
        setEditingProvider(null);
        loadProviders();
      } else {
        toast.error(result.data.error || 'Failed to save provider');
      }
    } catch (err) {
      toast.error('Failed to save provider');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (provider) => {
    try {
      const result = await base44.functions.invoke('providerConfig', {
        action: 'delete',
        configId: provider.id
      });

      if (result.data.success) {
        toast.success('Provider deleted');
        loadProviders();
      } else {
        toast.error(result.data.error || 'Failed to delete provider');
      }
    } catch (err) {
      toast.error('Failed to delete provider');
    }
  };

  const handleTest = async (provider) => {
    setTestingId(provider.id);
    try {
      const result = await base44.functions.invoke('providerConfig', {
        action: 'test',
        configId: provider.id
      });

      setTestResults(prev => ({
        ...prev,
        [provider.id]: result.data.test_result
      }));

      if (result.data.test_result?.connected) {
        toast.success('Connection successful');
      } else {
        toast.error('Connection failed');
      }
    } catch (err) {
      setTestResults(prev => ({
        ...prev,
        [provider.id]: { connected: false, error: err.message }
      }));
      toast.error('Test failed');
    } finally {
      setTestingId(null);
    }
  };

  const handleSetDefault = async (provider) => {
    try {
      const result = await base44.functions.invoke('providerConfig', {
        action: 'update',
        configId: provider.id,
        is_default: true
      });

      if (result.data.success) {
        toast.success('Default provider updated');
        loadProviders();
      }
    } catch (err) {
      toast.error('Failed to set default');
    }
  };

  const handleEdit = (provider) => {
    setEditingProvider(provider);
    setFormOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center" style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}>
                <div className="w-5 h-5 bg-white/90" style={{ clipPath: 'polygon(50% 20%, 90% 80%, 50% 95%, 10% 80%)' }} />
              </div>
              <div>
                <h1 className="text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">Provider Configuration</h1>
                <p className="text-xs text-slate-500">Manage AI provider endpoints</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={loadProviders}>
                <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
              </Button>
              <Button onClick={() => { setEditingProvider(null); setFormOpen(true); }}>
                <Plus className="w-4 h-4 mr-2" />
                Add Provider
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-64 bg-slate-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : providers.length === 0 ? (
          <div className="text-center py-16">
            <Server className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-700 mb-2">No Providers Configured</h3>
            <p className="text-slate-500 mb-6">Add a provider to start using the UCP interpreter</p>
            <Button onClick={() => { setEditingProvider(null); setFormOpen(true); }}>
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Provider
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {providers.map(provider => (
              <ProviderCard
                key={provider.id}
                provider={provider}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onTest={handleTest}
                onSetDefault={handleSetDefault}
                isTesting={testingId === provider.id}
                testResult={testResults[provider.id]}
              />
            ))}
          </div>
        )}
      </main>

      <ProviderForm
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditingProvider(null);
        }}
        provider={editingProvider}
        onSave={handleSave}
        isSaving={isSaving}
      />

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-sm text-center">
            Universal Command Protocol (UCP) — Confidential. © Omega UI, LLC
          </p>
        </div>
      </footer>
    </div>
  );
}