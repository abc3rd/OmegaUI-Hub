
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { User } from "@/entities/User";
import {
  Database,
  LayoutDashboard,
  Search,
  BarChart3,
  Activity,
  Settings,
  Users as UsersIcon,
  Upload,
  Bot,
  HelpCircle // New icon
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import OnboardingTour from "./components/onboarding/OnboardingTour"; // New import

const navigationItems = [
  {
    title: "Dashboard",
    url: createPageUrl("Dashboard"),
    icon: LayoutDashboard,
    id: "link-dashboard"
  },
  {
    title: "Databases",
    url: createPageUrl("Databases"),
    icon: Database,
    id: "link-databases"
  },
  {
    title: "Query Editor",
    url: createPageUrl("QueryEditor"),
    icon: Search,
    id: "link-query-editor"
  },
  {
    title: "Import/Export",
    url: createPageUrl("ImportExport"),
    icon: Upload,
    id: "link-import-export"
  },
  {
    title: "AI Agents",
    url: createPageUrl("AIAgents"),
    icon: Bot,
    id: "link-ai-agents"
  },
  {
    title: "Visualizations",
    url: createPageUrl("Visualizations"),
    icon: BarChart3,
    id: "link-visualizations"
  },
  {
    title: "Activity Logs",
    url: createPageUrl("ActivityLogs"),
    icon: Activity,
    id: "link-activity-logs"
  },
];

const onboardingSteps = [
  {
    target: '#sidebar-header',
    title: 'Welcome to DataFlow!',
    content: 'This quick tour will walk you through the main features of the platform.',
    side: 'right',
    align: 'start'
  },
  {
    target: '#sidebar-menu',
    title: 'Navigation Menu',
    content: 'Use this sidebar to navigate between different sections of the application, like your databases, query editor, and dashboards.',
    side: 'right',
    align: 'start'
  },
  {
    target: '#link-databases',
    title: 'Databases',
    content: 'This is where you can view, create, and manage all your internal and external databases.',
    side: 'right',
    align: 'start'
  },
  {
    target: '#link-query-editor',
    title: 'Query Editor',
    content: 'Write and execute SQL queries or use the Visual Query Builder to interact with your data without writing code.',
    side: 'right',
    align: 'start'
  },
  {
    target: '#link-visualizations',
    title: 'Visualizations',
    content: 'Create and manage dashboards with various widgets to visualize your data and gain insights.',
    side: 'right',
    align: 'start'
  },
  {
    target: '#sidebar-footer-profile',
    title: 'Your Profile & Settings',
    content: 'Access your profile settings, manage preferences like dark mode, or start this tour again from the help button.',
    side: 'top',
    align: 'start'
  },
];

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const [currentUser, setCurrentUser] = React.useState(null);
  const [isTourOpen, setIsTourOpen] = React.useState(false);

  React.useEffect(() => {
    User.me().then(user => {
      setCurrentUser(user);
      
      if (!user.onboarding_completed) {
        setIsTourOpen(true);
      }
      
      // Apply user's theme preference on app load
      const theme = user?.preferences?.theme || "light"; // Default to light if not set
      const root = document.documentElement;
      
      if (theme === "system") {
        const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
        root.classList.toggle("dark", systemTheme === "dark");
      } else {
        root.classList.toggle("dark", theme === "dark");
      }
      
      // Apply density preference
      const density = user?.preferences?.density || "comfortable"; // Default to comfortable
      root.setAttribute("data-density", density);
    }).catch(() => {
        // Fallback for logged-out users
        const root = document.documentElement;
        root.classList.remove("dark");
        root.setAttribute("data-density", "comfortable");
    });
  }, []);

  const handleTourClose = async () => {
    setIsTourOpen(false);
    if (currentUser && !currentUser.onboarding_completed) {
      try {
        await User.updateMyUserData({ onboarding_completed: true });
        setCurrentUser({ ...currentUser, onboarding_completed: true });
      } catch (error) {
        console.error("Failed to update onboarding status:", error);
      }
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-slate-50 dark:bg-slate-900">
        <OnboardingTour
          steps={onboardingSteps}
          isOpen={isTourOpen}
          onTourClose={handleTourClose}
        />
        <Sidebar className="border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
          <SidebarHeader id="sidebar-header" className="border-b border-slate-100 dark:border-slate-800 p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-slate-800 to-slate-600 dark:from-slate-700 dark:to-slate-500 rounded-xl flex items-center justify-center shadow-lg">
                <Database className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-slate-900 dark:text-slate-100 text-lg">DataFlow</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Enterprise Database Platform</p>
              </div>
            </div>
          </SidebarHeader>

          <SidebarContent className="p-4">
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-3 py-2">
                Platform
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu id="sidebar-menu" className="space-y-1">
                  {navigationItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        id={item.id}
                        className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-100 transition-all duration-200 rounded-xl font-medium ${
                          location.pathname === item.url
                            ? 'bg-slate-100 text-slate-900 shadow-sm dark:bg-slate-800 dark:text-slate-100'
                            : 'text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        <Link to={item.url} className="flex items-center gap-3 px-3 py-3">
                          <item.icon className="w-4 h-4" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            {currentUser?.role === "admin" && (
              <SidebarGroup className="mt-4">
                <SidebarGroupLabel className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-3 py-2">
                  Administration
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu className="space-y-1">
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        asChild
                        id="link-user-management"
                        className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-100 transition-all duration-200 rounded-xl font-medium ${
                          location.pathname === createPageUrl("UserManagement")
                            ? 'bg-slate-100 text-slate-900 shadow-sm dark:bg-slate-800 dark:text-slate-100'
                            : 'text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        <Link to={createPageUrl("UserManagement")} className="flex items-center gap-3 px-3 py-3">
                          <UsersIcon className="w-4 h-4" />
                          <span>User Management</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        asChild
                        id="link-agent-management"
                        className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-100 transition-all duration-200 rounded-xl font-medium ${
                          location.pathname === createPageUrl("AgentManagement")
                            ? 'bg-slate-100 text-slate-900 shadow-sm dark:bg-slate-800 dark:text-slate-100'
                            : 'text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        <Link to={createPageUrl("AgentManagement")} className="flex items-center gap-3 px-3 py-3">
                          <Bot className="w-4 h-4" />
                          <span>Agent Management</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            )}

            <SidebarGroup className="mt-8">
              <SidebarGroupLabel className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-3 py-2">
                Quick Stats
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <div className="px-3 py-2 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600 dark:text-slate-300 font-medium">Active Databases</span>
                    <Badge variant="secondary" className="bg-blue-50 text-blue-700 font-semibold dark:bg-blue-900/50 dark:text-blue-200">
                      3
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600 dark:text-slate-300 font-medium">Queries Today</span>
                    <Badge variant="secondary" className="bg-green-50 text-green-700 font-semibold dark:bg-green-900/50 dark:text-green-200">
                      127
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600 dark:text-slate-300 font-medium">Team Members</span>
                    <Badge variant="secondary" className="bg-purple-50 text-purple-700 font-semibold dark:bg-purple-900/50 dark:text-purple-200">
                      8
                    </Badge>
                  </div>
                </div>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter id="sidebar-footer" className="border-t border-slate-100 dark:border-slate-800 p-4">
            <div id="sidebar-footer-profile" className="flex items-center gap-3">
              <Avatar className="h-9 w-9 border-2 border-slate-100 dark:border-slate-800">
                <AvatarFallback className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold text-sm">
                  {currentUser?.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-900 dark:text-slate-100 text-sm truncate">
                  {currentUser?.full_name || 'User'}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                  <span>{currentUser?.role || 'User'}</span>
                </p>
              </div>
              <button
                onClick={() => setIsTourOpen(true)}
                className="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors p-1"
                title="Help / Start Tour"
              >
                <HelpCircle className="w-4 h-4" />
              </button>
              <Link
                to={createPageUrl("Settings")}
                className="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors p-1"
              >
                <Settings className="w-4 h-4" />
              </Link>
            </div>
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 flex flex-col overflow-hidden">
          <header className="bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 px-6 py-4 md:hidden">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="hover:bg-slate-100 dark:hover:bg-slate-800 p-2 rounded-lg transition-colors duration-200" />
              <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">DataFlow</h1>
            </div>
          </header>

          <div className="flex-1 overflow-auto bg-slate-50 dark:bg-slate-900">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
