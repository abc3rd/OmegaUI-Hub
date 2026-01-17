import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { 
  Search, Filter, Grid, List, Shield, 
  Upload, FolderOpen, FileText, Image, 
  Film, Music, Archive, ChevronDown
} from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import FileCard from '../components/vault/FileCard';
import GlytchAvatar from '../components/glytch/GlytchAvatar';
import GlytchMessage from '../components/glytch/GlytchMessage';

export default function Vault() {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [selectedProvider, setSelectedProvider] = useState('all');
  const [selectedType, setSelectedType] = useState('all');

  const { data: files = [], isLoading } = useQuery({
    queryKey: ['vault-files'],
    queryFn: () => base44.entities.VaultFile.list('-last_modified')
  });

  const { data: connections = [] } = useQuery({
    queryKey: ['connections'],
    queryFn: () => base44.entities.CloudConnection.list()
  });

  // Filter files
  const filteredFiles = files.filter(file => {
    const matchesSearch = !searchQuery || 
      file.file_name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesProvider = selectedProvider === 'all' || 
      file.source_provider === selectedProvider;
    const matchesType = selectedType === 'all' || 
      (file.file_type && file.file_type.includes(selectedType));
    return matchesSearch && matchesProvider && matchesType;
  });

  // Stats
  const totalFiles = files.length;
  const encryptedCount = files.filter(f => f.is_encrypted).length;
  const snapshotCount = files.reduce((sum, f) => sum + (f.snapshot_count || 1), 0);

  const handleRestore = (file) => {
    console.log('Restore snapshot for:', file.file_name);
  };

  const handleView = (file) => {
    if (file.file_url) {
      window.open(file.file_url, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <GlytchAvatar status="idle" size="sm" />
              <div>
                <h1 className="text-xl font-bold tracking-tight">
                  <span className="text-white">Arc</span>
                  <span className="text-[#4bce2a]"> Vault</span>
                </h1>
                <p className="text-xs text-slate-500 font-mono">Base 44 Secure Storage</p>
              </div>
            </div>

            <Button className="bg-[#4bce2a] hover:bg-[#4bce2a]/80 text-black">
              <Upload className="w-4 h-4 mr-2" />
              Upload Files
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Status Banner */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <GlytchMessage 
            message={`Vault secure. ${totalFiles} files protected with Base 44 encryption. ${snapshotCount} recovery snapshots available.`}
            type="success"
          />
        </motion.div>

        {/* Stats Bar */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#2699fe]/20 flex items-center justify-center">
              <FileText className="w-6 h-6 text-[#2699fe]" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalFiles}</p>
              <p className="text-sm text-slate-500">Total Files</p>
            </div>
          </div>
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#4bce2a]/20 flex items-center justify-center">
              <Shield className="w-6 h-6 text-[#4bce2a]" />
            </div>
            <div>
              <p className="text-2xl font-bold">{encryptedCount}</p>
              <p className="text-sm text-slate-500">Encrypted</p>
            </div>
          </div>
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#ea00ea]/20 flex items-center justify-center">
              <Archive className="w-6 h-6 text-[#ea00ea]" />
            </div>
            <div>
              <p className="text-2xl font-bold">{snapshotCount}</p>
              <p className="text-sm text-slate-500">Snapshots</p>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <Input
              placeholder="Search vault files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-slate-900 border-slate-800 text-white placeholder:text-slate-600"
            />
          </div>

          <div className="flex gap-3">
            <Select value={selectedProvider} onValueChange={setSelectedProvider}>
              <SelectTrigger className="w-40 bg-slate-900 border-slate-800 text-white">
                <SelectValue placeholder="All Sources" />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-slate-800">
                <SelectItem value="all">All Sources</SelectItem>
                <SelectItem value="google_drive">Google Drive</SelectItem>
                <SelectItem value="onedrive">OneDrive</SelectItem>
                <SelectItem value="dropbox">Dropbox</SelectItem>
                <SelectItem value="local">Local Upload</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-40 bg-slate-900 border-slate-800 text-white">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-slate-800">
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="image">Images</SelectItem>
                <SelectItem value="video">Videos</SelectItem>
                <SelectItem value="pdf">Documents</SelectItem>
                <SelectItem value="audio">Audio</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-slate-800 text-white' : 'text-slate-500'}`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-slate-800 text-white' : 'text-slate-500'}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Files Grid */}
        {filteredFiles.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-slate-900/50 border border-slate-800 rounded-2xl p-16 text-center"
          >
            <FolderOpen className="w-20 h-20 mx-auto mb-6 text-slate-700" />
            <h3 className="text-xl font-medium text-slate-400 mb-2">Vault Empty</h3>
            <p className="text-sm text-slate-600 mb-6 max-w-md mx-auto">
              No files have been synced yet. Connect a cloud storage node to begin automatic synchronization, 
              or upload files directly to the vault.
            </p>
            <Button className="bg-[#4bce2a] hover:bg-[#4bce2a]/80 text-black">
              <Upload className="w-4 h-4 mr-2" />
              Upload Your First File
            </Button>
          </motion.div>
        ) : (
          <div className={viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
            : 'space-y-3'
          }>
            {filteredFiles.map((file) => (
              <FileCard 
                key={file.id} 
                file={file} 
                onRestore={handleRestore}
                onView={handleView}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}