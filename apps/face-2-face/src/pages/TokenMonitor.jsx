import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Activity, TrendingUp, Zap, AlertCircle, 
  Database, Brain, Image as ImageIcon, Shield,
  Calendar, DollarSign, BarChart3, Download
} from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";

export default function TokenMonitor() {
  const [user, setUser] = useState(null);
  const [quota, setQuota] = useState(null);
  const [usage, setUsage] = useState([]);
  const [stats, setStats] = useState({
    today: 0,
    week: 0,
    month: 0,
    totalCost: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const userData = await base44.auth.me();
      setUser(userData);

      // Load or create quota
      let quotas = await base44.entities.TokenQuota.list();
      let userQuota = quotas.find(q => q.user_email === userData.email);
      
      if (!userQuota) {
        userQuota = await base44.entities.TokenQuota.create({
          user_email: userData.email,
          quota_type: "free",
          monthly_token_limit: 10000,
          tokens_used_this_month: 0,
          reset_date: getNextMonthDate(),
          overage_allowed: false,
          alert_threshold: 0.8,
          alerted: false
        });
      }
      setQuota(userQuota);

      // Load usage history
      const allUsage = await base44.entities.TokenUsage.list("-created_date", 100);
      const userUsage = allUsage.filter(u => u.user_email === userData.email);
      setUsage(userUsage);

      // Calculate stats
      const now = new Date();
      const todayStart = new Date(now.setHours(0, 0, 0, 0));
      const weekStart = new Date(now.setDate(now.getDate() - 7));
      const monthStart = new Date(now.setDate(1));

      const todayUsage = userUsage.filter(u => new Date(u.created_date) >= todayStart);
      const weekUsage = userUsage.filter(u => new Date(u.created_date) >= weekStart);
      const monthUsage = userUsage.filter(u => new Date(u.created_date) >= monthStart);

      setStats({
        today: todayUsage.reduce((sum, u) => sum + u.tokens_used, 0),
        week: weekUsage.reduce((sum, u) => sum + u.tokens_used, 0),
        month: monthUsage.reduce((sum, u) => sum + u.tokens_used, 0),
        totalCost: userUsage.reduce((sum, u) => sum + (u.cost_usd || 0), 0)
      });

    } catch (error) {
      console.error("Error loading token data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getNextMonthDate = () => {
    const date = new Date();
    date.setMonth(date.getMonth() + 1);
    date.setDate(1);
    return date.toISOString().split('T')[0];
  };

  const quotaPercentage = quota 
    ? (quota.tokens_used_this_month / quota.monthly_token_limit) * 100 
    : 0;

  const getQuotaColor = () => {
    if (quotaPercentage >= 90) return "text-red-600";
    if (quotaPercentage >= 80) return "text-orange-600";
    return "text-green-600";
  };

  const exportData = () => {
    const csv = [
      ['Date', 'Operation', 'Tokens', 'Cost', 'Model', 'Success'],
      ...usage.map(u => [
        format(new Date(u.created_date), 'yyyy-MM-dd HH:mm'),
        u.operation_name,
        u.tokens_used,
        u.cost_usd?.toFixed(4) || '0',
        u.model_used || 'N/A',
        u.success ? 'Yes' : 'No'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `token-usage-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0A1628]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50/20 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center"
        >
          <div>
            <h1 className="text-4xl font-bold text-[#0A1628] flex items-center gap-2">
              <Activity className="w-8 h-8 text-[#D4AF37]" />
              Token Monitor
            </h1>
            <p className="text-slate-600 mt-2">
              Track your AI usage, costs, and performance metrics
            </p>
          </div>
          <Button onClick={exportData} variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
        </motion.div>

        {/* Quota Overview */}
        <Card className="border-slate-200/60 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-[#0A1628] to-[#1a2942] text-white">
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-[#D4AF37]" />
                Monthly Quota Status
              </span>
              <Badge className="bg-white/20 text-white">
                {quota?.quota_type.toUpperCase()}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Tokens Used</span>
                <span className={`font-bold ${getQuotaColor()}`}>
                  {quota?.tokens_used_this_month.toLocaleString()} / {quota?.monthly_token_limit.toLocaleString()}
                </span>
              </div>
              <Progress value={quotaPercentage} className="h-3" />
              <p className="text-xs text-slate-500">
                Resets on {quota?.reset_date && format(new Date(quota.reset_date), 'MMM d, yyyy')}
              </p>
            </div>

            {quotaPercentage >= quota?.alert_threshold * 100 && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-semibold text-orange-900">Usage Alert</p>
                  <p className="text-orange-700">
                    You've used {quotaPercentage.toFixed(1)}% of your monthly quota. Consider upgrading for more tokens.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-4">
          <Card className="border-slate-200/60 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-500 rounded-xl flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Today</p>
                  <p className="text-2xl font-bold text-[#0A1628]">
                    {stats.today.toLocaleString()}
                  </p>
                  <p className="text-xs text-slate-500">tokens</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200/60 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-500 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">This Week</p>
                  <p className="text-2xl font-bold text-[#0A1628]">
                    {stats.week.toLocaleString()}
                  </p>
                  <p className="text-xs text-slate-500">tokens</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200/60 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-500 rounded-xl flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">This Month</p>
                  <p className="text-2xl font-bold text-[#0A1628]">
                    {stats.month.toLocaleString()}
                  </p>
                  <p className="text-xs text-slate-500">tokens</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200/60 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-500 rounded-xl flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Total Cost</p>
                  <p className="text-2xl font-bold text-[#0A1628]">
                    ${stats.totalCost.toFixed(2)}
                  </p>
                  <p className="text-xs text-slate-500">lifetime</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Usage History */}
        <Card className="border-slate-200/60 shadow-xl">
          <CardHeader className="border-b border-slate-100">
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5 text-[#D4AF37]" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left p-4 text-sm font-semibold text-slate-700">Time</th>
                    <th className="text-left p-4 text-sm font-semibold text-slate-700">Operation</th>
                    <th className="text-left p-4 text-sm font-semibold text-slate-700">Type</th>
                    <th className="text-right p-4 text-sm font-semibold text-slate-700">Tokens</th>
                    <th className="text-right p-4 text-sm font-semibold text-slate-700">Cost</th>
                    <th className="text-center p-4 text-sm font-semibold text-slate-700">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {usage.slice(0, 20).map((item, idx) => (
                    <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="p-4 text-sm text-slate-600">
                        {format(new Date(item.created_date), 'MMM d, h:mm a')}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          {item.operation_type === 'llm_call' && <Brain className="w-4 h-4 text-purple-600" />}
                          {item.operation_type === 'image_generation' && <ImageIcon className="w-4 h-4 text-blue-600" />}
                          {item.operation_type === 'facial_verification' && <Shield className="w-4 h-4 text-green-600" />}
                          <span className="text-sm font-medium text-slate-900">
                            {item.operation_name}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge variant="outline" className="text-xs">
                          {item.operation_type}
                        </Badge>
                      </td>
                      <td className="p-4 text-right text-sm font-semibold text-slate-900">
                        {item.tokens_used.toLocaleString()}
                      </td>
                      <td className="p-4 text-right text-sm text-slate-600">
                        ${(item.cost_usd || 0).toFixed(4)}
                      </td>
                      <td className="p-4 text-center">
                        {item.success ? (
                          <Badge className="bg-green-100 text-green-700">Success</Badge>
                        ) : (
                          <Badge className="bg-red-100 text-red-700">Failed</Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Upgrade Options */}
        {quota?.quota_type === 'free' && (
          <Card className="border-[#D4AF37]/30 bg-gradient-to-br from-amber-50 to-amber-100/50 shadow-xl">
            <CardContent className="p-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-[#D4AF37] rounded-xl flex items-center justify-center flex-shrink-0">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-[#0A1628] mb-2">
                    Need More Tokens?
                  </h3>
                  <p className="text-slate-700 mb-4">
                    Upgrade to Premium for 100,000 tokens/month, priority processing, and advanced analytics.
                  </p>
                  <div className="flex gap-3">
                    <Button className="bg-gradient-to-r from-[#0A1628] to-[#1a2942]">
                      Upgrade to Premium
                    </Button>
                    <Button variant="outline">
                      View All Plans
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}