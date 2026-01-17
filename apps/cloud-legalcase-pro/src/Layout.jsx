import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { 
  LayoutDashboard, FileText, Scale, Users, BookOpen, 
  Car, Menu, X
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";

export default function Layout({ children, currentPageName }) {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, page: 'Dashboard' },
    { name: 'Patent Toolkit', icon: FileText, page: 'PatentToolkit' },
    { name: 'uCrash Nexus', icon: Car, page: 'UCrashNexus' },
    { name: 'Affiliates', icon: Users, page: 'AffiliatePortal' },
    { name: 'Resources', icon: BookOpen, page: 'Resources' },
    { name: 'Contacts', icon: Users, page: 'Contacts' },
  ];

  // Hide layout for certain pages that have their own navigation
  const pagesWithOwnLayout = ['UCrashNexus', 'PatentToolkit', 'LeadIntake'];
  if (pagesWithOwnLayout.includes(currentPageName)) {
    return (
      <>
        {children}
        <Toaster position="top-right" />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-blue-50/30">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b shadow-sm">
        <div className="flex items-center justify-between p-4">
          <Link to={createPageUrl('Dashboard')} className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
              <Scale className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-xl text-gray-900">Legal Toolkit</span>
          </Link>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X /> : <Menu />}
          </Button>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-full w-64 bg-white shadow-xl z-50 transform transition-transform duration-300
        lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6">
          <Link 
            to={createPageUrl('Dashboard')} 
            className="flex items-center gap-3 mb-8"
            onClick={() => setSidebarOpen(false)}
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-lg">
              <Scale className="w-7 h-7 text-white" />
            </div>
            <div>
              <span className="font-bold text-xl text-gray-900 block">Legal Toolkit</span>
              <span className="text-xs text-gray-500">Omega UI, LLC</span>
            </div>
          </Link>

          <nav className="space-y-2">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = currentPageName === item.page;
              return (
                <Link
                  key={item.page}
                  to={createPageUrl(item.page)}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all
                    ${isActive 
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg' 
                      : 'text-gray-700 hover:bg-purple-50 hover:text-purple-700'
                    }
                  `}
                >
                  <Icon className="w-5 h-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer in sidebar */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-gray-50">
          <p className="text-xs text-gray-500 text-center">
            © 2024 Omega UI, LLC
          </p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64 min-h-screen pt-16 lg:pt-0">
        {children}
      </main>

      <Toaster position="top-right" />
    </div>
  );
}