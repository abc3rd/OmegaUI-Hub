const fs = require('fs');
const path = require('path');

const appsDir = path.join(__dirname, 'apps');
const siteUrl = "https://www.syncloudconnect.com";

// 1. DELETE THE ENTIRE APPS FOLDER (Fresh Start)
if (fs.existsSync(appsDir)) {
    fs.rmSync(appsDir, { recursive: true, force: true });
    console.log("🗑️ Deleted old /apps folder. Starting fresh...");
}

// 2. DEFINE THE 83 APP NAMES (Short list for example, add your full list here)
const appFolders = [
    'ucp-runner', 'ucp-interpreter', 'legendary-leads', 'legendatabase', 
    'cloud-connect', 'syncloud-core', 'abc-dashboard', 'glytch-bridge'
    // ... add all 83 folder names here
];

fs.mkdirSync(appsDir);

appFolders.forEach(app => {
    const folderPath = path.join(appsDir, app);
    fs.mkdirSync(folderPath);

    // DYNAMIC FILENAME (Prevents index.html routing conflict)
    const fileName = `${app}.html`;
    const filePath = path.join(folderPath, fileName);

    // OPTIMIZED TEMPLATE
    const content = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${app.toUpperCase()} | Universal Command Protocol | Omega UI</title>
    <meta name="description" content="Official ${app} interface for SynCloud Connect. Zero-waste AI infrastructure powered by UCP.">
    <link rel="canonical" href="${siteUrl}/apps/${app}/${fileName}">
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-[#0a0b0e] text-gray-400 p-8 md:p-16">
    <header class="max-w-4xl mx-auto border-b border-white/5 pb-8 mb-12">
        <h1 class="text-4xl font-black text-white uppercase tracking-tighter">${app.replace(/-/g, ' ')}</h1>
        <p class="text-magenta text-[10px] font-black uppercase tracking-[0.3em] mt-2">UCP Deterministic Layer Active</p>
    </header>

    <main class="max-w-4xl mx-auto">
        <section class="bg-white/5 p-10 rounded-[2.5rem] border border-white/10 mb-12">
            <h2 class="text-xl font-bold text-white mb-4 uppercase italic">Deterministic Job</h2>
            <p class="leading-relaxed mb-6">
                The <strong>${app}</strong> module is a vital component of the Omega UI ecosystem. 
                By utilizing the <strong>Universal Command Protocol (UCP)</strong>, this application transitions from 
                probabilistic AI prompting to deterministic machine execution.
            </p>
            <div class="grid grid-cols-2 gap-4">
                <div class="p-4 bg-black/40 rounded-2xl border border-white/5 text-[10px] font-mono text-blue-400 uppercase tracking-widest">
                    // Token Waste: -90%
                </div>
                <div class="p-4 bg-black/40 rounded-2xl border border-white/5 text-[10px] font-mono text-green-400 uppercase tracking-widest">
                    // Energy Efficiency: 99%
                </div>
            </div>
        </section>

        <div class="h-64 rounded-[2.5rem] border-2 border-dashed border-white/10 flex items-center justify-center">
            <span class="text-[10px] font-black uppercase tracking-[0.5em] opacity-20 italic">Interface Container 01</span>
        </div>
    </main>

    <footer class="max-w-4xl mx-auto mt-20 pt-10 border-t border-white/5 flex justify-between">
        <a href="/" class="text-[10px] font-black uppercase tracking-widest hover:text-white transition-all italic">← Hub Core</a>
        <span class="text-[9px] text-gray-600 font-mono italic">OMEGA UI, LLC // 2026</span>
    </footer>
</body>
</html>`;

    fs.writeFileSync(filePath, content);
    console.log(`🚀 Created & Optimized: /apps/${app}/${fileName}`);
});

console.log("\n✅ ALL 83 APPS REBUILT WITH PERFECT SEO & ROUTING.");