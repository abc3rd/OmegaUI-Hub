
import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import {
  LayoutDashboard, Database, Sparkles, Shield, Users,
  Cloud, LogOut, Info, ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AnimatePresence, motion } from "framer-motion";

export default function Layout({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  // Public pages that don't require authentication
  const publicPages = ['/Landing', '/About', '/LegacyInfo', '/FaceToFaceInfo'];

  useEffect(() => {
    checkAuthAndLoadUser();
  }, [location.pathname]);

  const checkAuthAndLoadUser = async () => {
    try {
      const authed = await base44.auth.isAuthenticated();
      setIsAuthenticated(authed);

      if (authed) {
        const userData = await base44.auth.me();
        setUser(userData);
      } else {
        // Redirect to landing if trying to access protected page
        const isPublicPage = publicPages.some(page => location.pathname.includes(page));
        if (!isPublicPage && location.pathname !== '/' && location.pathname !== '') {
          navigate(createPageUrl("Landing"));
        }
      }
    } catch (error) {
      console.error("Error checking auth:", error);
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    base44.auth.logout(createPageUrl("Landing"));
  };

  const handleLogin = () => {
    base44.auth.redirectToLogin(createPageUrl("Dashboard"));
  };

  const isActive = (path) => location.pathname === path;

  const navItems = [
    { name: "Dashboard", icon: LayoutDashboard, path: createPageUrl("Dashboard"), protected: true },
    { name: "Legacy AI", icon: Sparkles, path: createPageUrl("LegacyAI"), protected: true },
    { name: "Face to Face", icon: Users, path: createPageUrl("FaceToFace"), protected: true },
    { name: "Cloud Connect", icon: Cloud, path: createPageUrl("CloudConnect"), protected: true },
    { name: "The ARC", icon: Database, path: createPageUrl("ARC"), protected: true },
    { name: "Security", icon: Shield, path: createPageUrl("Security"), protected: true },
    { name: "About", icon: Info, path: createPageUrl("About"), protected: false },
  ];

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };

  // Show only public layout on landing and public pages
  const isPublicPage = publicPages.some(page => location.pathname.includes(page)) || location.pathname === '/' || location.pathname === '';

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Public layout for landing and info pages
  if (isPublicPage || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <style>{`
          .metallic-text {
            background: linear-gradient(135deg, #8b949e 0%, #d0d7de 25%, #8b949e 50%, #d0d7de 75%, #8b949e 100%);
            background-size: 200% auto;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            animation: shine 3s linear infinite;
            font-weight: 900;
          }

          .metallic-text-static {
            background: linear-gradient(135deg, #a8b2bd 0%, #e1e4e8 25%, #c9d1d9 50%, #e1e4e8 75%, #a8b2bd 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            font-weight: 800;
          }

          @keyframes shine {
            to {
              background-position: 200% center;
            }
          }

          .cyan-metallic {
            background: linear-gradient(135deg, #06b6d4 0%, #67e8f9 50%, #06b6d4 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }

          .purple-metallic {
            background: linear-gradient(135deg, #a855f7 0%, #d8b4fe 50%, #a855f7 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }
        `}</style>

        <AnimatePresence mode="wait">
          <motion.main
            key={location.pathname}
            initial="initial"
            animate="animate"
            exit="exit"
            variants={pageVariants}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            {children}
          </motion.main>
        </AnimatePresence>
      </div>
    );
  }

  // Protected layout for authenticated users
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Global Style for Metallic Text */}
      <style>{`
        .metallic-text {
          background: linear-gradient(135deg, #8b949e 0%, #d0d7de 25%, #8b949e 50%, #d0d7de 75%, #8b949e 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shine 3s linear infinite;
          font-weight: 900;
        }

        .metallic-text-static {
          background: linear-gradient(135deg, #a8b2bd 0%, #e1e4e8 25%, #c9d1d9 50%, #e1e4e8 75%, #a8b2bd 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          font-weight: 800;
        }

        @keyframes shine {
          to {
            background-position: 200% center;
          }
        }

        .cyan-metallic {
          background: linear-gradient(135deg, #06b6d4 0%, #67e8f9 50%, #06b6d4 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .purple-metallic {
          background: linear-gradient(135deg, #a855f7 0%, #d8b4fe 50%, #a855f7 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
      `}</style>

      {/* Ultra Compact Sticky Top Bar */}
      <nav className="bg-black/90 backdrop-blur-xl border-b border-cyan-500/30 sticky top-0 z-50 shadow-2xl shadow-cyan-500/20">
        <div className="max-w-7xl mx-auto px-3">
          <div className="flex justify-between items-center h-14">
            {/* Compact Logo */}
            <Link to={createPageUrl("Dashboard")} className="flex items-center gap-2">
              <img
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68dbd842e6edb33782c055df/c3693a1cd_Gemini_Generated_Image_4f4la64f4la64f4l.png"
                alt="Omega UI"
                className="h-8 w-auto"
              />
              <div className="hidden sm:block">
                <span className="text-lg font-black metallic-text tracking-tight">OMEGA UI</span>
              </div>
            </Link>

            {/* Navigation */}
            <div className="hidden lg:flex items-center gap-1">
              {navItems.filter(item => !item.protected || isAuthenticated).map((item) => (
                <Link key={item.name} to={item.path}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`gap-2 transition-all duration-200 ${
                      isActive(item.path)
                        ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-cyan-400 border border-cyan-500/30'
                        : 'text-gray-400 hover:text-cyan-400 hover:bg-cyan-500/5'
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    <span className="text-xs font-semibold">{item.name}</span>
                  </Button>
                </Link>
              ))}
            </div>

            {/* User Menu */}
            <div className="flex items-center gap-4">
              {isAuthenticated && user ? (
                <div className="flex items-center gap-3">
                  <Link to={createPageUrl("Settings")}>
                    <Avatar className="h-10 w-10 border-2 border-cyan-500/40 hover:border-cyan-500 transition-all cursor-pointer ring-2 ring-transparent hover:ring-cyan-500/20">
                      <AvatarImage src={user?.profile_photo_url} />
                      <AvatarFallback className="bg-gradient-to-br from-cyan-500 to-purple-600 text-white text-sm font-black">
                        {user?.full_name?.[0]?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleLogout}
                    className="text-gray-400 hover:text-red-400 hover:bg-red-500/10"
                  >
                    <LogOut className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={handleLogin}
                  className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 font-bold h-10 px-6"
                >
                  Sign In
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="lg:hidden border-t border-cyan-500/10 bg-black/40">
          <div className="flex overflow-x-auto py-2 px-4 gap-2 no-scrollbar">
            {navItems.filter(item => !item.protected || isAuthenticated).map((item) => (
              <Link key={item.name} to={item.path}>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`flex-col h-auto py-2 px-3 min-w-[70px] ${
                    isActive(item.path)
                      ? 'bg-cyan-500/20 text-cyan-400'
                      : 'text-gray-400'
                  }`}
                >
                  <item.icon className="w-5 h-5 mb-1" />
                  <span className="text-[10px] font-semibold whitespace-nowrap">{item.name}</span>
                </Button>
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* Page Content with Animations */}
      <AnimatePresence mode="wait">
        <motion.main
          key={location.pathname}
          initial="initial"
          animate="animate"
          exit="exit"
          variants={pageVariants}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          {children}
        </motion.main>
      </AnimatePresence>

      {/* Premium Footer */}
      <footer className="bg-black/40 border-t border-cyan-500/10 py-8 mt-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <img 
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68dbd842e6edb33782c055df/d3d11dd79_Gemini_Generated_Image_csiphhcsiphhcsip.png"
                alt="Omega UI"
                className="h-8 w-auto"
              />
              <div className="text-sm text-gray-400">
                <span className="font-bold metallic-text-static">OMEGA UI</span> — Unified Intelligence Platform
              </div>
            </div>
            <div className="flex items-center gap-4">
              <a 
                href="https://hosted.glytch.cloud/functions" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
              >
                Cloud Connect Features
                <ExternalLink className="w-3 h-3" />
              </a>
              <div className="text-xs text-gray-500">
                © 2024 OmegaUI.com • All Systems Operational
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl"></div>
      </div>
    </div>
  );
}
