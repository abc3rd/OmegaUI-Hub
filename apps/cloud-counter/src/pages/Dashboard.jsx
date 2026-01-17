import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import AuthGate from "../components/AuthGate";
import KPITiles from "../components/dashboard/KPITiles";
import TokensChart from "../components/dashboard/TokensChart";
import EnergyChart from "../components/dashboard/EnergyChart";
import TopWorkflows from "../components/dashboard/TopWorkflows";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RefreshCw, Zap } from "lucide-react";

export default function Dashboard() {
  const [sessions, setSessions] = useState([]);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const allSessions = await base44.entities.Session.list("-created_date", 100);
      setSessions(allSessions);
      calculateStats(allSessions);
    } catch (error) {
      console.error("Error loading sessions:", error);
    }
    setIsLoading(false);
  };

  const calculateStats = (sessions) => {
    const baseline = sessions.filter(s => s.runType === 'baseline');
    const ucp = sessions.filter(s => s.runType === 'ucp');

    const avgBaselineTokens = baseline.length > 0 ? baseline.reduce((sum, s) => sum + s.totalTokens, 0) / baseline.length : 0;
    const avgUcpTokens = ucp.length > 0 ? ucp.reduce((sum, s) => sum + s.totalTokens, 0) / ucp.length : 0;
    const tokenSavings = avgBaselineTokens > 0 ? ((avgBaselineTokens - avgUcpTokens) / avgBaselineTokens * 100) : 0;

    const avgBaselineEnergy = baseline.length > 0 ? baseline.reduce((sum, s) => sum + s.energyWh, 0) / baseline.length : 0;
    const avgUcpEnergy = ucp.length > 0 ? ucp.reduce((sum, s) => sum + s.energyWh, 0) / ucp.length : 0;
    const energySavings = avgBaselineEnergy > 0 ? ((avgBaselineEnergy - avgUcpEnergy) / avgBaselineEnergy * 100) : 0;

    const avgLatency = sessions.length > 0 ? sessions.reduce((sum, s) => sum + s.latencyMs, 0) / sessions.length : 0;
    
    const uniqueModels = new Set(sessions.map(s => s.model)).size;

    setStats({
      tokenSavings,
      energySavings,
      avgLatency,
      totalSessions: sessions.length,
      modelsUsed: uniqueModels
    });
  };

  return (
    <AuthGate>
      <div className="p-6 space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Dashboard</h1>
            <p className="text-slate-400">Monitor your AI workflow energy and token usage</p>
          </div>
          <Button onClick={loadData} variant="outline" className="border-slate-600 text-white hover:bg-slate-800">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        {sessions.length === 0 && !isLoading ? (
          <Card className="bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 border-emerald-500/30 backdrop-blur-md p-12 text-center">
            <Zap className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">No Sessions Yet</h2>
            <p className="text-slate-400 mb-6">Start by running the demo to see UCP savings in action</p>
            <Link to={createPageUrl("Demo")}>
              <Button className="bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700">
                Run Demo
              </Button>
            </Link>
          </Card>
        ) : (
          <>
            <KPITiles stats={stats} isLoading={isLoading} />

            <div className="grid lg:grid-cols-2 gap-6">
              <TokensChart sessions={sessions} isLoading={isLoading} />
              <EnergyChart sessions={sessions} isLoading={isLoading} />
            </div>

            <TopWorkflows sessions={sessions} isLoading={isLoading} />
          </>
        )}
      </div>
    </AuthGate>
  );
}