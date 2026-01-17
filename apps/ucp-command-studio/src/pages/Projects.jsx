import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import GlassCard from "@/components/ui/GlassCard";
import StatusBadge from "@/components/ui/StatusBadge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FolderOpen, Plus, Loader2, FileText, Play, ScrollText } from "lucide-react";
import { requireOrganizationId } from "@/components/utils/organizationGuard";

export default function Projects() {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: "", description: "" });

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: () => base44.entities.Project.filter({}, "-created_date"),
  });

  const { data: templates = [] } = useQuery({
    queryKey: ["templates"],
    queryFn: () => base44.entities.Template.list(),
  });

  const { data: executions = [] } = useQuery({
    queryKey: ["all-executions"],
    queryFn: () => base44.entities.PacketExecution.list(),
  });

  const createMutation = useMutation({
    mutationFn: async (data) => {
      const orgId = requireOrganizationId(user);
      if (!orgId) {
        throw new Error("Organization context required");
      }

      const project = await base44.entities.Project.create({
        ...data,
        organization_id: orgId,
      });
      await base44.entities.AuditLog.create({
        organization_id: orgId,
        action: "project_created",
        actor_email: user?.email || "unknown",
        details: { name: data.name },
      });
      return project;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["projects"]);
      setShowCreate(false);
      setForm({ name: "", description: "" });
      toast.success("Project created!");
    },
  });

  const getProjectStats = (projectId) => {
    const projectTemplates = templates.filter(t => t.project_id === projectId);
    const projectExecutions = executions.filter(e => 
      projectTemplates.some(t => t.id === e.template_id)
    );
    return {
      templates: projectTemplates.length,
      executions: projectExecutions.length,
    };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Projects</h2>
          <p className="text-gray-400 mt-1">Organize your templates and packets</p>
        </div>
        <Button
          onClick={() => setShowCreate(true)}
          className="bg-gradient-to-r from-[#ea00ea] to-[#2699fe] hover:opacity-90 text-white border-0"
        >
          <Plus className="mr-2 h-4 w-4" />
          New Project
        </Button>
      </div>

      {/* Projects Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <GlassCard key={i} className="p-6 animate-pulse">
              <div className="h-6 bg-white/10 rounded w-1/2 mb-4" />
              <div className="h-4 bg-white/10 rounded w-full" />
            </GlassCard>
          ))}
        </div>
      ) : projects.length === 0 ? (
        <GlassCard className="p-12 text-center">
          <FolderOpen className="h-12 w-12 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No projects yet</h3>
          <p className="text-gray-400 mb-4">Create your first project to organize templates</p>
          <Button
            onClick={() => setShowCreate(true)}
            className="bg-gradient-to-r from-[#ea00ea] to-[#2699fe] hover:opacity-90 text-white border-0"
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Project
          </Button>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => {
            const stats = getProjectStats(project.id);
            return (
              <Link key={project.id} to={createPageUrl(`ProjectDetail?id=${project.id}`)}>
                <GlassCard className="p-6 h-full cursor-pointer group">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#ea00ea]/20 to-[#2699fe]/20 border border-[#ea00ea]/20">
                      <FolderOpen className="h-5 w-5 text-[#2699fe]" />
                    </div>
                    <StatusBadge status={project.status} />
                  </div>
                  
                  <h3 className="text-lg font-medium text-white group-hover:text-[#2699fe] transition-colors mb-2">
                    {project.name}
                  </h3>
                  <p className="text-sm text-gray-400 line-clamp-2 mb-4">
                    {project.description || "No description"}
                  </p>
                  
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <FileText className="h-3 w-3" />
                      {stats.templates} templates
                    </div>
                    <div className="flex items-center gap-1">
                      <Play className="h-3 w-3" />
                      {stats.executions} executions
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-white/10 text-xs text-gray-500">
                    Created {format(new Date(project.created_date), "MMM d, yyyy")}
                  </div>
                </GlassCard>
              </Link>
            );
          })}
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="bg-[#16161c] border-white/10">
          <DialogHeader>
            <DialogTitle className="text-white">Create New Project</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <Label className="text-gray-300">Project Name</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g., Lead Management"
                className="mt-1.5 bg-white/5 border-white/10 text-white placeholder:text-gray-500"
              />
            </div>
            <div>
              <Label className="text-gray-300">Description</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Brief description of this project"
                className="mt-1.5 bg-white/5 border-white/10 text-white placeholder:text-gray-500"
              />
            </div>
            <Button
              onClick={() => createMutation.mutate(form)}
              disabled={!form.name.trim() || createMutation.isPending}
              className="w-full bg-gradient-to-r from-[#ea00ea] to-[#2699fe] hover:opacity-90 text-white border-0"
            >
              {createMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Plus className="mr-2 h-4 w-4" />
              )}
              Create Project
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}