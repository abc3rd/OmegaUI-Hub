const fs = require('fs');
const path = require('path');

const appsDir = path.join(__dirname, 'apps');
const outputFile = path.join(__dirname, 'dashboard.html');

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
    <title>Omega UI | Command Center</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        :root { --magenta: #ea00ea; --blue: #2699fe; --dark: #121212; }
        body { background: var(--dark); color: white; font-family: sans-serif; }
        .glass-card { background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); transition: 0.3s; }
        .glass-card:hover { border-color: var(--magenta); transform: translateY(-5px); }
    </style>
</head>
<body class="p-8">
    <script src="/global-nav.js"></script>
    
    <header class="max-w-7xl mx-auto mb-12">
        <h1 class="text-4xl font-black" style="color: var(--magenta)">COMMAND CENTER</h1>
        <input type="text" id="search" placeholder="Filter 83 Apps..." class="w-full mt-6 p-4 bg-white/5 border border-blue-500 text-white outline-none">
    </header>

    <main id="grid" class="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        ${appList.map(app => `
            <div class="glass-card p-6 rounded-lg">
                <h3 class="text-lg font-bold mb-4 uppercase truncate">${app.replace(/-/g, ' ')}</h3>
                <a href="/apps/${app}/" class="block text-center py-2 rounded font-bold" style="background: var(--blue)">LAUNCH APP</a>
            </div>
        `).join('')}
    </main>

    <script>
        document.getElementById('search').addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase();
            document.querySelectorAll('.glass-card').forEach(card => {
                card.style.display = card.innerText.toLowerCase().includes(term) ? 'block' : 'none';
            });
        });
    </script>
</body>
</html>
`;

fs.writeFileSync(outputFile, htmlContent);
console.log('✅ Dashboard updated: Buttons now set to "LAUNCH APP"');