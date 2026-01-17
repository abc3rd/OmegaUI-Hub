import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Zap, Activity, CheckCircle2, AlertCircle } from "lucide-react";

export default function ApiStats({ integrations, isLoading }) {
  const stats = React.useMemo(() => {
    if (!integrations || integrations.length === 0) {
      return { total: 0, active: 0, inactive: 0, errors: 0 };
    }
    return {
      total: integrations.length,
      active: integrations.filter(api => api.status === 'active').length,
      inactive: integrations.filter(api => api.status === 'inactive').length,
      errors: integrations.filter(api => api.status === 'error').length,
    };
  }, [integrations]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array(4).fill(0).map((_, i) => (
          <Card key={i} className="bg-gray-900 border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24 bg-gray-700" />
              <Skeleton className="h-6 w-6 bg-gray-700" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-12 bg-gray-700" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card className="bg-gray-900 border-gray-800 text-white">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-400">Total Integrations</CardTitle>
          <Zap className="h-4 w-4 text-purple-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.total}</div>
        </CardContent>
      </Card>
      <Card className="bg-gray-900 border-gray-800 text-white">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-400">Active</CardTitle>
          <CheckCircle2 className="h-4 w-4 text-green-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.active}</div>
        </CardContent>
      </Card>
      <Card className="bg-gray-900 border-gray-800 text-white">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-400">Inactive</CardTitle>
          <Activity className="h-4 w-4 text-gray-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.inactive}</div>
        </CardContent>
      </Card>
      <Card className="bg-gray-900 border-gray-800 text-white">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-400">Errors</CardTitle>
          <AlertCircle className="h-4 w-4 text-red-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.errors}</div>
        </CardContent>
      </Card>
    </div>
  );
}