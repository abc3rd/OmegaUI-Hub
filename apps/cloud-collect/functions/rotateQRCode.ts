import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { profileId } = await req.json();

        // Verify user owns this profile
        const profile = await base44.asServiceRole.entities.Profile.filter({ 
            id: profileId, 
            created_by: user.email 
        });

        if (!profile || profile.length === 0) {
            return Response.json({ error: 'Profile not found or unauthorized' }, { status: 404 });
        }

        // Rotate QR code version
        const updated = await base44.asServiceRole.entities.Profile.update(profileId, {
            qrCodeVersion: (profile[0].qrCodeVersion || 1) + 1,
            qrCodeLastRotatedAt: new Date().toISOString()
        });

        return Response.json({ success: true, profile: updated });

    } catch (error) {
        console.error('Rotate QR error:', error);
        return Response.json({ error: error.message || 'Failed to rotate QR code' }, { status: 500 });
    }
});