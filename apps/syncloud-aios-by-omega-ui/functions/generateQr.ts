import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import QRCode from 'npm:qrcode@1.5.3';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { 
            affiliate_id, 
            first_name, 
            last_name, 
            contact_id,
            base_intake_url,
            tracking_param_name = 'affiliate_id'
        } = await req.json();

        if (!affiliate_id || !base_intake_url) {
            return Response.json({ 
                error: 'affiliate_id and base_intake_url are required' 
            }, { status: 400 });
        }

        // Build tracking URL
        const trackingUrl = `${base_intake_url}?${tracking_param_name}=${affiliate_id}&source=qr`;

        // Generate QR code as data URL
        const qrDataUrl = await QRCode.toDataURL(trackingUrl, {
            width: 1024,
            margin: 2,
            color: {
                dark: '#000000',
                light: '#FFFFFF'
            }
        });

        // Convert data URL to blob
        const base64Data = qrDataUrl.split(',')[1];
        const binaryData = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));

        // Upload to storage using Core integration
        const blob = new Blob([binaryData], { type: 'image/png' });
        const file = new File([blob], `qr_${affiliate_id}_${Date.now()}.png`, { type: 'image/png' });

        const { file_url } = await base44.integrations.Core.UploadFile({ file });

        // Save QR record to database
        const qrRecord = await base44.entities.QrCode.create({
            affiliate_id,
            first_name: first_name || '',
            last_name: last_name || '',
            tracking_url: trackingUrl,
            qr_code_url: file_url,
            ghl_contact_id: contact_id || '',
            scan_count: 0
        });

        // Update GHL contact if contact_id provided
        if (contact_id) {
            const ghlApiKey = Deno.env.get("GHL_API_KEY");
            
            if (ghlApiKey) {
                try {
                    await fetch(
                        `https://services.leadconnectorhq.com/contacts/${contact_id}`,
                        {
                            method: 'PUT',
                            headers: {
                                'Authorization': `Bearer ${ghlApiKey}`,
                                'Version': '2021-07-28',
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                customFields: [
                                    { key: 'contact.affiliate_id', field_value: affiliate_id },
                                    { key: 'contact.affiliate_tracking_link', field_value: trackingUrl },
                                    { key: 'contact.affiliate_qr_code_link', field_value: file_url }
                                ]
                            })
                        }
                    );
                } catch (ghlError) {
                    console.error('GHL update failed:', ghlError);
                }
            }
        }

        return Response.json({ 
            success: true,
            tracking_url: trackingUrl,
            qr_code_url: file_url,
            qr_record: qrRecord
        });

    } catch (error) {
        console.error('QR Generation Error:', error);
        return Response.json({ 
            error: error.message,
            stack: error.stack 
        }, { status: 500 });
    }
});