import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import GlassCard from "@/components/ui/GlassCard";
import StatusBadge from "@/components/ui/StatusBadge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FileText, Plus, Loader2, Search, Tag, FolderOpen, GitBranch } from "lucide-react";
import { requireOrganizationId } from "@/components/utils/organizationGuard";

export default function Templates() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({
    name: "",
    description: "",
    intent_text: "",
    project_id: "",
    tags: "",
  });

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: templates = [], isLoading } = useQuery({
    queryKey: ["templates"],
    queryFn: () => base44.entities.Template.filter({}, "-created_date"),
  });

  const { data: projects = [] } = useQuery({
    queryKey: ["projects"],
    queryFn: () => base44.entities.Project.list(),
  });

  const { data: versions = [] } = useQuery({
    queryKey: ["template-versions"],
    queryFn: () => base44.entities.TemplateVersion.list(),
  });

  const createMutation = useMutation({
    mutationFn: async (data) => {
      const orgId = requireOrganizationId(user);
      if (!orgId) {
        throw new Error("Organization context required");
      }

      const template = await base44.entities.Template.create({
        ...data,
        organization_id: orgId,
        tags: data.tags ? data.tags.split(",").map(t => t.trim()) : [],
      });
      
      // Create initial draft version
      await base44.entities.TemplateVersion.create({
        template_id: template.id,
        organization_id: orgId,
        version: "1.0.0",
        status: "draft",
        parameter_schema: { type: "object", properties: {}, required: [] },
        compile_spec: {},
        runner_spec: {},
      });

      await base44.entities.AuditLog.create({
        organization_id: orgId,
        action: "template_created",
        actor_email: user?.email || "unknown",
        details: { name: data.name },
      });
      return template;
    },
    onSuccess: (template) => {
      queryClient.invalidateQueries(["templates"]);
      queryClient.invalidateQueries(["template-versions"]);
      setShowCreate(false);
      setForm({ name: "", description: "", intent_text: "", project_id: "", tags: "" });
      toast.success("Template created!");
      navigate(createPageUrl(`TemplateDetail?id=${template.id}`));
    },
  });

  const projectMap = projects.reduce((acc, p) => ({ ...acc, [p.id]: p }), {});

  const filteredTemplates = templates.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.intent_text?.toLowerCase().includes(search.toLowerCase())
  );

  const getVersionCount = (templateId) => 
    versions.filter(v => v.template_id === templateId).length;

  const getLatestVersion = (templateId) => {
    const templateVersions = versions.filter(v => v.template_id === templateId);
    return templateVersions.sort((a, b) => new Date(b.created_date) - new Date(a.created_date))[0];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Templates</h2>
          <p className="text-gray-400 mt-1">Reusable command templates with versioning</p>
        </div>
        <Button
          onClick={() => setShowCreate(true)}
          className="bg-gradient-to-r from-[#ea00ea] to-[#2699fe] hover:opacity-90 text-white border-0"
        >
          <Plus className="mr-2 h-4 w-4" />
          New Template
        </Button>
      </div>

      {/* Search */}
      <GlassCard className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search templates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-gray-500"
          />
        </div>
      </GlassCard>

      {/* Templates List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <GlassCard key={i} className="p-6 animate-pulse">
              <div className="h-6 bg-white/10 rounded w-1/3 mb-4" />
              <div className="h-4 bg-white/10 rounded w-full" />
            </GlassCard>
          ))}
        </div>
      ) : filteredTemplates.length === 0 ? (
        <GlassCard className="p-12 text-center">
          <FileText className="h-12 w-12 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No templates yet</h3>
          <p className="text-gray-400 mb-4">Create your first template to get started</p>
          <Button
            onClick={() => setShowCreate(true)}
            className="bg-gradient-to-r from-[#ea00ea] to-[#2699fe] hover:opacity-90 text-white border-0"
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Template
          </Button>
        </GlassCard>
      ) : (
        <div className="space-y-4">
          {filteredTemplates.map((template) => {
            const latestVersion = getLatestVersion(template.id);
            const project = projectMap[template.project_id];
            return (
              <GlassCard
                key={template.id}
                className="p-6 cursor-pointer"
                onClick={() => navigate(createPageUrl(`TemplateDetail?id=${template.id}`))}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#ea00ea]/20 to-[#2699fe]/20 border border-[#ea00ea]/20">
                      <FileText className="h-6 w-6 text-[#2699fe]" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-white hover:text-[#2699fe] transition-colors">
                        {template.name}
                      </h3>
                      <p className="text-sm text-gray-400 mt-1 line-clamp-2">
                        {template.intent_text}
                      </p>
                      <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                        {project && (
                          <span className="flex items-center gap-1">
                            <FolderOpen className="h-3 w-3" />
                            {project.name}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <GitBranch className="h-3 w-3" />
                          {getVersionCount(template.id)} versions
                        </span>
                        {template.tags?.length > 0 && (
                          <span className="flex items-center gap-1">
                            <Tag className="h-3 w-3" />
                            {template.tags.join(", ")}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {latestVersion && (
                      <StatusBadge status={latestVersion.status} />
                    )}
                    <span className="text-xs text-gray-500">
                      {format(new Date(template.created_date), "MMM d, yyyy")}
                    </span>
                  </div>
                </div>
              </GlassCard>
            );
          })}
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="bg-[#16161c] border-white/10 max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white">Create New Template</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <Label className="text-gray-300">Template Name</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g., Summarize Lead Inquiry"
                className="mt-1.5 bg-white/5 border-white/10 text-white placeholder:text-gray-500"
              />
            </div>
            
            <div>
              <Label className="text-gray-300">Project</Label>
              <Select value={form.project_id} onValueChange={(v) => setForm({ ...form, project_id: v })}>
                <SelectTrigger className="mt-1.5 bg-white/5 border-white/10 text-white">
                  <SelectValue placeholder="Select project..." />
                </SelectTrigger>
                <SelectContent className="bg-[#16161c] border-white/10">
                  {projects.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-gray-300">Intent Text</Label>
              <Textarea
                value={form.intent_text}
                onChange={(e) => setForm({ ...form, intent_text: e.target.value })}
                placeholder="Describe what this template should do in natural language..."
                className="mt-1.5 bg-white/5 border-white/10 text-white placeholder:text-gray-500 min-h-[100px]"
              />
            </div>

            <div>
              <Label className="text-gray-300">Description</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Additional details about this template"
                className="mt-1.5 bg-white/5 border-white/10 text-white placeholder:text-gray-500"
              />
            </div>

            <div>
              <Label className="text-gray-300">Tags (comma-separated)</Label>
              <Input
                value={form.tags}
                onChange={(e) => setForm({ ...form, tags: e.target.value })}
                placeholder="lead, sales, automation"
                className="mt-1.5 bg-white/5 border-white/10 text-white placeholder:text-gray-500"
              />
            </div>

            <Button
              onClick={() => createMutation.mutate(form)}
              disabled={!form.name.trim() || !form.intent_text.trim() || !form.project_id || createMutation.isPending}
              className="w-full bg-gradient-to-r from-[#ea00ea] to-[#2699fe] hover:opacity-90 text-white border-0"
            >
              {createMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Plus className="mr-2 h-4 w-4" />
              )}
              Create Template
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}