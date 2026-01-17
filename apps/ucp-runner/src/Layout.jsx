import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Zap, Sparkles, Home, BarChart3 } from 'lucide-react';
import UCPToast from '@/components/ucp/UCPToast';

export default function Layout({ children, currentPageName }) {
  const showTopNav = currentPageName !== 'Home';
  
  return (
    <div className="min-h-screen bg-slate-900">
      {showTopNav && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
          <div className="flex items-center gap-2 bg-slate-800/90 backdrop-blur-xl border border-slate-700 rounded-full px-4 py-2 shadow-xl">
            <Link 
              to={createPageUrl('Home')}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-slate-700/50 transition-colors text-slate-300 hover:text-white"
            >
              <Home className="w-4 h-4" />
              <span className="text-sm">Home</span>
            </Link>
            <div className="w-px h-6 bg-slate-600" />
            <Link 
              to={createPageUrl('CommandBuilder')}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-violet-500/20 transition-colors text-violet-400 hover:text-violet-300"
            >
              <Sparkles className="w-4 h-4" />
              <span className="text-sm">Commands</span>
            </Link>
            <div className="w-px h-6 bg-slate-600" />
            <Link 
              to={createPageUrl('Analytics')}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-cyan-500/20 transition-colors text-cyan-400 hover:text-cyan-300"
            >
              <BarChart3 className="w-4 h-4" />
              <span className="text-sm">Analytics</span>
            </Link>
          </div>
        </div>
      )}
      {children}
      <UCPToast />
    </div>
  );
}