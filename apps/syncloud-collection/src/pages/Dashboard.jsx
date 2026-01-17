import React, { useState, useEffect, useMemo } from "react";
import { Tool } from "@/entities/Tool";
import { Contact } from "@/entities/Contact";
import { Project } from "@/entities/Project";
import { User } from "@/entities/User";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  Users, 
  Zap, 
  Target,
  ArrowUpRight,
  Star,
  Activity,
  BrainCircuit
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import SynergyGauge from '@/components/dashboard/SynergyGauge';

const GLYTCH_ICON_URL = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68bdbae61875d59c7d61ef06/42f53f232_splash_with_glytch.png";

export default function Dashboard() {
  const [tools, setTools] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [synergyScore, setSynergyScore] = useState(0);

  const calculateSynergyScore = (messages = []) => {
    if (!Array.isArray(messages) || messages.length < 2) return 0;

    let score = 50; // Base score
    const positiveKeywords = ["how to", "create", "generate", "help", "workflow", "integrate", "suggest", "what is", "can you", "explain"];
    const negativeKeywords = ["doesn't work", "can't", "error", "confused", "wrong", "stupid"];

    messages.forEach(msg => {
      if (!msg || (!msg.content && !msg.tool_calls)) return;
      const content = (msg.content || '').toLowerCase();

      if (msg.role === 'user') {
        // Positive engagement
        positiveKeywords.forEach(kw => {
          if(content.includes(kw)) score += 2;
        });
        // Negative feedback
        negativeKeywords.forEach(kw => {
          if(content.includes(kw)) score -= 10;
        });
        if(content.includes('?')) score += 3; // Bonus for asking questions
        // Message length indicates engagement
        score += Math.min(5, Math.floor(content.length / 40));
      } else if (msg.role === 'assistant') {
        // Assistant response quality
        score += Math.min(5, Math.floor(content.length / 100));
        if (msg.tool_calls) {
          msg.tool_calls.forEach(tc => {
            if (tc.status === 'success' || tc.status === 'completed') {
              score += 15; // Major bonus for successful tool use
            } else if (tc.status === 'running' || tc.status === 'pending') {
              score += 5; // Bonus for attempting to use a tool
            } else if (tc.status === 'failed' || tc.status === 'error') {
              score -= 15; // Penalty for failed tool use
            }
          });
        }
      }
    });

    // Conversation depth bonus
    score += Math.min(20, messages.length * 2);

    return Math.max(0, Math.min(100, Math.round(score)));
  };

  const dashboardStats = useMemo(() => {
    // Add null/undefined checks for defensive programming
    if (!tools || !contacts || !projects) return {
      totalTools: 0,
      totalUsage: 0,
      contactCount: 0,
      activeProjects: 0,
      thisMonthContacts: 0,
      thisMonthProjects: 0,
      mostUsedTool: 'None'
    };

    const totalTools = tools.length;
    const totalUsage = tools.reduce((sum, tool) => sum + (tool.usage_count || 0), 0);
    const contactCount = contacts.length;
    const activeProjects = projects.filter(p => p.status === 'active').length;
    
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const thisMonthContacts = contacts.filter(contact => {
      if (!contact.created_date) return false;
      const createdDate = new Date(contact.created_date);
      return createdDate.getMonth() === currentMonth && createdDate.getFullYear() === currentYear;
    }).length;
    
    const thisMonthProjects = projects.filter(project => {
      if (!project.created_date) return false;
      const createdDate = new Date(project.created_date);
      return createdDate.getMonth() === currentMonth && createdDate.getFullYear() === currentYear;
    }).length;
    
    const sortedTools = [...tools]
      .filter(tool => (tool.usage_count || 0) > 0)
      .sort((a, b) => (b.usage_count || 0) - (a.usage_count || 0));
    const mostUsedTool = sortedTools.length > 0 ? sortedTools[0].name : 'None';
    
    return {
      totalTools,
      totalUsage,
      contactCount,
      activeProjects,
      thisMonthContacts,
      thisMonthProjects,
      mostUsedTool
    };
  }, [tools, contacts, projects]);

  useEffect(() => {
    const handleConversationUpdate = (event) => {
        if (event.detail?.messages) {
            setSynergyScore(calculateSynergyScore(event.detail.messages));
        }
    };
    
    window.addEventListener('conversationUpdated', handleConversationUpdate);

    // Initial load from local storage
    const savedConversation = localStorage.getItem('glytch_last_conversation');
    if (savedConversation) {
        try {
            const messages = JSON.parse(savedConversation);
            setSynergyScore(calculateSynergyScore(messages));
        } catch (e) {
            console.warn('Could not parse saved conversation:', e);
            setSynergyScore(0);
        }
    }

    const loadDashboardData = async () => {
      setLoading(true);
      try {
        // Use Promise.allSettled to prevent one failed request from stopping others
        const results = await Promise.allSettled([
          Tool.list(),
          Contact.list("-created_date"),
          Project.list("-created_date"),
          User.me()
        ]);
        
        const [toolResult, contactResult, projectResult, userResult] = results;

        setTools(toolResult.status === 'fulfilled' ? (toolResult.value || []) : []);
        setContacts(contactResult.status === 'fulfilled' ? (contactResult.value || []) : []);
        setProjects(projectResult.status === 'fulfilled' ? (projectResult.value || []) : []);
        setUser(userResult.status === 'fulfilled' ? userResult.value : null);
      } catch (error) {
        console.error("Error loading dashboard data:", error);
        // Set empty states on error
        setTools([]);
        setContacts([]);
        setProjects([]);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    
    loadDashboardData();

    return () => {
        window.removeEventListener('conversationUpdated', handleConversationUpdate);
    };
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
        <div className="animate-pulse space-y-4 sm:space-y-6">
          <div className="h-24 sm:h-28 md:h-32 bg-gray-200 rounded-xl md:rounded-2xl" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            {Array(4).fill(0).map((_, i) => (
              <div key={i} className="h-20 sm:h-24 bg-gray-200 rounded-lg" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            <div className="lg:col-span-2 h-48 sm:h-56 md:h-64 bg-gray-200 rounded-lg" />
            <div className="h-48 sm:h-56 md:h-64 bg-gray-200 rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6 min-h-screen">
      {/* Welcome Header - Mobile Optimized */}
      <div className="relative overflow-hidden rounded-xl md:rounded-2xl bg-primary p-4 sm:p-6 md:p-8 text-primary-foreground">
        <div className="relative z-10">
          <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold mb-1 sm:mb-2 leading-tight">
            Welcome back, {user?.full_name?.split(' ')[0] || 'User'}!
          </h1>
          <p className="opacity-90 text-sm sm:text-base lg:text-lg mb-2 sm:mb-3 md:mb-4">
            Your AI-powered hub for business tools and creative workflows
          </p>
          <div className="flex items-center gap-2 text-secondary">
            <img src={GLYTCH_ICON_URL} alt="GLYTCH Icon" className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="text-xs sm:text-sm font-medium">GLYTCH Assistant is ready to help</span>
          </div>
        </div>
        {/* Gradient overlay for mobile readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/95 to-primary/85 sm:from-primary/90 sm:to-primary/80" />
      </div>

      {/* Stats Grid - Enhanced Mobile Layout */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
                Tools
              </CardTitle>
              <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0" />
            </div>
          </CardHeader>
          <CardContent className="pt-0 px-3 sm:px-6">
            <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">
              {dashboardStats.totalTools}
            </div>
            <p className="text-xs text-muted-foreground mt-1 truncate">
              Available
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
                Usage
              </CardTitle>
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-success flex-shrink-0" />
            </div>
          </CardHeader>
          <CardContent className="pt-0 px-3 sm:px-6">
            <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">
              {dashboardStats.totalUsage > 999 ? `${Math.floor(dashboardStats.totalUsage / 1000)}k` : dashboardStats.totalUsage}
            </div>
            <p className="text-xs text-muted-foreground mt-1 truncate">
              Launches
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
                Contacts
              </CardTitle>
              <Users className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0" />
            </div>
          </CardHeader>
          <CardContent className="pt-0 px-3 sm:px-6">
            <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">
              {dashboardStats.contactCount}
            </div>
            <p className="text-xs text-muted-foreground mt-1 truncate">
              {dashboardStats.thisMonthContacts > 0 && (
                <span className="text-success">+{dashboardStats.thisMonthContacts}</span>
              )}
              {dashboardStats.thisMonthContacts === 0 && "In network"}
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
                Projects
              </CardTitle>
              <Target className="w-4 h-4 sm:w-5 sm:h-5 text-success flex-shrink-0" />
            </div>
          </CardHeader>
          <CardContent className="pt-0 px-3 sm:px-6">
            <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">
              {dashboardStats.activeProjects}
            </div>
            <p className="text-xs text-muted-foreground mt-1 truncate">
              {dashboardStats.thisMonthProjects > 0 && (
                <span className="text-success">+{dashboardStats.thisMonthProjects}</span>
              )}
              {dashboardStats.thisMonthProjects === 0 && "Active"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid - Mobile-First Responsive */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-4 sm:gap-6">
        {/* Featured Tools - Mobile Optimized */}
        <div className="xl:col-span-3 order-1 xl:order-1">
          <Card className="h-full">
            <CardHeader className="pb-3 sm:pb-4 px-4 sm:px-6">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Star className="w-4 h-4 sm:w-5 sm:h-5 text-secondary flex-shrink-0" />
                Featured Tools
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 sm:px-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <Link to={createPageUrl("ContentWriter")} className="group">
                  <div className="p-3 sm:p-4 border border-border rounded-lg hover:border-primary/50 hover:bg-accent transition-all cursor-pointer active:scale-95 touch-manipulation">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-base sm:text-lg">✍️</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground text-sm sm:text-base truncate">AI Content Writer</h3>
                        <p className="text-xs text-muted-foreground truncate">Generate marketing copy</p>
                      </div>
                      <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-primary flex-shrink-0 transition-colors" />
                    </div>
                  </div>
                </Link>

                <Link to={createPageUrl("LogoGenerator")} className="group">
                  <div className="p-3 sm:p-4 border border-border rounded-lg hover:border-primary/50 hover:bg-accent transition-all cursor-pointer active:scale-95 touch-manipulation">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-base sm:text-lg">🎨</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground text-sm sm:text-base truncate">Logo Generator</h3>
                        <p className="text-xs text-muted-foreground truncate">Create brand logos</p>
                      </div>
                      <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-primary flex-shrink-0 transition-colors" />
                    </div>
                  </div>
                </Link>

                <Link to={createPageUrl("Contacts")} className="group">
                  <div className="p-3 sm:p-4 border border-border rounded-lg hover:border-primary/50 hover:bg-accent transition-all cursor-pointer active:scale-95 touch-manipulation">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Users className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground text-sm sm:text-base truncate">Contact Manager</h3>
                        <p className="text-xs text-muted-foreground truncate">Manage your network</p>
                      </div>
                      <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-primary flex-shrink-0 transition-colors" />
                    </div>
                  </div>
                </Link>

                <Link to={createPageUrl("Assistant")} className="group">
                  <div className="p-3 sm:p-4 border border-border rounded-lg hover:border-secondary/50 hover:bg-accent transition-all cursor-pointer active:scale-95 touch-manipulation">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-secondary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                        <img src={GLYTCH_ICON_URL} alt="GLYTCH Icon" className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground text-sm sm:text-base truncate">GLYTCH Assistant</h3>
                        <p className="text-xs text-muted-foreground truncate">AI-powered help</p>
                      </div>
                      <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-secondary flex-shrink-0 transition-colors" />
                    </div>
                  </div>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Content - Mobile Optimized */}
        <div className="xl:col-span-1 order-3 xl:order-2 space-y-4 sm:space-y-6">
          {/* GLYTCH Status - Mobile Friendly */}
          <Card className="bg-secondary/20 border-secondary">
            <CardHeader className="pb-3 px-4 sm:px-6">
              <CardTitle className="flex items-center gap-2 text-secondary-foreground text-sm sm:text-base">
                <img src={GLYTCH_ICON_URL} alt="GLYTCH Icon" className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                <span className="truncate">GLYTCH Assistant</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 sm:px-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-success rounded-full animate-pulse flex-shrink-0" />
                  <span className="text-sm text-secondary-foreground">Online & Ready</span>
                </div>
                <p className="text-xs text-secondary-foreground/80 leading-relaxed">
                  I'm here to help you navigate and integrate tools for maximum productivity.
                </p>
                <Link to={createPageUrl("Assistant")}>
                  <Button size="sm" className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90 active:scale-95 transition-all touch-manipulation">
                    Chat with GLYTCH
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats - Mobile Compact */}
          <Card>
            <CardHeader className="pb-3 px-4 sm:px-6">
              <CardTitle className="text-sm sm:text-base">Quick Insights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4 px-4 sm:px-6">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground truncate mr-2">Most Used Tool</span>
                <Badge variant="secondary" className="text-xs truncate max-w-24 sm:max-w-32">
                  {dashboardStats.mostUsedTool}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground truncate mr-2">This Month</span>
                <span className="text-sm font-medium text-right">
                  +{dashboardStats.thisMonthProjects + dashboardStats.thisMonthContacts} items
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground truncate mr-2">Success Rate</span>
                <span className="text-sm font-medium text-success text-right">
                  {dashboardStats.totalUsage > 0 ? '98.5%' : 'N/A'}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Recent Contacts - Mobile Optimized */}
          <Card>
            <CardHeader className="pb-3 px-4 sm:px-6">
              <CardTitle className="text-sm sm:text-base flex items-center justify-between">
                <span className="truncate mr-2">Recent Contacts</span>
                <Link to={createPageUrl("Contacts")}>
                  <Button variant="ghost" size="sm" className="text-xs px-2 py-1 flex-shrink-0 active:scale-95 transition-transform touch-manipulation">
                    View All
                  </Button>
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 sm:px-6">
              <div className="space-y-3">
                {contacts.slice(0, 3).map(contact => (
                  <div key={contact.id} className="flex items-center gap-3">
                    <div className="w-6 h-6 sm:w-7 sm:h-7 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-medium text-primary">
                        {contact.full_name.charAt(0)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {contact.full_name}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">{contact.email}</p>
                    </div>
                  </div>
                ))}
                {contacts.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-4">
                    No contacts yet
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Activity & Synergy - Mobile Layout */}
        <div className="xl:col-span-3 order-2 xl:order-3 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <Card>
            <CardHeader className="pb-3 px-4 sm:px-6">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0" />
                <span className="truncate">Recent Activity</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 sm:px-6">
              <div className="space-y-3">
                {projects.slice(0, 3).map((project) => (
                  <div key={project.id} className="flex items-center gap-3 p-2 sm:p-3 rounded-lg bg-muted">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <div className="w-2 h-2 sm:w-3 sm:h-3 bg-primary rounded-full" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {project.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(project.created_date).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs flex-shrink-0 max-w-20 truncate">
                      {project.status}
                    </Badge>
                  </div>
                ))}
                {projects.length === 0 && (
                  <p className="text-center text-muted-foreground py-6 text-sm leading-relaxed">
                    No recent activity. Start using tools to see updates here!
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3 px-4 sm:px-6">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <BrainCircuit className="w-4 h-4 sm:w-5 sm:h-5 text-secondary flex-shrink-0" />
                <span className="truncate">AI Synergy Score</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="h-28 sm:h-32 md:h-36 px-4 sm:px-6">
              <SynergyGauge score={synergyScore} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}