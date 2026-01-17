import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { format } from "date-fns";
import GlassCard from "@/components/ui/GlassCard";
import { 
  PlusCircle, 
  Edit, 
  CheckCircle, 
  Shield, 
  Play, 
  Share2, 
  Archive,
  GitBranch,
  ScrollText
} from "lucide-react";

const actionIcons = {
  packet_created: PlusCircle,
  packet_updated: Edit,
  packet_signed: CheckCircle,
  packet_verified: Shield,
  packet_executed: Play,
  packet_shared: Share2,
  packet_archived: Archive,
  version_created: GitBranch,
};

const actionColors = {
  packet_created: "text-emerald-400 bg-emerald-500/20",
  packet_updated: "text-blue-400 bg-blue-500/20",
  packet_signed: "text-purple-400 bg-purple-500/20",
  packet_verified: "text-cyan-400 bg-cyan-500/20",
  packet_executed: "text-amber-400 bg-amber-500/20",
  packet_shared: "text-pink-400 bg-pink-500/20",
  packet_archived: "text-slate-400 bg-slate-500/20",
  version_created: "text-indigo-400 bg-indigo-500/20",
};

export default function RecentActivity({ logs }) {
  if (!logs?.length) {
    return (
      <GlassCard className="p-6">
        <div className="text-center py-8">
          <ScrollText className="h-12 w-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400">No activity yet</p>
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="overflow-hidden">
      <div className="p-4 border-b border-white/10">
        <h3 className="text-sm font-medium text-white">Recent Activity</h3>
      </div>
      <div className="divide-y divide-white/5 max-h-80 overflow-y-auto">
        {logs.map((log) => {
          const Icon = actionIcons[log.action] || ScrollText;
          const colorClass = actionColors[log.action] || "text-slate-400 bg-slate-500/20";
          const linkTarget = log.packet_id ? `PacketDetail?id=${log.packet_id}` : null;
          
          const content = (
            <>
              <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${colorClass.split(' ')[1]}`}>
                <Icon className={`h-4 w-4 ${colorClass.split(' ')[0]}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white">
                  {log.action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {log.actor_email} · {format(new Date(log.created_date), "MMM d, h:mm a")}
                </p>
              </div>
            </>
          );
          
          return linkTarget ? (
            <Link 
              key={log.id} 
              to={createPageUrl(linkTarget)}
              className="flex items-start gap-3 p-4 hover:bg-white/5 transition-colors"
            >
              {content}
            </Link>
          ) : (
            <div key={log.id} className="flex items-start gap-3 p-4">
              {content}
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
}