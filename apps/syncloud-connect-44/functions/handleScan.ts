import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const url = new URL(req.url);
        const qr_id = url.searchParams.get('qr_id');

        if (!qr_id) {
            return Response.json({ error: 'qr_id required' }, { status: 400 });
        }

        // Get QR code (service role to allow public access)
        const qrCodes = await base44.asServiceRole.entities.QRCode.filter({ id: qr_id });
        
        if (!qrCodes || qrCodes.length === 0) {
            return Response.json({ error: 'QR code not found' }, { status: 404 });
        }

        const qrCode = qrCodes[0];

        if (qrCode.status !== 'active') {
            return Response.json({ error: 'QR code is not active' }, { status: 403 });
        }

        // Extract device info
        const userAgent = req.headers.get('user-agent') || 'unknown';
        const device = /mobile/i.test(userAgent) ? 'mobile' : 
                      /tablet/i.test(userAgent) ? 'tablet' : 'desktop';

        // Log scan
        await base44.asServiceRole.entities.QRScan.create({
            qr_id: qr_id,
            device: device,
            user_agent: userAgent,
            location: 'Unknown', // Could integrate IP geolocation service
            result: qrCode.redirect_url || 'Command executed'
        });

        // Update scan count
        await base44.asServiceRole.entities.QRCode.update(qr_id, {
            scan_count: qrCode.scan_count + 1,
            last_scan_at: new Date().toISOString()
        });

        // Return execution result
        return Response.json({
            success: true,
            command_payload: qrCode.command_payload,
            redirect_url: qrCode.redirect_url,
            message: 'Scan logged successfully'
        });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});