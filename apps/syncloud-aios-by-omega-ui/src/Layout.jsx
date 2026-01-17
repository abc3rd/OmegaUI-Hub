import React, { useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  Target, 
  BarChart3, 
  Settings, 
  Command,
  Menu,
  X,
  Cloud
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import * as THREE from 'three';

const navigationItems = [
  {
    title: "Dashboard",
    url: createPageUrl("Dashboard"),
    icon: BarChart3,
    description: "Overview & insights"
  },
  {
    title: "QR Generator",
    url: createPageUrl("QrGenerator"),
    icon: Target,
    description: "Create QR codes"
  },
  {
    title: "Settings",
    url: createPageUrl("Settings"),
    icon: Settings,
    description: "GHL configuration"
  }
];

function StarField() {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    mountRef.current.appendChild(renderer.domElement);

    // Create stars
    const starsGeometry = new THREE.BufferGeometry();
    const starsMaterial = new THREE.PointsMaterial({ 
      color: 0x54b0e7,
      size: 1,
      transparent: true,
      opacity: 0.6
    });

    const starsVertices = [];
    for (let i = 0; i < 1000; i++) {
      const x = (Math.random() - 0.5) * 2000;
      const y = (Math.random() - 0.5) * 2000;
      const z = (Math.random() - 0.5) * 2000;
      starsVertices.push(x, y, z);
    }

    starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starsVertices, 3));
    const starField = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(starField);

    // Add floating particles
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesMaterial = new THREE.PointsMaterial({
      color: 0x4acbbf,
      size: 2,
      transparent: true,
      opacity: 0.4
    });

    const particlesVertices = [];
    for (let i = 0; i < 100; i++) {
      const x = (Math.random() - 0.5) * 1000;
      const y = (Math.random() - 0.5) * 1000;
      const z = (Math.random() - 0.5) * 1000;
      particlesVertices.push(x, y, z);
    }

    particlesGeometry.setAttribute('position', new THREE.Float32BufferAttribute(particlesVertices, 3));
    const particles = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particles);

    camera.position.z = 500;
    sceneRef.current = { scene, camera, renderer, starField, particles };

    // Animation loop
    const animate = () => {
      animationRef.current = requestAnimationFrame(animate);
      
      starField.rotation.x += 0.0003;
      starField.rotation.y += 0.0003;
      particles.rotation.x -= 0.0008;
      particles.rotation.y -= 0.0008;
      
      renderer.render(scene, camera);
    };
    animate();

    // Handle resize
    const handleResize = () => {
      if (sceneRef.current) {
        const { camera, renderer } = sceneRef.current;
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return <div ref={mountRef} className="fixed inset-0 -z-10" />;
}

function Navigation({ className = "" }) {
  const location = useLocation();

  return (
    <nav className={`space-y-2 ${className}`}>
      {navigationItems.map((item) => {
        const isActive = location.pathname === item.url;
        return (
          <Link
            key={item.title}
            to={item.url}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${
              isActive
                ? 'bg-gradient-to-r from-[#54b0e7]/30 to-[#4acbbf]/30 text-[#54b0e7] shadow-lg border border-[#54b0e7]/40 shadow-[#54b0e7]/20'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/50 border border-transparent'
            }`}
          >
            <item.icon className={`w-5 h-5 transition-transform duration-300 ${
              isActive ? 'scale-110 text-[#54b0e7]' : 'group-hover:scale-110 text-slate-400'
            }`} />
            <div>
              <div className="font-medium text-sm">{item.title}</div>
              <div className="text-xs opacity-70">{item.description}</div>
            </div>
          </Link>
        );
      })}
    </nav>
  );
}

export default function Layout({ children, currentPageName }) {
  const [commandOpen, setCommandOpen] = React.useState(false);

  // Command palette
  useEffect(() => {
    const down = (e) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setCommandOpen((open) => !open);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100 relative">
      {/* 3D Starfield Background */}
      <StarField />
      
      {/* Gradient Overlays for depth */}
      <div className="fixed inset-0 bg-gradient-to-r from-[#54b0e7]/10 via-transparent to-[#4acbbf]/10 pointer-events-none" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_center,rgba(84,176,231,0.05)_0%,transparent_50%)] pointer-events-none" />

      <div className="flex min-h-screen relative z-10">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex w-80 flex-col border-r border-slate-700/50 bg-slate-900/80 backdrop-blur-xl">
          <div className="p-6 border-b border-slate-700/50">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#f8d417] via-[#4acbbf] to-[#54b0e7]">
                <img 
                  src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6923b7250adf34072b42d64c/8f7ad26ac_Gemini_Generated_Image_dr611kdr611kdr61-Edited.png"
                  alt="SynCloud Connect Logo"
                  className="w-8 h-8 object-contain"
                />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-[#f8d417] via-[#4acbbf] to-[#54b0e7] bg-clip-text text-transparent">
                  SynCloud Connect
                </h1>
                <p className="text-xs text-slate-400">Go High Level Integration</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCommandOpen(true)}
              className="w-full justify-start gap-2 bg-slate-800/50 border-slate-600/50 hover:bg-slate-700/50 text-slate-300 hover:text-slate-100"
            >
              <Command className="w-4 h-4" />
              <span className="text-slate-400">Quick Actions</span>
              <kbd className="ml-auto text-xs bg-slate-700/50 px-2 py-1 rounded text-slate-400">⌘K</kbd>
            </Button>
          </div>
          
          <div className="flex-1 p-6">
            <div className="mb-6">
              <h3 className="text-sm font-medium text-slate-400 mb-3 uppercase tracking-wider">Navigation</h3>
              <Navigation />
            </div>
            
            <div className="mt-8 p-4 rounded-xl bg-gradient-to-br from-[#54b0e7]/10 to-[#4acbbf]/10 border border-[#4acbbf]/20 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-2">
                <Cloud className="w-4 h-4 text-[#4acbbf]" />
                <span className="text-sm font-medium text-[#4acbbf]">GHL Status</span>
              </div>
              <p className="text-xs text-slate-300">All systems operational</p>
              <div className="flex items-center gap-2 mt-2">
                <div className="w-2 h-2 bg-[#4acbbf] rounded-full animate-pulse" />
                <span className="text-xs text-[#4acbbf]">Connected</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Mobile Header */}
        <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-xl border-b border-slate-700/50">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#f8d417] via-[#4acbbf] to-[#54b0e7]">
                <img 
                  src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6923b7250adf34072b42d64c/8f7ad26ac_Gemini_Generated_Image_dr611kdr611kdr61-Edited.png"
                  alt="SynCloud Connect Logo"
                  className="w-6 h-6 object-contain"
                />
              </div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-[#f8d417] via-[#4acbbf] to-[#54b0e7] bg-clip-text text-transparent">
                SynCloud Connect
              </h1>
            </div>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-slate-300 hover:text-slate-100">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 bg-slate-900/95 border-slate-700/50 backdrop-blur-xl">
                <div className="p-6">
                  <SheetClose asChild>
                    <Button variant="ghost" size="icon" className="absolute top-4 right-4 text-slate-400 hover:text-slate-100">
                      <X className="w-4 h-4" />
                    </Button>
                  </SheetClose>
                  <Navigation className="mt-8" />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 lg:ml-0 mt-16 lg:mt-0 flex flex-col">
          <div className="relative flex-grow">
            {children}
          </div>
          <footer className="w-full p-4 text-center text-slate-400 text-xs border-t border-slate-700/50 bg-slate-900/95 backdrop-blur-xl shrink-0">
            <p className="mb-1">Powered by <span className="bg-gradient-to-r from-[#f8d417] via-[#4acbbf] to-[#54b0e7] bg-clip-text text-transparent font-semibold">Omega UI</span></p>
            <p>SynCloud Connect · Fort Myers, FL · omegaui.com</p>
          </footer>
        </main>
      </div>

      {/* Command Palette Modal */}
      {commandOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-start justify-center pt-[10vh] z-50">
          <div className="bg-slate-800/95 backdrop-blur-xl border border-slate-600/50 rounded-2xl w-full max-w-lg mx-4 shadow-2xl">
            <div className="p-4 border-b border-slate-600/50">
              <input
                type="text"
                placeholder="Type a command or search..."
                className="w-full bg-transparent text-slate-100 placeholder-slate-400 outline-none text-lg"
                autoFocus
              />
            </div>
            <div className="p-2">
              {navigationItems.map((item) => (
                <Link
                  key={item.title}
                  to={item.url}
                  onClick={() => setCommandOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-700/50 transition-colors text-slate-200 hover:text-slate-100"
                >
                  <item.icon className="w-4 h-4 text-[#54b0e7]" />
                  <div>
                    <div className="font-medium">{item.title}</div>
                    <div className="text-xs text-slate-400">{item.description}</div>
                  </div>
                </Link>
              ))}
            </div>
            <div className="p-4 border-t border-slate-600/50 text-center">
              <button
                onClick={() => setCommandOpen(false)}
                className="text-slate-400 text-sm hover:text-slate-200"
              >
                Press ESC to close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Google Analytics */}
      <script async src="https://www.googletagmanager.com/gtag/js?id=G-SNLF60E7LE"></script>
      <script dangerouslySetInnerHTML={{
        __html: `
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-SNLF60E7LE');
        `
      }} />

      <style>{`
        .bg-clip-text {
          -webkit-background-clip: text;
          background-clip: text;
        }
      `}</style>
    </div>
  );
}