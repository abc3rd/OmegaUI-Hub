import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { format } from "date-fns";
import GlassCard from "@/components/ui/GlassCard";
import StatusBadge from "@/components/ui/StatusBadge";
import { Package, Play, Shield, MoreVertical, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function PacketCard({ packet, onExecute, onSign }) {
  const paramCount = Object.keys(packet.parameter_schema?.properties || {}).length;

  return (
    <GlassCard className="p-5 group">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#ea00ea]/20 to-[#2699fe]/20 border border-[#ea00ea]/20">
            <Package className="h-5 w-5 text-[#2699fe]" />
          </div>
          <div>
            <Link
              to={createPageUrl(`PacketDetail?id=${packet.id}`)}
              className="font-medium text-white hover:text-[#2699fe] transition-colors"
            >
              {packet.name}
            </Link>
            <div className="flex items-center gap-2 mt-1">
              <StatusBadge status={packet.status} />
              <span className="text-xs text-slate-500">v{packet.version}</span>
              {packet.signature && (
                <Shield className="h-3 w-3 text-[#4bce2a]" title="Signed" />
              )}
            </div>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="text-slate-500 hover:text-white">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-[#16161c] border-white/10">
            <DropdownMenuItem
              onClick={() => onExecute(packet)}
              className="text-slate-300 focus:text-white focus:bg-white/10"
            >
              <Play className="mr-2 h-4 w-4" />
              Execute
            </DropdownMenuItem>
            {!packet.signature && (
              <DropdownMenuItem
                onClick={() => onSign(packet)}
                className="text-slate-300 focus:text-white focus:bg-white/10"
              >
                <Shield className="mr-2 h-4 w-4" />
                Sign Packet
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {packet.description && (
        <p className="mt-3 text-sm text-slate-400 line-clamp-2">
          {packet.description}
        </p>
      )}

      <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-4">
          <span>{paramCount} parameter{paramCount !== 1 ? 's' : ''}</span>
          <span>{packet.execution_count || 0} executions</span>
        </div>
        <span>{format(new Date(packet.created_date), "MMM d, yyyy")}</span>
      </div>

      {packet.tags?.length > 0 && (
        <div className="mt-3 flex items-center gap-2 flex-wrap">
          {packet.tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/5 text-xs text-slate-400"
            >
              <Tag className="h-3 w-3" />
              {tag}
            </span>
          ))}
        </div>
      )}
    </GlassCard>
  );
}