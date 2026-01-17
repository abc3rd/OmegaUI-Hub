import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { contact_id, custom_fields } = await req.json();

        if (!contact_id || !custom_fields) {
            return Response.json({ 
                error: 'contact_id and custom_fields are required' 
            }, { status: 400 });
        }

        const ghlApiKey = Deno.env.get("GHL_API_KEY");
        if (!ghlApiKey) {
            return Response.json({ error: 'GHL_API_KEY not configured' }, { status: 500 });
        }

        // Update contact in GHL
        const response = await fetch(
            `https://services.leadconnectorhq.com/contacts/${contact_id}`,
            {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${ghlApiKey}`,
                    'Version': '2021-07-28',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    customFields: custom_fields
                })
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            return Response.json({ 
                error: 'Failed to update GHL contact',
                details: errorText 
            }, { status: response.status });
        }

        const data = await response.json();

        return Response.json({ 
            success: true,
            contact: data.contact
        });

    } catch (error) {
        return Response.json({ 
            error: error.message 
        }, { status: 500 });
    }
});