import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  Code2, 
  Palette, 
  Wrench, 
  Globe, 
  Zap,
  Layers,
  Sparkles,
  GitCompareArrows,
  LayoutDashboard,
  Smartphone,
  Database,
  Computer,
  Server,
  ExternalLink
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
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

const navigationItems = [
  {
    title: "Dashboard",
    url: createPageUrl("Dashboard"),
    icon: LayoutDashboard,
    description: "Modular Workspace"
  },
  {
    title: "Code Playground",
    url: createPageUrl("CodePlayground"),
    icon: Code2,
    description: "HTML, CSS & JS Editor"
  },
  {
    title: "Design Tools",
    url: createPageUrl("DesignTools"),
    icon: Palette,
    description: "Colors & Gradients"
  },
  {
    title: "Image Editor",
    url: createPageUrl("ImageEditor"),
    icon: Sparkles,
    description: "AI Editing Tools"
  },
  {
    title: "Code Converter",
    url: createPageUrl("CodeConverter"),
    icon: GitCompareArrows,
    description: "Translate Code Snippets"
  },
  {
    title: "Flutter Generator",
    url: createPageUrl("FlutterGenerator"),
    icon: Smartphone,
    description: "Web to Flutter Converter"
  },
  {
    title: "Database Migration",
    url: createPageUrl("DatabaseMigration"),
    icon: Database,
    description: "Backend Migration Hub"
  },
  {
    title: "Desktop App Generator",
    url: createPageUrl("DesktopAppGenerator"),
    icon: Computer,
    description: "Native Executable Builder"
  },
  {
    title: "Backend Architect",
    url: createPageUrl("BackendArchitect"),
    icon: Server,
    description: "Full-Stack Auto-Deployment"
  },
  {
    title: "CSS Generators",
    url: createPageUrl("CSSGenerators"),
    icon: Layers,
    description: "Grid & Flexbox"
  },
  {
    title: "Web Utilities",
    url: createPageUrl("WebUtilities"),
    icon: Wrench,
    description: "QR, Markdown & More"
  },
  {
    title: "Site Explorer",
    url: createPageUrl("SiteExplorer"),
    icon: Globe,
    description: "Website Viewer & Analysis"
  },
];

export default function Layout({ children }) {
  const location = useLocation();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-slate-50 to-blue-50">
        <Sidebar className="border-r border-slate-200/50 backdrop-blur-sm">
          <SidebarHeader className="border-b border-slate-200/50 p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-slate-900 text-lg">DevToolkit</h2>
                <p className="text-xs text-slate-500">Professional Web Tools</p>
              </div>
            </div>
          </SidebarHeader>
          
          <SidebarContent className="p-4">
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">
                Tools
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="space-y-2">
                  {navigationItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton 
                        asChild 
                        className={`group relative hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:text-slate-900 transition-all duration-200 rounded-xl ${
                          location.pathname === item.url 
                            ? 'bg-gradient-to-r from-blue-50 to-purple-50 text-slate-900 shadow-sm' 
                            : 'text-slate-600'
                        }`}
                      >
                        <Link to={item.url} className="flex items-center gap-3 p-3 w-full">
                          <item.icon className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
                          <div className="flex-1">
                            <span className="font-medium text-sm">{item.title}</span>
                            <p className="text-xs text-slate-500 group-hover:text-slate-600">
                              {item.description}
                            </p>
                          </div>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            {/* Return to Glytch Button */}
            <div className="mt-auto pt-4 border-t border-slate-200/50">
              <a 
                href="https://hosted.glytch.cloud/functions" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-full"
              >
                <Button 
                  variant="outline" 
                  className="w-full justify-start text-slate-600 hover:text-slate-900 hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 transition-all duration-200"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Return to Glytch
                </Button>
              </a>
            </div>
          </SidebarContent>
        </Sidebar>

        <main className="flex-1 flex flex-col overflow-hidden">
          <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200/50 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <SidebarTrigger className="md:hidden hover:bg-slate-100 p-2 rounded-lg transition-colors duration-200" />
                <h1 className="text-xl font-semibold text-slate-900">DevToolkit</h1>
              </div>
              {/* Mobile Return to Glytch Button */}
              <a 
                href="https://hosted.glytch.cloud/functions" 
                target="_blank" 
                rel="noopener noreferrer"
                className="md:hidden"
              >
                <Button 
                  variant="outline" 
                  size="sm"
                  className="text-slate-600 hover:text-slate-900"
                >
                  <ExternalLink className="w-4 h-4 mr-1" />
                  Glytch
                </Button>
              </a>
            </div>
          </header>
          
          <div className="flex-1 overflow-auto">
            {children}
          </div>

          {/* Floating Return Button (visible on all devices as backup) */}
          <a 
            href="https://hosted.glytch.cloud/functions" 
            target="_blank" 
            rel="noopener noreferrer"
            className="fixed bottom-6 right-6 z-50"
          >
            <Button 
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-2xl hover:shadow-purple-500/50 transition-all duration-200"
              size="lg"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Return to Glytch
            </Button>
          </a>
        </main>
      </div>
    </SidebarProvider>
  );
}