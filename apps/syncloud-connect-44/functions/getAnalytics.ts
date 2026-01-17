import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const url = new URL(req.url);
        const qr_id = url.searchParams.get('qr_id');

        if (!qr_id) {
            return Response.json({ error: 'qr_id required' }, { status: 400 });
        }

        // Verify ownership
        const qrCodes = await base44.entities.QRCode.filter({ id: qr_id });
        
        if (!qrCodes || qrCodes.length === 0) {
            return Response.json({ error: 'QR code not found' }, { status: 404 });
        }

        const qrCode = qrCodes[0];

        if (qrCode.created_by !== user.email) {
            return Response.json({ error: 'Unauthorized' }, { status: 403 });
        }

        // Get all scans for this QR
        const scans = await base44.entities.QRScan.filter({ qr_id: qr_id });

        // Calculate analytics
        const totalScans = scans.length;
        const uniqueDevices = new Set(scans.map(s => s.user_agent)).size;
        
        // Device breakdown
        const deviceCounts = scans.reduce((acc, scan) => {
            acc[scan.device] = (acc[scan.device] || 0) + 1;
            return acc;
        }, {});

        // Timeline (last 30 days)
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const recentScans = scans.filter(s => new Date(s.created_date) >= thirtyDaysAgo);
        
        const timeline = recentScans.reduce((acc, scan) => {
            const date = new Date(scan.created_date).toISOString().split('T')[0];
            acc[date] = (acc[date] || 0) + 1;
            return acc;
        }, {});

        return Response.json({
            qr_id: qr_id,
            label: qrCode.label,
            total_scans: totalScans,
            unique_devices: uniqueDevices,
            device_breakdown: deviceCounts,
            timeline: timeline,
            last_scan_at: qrCode.last_scan_at,
            recent_scans: recentScans.slice(0, 10).map(s => ({
                timestamp: s.created_date,
                device: s.device,
                result: s.result
            }))
        });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});