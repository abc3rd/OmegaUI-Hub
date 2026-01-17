import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * GET /v1/config
 * Get app configuration for mobile clients
 * 
 * Returns: {
 *   contact_email: string
 *   support_url: string
 *   legal: {
 *     terms_url: string
 *     privacy_url: string
 *     siri_legal_url: string
 *   }
 *   features: {
 *     siri_integration: boolean
 *     qr_scanner: boolean
 *     offline_mode: boolean
 *   }
 *   ucp: {
 *     base_url: string
 *   }
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
    const APP_ORIGIN = Deno.env.get('APP_ORIGIN') || 'https://iwitness.ucrash.claims';
    const CONTACT_EMAIL = Deno.env.get('CONTACT_EMAIL') || 'omegaui@syncloudconnect.com';

    const config = {
      contact_email: CONTACT_EMAIL,
      support_url: `${APP_ORIGIN}/support`,
      app_origin: APP_ORIGIN,
      
      legal: {
        terms_url: `${APP_ORIGIN}/terms`,
        privacy_url: `${APP_ORIGIN}/privacy`,
        siri_legal_url: `${APP_ORIGIN}/siri-legal`,
        siri_legal_pdf: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694ab548df9978830eeb95a3/siri-legal-framework.pdf'
      },
      
      features: {
        siri_integration: true,
        qr_scanner: true,
        offline_mode: true,
        ucp_integration: true,
        lead_attribution: true
      },
      
      ucp: {
        base_url: 'https://ucp.syncloudconnect.com',
        packet_url_template: 'https://ucp.syncloudconnect.com/evidence/{packet_id}',
        verify_url_template: 'https://ucp.syncloudconnect.com/verify/{packet_id}'
      },
      
      api: {
        version: 'v1',
        endpoints: {
          resolve_lead: '/v1/leads/resolve',
          create_report: '/v1/reports',
          upload_media: '/v1/reports/{report_id}/media',
          get_reports: '/v1/reports',
          get_config: '/v1/config'
        }
      },
      
      limits: {
        max_file_size_mb: 100,
        max_photos_per_report: 50,
        max_videos_per_report: 10,
        max_audio_duration_minutes: 30
      },
      
      branding: {
        primary_color: '#ea00ea',
        app_name: 'iWitness',
        tagline: 'Document Everything. Protect Yourself.',
        logo_url: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694ab548df9978830eeb95a3/9d98f704c_iwitnesslogo.jpg'
      }
    };

    return Response.json(config);

  } catch (error) {
    console.error('Error fetching config:', error);
    return Response.json(
      { error: error.message, code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
});