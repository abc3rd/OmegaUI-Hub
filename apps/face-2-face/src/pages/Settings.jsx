import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Settings, Save, Camera } from "lucide-react";
import { motion } from "framer-motion";

export default function SettingsPage() {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    full_name: "",
    profile_photo_url: ""
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await base44.auth.me();
      setUser(userData);
      setFormData({
        full_name: userData.full_name || "",
        profile_photo_url: userData.profile_photo_url || ""
      });
    } catch (error) {
      console.error("Error loading user:", error);
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData({ ...formData, profile_photo_url: file_url });
    } catch (error) {
      console.error("Error uploading photo:", error);
    }
    setUploading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await base44.auth.updateMe(formData);
      setUser({ ...user, ...formData });
      alert("Settings saved!");
    } catch (error) {
      console.error("Error saving settings:", error);
    }
    setSaving(false);
  };

  return (
    <div className="min-h-screen p-6 md:p-12">
      <div className="max-w-4xl mx-auto space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto">
            <Settings className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-5xl font-black text-white">Settings</h1>
        </motion.div>

        <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Profile Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center">
              <div className="relative">
                <Avatar className="h-32 w-32 border-4 border-indigo-500/30">
                  <AvatarImage src={formData.profile_photo_url} />
                  <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-4xl font-black">
                    {user?.full_name?.[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <label className="absolute bottom-0 right-0 cursor-pointer">
                  <div className="bg-indigo-500 hover:bg-indigo-600 text-white p-2 rounded-full">
                    <Camera className="w-5 h-5" />
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </label>
              </div>
              {uploading && <p className="text-sm text-slate-400 mt-2">Uploading...</p>}
            </div>

            <div>
              <Label htmlFor="full_name" className="text-slate-300">Full Name</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                className="bg-slate-800/50 border-slate-700 text-white"
              />
            </div>

            <div>
              <Label className="text-slate-300">Email</Label>
              <Input
                value={user?.email || ""}
                disabled
                className="bg-slate-800/30 border-slate-700 text-slate-500"
              />
            </div>

            <Button
              onClick={handleSave}
              disabled={saving}
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 h-12 gap-2"
            >
              <Save className="w-4 h-4" />
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}