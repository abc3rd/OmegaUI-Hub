import { createClientFromRequest } from 'npm:@base44/sdk@0.7.0';

// --- Encryption Utility using Web Crypto API ---
// We will derive a key from an environment secret.
async function getCryptoKey() {
    const secret = Deno.env.get('ENCRYPTION_SECRET');
    if (!secret) {
        throw new Error('ENCRYPTION_SECRET is not set in environment variables.');
    }
    const secretBuffer = new TextEncoder().encode(secret);
    const importedKey = await crypto.subtle.importKey(
        'raw',
        secretBuffer,
        'PBKDF2',
        false,
        ['deriveKey']
    );
    // Use PBKDF2 to derive a more secure key for AES-GCM.
    return await crypto.subtle.deriveKey(
        {
            name: 'PBKDF2',
            salt: new TextEncoder().encode('base44-oauth-salt'), // A static salt is acceptable here.
            iterations: 100000,
            hash: 'SHA-256',
        },
        importedKey,
        { name: 'AES-GCM', length: 256 },
        true,
        ['encrypt', 'decrypt']
    );
}

async function encryptToken(token) {
    const key = await getCryptoKey();
    const iv = crypto.getRandomValues(new Uint8Array(12)); // IV for AES-GCM
    const encodedToken = new TextEncoder().encode(token);

    const encryptedData = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv: iv },
        key,
        encodedToken
    );

    // The result of encryption is an ArrayBuffer. The last 16 bytes are the auth tag.
    const encryptedToken = new Uint8Array(encryptedData.slice(0, encryptedData.byteLength - 16));
    const authTag = new Uint8Array(encryptedData.slice(encryptedData.byteLength - 16));

    // Convert to hex for storage
    const toHex = (buffer) => Array.from(buffer).map(b => b.toString(16).padStart(2, '0')).join('');

    return {
        encrypted: toHex(encryptedToken),
        iv: toHex(iv),
        auth_tag: toHex(authTag),
    };
}
// --- End Encryption Utility ---

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(req.url);
    const code = url.searchParams.get('code');
    const { origin } = url;
    const dashboardUrl = `${origin}/pages/OmegaDashboard`;
    const redirectUri = `${origin}/functions/googleOauthCallback`;
    
    if (!code) {
        return Response.redirect(`${dashboardUrl}?error=auth_failed`, 302);
    }

    try {
        // --- Exchange code for tokens ---
        const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                code,
                client_id: Deno.env.get('GOOGLE_CLIENT_ID'),
                client_secret: Deno.env.get('GOOGLE_CLIENT_SECRET'),
                redirect_uri: redirectUri,
                grant_type: 'authorization_code',
            }),
        });

        const tokens = await tokenResponse.json();
        if (tokens.error) {
            throw new Error(`Google token exchange error: ${tokens.error_description}`);
        }

        // --- Encrypt tokens ---
        const { access_token, refresh_token } = tokens;
        const encryptedAccessToken = await encryptToken(access_token);
        const encryptedRefreshToken = refresh_token ? await encryptToken(refresh_token) : null;

        // --- Store encrypted tokens in the database ---
        // Check if a connection already exists for this user and service
        const existing = await base44.asServiceRole.entities.Connection.filter({
            user_email: user.email,
            service: 'google'
        });

        const connectionData = {
            user_email: user.email,
            service: 'google',
            encrypted_access_token: encryptedAccessToken.encrypted,
            iv: encryptedAccessToken.iv,
            auth_tag: encryptedAccessToken.auth_tag,
            ...(encryptedRefreshToken && { 
                encrypted_refresh_token: encryptedRefreshToken.encrypted 
            }),
        };

        if (existing && existing.length > 0) {
            // Update existing connection
            await base44.asServiceRole.entities.Connection.update(existing[0].id, connectionData);
        } else {
            // Create new connection
            await base44.asServiceRole.entities.Connection.create(connectionData);
        }

        // Redirect back to the dashboard on success
        return Response.redirect(`${dashboardUrl}?success=google_connected`, 302);

    } catch (error) {
        console.error('OAuth Callback Error:', error);
        return Response.redirect(`${dashboardUrl}?error=${encodeURIComponent(error.message)}`, 302);
    }
});