import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Code, History, ArrowLeftRight, Settings } from "lucide-react";
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

const navigationItems = [
  {
    title: "Diff Checker",
    url: createPageUrl("DiffChecker"),
    icon: ArrowLeftRight,
  },
  {
    title: "Code Converter",
    url: createPageUrl("CodeConverter"),
    icon: Code,
  },
  {
    title: "Sessions",
    url: createPageUrl("Sessions"),
    icon: History,
  },
];

export default function Layout({ children, currentPageName }) {
  const location = useLocation();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-slate-950">
        <Sidebar className="border-r border-slate-800">
          <SidebarHeader className="border-b border-slate-800 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Code className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-white text-lg">CodeDiff Pro</h2>
                <p className="text-xs text-slate-400">Advanced Code Comparison</p>
              </div>
            </div>
          </SidebarHeader>
          
          <SidebarContent className="p-2">
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-medium text-slate-400 uppercase tracking-wider px-2 py-2">
                Tools
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navigationItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton 
                        asChild 
                        className={`hover:bg-slate-800 hover:text-white transition-colors duration-200 rounded-lg mb-1 ${
                          location.pathname === item.url ? 'bg-slate-800 text-white' : 'text-slate-300'
                        }`}
                      >
                        <Link to={item.url} className="flex items-center gap-3 px-3 py-2">
                          <item.icon className="w-4 h-4" />
                          <span className="font-medium">{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-medium text-slate-400 uppercase tracking-wider px-2 py-2">
                Features
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <div className="px-3 py-2 space-y-3">
                  <div className="flex items-center gap-2 text-sm text-slate-300">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span>Syntax Highlighting</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-300">
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                    <span>Multi-Language Support</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-300">
                    <div className="w-2 h-2 rounded-full bg-purple-500" />
                    <span>Code Conversion</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-300">
                    <div className="w-2 h-2 rounded-full bg-orange-500" />
                    <span>Export Reports</span>
                  </div>
                </div>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="border-t border-slate-800 p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center">
                <Settings className="w-4 h-4 text-slate-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-white text-sm truncate">Developer Tools</p>
                <p className="text-xs text-slate-400 truncate">Professional Edition</p>
              </div>
            </div>
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 flex flex-col">
          <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 md:hidden">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="hover:bg-slate-800 p-2 rounded-lg transition-colors duration-200" />
              <h1 className="text-xl font-semibold text-white">CodeDiff Pro</h1>
            </div>
          </header>

          <div className="flex-1 overflow-auto bg-slate-950">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}