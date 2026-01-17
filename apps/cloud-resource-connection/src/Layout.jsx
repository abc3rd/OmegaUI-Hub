import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Globe, MapPin } from "lucide-react";

export default function Layout({ children }) {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-lg border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14 md:h-16">
            <Link to={createPageUrl("Home")} className="flex items-center gap-2 md:gap-3 group">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                <Globe className="w-4 h-4 md:w-6 md:h-6 text-white" />
              </div>
              <div>
                <h1 className="text-base md:text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Resource Connect
                </h1>
                <p className="hidden sm:block text-[10px] md:text-xs text-slate-500 -mt-1">Multi-User Collaborative Platform</p>
              </div>
            </Link>
            
            <nav className="flex items-center space-x-1">
              <Link 
                to={createPageUrl("Home")} 
                className={`px-2 md:px-3 py-2 rounded-md text-xs md:text-sm font-medium transition-all ${
                  isActive(createPageUrl("Home"))
                    ? "bg-blue-100 text-blue-700"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                Home
              </Link>
              <Link 
                to={createPageUrl("ResourceMap")} 
                className={`px-2 md:px-3 py-2 rounded-md text-xs md:text-sm font-medium transition-all ${
                  isActive(createPageUrl("ResourceMap"))
                    ? "bg-blue-100 text-blue-700"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <MapPin className="w-3 h-3 md:w-4 md:h-4 inline mr-1" />
                Live Map
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="min-h-[calc(100vh-180px)]">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-8 md:mt-12">
        <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            <div>
              <div className="flex items-center gap-2 mb-2 md:mb-3">
                <Globe className="w-4 h-4 md:w-5 md:h-5 text-blue-500" />
                <span className="font-bold text-sm md:text-base text-slate-800">Resource Connect</span>
              </div>
              <p className="text-xs md:text-sm text-slate-600 mb-2">
                A multi-user, multidimensional interactive platform for mapping community resources at scale.
              </p>
              <div className="flex items-center gap-4 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  Live Updates
                </span>
                <span>1000+ Users</span>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold text-sm md:text-base text-slate-800 mb-2 md:mb-3">Quick Links</h3>
              <div className="space-y-2">
                <Link to={createPageUrl("Home")} className="block text-xs md:text-sm text-slate-600 hover:text-blue-600">
                  Home
                </Link>
                <Link to={createPageUrl("ResourceMap")} className="block text-xs md:text-sm text-slate-600 hover:text-blue-600">
                  Live Map
                </Link>
                <Link to={createPageUrl("AddResource")} className="block text-xs md:text-sm text-slate-600 hover:text-blue-600">
                  Add a Resource
                </Link>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-sm md:text-base text-slate-800 mb-2 md:mb-3">Platform Features</h3>
              <ul className="space-y-1 text-xs md:text-sm text-slate-600">
                <li>✓ Real-time collaboration</li>
                <li>✓ Thousands of concurrent users</li>
                <li>✓ Multi-layered resource mapping</li>
                <li>✓ Community verification</li>
                <li>✓ Mobile-optimized interface</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-200 mt-6 md:mt-8 pt-4 md:pt-6 text-center">
            <p className="text-xs md:text-sm text-slate-500">
              © 2024 Resource Connect. Built for communities, scaled for impact.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}