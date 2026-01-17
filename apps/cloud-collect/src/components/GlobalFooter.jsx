import React from "react";
import { ExternalLink } from "lucide-react";

const projects = [
  { name: "Glytch Cloud", url: "https://glytch.cloud", description: "Creative automation & cloud tools" },
  { name: "ABC Dashboard", url: "https://abcdashboard.com", description: "Personal financial insights" },
  { name: "UCP", url: "https://ucp.omegaui.com", description: "Unified control panel" },
];

export default function GlobalFooter() {
  return (
    <div className="bg-gradient-to-r from-[#3c3c3c] to-[#2a2a2a] text-white py-8 mt-auto border-t-4 border-[#ea00ea]">
      <div className="max-w-7xl mx-auto px-4">
        {/* Mandatory Disclaimer */}
        <div className="mb-8 p-6 bg-[#2a2a2a] rounded-lg border-l-4 border-[#c4653a]">
          <h4 className="font-bold text-[#ea00ea] mb-3 text-sm uppercase tracking-wide">Important Legal Disclaimer</h4>
          <p className="text-slate-300 text-sm leading-relaxed">
            Omega UI, LLC and Cloud QR provide a platform for community support and resource sharing but do not verify, 
            guarantee, or assume liability for the safety, legality, or availability of resources, events, or donations 
            posted by third parties. Users are responsible for maintaining a safe, legal, and honest process in accordance 
            with local laws. Omega UI, LLC is not responsible for any interactions or outcomes resulting from the use of 
            this platform.
          </p>
        </div>

        <div className="text-center mb-6">
          <h3 className="text-xl font-bold mb-2 text-[#ea00ea]">More from Omega UI</h3>
          <p className="text-slate-300 text-sm">Explore our ecosystem of innovative applications</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {projects.map((project, index) => (
            <a
              key={index}
              href={project.url}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#4a4a4a] hover:bg-[#5a5a5a] rounded-lg p-4 transition-all duration-300 hover:scale-105 border-2 border-transparent hover:border-[#2699fe]"
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-bold text-white text-lg">{project.name}</h4>
                <ExternalLink className="w-5 h-5 text-[#ea00ea]" />
              </div>
              <p className="text-sm text-slate-300">{project.description}</p>
            </a>
          ))}
        </div>
        
        <div className="text-center text-sm text-slate-400 border-t border-slate-600 pt-6">
          <p>© 2025 Omega UI, LLC. All rights reserved. • Contact: <a href="mailto:omegaui@syncloudconnect.com" className="text-[#2699fe] hover:text-[#ea00ea] transition-colors">omegaui@syncloudconnect.com</a></p>
        </div>
      </div>
    </div>
  );
}