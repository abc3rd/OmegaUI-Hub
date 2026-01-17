import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Network, BarChart, Check, Zap } from 'lucide-react';

export default function NetworkStats({ history, isLoading }) {
  const stats = React.useMemo(() => {
    if (!history || history.length === 0) {
      return { total: 0, successRate: 0, avgPing: 0 };
    }
    const successfulTests = history.filter(h => h.status === 'success');
    const pingTests = history.filter(h => h.test_type === 'ping' && h.status === 'success' && h.response_time);
    
    const totalPingTime = pingTests.reduce((acc, curr) => acc + curr.response_time, 0);

    return {
      total: history.length,
      successRate: (successfulTests.length / history.length) * 100,
      avgPing: pingTests.length > 0 ? totalPingTime / pingTests.length : 0,
    };
  }, [history]);
  
  if (isLoading) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array(4).fill(0).map((_,i) => (
                <Card key={i} className="bg-gray-900 border-gray-800"><CardContent className="p-4"><Skeleton className="h-16 w-full bg-gray-700"/></CardContent></Card>
            ))}
        </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card className="bg-gray-900 border-gray-800 text-white">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-400">Total Tests</CardTitle>
          <BarChart className="h-4 w-4 text-purple-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.total}</div>
        </CardContent>
      </Card>
      <Card className="bg-gray-900 border-gray-800 text-white">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-400">Success Rate</CardTitle>
          <Check className="h-4 w-4 text-green-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.successRate.toFixed(1)}%</div>
        </CardContent>
      </Card>
      <Card className="bg-gray-900 border-gray-800 text-white">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-400">Average Ping</CardTitle>
          <Zap className="h-4 w-4 text-yellow-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.avgPing.toFixed(0)} ms</div>
        </CardContent>
      </Card>
      <Card className="bg-gray-900 border-gray-800 text-white">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-400">Network Status</CardTitle>
          <Network className="h-4 w-4 text-cyan-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-400">Healthy</div>
        </CardContent>
      </Card>
    </div>
  );
}