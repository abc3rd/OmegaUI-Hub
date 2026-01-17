import React from "react";
import { Card } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

export default function TokensChart({ sessions, isLoading }) {
  // Group by date and runType
  const dataByDate = sessions.reduce((acc, session) => {
    const date = format(new Date(session.created_date), 'MMM dd');
    if (!acc[date]) {
      acc[date] = { date, baseline: 0, ucp: 0, baselineCount: 0, ucpCount: 0 };
    }
    if (session.runType === 'baseline') {
      acc[date].baseline += session.totalTokens;
      acc[date].baselineCount++;
    } else {
      acc[date].ucp += session.totalTokens;
      acc[date].ucpCount++;
    }
    return acc;
  }, {});

  // Calculate averages
  const chartData = Object.values(dataByDate).map(d => ({
    date: d.date,
    baseline: d.baselineCount > 0 ? Math.round(d.baseline / d.baselineCount) : 0,
    ucp: d.ucpCount > 0 ? Math.round(d.ucp / d.ucpCount) : 0
  }));

  return (
    <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-md p-6">
      <h3 className="text-xl font-bold text-white mb-6">Tokens Over Time</h3>
      {isLoading ? (
        <Skeleton className="h-80 w-full bg-slate-700" />
      ) : (
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={chartData}>
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
            <Line type="monotone" dataKey="baseline" stroke="#ef4444" strokeWidth={2} name="Baseline" />
            <Line type="monotone" dataKey="ucp" stroke="#10b981" strokeWidth={2} name="UCP" />
          </LineChart>
        </ResponsiveContainer>
      )}
    </Card>
  );
}