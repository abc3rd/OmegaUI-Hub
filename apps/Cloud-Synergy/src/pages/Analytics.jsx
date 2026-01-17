import React, { useState, useEffect } from "react";
import { SynergyScore, AIInteraction, User } from "@/entities/all";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, Users, Zap, Target, Calendar } from "lucide-react";
import { motion } from "framer-motion";

export default function Analytics() {
  const [scores, setScores] = useState([]);
  const [interactions, setInteractions] = useState([]);
  const [users, setUsers] = useState([]);
  const [timeFilter, setTimeFilter] = useState("30");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadAnalyticsData = async () => {
      setIsLoading(true);
      try {
        const daysBack = parseInt(timeFilter);
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysBack);

        const [scoresData, interactionsData, usersData] = await Promise.all([
          SynergyScore.list("-calculation_date"),
          AIInteraction.list("-created_date"),
          User.list("-created_date")
        ]);
        
        setScores(scoresData);
        setInteractions(interactionsData);
        setUsers(usersData);
      } catch (error) {
        console.error("Error loading analytics data:", error);
      }
      setIsLoading(false);
    };

    loadAnalyticsData();
  }, [timeFilter]);

  // Prepare data for charts
  const getScoreTrendData = () => {
    const grouped = {};
    scores.forEach(score => {
      const date = score.calculation_date;
      if (!grouped[date]) {
        grouped[date] = { date, scores: [], total: 0, count: 0 };
      }
      grouped[date].scores.push(score.overall_score);
      grouped[date].total += score.overall_score;
      grouped[date].count += 1;
    });

    return Object.values(grouped)
      .map(group => ({
        date: new Date(group.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        avgScore: group.total / group.count
      }))
      .slice(0, 14)
      .reverse();
  };

  const getInteractionTypeData = () => {
    const types = {};
    interactions.forEach(interaction => {
      const type = interaction.interaction_type?.replace(/_/g, ' ') || 'Unknown';
      types[type] = (types[type] || 0) + 1;
    });

    return Object.entries(types).map(([name, value]) => ({ name, value }));
  };

  const getUserTypePerformance = () => {
    const userScores = {};
    scores.forEach(score => {
      const user = users.find(u => u.id === score.user_id);
      const type = user?.user_type || 'unknown';
      if (!userScores[type]) {
        userScores[type] = { total: 0, count: 0 };
      }
      userScores[type].total += score.overall_score;
      userScores[type].count += 1;
    });

    return Object.entries(userScores).map(([type, data]) => ({
      type: type.charAt(0).toUpperCase() + type.slice(1),
      avgScore: data.total / data.count
    }));
  };

  const scoreTrendData = getScoreTrendData();
  const interactionTypeData = getInteractionTypeData();
  const userTypePerformanceData = getUserTypePerformance();

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

  return (
    <div className="min-h-screen p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 via-blue-800 to-indigo-800 bg-clip-text text-transparent">
              Analytics Dashboard
            </h1>
            <p className="text-slate-600 mt-2">Deep insights into AI collaboration patterns</p>
          </div>
          <Select value={timeFilter} onValueChange={setTimeFilter}>
            <SelectTrigger className="w-48">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            {
              title: "Avg Synergy Score",
              value: scores.length > 0 ? (scores.reduce((sum, s) => sum + s.overall_score, 0) / scores.length).toFixed(1) : "0",
              change: "+2.3",
              trend: "up",
              icon: Target,
              color: "from-blue-500 to-blue-600"
            },
            {
              title: "Total Sessions",
              value: interactions.length,
              change: "+18%",
              trend: "up", 
              icon: Zap,
              color: "from-green-500 to-green-600"
            },
            {
              title: "Active Users",
              value: new Set(interactions.map(i => i.user_id)).size,
              change: "+5",
              trend: "up",
              icon: Users,
              color: "from-purple-500 to-purple-600"
            },
            {
              title: "Improvement Rate",
              value: `${Math.round((scores.filter(s => s.improvement_trend === 'improving').length / Math.max(scores.length, 1)) * 100)}%`,
              change: "+12%",
              trend: "up",
              icon: TrendingUp,
              color: "from-orange-500 to-orange-600"
            }
          ].map((metric, index) => (
            <motion.div
              key={metric.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative p-6 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden group hover:shadow-lg transition-all duration-300"
            >
              <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${metric.color} rounded-full opacity-10 transform translate-x-6 -translate-y-6`} />
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 bg-gradient-to-br ${metric.color} rounded-xl shadow-sm`}>
                    <metric.icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-sm font-medium text-green-600">
                    {metric.change}
                  </div>
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-medium text-slate-600">{metric.title}</h3>
                  <p className="text-2xl font-bold text-slate-800">{metric.value}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Score Trend Chart */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Synergy Score Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={scoreTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="avgScore" 
                    stroke="#3B82F6" 
                    strokeWidth={3}
                    dot={{ fill: '#3B82F6', strokeWidth: 2, r: 5 }}
                    activeDot={{ r: 7, stroke: '#3B82F6', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Interaction Types Chart */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Interaction Types
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={interactionTypeData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {interactionTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* User Type Performance */}
          <Card className="shadow-sm lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Performance by User Type
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={userTypePerformanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="type" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                    }}
                  />
                  <Bar 
                    dataKey="avgScore" 
                    fill="#3B82F6"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Insights Section */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Key Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="text-2xl font-bold text-green-700 mb-2">
                  {Math.round((scores.filter(s => s.overall_score >= 80).length / Math.max(scores.length, 1)) * 100)}%
                </div>
                <p className="text-sm text-green-600">Users scoring 80+</p>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="text-2xl font-bold text-blue-700 mb-2">
                  {(interactions.reduce((sum, i) => sum + (i.duration_minutes || 0), 0) / Math.max(interactions.length, 1)).toFixed(1)}m
                </div>
                <p className="text-sm text-blue-600">Avg session length</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
                <div className="text-2xl font-bold text-purple-700 mb-2">
                  {interactions.length > 0 ? (interactions.reduce((sum, i) => sum + (i.learning_gained || 0), 0) / interactions.length).toFixed(1) : 0}
                </div>
                <p className="text-sm text-purple-600">Avg learning score</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}