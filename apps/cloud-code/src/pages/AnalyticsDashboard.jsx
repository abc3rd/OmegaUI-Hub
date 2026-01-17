import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Users, 
  DollarSign, 
  Activity, 
  TrendingUp,
  Zap,
  AlertCircle,
  CheckCircle2,
  BarChart3
} from "lucide-react";
import MetricCard from "../components/analytics/MetricCard";
import ActivityChart from "../components/analytics/ActivityChart";
import { toast } from "sonner";

export default function AnalyticsDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('week');

  const fetchAnalytics = async (selectedTimeframe) => {
    try {
      setLoading(true);
      const { data } = await base44.functions.invoke('getAnalytics', { 
        timeframe: selectedTimeframe 
      });
      setAnalytics(data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics(timeframe);
  }, [timeframe]);

  const handleTimeframeChange = (newTimeframe) => {
    setTimeframe(newTimeframe);
    fetchAnalytics(newTimeframe);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Analytics Dashboard</h1>
            <p className="text-slate-600">Monitor key metrics and system performance</p>
          </div>
          
          {/* Timeframe Selector */}
          <div className="flex gap-2">
            <Button
              variant={timeframe === 'day' ? 'default' : 'outline'}
              onClick={() => handleTimeframeChange('day')}
              size="sm"
            >
              24 Hours
            </Button>
            <Button
              variant={timeframe === 'week' ? 'default' : 'outline'}
              onClick={() => handleTimeframeChange('week')}
              size="sm"
            >
              7 Days
            </Button>
            <Button
              variant={timeframe === 'month' ? 'default' : 'outline'}
              onClick={() => handleTimeframeChange('month')}
              size="sm"
            >
              30 Days
            </Button>
          </div>
        </div>

        {/* User Activity Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-600" />
            User Activity
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <MetricCard
              title="Active Users"
              value={loading ? '...' : analytics?.userActivity?.dailyActiveUsers || 0}
              subtitle={`${analytics?.userActivity?.totalActivities || 0} total activities`}
              icon={Users}
              loading={loading}
            />
            <MetricCard
              title="Total Activities"
              value={loading ? '...' : analytics?.userActivity?.totalActivities || 0}
              subtitle={`${timeframe === 'day' ? 'Last 24 hours' : timeframe === 'week' ? 'Last 7 days' : 'Last 30 days'}`}
              icon={Activity}
              loading={loading}
            />
            <MetricCard
              title="Avg. Activity/User"
              value={loading ? '...' : analytics?.userActivity?.dailyActiveUsers > 0 
                ? Math.round(analytics.userActivity.totalActivities / analytics.userActivity.dailyActiveUsers)
                : 0
              }
              subtitle="Activities per user"
              icon={TrendingUp}
              loading={loading}
            />
          </div>
          
          <ActivityChart 
            data={analytics?.userActivity?.trend || []} 
            loading={loading}
          />
        </div>

        {/* Subscription Metrics Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-green-600" />
            Subscription Metrics
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <MetricCard
              title="Active Subscriptions"
              value={loading ? '...' : analytics?.subscriptions?.activeSubscriptions || 0}
              subtitle="Total active"
              icon={CheckCircle2}
              loading={loading}
            />
            <MetricCard
              title="Monthly Recurring Revenue"
              value={loading ? '...' : `$${analytics?.subscriptions?.totalMRR?.toLocaleString() || 0}`}
              subtitle="Total MRR"
              icon={DollarSign}
              loading={loading}
            />
            <MetricCard
              title="Churn Rate"
              value={loading ? '...' : `${analytics?.subscriptions?.churnRate || 0}%`}
              subtitle="Last 30 days"
              icon={AlertCircle}
              trend={-(analytics?.subscriptions?.churnRate || 0)}
              loading={loading}
            />
            <Card className="hover:shadow-lg transition-shadow duration-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-slate-600">
                  Subscription Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-2">
                    <div className="h-6 bg-slate-200 rounded animate-pulse"></div>
                    <div className="h-6 bg-slate-200 rounded animate-pulse"></div>
                    <div className="h-6 bg-slate-200 rounded animate-pulse"></div>
                  </div>
                ) : (
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Free:</span>
                      <span className="font-semibold">{analytics?.subscriptions?.byPlan?.free || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Pro:</span>
                      <span className="font-semibold">{analytics?.subscriptions?.byPlan?.pro || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Enterprise:</span>
                      <span className="font-semibold">{analytics?.subscriptions?.byPlan?.enterprise || 0}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* System Usage Section */}
        <div>
          <h2 className="text-xl font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-purple-600" />
            System Usage Statistics
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard
              title="n8n Workflows"
              value={loading ? '...' : analytics?.systemUsage?.n8nWorkflows?.total || 0}
              subtitle="Total executions"
              icon={Zap}
              loading={loading}
            />
            <MetricCard
              title="n8n Success Rate"
              value={loading ? '...' : `${analytics?.systemUsage?.n8nWorkflows?.successRate || 100}%`}
              subtitle={`${analytics?.systemUsage?.n8nWorkflows?.success || 0} successful`}
              icon={CheckCircle2}
              trend={analytics?.systemUsage?.n8nWorkflows?.successRate}
              loading={loading}
            />
            <MetricCard
              title="n8n Failures"
              value={loading ? '...' : analytics?.systemUsage?.n8nWorkflows?.failure || 0}
              subtitle="Failed executions"
              icon={AlertCircle}
              trend={-(analytics?.systemUsage?.n8nWorkflows?.failure || 0)}
              loading={loading}
            />
            <MetricCard
              title="API Call Volume"
              value={loading ? '...' : analytics?.systemUsage?.apiCalls?.total || 0}
              subtitle={`~${analytics?.systemUsage?.apiCalls?.average || 0} per day`}
              icon={Activity}
              loading={loading}
            />
          </div>
        </div>
      </div>
    </div>
  );
}