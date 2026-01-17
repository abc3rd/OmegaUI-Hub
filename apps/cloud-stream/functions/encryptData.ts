import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// Simple encryption using Web Crypto API
// In production, consider using a more robust key management system
async function encrypt(text, key) {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    
    const cryptoKey = await crypto.subtle.importKey(
        'raw',
        encoder.encode(key.padEnd(32, '0').slice(0, 32)),
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt']
    );
    
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encrypted = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        cryptoKey,
        data
    );
    
    // Combine IV and encrypted data
    const combined = new Uint8Array(iv.length + encrypted.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encrypted), iv.length);
    
    // Convert to base64
    return btoa(String.fromCharCode(...combined));
}

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }
        
        const { data: plaintext } = await req.json();
        
        if (!plaintext) {
            return Response.json({ error: 'No data provided' }, { status: 400 });
        }
        
        // Use user ID as part of encryption key for user-specific encryption
        const encryptionKey = `${Deno.env.get('BASE44_APP_ID')}_${user.id}`;
        const encrypted = await encrypt(plaintext, encryptionKey);
        const last4 = plaintext.slice(-4);
        
        return Response.json({ 
            encrypted,
            last4
        });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});