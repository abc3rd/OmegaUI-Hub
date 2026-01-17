import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { format } from "date-fns";
import GlassCard from "@/components/ui/GlassCard";
import StatusBadge from "@/components/ui/StatusBadge";
import { ArrowRight, Package } from "lucide-react";

export default function RecentPackets({ packets }) {
  if (!packets?.length) {
    return (
      <GlassCard className="p-6">
        <div className="text-center py-8">
          <Package className="h-12 w-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400">No packets yet</p>
          <Link 
          to={createPageUrl("CreatePacket")}
          className="text-[#2699fe] hover:text-[#ea00ea] text-sm mt-2 inline-block"
          >
            Create your first packet →
          </Link>
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="overflow-hidden">
      <div className="p-4 border-b border-white/10">
        <h3 className="text-sm font-medium text-white">Recent Packets</h3>
      </div>
      <div className="divide-y divide-white/5">
        {packets.map((packet) => (
          <Link
            key={packet.id}
            to={createPageUrl(`PacketDetail?id=${packet.id}`)}
            className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-[#ea00ea]/20 to-[#2699fe]/20">
                <Package className="h-5 w-5 text-[#2699fe]" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">{packet.name}</p>
                <p className="text-xs text-slate-500">
                  v{packet.version} · {format(new Date(packet.created_date), "MMM d, yyyy")}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <StatusBadge status={packet.status} />
              <ArrowRight className="h-4 w-4 text-slate-500" />
            </div>
          </Link>
        ))}
      </div>
    </GlassCard>
  );
}