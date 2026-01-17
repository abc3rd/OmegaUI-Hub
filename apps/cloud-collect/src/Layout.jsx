import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Cloud, Home, MapPin, Settings, Share2, ScanLine } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import UserNav from "./components/auth/UserNav";
import GlobalFooter from "./components/GlobalFooter";
import AuthGuard from "./components/auth/AuthGuard";
import ErrorBoundary from "./components/ErrorBoundary";

export default function Layout({ children }) {
  const location = useLocation();

  // Google Analytics
  React.useEffect(() => {
    const script1 = document.createElement('script');
    script1.async = true;
    script1.src = 'https://www.googletagmanager.com/gtag/js?id=G-ELTYE2HGL9';
    document.head.appendChild(script1);

    const script2 = document.createElement('script');
    script2.innerHTML = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'G-ELTYE2HGL9');
    `;
    document.head.appendChild(script2);

    return () => {
      document.head.removeChild(script1);
      document.head.removeChild(script2);
    };
  }, []);

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me(),
    retry: false,
  });

  const { data: unreadShares = [] } = useQuery({
    queryKey: ['unread-shares'],
    queryFn: async () => {
      if (!user) return [];
      const shares = await base44.entities.ResourceShare.filter({ 
        toUserId: user.id 
      });
      return shares.filter(s => !s.readAt);
    },
    enabled: !!user,
  });

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link to={createPageUrl("Home")} className="flex items-center gap-3 group">
                <img 
                  src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68f0d302357fa9ba351a03ad/4f93ed8b5_ChatGPTImageJan3202604_49_51AM.png" 
                  alt="Cloud QR"
                  className="h-12 w-auto transition-transform group-hover:scale-105"
                />
              </Link>
            </div>
            
            <nav className="hidden md:flex items-center space-x-1">
                <Link 
                  to={createPageUrl("Home")} 
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${
                    isActive(createPageUrl("Home"))
                      ? "bg-blue-100 text-blue-700"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  Home
                </Link>
                <Link 
                  to={createPageUrl("ScanQR")} 
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${
                    isActive(createPageUrl("ScanQR"))
                      ? "bg-blue-100 text-blue-700"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <ScanLine className="w-4 h-4 inline mr-1" />
                  Scan QR
                </Link>
                <Link 
                  to={createPageUrl("ResourceMap")} 
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${
                    isActive(createPageUrl("ResourceMap"))
                      ? "bg-blue-100 text-blue-700"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  Resource Map
                </Link>
                <Link 
                  to={createPageUrl("ResourceMapAbout")} 
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${
                    isActive(createPageUrl("ResourceMapAbout"))
                      ? "bg-blue-100 text-blue-700"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  About Map
                </Link>
                {user && (
                  <Link 
                    to={createPageUrl("SharedResources")} 
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-all relative ${
                      isActive(createPageUrl("SharedResources"))
                        ? "bg-blue-100 text-blue-700"
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    Shared
                    {unreadShares.length > 0 && (
                      <Badge className="absolute -top-1 -right-1 h-5 min-w-5 px-1 flex items-center justify-center bg-red-500 text-white text-xs">
                        {unreadShares.length}
                      </Badge>
                    )}
                  </Link>
                )}
                {user && user.accountType === 'donor' && (
                  <Link 
                    to={createPageUrl("DonorProximityAlerts")} 
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${
                      isActive(createPageUrl("DonorProximityAlerts"))
                        ? "bg-blue-100 text-blue-700"
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    Proximity Alerts
                  </Link>
                )}
                <Link 
                  to={createPageUrl("ProximityAlerts")} 
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${
                    isActive(createPageUrl("ProximityAlerts"))
                      ? "bg-blue-100 text-blue-700"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  Alerts
                </Link>
              </nav>

            <div className="flex items-center gap-4">
              {user ? (
                <>
                  <Link to={createPageUrl(user.accountType === 'recipient' ? "RecipientPortal" : "DonorPortal")}>
                    <Button variant="ghost" size="sm">My Portal</Button>
                  </Link>
                  {user.role === 'admin' && (
                    <Link to={createPageUrl("Admin")}>
                      <Button variant="ghost" size="icon">
                        <Settings className="h-5 w-5" />
                      </Button>
                    </Link>
                  )}
                  <UserNav />
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <Button variant="ghost" onClick={() => base44.auth.redirectToLogin()}>
                    Sign In
                  </Button>
                  <Button onClick={() => base44.auth.redirectToLogin()}>
                    Sign Up
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="min-h-[calc(100vh-180px)]">
        <ErrorBoundary>
          <AuthGuard>
            {children}
          </AuthGuard>
        </ErrorBoundary>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <img 
                  src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68f0d302357fa9ba351a03ad/4f93ed8b5_ChatGPTImageJan3202604_49_51AM.png" 
                  alt="Cloud QR"
                  className="h-8 w-auto"
                />
              </div>
              <p className="text-sm text-slate-600">
                Empowering individuals through direct and secure digital support.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-slate-800 mb-3">Quick Links</h3>
              <div className="space-y-2">
                <Link to={createPageUrl("Home")} className="block text-sm text-slate-600 hover:text-blue-600">
                  Home
                </Link>
                <Link to={createPageUrl("CreateProfile")} className="block text-sm text-slate-600 hover:text-blue-600">
                  Create Your Profile
                </Link>
                <Link to={createPageUrl("ResourceMap")} className="block text-sm text-slate-600 hover:text-blue-600">
                  Resource Map
                </Link>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-slate-800 mb-3">Support</h3>
              <p className="text-sm text-slate-600 mb-2">
                Questions? We're here to help.
              </p>
              <a href="mailto:omegaui@syncloudconnect.com" className="text-sm text-blue-600 hover:text-blue-700">
                omegaui@syncloudconnect.com
              </a>
            </div>

            <div>
              <h3 className="font-semibold text-slate-800 mb-3">Omega UI</h3>
              <div className="space-y-2">
                <a 
                  href="https://cloud-central.omegaui.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block text-sm text-slate-600 hover:text-blue-600"
                >
                  Omega UI Hub
                </a>
                <Link to={createPageUrl("TermsOfService")} className="block text-sm text-slate-600 hover:text-blue-600">
                  Terms of Service
                </Link>
              </div>
            </div>
            </div>

          <div className="border-t border-slate-200 mt-8 pt-6 text-center">
            <p className="text-sm text-slate-500">
              © 2025 Cloud QR by Omega UI. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* Global Omega UI Footer */}
      <GlobalFooter />
    </div>
  );
}