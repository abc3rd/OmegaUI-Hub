import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  Zap, Package, Play, Shield, QrCode, ScrollText, 
  ChevronRight, ArrowRight, Cpu, Globe, Leaf, Lock
} from "lucide-react";
import { Button } from "@/components/ui/button";

// GA4 Tracking
if (typeof window !== 'undefined' && !window.ga4Loaded) {
  const script = document.createElement('script');
  script.async = true;
  script.src = 'https://www.googletagmanager.com/gtag/js?id=G-SNLF60E7LE';
  document.head.appendChild(script);
  
  window.dataLayer = window.dataLayer || [];
  function gtag(){window.dataLayer.push(arguments);}
  window.gtag = gtag;
  gtag('js', new Date());
  gtag('config', 'G-SNLF60E7LE');
  window.ga4Loaded = true;
}

export default function Landing() {
  const features = [
    { name: "Create Packets", href: "CreatePacket", icon: Package, desc: "Transform intent into executable logic" },
    { name: "Execute", href: "ExecutePacket", icon: Play, desc: "Run packets with parameters" },
    { name: "Share & Verify", href: "ShareVerify", icon: QrCode, desc: "QR codes & signature verification" },
    { name: "Audit Logs", href: "AuditLogs", icon: ScrollText, desc: "Full activity trail" },
  ];

  const steps = [
    { icon: "⌨️", title: "User Prompt", desc: "Natural language input via Voice, Text, or API." },
    { icon: "⚙️", title: "UCP Core", desc: "Interprets intent & compiles to Standard Packet." },
    { icon: "💾", title: "Packet Cache", desc: "Stored locally or cloud. HMAC Signed & Replay Protected." },
    { icon: "🔌", title: "Drivers", desc: "Modular translation to specific apps/OS." },
    { icon: "⚡", title: "Execution", desc: "Instant action. Zero re-interpretation latency.", highlight: true },
  ];

  const benefits = [
    { title: "Cost Efficiency", stat: "90-99%", desc: "Cheaper repeated tasks. Stop paying LLMs to 'think' about the same command twice.", icon: Cpu },
    { title: "Green AI", stat: "Energy Optimized", desc: "Drastically reduce GPU cycles and carbon footprint for routine automation.", icon: Leaf, green: true },
    { title: "Portability", stat: "Offline Ready", desc: "Commands exist as portable packets. Transfer via QR code, NFC, or 'Digital Dead Drop'.", icon: Globe },
    { title: "Universality", stat: "Cross-App", desc: "One protocol, modular drivers. Control IoT, CRM, and OS level functions seamlessly.", icon: Lock },
  ];

  return (
    <div className="min-h-screen bg-[#0f0f13] text-white overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0f0f13]/80 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-[#ea00ea] to-[#2699fe]">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-wide">UCP</span>
              <span className="text-[10px] text-gray-400 ml-1">™</span>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            {features.map((f) => (
              <Link 
                key={f.name}
                to={createPageUrl(f.href)}
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                {f.name}
              </Link>
            ))}
          </div>

          <Link to={createPageUrl("Dashboard")}>
            <Button className="bg-gradient-to-r from-[#ea00ea] to-[#2699fe] hover:opacity-90 text-white border-0">
              Open Studio
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="min-h-screen flex flex-col justify-center items-center text-center px-6 pt-16 relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(60,60,60,0.3)_0%,rgba(15,15,19,1)_70%)]" />
        
        <div className="relative z-10 max-w-4xl">
          <div className="inline-block px-4 py-1.5 rounded-full border border-[#c4653a] bg-[#c4653a]/15 text-[#c4653a] text-sm font-bold tracking-wider mb-8">
            PATENT PENDING 63/928,882
          </div>

          {/* Logo SVG */}
          <div className="mb-8">
            <svg viewBox="0 0 600 200" className="w-full max-w-lg mx-auto h-auto">
              <defs>
                <linearGradient id="omegaGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style={{stopColor:'#ea00ea'}} />
                  <stop offset="100%" style={{stopColor:'#2699fe'}} />
                </linearGradient>
              </defs>
              <g transform="translate(60, 30) scale(0.8)">
                <path d="M85,10 L155,50 L155,130 L85,170 L15,130 L15,50 Z" 
                      fill="none" stroke="url(#omegaGradient)" strokeWidth="8" strokeLinejoin="round"/>
                <circle cx="85" cy="90" r="15" fill="#ea00ea" />
                <path d="M85,75 L85,40" stroke="#ffffff" strokeWidth="4" />
                <path d="M85,105 L85,140" stroke="#ffffff" strokeWidth="4" />
                <path d="M72,97 L40,115" stroke="#ffffff" strokeWidth="4" />
                <path d="M98,83 L130,65" stroke="#ffffff" strokeWidth="4" />
                <circle cx="85" cy="30" r="6" fill="#2699fe" />
                <circle cx="85" cy="150" r="6" fill="#4bce2a" />
                <circle cx="30" cy="120" r="6" fill="#2699fe" />
                <circle cx="140" cy="60" r="6" fill="#2699fe" />
              </g>
              <g transform="translate(200, 100)">
                <text x="0" y="0" style={{fontFamily: 'system-ui', fill: '#ffffff', fontSize: '72px', letterSpacing: '4px', fontWeight: 'bold'}}>UCP</text>
                <text x="175" y="-40" style={{fontFamily: 'Arial', fontSize: '16px', fill: '#ffffff'}}>TM</text>
                <text x="5" y="30" style={{fontFamily: 'system-ui', fill: '#cccccc', fontSize: '18px', letterSpacing: '2px', textTransform: 'uppercase', fontWeight: '500'}}>Universal Command Protocol</text>
              </g>
            </svg>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            Interpret Once,<br/>
            <span className="bg-gradient-to-r from-[#ea00ea] to-[#2699fe] bg-clip-text text-transparent">
              Execute a Million Times
            </span>
          </h1>

          <p className="text-lg md:text-xl text-gray-400 max-w-3xl mx-auto mb-10">
            The standard for energy-optimized AI command processing. Cut AI compute costs and energy consumption by 90–99% using standardized intermediate command packets.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to={createPageUrl("CreatePacket")}>
              <Button className="w-full sm:w-auto h-14 px-8 text-lg bg-gradient-to-r from-[#ea00ea] to-[#2699fe] hover:opacity-90 text-white border-0">
                Create Your First Packet
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to={createPageUrl("Dashboard")}>
              <Button variant="outline" className="w-full sm:w-auto h-14 px-8 text-lg border-white/20 text-white hover:bg-white/10">
                Open Command Studio
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-[#16161c] border-y border-white/10">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 uppercase tracking-wider">
            The Architecture
          </h2>

          <div className="flex flex-col lg:flex-row justify-between items-center gap-6 relative">
            {steps.map((step, i) => (
              <div 
                key={i}
                className={`relative bg-[#3c3c3c]/50 border rounded-xl p-6 text-center w-full lg:w-44 transition-all hover:-translate-y-1 ${
                  step.highlight ? 'border-[#4bce2a] hover:shadow-[0_0_15px_rgba(75,206,42,0.2)]' : 'border-white/20 hover:border-[#2699fe] hover:shadow-[0_0_15px_rgba(38,153,254,0.2)]'
                }`}
              >
                <div className={`text-3xl mb-4 ${step.highlight ? 'text-[#4bce2a]' : 'text-[#2699fe]'}`}>
                  {step.icon}
                </div>
                <h3 className="font-bold uppercase text-sm mb-2">{step.title}</h3>
                <p className="text-xs text-gray-400">{step.desc}</p>

                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute -right-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-[#ea00ea]">
                    →
                  </div>
                )}
                {i < steps.length - 1 && (
                  <div className="lg:hidden text-2xl font-bold text-[#ea00ea] mt-4">
                    ↓
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <span className="inline-block px-4 py-2 rounded bg-[#4bce2a]/10 text-[#4bce2a] font-bold text-sm">
              Offline Capable • QR Transferable • HMAC Signed • TTL Controlled
            </span>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 uppercase tracking-wider">
            Command Studio Features
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => (
              <Link
                key={feature.name}
                to={createPageUrl(feature.href)}
                className="group relative bg-gradient-to-b from-[#1a1a20] to-[#0f0f13] p-8 rounded-2xl border border-white/10 hover:border-[#2699fe]/50 transition-all hover:-translate-y-1"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-[#ea00ea]/20 to-[#2699fe]/20 border border-[#ea00ea]/20 mb-6">
                  <feature.icon className="h-7 w-7 text-[#2699fe]" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-[#2699fe]">{feature.name}</h3>
                <p className="text-gray-400">{feature.desc}</p>
                <ChevronRight className="absolute bottom-8 right-8 h-5 w-5 text-gray-600 group-hover:text-[#2699fe] transition-colors" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-24 bg-[#0f0f13]">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 uppercase tracking-wider">
            Why Adopt UCP?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((b, i) => (
              <div 
                key={i}
                className="bg-gradient-to-b from-[#1a1a20] to-[#0f0f13] p-8 rounded-2xl border border-white/10 text-center"
              >
                <h3 className={`font-bold uppercase mb-4 ${b.green ? 'text-[#4bce2a]' : 'text-[#2699fe]'}`}>
                  {b.title}
                </h3>
                <div className="text-3xl font-bold mb-3">{b.stat}</div>
                <p className="text-gray-400 text-sm">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Patent Section */}
      <section className="py-24 bg-gradient-to-r from-[#16161c] to-[#0f0f13] border-t border-[#c4653a]">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <div className="border border-dashed border-[#c4653a] rounded-xl p-10 bg-[#c4653a]/5">
            <h2 className="text-2xl font-bold text-[#c4653a] uppercase mb-6">
              Official Status: Patent Pending
            </h2>
            <p className="text-xl font-bold mb-4">Application Number: 63/928,882</p>
            <p className="text-gray-400 text-sm">
              System and Method for Energy-Optimized Artificial Intelligence Command Processing Through Standardized Intermediate Packet Format with Bidirectional State Verification and Modular Driver Architecture.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/10 text-center text-gray-500 text-sm">
        <p>© 2025 Omega UI, LLC. All Rights Reserved.</p>
        <p className="mt-2">2744 Edison Avenue, Unit-7, Suite C-3, Fort Myers, FL 33916</p>
        <a href="mailto:reachus@omegaui.com" className="text-[#2699fe] hover:underline">
          reachus@omegaui.com
        </a>
      </footer>
    </div>
  );
}