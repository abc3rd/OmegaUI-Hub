import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Cloud, Shield, FileText, Activity, Plus, 
  RefreshCw, Lock, Zap, Database
} from 'lucide-react';
import { Button } from "@/components/ui/button";

import GlytchAvatar from '../components/glytch/GlytchAvatar';
import GlytchMessage from '../components/glytch/GlytchMessage';
import SyncStatusCard from '../components/dashboard/SyncStatusCard';
import VaultStatsCard from '../components/dashboard/VaultStatsCard';
import ActivityFeed from '../components/dashboard/ActivityFeed';
import AddConnectionModal from '../components/connections/AddConnectionModal';

export default function Dashboard() {
  const [showAddConnection, setShowAddConnection] = useState(false);
  const [glytchStatus, setGlytchStatus] = useState('idle');
  const [glytchMessage, setGlytchMessage] = useState('');
  const queryClient = useQueryClient();

  const { data: connections = [], isLoading: connectionsLoading } = useQuery({
    queryKey: ['connections'],
    queryFn: () => base44.entities.CloudConnection.list()
  });

  const { data: files = [] } = useQuery({
    queryKey: ['vault-files'],
    queryFn: () => base44.entities.VaultFile.list()
  });

  const { data: logs = [] } = useQuery({
    queryKey: ['activity-logs'],
    queryFn: () => base44.entities.ActivityLog.list('-created_date', 10)
  });

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me()
  });

  const createConnectionMutation = useMutation({
    mutationFn: (data) => base44.entities.CloudConnection.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connections'] });
      setGlytchStatus('success');
      setGlytchMessage('New cloud node established. Sync-lock initiated. Base 44 protocol active.');
      base44.entities.ActivityLog.create({
        event_type: 'connection_added',
        severity: 'info',
        message: 'New cloud connection established',
        details: 'Sync-lock protocol initiated'
      });
    }
  });

  useEffect(() => {
    // Set initial GLYTCH message
    setGlytchMessage(`Sync is life. Identity is key. Welcome back, ${user?.full_name || 'User'}. All sectors nominal.`);
  }, [user]);

  const handleSync = async (connection) => {
    setGlytchStatus('syncing');
    setGlytchMessage(`Initiating sync for ${connection.display_name}. Scanning remote sectors...`);
    
    try {
      const response = await base44.functions.invoke('googleDriveSync', {
        connection_id: connection.id
      });

      if (response.data.success) {
        setGlytchStatus('success');
        setGlytchMessage(`Sync complete: ${response.data.files_synced} files processed. ${response.data.total_size_mb} MB secured.`);
      } else {
        setGlytchStatus('error');
        setGlytchMessage(`Sync error: ${response.data.error}`);
      }
      
      queryClient.invalidateQueries({ queryKey: ['connections'] });
      queryClient.invalidateQueries({ queryKey: ['vault-files'] });
      queryClient.invalidateQueries({ queryKey: ['activity-logs'] });
    } catch (err) {
      setGlytchStatus('error');
      setGlytchMessage(`Sync failed: ${err.message}`);
    }
  };

  const totalFiles = files.length;
  const totalSize = files.reduce((sum, f) => sum + (f.file_size_kb || 0), 0) / 1024;
  const encryptedFiles = files.filter(f => f.is_encrypted).length;
  const activeConnections = connections.filter(c => c.status === 'connected').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <GlytchAvatar status={glytchStatus} size="sm" />
              <div>
                <h1 className="text-xl font-bold tracking-tight">
                  <span className="text-white">Arc</span>
                  <span className="text-[#ea00ea]"> Vault</span>
                </h1>
                <p className="text-xs text-slate-500 font-mono">Base 44 Protocol</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowAddConnection(true)}
                className="border-slate-700 text-slate-300 hover:bg-slate-800"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Node
              </Button>
              <a href="https://face2face.omegaui.com" target="_blank" rel="noopener noreferrer">
                <Button 
                  size="sm"
                  className="bg-[#ea00ea] hover:bg-[#ea00ea]/80"
                >
                  <Lock className="w-4 h-4 mr-2" />
                  Face 2 Face
                </Button>
              </a>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* GLYTCH Status Message */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <GlytchMessage 
            message={glytchMessage} 
            type={glytchStatus === 'success' ? 'success' : glytchStatus === 'error' ? 'alert' : 'info'} 
          />
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <VaultStatsCard
            title="Active Nodes"
            value={activeConnections}
            subtitle={`${connections.length} total configured`}
            icon={Cloud}
            color="#00d4ff"
          />
          <VaultStatsCard
            title="Protected Files"
            value={totalFiles}
            subtitle={`${encryptedFiles} encrypted`}
            icon={FileText}
            color="#00ff88"
          />
          <VaultStatsCard
            title="Vault Size"
            value={`${totalSize.toFixed(1)} MB`}
            subtitle="Base 44 compressed"
            icon={Database}
            color="#ea00ea"
          />
          <VaultStatsCard
            title="Sync Status"
            value="Live"
            subtitle="Zero-latency mirror active"
            icon={Zap}
            color="#00ff88"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cloud Connections */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Cloud className="w-5 h-5 text-[#00d4ff]" />
                Connected Nodes
              </h2>
              <button className="text-sm text-slate-500 hover:text-slate-300 flex items-center gap-1">
                <RefreshCw className="w-4 h-4" />
                Sync All
              </button>
            </div>

            {connections.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-slate-900/50 border border-slate-800 rounded-2xl p-12 text-center"
              >
                <Cloud className="w-16 h-16 mx-auto mb-4 text-slate-700" />
                <h3 className="text-lg font-medium text-slate-400 mb-2">No Cloud Nodes Connected</h3>
                <p className="text-sm text-slate-600 mb-6">Add your first cloud storage to begin synchronization</p>
                <Button 
                  onClick={() => setShowAddConnection(true)}
                  className="bg-[#00d4ff] hover:bg-[#00d4ff]/80"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Connect Cloud Storage
                </Button>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {connections.map((connection) => (
                  <SyncStatusCard 
                    key={connection.id} 
                    connection={connection} 
                    onSync={handleSync}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Activity Feed */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-[#ea00ea]" />
                Activity Log
              </h2>
            </div>
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4 max-h-[500px] overflow-y-auto">
              <ActivityFeed logs={logs} />
            </div>
          </div>
        </div>
      </main>

      {/* Add Connection Modal */}
      <AddConnectionModal
        isOpen={showAddConnection}
        onClose={() => setShowAddConnection(false)}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['connections'] });
          queryClient.invalidateQueries({ queryKey: ['activity-logs'] });
        }}
      />
    </div>
  );
}