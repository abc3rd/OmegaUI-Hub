import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  Shield, Home, FileText, Users, Settings, 
  LogOut, Menu, X, User, ChevronDown
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Layout({ children, currentPageName }) {
  const [user, setUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);
      } catch (e) {
        // Not logged in
      }
    };
    fetchUser();
  }, []);

  const handleLogout = () => {
    base44.auth.logout();
  };

  const isAdmin = user?.role === 'admin' || user?.user_role === 'admin';
  const isStaff = isAdmin || user?.role === 'staff' || user?.user_role === 'staff';

  const navItems = [
    { name: 'Dashboard', page: 'Dashboard', icon: Home },
    { name: 'Services', page: 'Marketplace', icon: Users },
    ];

    if (isStaff) {
    navItems.push({ name: 'Admin', page: 'AdminConsole', icon: Settings });
    navItems.push({ name: 'Leads', page: 'LeadsAdmin', icon: Users });
    }

  // Pages without layout
  if (['IncidentWizard', 'Home'].includes(currentPageName)) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to={createPageUrl('Dashboard')} className="flex items-center gap-3">
              <img 
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694ab548df9978830eeb95a3/9d98f704c_iwitnesslogo.jpg" 
                alt="iWitness"
                className="h-10 w-auto"
              />
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.page}
                  to={createPageUrl(item.page)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                    currentPageName === item.page
                      ? "bg-slate-100 text-slate-900"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  {item.name}
                </Link>
              ))}
            </nav>

            {/* User Menu */}
            <div className="flex items-center gap-3">
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="gap-2">
                      <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center">
                        <User className="w-4 h-4 text-slate-600" />
                      </div>
                      <span className="hidden sm:inline text-sm font-medium">
                        {user.full_name || user.email}
                      </span>
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <div className="px-2 py-1.5">
                      <p className="text-sm font-medium">{user.full_name}</p>
                      <p className="text-xs text-slate-500">{user.email}</p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                      <LogOut className="w-4 h-4 mr-2" />
                      Log Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button onClick={() => base44.auth.redirectToLogin()}>
                  Sign In
                </Button>
              )}

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white">
            <nav className="px-4 py-2 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.page}
                  to={createPageUrl(item.page)}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    currentPageName === item.page
                      ? "bg-slate-100 text-slate-900"
                      : "text-slate-600 hover:bg-slate-50"
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main>{children}</main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Patent Notice */}
          <div className="text-center mb-6 pb-6 border-b border-slate-200">
            <p className="text-sm font-medium text-slate-700 mb-1">
              Patent Pending Technology
            </p>
            <p className="text-xs text-slate-500">
              U.S. Patent Application No. [PATENT-1] & [PATENT-2] • Protected Innovation
            </p>
          </div>

          {/* Omega Properties */}
          <div className="mb-6 pb-6 border-b border-slate-200">
            <p className="text-xs font-medium text-slate-600 text-center mb-3">
              Part of the Omega Digital Ecosystem
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 text-xs">
              <a 
                href="https://omegalegal.io" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-slate-500 hover:text-slate-700 transition-colors"
              >
                Omega Legal Platform
              </a>
              <span className="text-slate-300">•</span>
              <a 
                href="https://omegamedical.io" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-slate-500 hover:text-slate-700 transition-colors"
              >
                Omega Medical Network
              </a>
              <span className="text-slate-300">•</span>
              <a 
                href="https://omegaconnect.io" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-slate-500 hover:text-slate-700 transition-colors"
              >
                Omega Connect
              </a>
              <span className="text-slate-300">•</span>
              <a 
                href="https://omegaclaims.io" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-slate-500 hover:text-slate-700 transition-colors"
              >
                Omega Claims Management
              </a>
            </div>
          </div>

          {/* Main Footer */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img 
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694ab548df9978830eeb95a3/9d98f704c_iwitnesslogo.jpg" 
                alt="iWitness"
                className="h-6 w-auto opacity-60"
              />
              <span className="text-sm text-slate-500">
                © {new Date().getFullYear()} iWitness by Omega Digital. All rights reserved.
              </span>
            </div>
            <div className="flex items-center gap-6 text-sm text-slate-500">
              <a href="#" className="hover:text-slate-700 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-slate-700 transition-colors">Terms of Service</a>
              <Link to={createPageUrl('SiriLegal')} className="hover:text-slate-700 transition-colors">
                Siri Legal Framework
              </Link>
              <a href="#" className="hover:text-slate-700 transition-colors">Support</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}