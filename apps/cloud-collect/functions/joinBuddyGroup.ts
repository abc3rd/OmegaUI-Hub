import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { profileId, code } = await req.json();

        // Verify user owns this profile
        const profiles = await base44.entities.Profile.filter({ 
            id: profileId, 
            created_by: user.email 
        });

        if (!profiles || profiles.length === 0) {
            return Response.json({ error: 'Profile not found' }, { status: 404 });
        }

        const profile = profiles[0];

        // Check if already in a buddy group
        if (profile.buddyGroupId) {
            return Response.json({ 
                error: 'This profile is already part of a buddy group' 
            }, { status: 400 });
        }

        // Decode the code
        let decoded;
        try {
            const fullCode = code + '=='; // Add padding if needed
            decoded = JSON.parse(atob(fullCode));
        } catch (e) {
            return Response.json({ error: 'Invalid code' }, { status: 400 });
        }

        // Check code age (expire after 24 hours)
        const ageHours = (Date.now() - decoded.createdAt) / (1000 * 60 * 60);
        if (ageHours > 24) {
            return Response.json({ error: 'Code has expired' }, { status: 400 });
        }

        // Verify the creator profile exists and is in the group
        const creatorProfiles = await base44.asServiceRole.entities.Profile.filter({ 
            id: decoded.creatorProfileId 
        });

        if (!creatorProfiles || creatorProfiles.length === 0) {
            return Response.json({ error: 'Invalid code' }, { status: 400 });
        }

        // Join the buddy group
        await base44.entities.Profile.update(profileId, {
            buddyGroupId: decoded.buddyGroupId,
            buddyRole: 'buddy'
        });

        return Response.json({ 
            success: true,
            buddyGroupId: decoded.buddyGroupId 
        });

    } catch (error) {
        console.error('Join buddy group error:', error);
        return Response.json({ 
            error: error.message || 'Failed to join buddy group' 
        }, { status: 500 });
    }
});