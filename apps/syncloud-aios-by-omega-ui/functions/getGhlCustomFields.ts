import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { location_id } = await req.json();

        if (!location_id) {
            return Response.json({ error: 'location_id is required' }, { status: 400 });
        }

        const ghlApiKey = Deno.env.get("GHL_API_KEY");
        if (!ghlApiKey) {
            return Response.json({ error: 'GHL_API_KEY not configured' }, { status: 500 });
        }

        // Fetch custom fields from GHL
        const response = await fetch(
            `https://services.leadconnectorhq.com/locations/${location_id}/customFields`,
            {
                headers: {
                    'Authorization': `Bearer ${ghlApiKey}`,
                    'Version': '2021-07-28',
                    'Content-Type': 'application/json'
                }
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            return Response.json({ 
                error: 'Failed to fetch custom fields from GHL',
                details: errorText 
            }, { status: response.status });
        }

        const data = await response.json();

        return Response.json({ 
            success: true,
            customFields: data.customFields || []
        });

    } catch (error) {
        return Response.json({ 
            error: error.message,
            stack: error.stack 
        }, { status: 500 });
    }
});