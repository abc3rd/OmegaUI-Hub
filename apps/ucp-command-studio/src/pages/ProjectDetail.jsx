import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
import {
  FolderOpen, FileText, Plus, Loader2, ArrowLeft, Play, 
  Edit, Trash2, GitBranch, Package
} from "lucide-react";

export default function ProjectDetail() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const projectId = urlParams.get("id");

  const [user, setUser] = useState(null);
  const [showEdit, setShowEdit] = useState(false);
  const [showAddTemplate, setShowAddTemplate] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", description: "" });
  const [templateForm, setTemplateForm] = useState({ name: "", intent_text: "", tags: "" });

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: project, isLoading } = useQuery({
    queryKey: ["project", projectId],
    queryFn: () => base44.entities.Project.filter({ id: projectId }).then(r => r[0]),
    enabled: !!projectId,
  });

  const { data: templates = [] } = useQuery({
    queryKey: ["project-templates", projectId],
    queryFn: () => base44.entities.Template.filter({ project_id: projectId }, "-created_date"),
    enabled: !!projectId,
  });

  const { data: versions = [] } = useQuery({
    queryKey: ["all-versions"],
    queryFn: () => base44.entities.TemplateVersion.list(),
  });

  const { data: packets = [] } = useQuery({
    queryKey: ["project-packets", projectId],
    queryFn: () => base44.entities.CommandPacket.filter({ project_id: projectId }),
    enabled: !!projectId,
  });

  const { data: executions = [] } = useQuery({
    queryKey: ["project-executions"],
    queryFn: () => base44.entities.PacketExecution.list(),
  });

  useEffect(() => {
    if (project) {
      setEditForm({ name: project.name, description: project.description || "" });
    }
  }, [project]);

  const updateMutation = useMutation({
    mutationFn: (data) => base44.entities.Project.update(projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["project", projectId]);
      setShowEdit(false);
      toast.success("Project updated!");
    },
  });

  const createTemplateMutation = useMutation({
    mutationFn: async (data) => {
      const template = await base44.entities.Template.create({
        ...data,
        project_id: projectId,
        organization_id: user?.organization_id || "default",
        tags: data.tags ? data.tags.split(",").map(t => t.trim()) : [],
      });
      
      await base44.entities.TemplateVersion.create({
        template_id: template.id,
        organization_id: user?.organization_id || "default",
        version: "1.0.0",
        status: "draft",
        parameter_schema: { type: "object", properties: {}, required: [] },
      });

      return template;
    },
    onSuccess: (template) => {
      queryClient.invalidateQueries(["project-templates", projectId]);
      setShowAddTemplate(false);
      setTemplateForm({ name: "", intent_text: "", tags: "" });
      toast.success("Template created!");
      navigate(createPageUrl(`TemplateDetail?id=${template.id}`));
    },
  });

  const getTemplateStats = (templateId) => {
    const templateVersions = versions.filter(v => v.template_id === templateId);
    const publishedCount = templateVersions.filter(v => v.status === "published").length;
    return { versions: templateVersions.length, published: publishedCount };
  };

  const getLatestVersionStatus = (templateId) => {
    const templateVersions = versions.filter(v => v.template_id === templateId);
    const sorted = templateVersions.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
    return sorted[0]?.status || "draft";
  };

  const projectPacketIds = packets.map(p => p.id);
  const projectExecutions = executions.filter(e => projectPacketIds.includes(e.packet_id));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-[#ea00ea]" />
      </div>
    );
  }

  if (!project) {
    return (
      <GlassCard className="p-12 text-center">
        <FolderOpen className="h-12 w-12 text-gray-600 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-white">Project not found</h3>
      </GlassCard>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(createPageUrl("Projects"))}
          className="text-gray-400 hover:text-white"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-white">{project.name}</h2>
            <StatusBadge status={project.status} />
          </div>
          <p className="text-gray-400 mt-1">{project.description || "No description"}</p>
        </div>
        <Button
          variant="outline"
          onClick={() => setShowEdit(true)}
          className="border-white/20 text-gray-300"
        >
          <Edit className="h-4 w-4 mr-2" />
          Edit
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <GlassCard className="p-4 text-center">
          <div className="text-2xl font-bold text-white">{templates.length}</div>
          <div className="text-xs text-gray-400">Templates</div>
        </GlassCard>
        <GlassCard className="p-4 text-center">
          <div className="text-2xl font-bold text-white">{packets.length}</div>
          <div className="text-xs text-gray-400">Packets</div>
        </GlassCard>
        <GlassCard className="p-4 text-center">
          <div className="text-2xl font-bold text-white">{projectExecutions.length}</div>
          <div className="text-xs text-gray-400">Executions</div>
        </GlassCard>
        <GlassCard className="p-4 text-center">
          <div className="text-2xl font-bold text-white">
            {projectExecutions.filter(e => e.status === "success").length}
          </div>
          <div className="text-xs text-gray-400">Successful</div>
        </GlassCard>
      </div>

      {/* Templates */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-white">Templates</h3>
          <Button
            onClick={() => setShowAddTemplate(true)}
            className="bg-gradient-to-r from-[#ea00ea] to-[#2699fe] hover:opacity-90 text-white border-0"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Template
          </Button>
        </div>

        {templates.length === 0 ? (
          <GlassCard className="p-8 text-center">
            <FileText className="h-10 w-10 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">No templates yet. Create your first template.</p>
          </GlassCard>
        ) : (
          <div className="space-y-4">
            {templates.map((template) => {
              const stats = getTemplateStats(template.id);
              const latestStatus = getLatestVersionStatus(template.id);
              return (
                <GlassCard
                  key={template.id}
                  className="p-4 cursor-pointer"
                  onClick={() => navigate(createPageUrl(`TemplateDetail?id=${template.id}`))}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#ea00ea]/20 to-[#2699fe]/20 border border-[#ea00ea]/20">
                        <FileText className="h-5 w-5 text-[#2699fe]" />
                      </div>
                      <div>
                        <h4 className="font-medium text-white hover:text-[#2699fe] transition-colors">
                          {template.name}
                        </h4>
                        <p className="text-xs text-gray-400 line-clamp-1">{template.intent_text}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-xs text-gray-500 flex items-center gap-1">
                        <GitBranch className="h-3 w-3" />
                        {stats.versions} versions
                      </div>
                      <StatusBadge status={latestStatus} />
                    </div>
                  </div>
                </GlassCard>
              );
            })}
          </div>
        )}
      </div>

      {/* Recent Packets */}
      {packets.length > 0 && (
        <div>
          <h3 className="text-lg font-medium text-white mb-4">Recent Packets</h3>
          <div className="space-y-4">
            {packets.slice(0, 5).map((packet) => (
              <GlassCard
                key={packet.id}
                className="p-4 cursor-pointer"
                onClick={() => navigate(createPageUrl(`PacketDetail?id=${packet.id}`))}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#4bce2a]/20 to-[#2699fe]/20 border border-[#4bce2a]/20">
                      <Package className="h-5 w-5 text-[#4bce2a]" />
                    </div>
                    <div>
                      <h4 className="font-medium text-white">{packet.name}</h4>
                      <p className="text-xs text-gray-500">
                        {format(new Date(packet.created_date), "MMM d, yyyy")}
                      </p>
                    </div>
                  </div>
                  <StatusBadge status={packet.status} />
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={showEdit} onOpenChange={setShowEdit}>
        <DialogContent className="bg-[#16161c] border-white/10">
          <DialogHeader>
            <DialogTitle className="text-white">Edit Project</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <Label className="text-gray-300">Project Name</Label>
              <Input
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                className="mt-1.5 bg-white/5 border-white/10 text-white"
              />
            </div>
            <div>
              <Label className="text-gray-300">Description</Label>
              <Textarea
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                className="mt-1.5 bg-white/5 border-white/10 text-white"
              />
            </div>
            <Button
              onClick={() => updateMutation.mutate(editForm)}
              disabled={updateMutation.isPending}
              className="w-full bg-gradient-to-r from-[#ea00ea] to-[#2699fe] hover:opacity-90 text-white border-0"
            >
              {updateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Template Dialog */}
      <Dialog open={showAddTemplate} onOpenChange={setShowAddTemplate}>
        <DialogContent className="bg-[#16161c] border-white/10">
          <DialogHeader>
            <DialogTitle className="text-white">Add Template</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <Label className="text-gray-300">Template Name</Label>
              <Input
                value={templateForm.name}
                onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })}
                placeholder="e.g., Lead Classifier"
                className="mt-1.5 bg-white/5 border-white/10 text-white placeholder:text-gray-500"
              />
            </div>
            <div>
              <Label className="text-gray-300">Intent Text</Label>
              <Textarea
                value={templateForm.intent_text}
                onChange={(e) => setTemplateForm({ ...templateForm, intent_text: e.target.value })}
                placeholder="Describe what this template should do..."
                className="mt-1.5 bg-white/5 border-white/10 text-white placeholder:text-gray-500"
              />
            </div>
            <div>
              <Label className="text-gray-300">Tags (comma-separated)</Label>
              <Input
                value={templateForm.tags}
                onChange={(e) => setTemplateForm({ ...templateForm, tags: e.target.value })}
                placeholder="lead, sales, automation"
                className="mt-1.5 bg-white/5 border-white/10 text-white placeholder:text-gray-500"
              />
            </div>
            <Button
              onClick={() => createTemplateMutation.mutate(templateForm)}
              disabled={!templateForm.name.trim() || !templateForm.intent_text.trim() || createTemplateMutation.isPending}
              className="w-full bg-gradient-to-r from-[#ea00ea] to-[#2699fe] hover:opacity-90 text-white border-0"
            >
              {createTemplateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Template
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}