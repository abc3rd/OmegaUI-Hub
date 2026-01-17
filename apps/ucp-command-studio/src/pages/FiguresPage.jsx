import { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { X, ZoomIn } from "lucide-react";

const figures = [
  {
    id: 1,
    title: "FIG. 1",
    caption: "System architecture diagram illustrating the interaction between natural language input, AI interpretation layer, UCP packet generation, driver abstraction layer, and target API execution across heterogeneous platforms.",
    placeholder: "/public/figures/fig1.png"
  },
  {
    id: 2,
    title: "FIG. 2",
    caption: "Detailed UCP packet structure showing header metadata, canonical serialization format, parameter schema definition, execution payload, driver mappings, and cryptographic signature components.",
    placeholder: "/public/figures/fig2.png"
  },
  {
    id: 3,
    title: "FIG. 3",
    caption: "Vector-based semantic caching mechanism illustrating intent embedding, similarity matching via cosine distance, cache hit/miss decision flow, and fallback to LLM inference on cache miss.",
    placeholder: "/public/figures/fig3.png"
  },
  {
    id: 4,
    title: "FIG. 4",
    caption: "Bidirectional handshake protocol flowchart depicting session initialization, token exchange, signature verification, command execution, and response confirmation between client and server.",
    placeholder: "/public/figures/fig4.png"
  },
  {
    id: 5,
    title: "FIG. 5",
    caption: "Driver abstraction layer architecture showing standardized driver interface, platform-specific implementations (Stripe, Salesforce, Google Calendar), and unified execution semantics.",
    placeholder: "/public/figures/fig5.png"
  },
  {
    id: 6,
    title: "FIG. 6",
    caption: "Physical transport pipeline illustrating packet compression (gzip), base64url encoding, QR code generation with error correction, and optional fragmentation for size-constrained media.",
    placeholder: "/public/figures/fig6.png"
  },
  {
    id: 7,
    title: "FIG. 7",
    caption: "Energy consumption comparison graph showing computational overhead reduction: LLM inference (~0.05 kWh) versus UCP cached execution (~0.001 kWh) demonstrating 50× energy efficiency gain.",
    placeholder: "/public/figures/fig7.png"
  },
  {
    id: 8,
    title: "FIG. 8",
    caption: "Token usage analysis chart comparing LLM token consumption (input + output tokens) against UCP vector similarity lookup, illustrating 70-95% reduction in inference costs for cached commands.",
    placeholder: "/public/figures/fig8.png"
  },
  {
    id: 9,
    title: "FIG. 9",
    caption: "Offline execution flow diagram showing QR/NFC packet transport, local validation, driver execution without network connectivity, and delayed result synchronization upon reconnection.",
    placeholder: "/public/figures/fig9.png"
  },
  {
    id: 10,
    title: "FIG. 10",
    caption: "Cross-platform portability scenario illustrating identical UCP packet execution across iOS, Android, web, and desktop platforms via platform-specific driver implementations.",
    placeholder: "/public/figures/fig10.png"
  },
  {
    id: 11,
    title: "FIG. 11",
    caption: "Multi-step command orchestration workflow showing packet chaining, conditional execution logic, parameter passing between steps, and rollback mechanisms for failed transactions.",
    placeholder: "/public/figures/fig11.png"
  }
];

export default function FiguresPage() {
  const [selectedFigure, setSelectedFigure] = useState(null);

  return (
    <div className="min-h-screen bg-white">
      {/* Disclosure Banner */}
      <div className="bg-slate-100 border-b border-slate-200 py-2 text-center">
        <p className="text-sm text-slate-600">
          This site describes technical concepts for evaluation and does not grant a license.
        </p>
      </div>

      {/* Navigation */}
      <nav className="border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="font-semibold text-xl text-slate-900">UCP</div>
            <div className="flex gap-8">
              <Link to={createPageUrl("LandingIP")} className="text-slate-600 hover:text-slate-900">Home</Link>
              <Link to={createPageUrl("SpecPage")} className="text-slate-600 hover:text-slate-900">Spec</Link>
              <Link to={createPageUrl("FiguresPage")} className="text-slate-900 font-medium">Figures</Link>
              <Link to={createPageUrl("LicensingPage")} className="text-slate-600 hover:text-slate-900">Licensing</Link>
              <Link to={createPageUrl("TermsPage")} className="text-slate-600 hover:text-slate-900">Terms</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold text-slate-900 mb-8">Patent Figures</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {figures.map((figure) => (
            <div 
              key={figure.id}
              className="border border-slate-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => setSelectedFigure(figure)}
            >
              <div className="bg-slate-100 aspect-video flex items-center justify-center relative group">
                <div className="text-slate-400 text-sm">
                  {figure.title}
                  <br />
                  <span className="text-xs">Image placeholder</span>
                </div>
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                  <ZoomIn className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-slate-900 mb-2">{figure.title}</h3>
                <p className="text-sm text-slate-600 line-clamp-3">{figure.caption}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox Modal */}
      {selectedFigure && (
        <div 
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-8"
          onClick={() => setSelectedFigure(null)}
        >
          <div className="bg-white rounded-lg max-w-5xl w-full max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-900">{selectedFigure.title}</h2>
              <button 
                onClick={() => setSelectedFigure(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6">
              <div className="bg-slate-100 aspect-video flex items-center justify-center mb-6 rounded-lg">
                <div className="text-slate-400 text-center">
                  <p className="text-lg mb-2">{selectedFigure.title}</p>
                  <p className="text-sm">High-resolution image placeholder</p>
                  <p className="text-xs mt-2 text-slate-500">({selectedFigure.placeholder})</p>
                </div>
              </div>
              <p className="text-slate-700 leading-relaxed">{selectedFigure.caption}</p>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-200 py-12 mt-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-900 font-semibold mb-1">© Omega UI, LLC — Universal Command Protocol (UCP)</p>
              <p className="text-sm text-slate-600">Patent pending / Provisional filed</p>
            </div>
            <div className="text-right text-sm text-slate-600">
              <p>Website: <a href="https://www.omegaui.com" className="text-blue-600 hover:underline">omegaui.com</a></p>
              <p>Contact: <a href="mailto:ucp@syncloudconnect.com" className="text-blue-600 hover:underline">ucp@syncloudconnect.com</a></p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}