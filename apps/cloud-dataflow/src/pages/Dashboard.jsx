import React, { useState, useEffect } from "react";
import { Database as DatabaseEntity, Table, Query, ActivityLog } from "@/entities/all";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  Search,
  ArrowRight
} from "lucide-react";
import { format } from "date-fns";

import StatsGrid from "../components/dashboard/StatsGrid";
import RecentActivity from "../components/dashboard/RecentActivity";
import DatabaseOverview from "../components/dashboard/DatabaseOverview";
import QuickActions from "../components/dashboard/QuickActions";

export default function Dashboard() {
  const [databases, setDatabases] = useState([]);
  const [tables, setTables] = useState([]);
  const [recentQueries, setRecentQueries] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const [dbData, tableData, queryData, activityData] = await Promise.all([
        DatabaseEntity.list('-created_date'),
        Table.list('-last_modified', 10),
        Query.list('-last_executed', 5),
        ActivityLog.list('-created_date', 10)
      ]);
      
      setDatabases(dbData);
      setTables(tableData);
      setRecentQueries(queryData);
      setActivityLogs(activityData);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    }
    setIsLoading(false);
  };

  const stats = {
    totalDatabases: databases.length,
    totalTables: tables.length,
    totalQueries: recentQueries.length + 122, // Adding some mock data
    activeSessions: 8
  };

  return (
    <div className="p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Database Overview</h1>
          <p className="text-slate-600 mt-2">Monitor your databases, queries, and team activity</p>
        </div>
        <QuickActions />
      </div>

      {/* Stats Grid */}
      <StatsGrid stats={stats} isLoading={isLoading} />

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <DatabaseOverview databases={databases} isLoading={isLoading} />
          
          {/* Recent Queries */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                  <Search className="w-5 h-5 text-slate-600" />
                  Recent Queries
                </CardTitle>
                <Link to={createPageUrl("QueryEditor")}>
                  <Button variant="ghost" size="sm" className="text-slate-600 hover:text-slate-900">
                    View All <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {isLoading ? (
                  Array(3).fill(0).map((_, i) => (
                    <div key={i} className="animate-pulse flex items-center space-x-4">
                      <div className="h-10 w-10 bg-slate-200 rounded-lg"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                        <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))
                ) : recentQueries.length > 0 ? (
                  recentQueries.map((query) => (
                    <div key={query.id} className="flex items-center p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Search className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="ml-3 flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">
                          {query.name || 'Untitled Query'}
                        </p>
                        <p className="text-xs text-slate-500">
                          {query.last_executed ? format(new Date(query.last_executed), 'PPp') : 'Never executed'}
                        </p>
                      </div>
                      <div className="text-xs text-slate-400">
                        {query.execution_time}ms
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Search className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500">No queries yet</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <RecentActivity activityLogs={activityLogs} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
}