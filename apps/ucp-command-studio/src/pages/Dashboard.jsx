import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import StatsCard from "@/components/dashboard/StatsCard";
import RecentPackets from "@/components/dashboard/RecentPackets";
import RecentActivity from "@/components/dashboard/RecentActivity";
import { Package, Play, CheckCircle, Share2, PlusCircle, Zap, Database } from "lucide-react";
import DemoRunner from "@/components/demo/DemoRunner";
import ResetDemo from "@/components/demo/ResetDemo";
import RunFullDemo from "@/components/demo/RunFullDemo";

export default function Dashboard() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: packets = [] } = useQuery({
    queryKey: ["packets"],
    queryFn: () => base44.entities.CommandPacket.list("-created_date", 10),
  });

  const { data: executions = [] } = useQuery({
    queryKey: ["executions"],
    queryFn: () => base44.entities.PacketExecution.list("-created_date", 50),
  });

  const { data: logs = [] } = useQuery({
    queryKey: ["logs"],
    queryFn: () => base44.entities.AuditLog.list("-created_date", 10),
  });

  const activePackets = packets.filter(p => p.status === "active").length;
  const signedPackets = packets.filter(p => p.signature).length;
  const totalExecutions = executions.length;
  const successfulExecutions = executions.filter(e => e.status === "completed").length;
  const cachedPackets = packets.filter(p => p.logic).length;

  return (
    <div className="space-y-8">
      {/* Demo Runner */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <RunFullDemo />
          <DemoRunner user={user} />
        </div>
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <h4 className="text-sm font-medium text-white mb-2">Demo Mode Active</h4>
            <p className="text-xs text-slate-400 mb-3">
              All demo records are tagged for easy cleanup
            </p>
            <ResetDemo user={user} />
          </div>
        </div>
      </div>

      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#ea00ea]/20 via-[#2699fe]/20 to-[#4bce2a]/10 border border-white/10 p-8">
        <div className="absolute inset-0 bg-gradient-to-r from-[#ea00ea]/5 to-transparent" />
        <div className="relative flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">
              Welcome back{user?.full_name ? `, ${user.full_name.split(' ')[0]}` : ''}
            </h2>
            <p className="mt-1 text-slate-300">
              Transform your intents into powerful, reusable command packets.
            </p>
          </div>
          <Link to={createPageUrl("CreatePacket")}>
            <Button className="bg-gradient-to-r from-[#ea00ea] to-[#2699fe] hover:opacity-90 text-white border-0">
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Packet
            </Button>
          </Link>
        </div>
        <div className="absolute -right-10 -top-10 opacity-10">
          <Zap className="h-48 w-48 text-[#ea00ea]" />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Packets"
          value={packets.length}
          subtitle={`${activePackets} active`}
          icon={Package}
          href="PacketLibrary"
        />
        <StatsCard
          title="Packet Cache"
          value={cachedPackets}
          subtitle="HMAC signed & replay protected"
          icon={Database}
          href="PacketLibrary"
        />
        <StatsCard
          title="Executions"
          value={totalExecutions}
          subtitle={`${successfulExecutions} successful`}
          icon={Play}
          href="ExecutePacket"
        />
        <StatsCard
          title="Signed Packets"
          value={signedPackets}
          subtitle="Verified & secure"
          icon={CheckCircle}
          href="PacketLibrary"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentPackets packets={packets.slice(0, 5)} />
        </div>
        <div>
          <RecentActivity logs={logs} />
        </div>
      </div>
    </div>
  );
}