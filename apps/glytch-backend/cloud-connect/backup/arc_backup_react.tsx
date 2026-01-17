import React, { useState, useEffect } from 'react';

const ARCCloudBackup = () => {
  const [providers, setProviders] = useState([
    { id: 1, name: 'Google Drive', icon: '🗂️', storage: '850GB / 1TB', status: 'connected' },
    { id: 2, name: 'Dropbox', icon: '📦', storage: '420GB / 500GB', status: 'connected' },
    { id: 3, name: 'iCloud', icon: '☁️', storage: '1.2TB / 2TB', status: 'syncing' },
    { id: 4, name: 'OneDrive', icon: '📁', storage: '680GB / 1TB', status: 'connected' },
    { id: 5, name: 'AWS S3', icon: '🪣', storage: '3.2TB / 5TB', status: 'connected' },
    { id: 6, name: 'Azure Blob', icon: '📊', storage: 'Connection Failed', status: 'error' }
  ]);

  const [recentBackups] = useState([
    {
      id: 1,
      name: '📁 Documents Folder',
      size: '2.1GB',
      time: '15 minutes ago',
      locations: 'Google Drive, Dropbox'
    },
    {
      id: 2,
      name: '🖼️ Photos Archive',
      size: '850MB',
      time: '1 hour ago',
      locations: 'iCloud, AWS S3'
    },
    {
      id: 3,
      name: '💼 Project Files',
      size: '3.4GB',
      time: '3 hours ago',
      locations: 'OneDrive, AWS S3'
    }
  ]);

  const [activity, setActivity] = useState([
    { id: 1, icon: '✓', type: 'online', text: 'Backup completed successfully', time: '5m ago' },
    { id: 2, icon: '⟳', type: 'syncing', text: 'Syncing with iCloud', time: '10m ago' },
    { id: 3, icon: '🔒', type: 'online', text: 'Files encrypted and stored', time: '15m ago' },
    { id: 4, icon: '📊', type: 'online', text: 'Storage quota check completed', time: '20m ago' }
  ]);

  const [stats, setStats] = useState({
    used: '2.4TB',
    available: '2.6TB',
    totalProviders: 5,
    redundancy: '3x',
    totalBackups: 1247,
    successRate: '99.9%',
    avgTime: '45s',
    failures: 0
  });

  const [storagePercentage] = useState(48);
  const [systemStatus] = useState({
    status: 'online',
    lastSync: '5 minutes ago',
    encryption: 'AES-256 Active',
    storageUsed: '2.4TB / 5TB'
  });

  const addActivity = (message, type = 'online') => {
    const iconMap = {
      'online': '✓',
      'syncing': '⟳',
      'error': '✗'
    };

    const newActivity = {
      id: Date.now(),
      icon: iconMap[type],
      type,
      text: message,
      time: 'now'
    };

    setActivity(prev => [newActivity, ...prev.slice(0, 4)]);
  };

  const startFullSync = () => {
    alert('🔄 Starting full synchronization across all connected providers...');
    addActivity('Full sync started', 'syncing');
    
    if (window.parent !== window) {
      window.parent.postMessage({
        type: 'ghl-backup-sync',
        action: 'full-sync',
        timestamp: new Date().toISOString()
      }, '*');
    }
  };

  const quickBackup = () => {
    alert('🚀 Initiating quick backup of recently modified files...');
    addActivity('Quick backup initiated', 'online');
    
    if (window.parent !== window) {
      window.parent.postMessage({
        type: 'ghl-backup-sync',
        action: 'quick-backup',
        timestamp: new Date().toISOString()
      }, '*');
    }
  };

  const addProvider = () => {
    const availableProviders = ['Box', 'Mega', 'pCloud', 'Sync.com', 'Tresorit'];
    const randomProvider = availableProviders[Math.floor(Math.random() * availableProviders.length)];
    alert(`➕ Opening connection wizard for ${randomProvider}...`);
    addActivity(`Connecting to ${randomProvider}`, 'syncing');
  };

  const restoreData = () => {
    alert('🔄 Opening data recovery interface...');
    addActivity('Data recovery initiated', 'online');
    
    if (window.parent !== window) {
      window.parent.postMessage({
        type: 'ghl-backup-restore',
        action: 'restore-data',
        timestamp: new Date().toISOString()
      }, '*');
    }
  };

  const downloadBackup = () => {
    alert('📥 Preparing backup download...');
    addActivity('Backup download started', 'online');
  };

  const restoreBackup = () => {
    alert('🔄 Restoring from backup...');
    addActivity('Backup restore started', 'syncing');
  };

  useEffect(() => {
    // Simulate real-time updates
    const interval = setInterval(() => {
      const activities = [
        'File synchronization completed',
        'Backup integrity check passed',
        'Storage quota updated',
        'Encryption key rotated',
        'Heartbeat check successful'
      ];
      
      const randomActivity = activities[Math.floor(Math.random() * activities.length)];
      addActivity(randomActivity, 'online');
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'connected': return { icon: '✓', class: 'bg-green-500' };
      case 'syncing': return { icon: '⟳', class: 'bg-yellow-500 animate-spin' };
      case 'error': return { icon: '✗', class: 'bg-red-500' };
      default: return { icon: '?', class: 'bg-gray-500' };
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'connected': return 'bg-green-500/30 text-green-400 border-green-400';
      case 'syncing': return 'bg-yellow-500/30 text-yellow-400 border-yellow-400';
      case 'error': return 'bg-red-500/30 text-red-400 border-red-400';
      default: return 'bg-gray-500/30 text-gray-400 border-gray-400';
    }
  };

  const getActivityStyle = (type) => {
    switch (type) {
      case 'online': return 'bg-green-500';
      case 'syncing': return 'bg-yellow-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-blue-500';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-cyan-500 to-teal-500 text-white">
      <div className="max-w-7xl mx-auto px-5 py-8">
        
        {/* Header */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="relative w-16 h-16 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-3xl flex items-center justify-center text-3xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
              ☁️
            </div>
            <h1 className="text-4xl font-bold">ARC Cloud Backup</h1>
          </div>
          <p className="text-xl opacity-90">Redundant Encrypted Backups Across Multiple Cloud Providers</p>
        </div>

        {/* Status Bar */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-8 border border-white/20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">✓</div>
              <div>
                <div className="text-sm opacity-80">System Status</div>
                <div className="font-semibold">All Systems Online</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center animate-spin">⟳</div>
              <div>
                <div className="text-sm opacity-80">Last Sync</div>
                <div className="font-semibold">{systemStatus.lastSync}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">🔒</div>
              <div>
                <div className="text-sm opacity-80">Encryption</div>
                <div className="font-semibold">{systemStatus.encryption}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">📊</div>
              <div>
                <div className="text-sm opacity-80">Storage Used</div>
                <div className="font-semibold">{systemStatus.storageUsed}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Cloud Providers */}
            <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20">
              <h2 className="text-2xl font-semibold mb-6 text-center text-cyan-400">☁️ Connected Cloud Providers</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {providers.map((provider) => {
                  const statusInfo = getStatusIcon(provider.status);
                  return (
                    <div
                      key={provider.id}
                      className="bg-white/10 border border-white/20 rounded-2xl p-6 text-center transition-all duration-300 hover:transform hover:-translate-y-2 hover:bg-white/15 hover:shadow-xl"
                    >
                      <div className="text-4xl mb-4">{provider.icon}</div>
                      <h3 className="text-lg font-semibold mb-2">{provider.name}</h3>
                      <p className="text-sm opacity-80 mb-3">{provider.storage}</p>
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${getStatusStyle(provider.status)}`}>
                        {provider.status}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Sync Actions */}
              <div className="flex flex-wrap justify-center gap-4 mb-8">
                <button
                  onClick={startFullSync}
                  className="px-6 py-3 bg-gradient-to-r from-cyan-400 to-blue-500 text-white font-semibold rounded-full transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-lg"
                >
                  ⟳ Full Sync
                </button>
                <button
                  onClick={quickBackup}
                  className="px-6 py-3 bg-white/20 border border-white/30 rounded-full transition-all duration-300 hover:bg-white/30 hover:transform hover:-translate-y-1"
                >
                  🚀 Quick Backup
                </button>
                <button
                  onClick={addProvider}
                  className="px-6 py-3 bg-white/20 border border-white/30 rounded-full transition-all duration-300 hover:bg-white/30 hover:transform hover:-translate-y-1"
                >
                  ➕ Add Provider
                </button>
                <button
                  onClick={restoreData}
                  className="px-6 py-3 bg-white/20 border border-white/30 rounded-full transition-all duration-300 hover:bg-white/30 hover:transform hover:-translate-y-1"
                >
                  🔄 Restore Data
                </button>
              </div>

              {/* Recent Backups */}
              <h3 className="text-xl font-semibold mb-4 text-center text-cyan-400">📋 Recent Backups</h3>
              <div className="space-y-4">
                {recentBackups.map((backup) => (
                  <div key={backup.id} className="bg-white/10 border border-white/20 rounded-xl p-4 flex justify-between items-center">
                    <div className="flex-1">
                      <div className="font-medium mb-1">{backup.name}</div>
                      <div className="text-sm opacity-70">{backup.size} • {backup.time} • {backup.locations}</div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={downloadBackup}
                        className="px-3 py-1 bg-white/20 border border-white/30 rounded-full text-xs transition-all hover:bg-white/30"
                      >
                        Download
                      </button>
                      <button
                        onClick={restoreBackup}
                        className="px-3 py-1 bg-white/20 border border-white/30 rounded-full text-xs transition-all hover:bg-white/30"
                      >
                        Restore
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            
            {/* Storage Overview */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <h3 className="text-lg font-semibold mb-4 text-cyan-400">💾 Storage Overview</h3>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="text-center bg-white/10 p-4 rounded-xl">
                  <div className="text-2xl font-bold text-cyan-400">{stats.used}</div>
                  <div className="text-xs opacity-70 mt-1">Used</div>
                </div>
                <div className="text-center bg-white/10 p-4 rounded-xl">
                  <div className="text-2xl font-bold text-cyan-400">{stats.available}</div>
                  <div className="text-xs opacity-70 mt-1">Available</div>
                </div>
                <div className="text-center bg-white/10 p-4 rounded-xl">
                  <div className="text-2xl font-bold text-cyan-400">{stats.totalProviders}</div>
                  <div className="text-xs opacity-70 mt-1">Providers</div>
                </div>
                <div className="text-center bg-white/10 p-4 rounded-xl">
                  <div className="text-2xl font-bold text-cyan-400">{stats.redundancy}</div>
                  <div className="text-xs opacity-70 mt-1">Redundancy</div>
                </div>
              </div>
              <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-300"
                  style={{ width: `${storagePercentage}%` }}
                />
              </div>
            </div>

            {/* Backup Statistics */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <h3 className="text-lg font-semibold mb-4 text-cyan-400">📊 Backup Statistics</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center bg-white/10 p-4 rounded-xl">
                  <div className="text-2xl font-bold text-cyan-400">{stats.totalBackups}</div>
                  <div className="text-xs opacity-70 mt-1">Total Backups</div>
                </div>
                <div className="text-center bg-white/10 p-4 rounded-xl">
                  <div className="text-2xl font-bold text-cyan-400">{stats.successRate}</div>
                  <div className="text-xs opacity-70 mt-1">Success Rate</div>
                </div>
                <div className="text-center bg-white/10 p-4 rounded-xl">
                  <div className="text-2xl font-bold text-cyan-400">{stats.avgTime}</div>
                  <div className="text-xs opacity-70 mt-1">Avg Time</div>
                </div>
                <div className="text-center bg-white/10 p-4 rounded-xl">
                  <div className="text-2xl font-bold text-cyan-400">{stats.failures}</div>
                  <div className="text-xs opacity-70 mt-1">Failures</div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <h3 className="text-lg font-semibold mb-4 text-cyan-400">🔔 Recent Activity</h3>
              <div className="space-y-3 max-h-48 overflow-y-auto">
                {activity.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 p-2 bg-white/5 rounded-xl">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${getActivityStyle(item.type)}`}>
                      {item.icon}
                    </div>
                    <div className="flex-1 text-sm">{item.text}</div>
                    <div className="text-xs opacity-70">{item.time}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ARCCloudBackup;