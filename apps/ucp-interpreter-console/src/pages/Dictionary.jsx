import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { cn } from '@/lib/utils';
import { Plus, BookOpen, RefreshCw, Download, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from 'sonner';

import DictionaryEntryCard from '@/components/dictionary/DictionaryEntryCard';
import DictionaryEntryForm from '@/components/dictionary/DictionaryEntryForm';

export default function Dictionary() {
  const [entries, setEntries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyEntry, setHistoryEntry] = useState(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    setIsLoading(true);
    try {
      const result = await base44.functions.invoke('ucpDictionary', { action: 'list' });
      if (result.data.success) {
        setEntries(result.data.entries);
      }
    } catch (err) {
      toast.error('Failed to load dictionary');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSeed = async () => {
    try {
      const result = await base44.functions.invoke('ucpDictionary', { action: 'seed' });
      if (result.data.success) {
        toast.success(`Seeded ${result.data.created_count} default entries`);
        loadEntries();
      }
    } catch (err) {
      toast.error('Failed to seed dictionary');
    }
  };

  const handleSave = async (formData) => {
    setIsSaving(true);
    try {
      const action = editingEntry ? 'update' : 'create';
      const result = await base44.functions.invoke('ucpDictionary', {
        action,
        entryId: editingEntry?.id,
        ...formData
      });

      if (result.data.success) {
        toast.success(editingEntry ? 'Entry updated' : 'Entry created');
        setFormOpen(false);
        setEditingEntry(null);
        loadEntries();
      } else {
        toast.error(result.data.error || 'Failed to save entry');
      }
    } catch (err) {
      toast.error('Failed to save entry');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (entry) => {
    try {
      const result = await base44.functions.invoke('ucpDictionary', {
        action: 'delete',
        entryId: entry.id
      });

      if (result.data.success) {
        toast.success('Entry deleted');
        loadEntries();
      } else {
        toast.error(result.data.error || 'Failed to delete entry');
      }
    } catch (err) {
      toast.error('Failed to delete entry');
    }
  };

  const handleEdit = (entry) => {
    setEditingEntry(entry);
    setFormOpen(true);
  };

  const handleViewHistory = (entry) => {
    setHistoryEntry(entry);
    setHistoryOpen(true);
  };

  const filteredEntries = entries.filter(entry => {
    const matchesSearch = !searchQuery || 
      entry.command_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || entry.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categories = ['all', 'intent', 'constraint', 'safety', 'tool', 'execution', 'fallback'];

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
                <h1 className="text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">UCP Dictionary</h1>
                <p className="text-xs text-slate-500">Command definitions and schemas</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={loadEntries}>
                <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
              </Button>
              <Button variant="outline" size="sm" onClick={handleSeed}>
                <Download className="w-4 h-4 mr-2" />
                Seed Defaults
              </Button>
              <Button onClick={() => { setEditingEntry(null); setFormOpen(true); }}>
                <Plus className="w-4 h-4 mr-2" />
                Add Entry
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <Input
            placeholder="Search commands..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-xs"
          />
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map(cat => (
                <SelectItem key={cat} value={cat}>
                  {cat === 'all' ? 'All Categories' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-48 bg-slate-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : filteredEntries.length === 0 ? (
          <div className="text-center py-16">
            <BookOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-700 mb-2">No Dictionary Entries</h3>
            <p className="text-slate-500 mb-6">
              {entries.length === 0 
                ? "Seed the default entries or create your own"
                : "No entries match your search"}
            </p>
            {entries.length === 0 && (
              <div className="flex gap-3 justify-center">
                <Button variant="outline" onClick={handleSeed}>
                  <Download className="w-4 h-4 mr-2" />
                  Seed Defaults
                </Button>
                <Button onClick={() => { setEditingEntry(null); setFormOpen(true); }}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Entry
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEntries.map(entry => (
              <DictionaryEntryCard
                key={entry.id}
                entry={entry}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onViewHistory={handleViewHistory}
              />
            ))}
          </div>
        )}
      </main>

      <DictionaryEntryForm
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditingEntry(null);
        }}
        entry={editingEntry}
        onSave={handleSave}
        isSaving={isSaving}
      />

      {/* History Dialog */}
      <Dialog open={historyOpen} onOpenChange={setHistoryOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="w-5 h-5" />
              Audit History
            </DialogTitle>
          </DialogHeader>
          {historyEntry && (
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {historyEntry.audit_log && historyEntry.audit_log.length > 0 ? (
                historyEntry.audit_log.map((log, i) => (
                  <div key={i} className="bg-slate-50 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-slate-700 capitalize">
                        {log.action}
                      </span>
                      <span className="text-xs text-slate-500">v{log.version}</span>
                    </div>
                    <div className="text-xs text-slate-500">
                      <span>{log.by}</span>
                      <span className="mx-2">•</span>
                      <span>{new Date(log.at).toLocaleString()}</span>
                    </div>
                    {log.changes && (
                      <div className="mt-2 text-xs text-slate-600">
                        Changed: {log.changes.join(', ')}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500 text-center py-4">No history available</p>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

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