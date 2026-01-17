import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from './utils';
import { MessageSquare, Home, FolderOpen, Bot } from 'lucide-react';
import MurphyWidget from './components/MurphyWidget';

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  
  const isActivePage = (pageName) => {
    return currentPageName === pageName;
  };

  return (
    <div className="min-h-screen bg-[#030101]">
      <style>{`
        /* Custom scrollbar - UCRASH theme */
        ::-webkit-scrollbar {
          width: 8px;
        }
        ::-webkit-scrollbar-track {
          background: #030101;
        }
        ::-webkit-scrollbar-thumb {
          background: #c61c39;
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #155EEF;
        }
        
        /* Custom styles for Slider component */
        .slider-track {
            background-color: #1a1a1a;
        }
        .slider-range {
            background-color: #c61c39;
        }
        .slider-thumb {
            border: 2px solid #c61c39;
            background-color: #030101;
            box-shadow: 0 0 5px #c61c39;
        }
        .slider-thumb:focus-visible {
            outline: none;
            box-shadow: 0 0 0 3px #030101, 0 0 0 5px #c61c39;
        }
      `}</style>

      {/* Navigation Bar */}
      {currentPageName !== 'Chat' && currentPageName !== 'SETH' && (
        <nav className="bg-white/95 backdrop-blur-sm border-b border-[#c61c39]/30 sticky top-0 z-50">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              <Link to={createPageUrl('Index')} className="flex items-center gap-2">
                <div className="text-2xl font-bold text-[#c61c39]">
                  UCRASH
                </div>
                <span className="text-xs text-gray-500">AI Assistant</span>
              </Link>

              <div className="flex items-center gap-1">
                <Link to={createPageUrl('Index')}>
                  <button
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                      isActivePage('Index')
                        ? 'bg-[#c61c39]/10 text-[#c61c39] border border-[#c61c39]/50'
                        : 'text-gray-600 hover:text-[#c61c39] hover:bg-[#c61c39]/10'
                    }`}
                  >
                    <Home className="w-4 h-4" />
                    <span className="hidden sm:inline">Home</span>
                  </button>
                </Link>

                <Link to={createPageUrl('SETH')}>
                  <button
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                      isActivePage('SETH')
                        ? 'bg-[#155EEF]/10 text-[#155EEF] border border-[#155EEF]/50'
                        : 'text-gray-600 hover:text-[#155EEF] hover:bg-[#155EEF]/10'
                    }`}
                  >
                    <Bot className="w-4 h-4" />
                    <span className="hidden sm:inline">Murphy</span>
                  </button>
                </Link>

                <Link to={createPageUrl('Conversations')}>
                  <button
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                      isActivePage('Conversations')
                        ? 'bg-[#71D6B5]/20 text-[#71D6B5] border border-[#71D6B5]/50'
                        : 'text-gray-600 hover:text-[#71D6B5] hover:bg-[#71D6B5]/10'
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
                        ? 'bg-[#155EEF]/10 text-[#155EEF] border border-[#155EEF]/50'
                        : 'text-gray-600 hover:text-[#155EEF] hover:bg-[#155EEF]/10'
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

            {/* Murphy AI Widget - available on all pages except SETH */}
            {currentPageName !== 'SETH' && <MurphyWidget />}

      {/* Footer */}
      {currentPageName !== 'Chat' && currentPageName !== 'SETH' && (
        <footer className="bg-white border-t border-[#c61c39]/30 mt-auto">
          <div className="container mx-auto px-4 py-6">
            <div className="bg-[#c61c39]/10 border border-[#c61c39]/50 rounded-lg p-4 mb-4">
              <p className="text-[#c61c39] text-sm font-semibold mb-2">⚖️ MURPHY'S LAW - LEGAL DISCLAIMER</p>
              <p className="text-[#c61c39]/90 text-xs leading-relaxed">
                Murphy (UCRASH AI Assistant) is an AI-powered legal aid volunteer and NOT a licensed attorney. 
                The information provided is for educational purposes only and does not constitute legal advice. 
                Murphy's responses are not guaranteed to be legally accurate. Always consult with a qualified 
                attorney before making any legal decisions. Use of this service does not create an attorney-client relationship.
              </p>
            </div>
            <div className="text-center text-[#030101] text-sm">
              <p className="mb-2">© 2025 UCRASH - Murphy AI Assistant (Legal Aid Volunteer)</p>
              <p className="text-xs text-gray-500">
                All conversations are documented and timestamped for transparency and legal protection
              </p>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}