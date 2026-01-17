import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { User, Upload, LogOut, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const [avatarFile, setAvatarFile] = useState(null);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const [formData, setFormData] = useState({
    full_name: user?.full_name || "",
    bio: user?.bio || "",
  });

  React.useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name || "",
        bio: user.bio || "",
      });
    }
  }, [user]);

  const updateProfileMutation = useMutation({
    mutationFn: async (data) => {
      let updates = { ...data };

      if (avatarFile) {
        const { file_url } = await base44.integrations.Core.UploadFile({ file: avatarFile });
        updates.avatar_url = file_url;
      }

      return base44.auth.updateMe(updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['currentUser']);
      toast.success("Profile updated successfully!");
      setAvatarFile(null);
    },
    onError: (error) => {
      toast.error("Failed to update profile: " + error.message);
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    updateProfileMutation.mutate(formData);
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
    }
  };

  const handleLogout = () => {
    base44.auth.logout();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Settings</h1>
          <p className="text-slate-400">
            Manage your account and preferences
          </p>
        </motion.div>

        <Card className="bg-slate-900/50 backdrop-blur-xl border-slate-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <User className="w-5 h-5" />
              Profile Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Avatar */}
              <div className="flex items-center gap-6">
                <div className="relative">
                  {user?.avatar_url || avatarFile ? (
                    <img
                      src={avatarFile ? URL.createObjectURL(avatarFile) : user.avatar_url}
                      alt="Avatar"
                      className="w-24 h-24 rounded-full object-cover border-4 border-slate-800"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center border-4 border-slate-800">
                      <span className="text-white font-bold text-3xl">
                        {user?.full_name?.[0]?.toUpperCase() || 'U'}
                      </span>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                    id="avatar-upload"
                  />
                  <label
                    htmlFor="avatar-upload"
                    className="absolute bottom-0 right-0 p-2 bg-blue-600 rounded-full cursor-pointer hover:bg-blue-700 transition-colors"
                  >
                    <Upload className="w-4 h-4 text-white" />
                  </label>
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-1">{user?.full_name}</h3>
                  <p className="text-slate-400 text-sm mb-2">{user?.email}</p>
                  <p className="text-slate-500 text-xs">
                    Member since {new Date(user?.created_date).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Full Name */}
              <div>
                <Label className="text-slate-300">Full Name</Label>
                <Input
                  value={formData.full_name}
                  onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                  className="bg-slate-950 border-slate-700 text-white"
                />
              </div>

              {/* Bio */}
              <div>
                <Label className="text-slate-300">Bio</Label>
                <Textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({...formData, bio: e.target.value})}
                  placeholder="Tell us about yourself... This helps personalize your AI"
                  className="bg-slate-950 border-slate-700 text-white min-h-[120px]"
                />
              </div>

              <Button
                type="submit"
                disabled={updateProfileMutation.isPending}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {updateProfileMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 backdrop-blur-xl border-slate-800">
          <CardHeader>
            <CardTitle className="text-white">Account Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="border-red-800 text-red-400 hover:bg-red-500/20"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}