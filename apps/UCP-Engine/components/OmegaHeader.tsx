
import React, { useState } from 'react';
import { CORPORATE_INFO, OMEGA_ENTITIES_DATA, APP_HUB_DATA, AppEntry } from '../constants';

const AboutModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={onClose}></div>
      <div className="relative bg-zinc-950 border border-zinc-800 w-full max-w-2xl max-h-[80vh] overflow-y-auto rounded-xl shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="sticky top-0 bg-zinc-950/90 backdrop-blur-md p-3 border-b border-zinc-800 flex justify-between items-center z-10">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded omega-gradient flex items-center justify-center shadow-lg">
              <span className="text-white font-black text-[10px]">Γ</span>
            </div>
            <h2 className="text-sm font-bold text-white tracking-tighter uppercase">IDENTITY</h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-zinc-800 rounded-lg transition-colors text-zinc-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="p-4 space-y-4">
          <section className="text-zinc-400 text-xs italic border-l border-[#ea00ea] pl-3 py-1 bg-[#ea00ea]/5 rounded-r">
            {CORPORATE_INFO.mission}
          </section>
          <section className="grid gap-2">
            <h3 className="text-[8px] font-mono font-black text-zinc-600 uppercase tracking-widest">Active Entities</h3>
            {OMEGA_ENTITIES_DATA.map((entity) => (
              <div key={entity.name} className="bg-zinc-900/30 p-2 rounded-lg border border-zinc-800/50">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <div className="w-1 h-1 rounded-full" style={{ backgroundColor: entity.color }}></div>
                  <h4 className="text-zinc-200 font-bold text-[11px]">{entity.name}</h4>
                </div>
                <p className="text-[10px] text-zinc-500 leading-tight">{entity.details}</p>
              </div>
            ))}
          </section>
        </div>
      </div>
    </div>
  );
};

const GalleryModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [filter, setFilter] = useState('');
  if (!isOpen) return null;

  const filteredApps = APP_HUB_DATA.filter(app => 
    app.name.toLowerCase().includes(filter.toLowerCase()) || 
    app.category?.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={onClose}></div>
      <div className="relative bg-zinc-950 border border-zinc-800 w-full max-w-4xl h-[90vh] flex flex-col rounded-xl shadow-2xl overflow-hidden">
        <div className="p-3 border-b border-zinc-800 flex items-center justify-between gap-3 bg-zinc-950">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded omega-gradient flex items-center justify-center"><span className="text-white font-black text-[10px]">Γ</span></div>
            <h2 className="text-sm font-bold text-white tracking-tighter uppercase italic">PORTAL</h2>
          </div>
          <input 
            type="text" 
            placeholder="Search..." 
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="flex-1 max-w-[150px] sm:max-w-xs bg-zinc-900 border border-zinc-800 rounded-lg px-2 py-1 text-[10px] text-white focus:outline-none focus:border-[#ea00ea]"
          />
          <button onClick={onClose} className="p-1 hover:bg-zinc-800 rounded-lg text-zinc-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {filteredApps.map((app) => (
            <a key={app.name} href={app.url} target="_blank" rel="noopener noreferrer" className="p-3 rounded-lg bg-zinc-900/40 border border-zinc-800 hover:border-[#ea00ea]/50 transition-all flex flex-col gap-1">
              <span className="text-[7px] font-mono text-zinc-600 uppercase tracking-widest">{app.category}</span>
              <h4 className="text-zinc-200 font-bold text-xs">{app.name}</h4>
              <p className="text-zinc-500 text-[10px] leading-tight line-clamp-2">{app.description}</p>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

const OmegaHeader: React.FC = () => {
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);

  return (
    <>
      <header className="border-b border-zinc-900 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-50 py-1.5 px-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded omega-gradient flex items-center justify-center">
              <span className="text-white font-black text-[10px]">Γ</span>
            </div>
            <h1 className="text-xs font-bold tracking-tighter text-white uppercase italic">
              GLYTCH <span className="text-[#ea00ea]">SVR</span>
            </h1>
          </div>
          <div className="flex items-center gap-1.5">
            <button onClick={() => setIsGalleryOpen(true)} className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-[#2699fe] transition-all">
              <div className="w-1.5 h-1.5 rounded-full bg-[#2699fe]"></div>
            </button>
            <button onClick={() => setIsAboutOpen(true)} className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-[#ea00ea] transition-all">
              <div className="w-1.5 h-1.5 rounded-full bg-[#ea00ea]"></div>
            </button>
            <div className="h-4 w-[1px] bg-zinc-800 mx-1"></div>
            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-zinc-900/50 border border-zinc-800">
              <div className="w-1 h-1 rounded-full bg-[#4bce2a]"></div>
              <span className="text-[7px] font-mono text-[#4bce2a] font-bold">LNK</span>
            </div>
          </div>
        </div>
      </header>
      <AboutModal isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />
      <GalleryModal isOpen={isGalleryOpen} onClose={() => setIsGalleryOpen(false)} />
    </>
  );
};

export default OmegaHeader;
