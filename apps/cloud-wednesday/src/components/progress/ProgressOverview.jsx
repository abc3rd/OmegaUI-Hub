import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ProgressBar, { CircularProgress } from "./ProgressBar";
import { statusConfig } from "./StatusBadge";
import { calculateProgressStats } from "./BoardProgressCard";
import { 
  X, 
  TrendingUp, 
  Calendar, 
  Target,
  Clock,
  AlertTriangle,
  ChevronRight,
  BarChart3
} from "lucide-react";

export default function ProgressOverview({ 
  board, 
  items = [], 
  onClose,
  className = ""
}) {
  const stats = calculateProgressStats(items);
  const groupStats = calculateGroupStats(board, items);

  return (
    <motion.div
      initial={{ opacity: 0, x: 400 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 400 }}
      className={`fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50 overflow-hidden flex flex-col ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-gray-800 text-lg">Progress Overview</h2>
            <p className="text-xs text-gray-500">{board?.title || 'Board'}</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
          <X className="w-5 h-5" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        {/* Overall Progress Card */}
        <Card className="bg-gradient-to-br from-white to-gray-50 border-0 shadow-md">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold text-gray-800">{stats.completionRate}%</h3>
                <p className="text-sm text-gray-500">Overall Progress</p>
              </div>
              <CircularProgress 
                progress={stats.completionRate}
                size={70}
                strokeWidth={7}
                status={stats.completionRate === 100 ? "done" : "in_progress"}
              />
            </div>
            
            <div className="grid grid-cols-4 gap-3">
              {Object.entries(statusConfig).slice(0, 4).map(([key, config]) => {
                const Icon = config.icon;
                const count = key === 'todo' ? stats.todo 
                  : key === 'in_progress' ? stats.inProgress 
                  : key === 'blocked' ? stats.blocked 
                  : stats.done;
                
                return (
                  <div key={key} className="text-center">
                    <div className={`w-10 h-10 mx-auto rounded-lg ${config.color.split(' ')[0]} flex items-center justify-center mb-1.5`}>
                      <Icon className={`w-4 h-4 ${config.color.split(' ')[1]}`} />
                    </div>
                    <p className="text-lg font-bold text-gray-800">{count}</p>
                    <p className="text-xs text-gray-500">{config.label}</p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Alerts Section */}
        {(stats.overdue > 0 || stats.dueSoon > 0) && (
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-800 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              Attention Required
            </h4>
            
            {stats.overdue > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-red-50 rounded-xl border border-red-100"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-red-700">{stats.overdue} Overdue</p>
                      <p className="text-xs text-red-600">Tasks past due date</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-red-400" />
                </div>
              </motion.div>
            )}

            {stats.dueSoon > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="p-4 bg-amber-50 rounded-xl border border-amber-100"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                      <Clock className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-amber-700">{stats.dueSoon} Due Soon</p>
                      <p className="text-xs text-amber-600">Tasks due within 3 days</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-amber-400" />
                </div>
              </motion.div>
            )}
          </div>
        )}

        {/* Group Progress */}
        {groupStats.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-800 flex items-center gap-2">
              <Target className="w-4 h-4 text-blue-500" />
              Progress by Group
            </h4>
            
            <div className="space-y-3">
              {groupStats.map((group, index) => (
                <motion.div
                  key={group.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-4 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: group.color || '#0073EA' }}
                      />
                      <span className="font-medium text-gray-800 text-sm">{group.title}</span>
                    </div>
                    <span className="text-sm font-bold text-gray-600">
                      {group.done}/{group.total}
                    </span>
                  </div>
                  <ProgressBar 
                    progress={group.completionRate}
                    status={group.completionRate === 100 ? "done" : "in_progress"}
                    size="sm"
                    showLabel={false}
                    showPercentage={false}
                  />
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Estimated Completion */}
        <Card className="border-0 bg-gradient-to-br from-indigo-50 to-purple-50">
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                <TrendingUp className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-800">Completion Estimate</h4>
                <p className="text-xs text-gray-500">Based on current velocity</p>
              </div>
            </div>
            
            <div className="text-center py-4">
              <p className="text-3xl font-bold text-indigo-600">
                {estimateCompletion(stats)}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {stats.completionRate === 100 
                  ? "All tasks completed!" 
                  : `${stats.total - stats.done} tasks remaining`
                }
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}

function calculateGroupStats(board, items) {
  if (!board?.groups) return [];

  return board.groups.map(group => {
    const groupItems = items.filter(item => item.group_id === group.id);
    const total = groupItems.length;
    const done = groupItems.filter(item => {
      const status = item.status || item.data?.status;
      return status === 'done';
    }).length;

    return {
      id: group.id,
      title: group.title,
      color: group.color,
      total,
      done,
      completionRate: total > 0 ? Math.round((done / total) * 100) : 0
    };
  });
}

function estimateCompletion(stats) {
  if (stats.completionRate === 100) return "Complete";
  if (stats.completionRate === 0) return "Not Started";
  
  // Simple estimation based on tasks remaining
  const remaining = stats.total - stats.done;
  if (remaining <= 2) return "Almost Done";
  if (remaining <= 5) return "~2-3 days";
  if (remaining <= 10) return "~1 week";
  return "~2+ weeks";
}