import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { 
  AlertTriangle, 
  QrCode, 
  LayoutDashboard, 
  User, 
  Menu, 
  X,
  Shield,
  LogOut,
  Scan
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export default function Layout({ children, currentPageName }) {
  const [user, setUser] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const isAuth = await base44.auth.isAuthenticated();
        if (isAuth) {
          const userData = await base44.auth.me();
          setUser(userData);
        }
      } catch (e) {
        // Guest user
      }
    };
    loadUser();
  }, []);

  const isAdmin = user?.user_role === 'admin';
  const isPartner = user?.user_role === 'partner' || isAdmin;

  const navItems = [
    { name: "Report", page: "Report", icon: AlertTriangle, show: true },
    { name: "Scan QR", page: "Scan", icon: QrCode, show: true },
    { name: "My Dashboard", page: "Dashboard", icon: LayoutDashboard, show: !!user },
    { name: "Partner Hub", page: "PartnerHub", icon: QrCode, show: isPartner },
    { name: "Admin", page: "Admin", icon: Shield, show: isAdmin },
  ].filter(item => item.show);

  const NavLinks = ({ mobile = false }) => (
    <div className={mobile ? "flex flex-col gap-2" : "hidden md:flex items-center gap-1"}>
      {navItems.map((item) => (
        <Link
          key={item.page}
          to={createPageUrl(item.page)}
          onClick={() => mobile && setIsOpen(false)}
          className={`
            flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all duration-300
            ${currentPageName === item.page 
              ? "bg-gradient-to-r from-[#ea00ea] to-[#2699fe] text-white shadow-lg shadow-[#ea00ea]/25" 
              : "text-slate-300 hover:text-white hover:bg-white/10"
            }
          `}
        >
          <item.icon className="w-4 h-4" />
          {item.name}
        </Link>
      ))}
    </div>
  );

  // Full-screen mode for Report and Landing pages (no nav)
  if (currentPageName === "Report" || currentPageName === "Landing") {
    return (
      <div className="min-h-screen bg-slate-950">
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <style>{`
        :root {
          --omega-pink: #ea00ea;
          --omega-blue: #2699fe;
          --omega-green: #4bce2a;
        }
        
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(234, 0, 234, 0.4); }
          50% { box-shadow: 0 0 40px rgba(234, 0, 234, 0.8); }
        }
        
        @keyframes gradient-shift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        .gradient-text {
          background: linear-gradient(135deg, #ea00ea, #2699fe, #4bce2a);
          background-size: 200% 200%;
          animation: gradient-shift 3s ease infinite;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
      `}</style>
      
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to={createPageUrl("Report")} className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#ea00ea] to-[#2699fe] flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold gradient-text">iWitness</span>
          </Link>

          <NavLinks />

          <div className="flex items-center gap-3">
            {user ? (
              <div className="hidden md:flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-white">{user.full_name}</p>
                  <p className="text-xs text-slate-400 capitalize">{user.user_role}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => base44.auth.logout()}
                  className="text-slate-400 hover:text-white hover:bg-white/10"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <Button
                onClick={() => base44.auth.redirectToLogin()}
                className="hidden md:flex bg-gradient-to-r from-[#ea00ea] to-[#2699fe] hover:opacity-90 text-white border-0"
              >
                Sign In
              </Button>
            )}

            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon" className="text-white">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="bg-slate-900 border-slate-800 w-72">
                <div className="flex flex-col h-full pt-8">
                  <NavLinks mobile />
                  
                  <div className="mt-auto pb-8">
                    {user ? (
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/50">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#ea00ea] to-[#2699fe] flex items-center justify-center">
                            <User className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-white">{user.full_name}</p>
                            <p className="text-xs text-slate-400 capitalize">{user.user_role}</p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          onClick={() => base44.auth.logout()}
                          className="w-full text-slate-400 hover:text-white hover:bg-white/10"
                        >
                          <LogOut className="w-4 h-4 mr-2" />
                          Sign Out
                        </Button>
                      </div>
                    ) : (
                      <Button
                        onClick={() => base44.auth.redirectToLogin()}
                        className="w-full bg-gradient-to-r from-[#ea00ea] to-[#2699fe] hover:opacity-90 text-white border-0"
                      >
                        Sign In
                      </Button>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-16">
        {children}
      </main>
    </div>
  );
}