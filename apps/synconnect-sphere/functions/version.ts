import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    return Response.json({
      version: '1.0.0',
      build: '2026-01-09T00:00:00Z',
      environment: Deno.env.get('NODE_ENV') || 'production',
      platform: 'Base44',
      domain: 'syncloud-sphere.omegaui.com'
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});