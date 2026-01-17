
import React, { useState, useEffect } from "react";
import { ActivityLog } from "@/entities/all";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import { Activity, Calendar, Edit3, Plus, Trash2, Upload, Download } from "lucide-react";
import { format } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const ACTION_ICONS = {
  CREATE: Plus,
  UPDATE: Edit3,
  DELETE: Trash2,
  QUERY: Activity,
  IMPORT: Upload,
  EXPORT: Download,
  READ: Activity
};

const ACTION_COLORS = {
  CREATE: "bg-green-50 text-green-700 border-green-200",
  UPDATE: "bg-yellow-50 text-yellow-700 border-yellow-200",
  DELETE: "bg-red-50 text-red-700 border-red-200",
  QUERY: "bg-blue-50 text-blue-700 border-blue-200",
  IMPORT: "bg-purple-50 text-purple-700 border-purple-200",
  EXPORT: "bg-amber-50 text-amber-700 border-amber-200",
  READ: "bg-slate-50 text-slate-700 border-slate-200"
};

export default function UserActivityDialog({ open, onOpenChange, user }) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState("all");

  useEffect(() => {
    if (open && user) {
      loadActivities();
    }
  }, [open, user]);

  const loadActivities = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const logs = await ActivityLog.filter(
        { created_by: user.email },
        "-created_date",
        200
      );
      setActivities(logs);
    } catch (error) {
      console.error("Error loading activities:", error);
      setActivities([]);
    }
    setLoading(false);
  };

  const filteredActivities = filterType === "all" 
    ? activities 
    : activities.filter(a => a.action === filterType);

  const actionCounts = activities.reduce((acc, activity) => {
    acc[activity.action] = (acc[activity.action] || 0) + 1;
    return acc;
  }, {});

  const entityCounts = activities.reduce((acc, activity) => {
    acc[activity.entity_type] = (acc[activity.entity_type] || 0) + 1;
    return acc;
  }, {});

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>User Activity</DialogTitle>
          <DialogDescription>
            Recent actions by {user?.full_name}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="timeline" className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="timeline">Activity Timeline</TabsTrigger>
            <TabsTrigger value="stats">Statistics</TabsTrigger>
          </TabsList>

          <TabsContent value="timeline" className="flex-1 overflow-auto mt-4">
            {/* Action Filter */}
            <div className="flex gap-2 mb-4 flex-wrap">
              <Button
                variant={filterType === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterType("all")}
              >
                All ({activities.length})
              </Button>
              {Object.entries(actionCounts).map(([action, count]) => (
                <Button
                  key={action}
                  variant={filterType === action ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterType(action)}
                >
                  {action} ({count})
                </Button>
              ))}
            </div>

            {/* Activity List */}
            {loading ? (
              <div className="space-y-3">
                {Array(5).fill(0).map((_, i) => (
                  <div key={i} className="animate-pulse p-4 bg-slate-50 rounded-lg">
                    <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : filteredActivities.length > 0 ? (
              <div className="space-y-3">
                {filteredActivities.map((activity) => {
                  const ActionIcon = ACTION_ICONS[activity.action] || Activity;
                  const color = ACTION_COLORS[activity.action] || ACTION_COLORS.READ;

                  return (
                    <div
                      key={activity.id}
                      className="p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${color}`}>
                          <ActionIcon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="secondary" className={`text-xs ${color}`}>
                              {activity.action}
                            </Badge>
                            <span className="text-xs text-slate-500">
                              {activity.entity_type}
                            </span>
                          </div>
                          <p className="text-sm text-slate-900 mb-1">
                            {activity.details || `${activity.action} ${activity.entity_type}`}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <Calendar className="w-3 h-3" />
                            {format(new Date(activity.created_date), 'MMM d, yyyy h:mm a')}
                            {activity.execution_time && (
                              <span>• {activity.execution_time}ms</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <Activity className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">No activity found</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="stats" className="flex-1 overflow-auto mt-4">
            <div className="space-y-6">
              {/* Action Breakdown */}
              <div>
                <h3 className="font-semibold text-slate-900 mb-3">Actions Breakdown</h3>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(actionCounts).map(([action, count]) => {
                    const ActionIcon = ACTION_ICONS[action] || Activity;
                    const color = ACTION_COLORS[action] || ACTION_COLORS.READ;
                    
                    return (
                      <div key={action} className={`p-4 rounded-lg ${color}`}>
                        <div className="flex items-center gap-2 mb-1">
                          <ActionIcon className="w-4 h-4" />
                          <span className="font-semibold">{action}</span>
                        </div>
                        <p className="text-2xl font-bold">{count}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Entity Breakdown */}
              <div>
                <h3 className="font-semibold text-slate-900 mb-3">Entity Interactions</h3>
                <div className="space-y-2">
                  {Object.entries(entityCounts)
                    .sort(([, a], [, b]) => b - a)
                    .map(([entity, count]) => (
                      <div key={entity} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <span className="font-medium text-slate-900 capitalize">{entity}</span>
                        <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                          {count} actions
                        </Badge>
                      </div>
                    ))}
                </div>
              </div>

              {/* Summary Stats */}
              <div>
                <h3 className="font-semibold text-slate-900 mb-3">Summary</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="text-sm text-blue-700 mb-1">Total Activities</div>
                    <div className="text-2xl font-bold text-blue-900">{activities.length}</div>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="text-sm text-green-700 mb-1">Most Recent</div>
                    <div className="text-sm font-semibold text-green-900">
                      {activities[0] ? format(new Date(activities[0].created_date), 'MMM d, h:mm a') : 'N/A'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
