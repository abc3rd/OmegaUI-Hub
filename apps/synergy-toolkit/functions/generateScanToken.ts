import { createClientFromRequest } from 'npm:@base44/sdk@0.7.0';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Generate a cryptographically secure random token
        const token = crypto.randomUUID();
        const user_email = user.email;
        
        // Set token to expire in 5 minutes
        const expires_at = new Date(Date.now() + 5 * 60 * 1000).toISOString();

        // Use service role to create the token in the database
        await base44.asServiceRole.entities.ScanToken.create({
            token,
            user_email,
            expires_at
        });

        return Response.json({ token });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});