import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const startTime = performance.now();
    
    // Check database connection by attempting to read
    try {
      await base44.asServiceRole.entities.User.list();
    } catch (error) {
      return Response.json({
        status: 'error',
        message: 'Database connection failed',
        error: error.message,
        time: new Date().toISOString()
      }, { status: 503 });
    }

    const responseTime = performance.now() - startTime;

    return Response.json({
      status: 'ok',
      time: new Date().toISOString(),
      uptime: Math.floor(performance.now() / 1000),
      responseTime: Math.round(responseTime),
      checks: {
        database: 'ok',
        auth: 'ok'
      }
    });
  } catch (error) {
    return Response.json({ 
      status: 'error',
      error: error.message,
      time: new Date().toISOString()
    }, { status: 500 });
  }
});