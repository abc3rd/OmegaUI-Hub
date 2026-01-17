import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from './utils';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, 
  Radio, 
  Key, 
  MessageSquare, 
  BookOpen, 
  Gauge,
  Settings,
  Users,
  LogOut,
  Menu,
  X,
  Tv,
  Shield
} from 'lucide-react';

export default function Layout({ children, currentPageName }) {
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => setUser(null));
  }, []);

  const navItems = [
    { name: 'Dashboard', path: 'Dashboard', icon: LayoutDashboard },
    { name: 'Platforms', path: 'Platforms', icon: Radio },
    { name: 'Key Vault', path: 'KeyVault', icon: Key },
    { name: 'Chat', path: 'Chat', icon: MessageSquare },
    { name: 'Viewers', path: 'Viewers', icon: Users },
    { name: 'Sessions', path: 'Sessions', icon: Tv },
    { name: 'Guides', path: 'Guides', icon: BookOpen },
    { name: 'Widgets', path: 'Widgets', icon: Gauge },
    { name: 'Settings', path: 'Settings', icon: Settings },
  ];

  const handleLogout = () => {
    base44.auth.logout();
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 text-purple-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-white mb-2">Cam Connect</h1>
          <p className="text-slate-400 mb-6">Your Cloud Camera Management Hub</p>
          <Button onClick={() => base44.auth.redirectToLogin()} className="bg-purple-600 hover:bg-purple-700">
            Sign In to Continue
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-slate-900 border-b border-slate-800 z-50 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Radio className="w-6 h-6 text-purple-500" />
          <span className="font-bold text-white">Cam Connect</span>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)}>
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </Button>
      </div>

      {/* Sidebar */}
      <div className={`fixed top-0 left-0 h-full w-64 bg-slate-900 border-r border-slate-800 transform transition-transform duration-300 z-40 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-2 mb-1">
            <Radio className="w-8 h-8 text-purple-500" />
            <h1 className="text-xl font-bold text-white">Cam Connect</h1>
          </div>
          <p className="text-xs text-slate-400">Cloud Camera Hub</p>
        </div>

        <nav className="p-4 space-y-1 flex-1 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 180px)' }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPageName === item.path;
            return (
              <Link
                key={item.path}
                to={createPageUrl(item.path)}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  isActive
                    ? 'bg-purple-600 text-white'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 mb-3 px-2">
            <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white font-semibold">
              {user?.full_name?.[0] || user?.email?.[0] || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.full_name || 'User'}</p>
              <p className="text-xs text-slate-400 truncate">{user?.email}</p>
            </div>
          </div>
          <Button variant="ghost" className="w-full justify-start text-slate-400 hover:text-white" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:ml-64 pt-16 lg:pt-0">
        <div className="p-6">
          {children}
        </div>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}