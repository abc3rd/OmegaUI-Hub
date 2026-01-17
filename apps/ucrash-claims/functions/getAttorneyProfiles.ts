import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

const GHL_API_BASE = 'https://services.leadconnectorhq.com';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        
        // Get API credentials from environment
        const apiKey = Deno.env.get("GHL_API_KEY");
        const locationId = Deno.env.get("GHL_LOCATION_ID");
        
        if (!apiKey || !locationId) {
            return Response.json({ 
                error: 'GHL API credentials not configured',
                details: 'Please set GHL_API_KEY and GHL_LOCATION_ID in environment variables'
            }, { status: 500 });
        }
        
        // Fetch contacts from GHL with attorney tag/role
        const response = await fetch(
            `${GHL_API_BASE}/contacts/?locationId=${locationId}`,
            {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Version': '2021-07-28',
                    'Content-Type': 'application/json'
                }
            }
        );
        
        if (!response.ok) {
            const errorText = await response.text();
            return Response.json({ 
                error: 'GHL API request failed',
                status: response.status,
                details: errorText
            }, { status: response.status });
        }
        
        const data = await response.json();
        
        // Filter and map attorney contacts
        const attorneys = (data.contacts || [])
            .filter(contact => 
                contact.tags?.includes('Attorney Member') || 
                contact.customField?.some(f => f.key?.startsWith('attorney.'))
            )
            .map(contact => {
                // Extract custom fields
                const customFields = {};
                (contact.customField || []).forEach(field => {
                    if (field.key?.startsWith('attorney.')) {
                        const fieldName = field.key.replace('attorney.', '');
                        customFields[fieldName] = field.value;
                    }
                });
                
                return {
                    id: contact.id,
                    name: contact.name || customFields.name || 'Unknown Attorney',
                    email: contact.email,
                    phone: contact.phone,
                    firm_name: customFields.firm_name || '',
                    specialty: customFields.specialties || customFields.specialty || '',
                    rating: customFields.rating || '5',
                    years_exp: customFields.years_exp || '',
                    recovered_amt: customFields.recovered_amt || '',
                    location: customFields.location || '',
                    profile_photo_url: customFields.profile_photo_url || '',
                    public_profile_url: customFields.public_profile_url || '',
                    unique_lead_form_id: customFields.unique_lead_form_id || 'PZcHumEAEH77AdSbkm3k',
                    custom_fields: customFields
                };
            });
        
        return Response.json({
            success: true,
            count: attorneys.length,
            attorneys: attorneys
        });
        
    } catch (error) {
        return Response.json({ 
            error: error.message,
            stack: error.stack
        }, { status: 500 });
    }
});