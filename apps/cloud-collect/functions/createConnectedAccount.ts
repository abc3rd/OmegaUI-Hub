import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import Stripe from 'npm:stripe@17.4.0';

Deno.serve(async (req) => {
    try {
        const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { profileId, email } = await req.json();

        // Get profile
        const profiles = await base44.entities.Profile.filter({ 
            id: profileId,
            created_by: user.email 
        });

        if (!profiles || profiles.length === 0) {
            return Response.json({ error: 'Profile not found' }, { status: 404 });
        }

        const profile = profiles[0];

        // Check if account already exists
        if (profile.stripeConnectedAccountId) {
            return Response.json({ 
                accountId: profile.stripeConnectedAccountId,
                alreadyExists: true 
            });
        }

        // Create Stripe Express Connected Account
        const account = await stripe.accounts.create({
            type: 'express',
            email: email || user.email,
            capabilities: {
                card_payments: { requested: true },
                transfers: { requested: true },
            },
            business_type: 'individual',
            metadata: {
                profileId: profileId,
                userEmail: user.email
            }
        });

        // Update profile with account ID
        await base44.entities.Profile.update(profileId, {
            stripeConnectedAccountId: account.id,
            stripeAccountStatus: 'pending'
        });

        return Response.json({ 
            accountId: account.id,
            status: 'created'
        });

    } catch (error) {
        console.error('Create connected account error:', error);
        return Response.json({ 
            error: 'Failed to create connected account',
            details: error.message 
        }, { status: 500 });
    }
});