import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

const GHL_API_BASE = 'https://services.leadconnectorhq.com';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const { contactData } = await req.json();
        
        const apiKey = Deno.env.get("GHL_API_KEY");
        const locationId = Deno.env.get("GHL_LOCATION_ID");
        
        if (!apiKey || !locationId) {
            return Response.json({ 
                error: 'GHL API credentials not configured'
            }, { status: 500 });
        }
        
        // Create contact in GHL
        const response = await fetch(
            `${GHL_API_BASE}/contacts/`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Version': '2021-07-28',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    locationId: locationId,
                    firstName: contactData.firstName,
                    lastName: contactData.lastName,
                    name: `${contactData.firstName} ${contactData.lastName}`,
                    email: contactData.email,
                    phone: contactData.phone,
                    tags: contactData.tags || [],
                    customField: contactData.customFields || []
                })
            }
        );
        
        if (!response.ok) {
            const errorText = await response.text();
            return Response.json({ 
                error: 'Failed to create contact in GHL',
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