
import React from 'react';
import OmegaHeader from './components/OmegaHeader';
import ChatInterface from './components/ChatInterface';

const App: React.FC = () => {
  return (
    <div className="h-screen bg-[#050505] text-zinc-100 flex flex-col font-sans selection:bg-[#ea00ea] selection:text-white overflow-hidden">
      <OmegaHeader />
      
      <main className="flex-1 relative flex flex-col min-h-0">
        {/* Advanced Background Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808005_1px,transparent_1px),linear-gradient(to_bottom,#80808005_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_400px_at_100%_0px,#ea00ea05,transparent)] pointer-events-none"></div>
        
        <div className="relative z-10 flex-1 flex flex-col min-h-0">
          <ChatInterface />
        </div>
      </main>

      {/* Ultra Compact Decorative footer line */}
      <div className="h-[1px] w-full flex">
        <div className="h-full flex-1 bg-[#ea00ea]/40"></div>
        <div className="h-full flex-1 bg-[#2699fe]/40"></div>
        <div className="h-full flex-1 bg-[#4bce2a]/40"></div>
      </div>
    </div>
  );
};

export default App;
