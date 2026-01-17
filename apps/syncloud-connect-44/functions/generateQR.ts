import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import QRCode from 'npm:qrcode@1.5.3';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { qr_id } = await req.json();

        if (!qr_id) {
            return Response.json({ error: 'qr_id required' }, { status: 400 });
        }

        // Generate QR code URL
        const qrUrl = `https://syncloudconnect.com/scan/${qr_id}`;

        // Generate QR code as data URL
        const qrDataUrl = await QRCode.toDataURL(qrUrl, {
            width: 512,
            margin: 2,
            color: {
                dark: '#3c3c3c',
                light: '#ffffff'
            }
        });

        return Response.json({ 
            qr_data_url: qrDataUrl,
            qr_url: qrUrl
        });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});