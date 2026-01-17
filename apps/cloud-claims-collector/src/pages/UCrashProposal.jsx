import React, { useEffect } from 'react';

export default function UCrashProposal() {
  useEffect(() => {
    const reveals = document.querySelectorAll('.reveal');

    const revealOnScroll = () => {
      const windowHeight = window.innerHeight;
      const elementVisible = 150;

      reveals.forEach((reveal) => {
        const elementTop = reveal.getBoundingClientRect().top;
        if (elementTop < windowHeight - elementVisible) {
          reveal.classList.add('active');
        }
      });
    };

    window.addEventListener('scroll', revealOnScroll);
    revealOnScroll();

    return () => window.removeEventListener('scroll', revealOnScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#f4f7f6]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700;900&display=swap');
        
        .reveal {
          opacity: 0;
          transform: translateY(40px);
          transition: all 0.8s ease-out;
        }
        
        .reveal.active {
          opacity: 1;
          transform: translateY(0);
        }

        .proposal-gradient {
          background: linear-gradient(135deg, #415fdf 0%, #899499 100%);
        }
      `}</style>

      {/* Header */}
      <header className="bg-[#071119] sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <img 
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/691be92ffa93cfd887f03662/ad2324a9c_background-ucrash-999kb.png" 
            alt="UCRASH Logo" 
            className="h-12"
          />
          <a 
            href="https://www.omegaui.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="px-6 py-2 bg-gradient-to-r from-[#4bce2a] to-[#33a819] text-white rounded-full font-bold hover:scale-105 transition-transform"
          >
            OMEGA UI →
          </a>
        </div>
      </header>

      {/* Hero */}
      <section className="proposal-gradient text-white py-20 px-4 text-center reveal">
        <h1 className="text-5xl font-black mb-6">Proposal for Integration</h1>
        <div className="bg-white/10 backdrop-blur-lg inline-block p-8 rounded-2xl max-w-2xl">
          <div className="grid grid-cols-2 gap-6 text-left">
            <div>
              <p className="text-sm text-white/70 mb-1">Presented To</p>
              <p className="font-bold">Wleid Swalleh, Owner - uCrash</p>
            </div>
            <div>
              <p className="text-sm text-white/70 mb-1">Prepared By</p>
              <p className="font-bold">Alonza Curry, Omega UI, LLC</p>
            </div>
            <div>
              <p className="text-sm text-white/70 mb-1">Date</p>
              <p className="font-bold">November 20, 2025</p>
            </div>
            <div>
              <p className="text-sm text-white/70 mb-1">Platform</p>
              <p className="font-bold">Omega UI Ecosystem</p>
            </div>
          </div>
        </div>
        <p className="mt-8 text-xl max-w-3xl mx-auto text-white/90">
          A fully integrated legal-tech, marketing, and lead-operations system designed to position uCrash as a national authority.
        </p>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-16">
        {/* Executive Summary */}
        <section className="reveal mb-20">
          <h2 className="text-4xl font-black text-[#071119] mb-8 border-l-8 border-[#415fdf] pl-6">Executive Summary</h2>
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <p className="text-lg text-gray-700 mb-6">
              This proposal outlines the comprehensive infrastructure that Omega UI provides. Unlike industry-standard systems that cost thousands per month for less functionality, we offer a unified ecosystem.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h4 className="font-bold text-[#415fdf] mb-3">Lead Automation</h4>
                <ul className="space-y-2 text-gray-600">
                  <li>▹ Cloud Connect suite</li>
                  <li>▹ Nationwide routing</li>
                  <li>▹ AI-assisted intake</li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-[#415fdf] mb-3">Attorney Platform</h4>
                <ul className="space-y-2 text-gray-600">
                  <li>▹ SynCloud Command Center</li>
                  <li>▹ Digital fingerprinting</li>
                  <li>▹ Referral tracking</li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-[#415fdf] mb-3">Marketing Suite</h4>
                <ul className="space-y-2 text-gray-600">
                  <li>▹ Automated campaigns</li>
                  <li>▹ QR code integration</li>
                  <li>▹ SEO optimization</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* System Architecture */}
        <section className="reveal mb-20">
          <h2 className="text-4xl font-black text-[#071119] mb-8 border-l-8 border-[#415fdf] pl-6">System Architecture</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: 'Cloud Connect',
                subtitle: 'Lead Engine',
                color: '#ea00ea',
                items: ['Intake surveys', 'Qualification logic', 'Funnel flows', 'Automations', 'Appointment booking']
              },
              {
                title: 'SynCloud',
                subtitle: 'Attorney Command Center',
                color: '#2699fe',
                items: ['Receives qualified leads', 'Logs acceptance', 'Digital Receipts', 'Review automations', 'Case tracking']
              },
              {
                title: 'Fingerprinting',
                subtitle: 'Attribution Layer',
                color: '#4bce2a',
                items: ['Originating URL', 'Referral Partners', 'Source Channel', 'Timestamp', 'State tracking']
              }
            ].map((system, idx) => (
              <div key={idx} className="bg-white rounded-2xl p-6 shadow-lg hover:scale-105 transition-transform" style={{ borderTop: `4px solid ${system.color}` }}>
                <h3 className="text-2xl font-bold mb-1" style={{ color: system.color }}>{system.title}</h3>
                <p className="text-sm text-gray-500 mb-4 font-semibold">{system.subtitle}</p>
                <ul className="space-y-2">
                  {system.items.map((item, i) => (
                    <li key={i} className="text-gray-600 text-sm flex items-start gap-2">
                      <span style={{ color: system.color }}>▹</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Lead Data Flow */}
        <section className="reveal mb-20">
          <h2 className="text-4xl font-black text-[#071119] mb-8 border-l-8 border-[#415fdf] pl-6">Lead Data Flow Process</h2>
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <p className="font-bold text-xl mb-6 text-[#415fdf]">End-to-End Automation</p>
            {[
              'Traffic enters through ads, social, or QR codes',
              'Digital fingerprinting applied immediately',
              'Qualification Survey: State, Fault, Injury, Representation',
              'Disqualified leads redirected',
              'Qualified leads routed to results page',
              'Cloud Connect creates lead & classification',
              'State-based attorney routing',
              'Webhook fires to SynCloud; Attorney accepts'
            ].map((step, idx) => (
              <div key={idx} className="flex items-start gap-4 mb-4">
                <div className="w-10 h-10 rounded-full bg-[#415fdf] text-white flex items-center justify-center font-bold flex-shrink-0">
                  {idx + 1}
                </div>
                <p className="text-gray-700 pt-2">{step}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Referral System */}
        <section className="reveal mb-20">
          <div className="proposal-gradient text-white rounded-2xl p-12 text-center">
            <h2 className="text-4xl font-black mb-4">Referral Partner System</h2>
            <p className="text-xl mb-8">Universal code system to track partner performance with precision</p>
            <div className="bg-white/10 border-2 border-dashed border-[#4bce2a] inline-block px-12 py-6 rounded-xl">
              <p className="text-[#4bce2a] font-mono text-4xl font-bold">REF: UCRASH-1001</p>
            </div>
            <p className="mt-8 text-white/80 max-w-2xl mx-auto">
              Code is detected via URL parameter, stored for 90 days, and injected into hidden fields. Matches partner to the correct $1,000 payout program.
            </p>
          </div>
        </section>

        {/* Competitive Value */}
        <section className="reveal mb-20">
          <h2 className="text-4xl font-black text-[#071119] mb-8 border-l-8 border-[#415fdf] pl-6">Competitive Value</h2>
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-[#071119] text-white">
                <tr>
                  <th className="px-6 py-4 text-left">Service / Tool</th>
                  <th className="px-6 py-4 text-left">Market Cost</th>
                  <th className="px-6 py-4 text-left">What Competitors Miss</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="px-6 py-4">Lead Providers (FindLaw, Avvo)</td>
                  <td className="px-6 py-4">$150–$500 per lead</td>
                  <td className="px-6 py-4 text-gray-600">No qualification or tracking</td>
                </tr>
                <tr className="border-b">
                  <td className="px-6 py-4">AI Intake Development</td>
                  <td className="px-6 py-4">$8,000–$15,000</td>
                  <td className="px-6 py-4 text-gray-600">No automation or routing</td>
                </tr>
                <tr className="border-b">
                  <td className="px-6 py-4">CRM (Salesforce/HubSpot)</td>
                  <td className="px-6 py-4">$400–$900/month</td>
                  <td className="px-6 py-4 text-gray-600">No legal intake logic</td>
                </tr>
                <tr className="border-b">
                  <td className="px-6 py-4">24/7 Staff Intake</td>
                  <td className="px-6 py-4">$3,000+/month</td>
                  <td className="px-6 py-4 text-gray-600">Not instant or consistent</td>
                </tr>
                <tr className="bg-[#415fdf]/10 border-t-2 border-[#415fdf]">
                  <td className="px-6 py-4 font-bold text-[#415fdf]">OMEGA UI SYSTEM</td>
                  <td className="px-6 py-4 font-bold text-[#415fdf]">INCLUDED</td>
                  <td className="px-6 py-4 font-bold text-[#415fdf]">Fully Integrated Ecosystem</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Omega Network Links */}
        <section className="reveal mb-20">
          <h2 className="text-4xl font-black text-[#071119] mb-8 border-l-8 border-[#415fdf] pl-6">Omega UI Network</h2>
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <p className="text-gray-700 mb-6">Explore the complete Omega UI ecosystem of tools and platforms:</p>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {[
                { name: 'Omega UI', url: 'https://www.omegaui.com' },
                { name: 'SynCloud', url: 'https://syncloud.omegaui.com' },
                { name: 'QR Generator', url: 'https://qr.omegaui.com' },
                { name: 'UI Tools', url: 'https://ui.omegaui.com' },
                { name: 'Cloud Convert', url: 'https://cloudconvert.omegaui.com' },
                { name: 'Chess', url: 'https://chess.omegaui.com' },
                { name: 'ABC Dashboard', url: 'https://www.ancdashboard.com' },
                { name: 'Echo', url: 'https://echo.omegaui.com' },
                { name: 'GLYTCH Functions', url: 'https://glytch.cloud/functions' },
                { name: 'GLYTCH', url: 'https://glytch.cloud' }
              ].map((link, idx) => (
                <a
                  key={idx}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-3 bg-gradient-to-r from-[#415fdf] to-[#899499] text-white rounded-lg text-center font-semibold hover:scale-105 transition-transform"
                >
                  {link.name}
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* Conclusion */}
        <section className="reveal text-center py-16">
          <h2 className="text-5xl font-black mb-6" style={{ color: '#d2d9f7' }}>Conclusion</h2>
          <p className="text-2xl text-gray-700 max-w-4xl mx-auto leading-relaxed">
            Omega UI is committed to powering uCrash's success and delivering an infrastructure unmatched in the legal-tech referral space. This ecosystem supports growth across all 50 states.
          </p>
        </section>
      </div>

      {/* Footer */}
      <footer className="bg-[#071119] text-white py-12 text-center">
        <img 
          src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/691be92ffa93cfd887f03662/ad2324a9c_background-ucrash-999kb.png" 
          alt="UCRASH Badge" 
          className="h-24 mx-auto mb-6"
        />
        <p className="text-xl font-bold mb-2">Omega UI, LLC | uCrash Integration Proposal</p>
        <p className="text-white/60">&copy; 2025 All Rights Reserved</p>
      </footer>
    </div>
  );
}