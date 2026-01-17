import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Settings as SettingsIcon } from "lucide-react";
import ProfileSettings from "../components/settings/ProfileSettings";
import EnergySettings from "../components/settings/EnergySettings";
import NotificationSettings from "../components/settings/NotificationSettings";

export default function Settings() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    setIsLoading(true);
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    } catch (error) {
      console.error("Failed to load user", error);
    }
    setIsLoading(false);
  };

  const handleUpdate = (updatedData) => {
    setUser(prevUser => ({ ...prevUser, ...updatedData }));
  };

  return (
    <div className="p-6 space-y-8">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-md rounded-2xl px-6 py-3 border border-white/20">
          <SettingsIcon className="w-6 h-6 text-gray-300" />
          <h1 className="text-3xl font-bold text-white">Settings</h1>
        </div>
        <p className="text-white/80 mt-4 text-lg">Manage your profile and application preferences.</p>
      </div>

      <div className="max-w-4xl mx-auto space-y-8">
        <ProfileSettings user={user} isLoading={isLoading} onUpdate={handleUpdate} />
        <EnergySettings user={user} isLoading={isLoading} onUpdate={handleUpdate} />
        <NotificationSettings isLoading={isLoading} />
      </div>
    </div>
  );
}