import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * POST /v1/reports
 * Create a crash report from mobile app
 * 
 * Body: {
 *   lead_id: string (required)
 *   device_id: string (required)
 *   occurred_at: string (ISO date)
 *   location: { lat, lng, address }
 *   vehicles: [{ make, model, year, plate, ... }]
 *   persons: [{ name, role, contact, ... }]
 *   narrative: string
 * }
 * 
 * Returns: {
 *   report_id: string
 *   incident_id: string
 *   status: string
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
    if (!body.lead_id) {
      return Response.json(
        { error: 'lead_id is required', code: 'VALIDATION_ERROR' },
        { status: 400 }
      );
    }

    if (!body.device_id) {
      return Response.json(
        { error: 'device_id is required', code: 'VALIDATION_ERROR' },
        { status: 400 }
      );
    }

    // Check idempotency
    if (idempotencyKey) {
      const existingIncidents = await base44.asServiceRole.entities.Incident.filter({
        narrative: body.narrative
      });
      
      const recent = existingIncidents.find(inc => {
        const age = (new Date() - new Date(inc.created_date)) / 1000;
        return age < 300; // 5 minutes
      });
      
      if (recent) {
        return Response.json({
          report_id: recent.id,
          incident_id: recent.id,
          status: recent.status
        });
      }
    }

    // Try to get authenticated user (optional)
    let user_id = null;
    try {
      const user = await base44.auth.me();
      user_id = user.id;
    } catch {
      // Anonymous report - allowed
    }

    // Verify lead exists
    const leads = await base44.asServiceRole.entities.Lead.filter({
      lead_id: body.lead_id
    });

    if (leads.length === 0) {
      return Response.json(
        { error: 'Invalid lead_id', code: 'INVALID_LEAD' },
        { status: 400 }
      );
    }

    const lead = leads[0];

    // Create incident
    const incident = await base44.asServiceRole.entities.Incident.create({
      user_id: user_id || `anonymous_${body.device_id}`,
      status: 'submitted',
      occurred_at: body.occurred_at || new Date().toISOString(),
      jurisdiction_state: body.location?.state || '',
      jurisdiction_county: body.location?.county || null,
      location_text: body.location?.address || '',
      lat: body.location?.lat || null,
      lng: body.location?.lng || null,
      vehicles_involved: body.vehicles || [],
      injuries: body.persons?.filter(p => p.role === 'injured').map(p => ({
        person: p.name,
        description: p.injury_description,
        severity: p.injury_severity || 'unknown',
        medical_attention_sought: p.medical_attention || false
      })) || [],
      witnesses: body.persons?.filter(p => p.role === 'witness').map(p => ({
        name: p.name,
        phone: p.phone,
        email: p.email,
        statement: p.statement
      })) || [],
      narrative: body.narrative || '',
      weather_conditions: body.weather || null,
      road_conditions: body.road_conditions || null,
      wizard_completed: true
    });

    // Link user to lead if authenticated
    if (user_id) {
      await base44.asServiceRole.entities.Lead.update(lead.id, {
        user_id,
        last_updated_utc: new Date().toISOString()
      });

      await base44.asServiceRole.entities.LeadEvent.create({
        event_id: crypto.randomUUID(),
        lead_id: body.lead_id,
        event_type: 'USER_LINKED',
        timestamp_utc: new Date().toISOString(),
        payload: { user_id, incident_id: incident.id },
        event_hash: crypto.randomUUID(),
        actor_user_id: user_id
      });
    }

    // Create audit log
    await base44.asServiceRole.entities.AuditLog.create({
      actor_user_id: user_id || null,
      actor_email: null,
      actor_role: user_id ? 'user' : 'system',
      action: 'create',
      entity_type: 'Incident',
      entity_id: incident.id,
      details: {
        source: 'mobile_app',
        lead_id: body.lead_id,
        device_id: body.device_id,
        referral_code: lead.referral_code
      },
      ip_address: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip'),
      user_agent: req.headers.get('user-agent')
    });

    return Response.json({
      report_id: incident.id,
      incident_id: incident.id,
      status: incident.status,
      lead_attribution: {
        referral_code: lead.referral_code,
        source: lead.source
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating report:', error);
    return Response.json(
      { error: error.message, code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
});