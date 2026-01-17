import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import GlassCard from "@/components/ui/GlassCard";
import { toast } from "sonner";
import { User, Mail, Shield, Save, Loader2 } from "lucide-react";

export default function Profile() {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
  });

  useEffect(() => {
    base44.auth.me().then((userData) => {
      setUser(userData);
      setFormData({
        full_name: userData.full_name || "",
        email: userData.email || "",
      });
      setIsLoading(false);
    }).catch(() => {
      setIsLoading(false);
    });
  }, []);

  const updateMutation = useMutation({
    mutationFn: (data) => base44.auth.updateMe(data),
    onSuccess: () => {
      toast.success("Profile updated successfully!");
      base44.auth.me().then(setUser);
    },
    onError: () => {
      toast.error("Failed to update profile");
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    updateMutation.mutate({ full_name: formData.full_name });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-[#ea00ea]" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <GlassCard className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="h-16 w-16 rounded-full bg-gradient-to-br from-[#ea00ea] to-[#2699fe] flex items-center justify-center">
            <User className="h-8 w-8 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">{user?.full_name || "User"}</h2>
            <p className="text-slate-400">{user?.email}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label className="text-slate-300">Full Name</Label>
            <Input
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              className="bg-white/5 border-white/10 text-white"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-slate-300">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
              <Input
                value={formData.email}
                disabled
                className="bg-white/5 border-white/10 text-slate-400 pl-10 cursor-not-allowed"
              />
            </div>
            <p className="text-xs text-slate-500">Email cannot be changed</p>
          </div>

          <Button
            type="submit"
            disabled={updateMutation.isPending}
            className="w-full bg-gradient-to-r from-[#ea00ea] to-[#2699fe] hover:opacity-90 text-white border-0"
          >
            {updateMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </form>
      </GlassCard>

      <GlassCard className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <Shield className="h-5 w-5 text-[#4bce2a]" />
          <h3 className="font-semibold text-white">Account Information</h3>
        </div>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-400">Role</span>
            <span className="text-white capitalize">{user?.role || "User"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Account Created</span>
            <span className="text-white">
              {user?.created_date ? new Date(user.created_date).toLocaleDateString() : "N/A"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">User ID</span>
            <span className="text-slate-500 font-mono text-xs">{user?.id?.slice(0, 16)}...</span>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}