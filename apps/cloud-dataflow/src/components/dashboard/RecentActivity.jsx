import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Activity, ArrowRight, Database, Search, Trash2, Plus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

const getActionIcon = (action) => {
  switch(action) {
    case 'CREATE': return Plus;
    case 'DELETE': return Trash2;
    case 'QUERY': return Search;
    case 'UPDATE': return Database;
    default: return Activity;
  }
};

const getActionColor = (action) => {
  switch(action) {
    case 'CREATE': return 'bg-green-50 text-green-700 border-green-200';
    case 'DELETE': return 'bg-red-50 text-red-700 border-red-200';
    case 'QUERY': return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'UPDATE': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
    default: return 'bg-slate-50 text-slate-700 border-slate-200';
  }
};

export default function RecentActivity({ activityLogs, isLoading }) {
  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <Activity className="w-5 h-5 text-slate-600" />
            Recent Activity
          </CardTitle>
          <Link to={createPageUrl("ActivityLogs")}>
            <Button variant="ghost" size="sm" className="text-slate-600 hover:text-slate-900">
              View All <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {isLoading ? (
            Array(5).fill(0).map((_, i) => (
              <div key={i} className="animate-pulse flex items-start space-x-3">
                <Skeleton className="h-8 w-8 rounded-lg mt-1" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))
          ) : activityLogs.length > 0 ? (
            activityLogs.map((log) => {
              const ActionIcon = getActionIcon(log.action);
              return (
                <div key={log.id} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                  <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center border border-slate-200">
                    <ActionIcon className="w-4 h-4 text-slate-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="secondary" className={`text-xs ${getActionColor(log.action)}`}>
                        {log.action}
                      </Badge>
                      <span className="text-xs text-slate-500">{log.entity_type}</span>
                    </div>
                    <p className="text-sm text-slate-900 font-medium truncate">
                      {log.details || `${log.action} ${log.entity_type}`}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {format(new Date(log.created_date), 'MMM d, h:mm a')} • {log.created_by}
                    </p>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-8">
              <Activity className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">No recent activity</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}