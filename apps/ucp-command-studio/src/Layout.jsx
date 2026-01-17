import { useEffect, useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";

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

const pageTitles = {
  Dashboard: { title: "Dashboard", subtitle: "Overview of your command packets" },
  Projects: { title: "Projects", subtitle: "Organize templates and packets" },
  ProjectDetail: { title: "Project Details", subtitle: "Manage project templates" },
  Templates: { title: "Templates", subtitle: "Reusable command templates" },
  TemplateDetail: { title: "Template Details", subtitle: "Edit template versions" },
  CreatePacket: { title: "Create Command Packet", subtitle: "Transform intent into executable logic" },
  PacketLibrary: { title: "Packet Library", subtitle: "Browse and manage your packets" },
  ExecutePacket: { title: "Execute Packet", subtitle: "Run packets with parameters" },
  ShareVerify: { title: "Share & Verify", subtitle: "QR codes and signature verification" },
  KeyManagement: { title: "Key Management", subtitle: "ECDSA P-256 signing keys" },
  AuditLogs: { title: "Audit Logs", subtitle: "Full activity trail" },
  Settings: { title: "Settings", subtitle: "Organization and preferences" },
  PacketDetail: { title: "Packet Details", subtitle: "View and manage packet" },
};

export default function Layout({ children, currentPageName }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showRotateMessage, setShowRotateMessage] = useState(false);

  // Check orientation on mobile - only run for non-Landing pages
  useEffect(() => {
    if (currentPageName === "Landing") {
      return;
    }

    const checkOrientation = () => {
      if (window.innerWidth < 1024) {
        setShowRotateMessage(window.innerHeight > window.innerWidth);
      } else {
        setShowRotateMessage(false);
      }
    };

    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);

    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, [currentPageName]);

  // Landing page has its own full layout
  if (currentPageName === "Landing") {
    return children;
  }

  const pageInfo = pageTitles[currentPageName] || { title: currentPageName, subtitle: "" };

  return (
    <div className="min-h-screen bg-[#0f0f13]">
      {/* Background gradients */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#ea00ea]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#2699fe]/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-[#4bce2a]/5 rounded-full blur-3xl" />
      </div>

      <Sidebar 
        currentPage={currentPageName} 
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      
      <main className="lg:pl-64 transition-all duration-300">
        <Header 
          title={pageInfo.title} 
          subtitle={pageInfo.subtitle}
          onMenuClick={() => setSidebarOpen(true)}
        />
        
        {/* Rotate message for mobile portrait */}
        {showRotateMessage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0f0f13]/95 backdrop-blur-sm px-6">
            <div className="text-center">
              <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-[#ea00ea] to-[#2699fe] mb-6 animate-pulse">
                <svg className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Rotate Your Device</h3>
              <p className="text-slate-400">
                For the best experience, please rotate your device to landscape mode
              </p>
            </div>
          </div>
        )}
        
        <div className="p-4 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}