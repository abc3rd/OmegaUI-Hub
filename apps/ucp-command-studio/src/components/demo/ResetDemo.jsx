import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Trash2, Loader2 } from "lucide-react";
import { requireOrganizationId } from "@/components/utils/organizationGuard";

export default function ResetDemo({ user }) {
  const queryClient = useQueryClient();
  const [isResetting, setIsResetting] = useState(false);

  const resetDemoData = async () => {
    setIsResetting(true);
    try {
      const orgId = requireOrganizationId(user, false);
      if (!orgId) {
        throw new Error("Organization context required");
      }

      let deletedCount = 0;

      // Delete demo packets
      const packets = await base44.entities.CommandPacket.filter({ tags: ["demo"] });
      for (const p of packets) {
        await base44.entities.CommandPacket.delete(p.id);
        deletedCount++;
      }

      // Delete demo executions
      const executions = await base44.entities.PacketExecution.filter({ tags: ["demo"] });
      for (const e of executions) {
        await base44.entities.PacketExecution.delete(e.id);
        deletedCount++;
      }

      // Delete demo templates
      const templates = await base44.entities.Template.filter({ tags: ["demo"] });
      for (const t of templates) {
        await base44.entities.Template.delete(t.id);
        deletedCount++;
      }

      // Delete demo template versions
      const versions = await base44.entities.TemplateVersion.list();
      for (const v of versions) {
        const template = templates.find(t => t.id === v.template_id);
        if (template) {
          await base44.entities.TemplateVersion.delete(v.id);
          deletedCount++;
        }
      }

      // Delete demo keys
      const keys = await base44.entities.KeyPair.filter({ tags: ["demo"] });
      for (const k of keys) {
        await base44.entities.KeyPair.delete(k.id);
        deletedCount++;
      }

      // Delete demo projects
      const projects = await base44.entities.Project.filter({ tags: ["demo"] });
      for (const p of projects) {
        await base44.entities.Project.delete(p.id);
        deletedCount++;
      }

      // Log the reset
      await base44.entities.AuditLog.create({
        organization_id: orgId,
        action: "demo_data_reset",
        actor_email: user?.email || "system",
        details: { deleted_count: deletedCount }
      });

      // Invalidate all queries to refresh UI
      queryClient.invalidateQueries();
      
      toast.success(`Reset complete! Deleted ${deletedCount} demo records.`);
    } catch (error) {
      console.error("Reset failed:", error);
      toast.error("Reset failed: " + error.message);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="border-red-500/30 text-red-400 hover:bg-red-500/10"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Reset Demo Data
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="bg-[#16161c] border-white/10">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-white">Reset Demo Data?</AlertDialogTitle>
          <AlertDialogDescription className="text-gray-400">
            This will permanently delete all demo-tagged records (packets, templates, projects, keys, executions). 
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="bg-white/5 border-white/10 text-white hover:bg-white/10">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={resetDemoData}
            disabled={isResetting}
            className="bg-red-500 hover:bg-red-600 text-white"
          >
            {isResetting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Resetting...
              </>
            ) : (
              <>
                <Trash2 className="mr-2 h-4 w-4" />
                Reset Demo Data
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}