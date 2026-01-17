import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * GET /v1/reports
 * Get reports history for authenticated user or by lead_id
 * 
 * Query params:
 *   lead_id: string (optional)
 *   limit: number (default 50)
 * 
 * Returns: {
 *   reports: [{
 *     report_id: string
 *     incident_id: string
 *     status: string
 *     occurred_at: string
 *     location: string
 *     created_at: string
 *   }]
 * }
 */

Deno.serve(async (req) => {
  if (req.method !== 'GET') {
    return Response.json(
      { error: 'Method not allowed', code: 'METHOD_NOT_ALLOWED' },
      { status: 405 }
    );
  }

  try {
    const base44 = createClientFromRequest(req);
    const url = new URL(req.url);
    const leadId = url.searchParams.get('lead_id');
    const limit = parseInt(url.searchParams.get('limit') || '50');

    let incidents = [];

    if (leadId) {
      // Get reports by lead_id (anonymous access allowed)
      const leads = await base44.asServiceRole.entities.Lead.filter({
        lead_id: leadId
      });

      if (leads.length === 0) {
        return Response.json({
          reports: []
        });
      }

      const lead = leads[0];
      
      // Get all incidents for this user or device
      if (lead.user_id) {
        incidents = await base44.asServiceRole.entities.Incident.filter(
          { user_id: lead.user_id },
          '-created_date',
          limit
        );
      }
    } else {
      // Get reports for authenticated user
      try {
        const user = await base44.auth.me();
        incidents = await base44.entities.Incident.filter(
          { user_id: user.id },
          '-created_date',
          limit
        );
      } catch {
        return Response.json(
          { error: 'Authentication required', code: 'UNAUTHORIZED' },
          { status: 401 }
        );
      }
    }

    // Format response
    const reports = incidents.map(incident => ({
      report_id: incident.id,
      incident_id: incident.id,
      status: incident.status,
      occurred_at: incident.occurred_at,
      location: incident.location_text,
      latitude: incident.lat,
      longitude: incident.lng,
      vehicle_count: incident.vehicles_involved?.length || 0,
      injury_count: incident.injuries?.length || 0,
      witness_count: incident.witnesses?.length || 0,
      created_at: incident.created_date,
      updated_at: incident.updated_date
    }));

    return Response.json({
      reports,
      count: reports.length
    });

  } catch (error) {
    console.error('Error fetching reports:', error);
    return Response.json(
      { error: error.message, code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
});