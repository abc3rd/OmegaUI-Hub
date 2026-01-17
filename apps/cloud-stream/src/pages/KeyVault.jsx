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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Plus, Eye, EyeOff, Shield, AlertTriangle, Key as KeyIcon } from 'lucide-react';
import { toast } from 'sonner';
import CopyButton from '../components/shared/CopyButton';

export default function KeyVault() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [unlockDialog, setUnlockDialog] = useState(false);
  const [unlockedKeys, setUnlockedKeys] = useState({});
  const [formData, setFormData] = useState({
    platform_id: '',
    plaintext_key: '',
    label: 'Main',
    rotation_notes: '',
  });

  const queryClient = useQueryClient();

  const { data: platforms = [] } = useQuery({
    queryKey: ['platforms'],
    queryFn: () => base44.entities.StreamingPlatform.list(),
  });

  const { data: streamKeys = [], isLoading } = useQuery({
    queryKey: ['streamKeys'],
    queryFn: () => base44.entities.StreamKey.list('-created_date'),
  });

  const createMutation = useMutation({
    mutationFn: async (data) => {
      const { plaintext_key, ...rest } = data;
      const response = await base44.functions.invoke('encryptData', { data: plaintext_key });
      return base44.entities.StreamKey.create({
        ...rest,
        key_encrypted: response.data.encrypted,
        key_last4: response.data.last4,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['streamKeys']);
      toast.success('Stream key added to vault');
      handleCloseDialog();
    },
  });

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setFormData({
      platform_id: '',
      plaintext_key: '',
      label: 'Main',
      rotation_notes: '',
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  const handleRevealKey = async (keyId, encryptedKey) => {
    try {
      const response = await base44.functions.invoke('decryptData', { encrypted: encryptedKey });
      setUnlockedKeys({ ...unlockedKeys, [keyId]: response.data.decrypted });
      toast.success('Key revealed');
      
      // Auto-hide after 30 seconds
      setTimeout(() => {
        setUnlockedKeys(prev => {
          const newKeys = { ...prev };
          delete newKeys[keyId];
          return newKeys;
        });
      }, 30000);
    } catch (error) {
      toast.error('Failed to decrypt key');
    }
  };

  const getPlatformName = (platformId) => {
    const platform = platforms.find(p => p.id === platformId);
    return platform?.name || 'Unknown';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Stream Key Vault</h1>
          <p className="text-slate-400">Secure storage for your stream keys</p>
        </div>
        <Button onClick={() => setDialogOpen(true)} className="bg-purple-600 hover:bg-purple-700">
          <Plus className="w-5 h-5 mr-2" />
          Add Stream Key
        </Button>
      </div>

      <Alert className="bg-yellow-950 border-yellow-800">
        <Shield className="h-4 w-4 text-yellow-400" />
        <AlertDescription className="text-yellow-200">
          <strong>Security Notice:</strong> Stream keys are encrypted at rest. Revealing a key requires authentication and will auto-hide after 30 seconds.
        </AlertDescription>
      </Alert>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2].map(i => (
            <div key={i} className="h-32 bg-slate-900 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : streamKeys.length === 0 ? (
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="py-16 text-center">
            <KeyIcon className="w-16 h-16 text-slate-700 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No stream keys yet</h3>
            <p className="text-slate-400 mb-6">Add your first stream key to the secure vault</p>
            <Button onClick={() => setDialogOpen(true)} className="bg-purple-600 hover:bg-purple-700">
              <Plus className="w-5 h-5 mr-2" />
              Add Your First Key
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {streamKeys.map(key => (
            <Card key={key.id} className="bg-slate-900 border-slate-800">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-white text-lg">
                      {getPlatformName(key.platform_id)} - {key.label}
                    </CardTitle>
                    <p className="text-xs text-slate-400 mt-1">
                      Last 4: {key.key_last4}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleRevealKey(key.id, key.key_encrypted)}
                      className="text-slate-400 hover:text-white"
                    >
                      {unlockedKeys[key.id] ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </Button>
                    {unlockedKeys[key.id] && (
                      <CopyButton text={unlockedKeys[key.id]} label="Stream key" />
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-xs text-slate-400">Stream Key</Label>
                  <div className="bg-slate-800 rounded px-3 py-2 font-mono text-sm text-white mt-1">
                    {unlockedKeys[key.id] ? unlockedKeys[key.id] : '•'.repeat(40) + key.key_last4}
                  </div>
                </div>
                {key.rotation_notes && (
                  <div>
                    <Label className="text-xs text-slate-400">Rotation Notes</Label>
                    <p className="text-sm text-slate-300 mt-1">{key.rotation_notes}</p>
                  </div>
                )}
                {unlockedKeys[key.id] && (
                  <Alert className="bg-yellow-950 border-yellow-800">
                    <AlertTriangle className="h-4 w-4 text-yellow-400" />
                    <AlertDescription className="text-yellow-200 text-xs">
                      Key visible. Will auto-hide in 30 seconds for security.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add Dialog */}
      <Dialog open={dialogOpen} onOpenChange={handleCloseDialog}>
        <DialogContent className="bg-slate-900 border-slate-700 text-white">
          <DialogHeader>
            <DialogTitle>Add Stream Key</DialogTitle>
            <DialogDescription className="text-slate-400">
              Your key will be encrypted before storage
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Platform *</Label>
              <Select
                value={formData.platform_id}
                onValueChange={(value) => setFormData({ ...formData, platform_id: value })}
                required
              >
                <SelectTrigger className="bg-slate-800 border-slate-700">
                  <SelectValue placeholder="Select platform" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  {platforms.map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Stream Key *</Label>
              <Input
                type="password"
                value={formData.plaintext_key}
                onChange={(e) => setFormData({ ...formData, plaintext_key: e.target.value })}
                placeholder="Paste your stream key here"
                required
                className="bg-slate-800 border-slate-700"
              />
            </div>

            <div>
              <Label>Label</Label>
              <Input
                value={formData.label}
                onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                placeholder="Main, Backup, etc."
                className="bg-slate-800 border-slate-700"
              />
            </div>

            <div>
              <Label>Rotation Notes</Label>
              <Textarea
                value={formData.rotation_notes}
                onChange={(e) => setFormData({ ...formData, rotation_notes: e.target.value })}
                placeholder="Optional notes about this key..."
                className="bg-slate-800 border-slate-700"
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="ghost" onClick={handleCloseDialog}>
                Cancel
              </Button>
              <Button type="submit" className="bg-purple-600 hover:bg-purple-700">
                Add to Vault
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}