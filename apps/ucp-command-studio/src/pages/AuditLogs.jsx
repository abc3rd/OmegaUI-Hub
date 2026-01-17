import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import GlassCard from "@/components/ui/GlassCard";
import { 
  Search, Filter, Download, ScrollText,
  PlusCircle, Edit, CheckCircle, Shield, Play, Share2, Archive, GitBranch, Key
} from "lucide-react";

const actionIcons = {
  template_created: PlusCircle,
  template_updated: Edit,
  version_published: CheckCircle,
  packet_created: PlusCircle,
  packet_updated: Edit,
  packet_signed: CheckCircle,
  packet_verified: Shield,
  packet_executed: Play,
  packet_shared: Share2,
  packet_imported: Archive,
  packet_exported: Share2,
  packet_archived: Archive,
  key_created: Key,
  key_rotated: GitBranch,
  user_invited: PlusCircle,
  user_role_changed: Edit,
};

const actionColors = {
  template_created: "text-[#4bce2a] bg-[#4bce2a]/20",
  template_updated: "text-[#2699fe] bg-[#2699fe]/20",
  version_published: "text-[#ea00ea] bg-[#ea00ea]/20",
  packet_created: "text-[#4bce2a] bg-[#4bce2a]/20",
  packet_updated: "text-[#2699fe] bg-[#2699fe]/20",
  packet_signed: "text-[#ea00ea] bg-[#ea00ea]/20",
  packet_verified: "text-[#2699fe] bg-[#2699fe]/20",
  packet_executed: "text-[#c4653a] bg-[#c4653a]/20",
  packet_shared: "text-[#ea00ea] bg-[#ea00ea]/20",
  packet_imported: "text-[#4bce2a] bg-[#4bce2a]/20",
  packet_exported: "text-[#2699fe] bg-[#2699fe]/20",
  packet_archived: "text-gray-400 bg-gray-500/20",
  key_created: "text-[#4bce2a] bg-[#4bce2a]/20",
  key_rotated: "text-[#c4653a] bg-[#c4653a]/20",
  user_invited: "text-[#2699fe] bg-[#2699fe]/20",
  user_role_changed: "text-[#ea00ea] bg-[#ea00ea]/20",
};

export default function AuditLogs() {
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("all");

  const { data: logs = [], isLoading } = useQuery({
    queryKey: ["audit-logs"],
    queryFn: () => base44.entities.AuditLog.list("-created_date", 100),
  });

  const { data: packets = [] } = useQuery({
    queryKey: ["packets"],
    queryFn: () => base44.entities.CommandPacket.list(),
  });

  const packetMap = packets.reduce((acc, p) => ({ ...acc, [p.id]: p }), {});

  const filteredLogs = logs.filter((log) => {
    const matchesSearch = 
      log.actor_email?.toLowerCase().includes(search.toLowerCase()) ||
      packetMap[log.packet_id]?.name?.toLowerCase().includes(search.toLowerCase());
    const matchesAction = actionFilter === "all" || log.action === actionFilter;
    return matchesSearch && matchesAction;
  });

  const exportLogs = () => {
    const csv = [
      ["Date", "Action", "Actor", "Packet", "Details"],
      ...filteredLogs.map(log => [
        format(new Date(log.created_date), "yyyy-MM-dd HH:mm:ss"),
        log.action,
        log.actor_email,
        packetMap[log.packet_id]?.name || "-",
        JSON.stringify(log.details || {}),
      ])
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `audit-logs-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <GlassCard className="p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <Input
              placeholder="Search by actor or packet..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-slate-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-500" />
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="w-40 bg-white/5 border-white/10 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#16161c] border-white/10">
                <SelectItem value="all">All Actions</SelectItem>
                <SelectItem value="packet_created">Created</SelectItem>
                <SelectItem value="packet_updated">Updated</SelectItem>
                <SelectItem value="packet_signed">Signed</SelectItem>
                <SelectItem value="packet_verified">Verified</SelectItem>
                <SelectItem value="packet_executed">Executed</SelectItem>
                <SelectItem value="packet_shared">Shared</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            variant="outline"
            onClick={exportLogs}
            className="border-white/20 text-slate-300 hover:text-white"
          >
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </GlassCard>

      {/* Logs Table */}
      <GlassCard className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left p-4 text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Timestamp
                </th>
                <th className="text-left p-4 text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Action
                </th>
                <th className="text-left p-4 text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Actor
                </th>
                <th className="text-left p-4 text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Packet
                </th>
                <th className="text-left p-4 text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Details
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={5} className="p-4">
                      <div className="h-4 bg-white/5 rounded animate-pulse" />
                    </td>
                  </tr>
                ))
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center">
                    <ScrollText className="h-12 w-12 text-slate-600 mx-auto mb-3" />
                    <p className="text-slate-400">No audit logs found</p>
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const Icon = actionIcons[log.action] || ScrollText;
                  const colorClass = actionColors[log.action] || "text-slate-400 bg-slate-500/20";
                  
                  return (
                    <tr key={log.id} className="hover:bg-white/5 transition-colors">
                      <td className="p-4 text-sm text-slate-300">
                        {format(new Date(log.created_date), "MMM d, yyyy")}
                        <span className="block text-xs text-slate-500">
                          {format(new Date(log.created_date), "h:mm:ss a")}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${colorClass.split(" ")[1]}`}>
                            <Icon className={`h-3.5 w-3.5 ${colorClass.split(" ")[0]}`} />
                          </div>
                          <span className="text-sm text-white">
                            {log.action.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-slate-300">
                        {log.actor_email}
                      </td>
                      <td className="p-4 text-sm text-slate-300">
                        {packetMap[log.packet_id]?.name || "-"}
                      </td>
                      <td className="p-4 text-sm text-slate-500 font-mono text-xs">
                        {log.details ? JSON.stringify(log.details) : "-"}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}