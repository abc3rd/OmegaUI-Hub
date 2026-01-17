import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ChefHat, Calendar, BookOpen, Home } from "lucide-react";
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
import { cn } from "@/lib/utils";

const navigationItems = [
  { title: "Dashboard", url: createPageUrl("Dashboard"), icon: Home },
  { title: "Events", url: createPageUrl("Events"), icon: Calendar },
  { title: "Recipes", url: createPageUrl("Recipes"), icon: BookOpen },
];

export default function Layout({ children }) {
  const location = useLocation();

  return (
    <SidebarProvider>
      <style>{`
        :root {
          --sidebar-bg: #FAFAF9;
          --primary: #D97706;
          --primary-hover: #B45309;
          --accent: #059669;
        }
      `}</style>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-orange-50 via-amber-50 to-stone-50">
        <Sidebar className="border-r border-stone-200" style={{backgroundColor: 'var(--sidebar-bg)'}}>
          <SidebarHeader className="border-b border-stone-200 p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl flex items-center justify-center shadow-lg">
                <ChefHat className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-xl text-stone-800">Savory</h2>
                <p className="text-xs text-stone-500">Culinary Events</p>
              </div>
            </div>
          </SidebarHeader>
          
          <SidebarContent className="p-4">
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navigationItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton 
                        asChild 
                        className={cn(
                          "hover:bg-orange-100 hover:text-orange-700 transition-all duration-200 rounded-xl mb-2 h-12",
                          location.pathname === item.url && "bg-orange-100 text-orange-700 shadow-sm"
                        )}
                      >
                        <Link to={item.url} className="flex items-center gap-3 px-4">
                          <item.icon className="w-5 h-5" />
                          <span className="font-medium text-base">{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        <main className="flex-1 flex flex-col">
          <header className="bg-white/80 backdrop-blur-sm border-b border-stone-200 px-6 py-4 md:hidden sticky top-0 z-50">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="hover:bg-stone-100 p-2 rounded-lg transition-colors" />
              <div className="flex items-center gap-2">
                <ChefHat className="w-6 h-6 text-orange-600" />
                <h1 className="text-xl font-bold text-stone-800">Savory</h1>
              </div>
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