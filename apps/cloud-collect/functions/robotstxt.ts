Deno.serve(async (req) => {
  const url = new URL(req.url);
  const baseUrl = `${url.protocol}//${url.host}`;
  
  const robotsTxt = `User-agent: *
Allow: /
Allow: /ResourceMap
Allow: /ViewProfile
Disallow: /Dashboard
Disallow: /RecipientPortal
Disallow: /DonorPortal
Disallow: /Admin
Disallow: /EditProfile

Sitemap: ${baseUrl}/api/sitemap
`;

  return new Response(robotsTxt, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=86400'
    }
  });
});