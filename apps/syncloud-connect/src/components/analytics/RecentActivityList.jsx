import React from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { 
  PlayCircle, 
  CheckCircle2, 
  PlusCircle, 
  Zap,
  Clock
} from 'lucide-react';

const activityIcons = {
  app_open: PlayCircle,
  app_close: Clock,
  task_completed: CheckCircle2,
  task_created: PlusCircle,
  feature_used: Zap,
};

const activityColors = {
  app_open: 'text-blue-500 bg-blue-100 dark:bg-blue-900/30',
  app_close: 'text-slate-500 bg-slate-100 dark:bg-slate-800',
  task_completed: 'text-emerald-500 bg-emerald-100 dark:bg-emerald-900/30',
  task_created: 'text-purple-500 bg-purple-100 dark:bg-purple-900/30',
  feature_used: 'text-amber-500 bg-amber-100 dark:bg-amber-900/30',
};

const activityLabels = {
  app_open: 'Opened',
  app_close: 'Closed session',
  task_completed: 'Completed task in',
  task_created: 'Created task in',
  feature_used: 'Used feature in',
};

export default function RecentActivityList({ activities }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
      className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6"
    >
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">Recent Activity</h3>
      
      {activities && activities.length > 0 ? (
        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
          {activities.map((activity, index) => {
            const Icon = activityIcons[activity.activity_type] || Zap;
            const colorClass = activityColors[activity.activity_type] || activityColors.feature_used;
            const label = activityLabels[activity.activity_type] || 'Activity';
            
            return (
              <motion.div
                key={activity.id || index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-start gap-4"
              >
                <div className={`p-2 rounded-lg ${colorClass}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-900 dark:text-white">
                    {label} <span className="font-medium">{activity.app_name}</span>
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {activity.created_date ? format(new Date(activity.created_date), 'MMM d, yyyy • h:mm a') : activity.activity_date}
                  </p>
                </div>
                {activity.session_duration_minutes && (
                  <span className="text-xs text-slate-400 whitespace-nowrap">
                    {activity.session_duration_minutes} min
                  </span>
                )}
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="h-[200px] flex items-center justify-center text-slate-400">
          No recent activity
        </div>
      )}
    </motion.div>
  );
}