import React, { useState, useEffect } from "react";
import { UsageLog, User, Conversation } from "@/entities/all";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, Users, MessageSquare, DollarSign, Calendar } from "lucide-react";

const COLORS = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444'];

export default function AnalyticsPage() {
  const [usageLogs, setUsageLogs] = useState([]);
  const [users, setUsers] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [timeRange, setTimeRange] = useState("7d");
  const [analytics, setAnalytics] = useState({
    totalUsage: 0,
    totalCost: 0,
    activeUsers: 0,
    totalConversations: 0,
    avgTokensPerChat: 0,
    dailyUsage: [],
    modelUsage: [],
    userActivity: []
  });

  useEffect(() => {
    loadData();
  }, [timeRange]);

  const loadData = async () => {
    try {
      const [logsData, usersData, conversationsData] = await Promise.all([
        UsageLog.list("-created_date", 1000),
        User.list("-created_date"),
        Conversation.list("-created_date", 500)
      ]);

      setUsageLogs(logsData);
      setUsers(usersData);
      setConversations(conversationsData);

      // Calculate analytics
      const now = new Date();
      const daysBack = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90;
      const startDate = new Date(now - daysBack * 24 * 60 * 60 * 1000);

      const filteredLogs = logsData.filter(log => 
        new Date(log.created_date) >= startDate
      );

      const totalUsage = filteredLogs.reduce((sum, log) => sum + (log.tokens_used || 0), 0);
      const totalCost = filteredLogs.reduce((sum, log) => sum + (log.cost || 0), 0);
      const activeUsers = new Set(filteredLogs.map(log => log.user_email)).size;
      const totalConversations = conversationsData.filter(conv => 
        new Date(conv.created_date) >= startDate
      ).length;

      // Daily usage chart data
      const dailyUsage = [];
      for (let i = daysBack - 1; i >= 0; i--) {
        const date = new Date(now - i * 24 * 60 * 60 * 1000);
        const dayLogs = filteredLogs.filter(log => {
          const logDate = new Date(log.created_date);
          return logDate.toDateString() === date.toDateString();
        });
        
        dailyUsage.push({
          date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          tokens: dayLogs.reduce((sum, log) => sum + (log.tokens_used || 0), 0),
          cost: dayLogs.reduce((sum, log) => sum + (log.cost || 0), 0),
          conversations: dayLogs.filter(log => log.action === 'chat').length
        });
      }

      // Model usage distribution
      const modelUsage = {};
      filteredLogs.forEach(log => {
        if (log.model_used) {
          modelUsage[log.model_used] = (modelUsage[log.model_used] || 0) + (log.tokens_used || 0);
        }
      });

      const modelUsageArray = Object.entries(modelUsage).map(([model, tokens]) => ({
        model,
        tokens,
        percentage: ((tokens / totalUsage) * 100).toFixed(1)
      }));

      // User activity
      const userActivity = {};
      filteredLogs.forEach(log => {
        userActivity[log.user_email] = (userActivity[log.user_email] || 0) + (log.tokens_used || 0);
      });

      const userActivityArray = Object.entries(userActivity)
        .map(([email, tokens]) => ({ email, tokens }))
        .sort((a, b) => b.tokens - a.tokens)
        .slice(0, 10);

      setAnalytics({
        totalUsage,
        totalCost,
        activeUsers,
        totalConversations,
        avgTokensPerChat: totalConversations > 0 ? Math.round(totalUsage / totalConversations) : 0,
        dailyUsage,
        modelUsage: modelUsageArray,
        userActivity: userActivityArray
      });
    } catch (error) {
      console.error("Error loading analytics:", error);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-500 mt-2">Usage statistics and insights</p>
        </div>
        
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <MetricCard
          title="Total Usage"
          value={analytics.totalUsage.toLocaleString()}
          subtitle="tokens"
          icon={TrendingUp}
          color="blue"
        />
        <MetricCard
          title="Total Cost"
          value={`$${analytics.totalCost.toFixed(2)}`}
          subtitle=""
          icon={DollarSign}
          color="green"
        />
        <MetricCard
          title="Active Users"
          value={analytics.activeUsers}
          subtitle="users"
          icon={Users}
          color="purple"
        />
        <MetricCard
          title="Conversations"
          value={analytics.totalConversations}
          subtitle="chats"
          icon={MessageSquare}
          color="orange"
        />
        <MetricCard
          title="Avg per Chat"
          value={analytics.avgTokensPerChat}
          subtitle="tokens"
          icon={Calendar}
          color="indigo"
        />
      </div>

      <Tabs defaultValue="usage" className="space-y-6">
        <TabsList>
          <TabsTrigger value="usage">Usage Trends</TabsTrigger>
          <TabsTrigger value="models">Model Distribution</TabsTrigger>
          <TabsTrigger value="users">User Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="usage" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Daily Token Usage</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analytics.dailyUsage}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="tokens" stroke="#3B82F6" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Daily Conversations</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analytics.dailyUsage}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="conversations" fill="#10B981" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Cost Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analytics.dailyUsage}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`$${value.toFixed(4)}`, 'Cost']} />
                  <Line type="monotone" dataKey="cost" stroke="#F59E0B" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="models">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Model Usage Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analytics.modelUsage}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ model, percentage }) => `${model} (${percentage}%)`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="tokens"
                    >
                      {analytics.modelUsage.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Model Usage Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.modelUsage.map((model, index) => (
                    <div key={model.model} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-4 h-4 rounded-full" 
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="font-medium">{model.model}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{model.tokens.toLocaleString()}</p>
                        <p className="text-sm text-gray-500">{model.percentage}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>Top Users by Token Usage</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.userActivity.map((user, index) => (
                  <div key={user.email} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-medium text-sm">
                          {user.email.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">{user.email}</p>
                        <p className="text-sm text-gray-500">Rank #{index + 1}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{user.tokens.toLocaleString()}</p>
                      <p className="text-sm text-gray-500">tokens used</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function MetricCard({ title, value, subtitle, icon: Icon, color }) {
  const colorClasses = {
    blue: "bg-blue-500",
    green: "bg-green-500",
    purple: "bg-purple-500",
    orange: "bg-orange-500",
    indigo: "bg-indigo-500"
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
          </div>
          <div className={`p-3 rounded-full ${colorClasses[color]}`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}