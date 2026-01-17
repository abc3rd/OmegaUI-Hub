/**
 * n8n Webhook Integration - Omega UI Standard
 * 
 * This function provides a reusable pattern for triggering n8n workflows
 * from Base44 backend functions.
 * 
 * Usage:
 *   import { triggerN8nWorkflow } from './n8nWebhook.js';
 *   
 *   const success = await triggerN8nWorkflow({
 *     workflowSlug: 'syncloud_lead_created',
 *     data: { lead_id: '123', name: 'John Doe' },
 *     actor: { user_id: user.id, email: user.email },
 *     tenantId: user.organization_id
 *   });
 */

/**
 * Trigger an n8n workflow
 * 
 * @param {Object} options - Workflow trigger options
 * @param {string} options.workflowSlug - Workflow identifier (e.g., 'syncloud_lead_created')
 * @param {Object} options.data - Business data payload
 * @param {Object} [options.actor] - User/system that triggered the event
 * @param {string} [options.tenantId] - Organization/tenant ID
 * @param {string} [options.appName] - Application name (defaults to env)
 * @param {string} [options.platform] - Platform identifier (defaults to 'backend')
 * @returns {Promise<boolean>} - True if webhook succeeded, false otherwise
 */
export async function triggerN8nWorkflow({
  workflowSlug,
  data,
  actor = null,
  tenantId = null,
  appName = null,
  platform = 'backend'
}) {
  // Get configuration from environment
  const baseUrl = Deno.env.get('N8N_BASE_URL') || 'https://automation.omegaui.com/n8n/webhook';
  const sharedSecret = Deno.env.get('N8N_SHARED_SECRET');
  const environment = Deno.env.get('ENVIRONMENT') || 'development';
  const defaultAppName = Deno.env.get('APP_NAME') || 'omega-app';

  if (!sharedSecret) {
    console.error('N8N_SHARED_SECRET not configured');
    return false;
  }

  // Build webhook URL
  const url = `${baseUrl}/${workflowSlug}`;

  // Generate request ID for tracing
  const requestId = crypto.randomUUID();

  // Build standard payload
  const payload = {
    event: workflowSlug,
    source: {
      app: appName || defaultAppName,
      platform: platform,
      environment: environment,
      tenant_id: tenantId,
      request_id: requestId,
      timestamp: new Date().toISOString()
    },
    actor: actor || {},
    data: data
  };

  const headers = {
    'Content-Type': 'application/json',
    'X-OMEGA-AUTH': sharedSecret
  };

  try {
    // Fire and forget with 5 second timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(url, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(payload),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.error('n8n webhook failed', {
        workflow: workflowSlug,
        status: response.status,
        statusText: response.statusText,
        request_id: requestId
      });
      return false;
    }

    console.log('n8n webhook success', {
      workflow: workflowSlug,
      request_id: requestId
    });

    return true;

  } catch (error) {
    console.error('n8n webhook error', {
      workflow: workflowSlug,
      error: error.message,
      request_id: requestId
    });
    return false;
  }
}

/**
 * Example usage in a Base44 function
 */
Deno.serve(async (req) => {
  try {
    // Example: Lead creation endpoint
    if (req.method !== 'POST') {
      return Response.json(
        { error: 'Method not allowed' },
        { status: 405 }
      );
    }

    const { lead } = await req.json();

    // TODO: Save lead to database here
    // const savedLead = await db.leads.create(lead);

    // Trigger n8n workflow (fire and forget)
    await triggerN8nWorkflow({
      workflowSlug: 'legendary_lead_created',
      data: {
        lead_id: lead.id,
        name: `${lead.first_name} ${lead.last_name}`,
        email: lead.email,
        phone: lead.phone,
        source: lead.source,
        score: lead.score || 0
      },
      actor: {
        user_id: lead.created_by,
        email: lead.created_by_email
      },
      tenantId: lead.organization_id
    });

    // Return response immediately (don't wait for n8n)
    return Response.json({
      success: true,
      lead: lead
    });

  } catch (error) {
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
});