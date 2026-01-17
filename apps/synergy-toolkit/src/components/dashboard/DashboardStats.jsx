import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  TrendingUp,
  Zap,
  Globe,
  Server
} from "lucide-react";

export default function DashboardStats({ ticketStats, apiStats, healthScore, networkChecks, isLoading }) {
  const getHealthColor = (score) => {
    if (score >= 90) return "text-green-400";
    if (score >= 70) return "text-yellow-400";
    return "text-red-400";
  };

  const getHealthBadge = (score) => {
    if (score >= 90) return "bg-green-500/20 text-green-400 border-green-500/30";
    if (score >= 70) return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
    return "bg-red-500/20 text-red-400 border-red-500/30";
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array(4).fill(0).map((_, i) => (
          <Card key={i} className="bg-gray-900 border-gray-800">
            <CardHeader className="pb-3">
              <Skeleton className="h-4 w-20 bg-gray-700" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 bg-gray-700 mb-2" />
              <Skeleton className="h-3 w-24 bg-gray-700" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Support Tickets */}
      <Card className="bg-gray-900 border-gray-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full transform translate-x-8 -translate-y-8" />
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-blue-400" />
            Support Tickets
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-white mb-2">{ticketStats.total}</div>
          <div className="flex items-center gap-2 mb-3">
            <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-xs">
              {ticketStats.critical} Critical
            </Badge>
            <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-xs">
              {ticketStats.open} Open
            </Badge>
          </div>
          <div className="flex items-center text-sm text-gray-400">
            <TrendingUp className="w-4 h-4 mr-1 text-green-400" />
            {ticketStats.inProgress} in progress
          </div>
        </CardContent>
      </Card>

      {/* API Integrations */}
      <Card className="bg-gray-900 border-gray-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full transform translate-x-8 -translate-y-8" />
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
            <Zap className="w-4 h-4 text-purple-400" />
            API Integrations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-white mb-2">{apiStats.total}</div>
          <div className="flex items-center gap-2 mb-3">
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
              {apiStats.active} Active
            </Badge>
            {apiStats.errors > 0 && (
              <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-xs">
                {apiStats.errors} Errors
              </Badge>
            )}
          </div>
          <div className="flex items-center text-sm text-gray-400">
            <CheckCircle2 className="w-4 h-4 mr-1 text-green-400" />
            {((apiStats.active / (apiStats.total || 1)) * 100).toFixed(0)}% uptime
          </div>
        </CardContent>
      </Card>

      {/* System Health */}
      <Card className="bg-gray-900 border-gray-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full transform translate-x-8 -translate-y-8" />
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
            <Server className="w-4 h-4 text-green-400" />
            System Health
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`text-3xl font-bold mb-2 ${getHealthColor(healthScore)}`}>
            {healthScore}%
          </div>
          <Progress 
            value={healthScore} 
            className="mb-3 h-2"
          />
          <Badge className={`text-xs ${getHealthBadge(healthScore)}`}>
            {healthScore >= 90 ? 'Excellent' : healthScore >= 70 ? 'Good' : 'Needs Attention'}
          </Badge>
        </CardContent>
      </Card>

      {/* Network Activity */}
      <Card className="bg-gray-900 border-gray-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full transform translate-x-8 -translate-y-8" />
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
            <Globe className="w-4 h-4 text-cyan-400" />
            Network Tests
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-white mb-2">{networkChecks.length}</div>
          <div className="flex items-center gap-2 mb-3">
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
              {networkChecks.filter(n => n.status === 'success').length} Success
            </Badge>
            {networkChecks.filter(n => n.status === 'failed').length > 0 && (
              <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-xs">
                {networkChecks.filter(n => n.status === 'failed').length} Failed
              </Badge>
            )}
          </div>
          <div className="flex items-center text-sm text-gray-400">
            <Clock className="w-4 h-4 mr-1 text-cyan-400" />
            Last 24 hours
          </div>
        </CardContent>
      </Card>
    </div>
  );
}