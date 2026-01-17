import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  ArrowLeft,
  User,
  Palette,
  Bell,
  Shield,
  Plug,
  Download,
  Upload,
  Trash2,
  Check,
} from 'lucide-react';

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [preferences, setPreferences] = useState({
    default_canvas_width: 800,
    default_canvas_height: 1200,
    auto_save: true,
    show_grid: false,
    snap_to_grid: true,
    grid_size: 20,
    default_font: 'Inter',
    notification_email: true,
    notification_updates: true,
  });

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);
        if (userData.preferences) {
          setPreferences({ ...preferences, ...userData.preferences });
        }
      } catch (e) {
        console.error('Failed to load user');
      }
      setIsLoading(false);
    };
    loadUser();
  }, []);

  const savePreferences = async () => {
    try {
      await base44.auth.updateMe({ preferences });
      toast.success('Settings saved');
    } catch (e) {
      toast.error('Failed to save settings');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Link to={createPageUrl('Dashboard')} className="text-slate-500 hover:text-slate-700">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Settings</h1>
              <p className="text-sm text-slate-500">Manage your preferences</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-8">
        <Tabs defaultValue="general" className="space-y-8">
          <TabsList>
            <TabsTrigger value="general" className="gap-2">
              <User className="h-4 w-4" />
              General
            </TabsTrigger>
            <TabsTrigger value="editor" className="gap-2">
              <Palette className="h-4 w-4" />
              Editor
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2">
              <Bell className="h-4 w-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="integrations" className="gap-2">
              <Plug className="h-4 w-4" />
              Integrations
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle>Profile</CardTitle>
                <CardDescription>Your account information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <Label>Full Name</Label>
                    <Input
                      value={user?.full_name || ''}
                      disabled
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input
                      value={user?.email || ''}
                      disabled
                      className="mt-1"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Data Management</CardTitle>
                <CardDescription>Export or import your data</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Download className="h-5 w-5 text-slate-500" />
                    <div>
                      <p className="font-medium">Export Data</p>
                      <p className="text-sm text-slate-500">Download all your projects and templates</p>
                    </div>
                  </div>
                  <Button variant="outline">Export</Button>
                </div>
                
                <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Upload className="h-5 w-5 text-slate-500" />
                    <div>
                      <p className="font-medium">Import Data</p>
                      <p className="text-sm text-slate-500">Import projects from backup</p>
                    </div>
                  </div>
                  <Button variant="outline">Import</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="editor">
            <Card>
              <CardHeader>
                <CardTitle>Default Canvas Settings</CardTitle>
                <CardDescription>Set defaults for new projects</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <Label>Default Width (px)</Label>
                    <Input
                      type="number"
                      value={preferences.default_canvas_width}
                      onChange={(e) => setPreferences({ ...preferences, default_canvas_width: parseInt(e.target.value) || 800 })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Default Height (px)</Label>
                    <Input
                      type="number"
                      value={preferences.default_canvas_height}
                      onChange={(e) => setPreferences({ ...preferences, default_canvas_height: parseInt(e.target.value) || 1200 })}
                      className="mt-1"
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Auto-save</Label>
                      <p className="text-sm text-slate-500">Automatically save your work</p>
                    </div>
                    <Switch
                      checked={preferences.auto_save}
                      onCheckedChange={(checked) => setPreferences({ ...preferences, auto_save: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Show Grid</Label>
                      <p className="text-sm text-slate-500">Display grid overlay on canvas</p>
                    </div>
                    <Switch
                      checked={preferences.show_grid}
                      onCheckedChange={(checked) => setPreferences({ ...preferences, show_grid: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Snap to Grid</Label>
                      <p className="text-sm text-slate-500">Snap elements to grid lines</p>
                    </div>
                    <Switch
                      checked={preferences.snap_to_grid}
                      onCheckedChange={(checked) => setPreferences({ ...preferences, snap_to_grid: checked })}
                    />
                  </div>
                </div>

                <div>
                  <Label>Grid Size (px)</Label>
                  <Input
                    type="number"
                    value={preferences.grid_size}
                    onChange={(e) => setPreferences({ ...preferences, grid_size: parseInt(e.target.value) || 20 })}
                    className="mt-1 w-32"
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end mt-6">
              <Button onClick={savePreferences} className="gap-2">
                <Check className="h-4 w-4" />
                Save Changes
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Choose what notifications you receive</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-slate-500">Receive updates via email</p>
                  </div>
                  <Switch
                    checked={preferences.notification_email}
                    onCheckedChange={(checked) => setPreferences({ ...preferences, notification_email: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Product Updates</Label>
                    <p className="text-sm text-slate-500">Learn about new features and templates</p>
                  </div>
                  <Switch
                    checked={preferences.notification_updates}
                    onCheckedChange={(checked) => setPreferences({ ...preferences, notification_updates: checked })}
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end mt-6">
              <Button onClick={savePreferences} className="gap-2">
                <Check className="h-4 w-4" />
                Save Changes
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="integrations">
            <Card>
              <CardHeader>
                <CardTitle>Connected Services</CardTitle>
                <CardDescription>Integrate with external services</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium">Google Drive</p>
                      <p className="text-sm text-slate-500">Save projects to Google Drive</p>
                    </div>
                  </div>
                  <Button variant="outline">Connect</Button>
                </div>

                <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19.82 2H4.18A2.18 2.18 0 002 4.18v15.64A2.18 2.18 0 004.18 22h15.64A2.18 2.18 0 0022 19.82V4.18A2.18 2.18 0 0019.82 2zM17 8.25a4.67 4.67 0 01-1.23.33 2.11 2.11 0 00.93-1.17 4.21 4.21 0 01-1.33.51 2.1 2.1 0 00-3.58 1.92 6 6 0 01-4.34-2.2 2.1 2.1 0 00.65 2.81 2.09 2.09 0 01-.95-.26v.03a2.1 2.1 0 001.69 2.06 2.1 2.1 0 01-.95.04 2.1 2.1 0 001.96 1.46 4.22 4.22 0 01-2.62.9 4.3 4.3 0 01-.5-.03 6 6 0 003.24.95c3.88 0 6-3.22 6-6v-.27a4.29 4.29 0 001.06-1.1z"/>
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium">Dropbox</p>
                      <p className="text-sm text-slate-500">Sync with Dropbox</p>
                    </div>
                  </div>
                  <Button variant="outline">Connect</Button>
                </div>

                <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-purple-600" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium">Slack</p>
                      <p className="text-sm text-slate-500">Share projects to Slack</p>
                    </div>
                  </div>
                  <Button variant="outline">Connect</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}