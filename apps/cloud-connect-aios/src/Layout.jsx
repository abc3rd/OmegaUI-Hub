import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Home, Users, MessageSquare, Bot, FileText, CreditCard, Menu } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

const navigationItems = [
  { name: 'Dashboard', href: 'Dashboard', icon: Home },
  { name: 'Leads', href: 'Leads', icon: Users },
  { name: 'Inbox', href: 'Inbox', icon: MessageSquare },
  { name: 'AI Studio', href: 'AIStudio', icon: Bot },
  { name: 'Knowledge', href: 'Knowledge', icon: FileText },
  { name: 'POS', href: 'POS', icon: CreditCard },
];

const SidebarContent = () => {
  const location = useLocation();
  return (
    <div className="flex flex-col h-full bg-gray-900 text-white">
      <header className="p-4 border-b border-gray-700">
        <h1 className="text-xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
          Cloud Connect
        </h1>
      </header>
      <nav className="flex-1 p-4 space-y-2">
        {navigationItems.map((item) => {
          const isActive = location.pathname === createPageUrl(item.href);
          return (
            <Link
              key={item.name}
              to={createPageUrl(item.href)}
              className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors duration-200 ${
                isActive ? 'bg-cyan-500/20 text-cyan-300' : 'hover:bg-gray-700'
              }`}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default function Layout({ children, currentPageName }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const currentNavItem = navigationItems.find(item => item.href === currentPageName);
  const pageTitle = currentNavItem ? currentNavItem.name : 'Cloud Connect';

  return (
    <div className="h-screen w-screen bg-gray-900 text-white flex font-sans">
      {/* Desktop Sidebar */}
      <div className="hidden md:block md:w-64 flex-shrink-0">
        <SidebarContent />
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden flex-shrink-0 bg-gray-800/50 backdrop-blur-lg p-4 border-b border-gray-700 flex items-center justify-between">
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-64 bg-gray-900 border-r-0">
              <SidebarContent />
            </SheetContent>
          </Sheet>
          <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
            {pageTitle}
          </h1>
          <div className="w-8"></div> {/* Spacer */}
        </header>

        <main className="flex-1 overflow-y-auto p-4">
          {children}
        </main>
      </div>
    </div>
  );
}