import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { CircularProgress } from "./ProgressBar";
import { 
  CheckCircle2, 
  Clock, 
  AlertOctagon, 
  ListTodo,
  TrendingUp,
  Calendar
} from "lucide-react";
import { differenceInDays, isPast, isToday } from "date-fns";

export default function BoardProgressCard({ 
  items = [], 
  title = "Progress Overview",
  showDetails = true,
  className = ""
}) {
  // Calculate stats
  const stats = calculateProgressStats(items);

  return (
    <Card className={`bg-white border border-gray-100 shadow-sm overflow-hidden ${className}`}>
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-800">{title}</h3>
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <TrendingUp className="w-3.5 h-3.5" />
            {stats.completionRate}% complete
          </div>
        </div>

        <div className="flex items-center gap-6">
          {/* Circular Progress */}
          <CircularProgress 
            progress={stats.completionRate} 
            size={80}
            strokeWidth={8}
            status={stats.completionRate === 100 ? "done" : stats.completionRate > 50 ? "in_progress" : "todo"}
          />

          {/* Stats Grid */}
          {showDetails && (
            <div className="flex-1 grid grid-cols-2 gap-3">
              <StatItem 
                icon={CheckCircle2}
                label="Done"
                value={stats.done}
                color="text-emerald-600"
                bgColor="bg-emerald-50"
              />
              <StatItem 
                icon={Clock}
                label="In Progress"
                value={stats.inProgress}
                color="text-blue-600"
                bgColor="bg-blue-50"
              />
              <StatItem 
                icon={AlertOctagon}
                label="Blocked"
                value={stats.blocked}
                color="text-red-600"
                bgColor="bg-red-50"
              />
              <StatItem 
                icon={ListTodo}
                label="To Do"
                value={stats.todo}
                color="text-slate-600"
                bgColor="bg-slate-50"
              />
            </div>
          )}
        </div>

        {/* Due Date Warning */}
        {stats.overdue > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 flex items-center gap-2 p-2.5 bg-red-50 rounded-lg border border-red-100"
          >
            <Calendar className="w-4 h-4 text-red-500" />
            <span className="text-xs text-red-700 font-medium">
              {stats.overdue} task{stats.overdue > 1 ? 's' : ''} overdue
            </span>
          </motion.div>
        )}

        {stats.dueSoon > 0 && stats.overdue === 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 flex items-center gap-2 p-2.5 bg-amber-50 rounded-lg border border-amber-100"
          >
            <Calendar className="w-4 h-4 text-amber-500" />
            <span className="text-xs text-amber-700 font-medium">
              {stats.dueSoon} task{stats.dueSoon > 1 ? 's' : ''} due within 3 days
            </span>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}

function StatItem({ icon: Icon, label, value, color, bgColor }) {
  return (
    <div className="flex items-center gap-2">
      <div className={`w-8 h-8 rounded-lg ${bgColor} flex items-center justify-center`}>
        <Icon className={`w-4 h-4 ${color}`} />
      </div>
      <div>
        <p className="text-sm font-semibold text-gray-800">{value}</p>
        <p className="text-xs text-gray-500">{label}</p>
      </div>
    </div>
  );
}

export function calculateProgressStats(items = []) {
  const total = items.length;
  
  if (total === 0) {
    return {
      total: 0,
      done: 0,
      inProgress: 0,
      blocked: 0,
      review: 0,
      todo: 0,
      completionRate: 0,
      overdue: 0,
      dueSoon: 0
    };
  }

  const statusCounts = {
    done: 0,
    in_progress: 0,
    blocked: 0,
    review: 0,
    todo: 0
  };

  let overdue = 0;
  let dueSoon = 0;
  const now = new Date();

  items.forEach(item => {
    // Count by status - check both item.status and item.data?.status
    const itemStatus = item.status || item.data?.status || 'todo';
    if (statusCounts.hasOwnProperty(itemStatus)) {
      statusCounts[itemStatus]++;
    } else {
      statusCounts.todo++;
    }

    // Check due dates
    const dueDate = item.due_date || item.data?.due_date;
    if (dueDate && itemStatus !== 'done') {
      const due = new Date(dueDate);
      if (isPast(due) && !isToday(due)) {
        overdue++;
      } else if (differenceInDays(due, now) <= 3) {
        dueSoon++;
      }
    }
  });

  const completionRate = total > 0 ? Math.round((statusCounts.done / total) * 100) : 0;

  return {
    total,
    done: statusCounts.done,
    inProgress: statusCounts.in_progress,
    blocked: statusCounts.blocked,
    review: statusCounts.review,
    todo: statusCounts.todo,
    completionRate,
    overdue,
    dueSoon
  };
}