import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * POST /v1/leads/resolve
 * Resolve or create a lead from mobile app with referral attribution
 * 
 * Body: {
 *   referral_code: string (optional)
 *   device_id: string (required)
 *   source: string (optional, default: "mobile")
 *   utm_source: string (optional)
 *   utm_medium: string (optional)
 *   utm_campaign: string (optional)
 * }
 * 
 * Returns: {
 *   lead_id: string
 *   status: string
 *   is_new: boolean
 * }
 */

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return Response.json(
      { error: 'Method not allowed', code: 'METHOD_NOT_ALLOWED' },
      { status: 405 }
    );
  }

  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const idempotencyKey = req.headers.get('idempotency-key');

    // Validate required fields
    if (!body.device_id) {
      return Response.json(
        { error: 'device_id is required', code: 'VALIDATION_ERROR' },
        { status: 400 }
      );
    }

    // Generate device hash
    const encoder = new TextEncoder();
    const data = encoder.encode(body.device_id);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const device_hash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    // Check for existing lead (within 24h, same device)
    const existingLeads = await base44.asServiceRole.entities.Lead.filter({
      device_hash
    });

    const now = new Date();
    const recentLead = existingLeads.find(lead => {
      const leadAge = (now - new Date(lead.created_at_utc)) / (1000 * 60 * 60);
      return leadAge < 24;
    });

    if (recentLead) {
      // Update last touch
      await base44.asServiceRole.entities.Lead.update(recentLead.id, {
        last_touch_url: `mobile://${body.source || 'mobile'}`,
        last_updated_utc: now.toISOString()
      });

      // Log touch event
      await base44.asServiceRole.entities.LeadEvent.create({
        event_id: crypto.randomUUID(),
        lead_id: recentLead.lead_id,
        event_type: 'TOUCH_UPDATED',
        timestamp_utc: now.toISOString(),
        payload: {
          source: body.source || 'mobile',
          referral_code: body.referral_code
        },
        event_hash: crypto.randomUUID() // Simplified for mobile
      });

      return Response.json({
        lead_id: recentLead.lead_id,
        status: recentLead.status,
        is_new: false
      });
    }

    // Create new lead
    const lead_id = crypto.randomUUID();
    const created_at_utc = now.toISOString();

    const lead = await base44.asServiceRole.entities.Lead.create({
      lead_id,
      status: 'new',
      referral_code: body.referral_code || null,
      source: body.source || 'mobile',
      campaign: body.campaign || null,
      utm_source: body.utm_source || null,
      utm_medium: body.utm_medium || null,
      utm_campaign: body.utm_campaign || null,
      first_touch_url: `mobile://${body.source || 'mobile'}`,
      last_touch_url: `mobile://${body.source || 'mobile'}`,
      device_hash,
      lead_hash: crypto.randomUUID(), // Simplified for mobile
      created_at_utc,
      last_updated_utc: created_at_utc
    });

    // Log lead created event
    await base44.asServiceRole.entities.LeadEvent.create({
      event_id: crypto.randomUUID(),
      lead_id,
      event_type: 'LEAD_CREATED',
      timestamp_utc: created_at_utc,
      payload: {
        referral_code: body.referral_code,
        source: body.source || 'mobile',
        device_hash
      },
      event_hash: crypto.randomUUID()
    });

    return Response.json({
      lead_id,
      status: 'new',
      is_new: true
    });

  } catch (error) {
    console.error('Error resolving lead:', error);
    return Response.json(
      { error: error.message, code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
});