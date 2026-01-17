import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { createPageUrl } from "@/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import PacketCard from "@/components/packets/PacketCard";
import GlassCard from "@/components/ui/GlassCard";
import { Search, Filter, Package, PlusCircle, Grid, List } from "lucide-react";

export default function PacketLibrary() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState("grid");

  const { data: packets = [], isLoading } = useQuery({
    queryKey: ["packets"],
    queryFn: () => base44.entities.CommandPacket.list("-created_date"),
  });

  const filteredPackets = packets.filter((packet) => {
    const matchesSearch = packet.name.toLowerCase().includes(search.toLowerCase()) ||
      packet.description?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || packet.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleExecute = (packet) => {
    navigate(createPageUrl(`ExecutePacket?packetId=${packet.id}`));
  };

  const handleSign = (packet) => {
    navigate(createPageUrl(`PacketDetail?id=${packet.id}&action=sign`));
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <GlassCard className="p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <Input
              placeholder="Search packets..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-slate-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-500" />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32 bg-white/5 border-white/10 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#16161c] border-white/10">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="deprecated">Deprecated</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setViewMode("grid")}
              className={viewMode === "grid" ? "bg-white/10 text-white" : "text-slate-500"}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setViewMode("list")}
              className={viewMode === "list" ? "bg-white/10 text-white" : "text-slate-500"}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </GlassCard>

      {/* Packets Grid/List */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <GlassCard key={i} className="p-5 animate-pulse">
              <div className="h-10 w-10 rounded-xl bg-white/10" />
              <div className="h-4 w-3/4 bg-white/10 rounded mt-4" />
              <div className="h-3 w-1/2 bg-white/10 rounded mt-2" />
            </GlassCard>
          ))}
        </div>
      ) : filteredPackets.length === 0 ? (
        <GlassCard className="p-12 text-center">
          <Package className="h-12 w-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white">No packets found</h3>
          <p className="text-slate-400 mt-1">
            {packets.length === 0 ? "Create your first command packet to get started." : "Try adjusting your filters."}
          </p>
          {packets.length === 0 && (
            <Button
              onClick={() => navigate(createPageUrl("CreatePacket"))}
              className="mt-4 bg-gradient-to-r from-[#ea00ea] to-[#2699fe] hover:opacity-90 text-white border-0"
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Packet
            </Button>
          )}
        </GlassCard>
      ) : (
        <div className={viewMode === "grid" 
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          : "space-y-3"
        }>
          {filteredPackets.map((packet) => (
            <PacketCard
              key={packet.id}
              packet={packet}
              onExecute={handleExecute}
              onSign={handleSign}
            />
          ))}
        </div>
      )}
    </div>
  );
}