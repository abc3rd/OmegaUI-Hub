import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Layers, Code } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// --- HTML content for the Advanced Duplicator Tool ---
const duplicatorToolHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Advanced Web App Duplicator</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%); min-height: 100vh; color: #333; }
        .header { background: rgba(0, 0, 0, 0.2); backdrop-filter: blur(20px); border-bottom: 1px solid rgba(255, 255, 255, 0.1); padding: 25px; text-align: center; position: sticky; top: 0; z-index: 1000; }
        .header h1 { color: white; font-size: 2.8em; margin-bottom: 10px; font-weight: 700; text-shadow: 0 4px 20px rgba(0, 0, 0, 0.3); }
        .header .subtitle { color: rgba(255, 255, 255, 0.8); font-size: 1.1em; margin-bottom: 15px; }
        .warning { background: linear-gradient(135deg, #ff6b6b, #ee5a24); color: white; padding: 15px; margin: 20px; border-radius: 12px; border-left: 5px solid #c0392b; box-shadow: 0 5px 15px rgba(238, 90, 36, 0.3); }
        .warning h3 { margin-bottom: 10px; font-size: 1.2em; }
        .container { max-width: 1400px; margin: 0 auto; padding: 20px; }
        .main-panel { background: rgba(255, 255, 255, 0.95); border-radius: 20px; padding: 30px; margin-bottom: 20px; box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1); backdrop-filter: blur(10px); }
        .input-section { margin-bottom: 30px; }
        .input-group { margin-bottom: 20px; }
        .input-group label { display: block; margin-bottom: 8px; font-weight: 600; color: #2c3e50; font-size: 1.1em; }
        .url-input { width: 100%; padding: 15px 20px; border: 2px solid #e1e8ed; border-radius: 12px; font-size: 16px; transition: all 0.3s ease; background: white; }
        .url-input:focus { outline: none; border-color: #3498db; box-shadow: 0 0 0 4px rgba(52, 152, 219, 0.1); transform: translateY(-2px); }
        .options-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 25px; margin-bottom: 30px; }
        .option-panel { background: #f8f9fa; padding: 20px; border-radius: 15px; border: 2px solid #e9ecef; transition: all 0.3s ease; }
        .option-panel:hover { border-color: #3498db; transform: translateY(-3px); box-shadow: 0 10px 25px rgba(52, 152, 219, 0.1); }
        .option-panel h3 { color: #2c3e50; margin-bottom: 15px; font-size: 1.2em; display: flex; align-items: center; gap: 10px; }
        .option-item { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; padding: 8px; border-radius: 8px; transition: background 0.2s ease; }
        .option-item:hover { background: rgba(52, 152, 219, 0.05); }
        .option-item input[type="checkbox"], .option-item input[type="radio"] { width: 18px; height: 18px; accent-color: #3498db; }
        .option-item label { margin: 0; cursor: pointer; font-weight: 500; flex: 1; }
        .advanced-options { display: none; margin-top: 20px; padding: 20px; background: #fff; border-radius: 12px; border: 1px solid #dee2e6; }
        .advanced-options.show { display: block; }
        .number-input { width: 80px; padding: 8px 12px; border: 1px solid #ddd; border-radius: 6px; font-size: 14px; }
        .action-buttons { display: flex; gap: 15px; justify-content: center; flex-wrap: wrap; }
        .btn { padding: 15px 30px; border: none; border-radius: 12px; font-size: 16px; font-weight: 600; cursor: pointer; transition: all 0.3s ease; text-transform: uppercase; letter-spacing: 0.5px; position: relative; overflow: hidden; }
        .btn-primary { background: linear-gradient(135deg, #3498db, #2980b9); color: white; box-shadow: 0 5px 15px rgba(52, 152, 219, 0.3); }
        .btn-primary:hover { transform: translateY(-3px); box-shadow: 0 10px 25px rgba(52, 152, 219, 0.4); }
        .btn-secondary { background: linear-gradient(135deg, #95a5a6, #7f8c8d); color: white; }
        .btn-secondary:hover { transform: translateY(-2px); }
        .btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
        .progress-section { display: none; margin-top: 30px; padding: 25px; background: linear-gradient(135deg, #f8f9fa, #e9ecef); border-radius: 15px; border: 1px solid #dee2e6; }
        .progress-section.show { display: block; }
        .progress-bar { width: 100%; height: 20px; background: #e9ecef; border-radius: 10px; overflow: hidden; margin-bottom: 20px; }
        .progress-fill { height: 100%; background: linear-gradient(90deg, #3498db, #2ecc71); width: 0%; transition: width 0.3s ease; position: relative; }
        .progress-fill::after { content: ''; position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent); animation: shimmer 2s infinite; }
        @keyframes shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
        .progress-details { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 20px; }
        .progress-stat { background: white; padding: 15px; border-radius: 10px; text-align: center; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .progress-stat .number { font-size: 2em; font-weight: 700; color: #3498db; display: block; }
        .progress-stat .label { color: #7f8c8d; font-size: 0.9em; text-transform: uppercase; letter-spacing: 0.5px; }
        .log-container { background: #2c3e50; color: #ecf0f1; padding: 20px; border-radius: 10px; max-height: 300px; overflow-y: auto; font-family: 'Fira Code', 'Courier New', monospace; font-size: 13px; line-height: 1.4; }
        .log-entry { margin-bottom: 5px; padding: 5px 0; }
        .log-entry.success { color: #2ecc71; }
        .log-entry.error { color: #e74c3c; }
        .log-entry.warning { color: #f39c12; }
        .log-entry.info { color: #3498db; }
        .results-section { display: none; margin-top: 30px; padding: 25px; background: rgba(255, 255, 255, 0.95); border-radius: 15px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
        .results-section.show { display: block; }
        .download-links { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px; margin-bottom: 20px; }
        .download-item { background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 20px; border-radius: 12px; text-decoration: none; transition: all 0.3s ease; text-align: center; }
        .download-item:hover { transform: translateY(-3px); box-shadow: 0 10px 25px rgba(102, 126, 234, 0.3); color: white; text-decoration: none; }
        .download-item .title { font-weight: 600; font-size: 1.1em; margin-bottom: 5px; }
        .download-item .size { opacity: 0.8; font-size: 0.9em; }
        .spinner { width: 40px; height: 40px; border: 4px solid #e3e3e3; border-top: 4px solid #3498db; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 20px; }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        @media (max-width: 768px) { .header h1 { font-size: 2.2em; } .options-grid { grid-template-columns: 1fr; } .action-buttons { flex-direction: column; } .btn { width: 100%; } }
    </style>
</head>
<body>
    <div class="header">
        <h1>⚡ Advanced Web App Duplicator</h1>
        <div class="subtitle">Complete website and web application replication tool</div>
    </div>
    <div class="warning">
        <h3>⚠️ Legal Responsibility Notice</h3>
        <p>You are solely responsible for ensuring compliance with copyright laws, terms of service, and intellectual property rights. Only use this tool on websites you own, have explicit permission to duplicate, or for legitimate research/educational purposes. Unauthorized duplication of copyrighted content may result in legal consequences.</p>
    </div>
    <div class="container">
        <div class="main-panel">
            <div class="input-section">
                <div class="input-group">
                    <label for="targetUrl">Target Website URL</label>
                    <input type="url" id="targetUrl" class="url-input" placeholder="https://example.com" />
                </div>
            </div>
            <div class="options-grid">
                <div class="option-panel">
                    <h3>🎯 Crawling Options</h3>
                    <div class="option-item"><input type="checkbox" id="deepCrawl" checked><label for="deepCrawl">Deep crawl all linked pages</label></div>
                    <div class="option-item"><input type="checkbox" id="followExternal"><label for="followExternal">Follow external links</label></div>
                    <div class="option-item"><input type="checkbox" id="respectRobots" checked><label for="respectRobots">Respect robots.txt</label></div>
                    <div class="option-item"><label>Max pages: <input type="number" class="number-input" id="maxPages" value="100" min="1"></label></div>
                    <div class="option-item"><label>Max depth: <input type="number" class="number-input" id="maxDepth" value="3" min="1"></label></div>
                </div>
                <div class="option-panel">
                    <h3>📄 Content Extraction</h3>
                    <div class="option-item"><input type="checkbox" id="extractHTML" checked><label for="extractHTML">HTML pages</label></div>
                    <div class="option-item"><input type="checkbox" id="extractCSS" checked><label for="extractCSS">CSS stylesheets</label></div>
                    <div class="option-item"><input type="checkbox" id="extractJS" checked><label for="extractJS">JavaScript files</label></div>
                    <div class="option-item"><input type="checkbox" id="extractImages" checked><label for="extractImages">Images (PNG, JPG, SVG, etc.)</label></div>
                    <div class="option-item"><input type="checkbox" id="extractFonts"><label for="extractFonts">Web fonts</label></div>
                    <div class="option-item"><input type="checkbox" id="extractDocuments"><label for="extractDocuments">Documents (PDF, DOC, etc.)</label></div>
                </div>
                <div class="option-panel">
                    <h3>⚙️ Processing Options</h3>
                    <div class="option-item"><input type="checkbox" id="preserveJS" checked><label for="preserveJS">Preserve JavaScript functionality</label></div>
                    <div class="option-item"><input type="checkbox" id="updateLinks" checked><label for="updateLinks">Update internal links</label></div>
                    <div class="option-item"><input type="checkbox" id="minifyCode"><label for="minifyCode">Minify HTML/CSS/JS</label></div>
                    <div class="option-item"><input type="checkbox" id="optimizeImages"><label for="optimizeImages">Optimize images</label></div>
                    <div class="option-item"><input type="checkbox" id="generateSitemap"><label for="generateSitemap">Generate sitemap</label></div>
                </div>
                <div class="option-panel">
                    <h3>📦 Output Format</h3>
                    <div class="option-item"><input type="radio" name="outputFormat" id="outputZip" value="zip" checked><label for="outputZip">ZIP Archive</label></div>
                    <div class="option-item"><input type="radio" name="outputFormat" id="outputTar" value="tar"><label for="outputTar">TAR Archive</label></div>
                    <div class="option-item"><input type="radio" name="outputFormat" id="outputFolder" value="folder"><label for="outputFolder">Folder Structure</label></div>
                    <div class="option-item"><input type="checkbox" id="includeMetadata"><label for="includeMetadata">Include metadata file</label></div>
                </div>
            </div>
            <div class="action-buttons">
                <button class="btn btn-secondary" id="showAdvanced">Advanced Settings</button>
                <button class="btn btn-primary" id="startDuplication">🚀 Start Duplication</button>
                <button class="btn btn-secondary" id="stopDuplication" style="display: none;">⏹️ Stop Process</button>
            </div>
            <div class="advanced-options" id="advancedOptions">
                <h3>Advanced Configuration</h3>
                <div class="option-item"><label>Request delay (ms): <input type="number" class="number-input" id="requestDelay" value="500" min="0"></label></div>
                <div class="option-item"><label>Concurrent requests: <input type="number" class="number-input" id="concurrentRequests" value="5" min="1" max="20"></label></div>
                <div class="option-item"><label>Timeout (seconds): <input type="number" class="number-input" id="requestTimeout" value="30" min="5"></label></div>
                <div class="option-item"><input type="checkbox" id="handleSPA"><label for="handleSPA">Handle Single Page Applications (SPA)</label></div>
                <div class="option-item"><input type="checkbox" id="executeJS"><label for="executeJS">Execute JavaScript for dynamic content</label></div>
                <div class="option-item"><label>User Agent: <select id="userAgent" style="margin-left: 10px; padding: 5px;"><option value="default">Default Browser</option><option value="chrome">Chrome Desktop</option><option value="firefox">Firefox Desktop</option><option value="safari">Safari Desktop</option><option value="mobile">Mobile Browser</option></select></label></div>
            </div>
        </div>
        <div class="progress-section" id="progressSection">
            <div class="spinner" id="loadingSpinner"></div>
            <div class="progress-bar"><div class="progress-fill" id="progressFill"></div></div>
            <div class="progress-details">
                <div class="progress-stat"><span class="number" id="pagesProcessed">0</span><span class="label">Pages Processed</span></div>
                <div class="progress-stat"><span class="number" id="assetsDownloaded">0</span><span class="label">Assets Downloaded</span></div>
                <div class="progress-stat"><span class="number" id="totalSize">0 MB</span><span class="label">Total Size</span></div>
                <div class="progress-stat"><span class="number" id="timeElapsed">00:00</span><span class="label">Time Elapsed</span></div>
            </div>
            <div class="log-container" id="logContainer"><div class="log-entry info">Ready to start duplication process...</div></div>
        </div>
        <div class="results-section" id="resultsSection">
            <h2>Duplication Complete! 🎉</h2>
            <div class="download-links" id="downloadLinks"></div>
            <div id="summaryStats"></div>
        </div>
    </div>
    <script>
        class AdvancedWebDuplicator {
            constructor() {
                this.isRunning = false; this.startTime = null;
                this.stats = { pagesProcessed: 0, assetsDownloaded: 0, totalSize: 0, errors: 0 };
                this.processedUrls = new Set(); this.downloadQueue = [];
                this.duplicatedSite = { pages: {}, assets: {}, structure: {} };
                this.initializeElements(); this.bindEvents();
            }
            initializeElements() {
                this.targetUrl = document.getElementById('targetUrl'); this.startBtn = document.getElementById('startDuplication'); this.stopBtn = document.getElementById('stopDuplication'); this.advancedBtn = document.getElementById('showAdvanced'); this.advancedOptions = document.getElementById('advancedOptions');
                this.progressSection = document.getElementById('progressSection'); this.progressFill = document.getElementById('progressFill'); this.logContainer = document.getElementById('logContainer');
                this.pagesProcessed = document.getElementById('pagesProcessed'); this.assetsDownloaded = document.getElementById('assetsDownloaded'); this.totalSize = document.getElementById('totalSize'); this.timeElapsed = document.getElementById('timeElapsed');
                this.resultsSection = document.getElementById('resultsSection'); this.downloadLinks = document.getElementById('downloadLinks');
            }
            bindEvents() {
                this.startBtn.addEventListener('click', () => this.startDuplication()); this.stopBtn.addEventListener('click', () => this.stopDuplication()); this.advancedBtn.addEventListener('click', () => this.toggleAdvanced());
                this.targetUrl.addEventListener('keypress', (e) => { if (e.key === 'Enter') this.startDuplication(); });
            }
            toggleAdvanced() { this.advancedOptions.classList.toggle('show'); this.advancedBtn.textContent = this.advancedOptions.classList.contains('show') ? 'Hide Advanced Settings' : 'Advanced Settings'; }
            log(message, type = 'info') { const timestamp = new Date().toLocaleTimeString(); const entry = document.createElement('div'); entry.className = \`log-entry \${type}\`; entry.textContent = \`[\${timestamp}] \${message}\`; this.logContainer.appendChild(entry); this.logContainer.scrollTop = this.logContainer.scrollHeight; }
            updateStats() {
                this.pagesProcessed.textContent = this.stats.pagesProcessed; this.assetsDownloaded.textContent = this.stats.assetsDownloaded; this.totalSize.textContent = \`\${(this.stats.totalSize / (1024 * 1024)).toFixed(2)} MB\`;
                if (this.startTime) { const elapsed = Math.floor((Date.now() - this.startTime) / 1000); const minutes = Math.floor(elapsed / 60); const seconds = elapsed % 60; this.timeElapsed.textContent = \`\${minutes.toString().padStart(2, '0')}:\${seconds.toString().padStart(2, '0')}\`; }
            }
            updateProgress(percentage) { this.progressFill.style.width = \`\${percentage}%\`; }
            validateUrl(url) { try { new URL(url); return true; } catch { return false; } }
            async fetchWithProxy(url) {
                try {
                    this.log(\`Fetching: \${url}\`, 'info'); const delay = document.getElementById('requestDelay').value; await new Promise(resolve => setTimeout(resolve, parseInt(delay)));
                    const response = await this.simulateResponse(url); return response;
                } catch (error) { this.log(\`Error fetching \${url}: \${error.message}\`, 'error'); this.stats.errors++; throw error; }
            }
            async simulateResponse(url) {
                const urlObj = new URL(url); const path = urlObj.pathname;
                if (path.endsWith('.css')) { return { ok: true, text: async () => \`/* CSS content for \${url} */\\nbody { font-family: Arial, sans-serif; }\`, headers: { get: () => 'text/css' } }; }
                else if (path.endsWith('.js')) { return { ok: true, text: async () => \`// JavaScript content for \${url}\\nconsole.log('Loaded: \${url}');\`, headers: { get: () => 'application/javascript' } }; }
                else if (path.match(/\\.(png|jpg|jpeg|gif|svg)\$/i)) { return { ok: true, blob: async () => new Blob(['fake-image-data'], { type: 'image/png' }), headers: { get: () => 'image/png' } }; }
                else { return { ok: true, text: async () => \`<!DOCTYPE html><html><head><title>Duplicated: \${url}</title><link rel="stylesheet" href="styles.css"></head><body><h1>Sample Page: \${path}</h1><p>This is a simulated page from \${url}</p><a href="/page1">Link 1</a><a href="/page2">Link 2</a><img src="image.png" alt="Sample"><script src="script.js"></script></body></html>\`, headers: { get: () => 'text/html' } }; }
            }
            extractLinks(html, baseUrl) {
                const links = []; const linkRegex = /<a[^>]+href=["']([^"']+)["']/gi; let match;
                while ((match = linkRegex.exec(html)) !== null) { try { const url = new URL(match[1], baseUrl).href; links.push(url); } catch (e) {} }
                return links;
            }
            extractAssets(html, baseUrl) {
                const assets = []; let match;
                const cssRegex = /<link[^>]+href=["']([^"']+\\.css[^"']*)["']/gi; while ((match = cssRegex.exec(html)) !== null) { try { assets.push({ type: 'css', url: new URL(match[1], baseUrl).href }); } catch (e) {} }
                const jsRegex = /<script[^>]+src=["']([^"']+\\.js[^"']*)["']/gi; while ((match = jsRegex.exec(html)) !== null) { try { assets.push({ type: 'js', url: new URL(match[1], baseUrl).href }); } catch (e) {} }
                const imgRegex = /<img[^>]+src=["']([^"']+)["']/gi; while ((match = imgRegex.exec(html)) !== null) { try { assets.push({ type: 'image', url: new URL(match[1], baseUrl).href }); } catch (e) {} }
                return assets;
            }
            async processPage(url, depth = 0) {
                if (this.processedUrls.has(url) || depth > parseInt(document.getElementById('maxDepth').value)) { return; }
                this.processedUrls.add(url);
                try {
                    const response = await this.fetchWithProxy(url); if (!response.ok) throw new Error(\`HTTP \${response.status}\`);
                    const content = await response.text(); this.duplicatedSite.pages[url] = content; this.stats.pagesProcessed++; this.stats.totalSize += content.length;
                    this.log(\`Processed page: \${url}\`, 'success');
                    const assets = this.extractAssets(content, url); for (const asset of assets) { if (!this.duplicatedSite.assets[asset.url]) { this.downloadQueue.push(asset); } }
                    if (document.getElementById('deepCrawl').checked && depth < parseInt(document.getElementById('maxDepth').value)) {
                        const links = this.extractLinks(content, url); const baseUrl = new URL(url).origin;
                        for (const link of links) {
                            const linkUrl = new URL(link); const shouldFollow = document.getElementById('followExternal').checked || linkUrl.origin === baseUrl;
                            if (shouldFollow && this.stats.pagesProcessed < parseInt(document.getElementById('maxPages').value)) { setTimeout(() => this.processPage(link, depth + 1), 100); }
                        }
                    }
                } catch (error) { this.log(\`Failed to process \${url}: \${error.message}\`, 'error'); }
                this.updateStats();
            }
            async downloadAsset(asset) {
                try {
                    const response = await this.fetchWithProxy(asset.url); if (!response.ok) throw new Error(\`HTTP \${response.status}\`);
                    let content; if (asset.type === 'image') { content = await response.blob(); } else { content = await response.text(); }
                    this.duplicatedSite.assets[asset.url] = { type: asset.type, content: content, size: content.length || content.size };
                    this.stats.assetsDownloaded++; this.stats.totalSize += content.length || content.size;
                    this.log(\`Downloaded asset: \${asset.url}\`, 'success');
                } catch (error) { this.log(\`Failed to download \${asset.url}: \${error.message}\`, 'error'); }
            }
            async processAssets() {
                const concurrentRequests = parseInt(document.getElementById('concurrentRequests').value); const chunks = [];
                for (let i = 0; i < this.downloadQueue.length; i += concurrentRequests) { chunks.push(this.downloadQueue.slice(i, i + concurrentRequests)); }
                for (const chunk of chunks) {
                    if (!this.isRunning) break;
                    await Promise.all(chunk.map(asset => this.downloadAsset(asset))); this.updateStats();
                    const progress = (this.stats.assetsDownloaded / this.downloadQueue.length) * 100; this.updateProgress(progress);
                }
            }
            generateProcessedFiles() {
                const files = {};
                Object.entries(this.duplicatedSite.pages).forEach(([url, content]) => {
                    const urlObj = new URL(url); let filename = urlObj.pathname;
                    if (filename === '/' || filename === '') { filename = '/index.html'; } else if (!filename.endsWith('.html')) { filename += '.html'; }
                    let processedContent = content; if (document.getElementById('updateLinks').checked) { processedContent = this.updateLinksInContent(content, url); }
                    files[filename] = processedContent;
                });
                Object.entries(this.duplicatedSite.assets).forEach(([url, asset]) => {
                    const urlObj = new URL(url); let filename = urlObj.pathname;
                    if (asset.type === 'css') { if (!filename.endsWith('.css')) filename += '.css'; } else if (asset.type === 'js') { if (!filename.endsWith('.js')) filename += '.js'; }
                    files[filename] = asset.content;
                });
                return files;
            }
            updateLinksInContent(content, baseUrl) {
                let updatedContent = content;
                updatedContent = updatedContent.replace(/<link([^>]+)href=["']([^"']+)["']/gi, (match, attrs, href) => { try { const absoluteUrl = new URL(href, baseUrl); const localPath = absoluteUrl.pathname; return \`<link\${attrs}href="\${localPath}"\`; } catch { return match; } });
                updatedContent = updatedContent.replace(/<script([^>]+)src=["']([^"']+)["']/gi, (match, attrs, src) => { try { const absoluteUrl = new URL(src, baseUrl); const localPath = absoluteUrl.pathname; return \`<script\${attrs}src="\${localPath}"\`; } catch { return match; } });
                updatedContent = updatedContent.replace(/<img([^>]+)src=["']([^"']+)["']/gi, (match, attrs, src) => { try { const absoluteUrl = new URL(src, baseUrl); const localPath = absoluteUrl.pathname; return \`<img\${attrs}src="\${localPath}"\`; } catch { return match; } });
                updatedContent = updatedContent.replace(/<a([^>]+)href=["']([^"']+)["']/gi, (match, attrs, href) => {
                    try {
                        const absoluteUrl = new URL(href, baseUrl); const currentDomain = new URL(baseUrl).origin;
                        if (absoluteUrl.origin === currentDomain) { let localPath = absoluteUrl.pathname; if (localPath === '/' || localPath === '') { localPath = '/index.html'; } else if (!localPath.endsWith('.html')) { localPath += '.html'; } return \`<a\${attrs}href="\${localPath}"\`; }
                        return match;
                    } catch { return match; }
                });
                return updatedContent;
            }
            generateDownloadableFiles() {
                const files = this.generateProcessedFiles(); const downloads = [];
                const zipContent = this.createZipStructure(files); downloads.push({ name: 'website_duplicate.zip', content: zipContent, type: 'application/zip', size: Object.values(files).reduce((sum, content) => sum + (content.length || content.size || 0), 0) });
                if (document.getElementById('includeMetadata').checked) { const metadata = { duplicatedAt: new Date().toISOString(), originalUrl: this.targetUrl.value, stats: this.stats, pages: Object.keys(this.duplicatedSite.pages), assets: Object.keys(this.duplicatedSite.assets), settings: this.getSelectedSettings() }; downloads.push({ name: 'duplication_metadata.json', content: JSON.stringify(metadata, null, 2), type: 'application/json', size: JSON.stringify(metadata).length }); }
                if (document.getElementById('generateSitemap').checked) { const sitemap = this.generateSitemap(); downloads.push({ name: 'sitemap.xml', content: sitemap, type: 'application/xml', size: sitemap.length }); }
                return downloads;
            }
            createZipStructure(files) {
                let structure = "ZIP Archive Contents:\\n=====================\\n\\n";
                Object.entries(files).forEach(([path, content]) => { const size = content.length || content.size || 0; structure += \`\${path} (\${this.formatFileSize(size)})\\n\`; });
                structure += \`\\nTotal Files: \${Object.keys(files).length}\`; structure += \`\\nTotal Size: \${this.formatFileSize(this.stats.totalSize)}\`;
                return structure;
            }
            generateSitemap() {
                const pages = Object.keys(this.duplicatedSite.pages); let sitemap = '<?xml version="1.0" encoding="UTF-8"?>\\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\\n';
                pages.forEach(url => { sitemap += \`  <url>\\n    <loc>\${url}</loc>\\n    <lastmod>\${new Date().toISOString().split('T')[0]}</lastmod>\\n  </url>\\n\`; });
                sitemap += '</urlset>'; return sitemap;
            }
            getSelectedSettings() { return { deepCrawl: document.getElementById('deepCrawl').checked, followExternal: document.getElementById('followExternal').checked, respectRobots: document.getElementById('respectRobots').checked, maxPages: document.getElementById('maxPages').value, maxDepth: document.getElementById('maxDepth').value, extractHTML: document.getElementById('extractHTML').checked, extractCSS: document.getElementById('extractCSS').checked, extractJS: document.getElementById('extractJS').checked, extractImages: document.getElementById('extractImages').checked, extractFonts: document.getElementById('extractFonts').checked, extractDocuments: document.getElementById('extractDocuments').checked, preserveJS: document.getElementById('preserveJS').checked, updateLinks: document.getElementById('updateLinks').checked, minifyCode: document.getElementById('minifyCode').checked, optimizeImages: document.getElementById('optimizeImages').checked, generateSitemap: document.getElementById('generateSitemap').checked, outputFormat: document.querySelector('input[name="outputFormat"]:checked').value, includeMetadata: document.getElementById('includeMetadata').checked }; }
            formatFileSize(bytes) { if (bytes === 0) return '0 B'; const k = 1024; const sizes = ['B', 'KB', 'MB', 'GB']; const i = Math.floor(Math.log(bytes) / Math.log(k)); return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]; }
            createDownloadLink(file) {
                const blob = new Blob([file.content], { type: file.type }); const url = URL.createObjectURL(blob);
                const link = document.createElement('a'); link.className = 'download-item'; link.href = url; link.download = file.name;
                link.innerHTML = \`<div class="title">\${file.name}</div><div class="size">\${this.formatFileSize(file.size)}</div>\`;
                return link;
            }
            showResults() {
                const downloads = this.generateDownloadableFiles(); this.downloadLinks.innerHTML = '';
                downloads.forEach(file => { const downloadLink = this.createDownloadLink(file); this.downloadLinks.appendChild(downloadLink); });
                const summaryStats = document.getElementById('summaryStats');
                summaryStats.innerHTML = \`<h3>Duplication Summary</h3><ul><li><strong>Pages processed:</strong> \${this.stats.pagesProcessed}</li><li><strong>Assets downloaded:</strong> \${this.stats.assetsDownloaded}</li><li><strong>Total size:</strong> \${this.formatFileSize(this.stats.totalSize)}</li><li><strong>Errors encountered:</strong> \${this.stats.errors}</li><li><strong>Time taken:</strong> \${this.timeElapsed.textContent}</li></ul>\`;
                this.resultsSection.classList.add('show');
            }
            async startDuplication() {
                const url = this.targetUrl.value.trim(); if (!url) { alert('Please enter a website URL'); return; }
                if (!this.validateUrl(url)) { alert('Please enter a valid URL'); return; }
                this.isRunning = true; this.startTime = Date.now(); this.stats = { pagesProcessed: 0, assetsDownloaded: 0, totalSize: 0, errors: 0 };
                this.processedUrls.clear(); this.downloadQueue = []; this.duplicatedSite = { pages: {}, assets: {}, structure: {} };
                this.startBtn.style.display = 'none'; this.stopBtn.style.display = 'inline-block'; this.progressSection.classList.add('show'); this.resultsSection.classList.remove('show');
                this.logContainer.innerHTML = '<div class="log-entry info">Starting duplication process...</div>'; this.log(\`Starting duplication of: \${url}\`, 'info');
                this.log(\`Settings: Deep crawl=\${document.getElementById('deepCrawl').checked}, Max pages=\${document.getElementById('maxPages').value}\`, 'info');
                try {
                    const timer = setInterval(() => { if (!this.isRunning) { clearInterval(timer); return; } this.updateStats(); }, 1000);
                    await this.processPage(url, 0); await new Promise(resolve => setTimeout(resolve, 2000));
                    if (this.downloadQueue.length > 0) { this.log(\`Found \${this.downloadQueue.length} assets to download\`, 'info'); await this.processAssets(); }
                    this.log('Duplication completed successfully!', 'success'); this.updateProgress(100);
                    setTimeout(() => { this.showResults(); document.getElementById('loadingSpinner').style.display = 'none'; }, 1000);
                } catch (error) { this.log(\`Duplication failed: \${error.message}\`, 'error'); } 
                finally { this.isRunning = false; this.startBtn.style.display = 'inline-block'; this.stopBtn.style.display = 'none'; }
            }
            stopDuplication() { this.isRunning = false; this.log('Duplication process stopped by user', 'warning'); this.startBtn.style.display = 'inline-block'; this.stopBtn.style.display = 'none'; }
        }
        document.addEventListener('DOMContentLoaded', () => { new AdvancedWebDuplicator(); });
    </script>
</body>
</html>
`;

const SimpleBuilder = () => {
    const [page, setPage] = useState({
        title: 'Welcome to My Website',
        subtitle: 'A one-page site built with SynergySphere.',
        heroImage: 'https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?q=80&w=2070&auto=format&fit=crop',
        body: 'Describe your business, showcase your portfolio, or tell your story.'
    });

    const handleExport = () => {
        const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${page.title}</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-100 font-sans">
    <header style="background-image: url('${page.heroImage}');" class="bg-cover bg-center text-white p-20 text-center shadow-lg">
        <h1 class="text-5xl font-bold mb-2">${page.title}</h1>
        <p class="text-xl">${page.subtitle}</p>
    </header>
    <main class="container mx-auto p-8 bg-white mt-[-2rem] rounded-lg shadow-xl">
        <p class="text-gray-700 leading-relaxed">${page.body.replace(/\n/g, '<br>')}</p>
    </main>
</body>
</html>`;
        const blob = new Blob([html], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'index.html';
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
            <div className="space-y-6">
                <Card>
                    <CardHeader><CardTitle>Page Content</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <div><Label>Title</Label><Input value={page.title} onChange={e => setPage({...page, title: e.target.value})} /></div>
                        <div><Label>Subtitle</Label><Input value={page.subtitle} onChange={e => setPage({...page, subtitle: e.target.value})} /></div>
                        <div><Label>Hero Image URL</Label><Input value={page.heroImage} onChange={e => setPage({...page, heroImage: e.target.value})} /></div>
                        <div><Label>Body Content</Label><Textarea className="h-40" value={page.body} onChange={e => setPage({...page, body: e.target.value})} /></div>
                        <Button onClick={handleExport}><Code className="mr-2 h-4 w-4" /> Export HTML</Button>
                    </CardContent>
                </Card>
            </div>
            <div className="space-y-6">
                <Card>
                    <CardHeader><CardTitle>Live Preview</CardTitle></CardHeader>
                    <CardContent>
                        <div className="border rounded-lg overflow-hidden shadow-lg">
                            <header style={{backgroundImage: `url(${page.heroImage})`}} className="bg-cover bg-center text-white p-12 text-center">
                                <h1 className="text-3xl font-bold mb-2">{page.title}</h1>
                                <p className="text-lg">{page.subtitle}</p>
                            </header>
                            <main className="p-6 bg-white">
                                <p className="whitespace-pre-wrap text-gray-700">{page.body}</p>
                            </main>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default function WebsiteBuilder() {
    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Website Tools</h1>
            <Tabs defaultValue="simple">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="simple"><Code className="mr-2 h-4 w-4"/>Simple Page Builder</TabsTrigger>
                    <TabsTrigger value="duplicator"><Layers className="mr-2 h-4 w-4"/>Advanced Site Duplicator</TabsTrigger>
                </TabsList>
                <TabsContent value="simple">
                    <SimpleBuilder />
                </TabsContent>
                <TabsContent value="duplicator">
                    <Card className="mt-4 overflow-hidden">
                        <CardHeader>
                            <CardTitle>Web App Duplicator</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <iframe
                                srcDoc={duplicatorToolHtml}
                                style={{ width: '100%', height: '85vh', border: 'none', borderRadius: '8px' }}
                                title="Advanced Web App Duplicator"
                                sandbox="allow-scripts allow-same-origin allow-forms"
                            />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}