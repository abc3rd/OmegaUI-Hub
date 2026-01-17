import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

async function decrypt(encryptedBase64, key) {
    const encoder = new TextEncoder();
    
    // Decode from base64
    const combined = Uint8Array.from(atob(encryptedBase64), c => c.charCodeAt(0));
    
    // Extract IV and encrypted data
    const iv = combined.slice(0, 12);
    const encrypted = combined.slice(12);
    
    const cryptoKey = await crypto.subtle.importKey(
        'raw',
        encoder.encode(key.padEnd(32, '0').slice(0, 32)),
        { name: 'AES-GCM', length: 256 },
        false,
        ['decrypt']
    );
    
    const decrypted = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        cryptoKey,
        encrypted
    );
    
    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
}

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }
        
        const { encrypted } = await req.json();
        
        if (!encrypted) {
            return Response.json({ error: 'No data provided' }, { status: 400 });
        }
        
        // Use same key derivation as encryption
        const encryptionKey = `${Deno.env.get('BASE44_APP_ID')}_${user.id}`;
        const decrypted = await decrypt(encrypted, encryptionKey);
        
        return Response.json({ decrypted });
    } catch (error) {
        return Response.json({ error: 'Decryption failed: ' + error.message }, { status: 500 });
    }
});