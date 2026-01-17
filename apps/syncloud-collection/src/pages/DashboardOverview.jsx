import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { 
  LayoutDashboard,
  BarChart3,
  Activity,
  ArrowRight,
  Zap,
  Users,
  Target
} from 'lucide-react';
import { Tool } from '@/entities/Tool';
import { Contact } from '@/entities/Contact';
import { Project } from '@/entities/Project';

export default function DashboardOverview() {
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadQuickStats();
  }, []);

  const loadQuickStats = async () => {
    try {
      const [tools, contacts, projects] = await Promise.all([
        Tool.list(),
        Contact.list(),
        Project.list()
      ]);

      setStats({
        totalTools: tools.length,
        totalContacts: contacts.length,
        activeProjects: projects.filter(p => p.status === 'active').length,
        totalUsage: tools.reduce((sum, tool) => sum + (tool.usage_count || 0), 0)
      });
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto">
          <LayoutDashboard className="w-8 h-8 text-white" />
        </div>
        <div>
          <h1 className="text-4xl font-bold mb-2">Dashboard & Analytics</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Get comprehensive insights into your business performance, track key metrics, and monitor your productivity across all tools and workflows.
          </p>
        </div>
        <div className="flex justify-center gap-2">
          <Badge className="bg-blue-100 text-blue-800">Real-Time Data</Badge>
          <Badge className="bg-green-100 text-green-800">Performance Tracking</Badge>
          <Badge className="bg-purple-100 text-purple-800">Business Intelligence</Badge>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">Total Tools</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <Zap className="w-8 h-8 text-blue-500" />
              <div className="text-2xl font-bold">{loading ? '...' : stats.totalTools}</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">Contacts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-green-500" />
              <div className="text-2xl font-bold">{loading ? '...' : stats.totalContacts}</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">Active Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <Target className="w-8 h-8 text-purple-500" />
              <div className="text-2xl font-bold">{loading ? '...' : stats.activeProjects}</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">Tool Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <Activity className="w-8 h-8 text-orange-500" />
              <div className="text-2xl font-bold">{loading ? '...' : stats.totalUsage}</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Description */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LayoutDashboard className="w-5 h-5" />
            What is Dashboard & Analytics?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            The Dashboard & Analytics category provides you with powerful tools to monitor, analyze, and understand your business performance. 
            These tools help you make data-driven decisions by providing clear insights into your productivity, growth, and operational efficiency.
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-2">Key Benefits:</h3>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Real-time performance monitoring</li>
                <li>• Comprehensive business insights</li>
                <li>• Track tool usage and efficiency</li>
                <li>• Monitor contact and project growth</li>
                <li>• Historical data analysis</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Perfect For:</h3>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Business owners tracking growth</li>
                <li>• Teams monitoring productivity</li>
                <li>• Project managers analyzing efficiency</li>
                <li>• Anyone wanting data-driven insights</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Available Tools */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Available Tools</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <Link to={createPageUrl('Dashboard')}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <LayoutDashboard className="w-5 h-5 text-blue-500" />
                    Main Dashboard
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-3">
                  Your central hub showing key metrics, recent activity, AI synergy score, and quick access to featured tools.
                </p>
                <div className="flex gap-2">
                  <Badge variant="outline">Overview</Badge>
                  <Badge variant="outline">Quick Stats</Badge>
                  <Badge variant="outline">Activity Feed</Badge>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link to={createPageUrl('Analytics')}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-green-500" />
                    Analytics Dashboard
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-3">
                  Deep dive into your data with comprehensive charts, trends, and performance metrics across all your activities.
                </p>
                <div className="flex gap-2">
                  <Badge variant="outline">Charts</Badge>
                  <Badge variant="outline">Trends</Badge>
                  <Badge variant="outline">Reports</Badge>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>

      {/* Getting Started */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-none">
        <CardContent className="p-6">
          <h3 className="text-xl font-semibold mb-3">Getting Started with Dashboard & Analytics</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-2">1. Explore Your Main Dashboard</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Start with the main dashboard to get an overview of your current activities, AI synergy score, and quick access to key tools.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">2. Dive into Analytics</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Use the analytics dashboard to track trends, monitor performance, and save daily snapshots for historical analysis.
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button asChild>
              <Link to={createPageUrl('Dashboard')}>Start with Main Dashboard</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to={createPageUrl('Analytics')}>View Analytics</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}