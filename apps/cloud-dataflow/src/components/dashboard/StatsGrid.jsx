import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Database, Table2, Search, Users, TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const StatCard = ({ title, value, icon: Icon, color, trend, isLoading }) => {
  if (isLoading) {
    return (
      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-16" />
            </div>
            <Skeleton className="h-12 w-12 rounded-xl" />
          </div>
          <Skeleton className="h-4 w-20 mt-4" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-600">{title}</p>
            <p className="text-3xl font-bold text-slate-900 mt-2">{value}</p>
          </div>
          <div className={`p-3 rounded-xl ${color} bg-opacity-10`}>
            <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
          </div>
        </div>
        {trend && (
          <div className="flex items-center mt-4 text-sm">
            <TrendingUp className="w-4 h-4 mr-1 text-green-500" />
            <span className="text-green-600 font-medium">{trend}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default function StatsGrid({ stats, isLoading }) {
  const statCards = [
    {
      title: "Active Databases",
      value: stats.totalDatabases,
      icon: Database,
      color: "bg-blue-500",
      trend: "+12% this month"
    },
    {
      title: "Total Tables",
      value: stats.totalTables,
      icon: Table2,
      color: "bg-purple-500",
      trend: "+5 new tables"
    },
    {
      title: "Queries Today",
      value: stats.totalQueries,
      icon: Search,
      color: "bg-green-500",
      trend: "+23% from yesterday"
    },
    {
      title: "Active Users",
      value: stats.activeSessions,
      icon: Users,
      color: "bg-orange-500",
      trend: "2 online now"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((stat, index) => (
        <StatCard
          key={index}
          {...stat}
          isLoading={isLoading}
        />
      ))}
    </div>
  );
}