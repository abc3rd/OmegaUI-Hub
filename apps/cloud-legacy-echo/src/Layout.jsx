import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  LayoutDashboard, 
  Upload, 
  MessageSquare, 
  Users, 
  Shield,
  Database,
  Settings,
  Sparkles
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
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";

const navigationItems = [
  {
    title: "Dashboard",
    url: createPageUrl("Dashboard"),
    icon: LayoutDashboard,
  },
  {
    title: "Upload Data",
    url: createPageUrl("Upload"),
    icon: Upload,
  },
  {
    title: "Training Library",
    url: createPageUrl("Library"),
    icon: Database,
  },
  {
    title: "Chat with AI",
    url: createPageUrl("Chat"),
    icon: MessageSquare,
  },
  {
    title: "Beneficiaries",
    url: createPageUrl("Beneficiaries"),
    icon: Users,
  },
  {
    title: "Digital Will",
    url: createPageUrl("DigitalWill"),
    icon: Shield,
  },
];

export default function Layout({ children }) {
  const location = useLocation();
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <Sidebar className="border-r border-slate-800 bg-slate-950/50 backdrop-blur-xl">
          <SidebarHeader className="border-b border-slate-800 p-6">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div className="absolute -inset-1 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl blur opacity-30 animate-pulse" />
              </div>
              <div>
                <h2 className="font-bold text-white text-lg">face2face</h2>
                <p className="text-xs text-slate-400">Legacy AI</p>
              </div>
            </div>
            <div className="mt-4 px-3 py-2 bg-slate-900/50 rounded-lg border border-slate-800">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                connect • encrypt • train
              </p>
            </div>
          </SidebarHeader>
          
          <SidebarContent className="p-3">
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 py-3">
                Navigation
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navigationItems.map((item) => {
                    const isActive = location.pathname === item.url;
                    return (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton 
                          asChild 
                          className={cn(
                            "transition-all duration-200 rounded-xl mb-1",
                            isActive 
                              ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/20" 
                              : "hover:bg-slate-900/50 text-slate-400 hover:text-white"
                          )}
                        >
                          <Link to={item.url} className="flex items-center gap-3 px-4 py-3">
                            <item.icon className="w-4 h-4" />
                            <span className="font-medium text-sm">{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            {user && (
              <SidebarGroup className="mt-4">
                <SidebarGroupLabel className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 py-3">
                  Training Status
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <div className="px-3 py-4 bg-slate-900/30 rounded-xl border border-slate-800">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-slate-400">AI Readiness</span>
                      <span className="text-sm font-bold text-white">{user.ai_readiness_score || 0}%</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-1000 ease-out"
                        style={{ width: `${user.ai_readiness_score || 0}%` }}
                      />
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <p className="text-slate-500">Voice Samples</p>
                        <p className="font-semibold text-white">{user.voice_samples_count || 0}</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Text Samples</p>
                        <p className="font-semibold text-white">{user.text_samples_count || 0}</p>
                      </div>
                    </div>
                  </div>
                </SidebarGroupContent>
              </SidebarGroup>
            )}
          </SidebarContent>

          <SidebarFooter className="border-t border-slate-800 p-4">
            <Link to={createPageUrl("Settings")} className="flex items-center gap-3 px-3 py-2 hover:bg-slate-900/50 rounded-lg transition-colors">
              {user?.avatar_url ? (
                <img src={user.avatar_url} alt={user.full_name} className="w-10 h-10 rounded-full object-cover" />
              ) : (
                <div className="w-10 h-10 bg-gradient-to-br from-slate-700 to-slate-800 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    {user?.full_name?.[0]?.toUpperCase() || 'U'}
                  </span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-white text-sm truncate">{user?.full_name || 'User'}</p>
                <p className="text-xs text-slate-500 truncate">{user?.email}</p>
              </div>
              <Settings className="w-4 h-4 text-slate-500" />
            </Link>
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 flex flex-col overflow-hidden">
          <header className="bg-slate-950/30 backdrop-blur-xl border-b border-slate-800 px-6 py-4 md:hidden">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="hover:bg-slate-900/50 p-2 rounded-lg transition-colors" />
              <h1 className="text-xl font-semibold text-white">face2face</h1>
            </div>
          </header>

          <div className="flex-1 overflow-auto">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}