import React from "react";
import { User } from "@/entities/User";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  User as UserIcon, 
  Settings as SettingsIcon, 
  Palette, 
  Monitor,
  CheckCircle2,
  AlertCircle,
  Loader2
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

export default function Settings() {
  const [me, setMe] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [department, setDepartment] = React.useState("");
  const [theme, setTheme] = React.useState("light");
  const [density, setDensity] = React.useState("comfortable");
  const [saving, setSaving] = React.useState(false);
  const [saveStatus, setSaveStatus] = React.useState(null);

  React.useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    setLoading(true);
    try {
      const user = await User.me();
      setMe(user);
      setDepartment(user?.department || "");
      
      // Load preferences
      const prefs = user?.preferences || {};
      setTheme(prefs.theme || "light");
      setDensity(prefs.density || "comfortable");
      
      // Apply theme immediately
      applyTheme(prefs.theme || "light");
    } catch (error) {
      console.error("Error loading user:", error);
    }
    setLoading(false);
  };

  const applyTheme = (themeValue) => {
    const root = document.documentElement;
    
    if (themeValue === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      root.classList.toggle("dark", systemTheme === "dark");
    } else {
      root.classList.toggle("dark", themeValue === "dark");
    }
  };

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    applyTheme(newTheme);
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveStatus(null);
    
    try {
      await User.updateMyUserData({
        department: department.trim(),
        preferences: {
          theme,
          density
        },
        last_active: new Date().toISOString()
      });
      
      // Reload user data to confirm changes
      const refreshed = await User.me();
      setMe(refreshed);
      
      setSaveStatus({ type: "success", message: "Settings saved successfully!" });
      
      // Apply theme in case it changed
      applyTheme(theme);
      
      // Auto-hide success message after 3 seconds
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (error) {
      console.error("Error saving settings:", error);
      setSaveStatus({ 
        type: "error", 
        message: "Failed to save settings. Please try again." 
      });
    }
    
    setSaving(false);
  };

  const hasChanges = () => {
    if (!me) return false;
    
    const currentPrefs = me.preferences || {};
    return (
      department !== (me.department || "") ||
      theme !== (currentPrefs.theme || "light") ||
      density !== (currentPrefs.density || "comfortable")
    );
  };

  if (loading) {
    return (
      <div className="p-6 lg:p-8">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
          <SettingsIcon className="w-8 h-8 text-slate-700" />
          Settings
        </h1>
        <p className="text-slate-600 mt-2">Manage your account and preferences</p>
      </div>

      {/* Save Status Alert */}
      {saveStatus && (
        <Alert variant={saveStatus.type === "error" ? "destructive" : "default"}>
          {saveStatus.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          <AlertDescription>{saveStatus.message}</AlertDescription>
        </Alert>
      )}

      {/* Profile Section */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <UserIcon className="w-5 h-5 text-white" />
            </div>
            <CardTitle className="text-lg">Profile Information</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-700">Full Name</Label>
              <Input 
                value={me?.full_name || ""} 
                disabled 
                className="bg-slate-50"
              />
              <p className="text-xs text-slate-500">Contact an admin to change your name</p>
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-700">Email Address</Label>
              <Input 
                value={me?.email || ""} 
                disabled 
                className="bg-slate-50"
              />
              <p className="text-xs text-slate-500">Email cannot be changed</p>
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-700">Department</Label>
              <Input 
                value={department} 
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="Enter your department"
              />
              <p className="text-xs text-slate-500">Your team or department name</p>
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-700">Role</Label>
              <div className="flex items-center gap-2">
                <Input 
                  value={me?.role || ""} 
                  disabled 
                  className="bg-slate-50 flex-1"
                />
                <Badge 
                  variant="secondary" 
                  className={
                    me?.role === "admin" 
                      ? "bg-purple-100 text-purple-700" 
                      : me?.role === "editor" 
                      ? "bg-blue-100 text-blue-700" 
                      : "bg-slate-100 text-slate-700"
                  }
                >
                  {me?.role}
                </Badge>
              </div>
              <p className="text-xs text-slate-500">Contact an admin to change your role</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Appearance & Preferences */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Palette className="w-5 h-5 text-white" />
            </div>
            <CardTitle className="text-lg">Appearance & Preferences</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Theme Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-slate-700">Theme</Label>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => handleThemeChange("light")}
                className={`p-4 border-2 rounded-lg transition-all ${
                  theme === "light"
                    ? "border-blue-500 bg-blue-50"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 bg-white rounded-md border-2 border-slate-200 flex items-center justify-center">
                    <div className="w-6 h-6 bg-slate-100 rounded"></div>
                  </div>
                  <span className="text-sm font-medium">Light</span>
                  {theme === "light" && (
                    <CheckCircle2 className="w-4 h-4 text-blue-600" />
                  )}
                </div>
              </button>
              
              <button
                onClick={() => handleThemeChange("dark")}
                className={`p-4 border-2 rounded-lg transition-all ${
                  theme === "dark"
                    ? "border-blue-500 bg-blue-50"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 bg-slate-800 rounded-md border-2 border-slate-700 flex items-center justify-center">
                    <div className="w-6 h-6 bg-slate-700 rounded"></div>
                  </div>
                  <span className="text-sm font-medium">Dark</span>
                  {theme === "dark" && (
                    <CheckCircle2 className="w-4 h-4 text-blue-600" />
                  )}
                </div>
              </button>
              
              <button
                onClick={() => handleThemeChange("system")}
                className={`p-4 border-2 rounded-lg transition-all ${
                  theme === "system"
                    ? "border-blue-500 bg-blue-50"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <Monitor className="w-12 h-12 text-slate-600" />
                  <span className="text-sm font-medium">System</span>
                  {theme === "system" && (
                    <CheckCircle2 className="w-4 h-4 text-blue-600" />
                  )}
                </div>
              </button>
            </div>
            <p className="text-xs text-slate-500">
              Choose your preferred color theme. System will match your device settings.
            </p>
          </div>

          <Separator />

          {/* Density Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-slate-700">Display Density</Label>
            <Select value={density} onValueChange={setDensity}>
              <SelectTrigger className="w-full md:w-64">
                <SelectValue placeholder="Select density" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="comfortable">
                  <div className="flex flex-col items-start">
                    <span className="font-medium">Comfortable</span>
                    <span className="text-xs text-slate-500">More spacing, easier to scan</span>
                  </div>
                </SelectItem>
                <SelectItem value="compact">
                  <div className="flex flex-col items-start">
                    <span className="font-medium">Compact</span>
                    <span className="text-xs text-slate-500">Less spacing, more content</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-slate-500">
              Control how much spacing is used in the interface
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Account Info */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Account Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-600">Account Created</span>
            <span className="font-medium">
              {me?.created_date ? new Date(me.created_date).toLocaleDateString() : "N/A"}
            </span>
          </div>
          <Separator />
          <div className="flex justify-between">
            <span className="text-slate-600">Last Active</span>
            <span className="font-medium">
              {me?.last_active ? new Date(me.last_active).toLocaleString() : "N/A"}
            </span>
          </div>
          <Separator />
          <div className="flex justify-between">
            <span className="text-slate-600">User ID</span>
            <span className="font-mono text-xs">{me?.id || "N/A"}</span>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end gap-3 pt-4">
        <Button 
          variant="outline" 
          onClick={loadUserData}
          disabled={saving}
        >
          Reset Changes
        </Button>
        <Button 
          onClick={handleSave} 
          disabled={saving || !hasChanges()}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Save Changes
            </>
          )}
        </Button>
      </div>
    </div>
  );
}