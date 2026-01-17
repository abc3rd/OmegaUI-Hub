import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createPageUrl } from "@/utils";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import GlassCard from "@/components/ui/GlassCard";
import StatusBadge from "@/components/ui/StatusBadge";
import SchemaEditor from "@/components/packets/SchemaEditor";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  FileText, GitBranch, Plus, Loader2, CheckCircle, Play, 
  Save, Lock, ArrowLeft, Code, Zap, Settings2
} from "lucide-react";
import { requireOrganizationId } from "@/components/utils/organizationGuard";

export default function TemplateDetail() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const templateId = urlParams.get("id");

  const [user, setUser] = useState(null);
  const [selectedVersionId, setSelectedVersionId] = useState(null);
  const [showNewVersion, setShowNewVersion] = useState(false);
  const [newVersionNumber, setNewVersionNumber] = useState("");
  const [editedSpec, setEditedSpec] = useState({ compile: "", runner: "" });

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: template, isLoading: loadingTemplate } = useQuery({
    queryKey: ["template", templateId],
    queryFn: () => base44.entities.Template.filter({ id: templateId }).then(r => r[0]),
    enabled: !!templateId,
  });

  const { data: versions = [], isLoading: loadingVersions } = useQuery({
    queryKey: ["template-versions", templateId],
    queryFn: () => base44.entities.TemplateVersion.filter({ template_id: templateId }, "-created_date"),
    enabled: !!templateId,
  });

  const selectedVersion = versions.find(v => v.id === selectedVersionId) || versions[0];

  useEffect(() => {
    if (versions.length > 0 && !selectedVersionId) {
      setSelectedVersionId(versions[0].id);
    }
  }, [versions]);

  useEffect(() => {
    if (selectedVersion) {
      setEditedSpec({
        compile: JSON.stringify(selectedVersion.compile_spec || {}, null, 2),
        runner: JSON.stringify(selectedVersion.runner_spec || {}, null, 2),
      });
    }
  }, [selectedVersion]);

  const updateVersionMutation = useMutation({
    mutationFn: (data) => base44.entities.TemplateVersion.update(selectedVersionId, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["template-versions", templateId]);
      toast.success("Version updated!");
    },
  });

  const publishMutation = useMutation({
    mutationFn: async () => {
      const orgId = requireOrganizationId(user, false);
      if (!orgId) {
        throw new Error("Organization context required");
      }

      await base44.entities.TemplateVersion.update(selectedVersionId, {
        status: "published",
        published_at: new Date().toISOString(),
      });
      await base44.entities.AuditLog.create({
        organization_id: orgId,
        action: "version_published",
        actor_email: user?.email || "unknown",
        details: { version: selectedVersion.version, template_name: template.name },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["template-versions", templateId]);
      toast.success("Version published! It is now locked.");
    },
  });

  const createVersionMutation = useMutation({
    mutationFn: async (versionNumber) => {
      const orgId = requireOrganizationId(user, false);
      if (!orgId) {
        throw new Error("Organization context required");
      }

      const newVersion = await base44.entities.TemplateVersion.create({
        template_id: templateId,
        organization_id: orgId,
        version: versionNumber,
        status: "draft",
        parameter_schema: selectedVersion?.parameter_schema || { type: "object", properties: {}, required: [] },
        compile_spec: selectedVersion?.compile_spec || {},
        runner_spec: selectedVersion?.runner_spec || {},
      });
      return newVersion;
    },
    onSuccess: (newVersion) => {
      queryClient.invalidateQueries(["template-versions", templateId]);
      setSelectedVersionId(newVersion.id);
      setShowNewVersion(false);
      setNewVersionNumber("");
      toast.success("New version created!");
    },
  });

  const generatePacketMutation = useMutation({
    mutationFn: async () => {
      const orgId = requireOrganizationId(user, false);
      if (!orgId) {
        throw new Error("Organization context required");
      }

      // Create a command packet from the published version
      const intentDigest = await crypto.subtle.digest(
        'SHA-256',
        new TextEncoder().encode(template.intent_text)
      );
      const intentHashHex = Array.from(new Uint8Array(intentDigest))
        .map(b => b.toString(16).padStart(2, '0')).join('');

      const packet = await base44.entities.CommandPacket.create({
        organization_id: orgId,
        project_id: template.project_id,
        template_id: templateId,
        template_version_id: selectedVersionId,
        name: `${template.name} v${selectedVersion.version}`,
        description: template.description,
        original_intent: template.intent_text,
        intent_digest: intentHashHex,
        parameter_schema: selectedVersion.parameter_schema,
        compile_spec: selectedVersion.compile_spec,
        runner_spec: selectedVersion.runner_spec,
        status: "draft",
        version: 1,
      });

      await base44.entities.AuditLog.create({
        organization_id: orgId,
        action: "packet_created",
        actor_email: user?.email || "unknown",
        packet_id: packet.id,
        details: { name: packet.name, from_template: template.name },
      });

      return packet;
    },
    onSuccess: (packet) => {
      toast.success("Packet generated!");
      navigate(createPageUrl(`PacketDetail?id=${packet.id}`));
    },
  });

  const saveSpecs = () => {
    try {
      const compileSpec = JSON.parse(editedSpec.compile);
      const runnerSpec = JSON.parse(editedSpec.runner);
      updateVersionMutation.mutate({ compile_spec: compileSpec, runner_spec: runnerSpec });
    } catch (e) {
      toast.error("Invalid JSON in specs");
    }
  };

  if (loadingTemplate || loadingVersions) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-[#ea00ea]" />
      </div>
    );
  }

  if (!template) {
    return (
      <GlassCard className="p-12 text-center">
        <FileText className="h-12 w-12 text-gray-600 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-white">Template not found</h3>
      </GlassCard>
    );
  }

  const isLocked = selectedVersion?.status === "published";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(createPageUrl("Templates"))}
          className="text-gray-400 hover:text-white"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-white">{template.name}</h2>
          <p className="text-gray-400 mt-1">{template.intent_text}</p>
        </div>
      </div>

      {/* Version Selector */}
      <GlassCard className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Label className="text-gray-400">Version:</Label>
            <div className="flex gap-2">
              {versions.map((v) => (
                <Button
                  key={v.id}
                  variant={v.id === selectedVersionId ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedVersionId(v.id)}
                  className={v.id === selectedVersionId 
                    ? "bg-gradient-to-r from-[#ea00ea] to-[#2699fe] text-white border-0"
                    : "border-white/20 text-gray-300"
                  }
                >
                  <GitBranch className="h-3 w-3 mr-1" />
                  v{v.version}
                  {v.status === "published" && <Lock className="h-3 w-3 ml-1" />}
                </Button>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowNewVersion(true)}
                className="border-white/20 text-gray-300"
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {selectedVersion && <StatusBadge status={selectedVersion.status} />}
            {selectedVersion?.status === "draft" && (
              <Button
                onClick={() => publishMutation.mutate()}
                disabled={publishMutation.isPending}
                className="bg-gradient-to-r from-[#4bce2a] to-[#2699fe] hover:opacity-90 text-white border-0"
              >
                {publishMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle className="mr-2 h-4 w-4" />
                )}
                Publish
              </Button>
            )}
            {selectedVersion?.status === "published" && (
              <Button
                onClick={() => generatePacketMutation.mutate()}
                disabled={generatePacketMutation.isPending}
                className="bg-gradient-to-r from-[#ea00ea] to-[#2699fe] hover:opacity-90 text-white border-0"
              >
                {generatePacketMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Zap className="mr-2 h-4 w-4" />
                )}
                Generate Packet
              </Button>
            )}
          </div>
        </div>
      </GlassCard>

      {isLocked && (
        <GlassCard className="p-4 border-[#c4653a]/30 bg-[#c4653a]/10">
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-[#c4653a]" />
            <span className="text-[#c4653a] text-sm">
              This version is published and locked. Create a new version to make changes.
            </span>
          </div>
        </GlassCard>
      )}

      {/* Version Editor */}
      {selectedVersion && (
        <Tabs defaultValue="schema" className="space-y-4">
          <TabsList className="bg-white/5 border border-white/10">
            <TabsTrigger value="schema" className="data-[state=active]:bg-white/10">
              <Settings2 className="h-4 w-4 mr-2" />
              Parameter Schema
            </TabsTrigger>
            <TabsTrigger value="compile" className="data-[state=active]:bg-white/10">
              <Code className="h-4 w-4 mr-2" />
              Compile Spec
            </TabsTrigger>
            <TabsTrigger value="runner" className="data-[state=active]:bg-white/10">
              <Play className="h-4 w-4 mr-2" />
              Runner Spec
            </TabsTrigger>
          </TabsList>

          <TabsContent value="schema">
            <SchemaEditor
              schema={selectedVersion.parameter_schema}
              onChange={(schema) => !isLocked && updateVersionMutation.mutate({ parameter_schema: schema })}
              disabled={isLocked}
            />
          </TabsContent>

          <TabsContent value="compile">
            <GlassCard className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-medium text-white">Compile Specification</h3>
                  <p className="text-xs text-gray-400">Deterministic steps to generate the command plan</p>
                </div>
                {!isLocked && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={saveSpecs}
                    className="border-white/20 text-gray-300"
                  >
                    <Save className="h-4 w-4 mr-1" />
                    Save
                  </Button>
                )}
              </div>
              <Textarea
                value={editedSpec.compile}
                onChange={(e) => setEditedSpec({ ...editedSpec, compile: e.target.value })}
                disabled={isLocked}
                className="font-mono text-sm bg-white/5 border-white/10 text-white min-h-[300px]"
                placeholder={`{
  "steps": [
    { "type": "validate", "schema": "parameter_schema" },
    { "type": "map", "source": "params.lead_name", "target": "plan.name" },
    { "type": "transform", "operation": "lowercase", "field": "plan.name" }
  ]
}`}
              />
            </GlassCard>
          </TabsContent>

          <TabsContent value="runner">
            <GlassCard className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-medium text-white">Runner Specification</h3>
                  <p className="text-xs text-gray-400">Actions and adapters for execution</p>
                </div>
                {!isLocked && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={saveSpecs}
                    className="border-white/20 text-gray-300"
                  >
                    <Save className="h-4 w-4 mr-1" />
                    Save
                  </Button>
                )}
              </div>
              <Textarea
                value={editedSpec.runner}
                onChange={(e) => setEditedSpec({ ...editedSpec, runner: e.target.value })}
                disabled={isLocked}
                className="font-mono text-sm bg-white/5 border-white/10 text-white min-h-[300px]"
                placeholder={`{
  "actions": [
    {
      "type": "http",
      "method": "POST",
      "url": "https://api.example.com/webhook",
      "headers": { "Content-Type": "application/json" },
      "body": "{{plan}}"
    },
    {
      "type": "openai",
      "model": "gpt-4o-mini",
      "prompt": "Summarize: {{plan.notes}}"
    }
  ]
}`}
              />
            </GlassCard>
          </TabsContent>
        </Tabs>
      )}

      {/* New Version Dialog */}
      <Dialog open={showNewVersion} onOpenChange={setShowNewVersion}>
        <DialogContent className="bg-[#16161c] border-white/10">
          <DialogHeader>
            <DialogTitle className="text-white">Create New Version</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <Label className="text-gray-300">Version Number (semver)</Label>
              <Input
                value={newVersionNumber}
                onChange={(e) => setNewVersionNumber(e.target.value)}
                placeholder="e.g., 1.1.0 or 2.0.0"
                className="mt-1.5 bg-white/5 border-white/10 text-white placeholder:text-gray-500"
              />
            </div>
            <p className="text-xs text-gray-400">
              The new version will copy the schema and specs from the current version.
            </p>
            <Button
              onClick={() => createVersionMutation.mutate(newVersionNumber)}
              disabled={!newVersionNumber.trim() || createVersionMutation.isPending}
              className="w-full bg-gradient-to-r from-[#ea00ea] to-[#2699fe] hover:opacity-90 text-white border-0"
            >
              {createVersionMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <GitBranch className="mr-2 h-4 w-4" />
              )}
              Create Version
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}