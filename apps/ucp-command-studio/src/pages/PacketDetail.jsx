import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createPageUrl } from "@/utils";
import { requireOrganizationId } from "@/components/utils/organizationGuard";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import GlassCard from "@/components/ui/GlassCard";
import StatusBadge from "@/components/ui/StatusBadge";
import SchemaEditor from "@/components/packets/SchemaEditor";
import LogicPreview from "@/components/packets/LogicPreview";
import {
  Play, Shield, Share2, GitBranch, Archive, Trash2,
  CheckCircle, Clock, AlertCircle, Loader2, QrCode
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function PacketDetail() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const packetId = urlParams.get("id");
  const action = urlParams.get("action");

  const [user, setUser] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isSigning, setIsSigning] = useState(false);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: packet, isLoading } = useQuery({
    queryKey: ["packet", packetId],
    queryFn: () => base44.entities.CommandPacket.filter({ id: packetId }).then(res => res[0]),
    enabled: !!packetId,
  });

  const { data: executions = [] } = useQuery({
    queryKey: ["executions", packetId],
    queryFn: () => base44.entities.PacketExecution.filter({ packet_id: packetId }, "-created_date", 10),
    enabled: !!packetId,
  });

  const updateMutation = useMutation({
    mutationFn: (data) => base44.entities.CommandPacket.update(packetId, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["packet", packetId]);
      toast.success("Packet updated!");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => base44.entities.CommandPacket.delete(packetId),
    onSuccess: () => {
      toast.success("Packet deleted");
      navigate(createPageUrl("PacketLibrary"));
    },
  });

  const signPacket = async () => {
    setIsSigning(true);
    try {
      // Validate organization context
      const orgId = requireOrganizationId(user);
      if (!orgId) {
        setIsSigning(false);
        return;
      }

      // Generate a simple hash-based signature
      const content = JSON.stringify({
        name: packet.name,
        version: packet.version,
        logic: packet.logic,
        parameter_schema: packet.parameter_schema,
      });
      const encoder = new TextEncoder();
      const data = encoder.encode(content);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const signature = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

      await base44.entities.CommandPacket.update(packetId, {
        signature,
        signed_by: user?.email,
        signed_at: new Date().toISOString(),
        status: "active",
      });

      await base44.entities.AuditLog.create({
        organization_id: orgId,
        packet_id: packetId,
        action: "packet_signed",
        actor_email: user?.email || "unknown",
        details: { signature: signature.substring(0, 16) + "..." }
      });

      queryClient.invalidateQueries(["packet", packetId]);
      toast.success("Packet signed and activated!");
    } catch (error) {
      toast.error("Failed to sign packet");
    } finally {
      setIsSigning(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-[#ea00ea]" />
      </div>
    );
  }

  if (!packet) {
    return (
      <GlassCard className="p-12 text-center">
        <AlertCircle className="h-12 w-12 text-gray-600 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-white">Packet not found</h3>
      </GlassCard>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <GlassCard className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-white">{packet.name}</h2>
              <StatusBadge status={packet.status} />
            </div>
            <p className="text-gray-400 mt-1">{packet.description || packet.original_intent}</p>
            <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
              <span>Version {packet.version}</span>
              <span>Created {format(new Date(packet.created_date), "MMM d, yyyy")}</span>
              {packet.signature && (
                <span className="flex items-center gap-1 text-[#4bce2a]">
                  <Shield className="h-3 w-3" />
                  Signed by {packet.signed_by}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => navigate(createPageUrl(`ExecutePacket?packetId=${packet.id}`))}
              className="border-white/20 text-gray-300 hover:text-white"
            >
              <Play className="mr-2 h-4 w-4" />
              Execute
            </Button>
            {!packet.signature && (
              <Button
                onClick={signPacket}
                disabled={isSigning}
                className="bg-gradient-to-r from-[#4bce2a] to-[#2699fe] hover:opacity-90 text-white border-0"
              >
                {isSigning ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Shield className="mr-2 h-4 w-4" />
                )}
                Sign Packet
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => navigate(createPageUrl(`ShareVerify?packetId=${packet.id}`))}
              className="border-white/20 text-gray-300 hover:text-white"
            >
              <QrCode className="mr-2 h-4 w-4" />
              Share
            </Button>
          </div>
        </div>
      </GlassCard>

      {/* Status & Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <GlassCard className="p-4">
          <p className="text-xs text-gray-400 mb-2">Status</p>
          <Select
            value={packet.status}
            onValueChange={(status) => updateMutation.mutate({ status })}
          >
            <SelectTrigger className="bg-white/5 border-white/10 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#16161c] border-white/10">
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="deprecated">Deprecated</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
        </GlassCard>

        <GlassCard className="p-4">
          <p className="text-xs text-gray-400 mb-2">Executions</p>
          <p className="text-2xl font-bold text-white">{packet.execution_count || 0}</p>
        </GlassCard>

        <GlassCard className="p-4">
          <p className="text-xs text-gray-400 mb-2">Actions</p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="border-white/20 text-gray-300"
              onClick={() => toast.info("Version creation coming soon!")}
            >
              <GitBranch className="mr-1 h-3 w-3" />
              New Version
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-red-500/30 text-red-400 hover:bg-red-500/10"
              onClick={() => setShowDeleteDialog(true)}
            >
              <Trash2 className="mr-1 h-3 w-3" />
              Delete
            </Button>
          </div>
        </GlassCard>
      </div>

      {/* Schema & Logic */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SchemaEditor
          schema={packet.parameter_schema}
          onChange={(parameter_schema) => updateMutation.mutate({ parameter_schema })}
        />
        <LogicPreview
          logic={packet.logic}
          onChange={(logic) => updateMutation.mutate({ logic })}
        />
      </div>

      {/* Recent Executions */}
      <GlassCard className="overflow-hidden">
        <div className="p-4 border-b border-white/10">
          <h3 className="font-medium text-white">Recent Executions</h3>
        </div>
        {executions.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No executions yet
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {executions.map((exec) => (
              <div key={exec.id} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {exec.status === "completed" && <CheckCircle className="h-4 w-4 text-[#4bce2a]" />}
                  {exec.status === "failed" && <AlertCircle className="h-4 w-4 text-red-400" />}
                  {exec.status === "running" && <Loader2 className="h-4 w-4 text-[#ea00ea] animate-spin" />}
                  {exec.status === "pending" && <Clock className="h-4 w-4 text-gray-400" />}
                  <div>
                    <p className="text-sm text-white">
                      {exec.executed_by || "Unknown user"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {format(new Date(exec.created_date), "MMM d, h:mm a")}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {exec.duration_ms && (
                    <span className="text-xs text-gray-500">{exec.duration_ms}ms</span>
                  )}
                  <StatusBadge status={exec.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </GlassCard>

      {/* Delete Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-[#16161c] border-white/10">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Delete Packet?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              This action cannot be undone. This will permanently delete the packet and all its execution history.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-white/5 border-white/10 text-white hover:bg-white/10">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteMutation.mutate()}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}