import React, { useState, useEffect } from "react";
import { User } from "@/entities/all";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Save, 
  User as UserIcon, 
  Bot, 
  Bell, 
  Shield,
  Palette
} from "lucide-react";

export default function SettingsPage() {
  const [currentUser, setCurrentUser] = useState(null);
  const [settings, setSettings] = useState({
    // Profile settings
    full_name: "",
    bio: "",
    
    // AI settings
    default_model: "gpt-4",
    temperature: 0.7,
    max_tokens: 2000,
    system_prompt: "",
    
    // Interface settings
    theme: "light",
    language: "en",
    chat_layout: "sidebar",
    
    // Notification settings
    email_notifications: true,
    usage_alerts: true,
    weekly_summary: false,
    
    // Privacy settings
    data_sharing: false,
    conversation_history: true,
    auto_delete_after: "never"
  });

  useEffect(() => {
    loadUserSettings();
  }, []);

  const loadUserSettings = async () => {
    try {
      const user = await User.me();
      setCurrentUser(user);
      setSettings(prev => ({
        ...prev,
        full_name: user.full_name || "",
        bio: user.bio || "",
        ...user.settings
      }));
    } catch (error) {
      console.error("Error loading user settings:", error);
    }
  };

  const handleSave = async (section) => {
    try {
      if (section === 'profile') {
        await User.updateMyUserData({
          full_name: settings.full_name,
          bio: settings.bio
        });
      } else {
        await User.updateMyUserData({
          settings: {
            ...currentUser?.settings,
            [section]: Object.fromEntries(
              Object.entries(settings).filter(([key]) => 
                getSectionFields(section).includes(key)
              )
            )
          }
        });
      }
      
      await loadUserSettings();
    } catch (error) {
      console.error("Error saving settings:", error);
    }
  };

  const getSectionFields = (section) => {
    const fieldMap = {
      ai: ['default_model', 'temperature', 'max_tokens', 'system_prompt'],
      interface: ['theme', 'language', 'chat_layout'],
      notifications: ['email_notifications', 'usage_alerts', 'weekly_summary'],
      privacy: ['data_sharing', 'conversation_history', 'auto_delete_after']
    };
    return fieldMap[section] || [];
  };

  const updateSetting = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-2">Customize your GLYTCH AI experience</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="ai">AI Settings</TabsTrigger>
          <TabsTrigger value="interface">Interface</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserIcon className="w-5 h-5" />
                Profile Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-2xl">
                    {settings.full_name.charAt(0) || currentUser?.email.charAt(0) || 'U'}
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">{settings.full_name || 'User'}</h3>
                  <p className="text-gray-500">{currentUser?.email}</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Member since {currentUser ? new Date(currentUser.created_date).toLocaleDateString() : ''}
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input
                    id="full_name"
                    value={settings.full_name}
                    onChange={(e) => updateSetting('full_name', e.target.value)}
                    placeholder="Enter your full name"
                  />
                </div>
                
                <div>
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={settings.bio}
                    onChange={(e) => updateSetting('bio', e.target.value)}
                    placeholder="Tell us about yourself"
                    className="h-24"
                  />
                </div>
              </div>
              
              <Button onClick={() => handleSave('profile')} className="w-full">
                <Save className="w-4 h-4 mr-2" />
                Save Profile
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="w-5 h-5" />
                AI Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="default_model">Default Model</Label>
                  <Select value={settings.default_model} onValueChange={(value) => updateSetting('default_model', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gpt-4">GPT-4</SelectItem>
                      <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                      <SelectItem value="claude-3">Claude 3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="temperature">Temperature ({settings.temperature})</Label>
                  <input
                    type="range"
                    id="temperature"
                    min="0"
                    max="2"
                    step="0.1"
                    value={settings.temperature}
                    onChange={(e) => updateSetting('temperature', parseFloat(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Focused</span>
                    <span>Balanced</span>
                    <span>Creative</span>
                  </div>
                </div>
              </div>
              
              <div>
                <Label htmlFor="max_tokens">Max Tokens</Label>
                <Input
                  id="max_tokens"
                  type="number"
                  value={settings.max_tokens}
                  onChange={(e) => updateSetting('max_tokens', parseInt(e.target.value))}
                  min="100"
                  max="4000"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Higher values allow longer responses but use more tokens
                </p>
              </div>
              
              <div>
                <Label htmlFor="system_prompt">Default System Prompt</Label>
                <Textarea
                  id="system_prompt"
                  value={settings.system_prompt}
                  onChange={(e) => updateSetting('system_prompt', e.target.value)}
                  placeholder="You are a helpful AI assistant..."
                  className="h-24"
                />
              </div>
              
              <Button onClick={() => handleSave('ai')} className="w-full">
                <Save className="w-4 h-4 mr-2" />
                Save AI Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="interface">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Interface Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="theme">Theme</Label>
                  <Select value={settings.theme} onValueChange={(value) => updateSetting('theme', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="language">Language</Label>
                  <Select value={settings.language} onValueChange={(value) => updateSetting('language', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                      <SelectItem value="de">German</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="md:col-span-2">
                  <Label htmlFor="chat_layout">Chat Layout</Label>
                  <Select value={settings.chat_layout} onValueChange={(value) => updateSetting('chat_layout', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sidebar">Sidebar</SelectItem>
                      <SelectItem value="centered">Centered</SelectItem>
                      <SelectItem value="fullwidth">Full Width</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <Button onClick={() => handleSave('interface')} className="w-full">
                <Save className="w-4 h-4 mr-2" />
                Save Interface Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notification Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Email Notifications</h4>
                    <p className="text-sm text-gray-500">Receive important updates via email</p>
                  </div>
                  <Switch
                    checked={settings.email_notifications}
                    onCheckedChange={(checked) => updateSetting('email_notifications', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Usage Alerts</h4>
                    <p className="text-sm text-gray-500">Get notified when approaching usage limits</p>
                  </div>
                  <Switch
                    checked={settings.usage_alerts}
                    onCheckedChange={(checked) => updateSetting('usage_alerts', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Weekly Summary</h4>
                    <p className="text-sm text-gray-500">Receive weekly usage reports</p>
                  </div>
                  <Switch
                    checked={settings.weekly_summary}
                    onCheckedChange={(checked) => updateSetting('weekly_summary', checked)}
                  />
                </div>
              </div>
              
              <Button onClick={() => handleSave('notifications')} className="w-full">
                <Save className="w-4 h-4 mr-2" />
                Save Notification Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Privacy & Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Data Sharing</h4>
                    <p className="text-sm text-gray-500">Allow anonymous usage data for improvements</p>
                  </div>
                  <Switch
                    checked={settings.data_sharing}
                    onCheckedChange={(checked) => updateSetting('data_sharing', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Conversation History</h4>
                    <p className="text-sm text-gray-500">Save conversation history for easy access</p>
                  </div>
                  <Switch
                    checked={settings.conversation_history}
                    onCheckedChange={(checked) => updateSetting('conversation_history', checked)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="auto_delete_after">Auto-delete conversations after</Label>
                  <Select value={settings.auto_delete_after} onValueChange={(value) => updateSetting('auto_delete_after', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="never">Never</SelectItem>
                      <SelectItem value="30d">30 days</SelectItem>
                      <SelectItem value="90d">90 days</SelectItem>
                      <SelectItem value="365d">1 year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <Button onClick={() => handleSave('privacy')} className="w-full">
                <Save className="w-4 h-4 mr-2" />
                Save Privacy Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}