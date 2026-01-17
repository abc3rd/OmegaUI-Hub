import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import Stripe from 'npm:stripe@17.4.0';

Deno.serve(async (req) => {
    try {
        const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
        if (!stripeKey) {
            return Response.json({ 
                error: 'Stripe is not configured' 
            }, { status: 500 });
        }
        
        const stripe = new Stripe(stripeKey, {
            apiVersion: '2024-12-18.acacia',
        });
        const base44 = createClientFromRequest(req);
        
        // Authenticate user
        const user = await base44.auth.me();
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }
        
        const { recurringDonationId } = await req.json();
        
        if (!recurringDonationId) {
            return Response.json({ error: 'Recurring donation ID required' }, { status: 400 });
        }
        
        // Get recurring donation
        const recurringDonations = await base44.asServiceRole.entities.RecurringDonation.filter({ 
            id: recurringDonationId 
        });
        
        if (!recurringDonations || recurringDonations.length === 0) {
            return Response.json({ error: 'Recurring donation not found' }, { status: 404 });
        }
        
        const recurringDonation = recurringDonations[0];
        
        // Verify ownership
        if (recurringDonation.donorUserId !== user.id) {
            return Response.json({ error: 'Not authorized to cancel this donation' }, { status: 403 });
        }
        
        // Cancel subscription in Stripe
        if (recurringDonation.stripeSubscriptionId) {
            await stripe.subscriptions.cancel(recurringDonation.stripeSubscriptionId);
        }
        
        // Update status in database
        await base44.asServiceRole.entities.RecurringDonation.update(recurringDonationId, {
            status: 'cancelled',
        });
        
        return Response.json({ 
            success: true,
            message: 'Recurring donation cancelled successfully'
        });
        
    } catch (error) {
        console.error('Cancel recurring donation error:', error);
        return Response.json({ 
            error: 'Failed to cancel recurring donation',
            details: error.message 
        }, { status: 500 });
    }
});