
import React, { useState, useEffect } from "react";
import { SynergyScore, AIInteraction, User } from "@/entities/all";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  Brain, 
  Users, 
  TrendingUp, 
  Zap, 
  Clock,
  Activity
} from "lucide-react";

import SynergyGauge from "../components/dashboard/SynergyGauge";
import MetricCard from "../components/dashboard/MetricCard";
import UserProgressCard from "../components/dashboard/UserProgressCard";

export default function Dashboard() {
  const [scores, setScores] = useState([]);
  const [interactions, setInteractions] = useState([]);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const [scoresData, interactionsData, usersData] = await Promise.all([
        SynergyScore.list("-calculation_date", 50),
        AIInteraction.list("-created_date", 100),
        User.list("-created_date", 20)
      ]);
      
      setScores(scoresData);
      setInteractions(interactionsData);
      setUsers(usersData);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    }
    setIsLoading(false);
  };

  // Calculate dashboard metrics
  const getOverallStats = () => {
    if (scores.length === 0) return { avgScore: 0, activeUsers: 0, totalInteractions: 0, improvingUsers: 0 };
    
    const avgScore = scores.reduce((sum, score) => sum + (score.overall_score || 0), 0) / scores.length;
    const activeUsers = new Set(interactions.map(i => i.user_id)).size;
    const totalInteractions = interactions.length;
    const improvingUsers = scores.filter(s => s.improvement_trend === 'improving').length;
    
    return { avgScore, activeUsers, totalInteractions, improvingUsers };
  };

  const getTopPerformers = () => {
    return scores
      .filter(score => score.overall_score > 0)
      .sort((a, b) => (b.overall_score || 0) - (a.overall_score || 0))
      .slice(0, 6)
      .map(score => {
        const user = users.find(u => u.id === score.user_id);
        return { user, score };
      })
      .filter(item => item.user);
  };

  const stats = getOverallStats();
  const topPerformers = getTopPerformers();

  return (
    <div className="min-h-screen p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-800 via-blue-800 to-indigo-800 bg-clip-text text-transparent">
              AAI Synergy Dashboard
            </h1>
            <p className="text-slate-600 mt-2">Monitor human-AI collaboration effectiveness</p>
          </div>
          <div className="flex gap-3">
            <Link to={createPageUrl("Analytics")}>
              <Button variant="outline" className="gap-2">
                <Activity className="w-4 h-4" />
                View Analytics
              </Button>
            </Link>
            <Link to={createPageUrl("AddInteraction")}>
              <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 gap-2">
                <Zap className="w-4 h-4" />
                Add Interaction
              </Button>
            </Link>
          </div>
        </div>

        {/* Overall Synergy Score */}
        <div className="text-center py-12">
          <div className="inline-block p-8 bg-white rounded-3xl shadow-xl border border-slate-200">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Overall Synergy Score</h2>
              <p className="text-slate-500">Organization-wide AI collaboration effectiveness</p>
            </div>
            <SynergyGauge 
              score={stats.avgScore} 
              size={200} 
              strokeWidth={12}
              showDetails={true}
            />
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Active Users"
            value={stats.activeUsers}
            change="+12%"
            trend="up"
            icon={Users}
            color="blue"
            index={0}
          />
          <MetricCard
            title="Total Interactions"
            value={stats.totalInteractions}
            change="+18%"
            trend="up"
            icon={Zap}
            color="green"
            index={1}
          />
          <MetricCard
            title="Improving Users"
            value={stats.improvingUsers}
            change="+8%"
            trend="up"
            icon={TrendingUp}
            color="purple"
            index={2}
          />
          <MetricCard
            title="Avg Session"
            value={`${(interactions.reduce((sum, i) => sum + (i.duration_minutes || 0), 0) / Math.max(interactions.length, 1)).toFixed(1)}m`}
            change="+5m"
            trend="up"
            icon={Clock}
            color="orange"
            index={3}
          />
        </div>

        {/* Top Performers */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">Top Performers</h2>
              <p className="text-slate-500 mt-1">Users with highest synergy scores</p>
            </div>
            <Link to={createPageUrl("Users")}>
              <Button variant="outline" className="gap-2">
                <Users className="w-4 h-4" />
                View All Users
              </Button>
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array(6).fill(0).map((_, i) => (
                <div key={i} className="p-6 bg-white rounded-2xl shadow-sm border border-slate-200 animate-pulse">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-slate-200 rounded-full" />
                    <div className="space-y-2">
                      <div className="w-24 h-4 bg-slate-200 rounded" />
                      <div className="w-16 h-3 bg-slate-200 rounded" />
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="space-y-2">
                      <div className="w-16 h-3 bg-slate-200 rounded" />
                      <div className="w-12 h-4 bg-slate-200 rounded" />
                    </div>
                    <div className="w-20 h-20 bg-slate-200 rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : topPerformers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {topPerformers.map((item, index) => (
                <UserProgressCard
                  key={item.user.id}
                  user={item.user}
                  score={item.score}
                  index={index}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Brain className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-700 mb-2">No Data Yet</h3>
              <p className="text-slate-500 mb-6">Start logging AI interactions to see synergy scores</p>
              <Link to={createPageUrl("AddInteraction")}>
                <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 gap-2">
                  <Zap className="w-4 h-4" />
                  Add First Interaction
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
