import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

async function verifyToken(token) {
    const secret = Deno.env.get('QR_SIGNING_SECRET');
    if (!secret) {
        throw new Error('QR_SIGNING_SECRET not configured');
    }

    const parts = token.split('.');
    if (parts.length !== 2) {
        throw new Error('Invalid token format');
    }

    const [payloadB64, sigHex] = parts;
    const payload = JSON.parse(atob(payloadB64));

    // Verify signature
    const encoder = new TextEncoder();
    const data = encoder.encode(JSON.stringify(payload));
    const keyData = encoder.encode(secret);

    const cryptoKey = await crypto.subtle.importKey(
        'raw',
        keyData,
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['verify']
    );

    const sigBytes = new Uint8Array(
        sigHex.match(/.{2}/g).map(byte => parseInt(byte, 16))
    );

    const valid = await crypto.subtle.verify('HMAC', cryptoKey, sigBytes, data);
    if (!valid) {
        throw new Error('Invalid signature');
    }

    return payload;
}

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const url = new URL(req.url);
        const token = url.pathname.split('/').pop();

        if (!token) {
            return Response.json({ error: 'Token required' }, { status: 400 });
        }

        // Verify and decode token
        const payload = await verifyToken(token);

        // Fetch profile
        const profiles = await base44.asServiceRole.entities.Profile.filter({ 
            id: payload.profileId 
        });

        if (!profiles || profiles.length === 0) {
            return Response.json({ error: 'Profile not found' }, { status: 404 });
        }

        const profile = profiles[0];

        // Check QR status
        if (profile.qrCodeStatus === 'disabled') {
            return Response.json({ error: 'This QR code has been disabled' }, { status: 403 });
        }

        // Check version match
        if (payload.qrVersion !== profile.qrCodeVersion) {
            return Response.json({ error: 'QR code has been rotated. Please use the latest QR code.' }, { status: 403 });
        }

        // Check if profile is active
        if (!profile.isActive || profile.isDraft) {
            return Response.json({ error: 'This profile is not currently active' }, { status: 403 });
        }

        // Return redirect URL
        return Response.json({ 
            redirectUrl: `/profile/${profile.publicProfileUrl}`,
            profileId: profile.id
        });

    } catch (error) {
        console.error('QR resolution error:', error);
        return Response.json({ 
            error: 'Invalid or expired QR code',
            details: error.message 
        }, { status: 400 });
    }
});