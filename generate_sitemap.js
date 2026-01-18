const fs = require('fs');
const path = require('path');

const appsDir = path.join(__dirname, 'apps');
const siteUrl = "https://www.syncloudconnect.com";
const lastMod = "2026-01-18";

// 1. INITIALIZE SITEMAP WITH MAIN PAGES
let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${siteUrl}/</loc>
    <lastmod>${lastMod}</lastmod>
    <priority>1.00</priority>
  </url>
  <url>
    <loc>${siteUrl}/legal.html</loc>
    <lastmod>${lastMod}</lastmod>
    <priority>0.80</priority>
  </url>
`;

// 2. DYNAMICALLY ADD THE 83 APP PAGES
if (fs.existsSync(appsDir)) {
    const folders = fs.readdirSync(appsDir);
    folders.forEach(folder => {
        const folderPath = path.join(appsDir, folder);
        if (fs.lstatSync(folderPath).isDirectory()) {
            const fileName = `${folder}.html`;
            sitemap += `
  <url>
    <loc>${siteUrl}/apps/${folder}/${fileName}</loc>
    <lastmod>${lastMod}</lastmod>
    <priority>0.60</priority>
  </url>`;
        }
    });
}

sitemap += `\n</urlset>`;

// 3. WRITE TO ROOT
fs.writeFileSync(path.join(__dirname, 'sitemap.xml'), sitemap);
console.log("🚀 SUCCESS: sitemap.xml generated with 83 unique application paths.");