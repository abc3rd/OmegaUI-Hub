import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Settings as SettingsIcon, User, Shield, Bell, Save } from 'lucide-react';
import { toast } from 'sonner';

export default function Settings() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState({
    full_name: '',
    email: '',
  });

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      setProfile({
        full_name: u.full_name || '',
        email: u.email || '',
      });
    });
  }, []);

  const handleSaveProfile = async () => {
    try {
      await base44.auth.updateMe({ full_name: profile.full_name });
      toast.success('Profile updated');
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
        <p className="text-slate-400">Manage your account and preferences</p>
      </div>

      {/* Profile Settings */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <User className="w-5 h-5" />
            Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Full Name</Label>
            <Input
              value={profile.full_name}
              onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
              className="bg-slate-800 border-slate-700"
            />
          </div>
          <div>
            <Label>Email</Label>
            <Input
              value={profile.email}
              disabled
              className="bg-slate-800 border-slate-700 opacity-50"
            />
            <p className="text-xs text-slate-500 mt-1">Email cannot be changed</p>
          </div>
          <Button onClick={handleSaveProfile} className="bg-purple-600 hover:bg-purple-700">
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Security
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert className="bg-blue-950 border-blue-800">
            <Shield className="h-4 w-4 text-blue-400" />
            <AlertDescription className="text-blue-200">
              Your stream keys are encrypted at rest using industry-standard encryption.
            </AlertDescription>
          </Alert>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
              <div>
                <p className="font-medium text-white">Vault Auto-Lock</p>
                <p className="text-xs text-slate-400">Keys auto-hide after 30 seconds</p>
              </div>
              <span className="text-green-400 text-sm font-semibold">ENABLED</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
              <div>
                <p className="font-medium text-white">Two-Factor Authentication</p>
                <p className="text-xs text-slate-400">Add extra security layer</p>
              </div>
              <Button size="sm" variant="outline" className="border-slate-700" disabled>
                Coming Soon
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
            <div>
              <p className="font-medium text-white">Platform Status Alerts</p>
              <p className="text-xs text-slate-400">Get notified of connection issues</p>
            </div>
            <span className="text-slate-400 text-sm">Coming Soon</span>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
            <div>
              <p className="font-medium text-white">Stream Start/End Notifications</p>
              <p className="text-xs text-slate-400">Email alerts for session changes</p>
            </div>
            <span className="text-slate-400 text-sm">Coming Soon</span>
          </div>
        </CardContent>
      </Card>

      {/* About */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <SettingsIcon className="w-5 h-5" />
            About Cam Connect
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-300 text-sm mb-4">
            Cam Connect is your cloud camera management hub designed to help you manage your live streaming content across multiple platforms efficiently and securely.
          </p>
          <div className="space-y-2 text-xs text-slate-400">
            <p><strong>Version:</strong> 1.0.0 - Active</p>
            <p><strong>Privacy:</strong> All widgets default to PRIVATE mode</p>
            <p><strong>Security:</strong> Stream keys encrypted at rest</p>
            <p><strong>Status:</strong> All services operational</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}