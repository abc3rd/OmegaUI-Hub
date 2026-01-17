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
        const profiles = await base44.entities.Profile.filter({ 
            id: profileId, 
            created_by: user.email 
        });

        if (!profiles || profiles.length === 0) {
            return Response.json({ error: 'Profile not found' }, { status: 404 });
        }

        const profile = profiles[0];

        // Generate or use existing buddy group ID
        let buddyGroupId = profile.buddyGroupId;
        if (!buddyGroupId) {
            buddyGroupId = crypto.randomUUID();
            await base44.entities.Profile.update(profileId, {
                buddyGroupId,
                buddyRole: 'primary'
            });
        }

        // Generate a short code (6 characters)
        const code = Array.from(crypto.getRandomValues(new Uint8Array(4)))
            .map(b => b.toString(36).toUpperCase())
            .join('')
            .substring(0, 6);

        // Store mapping (you could use a temporary key-value store, or encode it in the code itself)
        // For simplicity, we'll encode the buddyGroupId in the code
        const encodedCode = btoa(JSON.stringify({ 
            buddyGroupId, 
            createdAt: Date.now(),
            creatorProfileId: profileId
        }));

        return Response.json({ 
            code: encodedCode.substring(0, 12), // Shortened
            buddyGroupId 
        });

    } catch (error) {
        console.error('Create buddy link error:', error);
        return Response.json({ 
            error: error.message || 'Failed to create buddy link' 
        }, { status: 500 });
    }
});