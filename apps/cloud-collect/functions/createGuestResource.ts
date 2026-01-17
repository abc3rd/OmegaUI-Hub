import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// Simple in-memory rate limiting (resets on function restart)
const ipRequestCounts = new Map();
const RATE_LIMIT = 5; // 5 submissions per IP
const RATE_LIMIT_WINDOW = 3600000; // 1 hour in milliseconds

function checkRateLimit(ip) {
  const now = Date.now();
  const record = ipRequestCounts.get(ip) || { count: 0, resetAt: now + RATE_LIMIT_WINDOW };
  
  if (now > record.resetAt) {
    // Reset the counter
    ipRequestCounts.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return true;
  }
  
  if (record.count >= RATE_LIMIT) {
    return false;
  }
  
  record.count++;
  ipRequestCounts.set(ip, record);
  return true;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Get client IP for rate limiting
    const clientIP = req.headers.get('x-forwarded-for') || 
                     req.headers.get('x-real-ip') || 
                     'unknown';
    
    // Check rate limit
    if (!checkRateLimit(clientIP)) {
      return Response.json({ 
        error: 'Rate limit exceeded. Please try again later.' 
      }, { status: 429 });
    }
    
    const data = await req.json();
    
    // Validate required fields
    if (!data.name || !data.type || !data.latitude || !data.longitude) {
      return Response.json({ 
        error: 'Missing required fields' 
      }, { status: 400 });
    }
    
    // Check for honeypot field (bot detection)
    if (data.website || data.url || data.link) {
      // Likely a bot, silently reject
      return Response.json({ 
        success: true,
        message: 'Resource submitted for review' 
      });
    }
    
    // Sanitize and create resource with service role
    const resourceData = {
      name: data.name.trim().substring(0, 100),
      type: data.type,
      description: data.description?.trim().substring(0, 500) || '',
      latitude: parseFloat(data.latitude),
      longitude: parseFloat(data.longitude),
      hours: data.hours?.trim().substring(0, 100) || '',
      accessNotes: data.accessNotes?.trim().substring(0, 500) || '',
      status: 'pending', // Guest submissions need approval
      visibility: 'community',
      isVerified: false,
      createdByUserId: null,
    };
    
    const resource = await base44.asServiceRole.entities.ResourceLocation.create(resourceData);
    
    return Response.json({ 
      success: true,
      message: 'Resource submitted for review',
      resource: {
        id: resource.id,
        name: resource.name,
        type: resource.type,
      }
    });
    
  } catch (error) {
    console.error('Guest resource creation error:', error);
    return Response.json({ 
      error: 'Failed to create resource',
      details: error.message 
    }, { status: 500 });
  }
});