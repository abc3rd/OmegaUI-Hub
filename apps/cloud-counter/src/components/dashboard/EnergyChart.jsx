import React from "react";
import { Card } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

export default function EnergyChart({ sessions, isLoading }) {
  const dataByDate = sessions.reduce((acc, session) => {
    const date = format(new Date(session.created_date), 'MMM dd');
    if (!acc[date]) {
      acc[date] = { date, baseline: 0, ucp: 0, baselineCount: 0, ucpCount: 0 };
    }
    if (session.runType === 'baseline') {
      acc[date].baseline += session.energyWh;
      acc[date].baselineCount++;
    } else {
      acc[date].ucp += session.energyWh;
      acc[date].ucpCount++;
    }
    return acc;
  }, {});

  const chartData = Object.values(dataByDate).map(d => ({
    date: d.date,
    baseline: d.baselineCount > 0 ? (d.baseline / d.baselineCount).toFixed(3) : 0,
    ucp: d.ucpCount > 0 ? (d.ucp / d.ucpCount).toFixed(3) : 0
  }));

  return (
    <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-md p-6">
      <h3 className="text-xl font-bold text-white mb-6">Energy Over Time (Wh)</h3>
      {isLoading ? (
        <Skeleton className="h-80 w-full bg-slate-700" />
      ) : (
        <ResponsiveContainer width="100%" height={320}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorBaseline" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorUcp" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="date" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1e293b', 
                border: '1px solid #334155',
                borderRadius: '8px',
                color: '#fff'
              }} 
            />
            <Legend />
            <Area type="monotone" dataKey="baseline" stroke="#ef4444" fillOpacity={1} fill="url(#colorBaseline)" name="Baseline" />
            <Area type="monotone" dataKey="ucp" stroke="#10b981" fillOpacity={1} fill="url(#colorUcp)" name="UCP" />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </Card>
  );
}