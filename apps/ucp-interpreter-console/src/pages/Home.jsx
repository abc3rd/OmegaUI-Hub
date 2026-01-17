import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { 
  Terminal, 
  Server, 
  BookOpen, 
  Scale, 
  History,
  ArrowRight,
  Shield,
  Zap,
  BarChart3,
  FileJson
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const FEATURES = [
  {
    icon: FileJson,
    title: 'UCP Compilation',
    description: 'Transform any prompt into structured Universal Command Protocol packets with deterministic intent classification and execution planning.'
  },
  {
    icon: BarChart3,
    title: 'Token Ledger',
    description: 'Complete hop-by-hop tracking of token usage, latency, and scoring. Provider-reported or locally-estimated metrics.'
  },
  {
    icon: Shield,
    title: 'Tamper-Evident Chain',
    description: 'SHA-256 hash chain across all hops creates an auditable, tamper-evident record suitable for compliance.'
  },
  {
    icon: Zap,
    title: 'Multi-Provider Support',
    description: 'Connect to OpenAI, LM Studio, or any OpenAI-compatible endpoint. Securely store and manage API credentials.'
  }
];

const QUICK_LINKS = [
  { 
    name: 'Console', 
    description: 'Run UCP interpreter', 
    icon: Terminal, 
    path: 'Console',
    gradient: 'from-blue-600 to-indigo-600'
  },
  { 
    name: 'Providers', 
    description: 'Manage AI endpoints', 
    icon: Server, 
    path: 'Providers',
    gradient: 'from-emerald-600 to-teal-600'
  },
  { 
    name: 'Dictionary', 
    description: 'UCP command definitions', 
    icon: BookOpen, 
    path: 'Dictionary',
    gradient: 'from-amber-600 to-orange-600'
  },
  { 
    name: 'Rules', 
    description: 'Processing rules', 
    icon: Scale, 
    path: 'Rules',
    gradient: 'from-violet-600 to-purple-600'
  },
  { 
    name: 'Sessions', 
    description: 'History & replay', 
    icon: History, 
    path: 'Sessions',
    gradient: 'from-indigo-600 to-blue-600'
  }
];

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMyMDIwMjAiIGZpbGwtb3BhY2l0eT0iMC40Ij48cGF0aCBkPSJNMzYgMzRoLTJ2LTRoMnY0em0wLTZ2LTRoLTJ2NGgyem0tNiA2aC00djJoNHYtMnptMC02aC00djJoNHYtMnptMC02aC00djJoNHYtMnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-full mb-8">
            <span className="w-2 h-2 bg-pink-500 rounded-full animate-pulse" />
            <span className="text-sm bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent font-medium">Production Ready</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">UCP</span> Interpreter
              <span className="block text-white">
                Console
              </span>
            </h1>
            
            <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-10">
              Transform any prompt into Universal Command Protocol packets.
              Full token ledger, scoring telemetry, and tamper-evident audit trails.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to={createPageUrl('Console')}>
                <Button size="lg" className="bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 h-12 px-8 text-base">
                  Launch Console
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link to={createPageUrl('Providers')}>
                <Button size="lg" variant="outline" className="h-12 px-8 text-base border-slate-600 text-slate-300 hover:bg-slate-800">
                  Configure Providers
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <h2 className="text-2xl font-bold text-white text-center mb-12">Key Capabilities</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURES.map((feature, i) => (
            <Card key={i} className="bg-slate-800/50 border-slate-700 hover:bg-slate-800 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600/20 to-pink-500/20 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-pink-400" />
                </div>
                <CardTitle className="text-white">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-slate-400">{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Quick Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <h2 className="text-2xl font-bold text-white text-center mb-12">Quick Access</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {QUICK_LINKS.map((link, i) => (
            <Link key={i} to={createPageUrl(link.path)}>
              <Card className="bg-slate-800/50 border-slate-700 hover:bg-slate-800 hover:border-slate-600 transition-all h-full">
                <CardContent className="p-6 text-center">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${link.gradient} flex items-center justify-center mx-auto mb-4`}>
                    <link.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="font-semibold text-white mb-1">{link.name}</h3>
                  <p className="text-xs text-slate-400">{link.description}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center" style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}>
                <div className="w-4 h-4 bg-white/90" style={{ clipPath: 'polygon(50% 20%, 90% 80%, 50% 95%, 10% 80%)' }} />
              </div>
              <span className="text-sm text-slate-400">
                Universal Command Protocol (UCP) — Confidential. © Omega UI, LLC
              </span>
            </div>
            <a 
              href="mailto:omegaui@syncloudconnect.com" 
              className="text-sm text-slate-500 hover:text-slate-400 transition-colors"
            >
              omegaui@syncloudconnect.com
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}