import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Clock, Target, TrendingUp, CheckCircle2 } from "lucide-react";
import { format, addDays, differenceInDays } from "date-fns";

export default function EstimatedCompletion({ 
  items = [],
  className = ""
}) {
  const stats = calculateEstimation(items);

  return (
    <Card className={`bg-gradient-to-br from-indigo-50 to-purple-50 border-0 shadow-sm ${className}`}>
      <CardContent className="p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
            <Target className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-800">Estimated Completion</h4>
            <p className="text-xs text-gray-500">Based on current progress</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Estimated Date */}
          <motion.div 
            className="p-4 bg-white/80 rounded-xl"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-indigo-500" />
              <span className="text-xs text-gray-500">Est. Date</span>
            </div>
            <p className="text-lg font-bold text-gray-800">
              {stats.estimatedDate}
            </p>
          </motion.div>

          {/* Time Remaining */}
          <motion.div 
            className="p-4 bg-white/80 rounded-xl"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-purple-500" />
              <span className="text-xs text-gray-500">Time Left</span>
            </div>
            <p className="text-lg font-bold text-gray-800">
              {stats.timeRemaining}
            </p>
          </motion.div>

          {/* Velocity */}
          <motion.div 
            className="p-4 bg-white/80 rounded-xl"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              <span className="text-xs text-gray-500">Velocity</span>
            </div>
            <p className="text-lg font-bold text-gray-800">
              {stats.velocity}
            </p>
          </motion.div>

          {/* Remaining Tasks */}
          <motion.div 
            className="p-4 bg-white/80 rounded-xl"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-4 h-4 text-blue-500" />
              <span className="text-xs text-gray-500">Remaining</span>
            </div>
            <p className="text-lg font-bold text-gray-800">
              {stats.remaining} tasks
            </p>
          </motion.div>
        </div>

        {stats.onTrack && (
          <motion.div 
            className="mt-4 p-3 bg-emerald-100 rounded-xl flex items-center gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span className="text-sm text-emerald-700 font-medium">
              Project is on track!
            </span>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}

function calculateEstimation(items) {
  const total = items.length;
  const done = items.filter(item => {
    const status = item.status || item.data?.status;
    return status === 'done';
  }).length;
  const remaining = total - done;

  if (total === 0) {
    return {
      estimatedDate: "No tasks",
      timeRemaining: "-",
      velocity: "-",
      remaining: 0,
      onTrack: true
    };
  }

  if (remaining === 0) {
    return {
      estimatedDate: "Complete!",
      timeRemaining: "0 days",
      velocity: "N/A",
      remaining: 0,
      onTrack: true
    };
  }

  // Calculate velocity (tasks completed per day) based on item dates
  const completedItems = items.filter(item => {
    const status = item.status || item.data?.status;
    return status === 'done';
  });

  let velocity = 0.5; // Default: half a task per day
  if (completedItems.length >= 2) {
    const dates = completedItems
      .map(item => new Date(item.updated_date))
      .sort((a, b) => a - b);
    
    const daySpan = Math.max(1, differenceInDays(dates[dates.length - 1], dates[0]));
    velocity = completedItems.length / daySpan;
  }

  const daysToComplete = Math.ceil(remaining / velocity);
  const estimatedDate = addDays(new Date(), daysToComplete);

  // Check if on track (compare with any due dates)
  const latestDueDate = items
    .filter(item => item.due_date || item.data?.due_date)
    .map(item => new Date(item.due_date || item.data?.due_date))
    .sort((a, b) => b - a)[0];

  const onTrack = !latestDueDate || estimatedDate <= latestDueDate;

  return {
    estimatedDate: format(estimatedDate, 'MMM d, yyyy'),
    timeRemaining: daysToComplete <= 1 ? "~1 day" : `~${daysToComplete} days`,
    velocity: velocity >= 1 ? `${velocity.toFixed(1)}/day` : `${(velocity * 7).toFixed(1)}/week`,
    remaining,
    onTrack
  };
}