import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { 
  Workflow,
  FolderKanban,
  Clock,
  BrainCircuit,
  Target,
  ArrowRight,
  TrendingUp,
  CheckCircle,
  Timer
} from 'lucide-react';
import { Project } from '@/entities/Project';
import { TimeEntry } from '@/entities/TimeEntry';
import { MindMap } from '@/entities/MindMap';
import { Habit } from '@/entities/Habit';

export default function ProductivityOverview() {
  const [productivityStats, setProductivityStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProductivityStats();
  }, []);

  const loadProductivityStats = async () => {
    try {
      const [projects, timeEntries, mindMaps, habits] = await Promise.all([
        Project.list(),
        TimeEntry.list(),
        MindMap.list(),
        Habit.list()
      ]);

      const activeProjects = projects.filter(p => p.status === 'active').length;
      const totalHoursTracked = timeEntries.reduce((sum, entry) => 
        sum + ((entry.duration_seconds || 0) / 3600), 0
      );
      
      const thisWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const weeklyTimeEntries = timeEntries.filter(e => 
        new Date(e.created_date) > thisWeek
      );
      const weeklyHours = weeklyTimeEntries.reduce((sum, entry) => 
        sum + ((entry.duration_seconds || 0) / 3600), 0
      );

      setProductivityStats({
        totalProjects: projects.length,
        activeProjects: activeProjects,
        completedProjects: projects.filter(p => p.status === 'completed').length,
        totalHoursTracked: Math.round(totalHoursTracked * 10) / 10,
        weeklyHours: Math.round(weeklyHours * 10) / 10,
        totalMindMaps: mindMaps.length,
        totalHabits: habits.length
      });
    } catch (error) {
      console.error('Failed to load productivity stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto">
          <Workflow className="w-8 h-8 text-white" />
        </div>
        <div>
          <h1 className="text-4xl font-bold mb-2">Productivity</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Maximize your efficiency with comprehensive productivity tools for project management, 
            time tracking, creative planning, and habit building. Get more done with better organization.
          </p>
        </div>
        <div className="flex justify-center gap-2">
          <Badge className="bg-indigo-100 text-indigo-800">Project Management</Badge>
          <Badge className="bg-purple-100 text-purple-800">Time Tracking</Badge>
          <Badge className="bg-blue-100 text-blue-800">Habit Building</Badge>
        </div>
      </div>

      {/* Productivity Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">Active Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <FolderKanban className="w-8 h-8 text-blue-500" />
              <div>
                <div className="text-2xl font-bold">{loading ? '...' : productivityStats.activeProjects}</div>
                <div className="text-xs text-muted-foreground">of {productivityStats.totalProjects} total</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">Hours Tracked</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <Clock className="w-8 h-8 text-green-500" />
              <div>
                <div className="text-2xl font-bold">{loading ? '...' : productivityStats.totalHoursTracked}h</div>
                <div className="text-xs text-green-600">{productivityStats.weeklyHours}h this week</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">Mind Maps</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <BrainCircuit className="w-8 h-8 text-purple-500" />
              <div className="text-2xl font-bold">{loading ? '...' : productivityStats.totalMindMaps}</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">Active Habits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <Target className="w-8 h-8 text-orange-500" />
              <div className="text-2xl font-bold">{loading ? '...' : productivityStats.totalHabits}</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Description */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Workflow className="w-5 h-5" />
            What is Productivity?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Productivity tools help you organize your work, manage your time, and build positive habits that lead to 
            consistent results. From comprehensive project management to creative mind mapping and personal habit tracking, 
            these tools provide the structure and insights you need to achieve your goals efficiently.
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-2">Core Features:</h3>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Advanced project management</li>
                <li>• Detailed time tracking and analysis</li>
                <li>• Creative mind mapping tools</li>
                <li>• Habit formation and tracking</li>
                <li>• Progress monitoring and reporting</li>
                <li>• Goal setting and achievement</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Perfect For:</h3>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Project managers and team leads</li>
                <li>• Freelancers tracking billable hours</li>
                <li>• Students and researchers</li>
                <li>• Creative professionals</li>
                <li>• Anyone building better habits</li>
                <li>• Teams improving efficiency</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Available Tools */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Productivity Tools</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <Link to={createPageUrl('Projects')}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FolderKanban className="w-5 h-5 text-blue-500" />
                    Project Manager
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-3">
                  Organize and track your projects with task management, progress monitoring, 
                  and team collaboration features. Stay on top of deadlines and deliverables.
                </p>
                <div className="flex gap-2">
                  <Badge variant="outline">Task Management</Badge>
                  <Badge variant="outline">Progress Tracking</Badge>
                  <Badge variant="outline">Team Collaboration</Badge>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link to={createPageUrl('TimeTracker')}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-green-500" />
                    Time Tracker
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-3">
                  Track time spent on projects and tasks with detailed reporting and analytics. 
                  Perfect for billing clients or understanding your productivity patterns.
                </p>
                <div className="flex gap-2">
                  <Badge variant="outline">Time Logging</Badge>
                  <Badge variant="outline">Detailed Reports</Badge>
                  <Badge variant="outline">Productivity Analytics</Badge>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link to={createPageUrl('MindMaps')}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BrainCircuit className="w-5 h-5 text-purple-500" />
                    Mind Maps
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-3">
                  Visualize your ideas, plan projects, and organize complex information with 
                  interactive mind maps. Great for brainstorming and creative planning.
                </p>
                <div className="flex gap-2">
                  <Badge variant="outline">Visual Planning</Badge>
                  <Badge variant="outline">Idea Organization</Badge>
                  <Badge variant="outline">Creative Thinking</Badge>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link to={createPageUrl('HabitTracker')}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-orange-500" />
                    Habit Tracker
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-3">
                  Build positive habits and track your consistency over time. Set goals, 
                  monitor progress, and create lasting behavior changes.
                </p>
                <div className="flex gap-2">
                  <Badge variant="outline">Habit Formation</Badge>
                  <Badge variant="outline">Progress Tracking</Badge>
                  <Badge variant="outline">Goal Achievement</Badge>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>

      {/* Productivity Methodology */}
      <Card>
        <CardHeader>
          <CardTitle>Productivity Methodology</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-blue-600 font-bold">1</span>
              </div>
              <h4 className="font-medium mb-2">Plan</h4>
              <p className="text-sm text-muted-foreground">Set clear goals, break down projects, and create actionable plans</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-green-600 font-bold">2</span>
              </div>
              <h4 className="font-medium mb-2">Track</h4>
              <p className="text-sm text-muted-foreground">Monitor time, progress, and habits to understand your patterns</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-purple-600 font-bold">3</span>
              </div>
              <h4 className="font-medium mb-2">Analyze</h4>
              <p className="text-sm text-muted-foreground">Review data and insights to identify improvement opportunities</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-orange-600 font-bold">4</span>
              </div>
              <h4 className="font-medium mb-2">Optimize</h4>
              <p className="text-sm text-muted-foreground">Adjust your approach based on what works best for you</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Benefits */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="w-5 h-5 text-green-500" />
              Measurable Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Track your progress with detailed analytics and reporting. See exactly how your 
              productivity improves over time with concrete metrics and insights.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <CheckCircle className="w-5 h-5 text-blue-500" />
              Goal Achievement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Break down big goals into manageable tasks and track your progress systematically. 
              Build momentum through consistent daily actions and habit formation.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Timer className="w-5 h-5 text-purple-500" />
              Time Mastery
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Understand exactly where your time goes and optimize your schedule for maximum 
              impact. Identify time-wasting activities and focus on high-value work.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Getting Started */}
      <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-none">
        <CardContent className="p-6">
          <h3 className="text-xl font-semibold mb-3">Getting Started with Productivity</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-2">1. Create Your First Project</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Start by organizing a current project or goal. Break it down into tasks 
                and begin tracking your progress systematically.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">2. Track Your Time</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Begin logging time spent on different activities. This awareness alone 
                will help you identify opportunities for improvement.
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button asChild>
              <Link to={createPageUrl('Projects')}>Create Project</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to={createPageUrl('TimeTracker')}>Start Time Tracking</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}