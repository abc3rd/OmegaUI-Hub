import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { 
  AlertTriangle, 
  Clock, 
  Network,
  Zap
} from "lucide-react";

export default function RecentActivity({ tickets, networkChecks, apiIntegrations, isLoading }) {
  const getStatusColor = (status) => {
    switch (status) {
      case 'success': case 'active': case 'resolved':
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case 'warning': case 'in_progress':
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case 'failed': case 'error': case 'critical':
        return "bg-red-500/20 text-red-400 border-red-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical':
        return "bg-red-500/20 text-red-400 border-red-500/30";
      case 'high':
        return "bg-orange-500/20 text-orange-400 border-orange-500/30";
      case 'medium':
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      default:
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
    }
  };

  if (isLoading) {
    return (
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array(6).fill(0).map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-3 rounded-lg bg-gray-800/50">
                <Skeleton className="w-10 h-10 rounded-lg bg-gray-700" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-48 bg-gray-700" />
                  <Skeleton className="h-3 w-32 bg-gray-700" />
                </div>
                <Skeleton className="h-6 w-16 bg-gray-700" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Combine all activities and sort by date
  const allActivities = [
    ...tickets.map(ticket => ({
      type: 'ticket',
      icon: AlertTriangle,
      iconColor: 'text-blue-400',
      title: ticket.title,
      subtitle: `Priority: ${ticket.priority} • ${ticket.category}`,
      status: ticket.status,
      priority: ticket.priority,
      date: ticket.created_date,
      id: ticket.id
    })),
    ...networkChecks.slice(0, 5).map(check => ({
      type: 'network',
      icon: Network,
      iconColor: 'text-green-400',
      title: `${check.test_type.replace('_', ' ')} - ${check.target}`,
      subtitle: `Response: ${check.response_time || 0}ms`,
      status: check.status,
      date: check.created_date,
      id: check.id
    })),
    ...apiIntegrations.slice(0, 5).map(api => ({
      type: 'api',
      icon: Zap,
      iconColor: 'text-purple-400',
      title: `${api.name} - ${api.service_provider}`,
      subtitle: api.endpoint_url,
      status: api.status,
      date: api.last_tested || api.created_date,
      id: api.id
    }))
  ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 12);

  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Clock className="w-5 h-5 text-cyan-400" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96">
          <div className="space-y-3">
            {allActivities.map((activity, index) => (
              <div key={`${activity.type}-${activity.id}-${index}`} className="flex items-center gap-4 p-3 rounded-lg bg-gray-800/30 hover:bg-gray-800/50 transition-colors">
                <div className={`w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center ${activity.iconColor}`}>
                  <activity.icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-white truncate">
                    {activity.title}
                  </div>
                  <div className="text-sm text-gray-400 truncate">
                    {activity.subtitle}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {format(new Date(activity.date), "MMM d, HH:mm")}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Badge className={`text-xs ${getStatusColor(activity.status)}`}>
                    {activity.status.replace('_', ' ')}
                  </Badge>
                  {activity.priority && (
                    <Badge className={`text-xs ${getPriorityColor(activity.priority)}`}>
                      {activity.priority}
                    </Badge>
                  )}
                </div>
              </div>
            ))}
            
            {allActivities.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Clock className="w-12 h-12 mx-auto mb-4 text-gray-600" />
                <p>No recent activity found</p>
                <p className="text-sm text-gray-600 mt-1">Activities will appear here once you start using the tools</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}