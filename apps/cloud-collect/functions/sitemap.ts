import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Get base URL from request
    const url = new URL(req.url);
    const baseUrl = `${url.protocol}//${url.host}`;
    
    // Static pages
    const staticPages = [
      { path: '/', priority: '1.0', changefreq: 'daily' },
      { path: '/ResourceMap', priority: '0.9', changefreq: 'daily' },
      { path: '/ResourceMapAbout', priority: '0.7', changefreq: 'weekly' },
      { path: '/ScanQR', priority: '0.8', changefreq: 'weekly' },
      { path: '/ProximityAlerts', priority: '0.7', changefreq: 'weekly' },
      { path: '/ChooseAccountType', priority: '0.6', changefreq: 'monthly' },
    ];

    // Get active public profiles
    const profiles = await base44.asServiceRole.entities.Profile.filter({
      isActive: true,
      isDraft: false,
      qrCodeStatus: 'active',
      publicProfileUrl: { $exists: true, $ne: null }
    });

    // Build sitemap XML
    let sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n';
    sitemap += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    // Add static pages
    staticPages.forEach(page => {
      sitemap += '  <url>\n';
      sitemap += `    <loc>${baseUrl}${page.path}</loc>\n`;
      sitemap += `    <changefreq>${page.changefreq}</changefreq>\n`;
      sitemap += `    <priority>${page.priority}</priority>\n`;
      sitemap += '  </url>\n';
    });

    // Add profile pages
    profiles.forEach(profile => {
      sitemap += '  <url>\n';
      sitemap += `    <loc>${baseUrl}/ViewProfile?slug=${profile.publicProfileUrl}</loc>\n`;
      sitemap += `    <changefreq>weekly</changefreq>\n`;
      sitemap += `    <priority>0.8</priority>\n`;
      if (profile.updated_date) {
        sitemap += `    <lastmod>${new Date(profile.updated_date).toISOString()}</lastmod>\n`;
      }
      sitemap += '  </url>\n';
    });

    sitemap += '</urlset>';

    return new Response(sitemap, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600'
      }
    });

  } catch (error) {
    console.error('Sitemap generation error:', error);
    return new Response('Error generating sitemap', { status: 500 });
  }
});