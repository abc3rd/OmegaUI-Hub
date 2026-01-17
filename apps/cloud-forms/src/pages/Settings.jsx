import { useState, useEffect } from "react";
import { User } from "@/entities/all";
import { Bell, User as UserIcon, Shield } from "lucide-react";

export default function Settings() {
  const [user, setUser] = useState(null);
  const [settings, setSettings] = useState({
    emailNotifications: true,
    dataRetention: 365,
    autoBackup: false
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await User.me();
      setUser(userData);
      setIsAdmin(userData.email === "book.drivepal@gmail.com" || userData.role === "admin");
      
      // Load user settings if they exist
      if (userData.settings) {
        setSettings({ ...settings, ...userData.settings });
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      await User.updateMyUserData({ settings });
      // Add success feedback here
    } catch (error) {
      console.error("Error saving settings:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await User.logout();
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="neu-card p-6 sm:p-8">
          <div className="animate-pulse text-gray-600">Loading settings...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 max-w-full overflow-hidden">
      {/* Header */}
      <div className="neu-card p-4 sm:p-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Settings</h1>
        <p className="text-gray-600 mt-1">Manage your account and preferences</p>
      </div>

      {/* Profile Section */}
      <div className="neu-card p-4 sm:p-6">
        <div className="flex items-center space-x-3 mb-6">
          <UserIcon className="w-6 h-6 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-800">Profile</h2>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              value={user?.full_name || ''}
              readOnly
              className="neu-input w-full px-4 py-3 text-gray-700 bg-gray-50"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={user?.email || ''}
              readOnly
              className="neu-input w-full px-4 py-3 text-gray-700 bg-gray-50"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <input
              type="text"
              value={isAdmin ? 'Admin' : (user?.role || '')}
              readOnly
              className="neu-input w-full px-4 py-3 text-gray-700 bg-gray-50"
            />
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="neu-card p-4 sm:p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Bell className="w-6 h-6 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-800">Notifications</h2>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex-1 pr-4">
              <h3 className="font-medium text-gray-800">Email Notifications</h3>
              <p className="text-sm text-gray-600">Receive email alerts for new form submissions</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.emailNotifications}
                onChange={(e) => setSettings({...settings, emailNotifications: e.target.checked})}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Data & Privacy */}
      <div className="neu-card p-4 sm:p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Shield className="w-6 h-6 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-800">Data & Privacy</h2>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data Retention (days)</label>
            <select
              value={settings.dataRetention}
              onChange={(e) => setSettings({...settings, dataRetention: parseInt(e.target.value)})}
              className="neu-input w-full px-4 py-3 text-gray-700"
            >
              <option value={30}>30 days</option>
              <option value={90}>90 days</option>
              <option value={365}>1 year</option>
              <option value={-1}>Forever</option>
            </select>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex-1 pr-4">
              <h3 className="font-medium text-gray-800">Auto Backup</h3>
              <p className="text-sm text-gray-600">Automatically backup your forms and data</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.autoBackup}
                onChange={(e) => setSettings({...settings, autoBackup: e.target.checked})}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="neu-card p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <button
            onClick={handleSaveSettings}
            disabled={saving}
            className="neu-button px-6 py-3 rounded-xl text-gray-700 hover:text-gray-900 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
          
          <button
            onClick={handleLogout}
            className="neu-button px-6 py-3 rounded-xl text-red-600 hover:text-red-800"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}