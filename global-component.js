/**
 * OMEGA UI // CONSOLIDATED DEPLOYMENT SCRIPT 2026
 * Root: syncloudconnect.com
 */

const OMEGA_CONFIG = {
    header: `
    <header class="sticky top-0 z-50 bg-[#0a0b0e]/95 backdrop-blur-lg border-b border-white/5">
        <div class="max-w-7xl mx-auto px-4 md:px-6 h-20 flex items-center justify-between">
            <a href="index.html" class="flex items-center space-x-3">
                <div class="w-9 h-9 bg-[#ea00ea] rounded-lg flex items-center justify-center font-black text-white text-lg shadow-[0_0_15px_rgba(234,0,234,0.3)]">Ω</div>
                <div class="flex flex-col leading-tight">
                    <span class="text-white font-black text-lg tracking-tighter uppercase">OMEGA UI</span>
                    <span class="text-[#2699fe] font-bold text-[9px] tracking-[0.2em] uppercase">UCP Standard</span>
                </div>
            </a>
            <nav class="hidden lg:flex items-center space-x-8 text-[10px] font-extrabold uppercase tracking-widest text-gray-400">
                <a href="our-technology.html" class="hover:text-[#ea00ea] transition-colors">Technology</a>
                <a href="ai-roi-cost-recovery.html" class="hover:text-[#ea00ea] transition-colors">ROI Center</a>
                <a href="secure-ai-infrastructure.html" class="hover:text-[#ea00ea] transition-colors">Security</a>
                <a href="zero-waste-ai-sustainability.html" class="hover:text-[#ea00ea] transition-colors">Sustainability</a>
                <a href="legal.html" class="hover:text-[#ea00ea] transition-colors">Legal</a>
            </nav>
            <button id="mobile-menu-toggle" class="lg:hidden text-gray-400 focus:outline-none">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 6h16M4 12h16m-7 6h7" stroke-width="2" stroke-linecap="round"/></svg>
            </button>
        </div>
        <div id="mobile-menu" class="hidden lg:hidden bg-[#0a0b0e] border-b border-white/10 p-8 space-y-6 text-center">
            <nav class="flex flex-col space-y-6 text-xs font-bold uppercase tracking-widest text-gray-400">
                <a href="our-technology.html">Technology</a>
                <a href="ai-roi-cost-recovery.html">ROI Center</a>
                <a href="secure-ai-infrastructure.html">Security</a>
                <a href="zero-waste-ai-sustainability.html">Sustainability</a>
                <a href="legal.html">Legal</a>
            </nav>
        </div>
    </header>`,
    footer: `
    <footer class="bg-[#0a0b0e] border-t border-white/5 pt-24 pb-12 px-6">
        <div class="max-w-7xl mx-auto">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-20">
                <div class="lg:col-span-2">
                    <div class="w-10 h-10 bg-[#ea00ea] rounded flex items-center justify-center font-black text-white text-xl mb-6">Ω</div>
                    <p class="text-[10px] font-bold uppercase tracking-widest text-gray-500 leading-relaxed max-w-sm">
                        Omega UI, LLC // Architecting zero-waste AI infrastructure through the UCP standard.
                    </p>
                </div>
                <div>
                    <h4 class="text-[10px] font-black uppercase text-[#ea00ea] tracking-[0.4em] mb-8">HQ</h4>
                    <div class="text-[10px] font-bold uppercase tracking-widest text-gray-500 space-y-2">
                        <p>2744 Edison Avenue, Unit-7 Suite C-3</p>
                        <p>Fort Myers, FL 33916</p>
                        <p class="text-white pt-2 font-black">+1 941-882-0130</p>
                    </div>
                </div>
            </div>
            <div class="border-t border-white/5 pt-12 flex justify-between items-center text-[9px] font-mono text-gray-700 uppercase tracking-[0.4em]">
                <span>© 2026 OMEGA UI, LLC // U.S. Patent Pending</span>
                <span class="text-[#4bce2a]">G-D1N75W37BQ // Status: Nominal</span>
            </div>
        </div>
    </footer>`,
    meta: {
        "index.html": { title: "SynCloud Connect | UCP Standard by Omega UI", desc: "The all-in-one hub for deterministic AI. Detokenize your enterprise." },
        "our-technology.html": { title: "UCP Technology | 4-Layer Architecture", desc: "Explore the 4-layer stack for deterministic AI and token reclamation." },
        "ai-roi-cost-recovery.html": { title: "AI ROI & Cost Recovery | Omega UI", desc: "Calculate your enterprise AI waste and stop the Drift Tax." },
        "secure-ai-infrastructure.html": { title: "Secure AI Infrastructure | HMAC Handshake", desc: "Verify intent before execution. Cryptographic AI security." },
        "zero-waste-ai-sustainability.html": { title: "Zero-Waste AI | Green AI Sustainability", desc: "Achieve 99% energy reduction via UCP semantic caching." }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    // Inject UI
    if(document.getElementById('app-header')) document.getElementById('app-header').innerHTML = OMEGA_CONFIG.header;
    if(document.getElementById('app-footer')) document.getElementById('app-footer').innerHTML = OMEGA_CONFIG.footer;

    // Mobile Menu Toggle
    const toggle = document.getElementById('mobile-menu-toggle');
    const menu = document.getElementById('mobile-menu');
    toggle?.addEventListener('click', () => menu.classList.toggle('hidden'));

    // Dynamic SEO
    const filename = window.location.pathname.split('/').pop() || "index.html";
    const seo = OMEGA_CONFIG.meta[filename] || OMEGA_CONFIG.meta["index.html"];
    document.title = seo.title;
    document.querySelector('meta[name="description"]')?.setAttribute("content", seo.desc);
});