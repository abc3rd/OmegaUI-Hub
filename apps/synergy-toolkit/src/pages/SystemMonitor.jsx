import React, { useState, useEffect } from "react";
import { SystemMetric } from "@/entities/SystemMetric";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Activity, 
  Cpu, 
  HardDrive, 
  Wifi, 
  Server, 
  AlertTriangle, 
  CheckCircle2,
  RefreshCw
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

export default function SystemMonitor() {
  const [metrics, setMetrics] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);

  useEffect(() => {
    loadMetrics();
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadMetrics, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadMetrics = async () => {
    setIsLoading(true);
    try {
      const data = await SystemMetric.list("-created_date", 50);
      setMetrics(data);
      setLastUpdate(new Date());
    } catch (error) {
      console.error("Failed to load system metrics:", error);
      toast.error("Failed to load system metrics.");
    }
    setIsLoading(false);
  };

  const getMetricIcon = (type) => {
    switch (type) {
      case 'cpu_usage': return Cpu;
      case 'memory_usage': return Server;
      case 'disk_usage': return HardDrive;
      case 'network_traffic': return Wifi;
      default: return Activity;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'critical': return "text-red-400";
      case 'warning': return "text-yellow-400";
      default: return "text-green-400";
    }
  };

  const getStatusBadge = (status) => {
    const config = {
      critical: { bg: "bg-red-500/20 text-red-400 border-red-500/30", icon: AlertTriangle },
      warning: { bg: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30", icon: AlertTriangle },
      normal: { bg: "bg-green-500/20 text-green-400 border-green-500/30", icon: CheckCircle2 }
    };
    const statusConfig = config[status] || config.normal;
    const Icon = statusConfig.icon;
    
    return (
      <Badge className={`${statusConfig.bg} border text-xs`}>
        <Icon className="w-3 h-3 mr-1" />
        {status}
      </Badge>
    );
  };

  const getOverallHealth = () => {
    if (metrics.length === 0) return { score: 100, status: 'normal' };
    
    const criticalCount = metrics.filter(m => m.status === 'critical').length;
    const warningCount = metrics.filter(m => m.status === 'warning').length;
    const totalCount = metrics.length;
    
    const score = Math.round(((totalCount - criticalCount - (warningCount * 0.5)) / totalCount) * 100);
    let status = 'normal';
    if (criticalCount > 0) status = 'critical';
    else if (warningCount > 0) status = 'warning';
    
    return { score, status };
  };

  const getLatestByType = (type) => {
    return metrics.filter(m => m.metric_type === type).slice(0, 5);
  };

  const health = getOverallHealth();
  const metricTypes = ['cpu_usage', 'memory_usage', 'disk_usage', 'network_traffic'];

  return (
    <div className="p-6 space-y-6 bg-gray-950 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">System Monitor</h1>
            <p className="text-gray-400 mt-2">
              Real-time system performance monitoring
              {lastUpdate && (
                <span className="ml-2">
                  • Last updated {format(lastUpdate, "HH:mm:ss")}
                </span>
              )}
            </p>
          </div>
          <Button onClick={loadMetrics} disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Overall Health Score */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-cyan-400" />
              System Health Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className={`text-4xl font-bold mb-2 ${getStatusColor(health.status)}`}>
                  {health.score}%
                </div>
                <div className="text-gray-400">Overall Health</div>
                <Progress value={health.score} className="mt-2" />
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white mb-2">
                  {metrics.filter(m => m.status === 'critical').length}
                </div>
                <div className="text-red-400">Critical Issues</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white mb-2">
                  {metrics.filter(m => m.status === 'warning').length}
                </div>
                <div className="text-yellow-400">Warnings</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Metrics by Type */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {metricTypes.map((type) => {
            const Icon = getMetricIcon(type);
            const typeMetrics = getLatestByType(type);
            const latest = typeMetrics[0];
            
            return (
              <Card key={type} className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Icon className="w-5 h-5 text-cyan-400" />
                    {type.replace('_', ' ').toUpperCase()}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="space-y-3">
                      <Skeleton className="h-8 w-24 bg-gray-700" />
                      <Skeleton className="h-4 w-full bg-gray-700" />
                    </div>
                  ) : latest ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className={`text-2xl font-bold ${getStatusColor(latest.status)}`}>
                            {latest.value}{latest.unit}
                          </div>
                          <div className="text-sm text-gray-400">{latest.source}</div>
                        </div>
                        {getStatusBadge(latest.status)}
                      </div>
                      
                      {latest.threshold_critical && (
                        <Progress 
                          value={Math.min((latest.value / latest.threshold_critical) * 100, 100)} 
                          className="h-2"
                        />
                      )}
                      
                      <div className="text-xs text-gray-500">
                        Updated {format(new Date(latest.created_date), "MMM d, HH:mm")}
                      </div>
                      
                      {/* Recent trend */}
                      {typeMetrics.length > 1 && (
                        <div className="border-t border-gray-800 pt-3">
                          <div className="text-sm text-gray-400 mb-2">Recent History</div>
                          <div className="space-y-1">
                            {typeMetrics.slice(0, 3).map((metric, index) => (
                              <div key={metric.id} className="flex items-center justify-between text-xs">
                                <span className="text-gray-500">
                                  {format(new Date(metric.created_date), "HH:mm")}
                                </span>
                                <span className={getStatusColor(metric.status)}>
                                  {metric.value}{metric.unit}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-gray-500">
                      <Activity className="w-8 h-8 mx-auto mb-2 text-gray-600" />
                      <p>No {type.replace('_', ' ')} data available</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Critical Alerts */}
        {metrics.filter(m => m.status === 'critical').length > 0 && (
          <Card className="bg-red-500/10 border-red-500/20">
            <CardHeader>
              <CardTitle className="text-red-400 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Critical Alerts Requiring Attention
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {metrics.filter(m => m.status === 'critical').slice(0, 5).map((metric) => {
                  const Icon = getMetricIcon(metric.metric_type);
                  return (
                    <div key={metric.id} className="flex items-center justify-between p-3 rounded-lg bg-red-500/5 border border-red-500/20">
                      <div className="flex items-center gap-3">
                        <Icon className="w-5 h-5 text-red-400" />
                        <div>
                          <div className="font-medium text-red-400">{metric.source}</div>
                          <div className="text-sm text-gray-300">{metric.metric_type.replace('_', ' ')}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-red-400">{metric.value}{metric.unit}</div>
                        <div className="text-xs text-gray-400">
                          {format(new Date(metric.created_date), "HH:mm")}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}