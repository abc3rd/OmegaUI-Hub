import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { 
  History, 
  RefreshCw, 
  Download,
  RotateCcw,
  Trash2,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  BarChart3
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from 'sonner';
import ScoreDisplay from '@/components/console/ScoreDisplay';

const STATUS_CONFIG = {
  pending: { icon: Clock, color: 'text-slate-500', bg: 'bg-slate-100' },
  compiling: { icon: Loader2, color: 'text-blue-500', bg: 'bg-blue-100', animate: true },
  running: { icon: Loader2, color: 'text-amber-500', bg: 'bg-amber-100', animate: true },
  success: { icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-100' },
  error: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-100' }
};

export default function Sessions() {
  const [sessions, setSessions] = useState([]);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSessions();
    loadStats();
  }, []);

  const loadSessions = async () => {
    setIsLoading(true);
    try {
      const result = await base44.functions.invoke('sessionManager', { 
        action: 'list',
        limit: 50
      });
      if (result.data.success) {
        setSessions(result.data.sessions);
      }
    } catch (err) {
      toast.error('Failed to load sessions');
    } finally {
      setIsLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const result = await base44.functions.invoke('sessionManager', { action: 'stats' });
      if (result.data.success) {
        setStats(result.data.stats);
      }
    } catch (err) {
      console.error('Failed to load stats');
    }
  };

  const handleExport = async (session) => {
    try {
      const result = await base44.functions.invoke('exportSession', {
        sessionId: session.id
      });

      if (result.data.success) {
        const blob = new Blob([JSON.stringify(result.data.export, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ucp-session-${session.id}-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success('Session exported');
      }
    } catch (err) {
      toast.error('Export failed');
    }
  };

  const handleDelete = async (session) => {
    try {
      const result = await base44.functions.invoke('sessionManager', {
        action: 'delete',
        sessionId: session.id
      });

      if (result.data.success) {
        toast.success('Session deleted');
        loadSessions();
        loadStats();
      } else {
        toast.error(result.data.error || 'Failed to delete session');
      }
    } catch (err) {
      toast.error('Failed to delete session');
    }
  };

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
                <h1 className="text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">Session History</h1>
                <p className="text-xs text-slate-500">View and replay past sessions</p>
              </div>
            </div>

            <Button variant="outline" size="sm" onClick={loadSessions}>
              <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                  <BarChart3 className="w-3.5 h-3.5" />
                  Total Sessions
                </div>
                <div className="text-2xl font-bold text-slate-800">
                  {stats.total_sessions.toLocaleString()}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Success Rate
                </div>
                <div className="text-2xl font-bold text-emerald-600">
                  {stats.total_sessions > 0 
                    ? ((stats.successful_sessions / stats.total_sessions) * 100).toFixed(1) 
                    : 0}%
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-xs text-slate-500 mb-1">Total Tokens</div>
                <div className="text-2xl font-bold font-mono text-slate-800">
                  {stats.total_tokens.toLocaleString()}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-xs text-slate-500 mb-1">Avg Score</div>
                <ScoreDisplay score={stats.average_score} size="md" showBreakdown={false} />
              </CardContent>
            </Card>
          </div>
        )}

        {/* Sessions List */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-24 bg-slate-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-16">
            <History className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-700 mb-2">No Sessions Yet</h3>
            <p className="text-slate-500 mb-6">Run some prompts through the interpreter to see them here</p>
            <Link to={createPageUrl('Console')}>
              <Button>Go to Console</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {sessions.map(session => {
              const statusConfig = STATUS_CONFIG[session.status] || STATUS_CONFIG.pending;
              const StatusIcon = statusConfig.icon;
              
              return (
                <Card key={session.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", statusConfig.bg)}>
                        <StatusIcon className={cn(
                          "w-5 h-5",
                          statusConfig.color,
                          statusConfig.animate && "animate-spin"
                        )} />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-xs">
                            {session.model_name || 'default'}
                          </Badge>
                          <span className="text-xs text-slate-400">
                            {new Date(session.created_date).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm text-slate-700 truncate">
                          {session.raw_prompt?.substring(0, 100) || 'No prompt'}
                          {session.raw_prompt?.length > 100 && '...'}
                        </p>
                      </div>
                      
                      <div className="hidden md:flex items-center gap-6 text-sm">
                        <div className="text-center">
                          <div className="font-mono text-slate-800">
                            {(session.total_tokens || 0).toLocaleString()}
                          </div>
                          <div className="text-xs text-slate-400">tokens</div>
                        </div>
                        <div className="text-center">
                          <div className="font-mono text-slate-800">
                            {((session.total_latency_ms || 0) / 1000).toFixed(2)}s
                          </div>
                          <div className="text-xs text-slate-400">latency</div>
                        </div>
                        <ScoreDisplay 
                          score={session.session_score || 0} 
                          size="sm" 
                          showBreakdown={false} 
                        />
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleExport(session)}
                        >
                          <Download className="w-3.5 h-3.5" />
                        </Button>
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Session</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this session? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(session)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>

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