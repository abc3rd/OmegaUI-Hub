import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Server, Cpu, HardDrive, Wifi, AlertTriangle } from "lucide-react";

export default function SystemHealth({ systemMetrics, healthScore, isLoading }) {
  const getMetricIcon = (type) => {
    switch (type) {
      case 'cpu_usage': return Cpu;
      case 'memory_usage': return Server;
      case 'disk_usage': return HardDrive;
      case 'network_traffic': return Wifi;
      default: return Server;
    }
  };

  const getStatusColor = (status, value) => {
    if (status === 'critical') return "text-red-400";
    if (status === 'warning') return "text-yellow-400";
    return "text-green-400";
  };

  const getProgressColor = (status) => {
    if (status === 'critical') return "bg-red-500";
    if (status === 'warning') return "bg-yellow-500";
    return "bg-green-500";
  };

  if (isLoading) {
    return (
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Server className="w-5 h-5 text-green-400" />
            System Health
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Array(4).fill(0).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-20 bg-gray-700" />
                <Skeleton className="h-4 w-12 bg-gray-700" />
              </div>
              <Skeleton className="h-2 w-full bg-gray-700" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  const criticalMetrics = systemMetrics.filter(m => m.status === 'critical');
  const warningMetrics = systemMetrics.filter(m => m.status === 'warning');

  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Server className="w-5 h-5 text-green-400" />
          System Health
        </CardTitle>
        <div className="text-3xl font-bold text-white">
          {healthScore}%
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {criticalMetrics.length > 0 && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
            <div className="flex items-center gap-2 text-red-400 text-sm font-medium mb-2">
              <AlertTriangle className="w-4 h-4" />
              Critical Issues ({criticalMetrics.length})
            </div>
            {criticalMetrics.slice(0, 2).map((metric, index) => {
              const Icon = getMetricIcon(metric.metric_type);
              return (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-red-400" />
                    <span className="text-gray-300">{metric.source}</span>
                  </div>
                  <span className="text-red-400 font-medium">
                    {metric.value}{metric.unit}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {warningMetrics.length > 0 && (
          <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
            <div className="flex items-center gap-2 text-yellow-400 text-sm font-medium mb-2">
              <AlertTriangle className="w-4 h-4" />
              Warnings ({warningMetrics.length})
            </div>
            {warningMetrics.slice(0, 2).map((metric, index) => {
              const Icon = getMetricIcon(metric.metric_type);
              return (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-yellow-400" />
                    <span className="text-gray-300">{metric.source}</span>
                  </div>
                  <span className="text-yellow-400 font-medium">
                    {metric.value}{metric.unit}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* Recent Metrics */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-400">Recent Metrics</h4>
          {systemMetrics.slice(0, 4).map((metric, index) => {
            const Icon = getMetricIcon(metric.metric_type);
            const percentage = metric.threshold_critical ? 
              (metric.value / metric.threshold_critical) * 100 : 
              Math.min(metric.value, 100);

            return (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className={`w-4 h-4 ${getStatusColor(metric.status)}`} />
                    <span className="text-sm text-gray-300">{metric.source}</span>
                  </div>
                  <span className={`text-sm font-medium ${getStatusColor(metric.status)}`}>
                    {metric.value}{metric.unit}
                  </span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-1.5">
                  <div 
                    className={`h-1.5 rounded-full transition-all duration-300 ${getProgressColor(metric.status)}`}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}