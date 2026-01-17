import React, { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Shield, Globe, AlertTriangle } from 'lucide-react';

export default function PrivacyToggle({ visibility, onToggle, itemName = "widget" }) {
  const [showConfirm, setShowConfirm] = useState(false);
  const isPublic = visibility === 'PUBLIC';

  const handleToggle = () => {
    if (!isPublic) {
      // Switching to public - show confirmation
      setShowConfirm(true);
    } else {
      // Switching to private - no confirmation needed
      onToggle('PRIVATE');
    }
  };

  const confirmPublic = () => {
    onToggle('PUBLIC');
    setShowConfirm(false);
  };

  return (
    <>
      <div className="flex items-center gap-3 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
        {isPublic ? (
          <Globe className="w-5 h-5 text-yellow-500" />
        ) : (
          <Shield className="w-5 h-5 text-green-500" />
        )}
        <div className="flex-1">
          <Label className="text-white font-medium">
            {isPublic ? 'Public Access' : 'Private (Streamer Only)'}
          </Label>
          <p className="text-xs text-slate-400 mt-0.5">
            {isPublic 
              ? `This ${itemName} is publicly accessible via shareable link` 
              : `This ${itemName} is only visible to you`}
          </p>
        </div>
        <Switch checked={isPublic} onCheckedChange={handleToggle} />
      </div>

      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent className="bg-slate-900 border-slate-700 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
              Make {itemName} Public?
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              This will generate a public URL that anyone with the link can access. The {itemName} will be visible to all viewers.
            </DialogDescription>
          </DialogHeader>
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
            <p className="text-sm text-yellow-200">
              <strong>Warning:</strong> Once public, this content can be viewed by anyone with the link. Make sure you want to share this information publicly.
            </p>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowConfirm(false)}>
              Cancel
            </Button>
            <Button onClick={confirmPublic} className="bg-yellow-600 hover:bg-yellow-700">
              Yes, Make Public
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}