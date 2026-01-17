import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from './utils';
import { base44 } from '@/api/base44Client';
import { TenantProvider, useTenant } from './components/TenantContext';
import {
  LayoutDashboard,
  Ticket,
  Users,
  BookOpen,
  BarChart3,
  Settings,
  ChevronDown,
  Building2,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

function LayoutContent({ children, currentPageName }) {
  const { currentTenant, currentUser, tenants, switchTenant, loading, isPublicPage } = useTenant();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Public pages don't need layout
  if (isPublicPage) {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!currentTenant || !currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <p className="text-slate-600">No tenant assigned. Please contact your administrator.</p>
        </div>
      </div>
    );
  }

  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, page: 'Dashboard' },
    ...(currentUser?.user_role === 'super_admin' ? [
      { name: 'All Tenants', icon: Building2, page: 'AllTenants' }
    ] : []),
    { name: 'Tickets', icon: Ticket, page: 'Tickets' },
    { name: 'Contacts', icon: Users, page: 'Contacts' },
    { name: 'Knowledge Base', icon: BookOpen, page: 'KnowledgeBase' },
    { name: 'Reports', icon: BarChart3, page: 'Reports' },
    { name: 'Settings', icon: Settings, page: 'Settings' },
  ];

  const primaryColor = currentTenant.primary_color || '#1A3A4A';
  const accentColor = currentTenant.accent_color || '#2DD4BF';

  return (
    <div className="min-h-screen bg-slate-50">
      <style>{`
        :root {
          --tenant-primary: ${primaryColor};
          --tenant-accent: ${accentColor};
        }
        .tenant-primary { background-color: ${primaryColor}; }
        .tenant-accent { background-color: ${accentColor}; }
        .tenant-text-primary { color: ${primaryColor}; }
        .tenant-text-accent { color: ${accentColor}; }
        .tenant-border-primary { border-color: ${primaryColor}; }
      `}</style>

      {/* Top Bar */}
      <div className="tenant-primary text-white shadow-lg">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-white/10"
              >
                {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
              
              <div className="flex items-center gap-3">
                {currentTenant.logo_url ? (
                  <img src={currentTenant.logo_url} alt={currentTenant.name} className="h-8" />
                ) : (
                  <Building2 className="h-8 w-8" />
                )}
                <div>
                  <h1 className="text-lg font-bold">{currentTenant.name}</h1>
                  <p className="text-xs text-white/70">Support Portal</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {currentUser.user_role === 'super_admin' && tenants.length > 1 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="text-white hover:bg-white/10">
                      <Building2 className="h-4 w-4 mr-2" />
                      {currentTenant.name}
                      <ChevronDown className="h-4 w-4 ml-2" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    {tenants.map(tenant => (
                      <DropdownMenuItem
                        key={tenant.id}
                        onClick={() => switchTenant(tenant)}
                        className={tenant.id === currentTenant.id ? 'bg-slate-100' : ''}
                      >
                        {tenant.name}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="text-white hover:bg-white/10">
                    <div className="text-right mr-2 hidden sm:block">
                      <p className="text-sm font-medium">{currentUser.full_name}</p>
                      <p className="text-xs text-white/70">{currentUser.user_role?.replace('_', ' ')}</p>
                    </div>
                    <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center">
                      {currentUser.full_name?.charAt(0) || 'U'}
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => base44.auth.logout()}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`
          fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200
          transform transition-transform duration-200 ease-in-out lg:transform-none
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          <nav className="p-4 space-y-1 mt-2">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = currentPageName === item.page;
              return (
                <Link
                  key={item.page}
                  to={createPageUrl(item.page)}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg transition-all
                    ${isActive 
                      ? 'tenant-primary text-white shadow-md' 
                      : 'text-slate-700 hover:bg-slate-100'
                    }
                  `}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>

          {/* Copyright Footer */}
          <div className="mt-12 pt-6 border-t border-slate-200">
            <p className="text-center text-sm text-slate-500">
              © 2025 Omega UI, LLC. All Rights Reserved.
            </p>
          </div>
        </main>
        </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}

export default function Layout({ children, currentPageName }) {
  return (
    <TenantProvider currentPageName={currentPageName}>
      <LayoutContent currentPageName={currentPageName}>
        {children}
      </LayoutContent>
    </TenantProvider>
  );
}