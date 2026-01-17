import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from './utils';
import { MessageSquare, FileText, Home, FolderOpen, Bot } from 'lucide-react';
import GlytchWidget from './components/GlytchWidget';

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  
  const isActivePage = (pageName) => {
    return currentPageName === pageName;
  };

  return (
    <div className="min-h-screen bg-[#030101]">
      <style>{`
        /* Custom scrollbar - Syncloud theme */
        ::-webkit-scrollbar {
          width: 8px;
        }
        ::-webkit-scrollbar-track {
          background: #030101;
        }
        ::-webkit-scrollbar-thumb {
          background: #48CAE4;
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #F4A261;
        }
        
        /* Custom styles for Slider component */
        .slider-track {
            background-color: #1a1a1a;
        }
        .slider-range {
            background-color: #48CAE4;
        }
        .slider-thumb {
            border: 2px solid #48CAE4;
            background-color: #030101;
            box-shadow: 0 0 5px #48CAE4;
        }
        .slider-thumb:focus-visible {
            outline: none;
            box-shadow: 0 0 0 3px #030101, 0 0 0 5px #48CAE4;
        }
        
        @keyframes syncloud-breathe {
            0%, 100% { background: linear-gradient(135deg, #0077B6, #48CAE4); }
            25% { background: linear-gradient(135deg, #48CAE4, #00B4D8); }
            50% { background: linear-gradient(135deg, #F4A261, #E9C46A); }
            75% { background: linear-gradient(135deg, #E9C46A, #0077B6); }
        }
        @keyframes syncloud-text {
            0%, 100% { background-position: 0% center; }
            50% { background-position: 100% center; }
        }
        .animate-syncloud-breathe {
            animation: syncloud-breathe 8s ease-in-out infinite;
        }
        .animate-syncloud-text {
            animation: syncloud-text 4s ease-in-out infinite;
        }
      `}</style>

      {/* Navigation Bar */}
      {currentPageName !== 'Chat' && currentPageName !== 'GLYTCH' && (
        <nav className="bg-white/95 backdrop-blur-sm border-b border-[#48CAE4]/30 sticky top-0 z-50">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              <Link to={createPageUrl('Index')} className="flex items-center gap-2">
                <div className="text-2xl font-bold bg-gradient-to-r from-[#0077B6] via-[#48CAE4] via-[#F4A261] to-[#E9C46A] bg-clip-text text-transparent bg-[length:200%_auto] animate-syncloud-text">
                  GLYTCH
                </div>
                <span className="text-xs text-gray-500">Syncloud AI</span>
              </Link>

              <div className="flex items-center gap-1">
                <Link to={createPageUrl('Index')}>
                  <button
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                      isActivePage('Index')
                        ? 'bg-[#0077B6]/10 text-[#0077B6] border border-[#0077B6]/50'
                        : 'text-gray-600 hover:text-[#0077B6] hover:bg-[#0077B6]/10'
                    }`}
                  >
                    <Home className="w-4 h-4" />
                    <span className="hidden sm:inline">Home</span>
                  </button>
                </Link>

                <Link to={createPageUrl('GLYTCH')}>
                  <button
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                      isActivePage('GLYTCH')
                        ? 'bg-[#48CAE4]/10 text-[#48CAE4] border border-[#48CAE4]/50'
                        : 'text-gray-600 hover:text-[#48CAE4] hover:bg-[#48CAE4]/10'
                    }`}
                  >
                    <Bot className="w-4 h-4" />
                    <span className="hidden sm:inline">GLYTCH</span>
                  </button>
                </Link>

                <Link to={createPageUrl('Conversations')}>
                  <button
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                      isActivePage('Conversations')
                        ? 'bg-[#F4A261]/20 text-[#F4A261] border border-[#F4A261]/50'
                        : 'text-gray-600 hover:text-[#F4A261] hover:bg-[#F4A261]/10'
                    }`}
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span className="hidden sm:inline">Conversations</span>
                  </button>
                </Link>

                <Link to={createPageUrl('Forms')}>
                  <button
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                      isActivePage('Forms')
                        ? 'bg-[#E9C46A]/10 text-[#E9C46A] border border-[#E9C46A]/50'
                        : 'text-gray-600 hover:text-[#E9C46A] hover:bg-[#E9C46A]/10'
                    }`}
                  >
                    <FolderOpen className="w-4 h-4" />
                    <span className="hidden sm:inline">Forms</span>
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </nav>
      )}

      <main>{children}</main>

      {/* GLYTCH AI Widget - available on all pages except GLYTCH */}
      {currentPageName !== 'GLYTCH' && <GlytchWidget />}

      {/* Footer */}
      {currentPageName !== 'Chat' && currentPageName !== 'GLYTCH' && (
        <footer className="bg-white border-t border-[#48CAE4]/30 mt-auto">
          <div className="container mx-auto px-4 py-6">
            <div className="bg-gradient-to-r from-[#0077B6]/10 via-[#48CAE4]/10 to-[#F4A261]/10 border border-[#48CAE4]/50 rounded-lg p-4 mb-4">
              <p className="text-[#48CAE4] text-sm font-semibold mb-2">🔮 GLYTCH - Intelligent Operations Butler</p>
              <p className="text-[#48CAE4]/90 text-xs leading-relaxed">
                The intelligent butler for SynCloud Connect by Omega UI, LLC—automating workflows, managing lead intelligence, 
                and orchestrating multi-system commands across the Omega UI ecosystem. Always-on, synchronized, fast, and compliant.
              </p>
            </div>
            <div className="text-center text-[#030101] text-sm">
              <p className="mb-2">© 2025 Omega UI, LLC - SynCloud Connect</p>
              <div className="flex justify-center gap-4 text-xs text-gray-500 mb-2">
                <Link to={createPageUrl('PrivacyPolicy')} className="hover:text-[#48CAE4] transition-colors">Privacy Policy</Link>
                <span>|</span>
                <Link to={createPageUrl('TermsAndConditions')} className="hover:text-[#48CAE4] transition-colors">Terms and Conditions</Link>
              </div>
              <p className="text-xs text-gray-500">
                GLYTCH Intelligent Operations Butler | Patent Pending
              </p>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}