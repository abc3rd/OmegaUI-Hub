import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Only return non-sensitive env var names
    const safeEnvVars = [
      'NODE_ENV',
      'BASE44_APP_ID',
      'DENO_DEPLOYMENT_ID',
      'PUBLIC_DOMAIN'
    ];

    const env = {};
    for (const varName of safeEnvVars) {
      const value = Deno.env.get(varName);
      if (value) {
        env[varName] = varName === 'BASE44_APP_ID' ? value.substring(0, 8) + '...' : value;
      }
    }

    return Response.json({
      env,
      count: Object.keys(env).length
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});