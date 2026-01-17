import React, { useState, useEffect } from "react";
import { User } from "@/entities/User";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { 
  Settings as SettingsIcon,
  User as UserIcon,
  Bell,
  Shield,
  Database,
  Download,
  Trash2,
  Save,
  LogOut
} from "lucide-react";
import { toast } from "sonner";

export default function Settings() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState({
    full_name: '',
    email: ''
  });
  const [notifications, setNotifications] = useState({
    email_alerts: true,
    system_alerts: true,
    performance_reports: false,
    security_updates: true
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    setIsLoading(true);
    try {
      const userData = await User.me();
      setUser(userData);
      setProfile({
        full_name: userData.full_name || '',
        email: userData.email || ''
      });
    } catch (error) {
      console.error("Failed to load user data:", error);
      toast.error("Failed to load user settings.");
    }
    setIsLoading(false);
  };

  const handleProfileSave = async () => {
    setIsSaving(true);
    try {
      await User.updateMyUserData({
        full_name: profile.full_name
      });
      toast.success("Profile updated successfully.");
      loadUserData();
    } catch (error) {
      toast.error("Failed to update profile.");
    }
    setIsSaving(false);
  };

  const handleLogout = async () => {
    if (confirm("Are you sure you want to logout?")) {
      try {
        await User.logout();
        toast.success("Logged out successfully.");
      } catch (error) {
        toast.error("Logout failed.");
      }
    }
  };

  const exportData = () => {
    toast.info("Data export feature coming soon.");
  };

  const deleteAccount = () => {
    if (confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      toast.error("Account deletion feature coming soon. Please contact support.");
    }
  };

  return (
    <div className="p-6 space-y-6 bg-gray-950 min-h-screen">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <SettingsIcon className="w-8 h-8 text-cyan-400" />
          <div>
            <h1 className="text-3xl font-bold text-white">Settings</h1>
            <p className="text-gray-400">Manage your account and application preferences</p>
          </div>
        </div>

        {/* Profile Settings */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <UserIcon className="w-5 h-5 text-blue-400" />
              Profile Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="full_name" className="text-gray-300">Full Name</Label>
                <Input
                  id="full_name"
                  value={profile.full_name}
                  onChange={(e) => setProfile({...profile, full_name: e.target.value})}
                  className="bg-gray-800 border-gray-700 text-white"
                  disabled={isLoading}
                />
              </div>
              <div>
                <Label htmlFor="email" className="text-gray-300">Email Address</Label>
                <Input
                  id="email"
                  value={profile.email}
                  className="bg-gray-800 border-gray-700 text-gray-400"
                  disabled
                />
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                onClick={handleProfileSave} 
                disabled={isSaving || isLoading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Bell className="w-5 h-5 text-yellow-400" />
              Notification Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(notifications).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-white">
                    {key.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </div>
                  <div className="text-sm text-gray-400">
                    {key === 'email_alerts' && 'Receive notifications via email'}
                    {key === 'system_alerts' && 'Get notified about system issues'}
                    {key === 'performance_reports' && 'Weekly performance summaries'}
                    {key === 'security_updates' && 'Security and maintenance updates'}
                  </div>
                </div>
                <Switch
                  checked={value}
                  onCheckedChange={(checked) => 
                    setNotifications({...notifications, [key]: checked})
                  }
                />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Shield className="w-5 h-5 text-green-400" />
              Security & Privacy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-white">Account Role</div>
                <div className="text-sm text-gray-400">Your current access level</div>
              </div>
              <div className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-sm font-medium border border-blue-500/30">
                {user?.role || 'User'}
              </div>
            </div>
            
            <Separator className="bg-gray-800" />
            
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-white">Account Created</div>
                <div className="text-sm text-gray-400">Member since</div>
              </div>
              <div className="text-gray-300">
                {user?.created_date ? new Date(user.created_date).toLocaleDateString() : 'Unknown'}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Database className="w-5 h-5 text-purple-400" />
              Data Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-white">Export Data</div>
                <div className="text-sm text-gray-400">Download all your data</div>
              </div>
              <Button variant="outline" onClick={exportData} className="border-gray-700 text-gray-300 hover:bg-gray-800">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
            
            <Separator className="bg-gray-800" />
            
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-red-400">Delete Account</div>
                <div className="text-sm text-gray-400">Permanently delete your account and data</div>
              </div>
              <Button variant="outline" onClick={deleteAccount} className="border-red-500/30 text-red-400 hover:bg-red-500/10">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Session Management */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <LogOut className="w-5 h-5 text-orange-400" />
              Session Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-white">Sign Out</div>
                <div className="text-sm text-gray-400">Sign out of your current session</div>
              </div>
              <Button variant="outline" onClick={handleLogout} className="border-orange-500/30 text-orange-400 hover:bg-orange-500/10">
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}