import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Play, Square, Tv, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function Sessions() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    description: '',
    target_platforms: [],
    stream_mode: 'SIMULCAST',
  });

  const queryClient = useQueryClient();

  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ['sessions'],
    queryFn: () => base44.entities.StreamSession.list('-created_date'),
  });

  const { data: platforms = [] } = useQuery({
    queryKey: ['platforms'],
    queryFn: () => base44.entities.StreamingPlatform.filter({ enabled: true }),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.StreamSession.create({
      ...data,
      start_time: new Date().toISOString(),
      is_active: true,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['sessions']);
      toast.success('Stream session started!');
      handleCloseDialog();
    },
  });

  const endSessionMutation = useMutation({
    mutationFn: ({ id }) => base44.entities.StreamSession.update(id, {
      end_time: new Date().toISOString(),
      is_active: false,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['sessions']);
      toast.success('Stream session ended');
    },
  });

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setFormData({
      title: '',
      category: '',
      description: '',
      target_platforms: [],
      stream_mode: 'SIMULCAST',
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  const handleEndSession = (session) => {
    if (confirm('End this stream session?')) {
      endSessionMutation.mutate({ id: session.id });
    }
  };

  const activeSession = sessions.find(s => s.is_active);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Stream Sessions</h1>
          <p className="text-slate-400">Manage your streaming sessions</p>
        </div>
        {!activeSession && (
          <Button onClick={() => setDialogOpen(true)} className="bg-purple-600 hover:bg-purple-700">
            <Play className="w-5 h-5 mr-2" />
            Start New Session
          </Button>
        )}
      </div>

      {/* Active Session */}
      {activeSession && (
        <Card className="bg-gradient-to-br from-red-900 to-slate-900 border-red-800">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-red-600 p-3 rounded-lg animate-pulse">
                  <Tv className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-red-200 text-sm font-semibold">LIVE NOW</span>
                  </div>
                  <CardTitle className="text-white text-2xl">{activeSession.title}</CardTitle>
                  {activeSession.category && (
                    <p className="text-red-200 text-sm mt-1">{activeSession.category}</p>
                  )}
                </div>
              </div>
              <Button
                variant="destructive"
                onClick={() => handleEndSession(activeSession)}
                className="gap-2"
              >
                <Square className="w-4 h-4" />
                End Stream
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-red-200 mb-1">Started</p>
                <p className="text-white font-semibold">
                  {format(new Date(activeSession.start_time), 'PPp')}
                </p>
              </div>
              <div>
                <p className="text-xs text-red-200 mb-1">Streaming To</p>
                <div className="flex flex-wrap gap-2">
                  {activeSession.target_platforms?.map(platformId => {
                    const platform = platforms.find(p => p.id === platformId);
                    return platform ? (
                      <span key={platformId} className="bg-red-800 text-white text-xs px-2 py-1 rounded">
                        {platform.name}
                      </span>
                    ) : null;
                  })}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Previous Sessions */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white">Previous Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-20 bg-slate-800 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : sessions.filter(s => !s.is_active).length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-slate-700 mx-auto mb-4" />
              <p className="text-slate-400">No previous sessions</p>
              <p className="text-xs text-slate-500 mt-2">Your stream history will appear here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sessions
                .filter(s => !s.is_active)
                .slice(0, 10)
                .map(session => (
                  <div key={session.id} className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-white mb-1">{session.title}</h3>
                        {session.category && (
                          <p className="text-sm text-slate-400 mb-2">{session.category}</p>
                        )}
                        <p className="text-xs text-slate-500">
                          {format(new Date(session.start_time), 'PPp')}
                          {session.end_time && ` - ${format(new Date(session.end_time), 'p')}`}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {session.target_platforms?.slice(0, 3).map(platformId => {
                          const platform = platforms.find(p => p.id === platformId);
                          return platform ? (
                            <span key={platformId} className="bg-slate-700 text-slate-300 text-xs px-2 py-1 rounded">
                              {platform.name}
                            </span>
                          ) : null;
                        })}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Start Session Dialog */}
      <Dialog open={dialogOpen} onOpenChange={handleCloseDialog}>
        <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle>Start New Stream Session</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Stream Title *</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="What are you streaming today?"
                required
                className="bg-slate-800 border-slate-700"
              />
            </div>

            <div>
              <Label>Category / Game</Label>
              <Input
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="e.g., Just Chatting, Gaming, etc."
                className="bg-slate-800 border-slate-700"
              />
            </div>

            <div>
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Optional stream description..."
                className="bg-slate-800 border-slate-700"
              />
            </div>

            <div>
              <Label>Stream Mode</Label>
              <Select
                value={formData.stream_mode}
                onValueChange={(value) => setFormData({ ...formData, stream_mode: value })}
              >
                <SelectTrigger className="bg-slate-800 border-slate-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="SIMULCAST">Simulcast (All platforms simultaneously)</SelectItem>
                  <SelectItem value="PRIMARY_FAILOVER">Primary + Failover</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="mb-3 block">Target Platforms *</Label>
              <div className="space-y-2">
                {platforms.map(platform => (
                  <div key={platform.id} className="flex items-center gap-2">
                    <Checkbox
                      id={platform.id}
                      checked={formData.target_platforms.includes(platform.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setFormData({
                            ...formData,
                            target_platforms: [...formData.target_platforms, platform.id]
                          });
                        } else {
                          setFormData({
                            ...formData,
                            target_platforms: formData.target_platforms.filter(id => id !== platform.id)
                          });
                        }
                      }}
                    />
                    <Label htmlFor={platform.id} className="text-sm cursor-pointer">
                      {platform.name}
                      {platform.platform_username && (
                        <span className="text-slate-400 ml-2">@{platform.platform_username}</span>
                      )}
                    </Label>
                  </div>
                ))}
                {platforms.length === 0 && (
                  <p className="text-sm text-slate-400">No platforms available. Add platforms first.</p>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="ghost" onClick={handleCloseDialog}>
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-red-600 hover:bg-red-700 gap-2"
                disabled={formData.target_platforms.length === 0}
              >
                <Play className="w-4 h-4" />
                Go Live
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}