import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import GlassCard from "@/components/ui/GlassCard";
import { Building2, User, Save, Loader2 } from "lucide-react";

export default function Settings() {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [orgForm, setOrgForm] = useState({ name: "", description: "" });

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: organizations = [] } = useQuery({
    queryKey: ["organizations"],
    queryFn: () => base44.entities.Organization.list(),
  });

  const currentOrg = organizations.find(o => o.id === user?.organization_id);

  useEffect(() => {
    if (currentOrg) {
      setOrgForm({ name: currentOrg.name, description: currentOrg.description || "" });
    }
  }, [currentOrg]);

  const createOrgMutation = useMutation({
    mutationFn: async (data) => {
      const org = await base44.entities.Organization.create({
        ...data,
        slug: data.name.toLowerCase().replace(/\s+/g, "-"),
      });
      await base44.auth.updateMe({ organization_id: org.id, organization_role: "owner" });
      return org;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["organizations"]);
      toast.success("Organization created!");
    },
  });

  const updateOrgMutation = useMutation({
    mutationFn: (data) => base44.entities.Organization.update(currentOrg.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["organizations"]);
      toast.success("Organization updated!");
    },
  });

  const handleSave = () => {
    if (currentOrg) {
      updateOrgMutation.mutate(orgForm);
    } else {
      createOrgMutation.mutate(orgForm);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* User Profile */}
      <GlassCard className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#ea00ea]/20 to-[#2699fe]/20 border border-[#ea00ea]/20">
            <User className="h-5 w-5 text-[#2699fe]" />
          </div>
          <div>
            <h3 className="font-medium text-white">User Profile</h3>
            <p className="text-sm text-slate-400">Your account information</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label className="text-slate-400">Name</Label>
            <p className="text-white mt-1">{user?.full_name || "-"}</p>
          </div>
          <div>
            <Label className="text-slate-400">Email</Label>
            <p className="text-white mt-1">{user?.email || "-"}</p>
          </div>
          <div>
            <Label className="text-slate-400">Role</Label>
            <p className="text-white mt-1 capitalize">{user?.role || "-"}</p>
          </div>
        </div>
      </GlassCard>

      {/* Organization */}
      <GlassCard className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#ea00ea]/20 to-[#2699fe]/20 border border-[#ea00ea]/20">
            <Building2 className="h-5 w-5 text-[#ea00ea]" />
          </div>
          <div>
            <h3 className="font-medium text-white">Organization</h3>
            <p className="text-sm text-slate-400">
              {currentOrg ? "Manage your organization" : "Create an organization"}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label className="text-slate-300">Organization Name</Label>
            <Input
              value={orgForm.name}
              onChange={(e) => setOrgForm({ ...orgForm, name: e.target.value })}
              placeholder="Omega UI, LLC"
              className="mt-1.5 bg-white/5 border-white/10 text-white placeholder:text-slate-500"
            />
          </div>
          
          <div>
            <Label className="text-slate-300">Description</Label>
            <Textarea
              value={orgForm.description}
              onChange={(e) => setOrgForm({ ...orgForm, description: e.target.value })}
              placeholder="Brief description of your organization"
              className="mt-1.5 bg-white/5 border-white/10 text-white placeholder:text-slate-500"
            />
          </div>

          <Button
            onClick={handleSave}
            disabled={!orgForm.name.trim() || createOrgMutation.isPending || updateOrgMutation.isPending}
            className="w-full bg-gradient-to-r from-[#ea00ea] to-[#2699fe] hover:opacity-90 text-white border-0"
          >
            {createOrgMutation.isPending || updateOrgMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                {currentOrg ? "Update Organization" : "Create Organization"}
              </>
            )}
          </Button>
        </div>
      </GlassCard>

      {/* Stats */}
      {currentOrg && (
        <GlassCard className="p-6">
          <h3 className="font-medium text-white mb-4">Organization Stats</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-white/5">
              <p className="text-2xl font-bold text-white">-</p>
              <p className="text-sm text-slate-400">Total Packets</p>
            </div>
            <div className="p-4 rounded-lg bg-white/5">
              <p className="text-2xl font-bold text-white">-</p>
              <p className="text-sm text-slate-400">Total Executions</p>
            </div>
          </div>
        </GlassCard>
      )}
    </div>
  );
}