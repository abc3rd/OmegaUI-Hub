import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Radio, Key, Users, AlertCircle, CheckCircle, Play, Square, Eye, EyeOff } from 'lucide-react';
import StatusBadge from '../components/shared/StatusBadge';
import CopyButton from '../components/shared/CopyButton';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';

export default function Dashboard() {
  const [activeSession, setActiveSession] = useState(null);
  const [viewersVisible, setViewersVisible] = useState(false);

  const { data: platforms = [] } = useQuery({
    queryKey: ['platforms'],
    queryFn: () => base44.entities.StreamingPlatform.filter({ created_by: base44.auth.me().then(u => u.email) }),
  });

  const { data: statuses = [] } = useQuery({
    queryKey: ['statuses'],
    queryFn: () => base44.entities.PlatformStatus.list('-updated_date', 10),
  });

  const { data: sessions = [] } = useQuery({
    queryKey: ['sessions'],
    queryFn: () => base44.entities.StreamSession.filter({ is_active: true }),
  });

  useEffect(() => {
    if (sessions.length > 0) {
      setActiveSession(sessions[0]);
    }
  }, [sessions]);

  const enabledPlatforms = platforms.filter(p => p.enabled);
  const onlineCount = statuses.filter(s => s.status === 'ONLINE').length;
  const hasIssues = statuses.some(s => s.status === 'OFFLINE' || s.status === 'DEGRADED');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Cam Connect Dashboard</h1>
        <p className="text-slate-400">Your cloud camera control center is active and ready</p>
      </div>

      {/* Status Strip */}
      <Alert className={hasIssues ? 'bg-red-950 border-red-800' : 'bg-green-950 border-green-800'}>
        {hasIssues ? (
          <>
            <AlertCircle className="h-4 w-4 text-red-400" />
            <AlertDescription className="text-red-300">
              <strong>Issues Detected:</strong> Some platforms are experiencing problems. Check Platform Status.
            </AlertDescription>
          </>
        ) : (
          <>
            <CheckCircle className="h-4 w-4 text-green-400" />
            <AlertDescription className="text-green-300">
              <strong>All Systems Operational:</strong> {onlineCount} platform{onlineCount !== 1 ? 's' : ''} online and ready.
            </AlertDescription>
          </>
        )}
      </Alert>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-400">Active Platforms</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-white">{enabledPlatforms.length}</p>
                <p className="text-xs text-slate-400 mt-1">of {platforms.length} total</p>
              </div>
              <Radio className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-400">Stream Keys</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-white">{platforms.length}</p>
                <p className="text-xs text-slate-400 mt-1">secured in vault</p>
              </div>
              <Key className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-400 flex items-center justify-between">
              Viewers
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setViewersVisible(!viewersVisible)}
                className="h-6 w-6"
              >
                {viewersVisible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-white">
                  {viewersVisible ? '0' : '•••'}
                </p>
                <p className="text-xs text-slate-400 mt-1">total viewers</p>
              </div>
              <Users className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Current Session */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center justify-between">
            Current Stream Session
            <Link to={createPageUrl('Sessions')}>
              <Button size="sm" variant="outline" className="border-slate-700">
                Manage Sessions
              </Button>
            </Link>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {activeSession ? (
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-white mb-1">{activeSession.title}</h3>
                  {activeSession.category && (
                    <p className="text-sm text-slate-400">{activeSession.category}</p>
                  )}
                </div>
                <Button size="sm" variant="destructive" className="gap-2">
                  <Square className="w-4 h-4" />
                  End Stream
                </Button>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  LIVE
                </div>
                <span>•</span>
                <span>Started {new Date(activeSession.start_time).toLocaleTimeString()}</span>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Radio className="w-12 h-12 text-slate-700 mx-auto mb-3" />
              <p className="text-slate-400 mb-4">No active stream session</p>
              <Link to={createPageUrl('Sessions')}>
                <Button className="bg-purple-600 hover:bg-purple-700 gap-2">
                  <Play className="w-4 h-4" />
                  Start New Session
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Platform Status Grid */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white">Platform Status</CardTitle>
        </CardHeader>
        <CardContent>
          {platforms.length === 0 ? (
            <div className="text-center py-8">
              <Radio className="w-12 h-12 text-slate-700 mx-auto mb-3" />
              <p className="text-slate-400 mb-4">No platforms configured yet</p>
              <Link to={createPageUrl('Platforms')}>
                <Button className="bg-purple-600 hover:bg-purple-700">
                  Add Your First Platform
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {platforms.map(platform => {
                const status = statuses.find(s => s.platform_id === platform.id);
                return (
                  <div key={platform.id} className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-white">{platform.name}</h4>
                      <StatusBadge status={status?.status || 'UNKNOWN'} />
                    </div>
                    {platform.platform_username && (
                      <p className="text-sm text-slate-400 mb-2">@{platform.platform_username}</p>
                    )}
                    {status?.last_checked_at && (
                      <p className="text-xs text-slate-500">
                        Checked {new Date(status.last_checked_at).toLocaleTimeString()}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link to={createPageUrl('KeyVault')} className="block">
          <Card className="bg-slate-900 border-slate-800 hover:border-purple-600 transition-all cursor-pointer">
            <CardContent className="pt-6">
              <Key className="w-8 h-8 text-purple-500 mb-3" />
              <h3 className="font-semibold text-white mb-1">View Stream Keys</h3>
              <p className="text-sm text-slate-400">Access your secure key vault</p>
            </CardContent>
          </Card>
        </Link>

        <Link to={createPageUrl('Guides')} className="block">
          <Card className="bg-slate-900 border-slate-800 hover:border-purple-600 transition-all cursor-pointer">
            <CardContent className="pt-6">
              <Radio className="w-8 h-8 text-purple-500 mb-3" />
              <h3 className="font-semibold text-white mb-1">Setup Guides</h3>
              <p className="text-sm text-slate-400">Step-by-step platform setup</p>
            </CardContent>
          </Card>
        </Link>

        <Link to={createPageUrl('Chat')} className="block">
          <Card className="bg-slate-900 border-slate-800 hover:border-purple-600 transition-all cursor-pointer">
            <CardContent className="pt-6">
              <Users className="w-8 h-8 text-purple-500 mb-3" />
              <h3 className="font-semibold text-white mb-1">Chat Manager</h3>
              <p className="text-sm text-slate-400">Aggregate all platform chats</p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}