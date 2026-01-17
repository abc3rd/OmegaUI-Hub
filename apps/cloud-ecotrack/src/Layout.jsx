import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Calculator, BarChart3, Lightbulb, Leaf, TrendingDown } from "lucide-react";
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
    title: "Calculator",
    url: createPageUrl("Calculator"),
    icon: Calculator,
  },
  {
    title: "Dashboard",
    url: createPageUrl("Dashboard"),
    icon: BarChart3,
  },
  {
    title: "Eco Tips",
    url: createPageUrl("EcoTips"),
    icon: Lightbulb,
  },
];

export default function Layout({ children, currentPageName }) {
  const location = useLocation();

  return (
    <>
      <style>{`
        :root {
          --primary-50: #f0fdf4;
          --primary-100: #dcfce7;
          --primary-500: #22c55e;
          --primary-600: #16a34a;
          --primary-700: #15803d;
          --primary-900: #14532d;
        }
        
        .eco-gradient {
          background: linear-gradient(135deg, #22c55e 0%, #16a34a 50%, #15803d 100%);
        }
        
        .leaf-pattern::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2322c55e' fill-opacity='0.03'%3E%3Cpath d='M30 30c0-11.046-8.954-20-20-20s-20 8.954-20 20 8.954 20 20 20c11.046 0 20-8.954 20-20zM10 50c11.046 0 20-8.954 20-20s-8.954-20-20-20-20 8.954-20 20 8.954 20 20 20z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
          pointer-events: none;
        }
      `}</style>
      
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-gradient-to-br from-emerald-50 to-green-50 relative leaf-pattern">
          <Sidebar className="border-r border-green-200/50 backdrop-blur-sm">
            <SidebarHeader className="border-b border-green-200/50 p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 eco-gradient rounded-xl flex items-center justify-center shadow-lg">
                  <Leaf className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="font-bold text-gray-900 text-lg">EcoTracker</h2>
                  <p className="text-xs text-green-600 font-medium">Carbon Footprint Calculator</p>
                </div>
              </div>
            </SidebarHeader>
            
            <SidebarContent className="p-2">
              <SidebarGroup>
                <SidebarGroupLabel className="text-xs font-semibold text-gray-600 uppercase tracking-wider px-3 py-2">
                  Main Navigation
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {navigationItems.map((item) => (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton 
                          asChild 
                          className={`hover:bg-green-50 hover:text-green-700 transition-all duration-200 rounded-xl mb-1 ${
                            location.pathname === item.url ? 'bg-green-100 text-green-700 border-green-200' : ''
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
                <SidebarGroupLabel className="text-xs font-semibold text-gray-600 uppercase tracking-wider px-3 py-2">
                  Impact Goal
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <div className="px-3 py-2">
                    <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-green-200/50">
                      <div className="flex items-center gap-3 mb-3">
                        <TrendingDown className="w-5 h-5 text-green-600" />
                        <span className="font-semibold text-sm text-gray-800">Reduce by 25%</span>
                      </div>
                      <div className="w-full bg-green-100 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{width: '40%'}}></div>
                      </div>
                      <p className="text-xs text-gray-600 mt-2">40% progress this year</p>
                    </div>
                  </div>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>

            <SidebarFooter className="border-t border-green-200/50 p-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">E</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm truncate">Eco Warrior</p>
                  <p className="text-xs text-green-600 truncate">Making a difference</p>
                </div>
              </div>
            </SidebarFooter>
          </Sidebar>

          <main className="flex-1 flex flex-col">
            <header className="bg-white/40 backdrop-blur-sm border-b border-green-200/50 px-6 py-4 md:hidden">
              <div className="flex items-center gap-4">
                <SidebarTrigger className="hover:bg-green-100 p-2 rounded-lg transition-colors duration-200" />
                <h1 className="text-xl font-bold text-gray-900">EcoTracker</h1>
              </div>
            </header>

            <div className="flex-1 overflow-auto">
              {children}
            </div>
          </main>
        </div>
      </SidebarProvider>
    </>
  );
}