import React, { useState, useEffect } from "react";
import { SupportTicket, NetworkCheck, ApiIntegration, SystemMetric } from "@/entities/all";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Bot, 
  Network, 
  Plug2, 
  Activity
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

import DashboardStats from "../components/dashboard/DashboardStats";
import RecentActivity from "../components/dashboard/RecentActivity";
import SystemHealth from "../components/dashboard/SystemHealth";
import QuickActions from "../components/dashboard/QuickActions";

export default function Dashboard() {
  const [tickets, setTickets] = useState([]);
  const [networkChecks, setNetworkChecks] = useState([]);
  const [apiIntegrations, setApiIntegrations] = useState([]);
  const [systemMetrics, setSystemMetrics] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const [ticketsData, networksData, apisData, metricsData] = await Promise.all([
        SupportTicket.list("-created_date", 5),
        NetworkCheck.list("-created_date", 10),
        ApiIntegration.list("-last_tested", 10),
        SystemMetric.list("-created_date", 20)
      ]);
      
      setTickets(ticketsData);
      setNetworkChecks(networksData);
      setApiIntegrations(apisData);
      setSystemMetrics(metricsData);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    }
    setIsLoading(false);
  };

  const getTicketStats = () => {
    const open = tickets.filter(t => t.status === 'open').length;
    const inProgress = tickets.filter(t => t.status === 'in_progress').length;
    const critical = tickets.filter(t => t.priority === 'critical').length;
    return { open, inProgress, critical, total: tickets.length };
  };

  const getApiStats = () => {
    const active = apiIntegrations.filter(a => a.status === 'active').length;
    const inactive = apiIntegrations.filter(a => a.status === 'inactive').length;
    const errors = apiIntegrations.filter(a => a.status === 'error').length;
    return { active, inactive, errors, total: apiIntegrations.length };
  };

  const getSystemHealthScore = () => {
    const criticalMetrics = systemMetrics.filter(m => m.status === 'critical').length;
    const warningMetrics = systemMetrics.filter(m => m.status === 'warning').length;
    const totalMetrics = systemMetrics.length || 1;
    
    return Math.round(((totalMetrics - criticalMetrics - (warningMetrics * 0.5)) / totalMetrics) * 100);
  };

  const ticketStats = getTicketStats();
  const apiStats = getApiStats();
  const healthScore = getSystemHealthScore();

  return (
    <div className="p-6 space-y-6 bg-gray-950 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Welcome Header */}
        <div className="text-center py-8 px-6 rounded-2xl bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-cyan-500/20 border border-blue-500/20">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent mb-3">
            TechHub Pro Dashboard
          </h1>
          <p className="text-gray-300 text-lg">
            Your comprehensive IT toolkit for AI support, networking, and API management
          </p>
        </div>

        {/* Stats Overview */}
        <DashboardStats 
          ticketStats={ticketStats}
          apiStats={apiStats}
          healthScore={healthScore}
          networkChecks={networkChecks}
          isLoading={isLoading}
        />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - System Health & Quick Actions */}
          <div className="space-y-6">
            <SystemHealth 
              systemMetrics={systemMetrics}
              healthScore={healthScore}
              isLoading={isLoading}
            />
            <QuickActions />
          </div>

          {/* Middle & Right Columns - Recent Activity */}
          <div className="lg:col-span-2">
            <RecentActivity 
              tickets={tickets}
              networkChecks={networkChecks}
              apiIntegrations={apiIntegrations}
              isLoading={isLoading}
            />
          </div>
        </div>

        {/* Module Quick Access */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link to={createPageUrl("AISupport")}>
            <Card className="bg-gray-900 border-gray-800 hover:border-blue-500/50 transition-all duration-300 cursor-pointer group">
              <CardContent className="p-6 text-center">
                <Bot className="w-12 h-12 text-blue-400 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="font-semibold text-white mb-2">AI Support Hub</h3>
                <p className="text-gray-400 text-sm">Remote assistance & chat</p>
              </CardContent>
            </Card>
          </Link>

          <Link to={createPageUrl("NetworkTools")}>
            <Card className="bg-gray-900 border-gray-800 hover:border-green-500/50 transition-all duration-300 cursor-pointer group">
              <CardContent className="p-6 text-center">
                <Network className="w-12 h-12 text-green-400 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="font-semibold text-white mb-2">Network Toolkit</h3>
                <p className="text-gray-400 text-sm">Diagnostics & monitoring</p>
              </CardContent>
            </Card>
          </Link>

          <Link to={createPageUrl("ApiManager")}>
            <Card className="bg-gray-900 border-gray-800 hover:border-purple-500/50 transition-all duration-300 cursor-pointer group">
              <CardContent className="p-6 text-center">
                <Plug2 className="w-12 h-12 text-purple-400 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="font-semibold text-white mb-2">API Manager</h3>
                <p className="text-gray-400 text-sm">Integration hub & testing</p>
              </CardContent>
            </Card>
          </Link>

          <Link to={createPageUrl("SystemMonitor")}>
            <Card className="bg-gray-900 border-gray-800 hover:border-orange-500/50 transition-all duration-300 cursor-pointer group">
              <CardContent className="p-6 text-center">
                <Activity className="w-12 h-12 text-orange-400 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="font-semibold text-white mb-2">System Monitor</h3>
                <p className="text-gray-400 text-sm">Performance & alerts</p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}