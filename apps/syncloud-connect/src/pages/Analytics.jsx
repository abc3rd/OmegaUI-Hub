import React, { useState, useEffect, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { format, subDays, isWithinInterval, parseISO } from 'date-fns';
import { Button } from "@/components/ui/button";
import { 
  BarChart3, 
  Clock, 
  CheckCircle2, 
  Zap,
  Download,
  FileSpreadsheet,
  FileText,
  RefreshCw,
  TrendingUp
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";

import StatsCard from '@/components/analytics/StatsCard';
import AppUsageChart from '@/components/analytics/AppUsageChart';
import ActivityTimeline from '@/components/analytics/ActivityTimeline';
import TaskCompletionChart from '@/components/analytics/TaskCompletionChart';
import SessionDurationChart from '@/components/analytics/SessionDurationChart';
import RecentActivityList from '@/components/analytics/RecentActivityList';
import DateRangeFilter from '@/components/analytics/DateRangeFilter';

export default function Analytics() {
  const [user, setUser] = useState(null);
  const [dateRange, setDateRange] = useState({
    from: subDays(new Date(), 30),
    to: new Date()
  });

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);
      } catch (e) {
        base44.auth.redirectToLogin();
      }
    };
    loadUser();
  }, []);

  const { data: activities, isLoading, refetch } = useQuery({
    queryKey: ['userActivities', user?.email],
    queryFn: () => base44.entities.UserActivity.filter({ user_email: user?.email }),
    enabled: !!user?.email,
    initialData: [],
  });

  // Filter activities by date range
  const filteredActivities = useMemo(() => {
    if (!activities || !dateRange.from || !dateRange.to) return activities;
    return activities.filter(activity => {
      const activityDate = activity.activity_date ? parseISO(activity.activity_date) : new Date(activity.created_date);
      return isWithinInterval(activityDate, { start: dateRange.from, end: dateRange.to });
    });
  }, [activities, dateRange]);

  // Calculate metrics
  const metrics = useMemo(() => {
    const totalSessions = filteredActivities.filter(a => a.activity_type === 'app_open').length;
    const totalDuration = filteredActivities.reduce((sum, a) => sum + (a.session_duration_minutes || 0), 0);
    const avgDuration = totalSessions > 0 ? Math.round(totalDuration / totalSessions) : 0;
    const tasksCompleted = filteredActivities.filter(a => a.activity_type === 'task_completed').length;
    const tasksCreated = filteredActivities.filter(a => a.activity_type === 'task_created').length;
    
    return {
      totalSessions,
      totalDuration,
      avgDuration,
      tasksCompleted,
      tasksCreated,
      completionRate: tasksCreated > 0 ? Math.round((tasksCompleted / tasksCreated) * 100) : 0
    };
  }, [filteredActivities]);

  // App usage data
  const appUsageData = useMemo(() => {
    const appCounts = {};
    filteredActivities.filter(a => a.activity_type === 'app_open').forEach(activity => {
      appCounts[activity.app_name] = (appCounts[activity.app_name] || 0) + 1;
    });
    return Object.entries(appCounts)
      .map(([name, sessions]) => ({ name, sessions }))
      .sort((a, b) => b.sessions - a.sessions)
      .slice(0, 6);
  }, [filteredActivities]);

  // Session duration by app
  const sessionDurationData = useMemo(() => {
    const appDurations = {};
    const appCounts = {};
    filteredActivities.forEach(activity => {
      if (activity.session_duration_minutes) {
        appDurations[activity.app_name] = (appDurations[activity.app_name] || 0) + activity.session_duration_minutes;
        appCounts[activity.app_name] = (appCounts[activity.app_name] || 0) + 1;
      }
    });
    return Object.entries(appDurations)
      .map(([name, total]) => ({ 
        name, 
        duration: Math.round(total / (appCounts[name] || 1))
      }))
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 6);
  }, [filteredActivities]);

  // Timeline data
  const timelineData = useMemo(() => {
    const dailyData = {};
    filteredActivities.forEach(activity => {
      const date = activity.activity_date || format(new Date(activity.created_date), 'yyyy-MM-dd');
      if (!dailyData[date]) {
        dailyData[date] = { date, sessions: 0, tasks: 0 };
      }
      if (activity.activity_type === 'app_open') {
        dailyData[date].sessions++;
      }
      if (activity.activity_type === 'task_completed') {
        dailyData[date].tasks++;
      }
    });
    return Object.values(dailyData)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .map(d => ({ ...d, date: format(new Date(d.date), 'MMM d') }));
  }, [filteredActivities]);

  // Export functions
  const exportToCSV = () => {
    const headers = ['Date', 'App Name', 'Activity Type', 'Duration (min)'];
    const rows = filteredActivities.map(a => [
      a.activity_date || format(new Date(a.created_date), 'yyyy-MM-dd'),
      a.app_name,
      a.activity_type,
      a.session_duration_minutes || ''
    ]);
    
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-report-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const exportToJSON = () => {
    const report = {
      generated_at: new Date().toISOString(),
      date_range: {
        from: dateRange.from?.toISOString(),
        to: dateRange.to?.toISOString()
      },
      summary: metrics,
      app_usage: appUsageData,
      session_durations: sessionDurationData,
      timeline: timelineData,
      raw_activities: filteredActivities
    };
    
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-report-${format(new Date(), 'yyyy-MM-dd')}.json`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-24 px-4 md:px-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <Skeleton className="h-10 w-64" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1,2,3,4].map(i => <Skeleton key={i} className="h-32 rounded-2xl" />)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-24 pb-12 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Analytics Dashboard</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              Track your application usage and productivity metrics
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              onClick={() => refetch()}
              className="bg-white dark:bg-slate-900"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={exportToCSV}>
                  <FileSpreadsheet className="w-4 h-4 mr-2" />
                  Export as CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={exportToJSON}>
                  <FileText className="w-4 h-4 mr-2" />
                  Export as JSON
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </motion.div>

        {/* Date Range Filter */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <DateRangeFilter 
            dateRange={dateRange} 
            onDateRangeChange={setDateRange} 
          />
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatsCard
            title="Total Sessions"
            value={metrics.totalSessions}
            icon={BarChart3}
            trend="up"
            trendValue="+12%"
            color="blue"
            delay={0.1}
          />
          <StatsCard
            title="Avg Session Duration"
            value={`${metrics.avgDuration} min`}
            icon={Clock}
            trend="up"
            trendValue="+5%"
            color="purple"
            delay={0.15}
          />
          <StatsCard
            title="Tasks Completed"
            value={metrics.tasksCompleted}
            icon={CheckCircle2}
            trend="up"
            trendValue="+18%"
            color="green"
            delay={0.2}
          />
          <StatsCard
            title="Productivity Score"
            value={`${metrics.completionRate}%`}
            icon={Zap}
            trend={metrics.completionRate >= 70 ? "up" : "down"}
            trendValue={metrics.completionRate >= 70 ? "Good" : "Needs work"}
            color="orange"
            delay={0.25}
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <AppUsageChart data={appUsageData} />
          <ActivityTimeline data={timelineData} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <TaskCompletionChart 
            completed={metrics.tasksCompleted}
            inProgress={Math.floor(metrics.tasksCreated * 0.2)}
            pending={metrics.tasksCreated - metrics.tasksCompleted - Math.floor(metrics.tasksCreated * 0.2)}
          />
          <div className="lg:col-span-2">
            <SessionDurationChart data={sessionDurationData} />
          </div>
        </div>

        {/* Recent Activity */}
        <RecentActivityList activities={filteredActivities.slice(0, 20)} />
      </div>
    </div>
  );
}