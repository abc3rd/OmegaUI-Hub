import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from './utils';
import { 
  LayoutDashboard, FolderLock, Shield, Settings,
  LogOut, Menu, X
} from 'lucide-react';
import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';

export default function Layout({ children, currentPageName }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me()
  });

  const navigation = [
    { name: 'Dashboard', page: 'Dashboard', icon: LayoutDashboard },
    { name: 'Vault', page: 'Vault', icon: FolderLock },
    { name: 'Security', page: 'Security', icon: Shield },
  ];

  const handleLogout = () => {
    base44.auth.logout();
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <style>{`
        :root {
          --arc-magenta: #ea00ea;
          --arc-gray: #c3c3c3;
          --arc-blue: #00d4ff;
          --arc-green: #00ff88;
          --arc-red: #ff0055;
          --arc-yellow: #ffdd00;
        }
      `}</style>

      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-slate-900/95 backdrop-blur-xl border-r border-slate-800
        transform transition-transform duration-300 lg:translate-x-0
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10">
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-[#ea00ea] to-[#2699fe] opacity-20" />
                <div className="absolute inset-1 rounded-lg bg-slate-900 flex items-center justify-center">
                  <div className="w-3 h-3 rounded-full bg-gradient-to-br from-[#ea00ea] to-[#2699fe]" />
                </div>
              </div>
              <div>
                <h1 className="font-bold text-white text-lg tracking-tight">Arc</h1>
                <p className="text-[10px] text-slate-500 font-mono tracking-wider">SYNCLOUD CONNECT</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {navigation.map((item) => {
              const isActive = currentPageName === item.page;
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={createPageUrl(item.page)}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                    ${isActive 
                      ? 'bg-slate-800 text-white' 
                      : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'
                    }
                  `}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-[#ea00ea]' : ''}`} />
                  <span className="font-medium">{item.name}</span>
                  {isActive && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#ea00ea]" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User Section */}
          <div className="p-4 border-t border-slate-800">
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-800/50">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#ea00ea]/30 to-[#2699fe]/30 flex items-center justify-center">
                <span className="text-sm font-bold text-white">
                  {user?.full_name?.[0]?.toUpperCase() || 'U'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {user?.full_name || 'User'}
                </p>
                <p className="text-xs text-slate-500 truncate">{user?.email}</p>
              </div>
              <button 
                onClick={handleLogout}
                className="p-2 rounded-lg hover:bg-slate-700 text-slate-500 hover:text-slate-300 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* GLYTCH Signature */}
          <div className="p-4 border-t border-slate-800">
            <div className="text-center">
              <p className="text-[10px] text-slate-600 font-mono">POWERED BY GLYTCH</p>
              <p className="text-[9px] text-slate-700 font-mono mt-1">Sync is life. Identity is key.</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-30 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Main content */}
      <main className="lg:pl-64 min-h-screen">
        {children}
      </main>
    </div>
  );
}