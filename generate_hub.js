const fs = require('fs');
const path = require('path');

const appsDir = path.join(__dirname, 'apps');
const outputFile = path.join(__dirname, 'index.html');

const getDirectories = source =>
  fs.readdirSync(source, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

const appList = getDirectories(appsDir);

const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SynCloud Connect | Command Center</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;500;700&display=swap" rel="stylesheet">
    <style>
        :root { --magenta: #ea00ea; --blue: #2699fe; --green: #4bce2a; --dark: #1a1a1a; --card: #262626; }
        body { background-color: var(--dark); color: #fff; font-family: 'Space Grotesk', sans-serif; overflow-x: hidden; }
        .grid-bg { background-image: linear-gradient(to right, #333 1px, transparent 1px), linear-gradient(to bottom, #333 1px, transparent 1px); background-size: 40px 40px; }
        .glass-card { background: rgba(38, 38, 38, 0.8); backdrop-filter: blur(12px); border: 1px solid rgba(255, 255, 255, 0.1); transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
        .glass-card:hover { border-color: var(--magenta); box-shadow: 0 0 30px rgba(234, 0, 234, 0.2); transform: scale(1.02); }
        .search-bar { background: rgba(255, 255, 255, 0.05); border: 1px solid var(--blue); }
        .glow-text { text-shadow: 0 0 10px var(--magenta); }
        .launch-btn { background: linear-gradient(90deg, var(--blue), #1a73e8); }
        .launch-btn:hover { background: var(--magenta); }
    </style>
</head>
<body class="grid-bg min-h-screen">
    <div class="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-[#ea00ea1a] to-transparent pointer-events-none"></div>

    <div class="relative z-10 p-6 lg:p-12">
        <header class="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div>
                <h1 class="text-6xl font-black tracking-tighter glow-text" style="color: var(--magenta)">OMEGA UI</h1>
                <p class="text-blue-400 font-mono tracking-widest uppercase text-sm mt-2">SynCloud Connect // Neural Network Hub</p>
            </div>
            <div class="w-full md:w-96">
                <input type="text" id="appSearch" placeholder="SEARCH REPOSITORY CLUSTER..." 
                       class="w-full p-4 rounded-none search-bar text-white font-mono focus:outline-none focus:ring-2 focus:ring-magenta-500">
            </div>
        </header>

        <main id="appGrid" class="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            ${appList.map(app => `
                <div class="glass-card p-6 rounded-sm flex flex-col justify-between h-48 group">
                    <div>
                        <div class="flex justify-between items-start mb-4">
                            <span class="text-[10px] font-mono text-green-400">ID: ${Math.random().toString(36).substr(2, 6).toUpperCase()}</span>
                            <div class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                        </div>
                        <h2 class="text-xl font-bold tracking-tight text-white group-hover:text-[#ea00ea] transition-colors">${app.replace(/-/g, ' ')}</h2>
                    </div>
                    <a href="./apps/${app}/index.html" class="launch-btn w-full py-2 text-center text-xs font-black tracking-widest transition-all">TERMINAL_LAUNCH</a>
                </div>
            `).join('')}
        </main>
    </div>

    <script>
        const search = document.getElementById('appSearch');
        const cards = document.querySelectorAll('.glass-card');

        search.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase();
            cards.forEach(card => {
                const name = card.querySelector('h2').innerText.toLowerCase();
                card.style.display = name.includes(term) ? 'flex' : 'none';
            });
        });
    </script>
</body>
</html>
`;

fs.writeFileSync(outputFile, htmlContent);
console.log('✅ Tech-Spec Hub Generated Successfully.');