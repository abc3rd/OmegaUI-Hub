import React from "react";
import { Card } from "@/components/ui/card";
import { TrendingDown, Zap, Clock, Layers, Bot } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function KPITiles({ stats, isLoading }) {
  const tiles = [
    {
      icon: TrendingDown,
      label: "Token Savings",
      value: stats?.tokenSavings ? `${stats.tokenSavings.toFixed(1)}%` : "0%",
      color: "from-emerald-500 to-emerald-600",
      bgColor: "from-emerald-500/20 to-emerald-500/5"
    },
    {
      icon: Zap,
      label: "Energy Savings",
      value: stats?.energySavings ? `${stats.energySavings.toFixed(1)}%` : "0%",
      color: "from-cyan-500 to-cyan-600",
      bgColor: "from-cyan-500/20 to-cyan-500/5"
    },
    {
      icon: Clock,
      label: "Avg Latency",
      value: stats?.avgLatency ? `${stats.avgLatency.toFixed(0)}ms` : "0ms",
      color: "from-purple-500 to-purple-600",
      bgColor: "from-purple-500/20 to-purple-500/5"
    },
    {
      icon: Layers,
      label: "Total Sessions",
      value: stats?.totalSessions || 0,
      color: "from-pink-500 to-pink-600",
      bgColor: "from-pink-500/20 to-pink-500/5"
    },
    {
      icon: Bot,
      label: "Models Used",
      value: stats?.modelsUsed || 0,
      color: "from-blue-500 to-blue-600",
      bgColor: "from-blue-500/20 to-blue-500/5"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
      {tiles.map((tile, index) => (
        <Card key={index} className={`bg-gradient-to-br ${tile.bgColor} border-${tile.color.split(' ')[1]}/20 backdrop-blur-md p-6`}>
          <div className="flex items-start justify-between mb-4">
            <div className={`w-12 h-12 bg-gradient-to-r ${tile.color} rounded-xl flex items-center justify-center shadow-lg`}>
              <tile.icon className="w-6 h-6 text-white" />
            </div>
          </div>
          <div>
            <p className="text-slate-400 text-sm mb-1">{tile.label}</p>
            {isLoading ? (
              <Skeleton className="h-8 w-20 bg-slate-700" />
            ) : (
              <p className="text-3xl font-bold text-white">{tile.value}</p>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}