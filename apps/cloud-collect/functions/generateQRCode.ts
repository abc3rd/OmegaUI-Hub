import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import QRCode from 'npm:qrcode@1.5.3';

async function createSignedToken(profileId, qrVersion) {
    const secret = Deno.env.get('QR_SIGNING_SECRET');
    if (!secret) {
        throw new Error('QR_SIGNING_SECRET not configured');
    }

    const payload = {
        profileId,
        qrVersion,
        issuedAt: Date.now()
    };

    const encoder = new TextEncoder();
    const data = encoder.encode(JSON.stringify(payload));
    const keyData = encoder.encode(secret);

    const cryptoKey = await crypto.subtle.importKey(
        'raw',
        keyData,
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
    );

    const signature = await crypto.subtle.sign('HMAC', cryptoKey, data);
    const sigHex = Array.from(new Uint8Array(signature))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');

    const token = btoa(JSON.stringify(payload)) + '.' + sigHex;
    return token;
}

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { profileId } = await req.json();

        const profiles = await base44.entities.Profile.filter({ 
            id: profileId,
            created_by: user.email 
        });

        if (!profiles || profiles.length === 0) {
            return Response.json({ error: 'Profile not found' }, { status: 404 });
        }

        const profile = profiles[0];

        // Check if QR is disabled
        if (profile.qrCodeStatus === 'disabled') {
            return Response.json({ error: 'QR code is disabled for this profile' }, { status: 400 });
        }

        // Generate signed token
        const token = await createSignedToken(profile.id, profile.qrCodeVersion || 1);
        const origin = req.headers.get('origin') || 'https://qr-collect.glytch.cloud';
        const qrUrl = `${origin}/qr/${token}`;

        // Generate QR Code as PNG
        const pngBuffer = await QRCode.toBuffer(qrUrl, {
            type: 'png',
            width: 512,
            margin: 2,
            color: {
                dark: '#1e293b',
                light: '#00000000'
            }
        });

        // Update profile with last generated timestamp
        await base44.entities.Profile.update(profile.id, {
            qrCodeLastRotatedAt: new Date().toISOString()
        });
        
        return new Response(pngBuffer, {
            status: 200,
            headers: { 'Content-Type': 'image/png' }
        });

    } catch (error) {
        console.error('QR Code generation error:', error);
        return Response.json({ 
            error: 'Failed to generate QR code',
            details: error.message 
        }, { status: 500 });
    }
});