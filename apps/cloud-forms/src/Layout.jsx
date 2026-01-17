import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { User } from "@/entities/User";
import { LayoutDashboard, Plus, FileText, Settings, Layers, Menu, X, LogIn, LogOut } from "lucide-react";

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [user, setUser] = React.useState(null);
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);

  React.useEffect(() => {
    checkAuthentication();
  }, []);

  const checkAuthentication = async () => {
    try {
      const userData = await User.me();
      setUser(userData);
      setIsAuthenticated(true);
    } catch (error) {
      setIsAuthenticated(false);
    }
  };

  const handleLogin = async () => {
    try {
      const callbackUrl = `${window.location.origin}${window.location.pathname}`;
      await User.loginWithRedirect(callbackUrl);
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await User.logout();
      setUser(null);
      setIsAuthenticated(false);
      window.location.reload();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const navigationItems = [
    { name: "Dashboard", path: createPageUrl("Dashboard"), icon: LayoutDashboard },
    { name: "Create Form", path: createPageUrl("CreateForm"), icon: Plus },
    { name: "My Forms", path: createPageUrl("MyForms"), icon: FileText },
    { name: "Settings", path: createPageUrl("Settings"), icon: Settings },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ backgroundColor: "#e0e0e0" }}>
      <style>{`
        :root {
          --neu-bg: #e0e0e0;
          --neu-light: #ffffff;
          --neu-dark: #bebebe;
          --neu-primary: #6b73ff;
          --neu-text: #333333;
          --neu-text-light: #666666;
        }
        
        * {
          -webkit-tap-highlight-color: transparent;
        }
        
        body {
          overflow-x: hidden;
          -webkit-overflow-scrolling: touch;
        }
        
        .neu-inset {
          background: var(--neu-bg);
          box-shadow: inset 6px 6px 12px var(--neu-dark), inset -6px -6px 12px var(--neu-light);
        }
        
        .neu-raised {
          background: var(--neu-bg);
          box-shadow: 6px 6px 12px var(--neu-dark), -6px -6px 12px var(--neu-light);
        }
        
        .neu-pressed {
          background: var(--neu-bg);
          box-shadow: inset 3px 3px 6px var(--neu-dark), inset -3px -3px 6px var(--neu-light);
        }
        
        .neu-button {
          background: var(--neu-bg);
          box-shadow: 3px 3px 6px var(--neu-dark), -3px -3px 6px var(--neu-light);
          border: none;
          transition: all 0.15s ease;
          min-height: 44px;
          min-width: 44px;
          touch-action: manipulation;
        }
        
        .neu-button:hover {
          box-shadow: 4px 4px 8px var(--neu-dark), -4px -4px 8px var(--neu-light);
          transform: translateY(-1px);
        }
        
        .neu-button:active {
          box-shadow: inset 1px 1px 3px var(--neu-dark), inset -1px -1px 3px var(--neu-light);
          transform: translateY(0);
        }
        
        .neu-card {
          background: var(--neu-bg);
          box-shadow: 8px 8px 16px var(--neu-dark), -8px -8px 16px var(--neu-light);
          border-radius: 16px;
        }
        
        .neu-input {
          background: var(--neu-bg);
          box-shadow: inset 3px 3px 6px var(--neu-dark), inset -3px -3px 6px var(--neu-light);
          border: none;
          border-radius: 12px;
          min-height: 44px;
        }
        
        .neu-input:focus {
          outline: none;
          box-shadow: inset 4px 4px 8px var(--neu-dark), inset -4px -4px 8px var(--neu-light);
        }
        
        @media (max-width: 768px) {
          .neu-card {
            border-radius: 12px;
            box-shadow: 4px 4px 8px var(--neu-dark), -4px -4px 8px var(--neu-light);
          }
          
          .neu-button {
            box-shadow: 2px 2px 4px var(--neu-dark), -2px -2px 4px var(--neu-light);
          }
        }
      `}</style>
      
      {/* Mobile Header */}
      <header className="lg:hidden neu-card mx-2 mt-2 p-3 sticky top-2 z-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="neu-raised p-2 rounded-full">
              <Layers className="w-5 h-5 text-gray-700" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-800">FormForge</h1>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {isAuthenticated ? (
              <button
                onClick={handleLogout}
                className="neu-button p-2 rounded-lg"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleLogin}
                className="neu-button p-2 rounded-lg"
                title="Admin Login"
              >
                <LogIn className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="neu-button p-2 rounded-lg"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Desktop Header */}
      <header className="hidden lg:block neu-card mx-6 mt-6 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="neu-raised p-3 rounded-full">
              <Layers className="w-6 h-6 text-gray-700" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">FormForge</h1>
              <p className="text-sm text-gray-600">Craft beautiful forms effortlessly</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-600">Welcome, {user?.full_name || user?.email}</span>
                <button
                  onClick={handleLogout}
                  className="neu-button px-4 py-2 rounded-lg text-gray-700 hover:text-gray-900"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={handleLogin}
                className="neu-button px-4 py-2 rounded-lg text-gray-700 hover:text-gray-900 flex items-center space-x-2"
              >
                <LogIn className="w-4 h-4" />
                <span>Admin Login</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setMobileMenuOpen(false)}>
          <div className="neu-card m-2 mt-16 p-4" onClick={(e) => e.stopPropagation()}>
            <div className="space-y-2">
              {navigationItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    isActive(item.path)
                      ? "neu-pressed text-blue-600"
                      : "neu-button text-gray-700 hover:text-gray-900"
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Desktop Navigation */}
      <nav className="hidden lg:block neu-card mx-6 mt-6 p-2">
        <div className="flex space-x-2">
          {navigationItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center space-x-2 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive(item.path)
                  ? "neu-pressed text-blue-600"
                  : "neu-button text-gray-700 hover:text-gray-900"
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.name}</span>
            </Link>
          ))}
        </div>
      </nav>

      {/* Bottom Navigation - Mobile Only */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 neu-card mx-2 mb-2 p-2 z-50">
        <div className="flex justify-around">
          {navigationItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-xl transition-all duration-200 ${
                isActive(item.path)
                  ? "neu-pressed text-blue-600"
                  : "text-gray-700 hover:text-gray-900"
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-xs font-medium">{item.name.split(' ')[0]}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <main className="p-2 sm:p-4 lg:p-6 pb-20 lg:pb-6">
        {children}
      </main>
    </div>
  );
}