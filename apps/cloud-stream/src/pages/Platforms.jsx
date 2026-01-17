import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Plus, Edit, Trash2, Radio } from 'lucide-react';
import { toast } from 'sonner';
import StatusBadge from '../components/shared/StatusBadge';

const PLATFORMS = ['Twitch', 'YouTube', 'Kick', 'Facebook', 'TikTok', 'Custom RTMP'];

const INGEST_REGIONS = {
  'Twitch': ['Auto', 'US West', 'US East', 'EU West', 'EU Central', 'Asia'],
  'YouTube': ['Auto', 'Primary', 'Backup'],
  'Kick': ['Auto', 'US', 'EU', 'Asia'],
};

export default function Platforms() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPlatform, setEditingPlatform] = useState(null);
  const [formData, setFormData] = useState({
    name: 'Twitch',
    rtmp_url: '',
    ingest_region: 'Auto',
    platform_username: '',
    notes: '',
    enabled: true,
  });

  const queryClient = useQueryClient();

  const { data: platforms = [], isLoading } = useQuery({
    queryKey: ['platforms'],
    queryFn: () => base44.entities.StreamingPlatform.list('-created_date'),
  });

  const { data: statuses = [] } = useQuery({
    queryKey: ['statuses'],
    queryFn: () => base44.entities.PlatformStatus.list(),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.StreamingPlatform.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['platforms']);
      toast.success('Platform added successfully');
      handleCloseDialog();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.StreamingPlatform.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['platforms']);
      toast.success('Platform updated successfully');
      handleCloseDialog();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.StreamingPlatform.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['platforms']);
      toast.success('Platform deleted');
    },
  });

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingPlatform(null);
    setFormData({
      name: 'Twitch',
      rtmp_url: '',
      ingest_region: 'Auto',
      platform_username: '',
      notes: '',
      enabled: true,
    });
  };

  const handleEdit = (platform) => {
    setEditingPlatform(platform);
    setFormData(platform);
    setDialogOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingPlatform) {
      updateMutation.mutate({ id: editingPlatform.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (platform) => {
    if (confirm(`Delete ${platform.name}? This will also delete associated stream keys.`)) {
      deleteMutation.mutate(platform.id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Streaming Platforms</h1>
          <p className="text-slate-400">Manage your streaming destinations</p>
        </div>
        <Button onClick={() => setDialogOpen(true)} className="bg-purple-600 hover:bg-purple-700">
          <Plus className="w-5 h-5 mr-2" />
          Add Platform
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-48 bg-slate-900 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : platforms.length === 0 ? (
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="py-16 text-center">
            <Radio className="w-16 h-16 text-slate-700 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No platforms yet</h3>
            <p className="text-slate-400 mb-6">Add your first streaming platform to get started</p>
            <Button onClick={() => setDialogOpen(true)} className="bg-purple-600 hover:bg-purple-700">
              <Plus className="w-5 h-5 mr-2" />
              Add Your First Platform
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {platforms.map(platform => {
            const status = statuses.find(s => s.platform_id === platform.id);
            return (
              <Card key={platform.id} className="bg-slate-900 border-slate-800">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-white text-lg mb-2">{platform.name}</CardTitle>
                      <StatusBadge status={status?.status || 'UNKNOWN'} />
                    </div>
                    <Switch
                      checked={platform.enabled}
                      onCheckedChange={(checked) => 
                        updateMutation.mutate({ id: platform.id, data: { ...platform, enabled: checked }})
                      }
                    />
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {platform.platform_username && (
                    <div>
                      <p className="text-xs text-slate-400">Username/Channel</p>
                      <p className="text-sm text-white">@{platform.platform_username}</p>
                    </div>
                  )}
                  {platform.ingest_region && (
                    <div>
                      <p className="text-xs text-slate-400">Ingest Region</p>
                      <p className="text-sm text-white">{platform.ingest_region}</p>
                    </div>
                  )}
                  {platform.notes && (
                    <div>
                      <p className="text-xs text-slate-400">Notes</p>
                      <p className="text-sm text-slate-300">{platform.notes}</p>
                    </div>
                  )}
                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(platform)}
                      className="flex-1 border-slate-700"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(platform)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={handleCloseDialog}>
        <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingPlatform ? 'Edit Platform' : 'Add Platform'}</DialogTitle>
            <DialogDescription className="text-slate-400">
              Configure your streaming platform settings
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Platform *</Label>
              <Select
                value={formData.name}
                onValueChange={(value) => setFormData({ ...formData, name: value })}
                disabled={!!editingPlatform}
              >
                <SelectTrigger className="bg-slate-800 border-slate-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  {PLATFORMS.map(p => (
                    <SelectItem key={p} value={p}>{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {formData.name === 'Custom RTMP' && (
              <div>
                <Label>RTMP Server URL *</Label>
                <Input
                  value={formData.rtmp_url}
                  onChange={(e) => setFormData({ ...formData, rtmp_url: e.target.value })}
                  placeholder="rtmp://live.example.com/app"
                  required
                  className="bg-slate-800 border-slate-700"
                />
              </div>
            )}

            {INGEST_REGIONS[formData.name] && (
              <div>
                <Label>Ingest Region</Label>
                <Select
                  value={formData.ingest_region}
                  onValueChange={(value) => setFormData({ ...formData, ingest_region: value })}
                >
                  <SelectTrigger className="bg-slate-800 border-slate-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    {INGEST_REGIONS[formData.name].map(r => (
                      <SelectItem key={r} value={r}>{r}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <Label>Username / Channel ID</Label>
              <Input
                value={formData.platform_username}
                onChange={(e) => setFormData({ ...formData, platform_username: e.target.value })}
                placeholder="your_username"
                className="bg-slate-800 border-slate-700"
              />
            </div>

            <div>
              <Label>Notes</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Optional notes..."
                className="bg-slate-800 border-slate-700"
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="ghost" onClick={handleCloseDialog}>
                Cancel
              </Button>
              <Button type="submit" className="bg-purple-600 hover:bg-purple-700">
                {editingPlatform ? 'Update' : 'Add'} Platform
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}