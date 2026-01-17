import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  LayoutDashboard, 
  Bot, 
  Network, 
  Plug2, 
  Activity, 
  Settings,
  Users,
  Bell,
  Search
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { User } from "@/entities/User";

const navigationItems = [
  {
    title: "Dashboard",
    url: createPageUrl("Dashboard"),
    icon: LayoutDashboard,
  },
  {
    title: "AI Support",
    url: createPageUrl("AISupport"),
    icon: Bot,
  },
  {
    title: "Network Tools",
    url: createPageUrl("NetworkTools"),
    icon: Network,
  },
  {
    title: "API Manager",
    url: createPageUrl("ApiManager"),
    icon: Plug2,
  },
  {
    title: "System Monitor",
    url: createPageUrl("SystemMonitor"),
    icon: Activity,
  },
  {
    title: "Team",
    url: createPageUrl("Team"),
    icon: Users,
  },
];

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const [user, setUser] = React.useState(null);

  React.useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await User.me();
        setUser(userData);
      } catch (error) {
        console.log("User not authenticated");
      }
    };
    loadUser();
  }, []);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-950 text-white">
        <Sidebar className="border-r border-gray-800 bg-gray-900">
          <SidebarHeader className="border-b border-gray-800 p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-xl flex items-center justify-center">
                <div className="w-6 h-6 bg-white rounded-sm flex items-center justify-center">
                  <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-sm"></div>
                </div>
              </div>
              <div>
                <h2 className="font-bold text-lg text-white">TechHub Pro</h2>
                <p className="text-xs text-gray-400">Multi-Functional Toolkit</p>
              </div>
            </div>
          </SidebarHeader>
          
          <SidebarContent className="p-4">
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-medium text-gray-400 uppercase tracking-wider px-2 py-2">
                Main Tools
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navigationItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton 
                        asChild 
                        className={`hover:bg-gray-800 hover:text-cyan-400 transition-all duration-200 rounded-lg mb-2 ${
                          location.pathname === item.url 
                            ? 'bg-gradient-to-r from-blue-500/20 to-cyan-400/20 text-cyan-400 border border-cyan-400/30' 
                            : 'text-gray-300'
                        }`}
                      >
                        <Link to={item.url} className="flex items-center gap-3 px-3 py-3">
                          <item.icon className="w-5 h-5" />
                          <span className="font-medium">{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-medium text-gray-400 uppercase tracking-wider px-2 py-2">
                System Status
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <div className="px-3 py-2 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Services</span>
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                      Online
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">API Status</span>
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                      Active
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Network</span>
                    <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                      Monitoring
                    </Badge>
                  </div>
                </div>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="border-t border-gray-800 p-4">
            <Link to={createPageUrl("Settings")} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800 transition-colors">
              <Settings className="w-5 h-5 text-gray-400" />
              <span className="text-gray-300 font-medium">Settings</span>
            </Link>
            {user && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-800/50">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium text-sm">
                    {user.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white text-sm truncate">
                    {user.full_name || 'User'}
                  </p>
                  <p className="text-xs text-gray-400 truncate">{user.email}</p>
                </div>
              </div>
            )}
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 flex flex-col">
          {/* Header with mobile trigger and search */}
          <header className="bg-gray-900/80 backdrop-blur-sm border-b border-gray-800 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <SidebarTrigger className="md:hidden hover:bg-gray-800 p-2 rounded-lg transition-colors duration-200 text-gray-300" />
                <h1 className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  {currentPageName}
                </h1>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="relative hidden md:block">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input 
                    placeholder="Search tools, APIs, logs..." 
                    className="pl-10 w-80 bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-cyan-400"
                  />
                </div>
                <Button variant="outline" size="icon" className="relative border-gray-700 hover:bg-gray-800">
                  <Bell className="w-4 h-4" />
                  <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 bg-red-500 text-white text-xs">
                    3
                  </Badge>
                </Button>
              </div>
            </div>
          </header>

          {/* Main content area */}
          <div className="flex-1 overflow-auto bg-gray-950">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}