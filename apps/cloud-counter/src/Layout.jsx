import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { LayoutDashboard, Activity, GitCompare, BookOpen, Shield, Zap } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

const navigationItems = [
  { title: "Dashboard", url: createPageUrl("Dashboard"), icon: LayoutDashboard },
  { title: "Sessions", url: createPageUrl("Sessions"), icon: Activity },
  { title: "Compare", url: createPageUrl("Compare"), icon: GitCompare },
  { title: "Demo", url: createPageUrl("Demo"), icon: Zap },
  { title: "Methodology", url: createPageUrl("Methodology"), icon: BookOpen },
  { title: "Admin", url: createPageUrl("Admin"), icon: Shield },
];

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const isLanding = currentPageName === "Landing";
  const isPublicShareReport = location.pathname.startsWith('/r/');

  if (isLanding || isPublicShareReport) {
    return <>{children}</>;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Sidebar className="border-none bg-slate-950/95 backdrop-blur-md shadow-2xl">
          <SidebarHeader className="border-b border-slate-800/50 p-6">
            <Link to={createPageUrl("Landing")} className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-gradient-to-r from-emerald-400 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-emerald-500/50 transition-shadow">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-white text-lg">Cloud Counter</h2>
                <p className="text-slate-400 text-xs">AI Workflow Analytics</p>
              </div>
            </Link>
          </SidebarHeader>
          
          <SidebarContent className="p-3">
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu className="space-y-2">
                  {navigationItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton 
                        asChild 
                        className={`
                          group relative overflow-hidden rounded-xl transition-all duration-300
                          ${location.pathname === item.url 
                            ? 'bg-gradient-to-r from-emerald-600 to-cyan-600 text-white shadow-lg shadow-emerald-500/50' 
                            : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                          }
                        `}
                      >
                        <Link to={item.url} className="flex items-center gap-3 px-4 py-3">
                          <item.icon className="w-5 h-5 relative z-10" />
                          <span className="font-medium relative z-10">{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <div className="mt-8 p-4 bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 rounded-xl backdrop-blur-md border border-emerald-500/20">
              <div className="text-center">
                <Zap className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                <p className="text-white text-sm font-medium">UCP Protocol</p>
                <p className="text-slate-400 text-xs">Token Efficiency</p>
              </div>
            </div>
          </SidebarContent>
        </Sidebar>

        <main className="flex-1 flex flex-col">
          <header className="bg-slate-950/90 backdrop-blur-md border-b border-slate-800/50 px-6 py-4 md:hidden shadow-lg">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="text-white hover:bg-slate-800 p-2 rounded-lg transition-colors" />
              <h1 className="text-xl font-bold text-white">Aura Energy</h1>
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