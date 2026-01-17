import React, { useState, useEffect } from 'react';

const Dashboard = () => {
  const [stats, setStats] = useState({
    leads: '8M+',
    uptime: '99.9%',
    providers: '5+',
    support: '24/7'
  });

  const [apps] = useState([
    {
      id: 'glytch',
      title: 'GLYTCH AI Butler',
      icon: '🤖',
      description: 'Your intelligent AI assistant that automates workflows, routes data, and executes complex business logic through natural language commands.',
      status: 'active',
      path: './glytch-ai-butler/index.html'
    },
    {
      id: 'legendary-leads',
      title: 'Legendary Leads',
      icon: '🎯',
      description: 'Access over 8 million verified leads with Instagram usernames, emails, and contact data. Advanced filtering and export capabilities.',
      status: 'active',
      path: './legendary-leads/index.html'
    },
    {
      id: 'omniform',
      title: 'Omniform Processor',
      icon: '⚡',
      description: 'Universal file processing service. Convert, compress, remove backgrounds, vectorize, and extract text from any file format.',
      status: 'active',
      path: './omniform-processor/index.html'
    },
    {
      id: 'arc-backup',
      title: 'ARC Cloud Backup',
      icon: '☁️',
      description: 'Redundant encrypted backups across Google Drive, Dropbox, iCloud, and more. Automatic sync and recovery management.',
      status: 'active',
      path: './arc-cloud-backup/index.html'
    },
    {
      id: 'abracadata',
      title: 'Abracadata AI Art',
      icon: '🎨',
      description: 'Generate stunning AI artwork using Stable Diffusion. Advanced prompt engineering and style controls.',
      status: 'beta',
      path: './abracadata-ai-art/index.html'
    },
    {
      id: 'pricing',
      title: 'Pricing & Plans',
      icon: '💰',
      description: 'Manage subscriptions, billing, and plan upgrades. View usage analytics and billing history.',
      status: 'active',
      path: './pricing-plans/index.html'
    }
  ]);

  const quickActions = [
    { label: '🤖 Ask GLYTCH', action: () => openApp('glytch') },
    { label: '🎯 Find Leads', action: () => openApp('legendary-leads') },
    { label: '⚡ Process Files', action: () => openApp('omniform') },
    { label: '☁️ Backup Data', action: () => openApp('arc-backup') },
    { label: '💬 Get Support', action: () => window.open('mailto:support@abc-board.com') }
  ];

  const openApp = (appId) => {
    const app = apps.find(a => a.id === appId);
    if (app) {
      // Track usage for GHL
      if (window.ghlIntegration) {
        window.ghlIntegration.trackUsage(appId);
      }
      
      // For GHL embedding, use parent window navigation
      if (window.parent !== window) {
        window.parent.postMessage({
          type: 'navigate',
          url: app.path
        }, '*');
      } else {
        window.location.href = app.path;
      }
    }
  };

  const updateStats = async () => {
    try {
      const response = await fetch('/api/stats');
      const data = await response.json();
      setStats(prevStats => ({
        ...prevStats,
        ...data
      }));
    } catch (error) {
      console.log('Using static stats values');
    }
  };

  useEffect(() => {
    updateStats();
    
    // Auto-refresh stats every 30 seconds
    const interval = setInterval(updateStats, 30000);
    
    // Add keyboard shortcuts
    const handleKeyDown = (e) => {
      if (e.ctrlKey) {
        const keyMap = {
          '1': 'glytch',
          '2': 'legendary-leads',
          '3': 'omniform',
          '4': 'arc-backup',
          '5': 'abracadata',
          '6': 'pricing'
        };
        
        if (keyMap[e.key]) {
          openApp(keyMap[e.key]);
        }
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    
    // GHL integration setup
    window.ghlIntegration = {
      sendEvent: (eventName, data) => {
        if (window.parent !== window) {
          window.parent.postMessage({
            type: 'ghl-event',
            event: eventName,
            data: data
          }, '*');
        }
      },
      
      trackUsage: (appName) => {
        window.ghlIntegration.sendEvent('app-opened', { 
          app: appName, 
          timestamp: new Date().toISOString() 
        });
      }
    };
    
    return () => {
      clearInterval(interval);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-800 via-blue-700 to-blue-900 text-white">
      <div className="max-w-7xl mx-auto px-5 py-8">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-5xl font-bold text-cyan-400 mb-3 drop-shadow-lg">
            Cloud Connect
          </h1>
          <p className="text-xl opacity-90 mb-8">
            Your All-in-One AI-Powered Business Platform
          </p>
        </div>
        
        {/* Stats Bar */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 text-center border border-white/20">
            <div className="text-3xl font-bold text-cyan-400">{stats.leads}</div>
            <div className="text-sm opacity-80 mt-1">Leads Available</div>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 text-center border border-white/20">
            <div className="text-3xl font-bold text-cyan-400">{stats.uptime}</div>
            <div className="text-sm opacity-80 mt-1">Uptime</div>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 text-center border border-white/20">
            <div className="text-3xl font-bold text-cyan-400">{stats.providers}</div>
            <div className="text-sm opacity-80 mt-1">Cloud Providers</div>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 text-center border border-white/20">
            <div className="text-3xl font-bold text-cyan-400">{stats.support}</div>
            <div className="text-sm opacity-80 mt-1">AI Support</div>
          </div>
        </div>
        
        {/* Quick Actions */}
        <div className="flex flex-wrap gap-4 justify-center mb-10">
          {quickActions.map((action, index) => (
            <button
              key={index}
              onClick={action.action}
              className="px-6 py-3 bg-cyan-500/20 border-2 border-cyan-400 rounded-full text-white font-medium transition-all duration-300 hover:bg-cyan-400 hover:transform hover:-translate-y-1 hover:shadow-lg hover:shadow-cyan-400/30"
            >
              {action.label}
            </button>
          ))}
        </div>
        
        {/* Apps Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8 mb-10">
          {apps.map((app) => (
            <div
              key={app.id}
              onClick={() => openApp(app.id)}
              className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 cursor-pointer transition-all duration-300 hover:transform hover:-translate-y-2 hover:bg-white/15 hover:shadow-xl hover:shadow-black/20"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-2xl flex items-center justify-center text-2xl mb-6">
                {app.icon}
              </div>
              <h3 className="text-xl font-semibold mb-3">{app.title}</h3>
              <p className="opacity-80 line-height-relaxed mb-6 text-sm">
                {app.description}
              </p>
              <span
                className={`inline-block px-4 py-2 rounded-full text-xs font-medium border ${
                  app.status === 'active'
                    ? 'bg-green-500/30 text-green-400 border-green-400'
                    : 'bg-yellow-500/30 text-yellow-400 border-yellow-400'
                }`}
              >
                {app.status === 'active' ? 'Active' : 'Beta'}
              </span>
            </div>
          ))}
        </div>
        
        {/* Footer */}
        <div className="text-center opacity-70 mt-12 pt-8 border-t border-white/20">
          <p className="mb-2">© 2025 Cloud Connect. All rights reserved. | Powered by GLYTCH AI</p>
          <p>
            Platform Status: <span className="text-green-400">●</span> All Systems Operational
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;