import React from 'react';
import { motion } from 'framer-motion';
import { Cloud, RefreshCw, CheckCircle, AlertTriangle, Clock } from 'lucide-react';
import { format } from 'date-fns';

const providerIcons = {
  google_drive: '🔵',
  onedrive: '🔷',
  icloud: '☁️',
  dropbox: '📦',
  mega: '🔴',
  box: '📁',
  ftp: '🔌',
  sftp: '🔐',
  webdav: '🌐'
};

const providerNames = {
  google_drive: 'Google Drive',
  onedrive: 'OneDrive',
  icloud: 'iCloud',
  dropbox: 'Dropbox',
  mega: 'MEGA',
  box: 'Box',
  ftp: 'FTP',
  sftp: 'SFTP',
  webdav: 'WebDAV'
};

const statusColors = {
  connected: '#00ff88',
  syncing: '#00d4ff',
  error: '#ff0055',
  offline: '#c3c3c3',
  pending: '#ffdd00'
};

export default function SyncStatusCard({ connection, onSync }) {
  const statusConfig = {
    connected: { color: '#00ff88', icon: CheckCircle, label: 'Sync-Locked' },
    syncing: { color: '#00d4ff', icon: RefreshCw, label: 'Syncing' },
    error: { color: '#ff0055', icon: AlertTriangle, label: 'Error' },
    disconnected: { color: '#c3c3c3', icon: Cloud, label: 'Offline' },
    pending: { color: '#ffdd00', icon: Clock, label: 'Pending' }
  };

  const status = statusConfig[connection.status] || statusConfig.pending;
  const StatusIcon = status.icon;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      className="relative bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-5 overflow-hidden group"
    >
      {/* Glow effect on hover */}
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500 rounded-2xl"
        style={{ background: `radial-gradient(circle at center, ${status.color}, transparent 70%)` }}
      />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{providerIcons[connection.provider]}</span>
            <div>
              <h3 className="font-semibold text-white">{connection.display_name}</h3>
              <p className="text-xs text-slate-500">{providerNames[connection.provider]}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <StatusIcon 
              className={`w-4 h-4 ${connection.status === 'syncing' ? 'animate-spin' : ''}`}
              style={{ color: status.color }}
            />
            <span className="text-xs font-mono" style={{ color: status.color }}>
              {status.label}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-slate-800/50 rounded-lg p-3">
            <p className="text-xs text-slate-500 mb-1">Files</p>
            <p className="text-lg font-bold text-white">{connection.total_files || 0}</p>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-3">
            <p className="text-xs text-slate-500 mb-1">Size</p>
            <p className="text-lg font-bold text-white">
              {connection.total_size_mb ? `${connection.total_size_mb.toFixed(1)} MB` : '0 MB'}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-xs text-slate-500">
            {connection.last_sync 
              ? `Last sync: ${format(new Date(connection.last_sync), 'MMM d, HH:mm')}`
              : 'Never synced'
            }
          </p>
          <button
            onClick={() => onSync?.(connection)}
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors flex items-center gap-2"
          >
            <RefreshCw className="w-3 h-3" />
            Sync Now
          </button>
        </div>
      </div>

      {/* Bottom status line */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-0.5"
        style={{ backgroundColor: status.color }}
        animate={{
          opacity: connection.status === 'syncing' ? [0.5, 1, 0.5] : 1
        }}
        transition={{
          duration: 1,
          repeat: connection.status === 'syncing' ? Infinity : 0
        }}
      />
    </motion.div>
  );
}