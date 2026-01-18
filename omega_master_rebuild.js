const fs = require('fs');
const path = require('path');

const appsDir = path.join(__dirname, 'apps');
const siteUrl = "https://www.syncloudconnect.com";

// 1. DELETE THE ENTIRE APPS FOLDER (Fresh Start to Clear Legacy Errors)
if (fs.existsSync(appsDir)) {
    fs.rmSync(appsDir, { recursive: true, force: true });
    console.log("🗑️ Deleted old /apps folder. Starting fresh...");
}

// 2. DEFINE THE 83 APP NAMES
const appFolders = [
    'ucp-runner', 'ucp-interpreter', 'legendary-leads', 'legendatabase', 'cloud-connect',
    'syncloud-core', 'abc-dashboard', 'glytch-bridge', 'cloud-collect', 'face-2-face',
    'ucp-ai-router', 'cloud-ucp-protocol', 'ucp-granite-demo', 'omni-sync', 'data-vault',
    'lead-gen-pro', 'smart-routing', 'token-monitor', 'energy-audit-ai', 'logic-gate',
    'semantic-cache', 'driver-nexus', 'edge-compute', 'handshake-auth', 'packet-verify',
    'omega-bridge', 'syn-node', 'connect-api', 'ucp-validator', 'protocol-master',
    'lead-flow', 'database-sync', 'cloud-storage', 'ai-optimizer', 'token-reclaimer',
    'zero-waste-ui', 'deterministic-engine', 'intelligence-hub', 'enterprise-bridge', 'nexus-core',
    'relay-station', 'signal-booster', 'data-refinery', 'insight-panel', 'action-center',
    'command-console', 'ucp-sdk', 'developer-portal', 'api-gateway', 'mesh-network',
    'cloud-fabric', 'logic-stream', 'process-auto', 'workflow-sync', 'task-master',
    'event-handler', 'queue-manager', 'load-balancer', 'security-shield', 'access-control',
    'identity-vault', 'audit-log', 'performance-metric', 'resource-monitor', 'billing-sync',
    'support-portal', 'training-hub', 'doc-center', 'community-node', 'feedback-loop',
    'beta-tester', 'early-access', 'legacy-bridge', 'migration-tool', 'import-export',
    'backup-service', 'recovery-node', 'monitoring-agent', 'alert-system', 'notify-hub',
    'syncloud-mobile', 'syncloud-desktop', 'syncloud-web'
];

fs.mkdirSync(appsDir);

appFolders.forEach(app => {
    const folderPath = path.join(appsDir, app);
    fs.mkdirSync(folderPath);

    // UNIQUE FILENAME (Prevents index.html routing conflict with Vercel)
    const fileName = `${app}.html`;
    const filePath = path.join(folderPath, fileName);

    // OPTIMIZED SEO & CONTENT TEMPLATE
    const content = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${app.toUpperCase()} | UCP Deterministic Module | Omega UI</title>
    <meta name="description" content="Official ${app} interface for SynCloud Connect. Zero-waste AI infrastructure powered by the Universal Command Protocol (UCP).">
    <link rel="canonical" href="${siteUrl}/apps/${app}/${fileName}">
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-[#0a0b0e] text-gray-400 p-8 md:p-16">
    <header class="max-w-4xl mx-auto border-b border-white/5 pb-8 mb-12">
        <h1 class="text-4xl font-black text-white uppercase tracking-tighter">${app.replace(/-/g, ' ')}</h1>
        <p class="text-magenta text-[10px] font-black uppercase tracking-[0.3em] mt-2">UCP Verification: Operational</p>
    </header>

    <main class="max-w-4xl mx-auto">
        <section class="bg-white/5 p-10 rounded-[2.5rem] border border-white/10 mb-12">
            <h2 class="text-xl font-bold text-white mb-4 uppercase italic">Deterministic Job</h2>
            <p class="leading-relaxed mb-6">
                The <strong>${app}</strong> application is a specialized module under the Omega UI, LLC corporate umbrella. 
                By utilizing the <strong>Universal Command Protocol (UCP)</strong>, this interface executes commands through a deterministic 4-layer stack rather than probabilistic AI prompting.
            </p>
            <p class="text-sm text-gray-500 mb-6 italic">This architectural shift allows enterprises to slash token consumption by up to 90% while reducing thermal loads and energy costs.</p>
            
            <div class="grid grid-cols-2 gap-4">
                <div class="p-4 bg-black/40 rounded-2xl border border-white/5 text-[10px] font-mono text-blue-400 uppercase tracking-widest">
                    // Token Recovery: 90%
                </div>
                <div class="p-4 bg-black/40 rounded-2xl border border-white/5 text-[10px] font-mono text-green-400 uppercase tracking-widest">
                    // Energy Delta: -99%
                </div>
            </div>
        </section>

        <div class="h-64 rounded-[2.5rem] border-2 border-dashed border-white/10 flex items-center justify-center bg-grid">
            <span class="text-[10px] font-black uppercase tracking-[0.5em] opacity-20 italic">${app} logic container</span>
        </div>
    </main>

    <footer class="max-w-4xl mx-auto mt-20 pt-10 border-t border-white/5 flex justify-between items-center">
        <a href="/" class="text-[10px] font-black uppercase tracking-widest hover:text-white transition-all italic">← Hub Core</a>
        <div class="text-right">
            <p class="text-[9px] text-gray-600 font-mono tracking-widest">OMEGA UI, LLC // 2026</p>
            <p class="text-[8px] text-gray-700 uppercase mt-1">Fort Myers, FL</p>
        </div>
    </footer>
</body>
</html>`;

    fs.writeFileSync(filePath, content);
    console.log(`🚀 Rebuilt: /apps/${app}/${fileName}`);
});

console.log("\n✅ ALL 83 APPS CLEANED, REBUILT, AND SEO-OPTIMIZED.");